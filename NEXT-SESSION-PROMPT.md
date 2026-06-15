# Next Session: Cavalry Lab — real content + design craft

## Context

All 13 build issues (#1-#13) are DONE. Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **166 Vitest tests across 20 files.** Astro 6, React, R3F (three.js directly, no drei), content collection, GitHub Pages deploy, Cavalry WASM player with coi-serviceworker.

**Unpushed:** Commit `5c3a98c` (panel merge) is on `main` but NOT pushed. Push first thing.

Note: GitHub issues #1-#13 are all still OPEN. This project does not auto-close issues; the code/tests are the source of truth. Full project status lives in `ROADMAP.md`.

## What shipped last session (2026-06-15)

- **Panel merge:** Combined the detail page's two separate panels (title card top-left + nav panel bottom-left) into one vertically-centred unified panel at centre-left. `.panel` now uses `top: 50%; transform: translateY(-50%)`. Title/date/description in `.panel-head`, nav/buy-link in `.nav-foot-wrap` with a divider between them. Mobile breakpoint simplified to one rule.

## Priority 1: Real content

`exp-01`..`exp-30` have thumbnails + `.md` but NO `.cv` scene files — only `particle-grid` is real. Their detail pages say "Scene not found (404)." The site reads as an empty gallery.

**Publish flow:** When Noah provides a `.cv` file path, handle everything directly (don't tell him to run the publish script):
1. Copy `.cv` to `public/cavalry/scenes/`
2. Copy matching `.png` thumbnail to `public/cavalry/` (if it exists alongside the `.cv`)
3. Write content markdown to `src/content/experiments/`
4. Stage and commit

Reference: `scripts/publish.mjs` has the exact logic for slug derivation, yaml frontmatter format, etc.

## Priority 2: Compositional/design craft (after real content)

Noah flagged the site reads "low craft" and isn't portfolio-worthy. After discussion he concluded the empty content is the primary problem, not the frame. BUT once real scenes are in, these compositional issues remain:

- **Homepage has no identity.** No visible title, author, or voice. Just floating thumbnails with a dev-tool panel.
- **Typography.** `system-ui` everywhere. No distinctive type choice or hierarchy.
- **UIPanel reads as controls.** Layout switchers and links feel bolted-on, not designed.
- **Experiment nodes have no presence.** No labels, no hover titles. 1.6x0.9 planes at 0.85 opacity.
- **No entrance animation.** Everything is already there when you arrive.
- **Generic glassmorphism.** Both pages use the same frosted-glass pattern every tutorial produces.

Noah wants to revisit these AFTER real content gives the site something to compose around.

## Other open items

- Detail-page mobile: floating panel does NOT collapse on touch like the homepage UIPanel (no `☰` toggle).
- Scene interactivity: player auto-binds cursor to CC `double2`/`int2` attributes only; real scenes need those exposed in Cavalry.
- Placeholder UIPanel links (Instagram, Patreon, Scenery, Work with me) — replace with real URLs.

## Known rough edges

- Direction A keeps letterboxing: 16:9 scene full-bleed on tall viewport leaves margins (accepted).
- Three.js chunk-size warning on build (expected).
- `preview_screenshot` glitches on WASM-player iframe; trust DOM measurements, screenshot 404 scenes for clean chrome. See memory `reference_astro_react_gotchas.md`.
