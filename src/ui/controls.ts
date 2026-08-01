import { ConfigManager } from '../state/config';

/**
 * Attaches event listeners to the control panel inputs.
 * Updates the shared configManager and calls triggerRepaint when parameters change.
 */
export function setupUIControls(configManager: ConfigManager, triggerRepaint: () => void): void {
  // Toon shader toggle
  const toonToggle = document.getElementById('toggle-toon') as HTMLInputElement | null;
  if (toonToggle) {
    // Sync initial state from config
    toonToggle.checked = configManager.get('toonEnabled');
    toonToggle.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      configManager.set('toonEnabled', checked);
      triggerRepaint();
    });
  }

  // Wireframe toggle
  const wireframeToggle = document.getElementById('toggle-wireframe') as HTMLInputElement | null;
  if (wireframeToggle) {
    // Sync initial state from config
    wireframeToggle.checked = configManager.get('wireframeEnabled');
    wireframeToggle.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      configManager.set('wireframeEnabled', checked);
      triggerRepaint();
    });
  }

  // Mobile tab switcher
  const tabButtons = document.querySelectorAll('.mobile-tab-btn');
  const leftPanel = document.querySelector('.left-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const tabName = target.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      target.classList.add('active');

      // Hide all
      leftPanel?.classList.remove('mobile-active');
      document.getElementById('debug-console')?.classList.remove('mobile-active');

      // Show selected
      if (tabName === 'spatial') {
        leftPanel?.classList.add('mobile-active');
      } else if (tabName === 'logs') {
        document.getElementById('debug-console')?.classList.add('mobile-active');
      }
    });
  });
}
