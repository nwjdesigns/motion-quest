import { describe, test, expect } from 'vitest';
import { generateParticles, type Particle } from '../src/lib/particles';

describe('generateParticles', () => {
  test('returns the requested number of particles', () => {
    const particles = generateParticles(50);
    expect(particles).toHaveLength(50);
  });

  test('returns empty array for count 0', () => {
    expect(generateParticles(0)).toEqual([]);
  });

  test('each particle has position and scale', () => {
    const particles = generateParticles(10);
    for (const p of particles) {
      expect(p).toHaveProperty('x');
      expect(p).toHaveProperty('y');
      expect(p).toHaveProperty('z');
      expect(p).toHaveProperty('scale');
      expect(typeof p.x).toBe('number');
      expect(typeof p.y).toBe('number');
      expect(typeof p.z).toBe('number');
      expect(typeof p.scale).toBe('number');
    }
  });

  test('positions are within the default volume bounds', () => {
    const particles = generateParticles(200);
    for (const p of particles) {
      expect(Math.abs(p.x)).toBeLessThanOrEqual(15);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(15);
      expect(Math.abs(p.z)).toBeLessThanOrEqual(15);
    }
  });

  test('positions respect custom volume spread', () => {
    const particles = generateParticles(200, { spread: 5 });
    for (const p of particles) {
      expect(Math.abs(p.x)).toBeLessThanOrEqual(5);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(5);
      expect(Math.abs(p.z)).toBeLessThanOrEqual(5);
    }
  });

  test('scales fall within default range [0.02, 0.08]', () => {
    const particles = generateParticles(200);
    for (const p of particles) {
      expect(p.scale).toBeGreaterThanOrEqual(0.02);
      expect(p.scale).toBeLessThanOrEqual(0.08);
    }
  });

  test('scales respect custom min/max', () => {
    const particles = generateParticles(200, { minScale: 0.1, maxScale: 0.5 });
    for (const p of particles) {
      expect(p.scale).toBeGreaterThanOrEqual(0.1);
      expect(p.scale).toBeLessThanOrEqual(0.5);
    }
  });

  test('scales are not all identical (variance exists)', () => {
    const particles = generateParticles(50);
    const scales = new Set(particles.map((p) => p.scale));
    expect(scales.size).toBeGreaterThan(1);
  });

  test('positions are not all identical (distribution exists)', () => {
    const particles = generateParticles(50);
    const xs = new Set(particles.map((p) => p.x));
    const ys = new Set(particles.map((p) => p.y));
    expect(xs.size).toBeGreaterThan(1);
    expect(ys.size).toBeGreaterThan(1);
  });

  test('same seed produces identical results', () => {
    const a = generateParticles(30, { seed: 42 });
    const b = generateParticles(30, { seed: 42 });
    expect(a).toEqual(b);
  });

  test('different seeds produce different results', () => {
    const a = generateParticles(30, { seed: 42 });
    const b = generateParticles(30, { seed: 99 });
    const samePositions = a.every(
      (p, i) => p.x === b[i].x && p.y === b[i].y && p.z === b[i].z,
    );
    expect(samePositions).toBe(false);
  });
});
