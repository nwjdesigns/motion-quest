import { describe, test, expect, beforeEach } from 'vitest';
import {
  resolveInitialTheme,
  getThemeColors,
  getCssVariables,
  buildThemedPlayerUrl,
  type Theme,
} from '../src/lib/theme';

describe('resolveInitialTheme', () => {
  test('returns "dark" when localStorage has "dark"', () => {
    expect(resolveInitialTheme('dark', false)).toBe('dark');
  });

  test('returns "light" when localStorage has "light"', () => {
    expect(resolveInitialTheme('light', false)).toBe('light');
  });

  test('returns "dark" when no stored value and system prefers dark', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
  });

  test('returns "light" when no stored value and system prefers light', () => {
    expect(resolveInitialTheme(null, false)).toBe('light');
  });

  test('ignores system preference when stored value exists', () => {
    expect(resolveInitialTheme('light', true)).toBe('light');
    expect(resolveInitialTheme('dark', false)).toBe('dark');
  });
});

describe('getThemeColors', () => {
  test('dark theme returns dark background and light-tinted accents', () => {
    const colors = getThemeColors('dark');
    expect(colors.background).toBe('#0a0a0a');
    expect(colors.particleColor).toBeDefined();
    expect(colors.lineColor).toBeDefined();
    expect(colors.panelText).toBeDefined();
  });

  test('light theme returns light background and dark-tinted accents', () => {
    const colors = getThemeColors('light');
    expect(colors.background).toBe('#f5f5f5');
    expect(colors.particleColor).toBeDefined();
    expect(colors.lineColor).toBeDefined();
    expect(colors.panelText).toBeDefined();
  });

  test('dark and light themes have different backgrounds', () => {
    const dark = getThemeColors('dark');
    const light = getThemeColors('light');
    expect(dark.background).not.toBe(light.background);
  });

  test('dark and light themes have different line colors', () => {
    const dark = getThemeColors('dark');
    const light = getThemeColors('light');
    expect(dark.lineColor).not.toBe(light.lineColor);
  });
});

describe('getCssVariables', () => {
  test('returns object with expected CSS variable keys for dark theme', () => {
    const vars = getCssVariables('dark');
    expect(vars['--mq-bg']).toBeDefined();
    expect(vars['--mq-text']).toBeDefined();
    expect(vars['--mq-text-muted']).toBeDefined();
    expect(vars['--mq-panel-bg']).toBeDefined();
    expect(vars['--mq-panel-border']).toBeDefined();
  });

  test('returns object with expected CSS variable keys for light theme', () => {
    const vars = getCssVariables('light');
    expect(vars['--mq-bg']).toBeDefined();
    expect(vars['--mq-text']).toBeDefined();
    expect(vars['--mq-text-muted']).toBeDefined();
    expect(vars['--mq-panel-bg']).toBeDefined();
    expect(vars['--mq-panel-border']).toBeDefined();
  });

  test('dark theme has dark background variable', () => {
    const vars = getCssVariables('dark');
    expect(vars['--mq-bg']).toBe('#0a0a0a');
  });

  test('light theme has light background variable', () => {
    const vars = getCssVariables('light');
    expect(vars['--mq-bg']).toBe('#f5f5f5');
  });
});

describe('buildThemedPlayerUrl', () => {
  test('appends theme=dark param to player URL', () => {
    const url = buildThemedPlayerUrl('/cavalry/player.html?scene=/cavalry/scenes/exp-01.cav', 'dark');
    expect(url).toContain('theme=dark');
  });

  test('appends theme=light param to player URL', () => {
    const url = buildThemedPlayerUrl('/cavalry/player.html?scene=/cavalry/scenes/exp-01.cav', 'light');
    expect(url).toContain('theme=light');
  });

  test('preserves existing query parameters', () => {
    const url = buildThemedPlayerUrl('/cavalry/player.html?scene=/cavalry/scenes/exp-01.cav', 'dark');
    expect(url).toContain('scene=');
    expect(url).toContain('theme=dark');
  });

  test('handles URL with no existing query params', () => {
    const url = buildThemedPlayerUrl('/cavalry/player.html', 'light');
    expect(url).toBe('/cavalry/player.html?theme=light');
  });
});
