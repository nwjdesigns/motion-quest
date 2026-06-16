// Pure logic for turning a Cavalry Control Centre attribute into a description
// the renderer can draw, with no DOM or WASM dependencies so it can be unit
// tested. The player passes in each attribute's definition (from
// getAttributeDefinition) and current value (from getAttribute); this module
// decides which widget to draw and pre-computes display strings and slider
// fills. Keeping it side-effect free is what lets the player and the tests
// share one source of truth.

const clampChannel = (n) => Math.max(0, Math.min(255, Math.round(n)));

export function colorToHex(color) {
  const r = clampChannel(color.r).toString(16).padStart(2, '0');
  const g = clampChannel(color.g).toString(16).padStart(2, '0');
  const b = clampChannel(color.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export function hexToColor(hex, alpha = 255) {
  const clean = String(hex).replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
    a: alpha,
  };
}

// Convert an 0..255 rgb object to hsv (h: 0..360, s/v: 0..1) and back. The
// custom colour picker drives a saturation/value square + hue strip, so it
// works in hsv and only converts to rgb when writing to the scene.
export function rgbToHsv({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / d + 2);
    else h = 60 * ((rn - gn) / d + 4);
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

export function hsvToRgb(h, s, v) {
  h = ((h % 360) + 360) % 360;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rp = 0, gp = 0, bp = 0;
  if (h < 60) { rp = c; gp = x; }
  else if (h < 120) { rp = x; gp = c; }
  else if (h < 180) { gp = c; bp = x; }
  else if (h < 240) { gp = x; bp = c; }
  else if (h < 300) { rp = x; bp = c; }
  else { rp = c; bp = x; }
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

// Prefer hard (enforced) bounds, fall back to soft (suggested) bounds, and
// allow one hard + one soft so a half-open Cavalry range still yields a slider.
export function resolveRange(numericInfo = {}) {
  const ni = numericInfo || {};
  const min = ni.hasHardMin ? ni.hardMin : ni.hasSoftMin ? ni.softMin : null;
  const max = ni.hasHardMax ? ni.hardMax : ni.hasSoftMax ? ni.softMax : null;
  if (min === null || max === null) return null;
  return { min, max };
}

export function computeFillPct(value, min, max) {
  if (max <= min) return 0;
  const pct = (value - min) / (max - min);
  return Math.max(0, Math.min(1, pct));
}

export function formatNumber(value, isInt) {
  if (!Number.isFinite(value)) return '0';
  if (isInt) return String(Math.round(value));
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

const NUMERIC_TYPES = ['double', 'int', 'float', 'number'];
const POSITION_TYPES = ['double2', 'int2', 'double3', 'int3'];

export function describeControl({ layerId, attrId, name, definition, value }) {
  const def = definition || {};
  const type = def.type;
  const label = name || attrId;
  const base = { layerId, attrId, label, type };

  const enumValues = toArray(def.enumValues);
  if (enumValues.length > 0) {
    return {
      ...base,
      kind: 'menu',
      options: enumValues,
      selectedIndex: typeof value === 'number' ? value : enumValues.indexOf(value),
    };
  }

  if (POSITION_TYPES.includes(type)) {
    return { ...base, kind: 'position' };
  }

  if (type === 'color') {
    return { ...base, kind: 'color', hex: colorToHex(value || { r: 0, g: 0, b: 0 }), alpha: value?.a ?? 255 };
  }

  if (type === 'bool') {
    return { ...base, kind: 'toggle', on: Boolean(value) };
  }

  if (type === 'string' || type === 'richText') {
    return { ...base, kind: 'text', value: value == null ? '' : String(value), multiline: Boolean(def.multiline) };
  }

  if (NUMERIC_TYPES.includes(type)) {
    const isInt = type === 'int';
    const range = resolveRange(def.numericInfo);
    const step = numericStep(def.numericInfo, isInt);
    const display = formatNumber(Number(value), isInt);
    if (range) {
      return {
        ...base,
        kind: 'slider',
        value: Number(value),
        min: range.min,
        max: range.max,
        step,
        isInt,
        fillPct: computeFillPct(Number(value), range.min, range.max),
        display,
      };
    }
    return { ...base, kind: 'scrubber', value: Number(value), step, isInt, display };
  }

  return { ...base, kind: 'unsupported' };
}

function numericStep(numericInfo, isInt) {
  const step = numericInfo?.step;
  if (step && step > 0) return step;
  return isInt ? 1 : 0.1;
}

function toArray(maybeVector) {
  if (!maybeVector) return [];
  if (Array.isArray(maybeVector)) return maybeVector;
  if (typeof maybeVector.size === 'function') {
    return Array.from({ length: maybeVector.size() }, (_, i) => maybeVector.get(i));
  }
  return [];
}

const RENDERABLE = new Set(['color', 'toggle', 'menu', 'slider', 'scrubber', 'text']);

export function shouldRender(descriptor) {
  return RENDERABLE.has(descriptor?.kind);
}
