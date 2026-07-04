# Next Session: Cavalry Lab

## Context

Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **356 Vitest tests across 31 files.** Astro 6, React, R3F, GitHub Pages, Cavalry WASM player. Full status in `ROADMAP.md`. PRDs: `prd-cavalry-lab.md`, `prd-homepage-identity.md`.

Last session (2026-07-03) shipped homepage marquee drift, billboard nodes, live connecting lines, and particle polish. Issues #16-#21 already closed. Working tree has uncommitted changes across 4 component files plus ROADMAP.md and this file. Push needed.

## Immediate TODO

1. **Commit and push.** The marquee + particle changes are complete and tested (356 pass). Commit, push, verify deploy.
2. **Visually verify deployed site.** After push triggers GitHub Pages deploy, check homepage: nodes drift independently left-to-right, connecting lines follow live positions, particles visible and small, TopBar/FooterBar fixed at top/bottom. Check detail page still works.
3. **New untracked file `after-effects/text_you_later_main.aep`.** Decide whether the binary AE project belongs in the repo or should be gitignored.

## What's next after verification

See `ROADMAP.md` "Next up" for the full list. Top candidates:
- **Real content.** Replace placeholder experiments with real Cavalry scenes as Noah publishes them.
- **Detail-page pixel-push.** Noah parked this; only revisit when he raises it with a mockup.
- **Detail-page mobile.** Touch-collapse panels, real-device gesture check.
- **Times New Roman.** Held in reserve for accent typography. Noah will say when.

## New this session (2026-07-04)

- **Source text library** created at `references/source-texts/`. Public domain literary texts in original language for use as visual material. First entry: Dostoevsky's Grand Inquisitor (Russian). See `references/source-texts/README.md` for index.
- Noah flagged the Inquisitor's argument as a personal reminder: stop chasing perfectionism and rounding corners, be a little rough.

## Architecture notes for marquee system

- `MarqueeClock` in ConstellationScene: drives a shared `marqueeOffsetRef` (increments by `MARQUEE_SPEED * delta` each frame)
- Each `ExperimentNode` receives: `marqueeOffsetRef`, `marqueeSpeedFactor` (0.5-1.5x), `marqueePhase` (initial x offset for distribution), `livePositionsRef` (shared Float32Array)
- Node x position: `wrapX(position.x + marqueePhase + offset * speedFactor)` where wrapX modular-wraps between MARQUEE_MIN (-9) and MARQUEE_MAX (9)
- Each node writes its live xyz to `livePositionsRef` at `index * 3`; ConnectingLines reads from this ref instead of static layout positions
- Billboard: `meshRef.current.quaternion.copy(camera.quaternion)` in useFrame
- Spring physics still applies to y and z axes (for layout transitions); x is set directly by marquee

## Dead code note

The morph library files (`morph.ts`, `morph-animation.ts`, `transition-orchestrator.ts`, `reverse-morph.ts`) and their tests still exist but are no longer imported by any component. Tested pure functions. Can be cleaned up if/when Noah wants, not urgent.
