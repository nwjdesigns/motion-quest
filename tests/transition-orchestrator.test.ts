import { describe, test, expect } from 'vitest';
import {
  createTransition,
  advance,
  centreScreenRect,
  isTransitioning,
  resetTransition,
  type TransitionState,
  type TransitionContext,
  TRANSITION_STATES,
  CHROME_EXIT_MS,
  MORPH_MS,
  DETAIL_ENTER_MS,
} from '../src/lib/transition-orchestrator';
import type { ScreenRect } from '../src/lib/morph';

const validRect: ScreenRect = { x: 100, y: 200, width: 160, height: 90 };

describe('TransitionOrchestrator', () => {
  describe('TRANSITION_STATES', () => {
    test('defines all six states in the correct order', () => {
      expect(TRANSITION_STATES).toEqual([
        'idle',
        'snapshot-placed',
        'chrome-exiting',
        'transitioning',
        'detail-entering',
        'complete',
      ]);
    });
  });

  describe('createTransition', () => {
    test('creates idle context with defaults', () => {
      const ctx = createTransition();
      expect(ctx.state).toBe('idle');
      expect(ctx.slug).toBeNull();
      expect(ctx.sourceRect).toBeNull();
      expect(ctx.thumbnailUrl).toBeNull();
    });

    test('creates context with initial values', () => {
      const ctx = createTransition({
        slug: 'test-exp',
        sourceRect: validRect,
        thumbnailUrl: '/motion-quest/cavalry/test.png',
      });
      expect(ctx.state).toBe('idle');
      expect(ctx.slug).toBe('test-exp');
      expect(ctx.sourceRect).toEqual(validRect);
      expect(ctx.thumbnailUrl).toBe('/motion-quest/cavalry/test.png');
    });
  });

  describe('advance', () => {
    test('idle -> snapshot-placed: requires slug, sourceRect, thumbnailUrl', () => {
      const ctx = createTransition({
        slug: 'test-exp',
        sourceRect: validRect,
        thumbnailUrl: '/motion-quest/cavalry/test.png',
      });
      const next = advance(ctx);
      expect(next.state).toBe('snapshot-placed');
    });

    test('idle -> idle: stays if missing slug', () => {
      const ctx = createTransition({ sourceRect: validRect, thumbnailUrl: '/img.png' });
      const next = advance(ctx);
      expect(next.state).toBe('idle');
    });

    test('idle -> idle: stays if missing sourceRect', () => {
      const ctx = createTransition({ slug: 'test', thumbnailUrl: '/img.png' });
      const next = advance(ctx);
      expect(next.state).toBe('idle');
    });

    test('idle -> idle: stays if missing thumbnailUrl', () => {
      const ctx = createTransition({ slug: 'test', sourceRect: validRect });
      const next = advance(ctx);
      expect(next.state).toBe('idle');
    });

    test('snapshot-placed -> chrome-exiting: always advances', () => {
      const ctx: TransitionContext = {
        state: 'snapshot-placed',
        slug: 'test',
        sourceRect: validRect,
        thumbnailUrl: '/img.png',
      };
      const next = advance(ctx);
      expect(next.state).toBe('chrome-exiting');
    });

    test('chrome-exiting -> transitioning: always advances', () => {
      const ctx: TransitionContext = {
        state: 'chrome-exiting',
        slug: 'test',
        sourceRect: validRect,
        thumbnailUrl: '/img.png',
      };
      const next = advance(ctx);
      expect(next.state).toBe('transitioning');
    });

    test('transitioning -> detail-entering: always advances', () => {
      const ctx: TransitionContext = {
        state: 'transitioning',
        slug: 'test',
        sourceRect: validRect,
        thumbnailUrl: '/img.png',
      };
      const next = advance(ctx);
      expect(next.state).toBe('detail-entering');
    });

    test('detail-entering -> complete: always advances', () => {
      const ctx: TransitionContext = {
        state: 'detail-entering',
        slug: 'test',
        sourceRect: validRect,
        thumbnailUrl: '/img.png',
      };
      const next = advance(ctx);
      expect(next.state).toBe('complete');
    });

    test('complete -> complete: stays at terminal state', () => {
      const ctx: TransitionContext = {
        state: 'complete',
        slug: 'test',
        sourceRect: validRect,
        thumbnailUrl: '/img.png',
      };
      const next = advance(ctx);
      expect(next.state).toBe('complete');
    });

    test('advance is pure -- does not mutate input', () => {
      const ctx = createTransition({
        slug: 'test',
        sourceRect: validRect,
        thumbnailUrl: '/img.png',
      });
      const frozen = { ...ctx };
      advance(ctx);
      expect(ctx).toEqual(frozen);
    });

    test('full state sequence from idle to complete', () => {
      let ctx = createTransition({
        slug: 'test',
        sourceRect: validRect,
        thumbnailUrl: '/img.png',
      });
      const states: TransitionState[] = [ctx.state];
      while (ctx.state !== 'complete') {
        ctx = advance(ctx);
        states.push(ctx.state);
      }
      expect(states).toEqual([
        'idle',
        'snapshot-placed',
        'chrome-exiting',
        'transitioning',
        'detail-entering',
        'complete',
      ]);
    });

    test('preserves slug and thumbnailUrl through all transitions', () => {
      let ctx = createTransition({
        slug: 'my-experiment',
        sourceRect: validRect,
        thumbnailUrl: '/motion-quest/cavalry/thumb.png',
      });
      while (ctx.state !== 'complete') {
        ctx = advance(ctx);
        expect(ctx.slug).toBe('my-experiment');
        expect(ctx.thumbnailUrl).toBe('/motion-quest/cavalry/thumb.png');
      }
    });
  });

  describe('fallback rect', () => {
    test('centreScreenRect creates a centre-screen rect', () => {
      const rect = centreScreenRect(1920, 1080);
      // Should be centred and reasonably sized
      expect(rect.x).toBeGreaterThan(0);
      expect(rect.y).toBeGreaterThan(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(1920);
      expect(rect.y + rect.height).toBeLessThanOrEqual(1080);
      // Centre check
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      expect(cx).toBeCloseTo(960, 0);
      expect(cy).toBeCloseTo(540, 0);
    });

    test('centreScreenRect handles small viewport', () => {
      const rect = centreScreenRect(320, 480);
      const cx = rect.x + rect.width / 2;
      const cy = rect.y + rect.height / 2;
      expect(cx).toBeCloseTo(160, 0);
      expect(cy).toBeCloseTo(240, 0);
      expect(rect.width).toBeGreaterThan(0);
      expect(rect.height).toBeGreaterThan(0);
    });
  });

  describe('timing constants', () => {
    test('CHROME_EXIT_MS is a positive number', () => {
      expect(CHROME_EXIT_MS).toBeGreaterThan(0);
      expect(typeof CHROME_EXIT_MS).toBe('number');
    });

    test('MORPH_MS is a positive number', () => {
      expect(MORPH_MS).toBeGreaterThan(0);
      expect(typeof MORPH_MS).toBe('number');
    });

    test('DETAIL_ENTER_MS is a positive number', () => {
      expect(DETAIL_ENTER_MS).toBeGreaterThan(0);
      expect(typeof DETAIL_ENTER_MS).toBe('number');
    });

    test('chrome exit is shorter than or equal to morph', () => {
      expect(CHROME_EXIT_MS).toBeLessThanOrEqual(MORPH_MS);
    });
  });

  describe('isTransitioning', () => {
    test('returns false for idle', () => {


      expect(isTransitioning('idle')).toBe(false);
    });

    test('returns false for complete', () => {


      expect(isTransitioning('complete')).toBe(false);
    });

    test('returns true for all intermediate states', () => {


      expect(isTransitioning('snapshot-placed')).toBe(true);
      expect(isTransitioning('chrome-exiting')).toBe(true);
      expect(isTransitioning('transitioning')).toBe(true);
      expect(isTransitioning('detail-entering')).toBe(true);
    });
  });

  describe('reset', () => {
    test('resets any state back to idle', () => {
      const ctx: TransitionContext = {
        state: 'transitioning',
        slug: 'test',
        sourceRect: validRect,
        thumbnailUrl: '/img.png',
      };
      const reset = resetTransition(ctx);
      expect(reset.state).toBe('idle');
      expect(reset.slug).toBeNull();
      expect(reset.sourceRect).toBeNull();
      expect(reset.thumbnailUrl).toBeNull();
    });
  });
});
