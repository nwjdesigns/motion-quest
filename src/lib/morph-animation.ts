import type { ScreenRect } from './morph';
import { CHROME_EXIT_MS, MORPH_MS, DETAIL_ENTER_MS } from './transition-orchestrator';

/** CSS easing for the thumbnail-to-fullscreen morph */
export const MORPH_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export interface MorphKeyframe {
  left: string;
  top: string;
  width: string;
  height: string;
  borderRadius: string;
  opacity: string;
}

/**
 * Build WAAPI keyframes for animating a snapshot image from its
 * source rect (where the node was on screen) to fill the viewport.
 */
export function buildMorphKeyframes(
  source: ScreenRect,
  viewportWidth: number,
  viewportHeight: number,
): [MorphKeyframe, MorphKeyframe] {
  return [
    {
      left: `${source.x}px`,
      top: `${source.y}px`,
      width: `${source.width}px`,
      height: `${source.height}px`,
      borderRadius: '4px',
      opacity: '1',
    },
    {
      left: '0px',
      top: '0px',
      width: `${viewportWidth}px`,
      height: `${viewportHeight}px`,
      borderRadius: '0px',
      opacity: '1',
    },
  ];
}

export interface ChromeTransitionStyle {
  opacity: string;
  transform: string;
  transition: string;
}

/** CSS properties to apply when chrome should exit (fade out + slide) */
export function buildChromeExitStyle(): ChromeTransitionStyle {
  return {
    opacity: '0',
    transform: 'translateY(-8px)',
    transition: `opacity ${CHROME_EXIT_MS}ms ${MORPH_EASING}, transform ${CHROME_EXIT_MS}ms ${MORPH_EASING}`,
  };
}

/** CSS properties to apply when chrome should enter (fade in + slide to rest) */
export function buildChromeEnterStyle(): ChromeTransitionStyle {
  return {
    opacity: '1',
    transform: 'translateY(0)',
    transition: `opacity ${DETAIL_ENTER_MS}ms ${MORPH_EASING}, transform ${DETAIL_ENTER_MS}ms ${MORPH_EASING}`,
  };
}
