import { describe, test, expect } from 'vitest';
import { buildPlayerUrl } from '../src/lib/player';

describe('buildPlayerUrl', () => {
  test('constructs player URL with scene path and base', () => {
    const url = buildPlayerUrl('particle-grid.cv', '/motion-quest');
    expect(url).toBe('/motion-quest/cavalry/player.html?scene=/motion-quest/cavalry/scenes/particle-grid.cv');
  });

  test('constructs player URL with no base path', () => {
    const url = buildPlayerUrl('particle-grid.cv', '');
    expect(url).toBe('/cavalry/player.html?scene=/cavalry/scenes/particle-grid.cv');
  });

  test('handles scene filename with spaces', () => {
    const url = buildPlayerUrl('my scene.cv', '/motion-quest');
    expect(url).toBe('/motion-quest/cavalry/player.html?scene=/motion-quest/cavalry/scenes/my%20scene.cv');
  });

  test('strips leading slash from scene if present', () => {
    const url = buildPlayerUrl('/particle-grid.cv', '/motion-quest');
    expect(url).toBe('/motion-quest/cavalry/player.html?scene=/motion-quest/cavalry/scenes/particle-grid.cv');
  });
});
