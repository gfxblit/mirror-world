import { describe, it, expect } from 'vitest';
import { latLonToLocal } from './geo';

describe('Geographic Utils', () => {
  const BellevueCenter: [number, number] = [-122.19, 47.61]; // [lon, lat]

  it('should project the center coordinate to (0, 0)', () => {
    const point = latLonToLocal(BellevueCenter[1], BellevueCenter[0], BellevueCenter[1], BellevueCenter[0]);
    expect(point.x).toBeCloseTo(0, 5);
    expect(point.z).toBeCloseTo(0, 5);
  });

  it('should project coordinates to local meter offsets', () => {
    // A coordinate slightly north and east
    const lat = BellevueCenter[1] + 0.001;
    const lon = BellevueCenter[0] + 0.001;
    
    const point = latLonToLocal(lat, lon, BellevueCenter[1], BellevueCenter[0]);
    
    // Check that we got reasonable non-zero offsets
    expect(point.x).toBeGreaterThan(0);
    
    // In MapLibre/Mercator, increasing latitude corresponds to moving North,
    // but in Web Mercator map coordinates, y decreases as we go North.
    // Let's check what the monolithic code does:
    // dy_merc = merc.y - centerMercator.y;
    // z_local = dy_merc / centerMercator.meterInMercatorCoordinateUnits();
    // In Web Mercator, merc.y decreases as lat increases.
    // So for lat > centerLat, merc.y < centerMercator.y, which means dy_merc < 0,
    // so z_local should be negative (going North is negative Z).
    expect(point.z).toBeLessThan(0);
  });
});
