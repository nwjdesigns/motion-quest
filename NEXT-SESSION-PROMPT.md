# Next Session: Cavalry Lab — left-panel TYPE TREATMENT redesign

## Context

Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **203 Vitest tests across 21 files.** Astro 6, React, R3F, GitHub Pages, Cavalry WASM player. Full status in `ROADMAP.md`.

Last session (2026-06-16 s2) shipped **scene interactivity**: an on-scene control panel (the player renders a `.cv`'s Control Centre attributes as live widgets, docked top-right in the iframe, frosted blur, `scale(0.9)`) + a **custom HSV colour picker** (SV square + hue + hex) replacing the native OS picker. Nav "← Back" → "Gallery". All committed, pushed, deployed.

## Priority 1: redesign the left info-panel's TYPE TREATMENT

This is the resumed "info-panel type hierarchy" task. **Noah mocked up the target** at the end of last session (screenshot in the 2026-06-16 s2 transcript — ask him to re-paste it). Implement that mockup in `src/pages/experiments/[...slug].astro` (the `.panel` and its `.panel-head` / `.made-with` / `.tool-tag` / `.nav-foot-wrap` styles). What the mockup shows:

- **Title:** drop the "Pilot:" prefix → large title "Time Offset + Stagger" (much bigger than now; this is the main hierarchy fix).
- **Description:** the bulked-up copy. The mockup used **option A**: "The pilot scene, and the first to run live in the browser instead of as a flat export. A grid of squares driven by staggered time offsets ripples into a wave, while a color array and a little noise keep every cell slightly out of step." (Options B/C also offered last session — confirm A vs B with Noah, then write it into `01.md`; it currently still says "Testing out the Cavalry web player on production.")
- **Tool tags:** mono-caps **OUTLINED** style (no filled pill background), e.g. `STAGGER` `DUPLICATOR` `BASIC SHAPE` `NOISE` `COLOUR ARRAY`. Note **British "COLOUR ARRAY"** (the `tools` in `01.md` currently say "Color Array").
- **Date treatment:** a styled date, day emphasised, e.g. "26 / 06 / 2026" (mockup shows "26" heavier than "062026").
- **Footer row:** ©2026 Noah Webster-James · Creative Tech · **Made in Cavalry 2.7.2** (mockup footer says 2.7.2; `01.md` has `cavalryVersion: 2.0.3` — confirm/bump).

**Keep:** the "Gallery" nav relabel and especially the **nav-button hover treatment** — Noah loves it, do not change it (`feedback_nav_hover_treatment`).

**Process:** Noah may want to design in Figma first (Switchyard 2026, node `886-668`) or just implement from the screenshot — ask. He works visually; treat his latest mockup as the source of truth (it superseded an earlier verbal answer last session).

## Priority 2: real content + linked-asset convention (unchanged)

- `exp-01`..`exp-30` still placeholders. Noah hands a `.cv` path; handle copy + markdown + commit DIRECTLY (don't make him run the CLI). Flow: `.cv` → `public/cavalry/scenes/`, `.png` → `public/cavalry/`, write `src/content/experiments/<slug>.md` (include `aspectRatio`; portrait = `0.5625`), restart dev server.
- **Open:** do real scenes REPLACE `exp-01..30` slugs or land as new named experiments? Undecided.
- **Linked assets:** `01.cv` references `A4 - 1.png` not shipped beside it ("Failed to decode image"). Copy linked image/font assets into `public/cavalry/scenes/` next to the `.cv`; ask Noah to export them alongside.

## How I should work

- Match Noah's mockup 1:1; don't freelance the design. His visual reference wins over guesses.
- Make small additive changes IN PLACE; don't escalate to a redesign beyond what's asked (`feedback_small_change_in_place`).
- Verify in the preview pane proactively; drive real interactions, read state back (don't trust DOM updates alone).

## Known rough edges

- **Cavalry web-player typed attribute setters are BROKEN** (`setAttributeColor` returns zeros) — use generic `setAttribute({r,g,b,a})`. No group-name API. See `reference_cavalry_player_controls`.
- Scene 01 only exposes 2 Control Centre attributes (backgroundColor + strength) — the 5 in the original reference screenshot were a different demo scene.
- Menu/toggle/bounded-slider control widgets are built but UNTESTED live (no scene exposes them yet).
- Astro content cache goes stale when a schema field is added post-sync → field reads `undefined`. Clear `.astro/data-store.json` + `.astro/collections`, restart. Keep destructure defaults in the page.
- `preview_screenshot` glitches on the WASM canvas paint, but captures the HTML control panel/picker fine.
- Untracked `after-effects/text_you_later_main.aep` is unrelated AE work — leave it.
