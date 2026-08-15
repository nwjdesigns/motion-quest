# Next Session: Poster Machine — Animation + Controls

## Context

Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **356 Vitest tests across 31 files.** Astro 6, React, R3F, GitHub Pages, Cavalry WASM player. Full status in `ROADMAP.md`. PRDs: `prd-cavalry-lab.md`, `prd-homepage-identity.md`, **`prd-poster-machine.md` (ACTIVE)**.

Last session (2026-07-14) built the full responsive typographic grid system in Cavalry. Columns, rows, and text distributing across cells via String Array + Duplicator with per-duplicate positioning. All responsive to Margin, Gutter, Columns, Rows.

**Cavalry file:** `~/Desktop/2026/EES/DAILY/PRODUCTION/07_JULY/CAV/july_main_build.cv`. Four comps: `01 columns` (column-only prototype), `02 rows and text` (manual Cell X/Y positioning), `03 autolayout` (Grid distribution experiment, abandoned), **`04 duplicates` (WORKING: String Array + Point distribution + Index Context + Shape Position)**.

## Grid rig architecture (proven, do not re-derive)

- **JS Utility [Size.W]**: column width = `(1080 - 2*margin - (columns-1)*gutter) / columns`
- **JS Utility 2 [Size.H]**: row height = same formula with 1920 and row params
- **Math / Math 2**: column width + gutter / row height + row gutter for Duplicator step distance
- **Duplicator** (columns, Linear horizontal) + **Duplicator 2** (rows, Linear vertical)
- **Duplicator 3** (text, Point distribution): String Array auto-indexes per duplicate, Index Context node wired to n5 on position JS Utilities, outputs to Duplicator's **Shape Position** (NOT input shape Position, which Duplicator strips)
- **JS Utility 3 [Text Box Size.W]**: `span * columnWidth + (span-1) * gutter`
- **JS Utility 4 [Position.X]**: `-(1080/2) + margin + (n5 % columns) * (columnWidth + gutter)`
- **JS Utility 5 [Position.Y]**: `(1920/2) - margin - (Math.floor(n5 / columns)) * (rowHeight + rowGutter)`

## Immediate TODO

1. **Stagger entrance animation.** Two levels discussed: per-word (Duplicator Shape Time Offset + Stagger) and per-letter (Text Shape sub-mesh + Stagger behaviour). Noah wants to explore both. Start with per-word stagger on the text Duplicator.
2. **Expose controls to Control Centre.** Right-click each attribute > Add to Control Centre:
   - Columns (int, 1-8), Rows (int, 1-8), Margin (double, 0-200), Gutter (double, 0-100)
   - Ink (colour, Rectangle Shape fill + Text fill), Paper (colour, comp background)
   - Text (string, on String Array or Text Shape), Span (int, renamed from internal label)
   - Noah prefers Figma-style labelling: "Count" not "Span"
3. **Ink/Paper colour controls.** Wire Ink to column rectangles, row rectangles, and text fill. Wire Paper to comp background.
4. **Font.** Space Grotesk (OFL, sellable). Currently using PP Editorial New Italic.
5. **Asset Array for images.** Same pattern as String Array; import images, wire Asset Array to an Image Shader. Not yet attempted.
6. **Publish when animation is in.** `npm run publish -- poster-machine.cv "Grid Study 01"`, copy linked assets, verify control panel renders, commit + push.

## Layer roadmap (spec is source of truth)

- **L1+L2 grid rig + text** — BUILT (columns, rows, text snap to grid). Animation and controls pending.
- **L3 animation styles** (Rise/Wave/Pulse riding the grid) + font packaging (Space Grotesk, OFL) + $19 Stripe link → the sellable Poster Machine + daily "one word, one poster" content series

## Parked: Cavalry Measurement Tool

Noah pitched a Figma-like measurement tool for Cavalry (2026-07-14). Research done: hybrid approach (script panel + JS Shape overlay). No competition. Pre-grill. See memory `project_cavalry_measure_tool.md` for full research. Pick up if Noah wants to grill it.

## Parked: Projection mapping (hardware, no build scope)

Noah asked for projector recommendations on 2026-08-15, then asked specifically about the Epson EB-X49 (ruled out: native XGA 1024x768 4:3 gives ~590k effective pixels on 16:9 vs 2.07M for 1080p, so mask edges staircase). Full research + verified SA price anchors in `docs/sessions/2026-08-15-projection-mapping-projector-research.md`.

Headline: buy used ex-corporate business laser with real lens shift, not new consumer. Cheapest next move is a day's rental from a Cape Town AV house before buying. **Unanswered fork:** interior objects/surfaces vs building facade, which is 6,000+ lumens and a different budget entirely. Nothing bought, nothing on the build roadmap. Does not affect the Poster Machine directive above.

## Standing items (unchanged)

- Real content: do real scenes replace `exp-01..30` slugs or land as new named experiments?
- Detail-page pixel-push: parked until Noah raises it with a mockup
- Detail-page mobile: touch-collapse panels, real-device gesture check
- Times New Roman: reserved for accent typography, Noah will say when
- Dead code: morph library files + tests unreferenced; clean up when convenient
- Untracked `after-effects/text_you_later_main.aep`: awaiting Noah's call (keep or gitignore)
- Untracked `.claude/worktrees/`: should probably be gitignored
