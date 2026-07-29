import { MercatorCoordinate } from 'maplibre-gl';

export interface LocalPoint {
  x: number;
  z: number;
}

/**
 * Projects a GPS latitude/longitude coordinate to a local meter-offset relative to a center point.
 * MapLibre / Web Mercator coordinate system:
 * - x increases to the East (positive local x)
 * - y increases to the South (positive local z in Three.js coordinate system mapping)
 */
export function latLonToLocal(
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number
): LocalPoint {
  const centerMercator = MercatorCoordinate.fromLngLat([centerLon, centerLat]);
  const merc = MercatorCoordinate.fromLngLat([lon, lat]);

  const dx = merc.x - centerMercator.x;
  const dy = merc.y - centerMercator.y;

  const meterScale = centerMercator.meterInMercatorCoordinateUnits();

  // meterScale is the size of 1 meter in mercator units at the center's latitude
  return {
    x: dx / meterScale,
    z: dy / meterScale,
  };
}
