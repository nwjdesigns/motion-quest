// @vitest-environment jsdom
import { describe, test, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { ThemeProvider, useTheme } from '../src/components/ThemeContext';

describe('ThemeContext', () => {
  function wrapper({ children }: { children: React.ReactNode }) {
    return createElement(ThemeProvider, { initialTheme: 'dark' }, children);
  }

  test('provides the initial theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('dark');
  });

  test('provides theme colors matching the current theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.colors.background).toBe('#0a0a0a');
  });

  test('toggleTheme switches from dark to light', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('light');
    expect(result.current.colors.background).toBe('#f5f5f5');
  });

  test('toggleTheme switches from light back to dark', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.toggleTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
  });

  test('setTheme sets a specific theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme('light'));
    expect(result.current.theme).toBe('light');
  });

  test('initializes with light theme when specified', () => {
    function lightWrapper({ children }: { children: React.ReactNode }) {
      return createElement(ThemeProvider, { initialTheme: 'light' }, children);
    }
    const { result } = renderHook(() => useTheme(), { wrapper: lightWrapper });
    expect(result.current.theme).toBe('light');
    expect(result.current.colors.background).toBe('#f5f5f5');
  });
});
