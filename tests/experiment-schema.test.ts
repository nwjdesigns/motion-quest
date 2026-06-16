import { describe, test, expect } from 'vitest';
import { experimentSchema } from '../src/schemas/experiment';

const validExperiment = {
  title: 'Particle Grid',
  date: new Date('2026-06-15'),
  description: 'Cursor-reactive dot matrix',
  scene: 'particle-grid.cv',
  thumbnail: 'particle-grid.png',
};

describe('experiment schema', () => {
  test('accepts valid frontmatter with all required fields', () => {
    const result = experimentSchema.safeParse(validExperiment);
    expect(result.success).toBe(true);
  });

  test('accepts valid frontmatter with optional stripeLink', () => {
    const result = experimentSchema.safeParse({
      ...validExperiment,
      stripeLink: 'https://buy.stripe.com/xxx',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stripeLink).toBe('https://buy.stripe.com/xxx');
    }
  });

  test('accepts valid frontmatter without stripeLink', () => {
    const result = experimentSchema.safeParse(validExperiment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stripeLink).toBeUndefined();
    }
  });

  test('rejects missing title', () => {
    const { title, ...rest } = validExperiment;
    const result = experimentSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  test('rejects missing date', () => {
    const { date, ...rest } = validExperiment;
    const result = experimentSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  test('rejects missing description', () => {
    const { description, ...rest } = validExperiment;
    const result = experimentSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  test('rejects missing scene', () => {
    const { scene, ...rest } = validExperiment;
    const result = experimentSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  test('rejects missing thumbnail', () => {
    const { thumbnail, ...rest } = validExperiment;
    const result = experimentSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  test('rejects non-string title', () => {
    const result = experimentSchema.safeParse({ ...validExperiment, title: 42 });
    expect(result.success).toBe(false);
  });

  test('rejects non-date date', () => {
    const result = experimentSchema.safeParse({ ...validExperiment, date: 'not a date' });
    expect(result.success).toBe(false);
  });

  test('defaults tools to empty array when not provided', () => {
    const result = experimentSchema.safeParse(validExperiment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tools).toEqual([]);
    }
  });

  test('accepts tools as array of strings', () => {
    const result = experimentSchema.safeParse({
      ...validExperiment,
      tools: ['Basic Shape', 'Duplicator', 'Pathfinder'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tools).toEqual(['Basic Shape', 'Duplicator', 'Pathfinder']);
    }
  });

  test('accepts optional cavalryVersion string', () => {
    const result = experimentSchema.safeParse({
      ...validExperiment,
      cavalryVersion: '2.0.3',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cavalryVersion).toBe('2.0.3');
    }
  });

  test('accepts optional license string', () => {
    const result = experimentSchema.safeParse({
      ...validExperiment,
      license: 'CC BY',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.license).toBe('CC BY');
    }
  });

  test('defaults aspectRatio to 16/9 when not provided', () => {
    const result = experimentSchema.safeParse(validExperiment);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.aspectRatio).toBeCloseTo(16 / 9);
    }
  });

  test('accepts aspectRatio as a number', () => {
    const result = experimentSchema.safeParse({
      ...validExperiment,
      aspectRatio: 9 / 16,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.aspectRatio).toBeCloseTo(9 / 16);
    }
  });
});
