import { describe, it, expect } from 'vitest';
import {
  computeConstellationLayout,
  type ConstellationInput,
  type Position3D,
} from '../src/lib/constellation';

function makeInputs(count: number): ConstellationInput[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `exp-${i}`,
    index: i,
  }));
}

function distance(a: Position3D, b: Position3D): number {
  return Math.sqrt(
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2,
  );
}

describe('computeConstellationLayout', () => {
  it('returns empty array for empty input', () => {
    const result = computeConstellationLayout([]);
    expect(result).toEqual([]);
  });

  it('returns one position for a single experiment', () => {
    const result = computeConstellationLayout(makeInputs(1));
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('x');
    expect(result[0]).toHaveProperty('y');
    expect(result[0]).toHaveProperty('z');
  });

  it('returns correct count for N experiments', () => {
    for (const n of [2, 5, 10, 20]) {
      const result = computeConstellationLayout(makeInputs(n));
      expect(result).toHaveLength(n);
    }
  });

  it('all positions respect minimum distance constraint', () => {
    const minDistance = 2;
    const result = computeConstellationLayout(makeInputs(12), { minDistance });

    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const d = distance(result[i], result[j]);
        expect(d).toBeGreaterThanOrEqual(minDistance - 0.001);
      }
    }
  });

  it('produces valid positions for 50+ experiments', () => {
    const result = computeConstellationLayout(makeInputs(55));
    expect(result).toHaveLength(55);

    for (const pos of result) {
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
      expect(Number.isFinite(pos.z)).toBe(true);
    }
  });

  it('positions are within a reasonable bounding box', () => {
    const result = computeConstellationLayout(makeInputs(20));
    const maxCoord = 50;

    for (const pos of result) {
      expect(Math.abs(pos.x)).toBeLessThan(maxCoord);
      expect(Math.abs(pos.y)).toBeLessThan(maxCoord);
      expect(Math.abs(pos.z)).toBeLessThan(maxCoord);
    }
  });

  it('output is deterministic (same input produces same output)', () => {
    const inputs = makeInputs(15);
    const run1 = computeConstellationLayout(inputs);
    const run2 = computeConstellationLayout(inputs);
    expect(run1).toEqual(run2);
  });

  it('respects custom spread option', () => {
    const tight = computeConstellationLayout(makeInputs(10), { spread: 2 });
    const wide = computeConstellationLayout(makeInputs(10), { spread: 8 });

    const avgDist = (positions: Position3D[]) =>
      positions.reduce((sum, p) => sum + distance(p, { x: 0, y: 0, z: 0 }), 0) /
      positions.length;

    expect(avgDist(wide)).toBeGreaterThan(avgDist(tight));
  });

  it('50+ experiments still respect minimum distance', () => {
    const minDistance = 2;
    const result = computeConstellationLayout(makeInputs(55), { minDistance });

    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const d = distance(result[i], result[j]);
        expect(d).toBeGreaterThanOrEqual(minDistance - 0.001);
      }
    }
  });
});
