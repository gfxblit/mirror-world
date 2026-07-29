export interface OSMBuilding {
  id: number;
  height?: number;
  levels?: number;
  coordinates: { lat: number; lon: number }[];
}

/**
 * Fetches OpenStreetMap building data for a given bounding box around latitude and longitude.
 * Normalizes the response into a list of OSMBuilding objects.
 */
export async function fetchOSMBuildings(
  lat: number,
  lon: number,
  fetchFn = fetch
): Promise<OSMBuilding[]> {
  const range = 0.006; // Approx 1.3km x 1.1km core
  const minLat = lat - range;
  const maxLat = lat + range;
  const minLon = lon - range * 1.5;
  const maxLon = lon + range * 1.5;

  const query = `[out:json][timeout:25];
(
  way["building"](${minLat},${minLon},${maxLat},${maxLon});
);
out body;
>;
out skel qt;`;

  const url = 'https://overpass-api.de/api/interpreter';

  try {
    const res = await fetchFn(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'MirrorWorldPrototype/1.0 (billyc@projects.mirror-world)',
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    if (!data || !data.elements) {
      return [];
    }

    const elements = data.elements;
    const ways = elements.filter((e: any) => e.type === 'way');
    const nodes = elements.filter((e: any) => e.type === 'node');

    const nodeMap: Record<number, { lat: number; lon: number }> = {};
    nodes.forEach((n: any) => {
      nodeMap[n.id] = { lat: n.lat, lon: n.lon };
    });

    const normalizedBuildings: OSMBuilding[] = [];

    ways.forEach((way: any) => {
      const nodeIds = way.nodes;
      if (!nodeIds || nodeIds.length < 3) return;

      // Ensure we have at least 3 unique nodes to form a polygon
      const uniqueNodeIds = new Set(nodeIds);
      if (uniqueNodeIds.size < 3) return;

      const coordinates: { lat: number; lon: number }[] = [];
      nodeIds.forEach((id: number) => {
        const node = nodeMap[id];
        if (node) {
          coordinates.push({ lat: node.lat, lon: node.lon });
        }
      });

      // A valid closed way (polygon) needs at least 3 mapped points
      if (coordinates.length < 3) return;

      const tags = way.tags || {};
      let height: number | undefined;
      let levels: number | undefined;

      if (tags.height) {
        const hVal = parseFloat(tags.height);
        if (!isNaN(hVal)) height = hVal;
      }

      if (tags['building:levels']) {
        const lVal = parseFloat(tags['building:levels']);
        if (!isNaN(lVal)) levels = lVal;
      }

      normalizedBuildings.push({
        id: way.id,
        height,
        levels,
        coordinates,
      });
    });

    return normalizedBuildings;
  } catch (err) {
    console.error('Error fetching/parsing OSM buildings:', err);
    return [];
  }
}
