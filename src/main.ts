import './style.css';
import { ConfigManager } from './state/config';
import { initializeMap } from './engine/map';
import { ThreeLayer } from './engine/three-layer';
import { setupUIControls } from './ui/controls';
import { logToScreen } from './ui/debug-console';

const BellevueCenter: [number, number] = [-122.19, 47.61];

// 1. Initialize State ConfigManager
const configManager = new ConfigManager();

// 2. Initialize MapLibre Map
const map = initializeMap(BellevueCenter);

// 3. Initialize Custom 3D Layer
const threeLayer = new ThreeLayer(configManager, BellevueCenter);

const addThreeLayer = () => {
  if (!map.getLayer(threeLayer.id)) {
    map.addLayer(threeLayer);
    logToScreen('Custom Three.js layer added.');
  }
};

if (map.isStyleLoaded()) {
  logToScreen('Map style loaded synchronously. Adding layer...');
  addThreeLayer();
} else {
  logToScreen('Waiting for style.load...');
  map.on('style.load', () => {
    addThreeLayer();
  });
}

map.on('load', () => {
  logToScreen('Map fully loaded.');
});

// 4. Connect UI Event Listeners & Tab Switcher
setupUIControls(configManager, () => map.triggerRepaint());

// 5. Global helper for debugging projection matrices
(window as any).dumpMatrices = () => {
  const options = (window as any).lastOptions;
  if (options) {
    console.log('SETTLED_MVP: ' + JSON.stringify(Array.from(options.modelViewProjectionMatrix)));
    if (options.defaultProjectionData && options.defaultProjectionData.mainMatrix) {
      console.log('SETTLED_MAIN: ' + JSON.stringify(Array.from(options.defaultProjectionData.mainMatrix)));
    }
  } else {
    console.log('SETTLED_MVP: null');
  }
};
