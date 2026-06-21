// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useMarkBehaviour } from '../src/hooks/useMarkBehaviour';
import { HOMEPAGE_SCALE, DETAIL_SCALE, IDLE_DEG_PER_SEC } from '../src/lib/mark-engine';

afterEach(cleanup);

describe('useMarkBehaviour', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let now = 0;

  beforeEach(() => {
    rafCallbacks = [];
    now = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Advance the rAF loop by `ms`, flushing one frame. */
  function tick(ms: number) {
    now += ms;
    const cbs = rafCallbacks;
    rafCallbacks = [];
    act(() => {
      cbs.forEach((cb) => cb(now));
    });
  }

  test('exposes an initial output at idle / homepage scale', () => {
    const { result } = renderHook(() => useMarkBehaviour({ targetScale: HOMEPAGE_SCALE }));
    expect(result.current.rotationAngle).toBe(0);
    expect(result.current.scale).toBe(HOMEPAGE_SCALE);
  });

  test('rotation advances over animation frames', () => {
    const { result } = renderHook(() => useMarkBehaviour({ targetScale: HOMEPAGE_SCALE }));
    tick(0); // establish baseline timestamp
    for (let i = 0; i < 60; i++) tick(1000 / 60); // ~1 second of real frames
    expect(result.current.rotationAngle).toBeGreaterThan(IDLE_DEG_PER_SEC - 1);
  });

  test('scale eases toward a detail target', () => {
    const { result, rerender } = renderHook(
      ({ targetScale }) => useMarkBehaviour({ targetScale }),
      { initialProps: { targetScale: HOMEPAGE_SCALE } },
    );
    tick(0);
    rerender({ targetScale: DETAIL_SCALE });
    for (let i = 0; i < 60; i++) tick(1000 / 60);
    expect(result.current.scale).toBeLessThan(HOMEPAGE_SCALE);
    expect(result.current.scale).toBeCloseTo(DETAIL_SCALE, 0);
  });

  test('cancels its animation frame on unmount', () => {
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = renderHook(() => useMarkBehaviour({ targetScale: HOMEPAGE_SCALE }));
    tick(0);
    unmount();
    expect(cancel).toHaveBeenCalled();
  });

  test('orbit velocity supplied via setOrbitVelocity speeds the mark up', () => {
    const { result } = renderHook(() => useMarkBehaviour({ targetScale: HOMEPAGE_SCALE }));
    tick(0);
    act(() => result.current.setOrbitVelocity(0.1));
    for (let i = 0; i < 60; i++) tick(1000 / 60);
    // velocity is consumed per-frame; mark should have spun faster than pure idle
    expect(result.current.rotationAngle).toBeGreaterThan(IDLE_DEG_PER_SEC);
  });

  test('triggerNav arms a burst', () => {
    const { result } = renderHook(() => useMarkBehaviour({ targetScale: HOMEPAGE_SCALE }));
    tick(0);
    const before = result.current.rotationAngle;
    act(() => result.current.triggerNav('forward'));
    tick(1000 / 60);
    // a forward burst pushes rotation past the idle baseline quickly
    expect(result.current.rotationAngle).toBeGreaterThan(before);
  });
});
