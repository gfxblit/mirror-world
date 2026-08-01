import { test, expect } from '@playwright/test';

test.describe('Mirror World Prototype E2E Tests', () => {
  test('should load the page and render consolidated HUD', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // 1. Verify page title
    await expect(page).toHaveTitle(/Mirror World/);

    // 2. Verify HUD Header Title
    const headerTitle = page.locator('.logo-area h1');
    await expect(headerTitle).toBeVisible();
    await expect(headerTitle).toHaveText('MIRROR WORLD');

    // 3. Verify Status Indicator is present and has expected text
    const statusText = page.locator('#status-text');
    await expect(statusText).toBeVisible();
    
    // The status should initially be loading or offline/online depending on fetch state
    const statusValue = await statusText.innerText();
    expect(['LOADING OSM...', 'OSM ONLINE', 'OSM OFFLINE']).toContain(statusValue);

    // 4. Verify Consolidated Sidebar is present and on the left
    const sidebar = page.locator('.hud-panel.left-panel');
    await expect(sidebar).toBeVisible();
    
    // Check main sections inside the sidebar
    await expect(sidebar.locator('h2')).toHaveText('Spatial Engine');
    await expect(sidebar.locator('h3').first()).toHaveText('Pipeline Parameters');
    await expect(sidebar.locator('h3').last()).toHaveText('Render Modes');

    // 5. Verify the rendering toggle checkboxes are present
    const toonCheckbox = page.locator('#toggle-toon');
    const wireframeCheckbox = page.locator('#toggle-wireframe');
    await expect(toonCheckbox).toBeAttached();
    await expect(wireframeCheckbox).toBeAttached();

    // Verify default checked state
    await expect(toonCheckbox).toBeChecked();
    await expect(wireframeCheckbox).not.toBeChecked();

    // 6. Verify debug console element exists at the bottom
    const debugConsole = page.locator('#debug-console');
    await expect(debugConsole).toBeVisible();
  });
});
