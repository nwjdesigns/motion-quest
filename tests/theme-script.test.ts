import { describe, test, expect } from 'vitest';
import { generateThemeScript } from '../src/lib/theme-script';

describe('generateThemeScript', () => {
  test('returns a string containing localStorage check', () => {
    const script = generateThemeScript();
    expect(script).toContain('localStorage');
  });

  test('returns a string containing prefers-color-scheme check', () => {
    const script = generateThemeScript();
    expect(script).toContain('prefers-color-scheme');
  });

  test('sets data-theme attribute on documentElement', () => {
    const script = generateThemeScript();
    expect(script).toContain('document.documentElement');
    expect(script).toContain('data-theme');
  });

  test('is a self-contained IIFE', () => {
    const script = generateThemeScript();
    expect(script.trim()).toMatch(/^\(function/);
    expect(script.trim()).toMatch(/\}\)\(\);?$/);
  });
});
