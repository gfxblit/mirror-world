import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchOSMBuildings } from './osm';

describe('OSM Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and normalize OSM buildings successfully', async () => {
    const mockData = {
      elements: [
        { type: 'node', id: 1, lat: 47.61, lon: -122.19 },
        { type: 'node', id: 2, lat: 47.611, lon: -122.19 },
        { type: 'node', id: 3, lat: 47.611, lon: -122.189 },
        { type: 'node', id: 4, lat: 47.61, lon: -122.189 },
        {
          type: 'way',
          id: 10,
          nodes: [1, 2, 3, 4, 1],
          tags: {
            building: 'yes',
            height: '25',
          },
        },
      ],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchOSMBuildings(47.61, -122.19, mockFetch);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 10,
      height: 25,
      levels: undefined,
      coordinates: [
        { lat: 47.61, lon: -122.19 },
        { lat: 47.611, lon: -122.19 },
        { lat: 47.611, lon: -122.189 },
        { lat: 47.61, lon: -122.189 },
        { lat: 47.61, lon: -122.19 },
      ],
    });
  });

  it('should parse building:levels when height is missing', async () => {
    const mockData = {
      elements: [
        { type: 'node', id: 1, lat: 47.61, lon: -122.19 },
        { type: 'node', id: 2, lat: 47.611, lon: -122.19 },
        { type: 'node', id: 3, lat: 47.611, lon: -122.189 },
        {
          type: 'way',
          id: 11,
          nodes: [1, 2, 3, 1],
          tags: {
            building: 'apartments',
            'building:levels': '3',
          },
        },
      ],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchOSMBuildings(47.61, -122.19, mockFetch);
    expect(result).toHaveLength(1);
    expect(result[0].levels).toBe(3);
    expect(result[0].height).toBeUndefined();
  });

  it('should filter out invalid buildings (less than 3 coordinates)', async () => {
    const mockData = {
      elements: [
        { type: 'node', id: 1, lat: 47.61, lon: -122.19 },
        { type: 'node', id: 2, lat: 47.611, lon: -122.19 },
        {
          type: 'way',
          id: 12,
          nodes: [1, 2, 1],
          tags: { building: 'yes' },
        },
      ],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchOSMBuildings(47.61, -122.19, mockFetch);
    expect(result).toHaveLength(0);
  });

  it('should return empty array and log error on HTTP failure', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await fetchOSMBuildings(47.61, -122.19, mockFetch);
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should return empty array and log error on network exception', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network Down'));

    const result = await fetchOSMBuildings(47.61, -122.19, mockFetch);
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle response with missing or empty elements list', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ elements: null }),
    });

    const result = await fetchOSMBuildings(47.61, -122.19, mockFetch);
    expect(result).toEqual([]);
  });
});
