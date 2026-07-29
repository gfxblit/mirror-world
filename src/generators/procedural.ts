export interface ProceduralRoof {
  type: 'cone';
  radius: number;
  height: number;
  radialSegments: number;
  rotateY: boolean; // Align flat faces for pyramid shape
  py: number; // local y coordinate of the roof center
}

export interface ProceduralBuilding {
  id: string;
  px: number;
  pz: number;
  width: number;
  height: number;
  depth: number;
  roof: ProceduralRoof | null;
}

interface GeneratorParams {
  density: number;
  heightScale: number;
}

/**
 * Generates building positions and dimensions on a grid.
 * Uses a seeded random number generator for predictability.
 */
export function generateProceduralBuildings(params: GeneratorParams): ProceduralBuilding[] {
  const { density, heightScale } = params;
  const buildings: ProceduralBuilding[] = [];

  let seed = 7;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const size = 10; // Grid radius
  for (let x = -size; x <= size; x++) {
    for (let y = -size; y <= size; y++) {
      const dist = Math.sqrt(x * x + y * y);
      const spawnProbability = Math.max(0.1, 1.0 - dist / (size * 1.3));

      if (random() < spawnProbability * density) {
        const height = (15 + random() * 45) * heightScale;
        const width = 10 + random() * 12;
        const depth = 10 + random() * 12;

        const px = x * 30 + (random() - 0.5) * 6;
        const pz = y * 30 + (random() - 0.5) * 6; // Y grid mapped to Z south-north in Three.js

        let roof: ProceduralRoof | null = null;
        const roofType = random();

        if (roofType < 0.45) {
          roof = {
            type: 'cone',
            radius: width * 0.75,
            height: 12,
            radialSegments: 4,
            rotateY: true,
            py: height + 6, // height + roofHeight / 2
          };
        } else if (roofType < 0.8) {
          roof = {
            type: 'cone',
            radius: width * 0.65,
            height: 18,
            radialSegments: 8,
            rotateY: false,
            py: height + 9, // height + roofHeight / 2
          };
        }

        buildings.push({
          id: `building-${x}-${y}`,
          px,
          pz,
          width,
          height,
          depth,
          roof,
        });
      }
    }
  }

  return buildings;
}
