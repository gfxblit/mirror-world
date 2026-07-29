# Architecture

**Analysis Date:** 2026-07-29

## Pattern Overview

**Overall:** Shared Context WebGL 3D Map Integration (MapLibre GL JS + Three.js)

**Key Characteristics:**
- **WebGL Context Sharing:** MapLibre and Three.js share a single WebGL2 canvas and rendering context, allowing 3D objects to overlay and render synchronously with geographic base layers.
- **Coordinate Projection Alignment:** Geographic coordinates (Latitude/Longitude) are converted to Mercator projection coordinates, then mapped to a local Cartesian grid centered on Bellevue, WA to prevent floating-point precision loss.
- **Dynamic Camera Synchronization:** Every frame, MapLibre provides its Camera Projection Matrix to Three.js to align the 3D perspective camera perfectly with the geographic viewport (tilt, pan, rotate).
- **Procedural and Spatial Generation:** Procedural algorithms extrude geometries (base blocks and cones/pyramids for roofs) using either seeded random functions or polygons retrieved from the OpenStreetMap data pipeline.

## Layers

**Geographic Base Layer (MapLibre GL JS):**
- Purpose: Handles base map styling, coordinate conversions, touch/mouse navigation, camera zoom, pitch, and bearing.
- Contains: `Map` class initialization, raster style configurations, and event handlers for viewport events (e.g. `move`, `resize`).
- Depends on: CARTO tiles and browser WebGL APIs.
- Used by: Application logic to manage camera telemetry and trigger repaints.

**3D Custom Layer (Three.js WebGLRenderer & Scene):**
- Purpose: Extrudes, styles, and renders 3D buildings and custom meshes.
- Contains: `ThreeLayer` class implementing `CustomLayerInterface`. Manages a Three.js scene, camera, lights, materials, geometries, and rendering loop.
- Depends on: Three.js libraries and local projection helpers.
- Used by: MapLibre's rendering scheduler to paint 3D content over the map.

**Data Acquisition Layer (Overpass API Client):**
- Purpose: Fetches real-world geographic building layout data.
- Contains: `fetchOSMBuildings` async method which requests building boundaries within a bounding box centered on the focus location.
- Depends on: Overpass API endpoint.
- Used by: `ThreeLayer` to replace procedural mock buildings with actual structures.

**HUD Interface Layer (HTML/CSS):**
- Purpose: Provides interactive control panel for adjusting visualization settings in real-time.
- Contains: Sliders for building density, height scale, preset buttons, and checkbox controls.
- Depends on: Vanilla DOM API.
- Used by: User to tune aesthetics.

## Data Flow

**1. Initialization & Loading Flow:**
1. Browser loads `index.html`, executes `src/main.ts`.
2. MapLibre `Map` is instantiated centered on Bellevue (`[-122.19, 47.61]`).
3. Custom `ThreeLayer` is instantiated and added to the map.
4. MapLibre triggers `onAdd()` on the layer, providing the shared WebGL context.
5. `ThreeLayer` instantiates the Three.js `WebGLRenderer` using the shared context, sets up the scene, lights, and builds initial procedural buildings.
6. `ThreeLayer` triggers `fetchOSMBuildings()` to request local building ways.
7. Once Overpass API returns coordinates, the layer recalculates Mercator projection differences, extrudes building shapes using `THREE.ExtrudeGeometry`, and places them in the scene.

**2. Render Loop Flow:**
1. User interacts with the map viewport (pan, zoom, rotate).
2. MapLibre triggers a repaint cycle.
3. MapLibre invokes `render()` on the custom layer, passing the projection matrix.
4. The custom layer computes a scaling factor mapping meter units to Mercator units at the current zoom level.
5. The layer combines the Mercator center position, scaling factor, and MapLibre's camera matrix to compute the unified projection matrix.
6. The Three.js camera projection is updated.
7. The Three.js WebGLRenderer resets internal state and draws the scene.

## Key Abstractions

**`ThreeLayer` Class:**
- Implements `CustomLayerInterface`. Capsules all Three.js setup, cleanup, OSM data processing, procedural geometry generation, and material updating.

**`centerMercator`:**
- A fixed `MercatorCoordinate` representing the origin `(0,0,0)` in the local Three.js coordinate space, allowing distance calculations in meters instead of large geographic coordinates.

---

*Architecture analysis: 2026-07-29*
*Update when adding game systems, multiplayer, or client-side caching*
