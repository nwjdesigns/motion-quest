import { describe, test, expect } from 'vitest';
import {
  computeProximityGraph,
  type ProximityConnection,
} from '../src/lib/proximity';

describe('computeProximityGraph', () => {
  const thumbnails = [
    { x: 0, y: 0, z: 0 },
    { x: 3, y: 0, z: 0 },
    { x: 6, y: 0, z: 0 },
    { x: 10, y: 0, z: 0 },
  ];

  test('returns empty connections when cursor is far from all thumbnails', () => {
    const result = computeProximityGraph(
      thumbnails,
      { x: 100, y: 100, z: 100 },
      5,
    );
    expect(result.cursorToThumbnail).toHaveLength(0);
    expect(result.thumbnailToThumbnail).toHaveLength(0);
  });

  test('returns empty connections with no thumbnails', () => {
    const result = computeProximityGraph([], { x: 0, y: 0, z: 0 }, 5);
    expect(result.cursorToThumbnail).toHaveLength(0);
    expect(result.thumbnailToThumbnail).toHaveLength(0);
  });

  test('connects cursor to thumbnails within radius', () => {
    const result = computeProximityGraph(
      thumbnails,
      { x: 1, y: 0, z: 0 },
      4,
    );
    const indices = result.cursorToThumbnail.map((c) => c.index);
    expect(indices).toContain(0);
    expect(indices).toContain(1);
    expect(indices).not.toContain(2);
    expect(indices).not.toContain(3);
  });

  test('does not connect cursor to thumbnails outside radius', () => {
    const result = computeProximityGraph(
      thumbnails,
      { x: 0, y: 0, z: 0 },
      2,
    );
    const indices = result.cursorToThumbnail.map((c) => c.index);
    expect(indices).toContain(0);
    expect(indices).not.toContain(1);
    expect(indices).not.toContain(2);
    expect(indices).not.toContain(3);
  });

  test('connects thumbnails that are both within cursor radius', () => {
    const result = computeProximityGraph(
      thumbnails,
      { x: 1.5, y: 0, z: 0 },
      5,
    );
    const pairs = result.thumbnailToThumbnail.map((c) => [c.indexA, c.indexB]);
    expect(pairs).toContainEqual([0, 1]);
  });

  test('does not connect thumbnails when only one is in cursor radius', () => {
    const result = computeProximityGraph(
      thumbnails,
      { x: 0, y: 0, z: 0 },
      2,
    );
    expect(result.thumbnailToThumbnail).toHaveLength(0);
  });

  test('cursor-to-thumbnail opacity is 1 at distance 0', () => {
    const result = computeProximityGraph(
      [{ x: 5, y: 0, z: 0 }],
      { x: 5, y: 0, z: 0 },
      4,
    );
    expect(result.cursorToThumbnail).toHaveLength(1);
    expect(result.cursorToThumbnail[0].opacity).toBe(1);
  });

  test('cursor-to-thumbnail opacity decreases with distance', () => {
    const result = computeProximityGraph(
      [{ x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }],
      { x: 0, y: 0, z: 0 },
      5,
    );
    const close = result.cursorToThumbnail.find((c) => c.index === 0)!;
    const far = result.cursorToThumbnail.find((c) => c.index === 1)!;
    expect(close.opacity).toBeGreaterThan(far.opacity);
  });

  test('cursor-to-thumbnail opacity is between 0 and 1', () => {
    const result = computeProximityGraph(thumbnails, { x: 1, y: 0, z: 0 }, 8);
    for (const c of result.cursorToThumbnail) {
      expect(c.opacity).toBeGreaterThan(0);
      expect(c.opacity).toBeLessThanOrEqual(1);
    }
  });

  test('thumbnail-to-thumbnail opacity is between 0 and 1', () => {
    const result = computeProximityGraph(
      thumbnails,
      { x: 3, y: 0, z: 0 },
      8,
    );
    for (const c of result.thumbnailToThumbnail) {
      expect(c.opacity).toBeGreaterThan(0);
      expect(c.opacity).toBeLessThanOrEqual(1);
    }
  });

  test('thumbnail-to-thumbnail pairs are not duplicated (A-B, not also B-A)', () => {
    const result = computeProximityGraph(
      thumbnails,
      { x: 3, y: 0, z: 0 },
      8,
    );
    const seen = new Set<string>();
    for (const c of result.thumbnailToThumbnail) {
      const key = `${Math.min(c.indexA, c.indexB)}-${Math.max(c.indexA, c.indexB)}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  test('works in 3D (not just X axis)', () => {
    const points = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 3, z: 4 },
    ];
    const result = computeProximityGraph(points, { x: 0, y: 1, z: 1 }, 6);
    expect(result.cursorToThumbnail).toHaveLength(2);
    expect(result.thumbnailToThumbnail).toHaveLength(1);
  });
});
