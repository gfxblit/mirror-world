import { ConfigManager } from '../state/config';

/**
 * Attaches event listeners to the control panel inputs.
 * Updates the shared configManager and calls triggerRepaint when parameters change.
 */
export function setupUIControls(configManager: ConfigManager, triggerRepaint: () => void): void {
  // Height multiplier slider
  const heightSlider = document.getElementById('height-multiplier') as HTMLInputElement | null;
  if (heightSlider) {
    // Sync initial value from config
    heightSlider.value = configManager.get('heightScale').toString();
    heightSlider.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      configManager.set('heightScale', val);
      triggerRepaint();
    });
  }

  // Building density slider
  const densitySlider = document.getElementById('building-density') as HTMLInputElement | null;
  if (densitySlider) {
    // Sync initial value from config
    densitySlider.value = configManager.get('density').toString();
    densitySlider.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      configManager.set('density', val);
      triggerRepaint();
    });
  }

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

  // Preset buttons
  const presetButtons = document.querySelectorAll('.preset-btn');
  const initialPreset = configManager.get('preset');
  presetButtons.forEach(btn => {
    // Sync active class
    const preset = btn.getAttribute('data-preset') || 'fantasy';
    if (preset === initialPreset) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }

    btn.addEventListener('click', (e) => {
      presetButtons.forEach(b => b.classList.remove('active'));
      const target = e.target as HTMLButtonElement;
      target.classList.add('active');
      const targetPreset = target.getAttribute('data-preset') || 'fantasy';

      configManager.set('preset', targetPreset);
      triggerRepaint();
    });
  });

  // Mobile tab switcher
  const tabButtons = document.querySelectorAll('.mobile-tab-btn');
  const leftPanel = document.querySelector('.left-panel');
  const rightPanel = document.querySelector('.right-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLButtonElement;
      const tabName = target.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      target.classList.add('active');

      // Hide all
      leftPanel?.classList.remove('mobile-active');
      rightPanel?.classList.remove('mobile-active');
      document.getElementById('debug-console')?.classList.remove('mobile-active');

      // Show selected
      if (tabName === 'spatial') {
        leftPanel?.classList.add('mobile-active');
      } else if (tabName === 'controls') {
        rightPanel?.classList.add('mobile-active');
      } else if (tabName === 'logs') {
        document.getElementById('debug-console')?.classList.add('mobile-active');
      }
    });
  });
}
