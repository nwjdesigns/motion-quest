# Next Session: Cavalry Lab

## Context

Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **356 Vitest tests across 31 files.** Astro 6, React, R3F, GitHub Pages, Cavalry WASM player. Full status in `ROADMAP.md`. PRDs: `prd-cavalry-lab.md`, `prd-homepage-identity.md`.

Last session (2026-06-23) removed the morph transition system (forward + reverse morph were glitchy). Gallery-to-detail is now direct navigation. Main is 1 commit ahead of origin (morph removal, not yet pushed).

## Immediate TODO

1. **Push to origin.** `git push` -- 6 commits waiting.
2. **Close GitHub issues #16-#21.** All are built and committed. Use `gh issue close`.
3. **Visually verify deployed site.** After push triggers GitHub Pages deploy, check both homepage and a detail page in browser. Confirm: mark rotates on orbit, entrance staggers on fresh visit, carousel dots show between Prev/Next, clicking a node navigates to the detail page, underline draw-on hover on action buttons, responsive at 600px.

## What's next after verification

See `ROADMAP.md` "Next up" for the full list. Top candidates:
- **Real content.** Replace placeholder experiments with real Cavalry scenes as Noah publishes them.
- **Detail-page pixel-push.** Noah parked this -- only revisit when he raises it with a mockup.
- **Detail-page mobile.** Touch-collapse panels, real-device gesture check.
- **Times New Roman.** Held in reserve for accent typography. Noah will say when.

## Dead code note

The morph library files (`morph.ts`, `morph-animation.ts`, `transition-orchestrator.ts`, `reverse-morph.ts`) and their tests still exist but are no longer imported by any component. They're tested pure functions. Can be cleaned up if/when Noah wants, but not urgent.
