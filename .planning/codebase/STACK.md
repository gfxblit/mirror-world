# Technology Stack

**Analysis Date:** 2026-07-29

## Languages

**Primary:**
- TypeScript ~6.0.2 - All application source code (`src/main.ts`)

**Secondary:**
- CSS / HTML - Styling (`src/style.css`) and entry HTML template (`index.html`)

## Runtime

**Environment:**
- Browser environment (WebGL2-compatible browser)
- Dev server runs on Node.js

**Package Manager:**
- npm (No lockfile present in the repository yet)

## Frameworks

**Core:**
- MapLibre GL JS ^6.0.0 - Handles geographic base mapping, viewport gestures (pan, zoom, tilt), and custom rendering layer hookups.
- Three.js ^0.185.1 - Handles 3D rendering, custom geometry generation (footprint extrusion), custom shaders/materials, lights, and camera matrices.

**Testing:**
- Playwright ^1.62.0 - Configured as dev dependency but no active tests or configuration files exist yet.

**Build/Dev:**
- Vite ^8.1.1 - Hot module reloading (HMR) bundler and local development server.

## Key Dependencies

**Critical:**
- `maplibre-gl` ^6.0.0 - Base web map control.
- `three` ^0.185.1 - 3D engine for custom layers.

## Configuration

**Environment:**
- None required for local development.

**Build:**
- `tsconfig.json` - Configures TypeScript compiler choices.
- `vite.config.ts` - Vite dev server setup, including custom `allowedHosts` entry for Tailwind network testing: `bills-macbook-pro-16in-m2-max.tail8bc4f8.ts.net`.

## Platform Requirements

**Development:**
- Cross-platform (any system running Node.js and a modern browser supporting WebGL2).

**Production:**
- Static web page bundle (HTML, JS, CSS) built via `npm run build` using Vite.

---

*Stack analysis: 2026-07-29*
*Update after major dependency changes*
