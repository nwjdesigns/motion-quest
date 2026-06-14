import { describe, it, expect } from 'vitest';
import { resolveThemeMessage } from '../public/cavalry/player-theme.js';

describe('resolveThemeMessage', () => {
  it('returns the theme for a valid light theme-change message', () => {
    expect(resolveThemeMessage({ type: 'theme-change', theme: 'light' })).toBe('light');
  });

  it('returns the theme for a valid dark theme-change message', () => {
    expect(resolveThemeMessage({ type: 'theme-change', theme: 'dark' })).toBe('dark');
  });

  it('ignores an unknown theme value', () => {
    expect(resolveThemeMessage({ type: 'theme-change', theme: 'rainbow' })).toBeNull();
  });

  it('ignores messages that are not theme-change', () => {
    expect(resolveThemeMessage({ type: 'something-else', theme: 'light' })).toBeNull();
  });

  it('ignores malformed message data without throwing', () => {
    expect(resolveThemeMessage(null)).toBeNull();
    expect(resolveThemeMessage(undefined)).toBeNull();
    expect(resolveThemeMessage('light')).toBeNull();
    expect(resolveThemeMessage(42)).toBeNull();
  });
});
