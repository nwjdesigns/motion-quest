import { describe, test, expect } from 'vitest';
import {
  buildMorphKeyframes,
  MORPH_EASING,
  buildChromeExitStyle,
  buildChromeEnterStyle,
} from '../src/lib/morph-animation';
import type { ScreenRect } from '../src/lib/morph';

const sourceRect: ScreenRect = { x: 100, y: 200, width: 160, height: 90 };

describe('morph-animation', () => {
  describe('buildMorphKeyframes', () => {
    test('returns two keyframes (start and end)', () => {
      const kf = buildMorphKeyframes(sourceRect, 1920, 1080);
      expect(kf).toHaveLength(2);
    });

    test('start keyframe matches source rect position and size', () => {
      const kf = buildMorphKeyframes(sourceRect, 1920, 1080);
      const start = kf[0];
      expect(start.left).toBe('100px');
      expect(start.top).toBe('200px');
      expect(start.width).toBe('160px');
      expect(start.height).toBe('90px');
    });

    test('end keyframe fills viewport', () => {
      const kf = buildMorphKeyframes(sourceRect, 1920, 1080);
      const end = kf[1];
      expect(end.left).toBe('0px');
      expect(end.top).toBe('0px');
      expect(end.width).toBe('1920px');
      expect(end.height).toBe('1080px');
    });

    test('start keyframe has borderRadius, end has none', () => {
      const kf = buildMorphKeyframes(sourceRect, 1920, 1080);
      expect(kf[0].borderRadius).toBe('4px');
      expect(kf[1].borderRadius).toBe('0px');
    });

    test('both keyframes have opacity 1', () => {
      const kf = buildMorphKeyframes(sourceRect, 1920, 1080);
      expect(kf[0].opacity).toBe('1');
      expect(kf[1].opacity).toBe('1');
    });

    test('works with different viewport sizes', () => {
      const kf = buildMorphKeyframes(sourceRect, 375, 667);
      const end = kf[1];
      expect(end.width).toBe('375px');
      expect(end.height).toBe('667px');
    });
  });

  describe('MORPH_EASING', () => {
    test('is a valid CSS easing string', () => {
      expect(typeof MORPH_EASING).toBe('string');
      expect(MORPH_EASING.length).toBeGreaterThan(0);
    });
  });

  describe('buildChromeExitStyle', () => {
    test('returns opacity 0 and a transform', () => {
      const style = buildChromeExitStyle();
      expect(style.opacity).toBe('0');
      expect(style.transform).toBeDefined();
    });

    test('includes transition property', () => {
      const style = buildChromeExitStyle();
      expect(style.transition).toBeDefined();
      expect(style.transition).toContain('ms');
    });
  });

  describe('buildChromeEnterStyle', () => {
    test('returns opacity 1 and identity transform', () => {
      const style = buildChromeEnterStyle();
      expect(style.opacity).toBe('1');
      expect(style.transform).toBeDefined();
    });

    test('includes transition property', () => {
      const style = buildChromeEnterStyle();
      expect(style.transition).toBeDefined();
    });
  });
});
