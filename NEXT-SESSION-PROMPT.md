# Next Session: Cavalry Lab — unify detail panels + real content

## Context

All 13 build issues (#1-#13) are DONE. Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **166 Vitest tests across 20 files** (the old "197/24" figure was inflated by vitest scanning duplicate test copies inside `.claude/worktrees/`, now cleaned up). Astro 6, React, R3F (three.js directly, no drei), content collection, GitHub Pages deploy, Cavalry WASM player with coi-serviceworker.

Note: GitHub issues #1-#13 are all still OPEN. This project does not auto-close issues; the code/tests are the source of truth.

## FIRST THING TO DO (Noah parked it)

**Merge the experiment detail page's two panels into ONE.** Right now `src/pages/experiments/[...slug].astro` has two separate floating frosted-glass panels: a title card (top-left) and a nav panel (bottom-left). Noah wants them combined into a single unified panel. Keep the homepage design language (frosted glass, system-ui type, mono date, green accent, theme toggle), just one panel instead of two splits.

## Shipped 2026-06-14 (session 2)

- **Morph-rect dynamic sizing:** `projectRect()` in `src/lib/projection.ts` projects the thumbnail plane's 4 world corners to a screen bounding box, replacing a hardcoded 160x90 start rect (wrong at non-default zoom). Wired into `ExperimentNode.tsx`. +3 tests.
- **Player 404 guard:** `public/cavalry/scene-loader.js` (`validateSceneResponse`) checks `res.ok` + content-type before parsing. Fixes the "white void" detail pages — a missing `.cv` returned a 404 HTML page the WASM player parsed into a blank 1920x1080 white scene. Now shows a clean "Scene not found (404)". +3 tests.
- **Player theme handoff:** `public/cavalry/player-theme.js` (`resolveThemeMessage`) + a `message` listener in `player.html`. The player was hardcoded black and ignored the `theme-change` postMessage the page already sent. Now matches light/dark. +5 tests.
- **Detail-page redesign (Direction A):** `[...slug].astro` rebuilt to match the homepage UIPanel — full-bleed player stage + floating frosted-glass title card and nav panel, working theme toggle (flips page + panels + player, persists to `mq-theme`). Panel tokens deliberately diverge from the homepage's 6%-white-tint glass: they use a theme-colored frosted fill (dark/light glass) for legibility over arbitrary scene colors.
- Worktrees cleaned up (removed 3 stale worktrees + 6 merged branches; only `main` remains).

## What to do next (after the panel merge)

1. **Real content.** `exp-01`..`exp-30` have thumbnails + `.md` but NO `.cv` scene files — only `particle-grid` is real. Their detail pages honestly say "Scene not found" now. Replace with real Cavalry exports via `npm run publish -- path/to/scene.cv "Title" [--description "..."] [--commit]`.
2. **Detail-page mobile.** The new floating panels do NOT collapse on touch like the homepage UIPanel (no `☰` toggle). Add a touch-collapse if wanted. Also: real-device check of touch gestures (pinch/drag/tap) — can't be verified in desktop preview.
3. **Cavalry scene interactivity.** Player auto-binds cursor to Control Centre double2/int2 attributes only; real scenes need those CC attributes exposed in Cavalry.

## Known rough edges

- Direction A keeps letterboxing: a 16:9 scene full-bleed on a tall viewport leaves margins (Noah chose A knowing this; real dark scenes will look better than the white test scene).
- Three.js chunk-size warning on build (expected).
- Link URLs in the homepage UIPanel (Instagram, Patreon, Scenery, Work with me) are still placeholders from index.astro.
- `preview_screenshot` glitches on the WASM-player iframe (captures mid-paint); trust DOM `getBoundingClientRect`, screenshot a 404 scene for clean chrome captures. See memory `reference_astro_react_gotchas.md`.
