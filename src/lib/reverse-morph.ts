import type { ScreenRect } from './morph';
import type { ConstellationInput } from './constellation';
import { computeConstellationLayout } from './constellation';
import { computeGridLayout } from './grid-layout';
import { computeSpiralLayout } from './spiral-layout';
import { projectRect } from './projection';

export type LayoutMode = 'constellation' | 'grid' | 'spiral';

// Node half-extents matching ExperimentNode's planeArea = 1.6 * 0.9 = 1.44
// with a default 16:9 aspect ratio.
const PLANE_AREA = 1.6 * 0.9;
const DEFAULT_ASPECT = 16 / 9;
const PLANE_WIDTH = Math.sqrt(PLANE_AREA * DEFAULT_ASPECT);
const PLANE_HEIGHT = PLANE_AREA / PLANE_WIDTH;
const HALF_EXTENTS = { x: PLANE_WIDTH / 2, y: PLANE_HEIGHT / 2 };

export interface PredictTargetRectParams {
  slug: string;
  experiments: ConstellationInput[];
  layoutMode: LayoutMode;
  viewProjectionMatrix: number[];
  viewportWidth: number;
  viewportHeight: number;
}

/**
 * Predict where a specific experiment node WILL BE once the constellation
 * finishes mounting. Runs the layout algorithm deterministically and projects
 * the result to screen coordinates.
 *
 * Returns null if the slug is not found or experiments is empty.
 */
export function predictTargetRect(params: PredictTargetRectParams): ScreenRect | null {
  const { slug, experiments, layoutMode, viewProjectionMatrix, viewportWidth, viewportHeight } = params;

  if (experiments.length === 0) return null;

  const index = experiments.findIndex((e) => e.id === slug);
  if (index === -1) return null;

  let positions;
  switch (layoutMode) {
    case 'grid':
      positions = computeGridLayout(experiments);
      break;
    case 'spiral':
      positions = computeSpiralLayout(experiments);
      break;
    default:
      positions = computeConstellationLayout(experiments);
      break;
  }

  const worldPos = positions[index];

  return projectRect(
    worldPos,
    HALF_EXTENTS,
    viewProjectionMatrix,
    viewportWidth,
    viewportHeight,
  );
}

// --- Reverse transition orchestrator ---

export type ReverseTransitionPhase =
  | 'chrome-exiting'
  | 'transitioning'
  | 'constellation-rebuilding'
  | 'node-receiving'
  | 'complete';

export interface ReverseTransitionState {
  phase: ReverseTransitionPhase;
  slug: string;
  sourceRect: ScreenRect;
  targetRect: ScreenRect;
}

const PHASE_ORDER: ReverseTransitionPhase[] = [
  'chrome-exiting',
  'transitioning',
  'constellation-rebuilding',
  'node-receiving',
  'complete',
];

export function createReverseTransition(
  sourceRect: ScreenRect,
  targetRect: ScreenRect,
  slug: string,
): ReverseTransitionState {
  return {
    phase: 'chrome-exiting',
    slug,
    sourceRect,
    targetRect,
  };
}

export function advanceReverse(state: ReverseTransitionState): ReverseTransitionState {
  const currentIndex = PHASE_ORDER.indexOf(state.phase);
  const nextIndex = Math.min(currentIndex + 1, PHASE_ORDER.length - 1);
  return {
    ...state,
    phase: PHASE_ORDER[nextIndex],
  };
}

export function isReverseTransitioning(state: ReverseTransitionState): boolean {
  return state.phase !== 'complete';
}
