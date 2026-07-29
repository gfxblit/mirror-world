# Mirror World

## What This Is

A reality-mirrored game prototyping pipeline featuring an isometric, stylized 3D environment mapped directly from real-world OpenStreetMap (OSM) geographic data using MapLibre GL JS and Three.js.

## Core Value

Ensure seamless WebGL context sharing and matrix projection alignment between MapLibre and Three.js to render custom 3D geometries and dynamic shaders at 60fps on web-native browsers.

## Requirements

### Validated

- ✓ Render interactive geographic base maps centered on Bellevue, WA using MapLibre GL JS.
- ✓ Share a single WebGL2 rendering context directly between MapLibre and custom Three.js layers.
- ✓ Dynamically align Three.js camera projection matrix with MapLibre's viewport matrix every frame.
- ✓ Fetch real-world building footprint data asynchronously from OpenStreetMap using the Overpass API.
- ✓ Extrude building layouts into 3D geometries with custom toon shading and wireframe mode options.
- ✓ Adjust visual style parameters (preset, density, height multiplier) dynamically via a floating HUD.

### Active

- [ ] Create `.coderabbit.yml` configuration file in the repository root.
- [ ] Configure CodeRabbit custom review guidelines tailored to the tech stack (TypeScript, Three.js context usage, MapLibre rendering, vanilla CSS/HTML).
- [ ] Configure CodeRabbit pull request review scope, including ignoring draft pull requests, disabling creative poems, and filtering out third-party/auto-generated directories if needed.

### Out of Scope

- [ ] Hosting custom OSM vector tiles (PMTiles) — Deferred until vector tiles server/CDN setup is ready.
- [ ] Setting up backend datastores or authentication — Scope is currently limited to client-side game rendering.
- [ ] Manual GitHub Actions setup for CodeRabbit — CodeRabbit runs as a marketplace GitHub App, so manual workflow action integration is out of scope.

## Context

- The project relies on WebGL context sharing, which is fragile and prone to browser-specific canvas rendering bugs.
- There are currently no tests or test workflows setup despite playwright package dependency.
- This phase focuses specifically on configuring CodeRabbit automated code reviews on pull requests to ensure structural, rendering, and styling changes conform to codebase conventions.

## Constraints

- **Tech Stack**: Must use standard configuration format for CodeRabbit (`.coderabbit.yml`).
- **Development host**: Development server host is configured for local Tailscale previews, meaning custom hostname checks must be preserved or handled carefully.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Map Codebase First | Analyzed current monofile `src/main.ts` architecture, stack, and dependencies before initializing project. | ✓ Good |
| CodeRabbit as GitHub App | Rely on standard GitHub App installation for review triggers rather than custom GH Actions workflows. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-29 after project initialization*
