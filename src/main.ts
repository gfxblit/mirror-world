import './style.css';
import { Map, MercatorCoordinate } from 'maplibre-gl';
import type { CustomLayerInterface, CustomRenderMethodInput } from 'maplibre-gl';
import * as THREE from 'three';

// ==========================================
// 0. On-Screen Debug Console for iPad testing
// ==========================================
const consoleEl = document.createElement('div');
consoleEl.id = 'debug-console';
consoleEl.style.position = 'absolute';
consoleEl.style.bottom = '10px';
consoleEl.style.left = '50%';
consoleEl.style.transform = 'translateX(-50%)';
consoleEl.style.width = 'calc(100% - 680px)';
consoleEl.style.maxHeight = '120px';
consoleEl.style.overflowY = 'auto';
consoleEl.style.background = 'rgba(10, 10, 15, 0.9)';
consoleEl.style.border = '1px solid hsla(271, 91%, 65%, 0.4)';
consoleEl.style.borderRadius = '8px';
consoleEl.style.padding = '10px';
consoleEl.style.fontFamily = 'monospace';
consoleEl.style.fontSize = '11px';
consoleEl.style.color = '#a3a3c2';
consoleEl.style.zIndex = '9999';
consoleEl.style.backdropFilter = 'blur(10px)';
consoleEl.style.pointerEvents = 'auto';
consoleEl.style.userSelect = 'text';
consoleEl.innerText = '✦ Telemetry Debugger Online.\n';
document.body.appendChild(consoleEl);

const logToScreen = (msg: string, type: 'info' | 'error' | 'warn' = 'info') => {
  const color = type === 'error' ? '#ff4d4d' : type === 'warn' ? '#ffcc00' : '#a3a3c2';
  const prefix = type === 'error' ? '✖ ' : type === 'warn' ? '⚠ ' : '✦ ';
  consoleEl.innerHTML += `<span style="color: ${color}">${prefix}${msg}</span><br/>`;
  consoleEl.scrollTop = consoleEl.scrollHeight;
  if (type === 'error') {
    console.error(prefix + msg);
  } else if (type === 'warn') {
    console.warn(prefix + msg);
  } else {
    console.log(prefix + msg);
  }
};

window.addEventListener('error', (e) => {
  logToScreen(`${e.message} at ${e.filename.split('/').pop()}:${e.lineno}`, 'error');
});

window.addEventListener('unhandledrejection', (e) => {
  logToScreen(`Promise rejected: ${e.reason}`, 'error');
});

// ==========================================
// 1. Map Configuration & Coordinates
// ==========================================
const BellevueCenter: [number, number] = [-122.19, 47.61];

logToScreen('Initializing MapLibre instance...');

// Initialize MapLibre GL map with an offline-friendly base style
const map = new Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      'osm-basemap': {
        type: 'raster',
        tiles: [
          'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }
    },
    layers: [
      {
        id: 'osm-basemap-layer',
        type: 'raster',
        source: 'osm-basemap',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  },
  center: BellevueCenter,
  zoom: 15.5,
  pitch: 60.0,
  bearing: 28.0
});

(window as any).map = map;

// Calculate mercator base coordinate for Bellevue
const centerMercator = MercatorCoordinate.fromLngLat(BellevueCenter);

// ==========================================
// 2. Custom 3D Layer Class
// ==========================================
class ThreeLayer implements CustomLayerInterface {
  id = 'custom-three-layer';
  type: 'custom' = 'custom';
  renderingMode: '3d' = '3d';

  renderer: THREE.WebGLRenderer | null = null;
  scene: THREE.Scene | null = null;
  camera: THREE.Camera | null = null;
  group: THREE.Group | null = null;
  
  osmData: any = null;
  
  // Interactive properties
  preset = 'fantasy';
  heightScale = 1.0;
  density = 0.7;
  toonEnabled = true;
  wireframeEnabled = false;

  // Materials
  baseMat!: THREE.Material;
  roofMat!: THREE.Material;

  // Lights
  dirLight!: THREE.DirectionalLight;
  ambientLight!: THREE.AmbientLight;

  hasRenderedOnce = false;

  constructor() {
    this.updateMaterials();
  }

  updateMaterials() {
    let baseColor = 0x8a2be2; // vibrant fantasy purple
    let roofColor = 0xff6b8b; // coral pink

    if (this.preset === 'neon') {
      baseColor = 0x00ffcc; // neon cyan
      roofColor = 0xff0055; // neon pink
    } else if (this.preset === 'monochrome') {
      baseColor = 0x3a3d4d; // slate grey
      roofColor = 0x5a5e73; // lighter slate grey
    }

    const wireOpt = this.wireframeEnabled;

    if (this.toonEnabled) {
      this.baseMat = new THREE.MeshToonMaterial({
        color: baseColor,
        wireframe: wireOpt,
        side: THREE.DoubleSide
      });
      this.roofMat = new THREE.MeshToonMaterial({
        color: roofColor,
        wireframe: wireOpt,
        side: THREE.DoubleSide
      });
    } else {
      this.baseMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.4,
        metalness: 0.2,
        wireframe: wireOpt,
        side: THREE.DoubleSide
      });
      this.roofMat = new THREE.MeshStandardMaterial({
        color: roofColor,
        roughness: 0.3,
        metalness: 0.4,
        wireframe: wireOpt,
        side: THREE.DoubleSide
      });
    }
  }

  onAdd(mapInstance: Map, gl: WebGL2RenderingContext) {
    logToScreen('onAdd invoked. Setting up WebGLRenderer...');
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: mapInstance.getCanvas(),
      context: gl,
      antialias: true
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

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Initial loading placeholder logic while fetching Overpass data
    this.generateBuildings(); // Spawn procedural placeholder immediately

    logToScreen('onAdd completed. WebGLRenderer ready. Fetching OSM buildings...');

    // Fetch OSM buildings dynamically
    this.fetchOSMBuildings(BellevueCenter[1], BellevueCenter[0])
      .then((data) => {
        if (data && data.elements && data.elements.length > 0) {
          this.osmData = data;
          this.generateOSMBuildings(data);
        } else {
          logToScreen('No OSM building elements found. Keeping procedural layout.');
        }
        mapInstance.triggerRepaint();
      })
      .catch((err) => {
        logToScreen('Failed to load OSM buildings. Keeping procedural layout.', 'warn');
        console.error(err);
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

    // Seeded random number generator for predictability
    let seed = 7;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const size = 10; // Grid radius
    let count = 0;
    for (let x = -size; x <= size; x++) {
      for (let y = -size; y <= size; y++) {
        const dist = Math.sqrt(x*x + y*y);
        const spawnProbability = Math.max(0.1, 1.0 - (dist / (size * 1.3)));

        if (random() < spawnProbability * this.density) {
          const height = (15 + random() * 45) * this.heightScale;
          const width = 10 + random() * 12;
          const depth = 10 + random() * 12;

          const px = x * 30 + (random() - 0.5) * 6;
          const pz = y * 30 + (random() - 0.5) * 6; // Y grid mapped to Z south-north in Three.js

          // 1. Building base structure (width, height, depth)
          const baseGeom = new THREE.BoxGeometry(width, height, depth);
          const baseMesh = new THREE.Mesh(baseGeom, this.baseMat);
          baseMesh.position.set(px, height / 2, pz);
          this.group.add(baseMesh);
          count++;

          // 2. Building roof (ConeGeometry naturally points up along Y axis in standard Three.js)
          const roofType = random();
          if (roofType < 0.45) {
            const roofGeom = new THREE.ConeGeometry(width * 0.75, 12, 4);
            roofGeom.rotateY(Math.PI / 4); // Align flat faces of the pyramid with the base cube
            const roofMesh = new THREE.Mesh(roofGeom, this.roofMat);
            roofMesh.position.set(px, height + 6, pz);
            this.group.add(roofMesh);
            count++;
          } else if (roofType < 0.8) {
            const roofGeom = new THREE.ConeGeometry(width * 0.65, 18, 8);
            const roofMesh = new THREE.Mesh(roofGeom, this.roofMat);
            roofMesh.position.set(px, height + 9, pz);
            this.group.add(roofMesh);
            count++;
          }
        }
      }
    }
    logToScreen(`Generated ${count} procedural building meshes.`);
  }

  async fetchOSMBuildings(lat: number, lon: number): Promise<any> {
    const range = 0.006; // Approx 1.3km x 1.1km core
    const minLat = lat - range;
    const maxLat = lat + range;
    const minLon = lon - range * 1.5;
    const maxLon = lon + range * 1.5;

    const query = `[out:json][timeout:25];
(
  way["building"](${minLat},${minLon},${maxLat},${maxLon});
);
out body;
>;
out skel qt;`;

    const url = 'https://overpass-api.de/api/interpreter';
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MirrorWorldPrototype/1.0 (billyc@projects.mirror-world)'
        },
        body: `data=${encodeURIComponent(query)}`
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      return data;
    } catch (err) {
      logToScreen('Error fetching from Overpass API. Falling back to procedural.', 'error');
      console.error(err);
      return null;
    }
  }

  generateOSMBuildings(data: any) {
    const group = this.group;
    if (!group) return;
    
    // Clear existing geometries
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    const elements = data.elements;
    const ways = elements.filter((e: any) => e.type === 'way');
    const nodes = elements.filter((e: any) => e.type === 'node');
    
    // Use a plain object record to bypass MapLibre Map class collision
    const nodeMap: Record<number, { lat: number; lon: number }> = {};
    nodes.forEach((n: any) => {
      nodeMap[n.id] = { lat: n.lat, lon: n.lon };
    });

    let count = 0;
    
    ways.forEach((way: any) => {
      let seed = way.id;
      const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      // Filter by density slider
      if (random() > this.density) return;

      const tags = way.tags || {};
      
      let height = 15;
      if (tags.height) {
        const hVal = parseFloat(tags.height);
        if (!isNaN(hVal)) height = hVal;
      } else if (tags['building:levels']) {
        const lvls = parseFloat(tags['building:levels']);
        if (!isNaN(lvls)) height = lvls * 3.5;
      } else {
        height = 12 + random() * 48; // procedural variation
      }

      height = height * this.heightScale;

      const nodeIds = way.nodes;
      if (!nodeIds || nodeIds.length < 3) return;

      const pts: { x: number; z: number }[] = [];
      nodeIds.forEach((id: number) => {
        const node = nodeMap[id];
        if (node) {
          const merc = MercatorCoordinate.fromLngLat([node.lon, node.lat]);
          const dx_merc = merc.x - centerMercator.x;
          const dy_merc = merc.y - centerMercator.y;
          const x_local = dx_merc / centerMercator.meterInMercatorCoordinateUnits();
          const z_local = dy_merc / centerMercator.meterInMercatorCoordinateUnits();
          pts.push({ x: x_local, z: z_local });
        }
      });

      if (pts.length < 3) return;

      const shape = new THREE.Shape();
      shape.moveTo(pts[0].x, pts[0].z);
      for (let i = 1; i < pts.length; i++) {
        shape.lineTo(pts[i].x, pts[i].z);
      }

      const geom = new THREE.ExtrudeGeometry(shape, {
        depth: height,
        bevelEnabled: false
      });
      geom.rotateX(-Math.PI / 2);

      const baseMesh = new THREE.Mesh(geom, this.baseMat);
      group.add(baseMesh);
      count++;

      if (this.preset === 'fantasy' && height > 22 && count % 4 === 0) {
        let sumX = 0;
        let sumZ = 0;
        pts.forEach(p => {
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

  updateParameters(params: { 
    preset?: string; 
    heightScale?: number; 
    density?: number; 
    toonEnabled?: boolean; 
    wireframeEnabled?: boolean; 
  }) {
    let rebuildNeeded = false;
    let materialUpdateNeeded = false;

    if (params.preset !== undefined && params.preset !== this.preset) {
      this.preset = params.preset;
      materialUpdateNeeded = true;
      
      if (this.preset === 'neon') {
        this.dirLight.color.setHex(0xff00ff);
        this.ambientLight.color.setHex(0x0000ff);
      } else if (this.preset === 'monochrome') {
        this.dirLight.color.setHex(0x888888);
        this.ambientLight.color.setHex(0x222222);
      } else {
        this.dirLight.color.setHex(0xffeedd);
        this.ambientLight.color.setHex(0xffffff);
      }
      logToScreen(`Visual preset updated to: ${this.preset}`);
    }

    if (params.heightScale !== undefined && params.heightScale !== this.heightScale) {
      this.heightScale = params.heightScale;
      rebuildNeeded = true;
    }

    if (params.density !== undefined && params.density !== this.density) {
      this.density = params.density;
      rebuildNeeded = true;
    }

    if (params.toonEnabled !== undefined && params.toonEnabled !== this.toonEnabled) {
      this.toonEnabled = params.toonEnabled;
      materialUpdateNeeded = true;
    }

    if (params.wireframeEnabled !== undefined && params.wireframeEnabled !== this.wireframeEnabled) {
      this.wireframeEnabled = params.wireframeEnabled;
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
      if (this.osmData) {
        this.generateOSMBuildings(this.osmData);
      } else {
        this.generateBuildings();
      }
    }
  }

  render(_gl: WebGL2RenderingContext, options: CustomRenderMethodInput) {
    if (!this.renderer || !this.scene || !this.camera) return;

    (window as any).lastOptions = options;

    if (!this.hasRenderedOnce) {
      logToScreen('render() has been triggered by MapLibre!');
      this.hasRenderedOnce = true;
    }

    // Dynamic worldSize calculation matching current map zoom level
    const zoom = map.getZoom();
    const worldSize = 512 * Math.pow(2, zoom);

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
    map.triggerRepaint();
  }
}

(window as any).dumpMatrices = () => {
  const options = (window as any).lastOptions;
  if (options) {
    console.log('SETTLED_MVP: ' + JSON.stringify(Array.from(options.modelViewProjectionMatrix)));
    if (options.defaultProjectionData && options.defaultProjectionData.mainMatrix) {
      console.log('SETTLED_MAIN: ' + JSON.stringify(Array.from(options.defaultProjectionData.mainMatrix)));
    }
  } else {
    console.log('SETTLED_MVP: null');
  }
};

// ==========================================
// 3. Register and Add Custom Layer
// ==========================================
const threeLayer = new ThreeLayer();

const addThreeLayer = () => {
  if (!map.getLayer(threeLayer.id)) {
    map.addLayer(threeLayer);
    logToScreen('Custom Three.js layer added.');
  }
};

if (map.isStyleLoaded()) {
  logToScreen('Map style loaded synchronously. Adding layer...');
  addThreeLayer();
} else {
  logToScreen('Waiting for style.load...');
  map.on('style.load', () => {
    addThreeLayer();
  });
}

map.on('load', () => {
  logToScreen('Map fully loaded.');
});

// ==========================================
// 4. Update HUD Telemetry Panel on Camera Move
// ==========================================
map.on('move', () => {
  const telZoom = document.getElementById('tel-zoom');
  const telBearing = document.getElementById('tel-bearing');
  const telPitch = document.getElementById('tel-pitch');

  if (telZoom) telZoom.innerText = map.getZoom().toFixed(2);
  if (telBearing) telBearing.innerText = map.getBearing().toFixed(1) + '°';
  if (telPitch) telPitch.innerText = map.getPitch().toFixed(1) + '°';
});

// ==========================================
// 5. Connect UI Event Listeners
// ==========================================
document.getElementById('height-multiplier')?.addEventListener('input', (e) => {
  const val = parseFloat((e.target as HTMLInputElement).value);
  threeLayer.updateParameters({ heightScale: val });
  map.triggerRepaint();
});

document.getElementById('building-density')?.addEventListener('input', (e) => {
  const val = parseFloat((e.target as HTMLInputElement).value);
  threeLayer.updateParameters({ density: val });
  map.triggerRepaint();
});

document.getElementById('toggle-toon')?.addEventListener('change', (e) => {
  const checked = (e.target as HTMLInputElement).checked;
  threeLayer.updateParameters({ toonEnabled: checked });
  map.triggerRepaint();
});

document.getElementById('toggle-wireframe')?.addEventListener('change', (e) => {
  const checked = (e.target as HTMLInputElement).checked;
  threeLayer.updateParameters({ wireframeEnabled: checked });
  map.triggerRepaint();
});

const presetButtons = document.querySelectorAll('.preset-btn');
presetButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    presetButtons.forEach(b => b.classList.remove('active'));
    const target = e.target as HTMLButtonElement;
    target.classList.add('active');
    const preset = target.getAttribute('data-preset') || 'fantasy';
    
    threeLayer.updateParameters({ preset });
    map.triggerRepaint();
  });
});

// ==========================================
// 6. Connect Mobile Navigation Tab Bar Switcher
// ==========================================
const tabButtons = document.querySelectorAll('.mobile-tab-btn');
const leftPanel = document.querySelector('.left-panel');
const rightPanel = document.querySelector('.right-panel');

tabButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const target = e.currentTarget as HTMLButtonElement;
    const tabName = target.getAttribute('data-tab');

    tabButtons.forEach(b => b.classList.remove('active'));
    target.classList.add('active');

    // Hide all
    leftPanel?.classList.remove('mobile-active');
    rightPanel?.classList.remove('mobile-active');
    document.getElementById('debug-console')?.classList.remove('mobile-active');

    // Show selected
    if (tabName === 'spatial') {
      leftPanel?.classList.add('mobile-active');
    } else if (tabName === 'controls') {
      rightPanel?.classList.add('mobile-active');
    } else if (tabName === 'logs') {
      document.getElementById('debug-console')?.classList.add('mobile-active');
    }
  });
});
