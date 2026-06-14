# Next Session: Continue Cavalry Lab Build

## Context

Issues #1-#11 shipped. Site live at https://nwjdesigns.github.io/motion-quest/. Repo is public. 170 Vitest tests passing across 21 files. Astro 6, React, R3F (three.js directly, no drei), content collection, GitHub Pages deploy, Cavalry WASM player with coi-serviceworker. 31 experiments loaded (1 real + 30 generated test thumbnails).

## What to do

Pick up from issue #12. Read the issue body before starting. Continue with TDD.

## Current state

- `src/pages/index.astro` — R3F homepage with `ConstellationScene` (client:only="react"), inline theme script for FOUC prevention, CSS custom properties for light/dark
- `src/components/ConstellationScene.tsx` — wraps everything in ThemeProvider, manages layout state, reads saved camera from sessionStorage, renders Canvas + UIPanel + AmbientParticles + ConnectingLines + MorphOverlay
- `src/components/ThemeContext.tsx` — React context providing theme/colors/toggleTheme/setTheme, syncs to localStorage + data-theme attribute
- `src/components/ExperimentNode.tsx` — textured plane mesh with spring physics animation, uses custom PixelationMaterial, saves camera state + projects screen rect on click for morph transition
- `src/components/PixelationMaterial.tsx` — custom ShaderMaterial: centre-sharp, edge-pixelated based on NDC distance
- `src/components/AmbientParticles.tsx` — 200 instanced sphere particles with drift animation and DOF fade shader, theme-aware particle colour
- `src/components/ConnectingLines.tsx` — cursor-driven proximity lines using BufferGeometry line segments, theme-aware line brightness
- `src/components/OrbitControls.tsx` — custom OrbitControls using three.js directly (drei was dropped), accepts initialTarget for camera restore
- `src/components/UIPanel.tsx` — frosted glass panel with layout toggle, Light/Dark theme toggle, external links, all theme-aware
- `src/lib/theme.ts` — pure functions: resolveInitialTheme, getThemeColors, getCssVariables, buildThemedPlayerUrl
- `src/lib/theme-script.ts` — generates inline IIFE script for FOUC-free theme initialization
- `src/lib/pixelation.ts` — pure distance-to-LOD mapping function (power curve with tunable threshold/falloff)
- `src/lib/particles.ts` — seeded PRNG particle generator with tunable volume, scale range, count
- `src/lib/proximity.ts` — proximity graph: cursor-to-thumbnail + thumbnail-to-thumbnail connections with distance-based opacity
- `src/lib/constellation.ts` — seeded PRNG constellation layout (golden-angle spiral + relaxation)
- `src/lib/grid-layout.ts` — uniform 3D matrix layout
- `src/lib/spiral-layout.ts` — golden-angle helix layout
- `src/lib/navigation.ts` — chronological prev/next experiment nav
- `src/lib/player.ts` — builds Cavalry player URLs
- `src/lib/camera-state.ts` — serialize/deserialize camera position + target + zoom with validation
- `src/lib/projection.ts` — 3D world position + view-projection matrix + viewport → screen pixels
- `src/lib/morph.ts` — screen rect interpolation with progress clamping
- `src/pages/experiments/[...slug].astro` — experiment detail page with player iframe, prev/next nav, conditional Stripe link, themed via CSS variables + postMessage to player
- `public/cavalry/exp-01.png` through `exp-30.png` — 30 generated test thumbnails (256x144 gradient PNGs)
- `src/content/experiments/exp-01.md` through `exp-30.md` — 30 test experiment entries
- `.claude/launch.json` — preview server config (astro dev on port 4321)

## Known rough edges

- drei was intentionally removed because Norton AV quarantines its Vite bundle as a false-positive trojan. OrbitControls and texture loading use three.js directly.
- When using InstancedMesh with custom ShaderMaterial, do NOT re-declare `attribute mat4 instanceMatrix` — Three.js injects it automatically. Redeclaring causes a shader compile error.
- Player auto-binds cursor to Control Centre double2/int2 attributes only. Scenes need CC attributes exposed in Cavalry for interactivity.
- The 30 test experiment thumbnails are generated gradients, not real Noah exports.
- Three.js chunk size warning on build (expected, three.js is large).
- Link URLs in UIPanel (Instagram, Patreon, Scenery, Work with me) are placeholder values passed from index.astro.
- @testing-library/react and jsdom are now dev dependencies (added for ThemeContext hook tests).
- Morph transition overlay uses a fixed 160x90 screen-space rect as the starting size (not dynamically sized to the projected thumbnail). Works well at default zoom but may look slightly off at extreme zoom levels.
