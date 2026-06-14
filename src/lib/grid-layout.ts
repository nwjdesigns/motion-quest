export type { ConstellationInput, Position3D } from './constellation';
import type { ConstellationInput, Position3D } from './constellation';

export interface GridOptions {
  spacing?: number;
}

export function computeGridLayout(
  experiments: ConstellationInput[],
  options?: GridOptions,
): Position3D[] {
  if (experiments.length === 0) return [];

  const spacing = options?.spacing ?? 3;
  const n = experiments.length;

  const cols = Math.ceil(Math.cbrt(n));
  const rows = Math.ceil(Math.sqrt(n / cols));
  const layers = Math.ceil(n / (cols * rows));

  const offsetX = ((cols - 1) * spacing) / 2;
  const offsetY = ((rows - 1) * spacing) / 2;
  const offsetZ = ((layers - 1) * spacing) / 2;

  const positions: Position3D[] = [];

  for (let i = 0; i < n; i++) {
    const layer = Math.floor(i / (cols * rows));
    const remainder = i % (cols * rows);
    const row = Math.floor(remainder / cols);
    const col = remainder % cols;

    positions.push({
      x: col * spacing - offsetX,
      y: row * spacing - offsetY,
      z: layer * spacing - offsetZ,
    });
  }

  return positions;
}
