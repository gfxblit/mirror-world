# Codebase Concerns

**Analysis Date:** 2026-07-29

## Tech Debt

**Monolithic Source File (`src/main.ts`):**
- Issue: All application setups, custom classes, custom shaders, rendering engines, geographic transforms, mock builders, API fetchers, and UI event listeners are packed into a single 664-line file.
- Why: Rapid prototyping of the MapLibre + Three.js context sharing layer.
- Impact: Hard to maintain, difficult to write tests for, and increases risk of regressions when refactoring.
- Fix approach: Separate `src/main.ts` into modular components (e.g., `src/map/`, `src/three/`, `src/api/`, `src/ui/`).

**Hardcoded Development Host (`vite.config.ts`):**
- Issue: The Vite config specifies a single hardcoded hostname under `server.allowedHosts`: `bills-macbook-pro-16in-m2-max.tail8bc4f8.ts.net`.
- Why: Configured to support remote previewing/testing on an iPad/mobile client over a Tailscale network.
- Impact: Other developers using different Tailscale machine hostnames or network names will encounter host check failures unless they modify this file.
- Fix approach: Use environment variables or set `allowedHosts: true` during local dev testing, or dynamically read from host headers.

## Known Risks & Fragility

**Public Overpass API Dependency:**
- Issue: Fetches building data directly from the public `https://overpass-api.de/api/interpreter` endpoint.
- Why: Simple way to retrieve building boundary ways without hosting vector tiles or databases.
- Impact: Subject to strict rate limits and network latency. If the Overpass service is slow, down, or blocks the user's IP, the map remains empty of actual building extrusions (falling back to procedural layouts).
- Fix approach: Implement caching, proxy server, or switch to hosting `.pmtiles` archives (as outlined in the design spec).

**No Geometry Caching:**
- Issue: OSM geometries are downloaded, processed, and extruded as Three.js geometries on every single page load or parameters change.
- Why: Keeps current state stateless.
- Impact: Significant battery drain, network usage, and slow startup time when reloading.
- Fix approach: Cache downloaded geometries in `IndexedDB` or local browser cache.

## Performance Bottlenecks

**Dynamic Projection recalculations in the Render Loop:**
- Issue: Every single MapLibre render loop tick (up to 60fps), matrices are multiplied and re-mapped.
- Why: Map camera viewpoint is constantly shifting.
- Impact: High CPU usage, especially on mobile browsers.
- Fix approach: Only recalculate coordinate transform matrices when camera parameters (zoom, bearing, pitch, center) actually change.

---

*Concerns analysis: 2026-07-29*
*Update when refactoring codebase modules*
