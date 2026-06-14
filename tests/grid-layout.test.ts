import { describe, it, expect } from 'vitest';
import {
  computeGridLayout,
  type ConstellationInput,
  type Position3D,
} from '../src/lib/grid-layout';

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

describe('computeGridLayout', () => {
  it('returns empty array for empty input', () => {
    expect(computeGridLayout([])).toEqual([]);
  });

  it('returns one position for single experiment', () => {
    const result = computeGridLayout(makeInputs(1));
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('x');
    expect(result[0]).toHaveProperty('y');
    expect(result[0]).toHaveProperty('z');
  });

  it('returns correct count for N experiments', () => {
    for (const n of [2, 5, 10, 20]) {
      expect(computeGridLayout(makeInputs(n))).toHaveLength(n);
    }
  });

  it('positions are uniformly spaced', () => {
    const result = computeGridLayout(makeInputs(8), { spacing: 3 });
    const distances: number[] = [];
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        distances.push(distance(result[i], result[j]));
      }
    }
    const minDist = Math.min(...distances);
    expect(minDist).toBeCloseTo(3, 0);
  });

  it('produces valid positions for 50+ experiments', () => {
    const result = computeGridLayout(makeInputs(55));
    expect(result).toHaveLength(55);
    for (const pos of result) {
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
      expect(Number.isFinite(pos.z)).toBe(true);
    }
  });

  it('grid is centred around the origin', () => {
    const result = computeGridLayout(makeInputs(27));
    const avg = {
      x: result.reduce((s, p) => s + p.x, 0) / result.length,
      y: result.reduce((s, p) => s + p.y, 0) / result.length,
      z: result.reduce((s, p) => s + p.z, 0) / result.length,
    };
    expect(Math.abs(avg.x)).toBeLessThan(1);
    expect(Math.abs(avg.y)).toBeLessThan(1);
    expect(Math.abs(avg.z)).toBeLessThan(1);
  });

  it('output is deterministic', () => {
    const inputs = makeInputs(12);
    expect(computeGridLayout(inputs)).toEqual(computeGridLayout(inputs));
  });
});
