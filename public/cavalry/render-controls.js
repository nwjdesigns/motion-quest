// Builds the on-scene controls panel inside the player iframe from whatever
// Control Centre attributes a scene exposes. Classification/formatting lives in
// control-centre.js (pure, tested); this file owns the DOM + the WASM writes.
// The panel floats top-right over the canvas as a frosted container, matching
// the Cavalry control aesthetic: one rounded pill row per attribute.

import { describeControl, shouldRender, hexToColor, colorToHex, rgbToHsv, hsvToRgb, formatNumber, computeFillPct } from './control-centre.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function renderControls(player, mountEl, attributePaths, doc = document) {
  mountEl.replaceChildren();
  const descriptors = attributePaths
    .map((path) => buildDescriptor(player, path))
    .filter(Boolean)
    .filter(shouldRender);

  if (descriptors.length === 0) {
    mountEl.classList.add('cc-empty');
    return 0;
  }
  mountEl.classList.remove('cc-empty');

  for (const d of descriptors) {
    const row = el(doc, 'div', 'cc-row');
    const label = el(doc, 'span', 'cc-label');
    label.textContent = d.label;

    const widget = buildWidget(player, d, doc, mountEl);
    if (d.kind === 'slider' || d.kind === 'scrubber') {
      // The track spans the whole row, with label + value sitting on top.
      row.classList.add('cc-row--track');
      row.appendChild(widget.track);
      row.appendChild(label);
      row.appendChild(widget.valueEl);
      attachNumericDrag(player, row, d, widget);
    } else {
      row.appendChild(label);
      row.appendChild(widget);
    }
    mountEl.appendChild(row);
  }
  return descriptors.length;
}

function buildDescriptor(player, path) {
  const [layerId, ...rest] = path.split('.');
  const attrId = rest.join('.');
  try {
    const definition = player.getAttributeDefinition(layerId, attrId);
    const value = player.getAttribute(layerId, attrId);
    const name = safe(() => player.getAttributeName(layerId, attrId)) || attrId;
    return describeControl({ layerId, attrId, name, definition, value });
  } catch {
    return null;
  }
}

function buildWidget(player, d, doc, panel) {
  switch (d.kind) {
    case 'color': return buildColor(player, d, doc, panel);
    case 'toggle': return buildToggle(player, d, doc);
    case 'menu': return buildMenu(player, d, doc);
    case 'text': return buildText(player, d, doc);
    case 'slider':
    case 'scrubber': return buildNumeric(d, doc);
    default: return el(doc, 'span', 'cc-unsupported');
  }
}

// --- color: swatch opens a custom in-panel picker (SV square + hue strip) --
function buildColor(player, d, doc, panel) {
  const wrap = el(doc, 'div', 'cc-color');
  const swatch = el(doc, 'button', 'cc-swatch');
  swatch.type = 'button';
  swatch.setAttribute('aria-label', 'Edit colour');
  swatch.style.background = d.hex;
  wrap.appendChild(swatch);

  const init = rgbToHsv(hexToColor(d.hex, d.alpha) || { r: 0, g: 0, b: 0 });
  let h = init.h, s = init.s, v = init.v;
  let pop = null;
  let onDocPointer = null;

  const commit = () => {
    const rgb = { ...hsvToRgb(h, s, v), a: d.alpha };
    const hex = colorToHex(rgb);
    swatch.style.background = hex;
    if (pop) pop.refresh(h, s, v, hex);
    write(player, d, () => player.setAttribute(d.layerId, d.attrId, rgb));
  };

  const close = () => {
    if (!pop) return;
    pop.el.remove();
    if (onDocPointer) doc.removeEventListener('pointerdown', onDocPointer, true);
    onDocPointer = null;
    pop = null;
  };

  const open = () => {
    pop = buildColorPopover(doc, (nh, ns, nv) => { h = nh; s = ns; v = nv; commit(); });
    panel.appendChild(pop.el);
    const row = wrap.closest('.cc-row');
    pop.el.style.top = (row.offsetTop + row.offsetHeight + 6) + 'px';
    pop.refresh(h, s, v, colorToHex(hsvToRgb(h, s, v)));
    onDocPointer = (e) => {
      if (!pop.el.contains(e.target) && e.target !== swatch) close();
    };
    doc.addEventListener('pointerdown', onDocPointer, true);
  };

  swatch.addEventListener('click', (e) => {
    e.stopPropagation();
    pop ? close() : open();
  });
  return wrap;
}

function buildColorPopover(doc, onChange) {
  const root = el(doc, 'div', 'cc-pop');

  const sv = el(doc, 'div', 'cc-sv');
  const svKnob = el(doc, 'span', 'cc-sv-knob');
  sv.appendChild(svKnob);

  const hue = el(doc, 'div', 'cc-hue');
  const hueKnob = el(doc, 'span', 'cc-hue-knob');
  hue.appendChild(hueKnob);

  const hex = el(doc, 'input', 'cc-hex');
  hex.type = 'text';
  hex.spellcheck = false;
  hex.maxLength = 7;

  root.appendChild(sv);
  root.appendChild(hue);
  root.appendChild(hex);

  let state = { h: 0, s: 1, v: 1 };

  const refresh = (h, s, v, hexStr) => {
    state = { h, s, v };
    sv.style.background = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${h}, 100%, 50%)`;
    svKnob.style.left = (s * 100) + '%';
    svKnob.style.top = ((1 - v) * 100) + '%';
    svKnob.style.background = hexStr;
    hueKnob.style.left = (h / 360 * 100) + '%';
    if (doc.activeElement !== hex) hex.value = hexStr;
  };

  attachDrag(sv, (e) => {
    const r = sv.getBoundingClientRect();
    onChange(state.h, clamp01((e.clientX - r.left) / r.width), clamp01(1 - (e.clientY - r.top) / r.height));
  });
  attachDrag(hue, (e) => {
    const r = hue.getBoundingClientRect();
    onChange(clamp01((e.clientX - r.left) / r.width) * 360, state.s, state.v);
  });

  hex.addEventListener('change', () => {
    const rgb = hexToColor(hex.value, 255);
    if (!rgb) return;
    const hsv = rgbToHsv(rgb);
    onChange(hsv.h, hsv.s, hsv.v);
  });

  return { el: root, refresh };
}

function attachDrag(target, onMove) {
  let active = null;
  target.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    active = e.pointerId;
    onMove(e); // update on the initial press, before capture (which can throw)
    try { target.setPointerCapture?.(e.pointerId); } catch {}
  });
  target.addEventListener('pointermove', (e) => { if (active !== null) onMove(e); });
  const end = () => { active = null; };
  target.addEventListener('pointerup', end);
  target.addEventListener('pointercancel', end);
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

// --- toggle: pill switch ---------------------------------------------------
function buildToggle(player, d, doc) {
  const btn = el(doc, 'button', 'cc-toggle');
  btn.type = 'button';
  btn.setAttribute('role', 'switch');
  let on = d.on;
  const sync = () => {
    btn.classList.toggle('cc-toggle--on', on);
    btn.setAttribute('aria-checked', String(on));
  };
  sync();
  btn.appendChild(el(doc, 'span', 'cc-knob'));
  btn.addEventListener('click', () => {
    on = !on;
    sync();
    write(player, d, () => player.setAttribute(d.layerId, d.attrId, on));
  });
  return btn;
}

// --- menu: styled native select with stacked-chevron indicator -------------
function buildMenu(player, d, doc) {
  const wrap = el(doc, 'div', 'cc-menu');
  const select = el(doc, 'select', 'cc-select');
  d.options.forEach((opt, i) => {
    const o = el(doc, 'option');
    o.value = String(i);
    o.textContent = opt;
    if (i === d.selectedIndex) o.selected = true;
    select.appendChild(o);
  });
  select.addEventListener('change', ({ target }) => {
    write(player, d, () => player.setAttributeEnum(d.layerId, d.attrId, parseInt(target.value, 10)));
  });
  wrap.appendChild(select);
  wrap.appendChild(chevrons(doc));
  return wrap;
}

// --- text ------------------------------------------------------------------
function buildText(player, d, doc) {
  const input = el(doc, 'input', 'cc-text');
  input.type = 'text';
  input.value = d.value;
  input.addEventListener('change', ({ target }) => {
    write(player, d, () => player.setAttribute(d.layerId, d.attrId, target.value));
  });
  return input;
}

// --- numeric: shared track + value for slider and scrubber -----------------
function buildNumeric(d, doc) {
  const track = el(doc, 'span', 'cc-track');
  const fill = el(doc, 'span', 'cc-fill');
  if (d.kind === 'slider') {
    fill.style.width = (d.fillPct * 100) + '%';
    track.classList.add('cc-track--dotted');
  } else {
    fill.style.width = '0%';
    track.classList.add('cc-track--scrub');
  }
  track.appendChild(fill);
  const valueEl = el(doc, 'span', 'cc-value');
  valueEl.textContent = d.display;
  return { track, fill, valueEl };
}

// Pointer drag: sliders map x→[min,max]; scrubbers move by relative delta.
function attachNumericDrag(player, row, d, widget) {
  let current = d.value;
  let startX = 0;
  let startVal = 0;
  let dragging = false;
  let activePointer = null;

  const apply = (v) => {
    current = d.isInt ? Math.round(v) : v;
    widget.valueEl.textContent = formatNumber(current, d.isInt);
    if (d.kind === 'slider') {
      widget.fill.style.width = (computeFillPct(current, d.min, d.max) * 100) + '%';
    }
    write(player, d, () => player.setAttribute(d.layerId, d.attrId, current));
  };

  const onMove = (e) => {
    if (!dragging) return;
    if (d.kind === 'slider') {
      const rect = row.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      apply(d.min + pct * (d.max - d.min));
    } else {
      const dx = e.clientX - startX;
      apply(startVal + dx * d.step);
    }
  };
  const onUp = () => {
    dragging = false;
    if (activePointer !== null) row.releasePointerCapture?.(activePointer);
    row.classList.remove('cc-row--dragging');
  };
  row.addEventListener('pointerdown', (e) => {
    dragging = true;
    activePointer = e.pointerId;
    startX = e.clientX;
    startVal = current;
    row.setPointerCapture?.(e.pointerId);
    row.classList.add('cc-row--dragging');
    if (d.kind === 'slider') onMove(e); // jump to click position
  });
  row.addEventListener('pointermove', onMove);
  row.addEventListener('pointerup', onUp);
  row.addEventListener('pointercancel', onUp);
}

// --- shared helpers --------------------------------------------------------
function chevrons(doc) {
  const svg = doc.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'cc-chevrons');
  svg.setAttribute('viewBox', '0 0 10 16');
  svg.setAttribute('aria-hidden', 'true');
  const up = doc.createElementNS(SVG_NS, 'path');
  up.setAttribute('d', 'M2 6.5 L5 3.5 L8 6.5');
  const down = doc.createElementNS(SVG_NS, 'path');
  down.setAttribute('d', 'M2 9.5 L5 12.5 L8 9.5');
  svg.appendChild(up);
  svg.appendChild(down);
  return svg;
}

function write(player, d, fn) {
  try {
    fn();
  } catch {
    try { player.setAttribute(d.layerId, d.attrId, undefined); } catch {}
  }
}

function el(doc, tag, className) {
  const node = doc.createElement(tag);
  if (className) node.className = className;
  return node;
}

function safe(fn) {
  try { return fn(); } catch { return null; }
}
