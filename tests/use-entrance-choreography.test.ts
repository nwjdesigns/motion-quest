// @vitest-environment jsdom
import { describe, test, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useEntranceChoreography,
  buildHomepageEntrancePlan,
} from '../src/hooks/useEntranceChoreography';

function mockMatchMedia(reducedMotion: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduced-motion') ? reducedMotion : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('buildHomepageEntrancePlan', () => {
  test('produces one entry per node plus chrome and particles', () => {
    const plan = buildHomepageEntrancePlan(3);
    const ids = plan.map((e) => e.id);
    expect(ids).toContain('topbar');
    expect(ids).toContain('footer');
    expect(ids).toContain('node-0');
    expect(ids).toContain('node-1');
    expect(ids).toContain('node-2');
    expect(ids).toContain('particles');
  });

  test('handles zero nodes (no node entries)', () => {
    const plan = buildHomepageEntrancePlan(0);
    const ids = plan.map((e) => e.id);
    expect(ids).toContain('topbar');
    expect(ids).toContain('footer');
    expect(ids).toContain('particles');
    expect(ids.some((id) => id.startsWith('node-'))).toBe(false);
  });
});

describe('useEntranceChoreography', () => {
  test('when returning (mq-camera present), entrance is skipped: everything visible at t=0', () => {
    mockMatchMedia(false);
    sessionStorage.setItem('mq-camera', '{"some":"state"}');
    const { result } = renderHook(() => useEntranceChoreography(2));
    expect(result.current.skipped).toBe(true);
    expect(result.current.progressFor('topbar')).toBe(1);
    expect(result.current.progressFor('node-0')).toBe(1);
    expect(result.current.progressFor('particles')).toBe(1);
  });

  test('when prefers-reduced-motion, entrance is skipped: everything visible at t=0', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useEntranceChoreography(2));
    expect(result.current.skipped).toBe(true);
    expect(result.current.progressFor('topbar')).toBe(1);
    expect(result.current.progressFor('node-1')).toBe(1);
  });

  test('on a fresh load, elements start hidden (progress 0) before their start time', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useEntranceChoreography(2));
    expect(result.current.skipped).toBe(false);
    // Nothing has elapsed yet: every element fully hidden.
    expect(result.current.progressFor('topbar')).toBe(0);
    expect(result.current.progressFor('footer')).toBe(0);
    expect(result.current.progressFor('node-0')).toBe(0);
    expect(result.current.progressFor('particles')).toBe(0);
  });

  test('progressFor returns 1 for an unknown id (fail-open, no invisible element)', () => {
    mockMatchMedia(false);
    sessionStorage.setItem('mq-camera', '{"s":1}');
    const { result } = renderHook(() => useEntranceChoreography(1));
    expect(result.current.progressFor('does-not-exist')).toBe(1);
  });

  test('advancing the clock raises progress for the first element', () => {
    mockMatchMedia(false);
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const rafCbs: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCbs.push(cb);
      return rafCbs.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});

    // performance.now() === 0 at mount, so the clock is anchored at 0.
    const { result } = renderHook(() => useEntranceChoreography(2));
    // topbar starts at t=0; push the clock well past its duration.
    act(() => {
      now = 5000;
      const cb = rafCbs.shift();
      cb?.(now);
    });
    expect(result.current.progressFor('topbar')).toBe(1);
  });
});
