# Testing Patterns

**Analysis Date:** 2026-07-29

## Test Framework

- **Playwright** (`playwright` ^1.62.0) is present in `package.json` devDependencies.
- However, **no configuration files or tests have been created yet**. There are currently no scripts mapped to run tests in `package.json`.

## Target Test Setup (Future)

To test the WebGL layout and MapLibre canvas integration:
1. **Runner:** Playwright Test runner.
2. **Execution command (proposed):**
   ```bash
   npx playwright test
   ```
3. **Focus areas:**
   - Map loading verification.
   - WebGL shared canvas compilation.
   - HUD button interaction and parameter updates.
   - Overpass API responses mocking.

---

*Testing patterns analysis: 2026-07-29*
*Update when initializing Playwright or adding unit/integration tests*
