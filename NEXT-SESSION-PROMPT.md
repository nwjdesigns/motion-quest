# Next Session: Cavalry Lab — multi-agent build of homepage identity (#16-#21)

## Context

Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **220 Vitest tests across 23 files.** Astro 6, React, R3F, GitHub Pages, Cavalry WASM player. Full status in `ROADMAP.md`. PRD: `prd-homepage-identity.md` (also GitHub issue [#14](https://github.com/nwjdesigns/motion-quest/issues/14)).

Last session (2026-06-21) shipped issue **#15 "Chrome, typography + keyboard shortcuts"**: new shared `TopBar` (SVG pinwheel mark + theme toggle, 64px), `FooterBar` (copyright + Instagram, 56px), `useLayoutShortcuts` hook (1/2/3 keys for layout). UIPanel killed. Fully monochrome (no `--mq-accent`). Helvetica Neue primary typeface. Detail page updated (SVG mark replaces `MQ™` text, footer updated). All built TDD.

## What to build: issues #16-#21

Noah said **"next sesh is a multi agent build"** so these should run in parallel where possible. All specs in their GitHub issues. The PRD's "Build Sequence" section gives the canonical order and dependencies.

### Parallelism map

**Can run independently (no cross-dependencies):**
- [#16](https://github.com/nwjdesigns/motion-quest/issues/16) Dynamic mark behaviour engine
- [#17](https://github.com/nwjdesigns/motion-quest/issues/17) Carousel dot indicator
- [#18](https://github.com/nwjdesigns/motion-quest/issues/18) Entrance choreography
- [#20](https://github.com/nwjdesigns/motion-quest/issues/20) Hover/interaction microinteractions

**Depends on #16 (mark states drive transition cues):**
- [#19](https://github.com/nwjdesigns/motion-quest/issues/19) Page transition: thumbnail morph to player

**Depends on all others:**
- [#21](https://github.com/nwjdesigns/motion-quest/issues/21) Polish + responsive audit

### Key design decisions (from grill, locked in PRD)

- **Mark behaviour:** state machine with idle (slow spin), hover (speed bump), orbit-reactive (directional rotation tracks camera angle), nav (CW burst on Next, CCW on Prev), loading (fast spin). Uses `currentColor` for CSS theme reactivity.
- **Carousel indicator:** 7-dot sliding window. Active dot is elongated (pill). Edge dots scale down. Centered below the nav on detail page. Dots are monochrome (`--mq-text`).
- **Entrance:** stagger load-in (sequence TBD by Noah, build the mechanism and let him define order). No chromatic/iridescent effects.
- **Page transition:** thumbnail morphs into player (forward), player morphs back to node (reverse). Astro View Transitions API. Snapshot approach for 3D-to-DOM handoff (capture canvas to image, animate image, swap to real player).
- **Hover effects:** monochrome only. Button hover: bg fill + colour lift, 0.2s (the detail-page nav treatment Noah loves). No iridescent anywhere.
- **Monochrome:** experiment thumbnails are the ONLY colour on page. Everything else uses `--mq-text` / `--mq-bg` / `--mq-text-muted`.
- **Times New Roman:** held in reserve. Not used yet.

### Architecture notes for agents

- `TopBar` already renders the SVG mark (32px homepage, 24px detail). #16 adds animation to this existing SVG.
- `useLayoutShortcuts` is a standalone hook in `src/hooks/`. Same pattern for any new hooks.
- Both pages import `TopBar` and `FooterBar`. Homepage via `ConstellationScene.tsx` (React), detail page via `[...slug].astro` (Astro + inline).
- Morph transition (#19) already has a basic `MorphOverlay` in ConstellationScene.tsx. The PRD wants this replaced with Astro View Transitions.
- Test files live at `tests/` root, named `<feature>.test.ts`. React components use `@testing-library/react`. Hooks use `renderHook` + `act`.

## Known rough edges

- Cavalry web-player typed attribute setters are BROKEN. Use generic `setAttribute`.
- `preview_screenshot` glitches on WASM canvas. Trust DOM measurements, screenshot for chrome.
- Scene 01 references a linked image not shipped. Unrelated to this work.
- Astro content cache can go stale. Clear `.astro/data-store.json` + `.astro/collections` if needed.
- Untracked `after-effects/text_you_later_main.aep` is unrelated AE work.
