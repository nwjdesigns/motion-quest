export type { ConstellationInput, Position3D } from './constellation';
import type { ConstellationInput, Position3D } from './constellation';

export interface SpiralOptions {
  radiusScale?: number;
  verticalSpread?: number;
}

export function computeSpiralLayout(
  experiments: ConstellationInput[],
  options?: SpiralOptions,
): Position3D[] {
  if (experiments.length === 0) return [];

  const radiusScale = options?.radiusScale ?? 0.6;
  const verticalSpread = options?.verticalSpread ?? 0.3;
  const n = experiments.length;

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  return experiments.map((_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const radius = radiusScale * Math.sqrt(i + 1);
    const theta = goldenAngle * i;

    return {
      x: radius * Math.cos(theta),
      y: t * verticalSpread * n - (verticalSpread * n) / 2,
      z: radius * Math.sin(theta),
    };
  });
}
