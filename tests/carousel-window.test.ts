import { describe, test, expect } from 'vitest';
import { computeCarouselWindow } from '../src/lib/carousel-window';

describe('computeCarouselWindow', () => {
  test('centre-active: window centred on the active index in a large collection', () => {
    const result = computeCarouselWindow({
      currentIndex: 10,
      totalCount: 20,
      windowSize: 7,
    });
    // active is centred: window covers 7..13
    expect(result.visibleIndices).toEqual([7, 8, 9, 10, 11, 12, 13]);
    // active sits at the centre slot (index 3 of 0..6)
    expect(result.activeIndex).toBe(3);
    expect(result.visibleIndices[result.activeIndex]).toBe(10);
  });

  test('edge-start: at index 0 the active dot shifts off-centre, no negative indices', () => {
    const result = computeCarouselWindow({
      currentIndex: 0,
      totalCount: 20,
      windowSize: 7,
    });
    expect(result.visibleIndices).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(result.visibleIndices.every((i) => i >= 0)).toBe(true);
    expect(result.activeIndex).toBe(0);
    expect(result.visibleIndices[result.activeIndex]).toBe(0);
  });

  test('edge-start: index 1 still pins window to start (no negative indices)', () => {
    const result = computeCarouselWindow({
      currentIndex: 1,
      totalCount: 20,
      windowSize: 7,
    });
    expect(result.visibleIndices).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(result.activeIndex).toBe(1);
  });

  test('edge-end: at last index the active dot shifts off-centre, no overflow', () => {
    const result = computeCarouselWindow({
      currentIndex: 19,
      totalCount: 20,
      windowSize: 7,
    });
    expect(result.visibleIndices).toEqual([13, 14, 15, 16, 17, 18, 19]);
    expect(result.visibleIndices.every((i) => i <= 19)).toBe(true);
    expect(result.activeIndex).toBe(6);
    expect(result.visibleIndices[result.activeIndex]).toBe(19);
  });

  test('edge-end: second-to-last index still pins window to the end', () => {
    const result = computeCarouselWindow({
      currentIndex: 18,
      totalCount: 20,
      windowSize: 7,
    });
    expect(result.visibleIndices).toEqual([13, 14, 15, 16, 17, 18, 19]);
    expect(result.activeIndex).toBe(5);
  });

  test('scale-curve symmetry: scales mirror around the centre slot', () => {
    const { scales } = computeCarouselWindow({
      currentIndex: 10,
      totalCount: 20,
      windowSize: 7,
    });
    expect(scales.length).toBe(7);
    for (let i = 0; i < scales.length; i++) {
      const mirror = scales.length - 1 - i;
      expect(scales[i]).toBeCloseTo(scales[mirror], 10);
    }
  });

  test('scale-curve: centre slot is the largest, edges the smallest, monotonic from centre out', () => {
    const { scales } = computeCarouselWindow({
      currentIndex: 10,
      totalCount: 20,
      windowSize: 7,
    });
    const centre = (scales.length - 1) / 2;
    // centre is the max
    expect(scales[centre]).toBe(Math.max(...scales));
    // edges are the min
    expect(scales[0]).toBe(Math.min(...scales));
    expect(scales[scales.length - 1]).toBe(Math.min(...scales));
    // monotonically decreasing from centre to each edge
    for (let i = centre; i < scales.length - 1; i++) {
      expect(scales[i]).toBeGreaterThanOrEqual(scales[i + 1]);
    }
    for (let i = centre; i > 0; i--) {
      expect(scales[i]).toBeGreaterThanOrEqual(scales[i - 1]);
    }
  });

  test('scale-curve: centre multiplier is 1.0, edge multiplier is below 1', () => {
    const { scales } = computeCarouselWindow({
      currentIndex: 10,
      totalCount: 20,
      windowSize: 7,
    });
    expect(scales[3]).toBe(1.0);
    expect(scales[0]).toBeLessThan(1.0);
    expect(scales[0]).toBeGreaterThan(0);
  });

  test('scales are always positive', () => {
    const { scales } = computeCarouselWindow({
      currentIndex: 5,
      totalCount: 30,
      windowSize: 7,
    });
    expect(scales.every((s) => s > 0)).toBe(true);
  });

  test('elongation / active marker: window output identifies which slot is the active (elongated) dot', () => {
    const result = computeCarouselWindow({
      currentIndex: 4,
      totalCount: 20,
      windowSize: 7,
    });
    // activeIndex must point at the slot holding currentIndex
    expect(result.visibleIndices[result.activeIndex]).toBe(4);
  });

  test('small collection: total below window size shows all dots without scaling', () => {
    const result = computeCarouselWindow({
      currentIndex: 2,
      totalCount: 4,
      windowSize: 7,
    });
    expect(result.visibleIndices).toEqual([0, 1, 2, 3]);
    expect(result.activeIndex).toBe(2);
    // no scaling: every multiplier is 1.0
    expect(result.scales).toEqual([1.0, 1.0, 1.0, 1.0]);
  });

  test('small collection: exactly window size shows all dots, still scaled', () => {
    const result = computeCarouselWindow({
      currentIndex: 3,
      totalCount: 7,
      windowSize: 7,
    });
    expect(result.visibleIndices).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(result.activeIndex).toBe(3);
    expect(result.scales.length).toBe(7);
    // scaled (not all 1.0) because total === windowSize
    expect(result.scales[0]).toBeLessThan(1.0);
  });

  test('default window size is 7 when omitted', () => {
    const result = computeCarouselWindow({ currentIndex: 10, totalCount: 20 });
    expect(result.visibleIndices.length).toBe(7);
  });

  test('single-item collection: one dot, active, no scaling', () => {
    const result = computeCarouselWindow({
      currentIndex: 0,
      totalCount: 1,
      windowSize: 7,
    });
    expect(result.visibleIndices).toEqual([0]);
    expect(result.activeIndex).toBe(0);
    expect(result.scales).toEqual([1.0]);
  });

  test('empty collection: no dots', () => {
    const result = computeCarouselWindow({
      currentIndex: 0,
      totalCount: 0,
      windowSize: 7,
    });
    expect(result.visibleIndices).toEqual([]);
    expect(result.scales).toEqual([]);
    expect(result.activeIndex).toBe(-1);
  });

  test('even window size keeps the active centred toward the left-of-centre slot', () => {
    const result = computeCarouselWindow({
      currentIndex: 10,
      totalCount: 20,
      windowSize: 6,
    });
    expect(result.visibleIndices.length).toBe(6);
    expect(result.visibleIndices[result.activeIndex]).toBe(10);
    // window stays within bounds
    expect(result.visibleIndices.every((i) => i >= 0 && i < 20)).toBe(true);
  });

  test('window never produces indices outside [0, totalCount-1] across the whole collection', () => {
    const totalCount = 25;
    for (let i = 0; i < totalCount; i++) {
      const { visibleIndices, activeIndex } = computeCarouselWindow({
        currentIndex: i,
        totalCount,
        windowSize: 7,
      });
      expect(visibleIndices.length).toBe(7);
      expect(visibleIndices.every((idx) => idx >= 0 && idx < totalCount)).toBe(
        true,
      );
      // strictly increasing, contiguous
      for (let k = 1; k < visibleIndices.length; k++) {
        expect(visibleIndices[k]).toBe(visibleIndices[k - 1] + 1);
      }
      // active slot maps back to the current index
      expect(visibleIndices[activeIndex]).toBe(i);
    }
  });
});
