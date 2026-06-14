# Next Session: Continue Cavalry Lab Build

## Context

Issues #1-#6 shipped. Site live at https://nwjdesigns.github.io/motion-quest/. Repo is public. 85 Vitest tests passing across 12 files. Astro 6, React, R3F (three.js directly, no drei), content collection, GitHub Pages deploy, Cavalry WASM player with coi-serviceworker.

## What to do

Pick up from issue #7. Read the issue body before starting. Continue with TDD.

## Current state

- `src/pages/index.astro` — R3F homepage with `ConstellationScene` (client:only="react")
- `src/components/ConstellationScene.tsx` — manages layout state, renders Canvas + UIPanel
- `src/components/ExperimentNode.tsx` — textured plane mesh with spring physics animation
- `src/components/OrbitControls.tsx` — custom OrbitControls using three.js directly (drei was dropped)
- `src/components/UIPanel.tsx` — frosted glass panel with layout toggle + external links
- `src/lib/constellation.ts` — seeded PRNG constellation layout (golden-angle spiral + relaxation)
- `src/lib/grid-layout.ts` — uniform 3D matrix layout
- `src/lib/spiral-layout.ts` — golden-angle helix layout
- `src/lib/navigation.ts` — chronological prev/next experiment nav
- `src/lib/player.ts` — builds Cavalry player URLs
- `src/pages/experiments/[...slug].astro` — experiment detail page with player iframe, prev/next nav, conditional Stripe link
- `public/cavalry/particle-grid.png` — placeholder thumbnail (generated gradient, not a real export)
- `.claude/launch.json` — preview server config (astro dev on port 4321)

## Known rough edges

- drei was intentionally removed because Norton AV quarantines its Vite bundle as a false-positive trojan. OrbitControls and texture loading use three.js directly.
- Player auto-binds cursor to Control Centre double2/int2 attributes only. Scenes need CC attributes exposed in Cavalry for interactivity.
- The dummy experiment uses a generated placeholder thumbnail, not a real Noah export.
- Three.js chunk size warning on build (expected, three.js is large).
- Link URLs in UIPanel (Instagram, Patreon, Scenery, Work with me) are placeholder values passed from index.astro.
