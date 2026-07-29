# Phase 01: CodeRabbit Integration - Context

**Gathered:** 2026-07-29
**Status:** Ready for planning
**Source:** Manual definition for Issue #5

<domain>
## Phase Boundary

Integrate CodeRabbit code review tool by creating and configuring `.coderabbit.yml` to automatically review pull requests with guidelines customized for the Mirror World spatial renderer.

</domain>

<decisions>
## Implementation Decisions

### Global Review Preferences
- Ignore draft pull requests (`draft: false` or appropriate CodeRabbit YAML setting).
- Disable creative summaries / poems (`poem: false` or `disable_poem: true`).
- Review language should be set to `en-US`.

### TypeScript Review Rules (`src/**/*.ts`)
- Verify WebGL context reuse: Ensure Three.js `WebGLRenderer` correctly shares the MapLibre context (`context: gl`).
- Verify WebGL state cleanup: Ensure `renderer.resetState()` is called on every render pass to prevent MapLibre layout corruption.
- Verify coordinate precision: Projections must translate geographic coordinates via `MercatorCoordinate` scaling.
- Verify redraw triggers: Any HUD parameter change (presets, scale, density) must invoke `map.triggerRepaint()`.

### Layout & Styling Review Rules (`src/**/*.css`, `index.html`)
- Verify absolute viewport positioning and glassmorphism (blurs, borders, HSL tail coloring).
- Ensure semantic accessibility and unique DOM element IDs for UI telemetry.
- Verify mobile navigation tab responsiveness.

### Path Filters
- Exclude third-party dependency directories, compiled outputs, and `.planning` directories from reviews.

### the agent's Discretion
- CodeRabbit organization rules, ignoring titles (e.g. WIP), and custom labels are left to standard defaults.

</decisions>

<canonical_refs>
## Canonical References

- [README.md](file:///Users/billyc/gsd-workspaces/add-coderabbit-for-pr-issue5/main/README.md) — Tech stack overview.
- [DESIGN.md](file:///Users/billyc/gsd-workspaces/add-coderabbit-for-pr-issue5/main/DESIGN.md) — Shared WebGL and rendering matrix design notes.
- [src/main.ts](file:///Users/billyc/gsd-workspaces/add-coderabbit-for-pr-issue5/main/src/main.ts) — Codebase implementation of the spatial renderer.

</canonical_refs>

---
*Phase: 01-coderabbit-integration*
*Context gathered: 2026-07-29*
