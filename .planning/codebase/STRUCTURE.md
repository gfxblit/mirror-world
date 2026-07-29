# Codebase Structure

**Analysis Date:** 2026-07-29

## Directory Layout

```
[project-root]/
├── public/                 # Static assets (favicons, manifest, etc.)
├── src/                    # Source files
│   ├── main.ts             # Application entry point containing core WebGL and Map logic
│   └── style.css           # Vanilla CSS layout, glassmorphic HUD styling, and debug log styles
├── index.html              # HTML structure defining HUD controls, map container, and telemetry
├── package.json            # npm package script runner and dependency list
├── tsconfig.json           # TypeScript compiler configuration
├── vite.config.ts          # Vite server and host configuration
└── DESIGN.md               # Design intent and research notes
```

## Directory Purposes

**`src/`:**
- Purpose: Contains all compiled TypeScript application logic and layout styling.
- Contains:
  - `main.ts` - Setup of MapLibre GL JS, custom `ThreeLayer` WebGL drawing context, Overpass API async fetch requests, building extrusion parsing, and UI/HUD event mapping.
  - `style.css` - Custom styling declarations. Avoids UI frameworks in favor of absolute positioning, layout controls, theme variables, glassmorphic filters, and responsiveness.

**`public/`:**
- Purpose: Contains static web assets that are copied directly to the build target output directory.

## Key File Locations

**Entry Points:**
- `index.html`: The HTML template loaded by the browser, referencing the script entry point `src/main.ts`.
- `src/main.ts`: Main TypeScript file containing the initialization of the Map, Three.js layers, dynamic loaders, and handlers.

**Configuration:**
- `package.json`: Manages scripts (`npm run dev`, `npm run build`, `npm run preview`) and dependencies.
- `tsconfig.json`: Defines TypeScript compilation choices.
- `vite.config.ts`: Vite bundler configuration including server settings.

**Core Logic:**
- `src/main.ts`: The absolute core of the application where all rendering, geometry extrusion, and state variables are declared.

---

*Structure analysis: 2026-07-29*
*Update when refactoring src/main.ts into multiple component/engine modules*
