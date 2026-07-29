<!-- GSD:project-start source:PROJECT.md -->
## Project

**Mirror World**

A reality-mirrored game prototyping pipeline featuring an isometric, stylized 3D environment mapped directly from real-world OpenStreetMap (OSM) geographic data using MapLibre GL JS and Three.js.

**Core Value:** Ensure seamless WebGL context sharing and matrix projection alignment between MapLibre and Three.js to render custom 3D geometries and dynamic shaders at 60fps on web-native browsers.

### Constraints

- **Tech Stack**: Must use standard configuration format for CodeRabbit (`.coderabbit.yml`).
- **Development host**: Development server host is configured for local Tailscale previews, meaning custom hostname checks must be preserved or handled carefully.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript ~6.0.2 - All application source code (`src/main.ts`)
- CSS / HTML - Styling (`src/style.css`) and entry HTML template (`index.html`)
## Runtime
- Browser environment (WebGL2-compatible browser)
- Dev server runs on Node.js
- npm (No lockfile present in the repository yet)
## Frameworks
- MapLibre GL JS ^6.0.0 - Handles geographic base mapping, viewport gestures (pan, zoom, tilt), and custom rendering layer hookups.
- Three.js ^0.185.1 - Handles 3D rendering, custom geometry generation (footprint extrusion), custom shaders/materials, lights, and camera matrices.
- Playwright ^1.62.0 - Configured as dev dependency but no active tests or configuration files exist yet.
- Vite ^8.1.1 - Hot module reloading (HMR) bundler and local development server.
## Key Dependencies
- `maplibre-gl` ^6.0.0 - Base web map control.
- `three` ^0.185.1 - 3D engine for custom layers.
## Configuration
- None required for local development.
- `tsconfig.json` - Configures TypeScript compiler choices.
- `vite.config.ts` - Vite dev server setup, including custom `allowedHosts` entry for Tailwind network testing: `bills-macbook-pro-16in-m2-max.tail8bc4f8.ts.net`.
## Platform Requirements
- Cross-platform (any system running Node.js and a modern browser supporting WebGL2).
- Static web page bundle (HTML, JS, CSS) built via `npm run build` using Vite.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- TypeScript/JavaScript: kebab-case (e.g., `vite.config.ts`, `tsconfig.json`).
- Source files: lowercase / kebab-case (e.g., `main.ts`, `style.css`).
- PascalCase for class names (e.g., `ThreeLayer`).
- camelCase for standard functions (e.g., `logToScreen`, `fetchOSMBuildings`, `generateBuildings`, `addThreeLayer`).
- camelCase for local variable declarations (e.g., `centerMercator`, `rebuildNeeded`, `materialUpdateNeeded`).
- Upper PascalCase or UPPER_SNAKE_CASE for constant identifiers (e.g., `BellevueCenter`).
- PascalCase for type and interface names.
- Uses standard MapLibre interfaces directly (e.g., `CustomLayerInterface`, `CustomRenderMethodInput`).
## Code Style
- Monolithic design: All application logic, classes, helpers, and event listeners currently reside in a single large entry point: `src/main.ts`.
- Segmented by major sections with comment blocks:
- Semicolons: Required.
- Quotes: Single quotes for imports and string literals where applicable. Double quotes or template literals when constructing HTML fragments.
- Indentation: 2 spaces.
## Import Organization
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- **WebGL Context Sharing:** MapLibre and Three.js share a single WebGL2 canvas and rendering context, allowing 3D objects to overlay and render synchronously with geographic base layers.
- **Coordinate Projection Alignment:** Geographic coordinates (Latitude/Longitude) are converted to Mercator projection coordinates, then mapped to a local Cartesian grid centered on Bellevue, WA to prevent floating-point precision loss.
- **Dynamic Camera Synchronization:** Every frame, MapLibre provides its Camera Projection Matrix to Three.js to align the 3D perspective camera perfectly with the geographic viewport (tilt, pan, rotate).
- **Procedural and Spatial Generation:** Procedural algorithms extrude geometries (base blocks and cones/pyramids for roofs) using either seeded random functions or polygons retrieved from the OpenStreetMap data pipeline.
## Layers
- Purpose: Handles base map styling, coordinate conversions, touch/mouse navigation, camera zoom, pitch, and bearing.
- Contains: `Map` class initialization, raster style configurations, and event handlers for viewport events (e.g. `move`, `resize`).
- Depends on: CARTO tiles and browser WebGL APIs.
- Used by: Application logic to manage camera telemetry and trigger repaints.
- Purpose: Extrudes, styles, and renders 3D buildings and custom meshes.
- Contains: `ThreeLayer` class implementing `CustomLayerInterface`. Manages a Three.js scene, camera, lights, materials, geometries, and rendering loop.
- Depends on: Three.js libraries and local projection helpers.
- Used by: MapLibre's rendering scheduler to paint 3D content over the map.
- Purpose: Fetches real-world geographic building layout data.
- Contains: `fetchOSMBuildings` async method which requests building boundaries within a bounding box centered on the focus location.
- Depends on: Overpass API endpoint.
- Used by: `ThreeLayer` to replace procedural mock buildings with actual structures.
- Purpose: Provides interactive control panel for adjusting visualization settings in real-time.
- Contains: Sliders for building density, height scale, preset buttons, and checkbox controls.
- Depends on: Vanilla DOM API.
- Used by: User to tune aesthetics.
## Data Flow
## Key Abstractions
- Implements `CustomLayerInterface`. Capsules all Three.js setup, cleanup, OSM data processing, procedural geometry generation, and material updating.
- A fixed `MercatorCoordinate` representing the origin `(0,0,0)` in the local Three.js coordinate space, allowing distance calculations in meters instead of large geographic coordinates.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
