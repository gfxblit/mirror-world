# External Integrations

**Analysis Date:** 2026-07-29

## APIs & External Services

**Geographic Map Tiles (CARTO):**
- Service: CARTO dark_all basemap tiles
  - Integration method: Configured as a raster tile source in MapLibre GL JS configuration
  - Endpoint: `https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`
  - Auth: None (public tile source)

**OpenStreetMap (OSM) Data (Overpass API):**
- Service: Overpass API for querying raw OSM vector geometries (buildings/ways)
  - Integration method: HTTP POST requests using the `fetch` API inside `src/main.ts`
  - Endpoint: `https://overpass-api.de/api/interpreter`
  - Body: URL-encoded Overpass QL query:
    ```
    [out:json][timeout:25];
    (
      way["building"](minLat,minLon,maxLat,maxLon);
    );
    out body;
    >;
    out skel qt;
    ```
  - Auth: None (public access)
  - Headers: Custom `User-Agent: MirrorWorldPrototype/1.0 (billyc@projects.mirror-world)` to conform with Overpass API usage guidelines.

## Data Storage

- **None** - This is currently a frontend-only prototype without backend database storage or file hosting. All configurations/presets are local to the running browser session.

## Authentication & Identity

- **None** - There is no user identity system or session authentication implemented yet.

---

*Integrations analysis: 2026-07-29*
*Update after adding new API connections or storage systems*
