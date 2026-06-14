export type ConstellationInput = { id: string; index: number };
export type Position3D = { x: number; y: number; z: number };

export interface ConstellationOptions {
  minDistance?: number;
  spread?: number;
}

function createRng(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dist(a: Position3D, b: Position3D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

export function computeConstellationLayout(
  experiments: ConstellationInput[],
  options?: ConstellationOptions,
): Position3D[] {
  if (experiments.length === 0) return [];

  const minDistance = options?.minDistance ?? 2;
  const spread = options?.spread ?? 5;

  const rng = createRng(42);

  const positions: Position3D[] = experiments.map((_, i) => {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const theta = goldenAngle * i;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / Math.max(experiments.length, 1));

    const baseRadius = spread * Math.cbrt((i + 1) / experiments.length);

    const x = baseRadius * Math.sin(phi) * Math.cos(theta);
    const y = baseRadius * Math.sin(phi) * Math.sin(theta);
    const z = baseRadius * Math.cos(phi);

    const jitter = spread * 0.15;
    return {
      x: x + (rng() - 0.5) * jitter,
      y: y + (rng() - 0.5) * jitter,
      z: z + (rng() - 0.5) * jitter,
    };
  });

  const maxIterations = 200;
  for (let iter = 0; iter < maxIterations; iter++) {
    let anyViolation = false;

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const d = dist(positions[i], positions[j]);
        if (d < minDistance) {
          anyViolation = true;

          const overlap = minDistance - d;
          const nudge = overlap / 2 + 0.01;

          let dx = positions[j].x - positions[i].x;
          let dy = positions[j].y - positions[i].y;
          let dz = positions[j].z - positions[i].z;

          if (d < 0.0001) {
            dx = Math.cos(i * 1.618) * 0.1;
            dy = Math.sin(i * 1.618) * 0.1;
            dz = Math.cos(j * 2.618) * 0.1;
          }

          const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
          const nx = dx / len;
          const ny = dy / len;
          const nz = dz / len;

          positions[i].x -= nx * nudge;
          positions[i].y -= ny * nudge;
          positions[i].z -= nz * nudge;
          positions[j].x += nx * nudge;
          positions[j].y += ny * nudge;
          positions[j].z += nz * nudge;
        }
      }
    }

    if (!anyViolation) break;
  }

  return positions;
}
