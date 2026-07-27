# Game Design & Prototyping Pipeline: Mirror World Project
This document tracks the ongoing architectural and pipeline explorations for prototyping a reality-mirrored game featuring an isometric, hand-painted aesthetic similar to Albion Online.
1. Core Concept & Visual Identity
 * Visual Style: Chunky, stylized, low-poly geometry with hand-painted textures.
 * World Generation: A "Mirror World" system mapping reality to a fantasy environment using real-world data constraints.
2. OpenStreetMap (OSM) Web-Native Rendering Component
To render the map seamlessly at scale with full mobile touch interactions, the game relies on MapLibre GL JS as the foundational geographic engine.
 * Renderer Choice: MapLibre GL JS.
 * Why it works: MapLibre is a free, open-source TypeScript library that uses WebGL (with WebGPU in development) to render interactive maps from vector tiles directly in the browser, ensuring exceptional performance at 60fps.
 * 3D and Integration Capabilities: MapLibre natively supports 3D terrain, building extrusions, and custom 3D layers. Its plugin-friendly architecture allows developers to embed full three.js or Babylon.js scenes directly into the map to manage custom geometries and lighting.
3. Architectural Pipeline: MapLibre + Three.js Integration
To achieve the chunky, hand-painted Albion aesthetic on mobile-native web browsers, the rendering pipeline will bypass MapLibre's default building styling and utilize its CustomLayerInterface.
 * Base Map Initialization: MapLibre handles the geographic vector tiles, user touch inputs (pan, zoom, pitch), and the base camera matrix. For the initial configuration, setting the center to Bellevue ([-122.19, 47.61]) provides a reliable testing ground with a diverse mix of commercial and residential building footprints.
 * Custom Three.js Layer: A custom layer is instantiated inside MapLibre that shares the exact same WebGL context. MapLibre passes its projection matrix to this layer every frame.
 * Geometry Extrusion: Instead of rendering MapLibre's procedural building layers, the pipeline parses the underlying OpenStreetMap vector tile data (specifically the building footprints) and extrudes them as THREE.ExtrudeGeometry within the three.js scene.
 * Stylized Shaders: A custom WebGL/GLSL toon shader is applied to the three.js material. This shader handles the discrete color banding and edge-detection outlines required for the stylized fantasy look, allowing the extruded map geometry to react dynamically to a unified light source.
4. Vector Tile Sourcing (PMTiles)
Because MapLibre requires external tile hosting, the pipeline will utilize open tile servers or self-hosted .pmtiles archives to deliver the raw OpenStreetMap vector data to the client. Using the pmtiles:// protocol within MapLibre allows the engine to fetch tile data directly from cloud storage without needing a dedicated tile server backend.
