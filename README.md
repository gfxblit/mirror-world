# Mirror World

A reality-mirrored game prototyping pipeline featuring an isometric, stylized 3D environment mapped directly from real-world OpenStreetMap (OSM) geographic data.

## Tech Stack

- **Foundational Mapping**: [MapLibre GL JS](https://maplibre.org/)
- **3D Graphics Engine**: [Three.js](https://threejs.org/)
- **Style Archetype**: Albion Online inspired (chunky geometry, hand-painted aesthetic, stylized shaders)
- **Bundler & Server**: [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Architecture Pipeline

1. **Base Map Initialization**: MapLibre handles geographic vector tiles (centered on Bellevue, WA: `[-122.19, 47.61]`), user viewport inputs (pan, zoom, pitch, bearing), and coordinate projections.
2. **Custom Three.js Layer**: A custom layer shares the WebGL2 rendering context directly with MapLibre, aligning the Three.js projection matrix to MapLibre's camera perspective.
3. **Procedural Extrusion**: Map spatial coordinates are scaled to Three.js units, generating 3D buildings procedurally on a layout grid.
4. **Visual Control Panel**: A floating glassmorphic HUD dashboard allows real-time adjustments of preset styling, height scaling, building density, and render modes (toon shading vs wireframe).

## Setup & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Design Specification

For detailed architectural notes, see [DESIGN.md](file:///Users/billyc/projects/mirror-world/DESIGN.md).
