# Requirements: Mirror World (CodeRabbit Integration)

**Defined:** 2026-07-29
**Core Value:** Ensure seamless WebGL context sharing and matrix projection alignment between MapLibre and Three.js to render custom 3D geometries and dynamic shaders at 60fps on web-native browsers.

## v1 Requirements

### CodeRabbit Configuration

- [ ] **CR-01**: Create a valid `.coderabbit.yml` configuration file in the root of the repository.
- [ ] **CR-02**: Customize CodeRabbit review preferences to ignore draft pull requests and disable creative writing summaries (poems).
- [ ] **CR-03**: Configure path-specific guidelines in `.coderabbit.yml` for TypeScript (`src/**/*.ts`) files focusing on WebGL context sharing, Mercator translations, and Three.js rendering safety.
- [ ] **CR-04**: Configure path-specific guidelines in `.coderabbit.yml` for styling (`src/**/*.css` and `index.html`) files focusing on absolute layout constraints, glassmorphic HUD styling, and responsiveness.

## v2 Requirements

### CI/CD Pipeline

- **CI-01**: Configure a GitHub Actions workflow (`.github/workflows/ci.yml`) to automatically compile the TypeScript files and run linter validation checks.
- **CI-02**: Setup Playwright automated testing running inside the CI/CD pipeline to verify correct map canvas initialization.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom GitHub Action runner for CodeRabbit | CodeRabbit operates natively as a GitHub Marketplace App; there is no need for custom pipeline configuration for execution trigger. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CR-01 | Phase 1 | Pending |
| CR-02 | Phase 1 | Pending |
| CR-03 | Phase 1 | Pending |
| CR-04 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 4 total
- Mapped to phases: 4
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-29*
*Last updated: 2026-07-29 after initial definition*
