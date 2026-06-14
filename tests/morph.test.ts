import { describe, it, expect } from 'vitest';
import { interpolateRect, type ScreenRect } from '../src/lib/morph';

const start: ScreenRect = { x: 100, y: 200, width: 160, height: 90 };
const end: ScreenRect = { x: 0, y: 0, width: 800, height: 600 };

describe('interpolateRect', () => {
  it('returns start rect at progress 0', () => {
    const result = interpolateRect(start, end, 0);
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
    expect(result.width).toBe(160);
    expect(result.height).toBe(90);
  });

  it('returns end rect at progress 1', () => {
    const result = interpolateRect(start, end, 1);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });

  it('returns midpoint at progress 0.5', () => {
    const result = interpolateRect(start, end, 0.5);
    expect(result.x).toBeCloseTo(50, 5);
    expect(result.y).toBeCloseTo(100, 5);
    expect(result.width).toBeCloseTo(480, 5);
    expect(result.height).toBeCloseTo(345, 5);
  });

  it('clamps progress below 0 to start rect', () => {
    const result = interpolateRect(start, end, -0.5);
    expect(result.x).toBe(100);
    expect(result.y).toBe(200);
    expect(result.width).toBe(160);
    expect(result.height).toBe(90);
  });

  it('clamps progress above 1 to end rect', () => {
    const result = interpolateRect(start, end, 1.5);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });

  it('interpolates at progress 0.25', () => {
    const result = interpolateRect(start, end, 0.25);
    // x: 100 + (0 - 100) * 0.25 = 75
    // y: 200 + (0 - 200) * 0.25 = 150
    // w: 160 + (800 - 160) * 0.25 = 320
    // h: 90 + (600 - 90) * 0.25 = 217.5
    expect(result.x).toBeCloseTo(75, 5);
    expect(result.y).toBeCloseTo(150, 5);
    expect(result.width).toBeCloseTo(320, 5);
    expect(result.height).toBeCloseTo(217.5, 5);
  });

  it('handles identical start and end rects', () => {
    const same: ScreenRect = { x: 50, y: 50, width: 100, height: 100 };
    const result = interpolateRect(same, same, 0.5);
    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
  });
});
