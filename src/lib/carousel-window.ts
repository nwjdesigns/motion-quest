export interface CarouselWindowInput {
  /** Index of the active item within the full collection (0-based). */
  currentIndex: number;
  /** Total number of items in the collection. */
  totalCount: number;
  /** Number of dots visible at once. Defaults to 7. */
  windowSize?: number;
}

export interface CarouselWindowResult {
  /** Contiguous, in-bounds collection indices that should render as dots. */
  visibleIndices: number[];
  /** Slot (0-based, within visibleIndices) that holds the active dot, or -1 if empty. */
  activeIndex: number;
  /** Size multiplier per visible slot. Symmetric curve, centre = 1.0. */
  scales: number[];
}

/**
 * Pure sliding-window engine for the carousel dot indicator.
 *
 * The window slides to keep the active dot centred. At the start/end of the
 * collection the window pins to the edge, so the active dot shifts off-centre
 * rather than producing negative indices or overflowing past totalCount - 1.
 *
 * Scaling rules:
 * - If totalCount < windowSize, all dots render at scale 1.0 (no depth curve).
 * - Otherwise a symmetric curve runs from the centre slot (1.0) out to the
 *   edges (smallest), giving the depth effect.
 */
export function computeCarouselWindow(
  input: CarouselWindowInput,
): CarouselWindowResult {
  const windowSize = input.windowSize ?? 7;
  const { currentIndex, totalCount } = input;

  if (totalCount <= 0) {
    return { visibleIndices: [], activeIndex: -1, scales: [] };
  }

  // Small collection: show every dot, no scaling curve.
  if (totalCount < windowSize) {
    const visibleIndices = Array.from({ length: totalCount }, (_, i) => i);
    return {
      visibleIndices,
      activeIndex: clamp(currentIndex, 0, totalCount - 1),
      scales: visibleIndices.map(() => 1.0),
    };
  }

  // Centre the window on the active index, then clamp to collection bounds so
  // there are no negative indices and no overflow past totalCount - 1.
  const half = Math.floor(windowSize / 2);
  let start = currentIndex - half;
  start = clamp(start, 0, totalCount - windowSize);

  const visibleIndices = Array.from(
    { length: windowSize },
    (_, i) => start + i,
  );
  const activeIndex = clamp(currentIndex, 0, totalCount - 1) - start;

  return {
    visibleIndices,
    activeIndex,
    scales: buildScaleCurve(windowSize),
  };
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Symmetric size-multiplier curve across the window.
 * Centre slot is 1.0; multipliers fall off smoothly (cosine ease) toward the
 * edges, bottoming out at MIN_SCALE. For windowSize 7 this yields a curve like
 * [0.5, ~0.65, ~0.87, 1.0, ~0.87, ~0.65, 0.5].
 */
function buildScaleCurve(windowSize: number): number[] {
  const MIN_SCALE = 0.5;
  const centre = (windowSize - 1) / 2;
  const maxDistance = centre === 0 ? 1 : centre;

  return Array.from({ length: windowSize }, (_, i) => {
    const distance = Math.abs(i - centre) / maxDistance; // 0 at centre, 1 at edge
    // Cosine ease: 1.0 at distance 0, MIN_SCALE at distance 1.
    const eased = (Math.cos(distance * Math.PI) + 1) / 2; // 1 -> 0
    return MIN_SCALE + (1 - MIN_SCALE) * eased;
  });
}
