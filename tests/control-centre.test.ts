import { describe, it, expect } from 'vitest';
import {
  colorToHex,
  hexToColor,
  rgbToHsv,
  hsvToRgb,
  resolveRange,
  computeFillPct,
  formatNumber,
  describeControl,
  shouldRender,
} from '../public/cavalry/control-centre.js';

describe('colorToHex', () => {
  it('formats an rgb object as a 6-digit hex string', () => {
    expect(colorToHex({ r: 217, g: 217, b: 217, a: 255 })).toBe('#d9d9d9');
  });

  it('zero-pads single-digit channels', () => {
    expect(colorToHex({ r: 0, g: 5, b: 16 })).toBe('#000510');
  });

  it('clamps out-of-range channels into 00..ff', () => {
    expect(colorToHex({ r: -10, g: 300, b: 128 })).toBe('#00ff80');
  });
});

describe('hexToColor', () => {
  it('parses a #rrggbb string into an rgb object, preserving alpha', () => {
    expect(hexToColor('#d9d9d9', 255)).toEqual({ r: 217, g: 217, b: 217, a: 255 });
  });

  it('accepts hex without the leading hash', () => {
    expect(hexToColor('000510', 128)).toEqual({ r: 0, g: 5, b: 16, a: 128 });
  });

  it('returns null for a malformed hex string', () => {
    expect(hexToColor('#fff', 255)).toBeNull();
    expect(hexToColor('nope', 255)).toBeNull();
  });
});

describe('rgbToHsv / hsvToRgb', () => {
  it('converts primary colours to hsv', () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, v: 1 });
    expect(rgbToHsv({ r: 0, g: 255, b: 0 })).toMatchObject({ h: 120, s: 1, v: 1 });
    expect(rgbToHsv({ r: 0, g: 0, b: 255 })).toMatchObject({ h: 240, s: 1, v: 1 });
  });

  it('reports zero saturation and value for black and greys', () => {
    expect(rgbToHsv({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, v: 0 });
    const grey = rgbToHsv({ r: 128, g: 128, b: 128 });
    expect(grey.s).toBe(0);
    expect(grey.v).toBeCloseTo(0.502, 3);
  });

  it('converts hsv back to rgb for primaries', () => {
    expect(hsvToRgb(0, 1, 1)).toEqual({ r: 255, g: 0, b: 0 });
    expect(hsvToRgb(120, 1, 1)).toEqual({ r: 0, g: 255, b: 0 });
    expect(hsvToRgb(240, 1, 1)).toEqual({ r: 0, g: 0, b: 255 });
    expect(hsvToRgb(0, 0, 1)).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('round-trips an arbitrary colour within rounding tolerance', () => {
    const rgb = { r: 46, g: 125, b: 50 };
    const hsv = rgbToHsv(rgb);
    expect(hsv.h).toBeCloseTo(123, 0);
    const back = hsvToRgb(hsv.h, hsv.s, hsv.v);
    expect(back).toEqual(rgb);
  });

  it('wraps negative and oversized hues', () => {
    expect(hsvToRgb(-360, 1, 1)).toEqual({ r: 255, g: 0, b: 0 });
    expect(hsvToRgb(480, 1, 1)).toEqual({ r: 0, g: 255, b: 0 });
  });
});

describe('resolveRange', () => {
  it('prefers hard min/max when both present', () => {
    expect(
      resolveRange({ hasHardMin: true, hardMin: 0, hasHardMax: true, hardMax: 10 })
    ).toEqual({ min: 0, max: 10 });
  });

  it('falls back to soft bounds when hard ones are absent', () => {
    expect(
      resolveRange({ hasHardMin: false, hasSoftMin: true, softMin: 1, hasHardMax: false, hasSoftMax: true, softMax: 5 })
    ).toEqual({ min: 1, max: 5 });
  });

  it('mixes a hard min with a soft max', () => {
    expect(
      resolveRange({ hasHardMin: true, hardMin: 0, hasSoftMax: true, softMax: 500 })
    ).toEqual({ min: 0, max: 500 });
  });

  it('returns null when neither bound is available (unbounded attribute)', () => {
    expect(
      resolveRange({ hasHardMin: false, hasSoftMin: false, hasHardMax: false, hasSoftMax: false })
    ).toBeNull();
  });
});

describe('computeFillPct', () => {
  it('maps a value to a 0..1 fraction of its range', () => {
    expect(computeFillPct(347, 0, 500)).toBeCloseTo(0.694, 3);
  });

  it('clamps below-min to 0 and above-max to 1', () => {
    expect(computeFillPct(-5, 0, 10)).toBe(0);
    expect(computeFillPct(99, 0, 10)).toBe(1);
  });

  it('returns 0 for a zero-width range rather than dividing by zero', () => {
    expect(computeFillPct(5, 5, 5)).toBe(0);
  });
});

describe('formatNumber', () => {
  it('renders integers without decimals', () => {
    expect(formatNumber(347, true)).toBe('347');
    expect(formatNumber(3, false)).toBe('3');
  });

  it('trims trailing zeros from doubles', () => {
    expect(formatNumber(1.5, false)).toBe('1.5');
    expect(formatNumber(2.0, false)).toBe('2');
  });

  it('rounds long decimals to two places', () => {
    expect(formatNumber(184.23456, false)).toBe('184.23');
  });
});

describe('describeControl', () => {
  const color = describeControl({
    layerId: 'compNode#134', attrId: 'backgroundColor', name: 'backgroundColor',
    definition: { type: 'color', numericInfo: {}, enumValues: [] },
    value: { r: 217, g: 217, b: 217, a: 255 },
  });

  it('classifies a color attribute and exposes its hex', () => {
    expect(color.kind).toBe('color');
    expect(color.hex).toBe('#d9d9d9');
    expect(color.label).toBe('backgroundColor');
  });

  it('classifies a bounded numeric as a slider with fill percentage', () => {
    const d = describeControl({
      layerId: 'l', attrId: 'radius', name: 'Radius',
      definition: { type: 'double', numericInfo: { hasHardMin: true, hardMin: 0, hasHardMax: true, hardMax: 500 }, enumValues: [] },
      value: 347,
    });
    expect(d.kind).toBe('slider');
    expect(d.min).toBe(0);
    expect(d.max).toBe(500);
    expect(d.fillPct).toBeCloseTo(0.694, 3);
    expect(d.display).toBe('347');
  });

  it('classifies an unbounded numeric as a scrubber', () => {
    const d = describeControl({
      layerId: 'stagger#15', attrId: 'strength', name: 'strength',
      definition: { type: 'double', numericInfo: {}, enumValues: [] },
      value: 184,
    });
    expect(d.kind).toBe('scrubber');
    expect(d.display).toBe('184');
  });

  it('classifies a bool as a toggle', () => {
    const d = describeControl({
      layerId: 'l', attrId: 'inverted', name: 'Inverted',
      definition: { type: 'bool', numericInfo: {}, enumValues: [] },
      value: false,
    });
    expect(d.kind).toBe('toggle');
    expect(d.on).toBe(false);
  });

  it('classifies an attribute with enum values as a menu regardless of base type', () => {
    const d = describeControl({
      layerId: 'l', attrId: 'shape', name: 'Shape',
      definition: { type: 'int', numericInfo: {}, enumValues: ['Circle', 'HalfCircle', 'Square'] },
      value: 1,
    });
    expect(d.kind).toBe('menu');
    expect(d.options).toEqual(['Circle', 'HalfCircle', 'Square']);
    expect(d.selectedIndex).toBe(1);
  });

  it('classifies a string as a text control', () => {
    const d = describeControl({
      layerId: 'l', attrId: 'caption', name: 'Caption',
      definition: { type: 'string', numericInfo: {}, enumValues: [] },
      value: 'hello',
    });
    expect(d.kind).toBe('text');
    expect(d.value).toBe('hello');
  });

  it('marks position attributes (cursor-driven) as position kind', () => {
    const d = describeControl({
      layerId: 'l', attrId: 'pos', name: 'Position',
      definition: { type: 'double2', numericInfo: {}, enumValues: [] },
      value: [0, 0],
    });
    expect(d.kind).toBe('position');
  });

  it('marks an unknown type as unsupported', () => {
    const d = describeControl({
      layerId: 'l', attrId: 'mystery', name: 'Mystery',
      definition: { type: 'gradient', numericInfo: {}, enumValues: [] },
      value: null,
    });
    expect(d.kind).toBe('unsupported');
  });
});

describe('shouldRender', () => {
  it('renders interactive controls', () => {
    expect(shouldRender({ kind: 'color' })).toBe(true);
    expect(shouldRender({ kind: 'slider' })).toBe(true);
    expect(shouldRender({ kind: 'menu' })).toBe(true);
  });

  it('skips position (cursor-driven) and unsupported controls', () => {
    expect(shouldRender({ kind: 'position' })).toBe(false);
    expect(shouldRender({ kind: 'unsupported' })).toBe(false);
  });
});
