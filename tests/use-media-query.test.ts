// @vitest-environment jsdom
import { describe, test, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from '../src/hooks/useMediaQuery';

interface MockMql {
  matches: boolean;
  media: string;
  addEventListener: (event: string, cb: (e: { matches: boolean }) => void) => void;
  removeEventListener: (event: string, cb: (e: { matches: boolean }) => void) => void;
  emit: (matches: boolean) => void;
}

function mockMatchMedia(initialMatches: boolean): MockMql {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  const mql: MockMql = {
    matches: initialMatches,
    media: '',
    addEventListener: (_event, cb) => listeners.add(cb),
    removeEventListener: (_event, cb) => listeners.delete(cb),
    emit: (matches) => {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches }));
    },
  };
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    mql.media = query;
    return mql;
  });
  return mql;
}

describe('useMediaQuery', () => {
  test('returns true when the query initially matches', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(hover: none)'));
    expect(result.current).toBe(true);
  });

  test('returns false when the query does not match', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(hover: none)'));
    expect(result.current).toBe(false);
  });

  test('updates when the media query changes to matching', () => {
    const mql = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(hover: none)'));
    expect(result.current).toBe(false);
    act(() => mql.emit(true));
    expect(result.current).toBe(true);
  });

  test('passes the given query string to matchMedia', () => {
    const mql = mockMatchMedia(false);
    renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(mql.media).toBe('(max-width: 768px)');
  });
});
