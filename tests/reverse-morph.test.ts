import { describe, it, expect } from 'vitest';
import {
  predictTargetRect,
  createReverseTransition,
  advanceReverse,
  isReverseTransitioning,
  type ReverseTransitionState,
  type ReverseTransitionPhase,
} from '../src/lib/reverse-morph';
import type { ScreenRect } from '../src/lib/morph';
import type { CameraState } from '../src/lib/camera-state';

// --- Target position prediction ---

// An identity matrix projects world coords directly to NDC.
const IDENTITY: number[] = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];

const experiments = [
  { id: 'alpha', index: 0 },
  { id: 'beta', index: 1 },
  { id: 'gamma', index: 2 },
];

describe('predictTargetRect', () => {
  it('returns null for unknown slug', () => {
    const result = predictTargetRect({
      slug: 'nonexistent',
      experiments,
      layoutMode: 'constellation',
      viewProjectionMatrix: IDENTITY,
      viewportWidth: 800,
      viewportHeight: 600,
    });
    expect(result).toBeNull();
  });

  it('returns a ScreenRect for a known slug in constellation mode', () => {
    const result = predictTargetRect({
      slug: 'alpha',
      experiments,
      layoutMode: 'constellation',
      viewProjectionMatrix: IDENTITY,
      viewportWidth: 800,
      viewportHeight: 600,
    });
    expect(result).not.toBeNull();
    expect(result!.width).toBeGreaterThan(0);
    expect(result!.height).toBeGreaterThan(0);
  });

  it('returns a ScreenRect for a known slug in grid mode', () => {
    const result = predictTargetRect({
      slug: 'beta',
      experiments,
      layoutMode: 'grid',
      viewProjectionMatrix: IDENTITY,
      viewportWidth: 800,
      viewportHeight: 600,
    });
    expect(result).not.toBeNull();
    expect(result!.width).toBeGreaterThan(0);
    expect(result!.height).toBeGreaterThan(0);
  });

  it('returns a ScreenRect for a known slug in spiral mode', () => {
    const result = predictTargetRect({
      slug: 'gamma',
      experiments,
      layoutMode: 'spiral',
      viewProjectionMatrix: IDENTITY,
      viewportWidth: 800,
      viewportHeight: 600,
    });
    expect(result).not.toBeNull();
    expect(result!.width).toBeGreaterThan(0);
    expect(result!.height).toBeGreaterThan(0);
  });

  it('produces different rects for different slugs', () => {
    const alphaRect = predictTargetRect({
      slug: 'alpha',
      experiments,
      layoutMode: 'constellation',
      viewProjectionMatrix: IDENTITY,
      viewportWidth: 800,
      viewportHeight: 600,
    });
    const betaRect = predictTargetRect({
      slug: 'beta',
      experiments,
      layoutMode: 'constellation',
      viewProjectionMatrix: IDENTITY,
      viewportWidth: 800,
      viewportHeight: 600,
    });
    expect(alphaRect).not.toBeNull();
    expect(betaRect).not.toBeNull();
    // Different slugs must produce different positions (same layout, same camera)
    const samePos =
      Math.abs(alphaRect!.x - betaRect!.x) < 0.01 &&
      Math.abs(alphaRect!.y - betaRect!.y) < 0.01;
    expect(samePos).toBe(false);
  });

  it('uses the node half-extents matching ExperimentNode plane area', () => {
    // ExperimentNode uses planeArea = 1.6 * 0.9 = 1.44
    // For a 16:9 aspect (the default fallback): width = sqrt(1.44 * 16/9) = 1.6, height = 0.9
    // Half extents: 0.8 x 0.45
    // With identity matrix, rect width should match the projected plane width
    const result = predictTargetRect({
      slug: 'alpha',
      experiments: [{ id: 'alpha', index: 0 }],
      layoutMode: 'grid',
      viewProjectionMatrix: IDENTITY,
      viewportWidth: 800,
      viewportHeight: 600,
    });
    expect(result).not.toBeNull();
    // With grid layout, single item at origin: center at (0,0,0)
    // NDC x: [-0.8, 0.8] -> screen: [80, 720] -> width 640
    // NDC y: [-0.45, 0.45] -> screen: [165, 435] -> height 270
    expect(result!.width).toBeCloseTo(640, 0);
    expect(result!.height).toBeCloseTo(270, 0);
  });

  it('returns empty experiments list safely', () => {
    const result = predictTargetRect({
      slug: 'alpha',
      experiments: [],
      layoutMode: 'constellation',
      viewProjectionMatrix: IDENTITY,
      viewportWidth: 800,
      viewportHeight: 600,
    });
    expect(result).toBeNull();
  });

  it('is deterministic (same inputs produce same output)', () => {
    const params = {
      slug: 'beta',
      experiments,
      layoutMode: 'constellation' as const,
      viewProjectionMatrix: IDENTITY,
      viewportWidth: 1920,
      viewportHeight: 1080,
    };
    const a = predictTargetRect(params);
    const b = predictTargetRect(params);
    expect(a).toEqual(b);
  });
});

// --- Reverse transition orchestrator ---

describe('createReverseTransition', () => {
  const sourceRect: ScreenRect = { x: 200, y: 100, width: 640, height: 360 };
  const targetRect: ScreenRect = { x: 400, y: 300, width: 160, height: 90 };

  it('creates a transition in chrome-exiting phase', () => {
    const state = createReverseTransition(sourceRect, targetRect, 'test-slug');
    expect(state.phase).toBe('chrome-exiting');
    expect(state.slug).toBe('test-slug');
    expect(state.sourceRect).toEqual(sourceRect);
    expect(state.targetRect).toEqual(targetRect);
  });

  it('starts as transitioning (isReverseTransitioning)', () => {
    const state = createReverseTransition(sourceRect, targetRect, 'test-slug');
    expect(isReverseTransitioning(state)).toBe(true);
  });
});

describe('advanceReverse', () => {
  const sourceRect: ScreenRect = { x: 200, y: 100, width: 640, height: 360 };
  const targetRect: ScreenRect = { x: 400, y: 300, width: 160, height: 90 };

  it('advances chrome-exiting to transitioning', () => {
    const state = createReverseTransition(sourceRect, targetRect, 'slug');
    const next = advanceReverse(state);
    expect(next.phase).toBe('transitioning');
  });

  it('advances transitioning to constellation-rebuilding', () => {
    let state = createReverseTransition(sourceRect, targetRect, 'slug');
    state = advanceReverse(state); // -> transitioning
    const next = advanceReverse(state);
    expect(next.phase).toBe('constellation-rebuilding');
  });

  it('advances constellation-rebuilding to node-receiving', () => {
    let state = createReverseTransition(sourceRect, targetRect, 'slug');
    state = advanceReverse(state); // -> transitioning
    state = advanceReverse(state); // -> constellation-rebuilding
    const next = advanceReverse(state);
    expect(next.phase).toBe('node-receiving');
  });

  it('advances node-receiving to complete', () => {
    let state = createReverseTransition(sourceRect, targetRect, 'slug');
    state = advanceReverse(state); // -> transitioning
    state = advanceReverse(state); // -> constellation-rebuilding
    state = advanceReverse(state); // -> node-receiving
    const next = advanceReverse(state);
    expect(next.phase).toBe('complete');
  });

  it('stays at complete when advanced again', () => {
    let state = createReverseTransition(sourceRect, targetRect, 'slug');
    state = advanceReverse(state); // -> transitioning
    state = advanceReverse(state); // -> constellation-rebuilding
    state = advanceReverse(state); // -> node-receiving
    state = advanceReverse(state); // -> complete
    const next = advanceReverse(state);
    expect(next.phase).toBe('complete');
  });

  it('is not transitioning at complete', () => {
    let state = createReverseTransition(sourceRect, targetRect, 'slug');
    state = advanceReverse(state);
    state = advanceReverse(state);
    state = advanceReverse(state);
    state = advanceReverse(state);
    expect(isReverseTransitioning(state)).toBe(false);
  });

  it('preserves sourceRect and targetRect through all phases', () => {
    let state = createReverseTransition(sourceRect, targetRect, 'slug');
    for (let i = 0; i < 4; i++) {
      state = advanceReverse(state);
      expect(state.sourceRect).toEqual(sourceRect);
      expect(state.targetRect).toEqual(targetRect);
    }
  });

  it('preserves slug through all phases', () => {
    let state = createReverseTransition(sourceRect, targetRect, 'my-slug');
    for (let i = 0; i < 4; i++) {
      state = advanceReverse(state);
      expect(state.slug).toBe('my-slug');
    }
  });
});

describe('isReverseTransitioning', () => {
  const sourceRect: ScreenRect = { x: 0, y: 0, width: 800, height: 600 };
  const targetRect: ScreenRect = { x: 300, y: 200, width: 160, height: 90 };

  it('returns true for chrome-exiting', () => {
    const state = createReverseTransition(sourceRect, targetRect, 's');
    expect(isReverseTransitioning(state)).toBe(true);
  });

  it('returns true for transitioning', () => {
    let state = createReverseTransition(sourceRect, targetRect, 's');
    state = advanceReverse(state);
    expect(isReverseTransitioning(state)).toBe(true);
  });

  it('returns true for constellation-rebuilding', () => {
    let state = createReverseTransition(sourceRect, targetRect, 's');
    state = advanceReverse(state);
    state = advanceReverse(state);
    expect(isReverseTransitioning(state)).toBe(true);
  });

  it('returns true for node-receiving', () => {
    let state = createReverseTransition(sourceRect, targetRect, 's');
    state = advanceReverse(state);
    state = advanceReverse(state);
    state = advanceReverse(state);
    expect(isReverseTransitioning(state)).toBe(true);
  });

  it('returns false for complete', () => {
    let state = createReverseTransition(sourceRect, targetRect, 's');
    state = advanceReverse(state);
    state = advanceReverse(state);
    state = advanceReverse(state);
    state = advanceReverse(state);
    expect(isReverseTransitioning(state)).toBe(false);
  });
});
