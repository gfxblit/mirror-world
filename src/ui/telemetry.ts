import type { Map } from 'maplibre-gl';

/**
 * Attaches a listener to the MapLibre instance to update the HUD telemetry panels (zoom, bearing, pitch).
 */
export function setupTelemetry(map: Map): void {
  const telZoom = document.getElementById('tel-zoom');
  const telBearing = document.getElementById('tel-bearing');
  const telPitch = document.getElementById('tel-pitch');

  const updateHUD = () => {
    if (telZoom) telZoom.innerText = map.getZoom().toFixed(2);
    if (telBearing) telBearing.innerText = map.getBearing().toFixed(1) + '°';
    if (telPitch) telPitch.innerText = map.getPitch().toFixed(1) + '°';
  };

  // Initial run to show values immediately
  updateHUD();

  map.on('move', updateHUD);
}
