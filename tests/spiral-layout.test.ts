import { describe, it, expect } from 'vitest';
import {
  computeSpiralLayout,
  type ConstellationInput,
  type Position3D,
} from '../src/lib/spiral-layout';

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

function distFromOrigin(p: Position3D): number {
  return Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2);
}

describe('computeSpiralLayout', () => {
  it('returns empty array for empty input', () => {
    expect(computeSpiralLayout([])).toEqual([]);
  });

  it('returns one position for single experiment', () => {
    const result = computeSpiralLayout(makeInputs(1));
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('x');
    expect(result[0]).toHaveProperty('y');
    expect(result[0]).toHaveProperty('z');
  });

  it('returns correct count for N experiments', () => {
    for (const n of [2, 5, 10, 20]) {
      expect(computeSpiralLayout(makeInputs(n))).toHaveLength(n);
    }
  });

  it('first experiment (newest/index 0) is near the centre', () => {
    const result = computeSpiralLayout(makeInputs(20));
    const firstDist = distFromOrigin(result[0]);
    const lastDist = distFromOrigin(result[result.length - 1]);
    expect(firstDist).toBeLessThan(lastDist);
  });

  it('positions spiral outward (later indices are further from centre)', () => {
    const result = computeSpiralLayout(makeInputs(20));
    const distances = result.map(distFromOrigin);
    let outwardCount = 0;
    for (let i = 1; i < distances.length; i++) {
      if (distances[i] >= distances[i - 1]) outwardCount++;
    }
    expect(outwardCount / (distances.length - 1)).toBeGreaterThan(0.5);
  });

  it('produces valid positions for 50+ experiments', () => {
    const result = computeSpiralLayout(makeInputs(55));
    expect(result).toHaveLength(55);
    for (const pos of result) {
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
      expect(Number.isFinite(pos.z)).toBe(true);
    }
  });

  it('positions are within a reasonable bounding box', () => {
    const result = computeSpiralLayout(makeInputs(20));
    for (const pos of result) {
      expect(Math.abs(pos.x)).toBeLessThan(50);
      expect(Math.abs(pos.y)).toBeLessThan(50);
      expect(Math.abs(pos.z)).toBeLessThan(50);
    }
  });

  it('output is deterministic', () => {
    const inputs = makeInputs(15);
    expect(computeSpiralLayout(inputs)).toEqual(computeSpiralLayout(inputs));
  });
});
