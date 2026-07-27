import { describe, it, expect } from 'vitest';
import { generateProceduralBuildings } from './procedural';

describe('Procedural Building Generator', () => {
  it('should generate a list of buildings deterministically', () => {
    const buildings1 = generateProceduralBuildings({ density: 0.7, heightScale: 1.0 });
    const buildings2 = generateProceduralBuildings({ density: 0.7, heightScale: 1.0 });

    expect(buildings1.length).toBeGreaterThan(0);
    expect(buildings1).toEqual(buildings2); // Should be exactly the same due to seeded random
  });

  it('should scale heights correctly using heightScale', () => {
    const defaultBuildings = generateProceduralBuildings({ density: 0.7, heightScale: 1.0 });
    const scaledBuildings = generateProceduralBuildings({ density: 0.7, heightScale: 2.0 });

    expect(defaultBuildings.length).toBe(scaledBuildings.length);
    for (let i = 0; i < defaultBuildings.length; i++) {
      expect(scaledBuildings[i].height).toBeCloseTo(defaultBuildings[i].height * 2.0, 5);
      if (defaultBuildings[i].roof && scaledBuildings[i].roof) {
        // The roof's vertical position should adjust to the new building height
        expect(scaledBuildings[i].roof!.py).toBeCloseTo(
          scaledBuildings[i].height + scaledBuildings[i].roof!.height / 2,
          5
        );
      }
    }
  });

  it('should respect the density parameter', () => {
    const lowDensity = generateProceduralBuildings({ density: 0.1, heightScale: 1.0 });
    const highDensity = generateProceduralBuildings({ density: 0.9, heightScale: 1.0 });

    expect(highDensity.length).toBeGreaterThan(lowDensity.length);
  });

  it('should handle zero or low boundaries gracefully', () => {
    const zeroDensity = generateProceduralBuildings({ density: 0.0, heightScale: 1.0 });
    expect(zeroDensity.length).toBe(0);
  });
});
