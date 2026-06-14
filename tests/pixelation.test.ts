import { describe, test, expect } from 'vitest';
import { computePixelationLevel } from '../src/lib/pixelation';

describe('computePixelationLevel', () => {
  const defaultThreshold = 0.3;
  const defaultFalloff = 2.0;

  test('returns 0 at viewport centre (distance = 0)', () => {
    expect(computePixelationLevel(0, defaultThreshold, defaultFalloff)).toBe(0);
  });

  test('returns 0 within the threshold radius', () => {
    expect(computePixelationLevel(0.1, defaultThreshold, defaultFalloff)).toBe(0);
    expect(computePixelationLevel(0.29, defaultThreshold, defaultFalloff)).toBe(0);
  });

  test('returns 0 exactly at the threshold boundary', () => {
    expect(computePixelationLevel(defaultThreshold, defaultThreshold, defaultFalloff)).toBe(0);
  });

  test('returns > 0 just past the threshold', () => {
    const level = computePixelationLevel(0.31, defaultThreshold, defaultFalloff);
    expect(level).toBeGreaterThan(0);
  });

  test('increases monotonically with distance beyond threshold', () => {
    const a = computePixelationLevel(0.4, defaultThreshold, defaultFalloff);
    const b = computePixelationLevel(0.6, defaultThreshold, defaultFalloff);
    const c = computePixelationLevel(0.8, defaultThreshold, defaultFalloff);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });

  test('returns 1 at distance = 1 (full edge)', () => {
    expect(computePixelationLevel(1, defaultThreshold, defaultFalloff)).toBe(1);
  });

  test('clamps to 1 for distances beyond 1', () => {
    expect(computePixelationLevel(1.5, defaultThreshold, defaultFalloff)).toBe(1);
    expect(computePixelationLevel(3, defaultThreshold, defaultFalloff)).toBe(1);
  });

  test('clamps negative distances to 0', () => {
    expect(computePixelationLevel(-0.5, defaultThreshold, defaultFalloff)).toBe(0);
  });

  test('higher falloff produces steeper curve (more pixelation near threshold)', () => {
    const midDistance = 0.5;
    const lowFalloff = computePixelationLevel(midDistance, defaultThreshold, 1.0);
    const highFalloff = computePixelationLevel(midDistance, defaultThreshold, 4.0);
    expect(highFalloff).toBeGreaterThan(lowFalloff);
  });

  test('larger threshold delays pixelation onset', () => {
    const distance = 0.5;
    const smallThreshold = computePixelationLevel(distance, 0.2, defaultFalloff);
    const largeThreshold = computePixelationLevel(distance, 0.4, defaultFalloff);
    expect(smallThreshold).toBeGreaterThan(largeThreshold);
  });

  test('threshold of 0 means pixelation starts immediately', () => {
    const level = computePixelationLevel(0.01, 0, defaultFalloff);
    expect(level).toBeGreaterThan(0);
  });

  test('threshold of 1 means no pixelation anywhere in [0,1]', () => {
    expect(computePixelationLevel(0.5, 1, defaultFalloff)).toBe(0);
    expect(computePixelationLevel(0.99, 1, defaultFalloff)).toBe(0);
    expect(computePixelationLevel(1, 1, defaultFalloff)).toBe(0);
  });

  test('result is always in [0, 1] range for any valid inputs', () => {
    const distances = [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1.0];
    const thresholds = [0, 0.2, 0.5, 0.8];
    const falloffs = [0.5, 1, 2, 5];

    for (const d of distances) {
      for (const t of thresholds) {
        for (const f of falloffs) {
          const level = computePixelationLevel(d, t, f);
          expect(level).toBeGreaterThanOrEqual(0);
          expect(level).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});
