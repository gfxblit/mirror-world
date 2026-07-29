import { Map } from 'maplibre-gl';
import { logToScreen } from '../ui/debug-console';

/**
 * Initializes the MapLibre map instance centered at the given coordinates.
 */
export function initializeMap(center: [number, number]): Map {
  logToScreen('Initializing MapLibre instance...');

  const map = new Map({
    container: 'map',
    style: {
      version: 8,
      sources: {
        'osm-basemap': {
          type: 'raster',
          tiles: [
            'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        },
      },
      layers: [
        {
          id: 'osm-basemap-layer',
          type: 'raster',
          source: 'osm-basemap',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    center: center,
    zoom: 15.5,
    pitch: 60.0,
    bearing: 28.0,
  });

  // Attach to window for global access/debugging
  (window as any).map = map;

  return map;
}
