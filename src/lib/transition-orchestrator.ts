import type { ScreenRect } from './morph';

// --- State definitions ---

export const TRANSITION_STATES = [
  'idle',
  'snapshot-placed',
  'chrome-exiting',
  'transitioning',
  'detail-entering',
  'complete',
] as const;

export type TransitionState = (typeof TRANSITION_STATES)[number];

export interface TransitionContext {
  state: TransitionState;
  slug: string | null;
  sourceRect: ScreenRect | null;
  thumbnailUrl: string | null;
}

// --- Timing constants (ms) ---

/** How long chrome (TopBar, FooterBar) takes to exit */
export const CHROME_EXIT_MS = 200;

/** How long the thumbnail-to-fullscreen morph animation takes */
export const MORPH_MS = 400;

/** How long detail page chrome takes to enter after morph lands */
export const DETAIL_ENTER_MS = 300;

// --- Factory ---

export function createTransition(
  init?: Partial<Pick<TransitionContext, 'slug' | 'sourceRect' | 'thumbnailUrl'>>,
): TransitionContext {
  return {
    state: 'idle',
    slug: init?.slug ?? null,
    sourceRect: init?.sourceRect ?? null,
    thumbnailUrl: init?.thumbnailUrl ?? null,
  };
}

// --- State machine ---

/**
 * Pure advance function. Returns the next state if entry conditions are met,
 * otherwise returns the same state. Never mutates the input.
 */
export function advance(ctx: TransitionContext): TransitionContext {
  switch (ctx.state) {
    case 'idle': {
      // Entry condition for snapshot-placed: need slug, sourceRect, thumbnailUrl
      if (ctx.slug && ctx.sourceRect && ctx.thumbnailUrl) {
        return { ...ctx, state: 'snapshot-placed' };
      }
      return { ...ctx };
    }
    case 'snapshot-placed':
      return { ...ctx, state: 'chrome-exiting' };
    case 'chrome-exiting':
      return { ...ctx, state: 'transitioning' };
    case 'transitioning':
      return { ...ctx, state: 'detail-entering' };
    case 'detail-entering':
      return { ...ctx, state: 'complete' };
    case 'complete':
      // Terminal state
      return { ...ctx };
    default:
      return { ...ctx };
  }
}

// --- Helpers ---

/** Whether the orchestrator is actively mid-transition (not idle or complete) */
export function isTransitioning(state: TransitionState): boolean {
  return state !== 'idle' && state !== 'complete';
}

/** Reset to idle, clearing all navigation data */
export function resetTransition(_ctx: TransitionContext): TransitionContext {
  return {
    state: 'idle',
    slug: null,
    sourceRect: null,
    thumbnailUrl: null,
  };
}

/**
 * Fallback: create a ScreenRect centred on the viewport.
 * Used when projectRect() returns null (node off-screen).
 */
export function centreScreenRect(
  viewportWidth: number,
  viewportHeight: number,
): ScreenRect {
  const w = Math.min(160, viewportWidth * 0.2);
  const h = w * (9 / 16); // 16:9 aspect
  return {
    x: (viewportWidth - w) / 2,
    y: (viewportHeight - h) / 2,
    width: w,
    height: h,
  };
}
