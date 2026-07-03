# Next Session: Cavalry Lab

## Context

Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **356 Vitest tests across 31 files.** Astro 6, React, R3F, GitHub Pages, Cavalry WASM player. Full status in `ROADMAP.md`. PRDs: `prd-cavalry-lab.md`, `prd-homepage-identity.md`.

`origin/main` is synced (the morph-removal commits are all pushed — `babd4e3` is on origin). The identity pass is shipped.

## Immediate TODO

1. **Decide fate of the uncommitted constellation "marquee" experiment.** The working tree has an unpushed, **broken** experiment across 4 files:
   - `AmbientParticles.tsx` — denser, slower drift (200 → 1000 particles, wider spread/amplitude).
   - `ConnectingLines.tsx` — reads live node positions via `livePositionsRef` instead of static layout.
   - `ConstellationScene.tsx` — adds a `MarqueeClock` + shared `marqueeOffsetRef` + `livePositionsRef`.
   - `ExperimentNode.tsx` — horizontal-wrap marquee drift (`wrapX`), camera-facing billboard (`quaternion.copy(camera.quaternion)`), writes live position back.
   - **Bug blocking it:** `ConstellationScene.tsx:155` passes `marqueeSpeedFactor={speedFactors[i]}` but `speedFactors` is never defined — the new `useMemo` builds `marqueeParams` and nothing consumes it. Throws at runtime. Either wire `marqueeParams` → the speed factor (and use its `phase`), or discard the whole experiment. Confirm with Noah whether this is a direction he wants before finishing.

2. **New untracked file `after-effects/text_you_later_main.aep`.** Decide whether the binary AE project belongs in the repo or should be gitignored.

3. **Close GitHub issues #16-#21.** All built and committed. Use `gh issue close` if satisfied.

## What's next after that

See `ROADMAP.md` "Next up" for the full list. Top candidates:
- **Real content.** Replace placeholder experiments with real Cavalry scenes as Noah publishes them.
- **Detail-page pixel-push.** Noah parked this — only revisit when he raises it with a mockup.
- **Detail-page mobile.** Touch-collapse panels, real-device gesture check.
- **Times New Roman.** Held in reserve for accent typography. Noah will say when.

## Dead code note

The morph library files (`morph.ts`, `morph-animation.ts`, `transition-orchestrator.ts`, `reverse-morph.ts`) and their tests still exist but are no longer imported by any component. Tested pure functions. Can be cleaned up if/when Noah wants, not urgent.
