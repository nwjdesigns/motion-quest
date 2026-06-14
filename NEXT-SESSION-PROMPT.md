# Next Session: Continue Cavalry Lab Build

## Context

Issues #1 and #2 shipped. Site live at https://nwjdesigns.github.io/motion-quest/. Repo is public. 14 Vitest tests passing. Astro 6, React, content collection, GitHub Pages deploy, Cavalry WASM player with coi-serviceworker all working.

## What to do

Pick up from issue #3 or #4. Both are unblocked:

- **Issue #3** (Stripe link + prev/next nav): quick win, extends the experiment page. Stripe link conditional rendering and chronological prev/next navigation.
- **Issue #4** (3D homepage): the core experience. R3F canvas, constellation layout, orbit controls, click-to-navigate. Big slice.

Read the issue body before starting. Continue with TDD.

## Current state

- `public/cavalry/player.html` loads scenes via `?scene=` query param
- `src/pages/experiments/[...slug].astro` embeds player in iframe
- `src/schemas/experiment.ts` defines the content collection schema (tested)
- `src/lib/player.ts` builds player URLs (tested)
- `coi-serviceworker.js` handles COOP/COEP on GitHub Pages
- Test scene is `test_07.cv` (falloff) renamed to `particle-grid.cv`

## Known rough edges

- Player auto-binds cursor to Control Centre double2/int2 attributes only. Scenes need CC attributes exposed in Cavalry for interactivity to work.
- The dummy experiment uses a test scene, not a real Noah export.
- Site has no styling, no 3D homepage, no theme. Expected at issue 2 of 13.
