import type { CustomLayerInterface, CustomRenderMethodInput, Map } from 'maplibre-gl';
import { MercatorCoordinate } from 'maplibre-gl';
import * as THREE from 'three';
import type { ConfigManager } from '../state/config';
import { latLonToLocal } from '../utils/geo';
import type { OSMBuilding } from '../services/osm';
import { fetchOSMBuildings } from '../services/osm';
import { generateProceduralBuildings } from '../generators/procedural';
import { logToScreen } from '../ui/debug-console';
import { loadingUI } from '../ui/loading';

export class ThreeLayer implements CustomLayerInterface {
  id = 'custom-three-layer';
  type: 'custom' = 'custom';
  renderingMode: '3d' = '3d';

  renderer: THREE.WebGLRenderer | null = null;
  scene: THREE.Scene | null = null;
  camera: THREE.Camera | null = null;
  group: THREE.Group | null = null;

  osmBuildings: OSMBuilding[] | null = null;
  map: Map | null = null;

  // Materials
  baseMat!: THREE.Material;
  roofMat!: THREE.Material;

  // Lights
  dirLight!: THREE.DirectionalLight;
  ambientLight!: THREE.AmbientLight;

  hasRenderedOnce = false;

  private configManager: ConfigManager;
  private center: [number, number];

  constructor(configManager: ConfigManager, center: [number, number]) {
    this.configManager = configManager;
    this.center = center;
    this.updateMaterials();
    this.setupConfigSubscription();
  }

  private setupConfigSubscription() {
    let prevPreset = this.configManager.get('preset');
    let prevHeightScale = this.configManager.get('heightScale');
    let prevDensity = this.configManager.get('density');
    let prevToonEnabled = this.configManager.get('toonEnabled');
    let prevWireframeEnabled = this.configManager.get('wireframeEnabled');

    this.configManager.subscribe((config) => {
      let rebuildNeeded = false;
      let materialUpdateNeeded = false;

      if (config.preset !== prevPreset) {
        prevPreset = config.preset;
        materialUpdateNeeded = true;
        this.updateLights();
        logToScreen(`Visual preset updated to: ${config.preset}`);
      }

      if (config.heightScale !== prevHeightScale) {
        prevHeightScale = config.heightScale;
        rebuildNeeded = true;
      }

      if (config.density !== prevDensity) {
        prevDensity = config.density;
        rebuildNeeded = true;
      }

      if (config.toonEnabled !== prevToonEnabled) {
        prevToonEnabled = config.toonEnabled;
        materialUpdateNeeded = true;
      }

      if (config.wireframeEnabled !== prevWireframeEnabled) {
        prevWireframeEnabled = config.wireframeEnabled;
        materialUpdateNeeded = true;
      }

      if (materialUpdateNeeded) {
        this.updateMaterials();
        if (this.group) {
          this.group.children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.geometry instanceof THREE.ConeGeometry) {
                child.material = this.roofMat;
              } else {
                child.material = this.baseMat;
              }
            }
          });
        }
      }

      if (rebuildNeeded) {
        if (this.osmBuildings && this.osmBuildings.length > 0) {
          this.generateOSMBuildings(this.osmBuildings);
        } else {
          this.generateBuildings();
        }
      }

      if (this.map) {
        this.map.triggerRepaint();
      }
    });
  }

  updateMaterials() {
    const preset = this.configManager.get('preset');
    const wireframeEnabled = this.configManager.get('wireframeEnabled');
    const toonEnabled = this.configManager.get('toonEnabled');

    let baseColor = 0x8a2be2; // vibrant fantasy purple
    let roofColor = 0xff6b8b; // coral pink

    if (preset === 'neon') {
      baseColor = 0x00ffcc; // neon cyan
      roofColor = 0xff0055; // neon pink
    } else if (preset === 'monochrome') {
      baseColor = 0x3a3d4d; // slate grey
      roofColor = 0x5a5e73; // lighter slate grey
    }

    if (toonEnabled) {
      this.baseMat = new THREE.MeshToonMaterial({
        color: baseColor,
        wireframe: wireframeEnabled,
        side: THREE.DoubleSide,
      });
      this.roofMat = new THREE.MeshToonMaterial({
        color: roofColor,
        wireframe: wireframeEnabled,
        side: THREE.DoubleSide,
      });
    } else {
      this.baseMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.4,
        metalness: 0.2,
        wireframe: wireframeEnabled,
        side: THREE.DoubleSide,
      });
      this.roofMat = new THREE.MeshStandardMaterial({
        color: roofColor,
        roughness: 0.3,
        metalness: 0.4,
        wireframe: wireframeEnabled,
        side: THREE.DoubleSide,
      });
    }
  }

  updateLights() {
    if (!this.dirLight || !this.ambientLight) return;
    const preset = this.configManager.get('preset');
    if (preset === 'neon') {
      this.dirLight.color.setHex(0xff00ff);
      this.ambientLight.color.setHex(0x0000ff);
    } else if (preset === 'monochrome') {
      this.dirLight.color.setHex(0x888888);
      this.ambientLight.color.setHex(0x222222);
    } else {
      this.dirLight.color.setHex(0xffeedd);
      this.ambientLight.color.setHex(0xffffff);
    }
  }

  onAdd(mapInstance: Map, gl: WebGL2RenderingContext) {
    logToScreen('onAdd invoked. Setting up WebGLRenderer...');
    this.map = mapInstance;

    this.renderer = new THREE.WebGLRenderer({
      canvas: mapInstance.getCanvas(),
      context: gl,
      antialias: true,
    });
    this.renderer.autoClear = false;

    // Correctly initialize renderer size to prevent tiny viewports
    const canvas = mapInstance.getCanvas();
    this.renderer.setSize(canvas.width, canvas.height, false);

    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();

    // Lighting setup
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    this.dirLight.position.set(200, 400, 500);
    this.scene.add(this.dirLight);

    // Make sure lighting is correct for the preset
    this.updateLights();

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Initial loading placeholder logic while fetching Overpass data
    this.generateBuildings(); // Spawn procedural placeholder immediately

    logToScreen('onAdd completed. WebGLRenderer ready. Fetching OSM buildings...');
    loadingUI.show();

    // Fetch OSM buildings dynamically
    fetchOSMBuildings(this.center[1], this.center[0])
      .then((buildings) => {
        if (buildings && buildings.length > 0) {
          this.osmBuildings = buildings;
          loadingUI.updateStatus('Extruding 3D geometry from spatial footprints...');
          loadingUI.setProgress(85);
          
          // Yield control to let UI render the 85% stage before locking main thread for extrusion
          setTimeout(() => {
            this.generateOSMBuildings(buildings);
            loadingUI.hide(true);
          }, 50);
        } else {
          logToScreen('No OSM building elements found. Keeping procedural layout.');
          loadingUI.hide(false);
        }
        mapInstance.triggerRepaint();
      })
      .catch((err) => {
        logToScreen('Failed to load OSM buildings. Keeping procedural layout.', 'warn');
        console.error(err);
        loadingUI.hide(false);
      });

    // Adjust size on map resize
    mapInstance.on('resize', () => {
      this.renderer?.setSize(canvas.width, canvas.height, false);
    });
  }

  generateBuildings() {
    if (!this.group) return;

    // Clear existing geometries
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      this.group.remove(obj);
    }

    const buildings = generateProceduralBuildings({
      density: this.configManager.get('density'),
      heightScale: this.configManager.get('heightScale'),
    });

    buildings.forEach((b) => {
      // 1. Building base structure (width, height, depth)
      const baseGeom = new THREE.BoxGeometry(b.width, b.height, b.depth);
      const baseMesh = new THREE.Mesh(baseGeom, this.baseMat);
      baseMesh.position.set(b.px, b.height / 2, b.pz);
      this.group!.add(baseMesh);

      // 2. Building roof
      if (b.roof) {
        const roofGeom = new THREE.ConeGeometry(b.roof.radius, b.roof.height, b.roof.radialSegments);
        if (b.roof.rotateY) {
          roofGeom.rotateY(Math.PI / 4); // Align flat faces of the pyramid with the base cube
        }
        const roofMesh = new THREE.Mesh(roofGeom, this.roofMat);
        roofMesh.position.set(b.px, b.roof.py, b.pz);
        this.group!.add(roofMesh);
      }
    });

    logToScreen(`Generated ${buildings.length} procedural building meshes.`);
  }

  generateOSMBuildings(osmBuildings: OSMBuilding[]) {
    const group = this.group;
    if (!group) return;

    // Clear existing geometries
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    const density = this.configManager.get('density');
    const heightScale = this.configManager.get('heightScale');
    const centerLat = this.center[1];
    const centerLon = this.center[0];

    let count = 0;

    osmBuildings.forEach((way) => {
      let seed = way.id;
      const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      // Filter by density slider
      if (random() > density) return;

      let height = 15;
      if (way.height !== undefined) {
        height = way.height;
      } else if (way.levels !== undefined) {
        height = way.levels * 3.5;
      } else {
        height = 12 + random() * 48; // procedural variation
      }

      height = height * heightScale;

      const pts = way.coordinates.map((coord) => {
        return latLonToLocal(coord.lat, coord.lon, centerLat, centerLon);
      });

      if (pts.length < 3) return;

      const shape = new THREE.Shape();
      shape.moveTo(pts[0].x, pts[0].z);
      for (let i = 1; i < pts.length; i++) {
        shape.lineTo(pts[i].x, pts[i].z);
      }

      const geom = new THREE.ExtrudeGeometry(shape, {
        depth: height,
        bevelEnabled: false,
      });
      geom.rotateX(-Math.PI / 2);

      const baseMesh = new THREE.Mesh(geom, this.baseMat);
      group.add(baseMesh);
      count++;

      // Spire/roof for fantasy preset
      if (this.configManager.get('preset') === 'fantasy' && height > 22 && count % 4 === 0) {
        let sumX = 0;
        let sumZ = 0;
        pts.forEach((p) => {
          sumX += p.x;
          sumZ += p.z;
        });
        const cx = sumX / pts.length;
        const cz = sumZ / pts.length;

        const spireGeom = new THREE.ConeGeometry(5 + random() * 4, 12 + random() * 10, 4);
        spireGeom.rotateY(Math.PI / 4);
        const spireMesh = new THREE.Mesh(spireGeom, this.roofMat);
        spireMesh.position.set(cx, height + spireGeom.parameters.height / 2, cz);
        group.add(spireMesh);
      }
    });

    logToScreen(`Rendered ${count} real-world OSM building footprints in 3D.`);
  }

  render(_gl: WebGL2RenderingContext, options: CustomRenderMethodInput) {
    if (!this.renderer || !this.scene || !this.camera || !this.map) return;

    (window as any).lastOptions = options;

    if (!this.hasRenderedOnce) {
      logToScreen('render() has been triggered by MapLibre!');
      this.hasRenderedOnce = true;
    }

    // Dynamic worldSize calculation matching current map zoom level
    const zoom = this.map.getZoom();
    const worldSize = 512 * Math.pow(2, zoom);

    const centerMercator = MercatorCoordinate.fromLngLat(this.center);
    const tx_scaled = centerMercator.x * worldSize;
    const ty_scaled = centerMercator.y * worldSize;
    const tz_scaled = centerMercator.z * worldSize;
    const scale_scaled = centerMercator.meterInMercatorCoordinateUnits() * worldSize;

    // Transform matrix mapping local space to world pixel coordinate space
    const dynamicTransform = new THREE.Matrix4().set(
      scale_scaled, 0, 0, tx_scaled,
      0, 0, scale_scaled, ty_scaled,
      0, scale_scaled, 0, tz_scaled,
      0, 0, 0, 1
    );

    // Map the projection matrix (non-transposed column-major matrix)
    const m = new THREE.Matrix4().fromArray(options.modelViewProjectionMatrix as number[]);
    this.camera.projectionMatrix = m.multiply(dynamicTransform);

    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);

    // Keep triggering frame paint for smooth rendering
    this.map.triggerRepaint();
  }
}
