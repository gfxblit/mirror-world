# Coding Conventions

**Analysis Date:** 2026-07-29

## Naming Patterns

**Files:**
- TypeScript/JavaScript: kebab-case (e.g., `vite.config.ts`, `tsconfig.json`).
- Source files: lowercase / kebab-case (e.g., `main.ts`, `style.css`).

**Classes:**
- PascalCase for class names (e.g., `ThreeLayer`).

**Functions:**
- camelCase for standard functions (e.g., `logToScreen`, `fetchOSMBuildings`, `generateBuildings`, `addThreeLayer`).

**Variables:**
- camelCase for local variable declarations (e.g., `centerMercator`, `rebuildNeeded`, `materialUpdateNeeded`).
- Upper PascalCase or UPPER_SNAKE_CASE for constant identifiers (e.g., `BellevueCenter`).

**Types and Interfaces:**
- PascalCase for type and interface names.
- Uses standard MapLibre interfaces directly (e.g., `CustomLayerInterface`, `CustomRenderMethodInput`).

## Code Style

**Structure:**
- Monolithic design: All application logic, classes, helpers, and event listeners currently reside in a single large entry point: `src/main.ts`.
- Segmented by major sections with comment blocks:
  - `0. On-Screen Debug Console`
  - `1. Map Configuration & Coordinates`
  - `2. Custom 3D Layer Class`
  - `3. Register and Add Custom Layer`
  - `4. Update HUD Telemetry Panel`
  - `5. Connect UI Event Listeners`
  - `6. Connect Mobile Navigation Tab Bar Switcher`

**Formatting:**
- Semicolons: Required.
- Quotes: Single quotes for imports and string literals where applicable. Double quotes or template literals when constructing HTML fragments.
- Indentation: 2 spaces.

## Import Organization

**Order:**
1. CSS style imports (`import './style.css'`).
2. External package dependencies (`import { Map, MercatorCoordinate } from 'maplibre-gl'`).
3. 3D engine imports (`import * as THREE from 'three'`).
4. Internal modules (none currently exist).

---

*Conventions analysis: 2026-07-29*
*Update when introducing Prettier/ESLint rules*
