# Cavalry Lab — Roadmap

Source of truth for project status. GitHub issues #1-#13 are all still OPEN (this project does not auto-close them), so use THIS file, not issue state, for what is done.

- **Live:** https://nwjdesigns.github.io/motion-quest/
- **Stack:** Astro 6 + React + R3F (three.js directly, no drei), content collection (Zod), GitHub Pages deploy, Cavalry WASM player (coi-serviceworker for COOP/COEP)
- **Tests:** 203 Vitest across 21 files
- **Renders are portrait-majority** (9:16, for Instagram Reels) — design portrait-first
- **Spec:** `prd-cavalry-lab.md` · **Next session:** `NEXT-SESSION-PROMPT.md`

## Shipped

| Ref | Item |
|-----|------|
| #1-#2 | Astro project, content collection schema, GitHub Pages deploy; Cavalry web player page with COOP/COEP service-worker shim |
| #3-#4 | 3D R3F homepage (constellation) + prev/next chronological navigation |
| #5 | Grid and spiral layouts with spring-animated transitions |
| #6 | Frosted-glass UI panel (layout toggle + external links) |
| #7-#9 | Pixelation shader, ambient instanced-mesh particles, cursor-driven connecting lines, + 30 placeholder test experiments |
| #10 | Light/dark theme system across all contexts (DOM, R3F, player iframe), localStorage + prefers-color-scheme |
| #11 | Camera state persistence (sessionStorage) + morph transition (thumbnail → detail page) |
| #12 | Mobile touch support (touch-collapsible UIPanel, `touch-action: none`, responsive detail page) |
| #13 | Publishing CLI (`npm run publish -- scene.cv "Title" [--description ..] [--commit]`) |
| 2026-06-14 s2 | Morph-rect dynamic sizing (`projectRect`), player 404 guard (no more white void), player theme handoff, experiment detail-page redesign (Direction A), worktree cleanup |
| 2026-06-15 | Merged detail page's two panels (title card + nav) into one vertically-centred unified panel |
| 2026-06-16 | FIRST real scene published (`01` "Pilot: Time Offset + Stagger", portrait 9:16). Schema +`tools`/`cavalryVersion`/`license`/`aspectRatio`. Detail panel: "Made with" tool tags + download/license actions, fewer dividers. Scene in aspect-correct rounded inset container, anchored right (8px margins, 16px left). Homepage nodes respect thumbnail aspect ratio. 172 tests |
| 2026-06-16 s2 | **On-scene control panel** — player renders a scene's Control Centre attributes as live widgets (top-right inside iframe, frosted blur, `scale(0.9)`), dynamic per-scene (`control-centre.js` pure+tested, `render-controls.js` DOM/WASM). **Custom HSV colour picker** (SV square + hue + hex) replaces the un-stylable native OS picker. Nav "← Back" → "Gallery". 203 tests. Cavalry web-player API: generic `setAttribute` (typed setters broken), no group API |
| 2026-06-17 | **Detail-page type-treatment redesign** (from Noah's mockup). Full-width **top bar** (`MQ™` serif wordmark · centred `Gallery`/`← Prev`/`Next →` · theme toggle) + **footer bar** (©2026 Noah Webster-James · Creative Tech). Card rebuilt: 28px title (dropped "Pilot:"), **outlined mono-caps** tool tags wrapping 3+2, `DDMMYYYY` date with bold day, "Made in Cavalry" (no version). **Description removed from the page** (schema field kept). Left content zone bound to the player via `--player-w`/`--content-right` CSS vars. `01.md`: British "Colour Array", tags reordered, version 2.7.2. 203 tests. NOT pixel-perfect yet — Noah parked a pixel-push pass |
| 2026-06-19 | **16:9 detail-page layout fix.** `--content-right` capped at `60vw` so topbar/footbar always get at least 40% viewport width. Previously, a 16:9 scene in a 16:9 viewport crushed them to ~0px. Verified across desktop/tablet/mobile and both themes. Portrait layout unaffected |

## Next up

1. **Detail-page pixel-push (ACTIVE — parked mid-polish).** The type-treatment redesign SHIPPED 2026-06-17 (top bar + card + footer, see Shipped), but Noah: "still quite a bit to pixel push but for now good enough." Open candidates he saw but DECLINED this round (only revisit if he raises them): (a) the card text is indented ~28px from the `MQ™`/`©2026` left rail — the card *edge* aligns, the text doesn't; (b) "Made in Cavalry" sits at the far card edge via `space-between`. Also un-checked: real-device/responsive behaviour of the new top-bar/footer bound-to-player layout, and the dark-theme read of the card. Treat his next mockup/screenshot as source of truth.
2. **Real content.** `exp-01`..`exp-30` still placeholders (thumbnail + `.md`, no `.cv`); `particle-grid` + `01` are real. Noah provides the `.cv` path, Claude handles copy + markdown + commit. Open: do real scenes REPLACE the exp-01..30 slugs or land as new named experiments?
3. **Compositional/design craft.** Homepage identity (no visible title/author), typography (system-ui everywhere), entrance animations, panel design language. Noah flagged the site reads "low craft."
3. **Detail-page mobile.** The redesigned floating panels do not collapse on touch like the homepage UIPanel (no `☰` toggle). Add a touch-collapse + real-device gesture check (pinch/drag/tap can't be verified in desktop preview).
4. **Scene interactivity — control panel SHIPPED (2026-06-16 s2).** The player now renders a scene's Control Centre attributes as live widgets (color/slider/scrubber/menu/toggle/text), driven via generic `setAttribute`; cursor still auto-binds `double2`/`int2`. Scenes need controls exposed in Cavalry's Control Centre (Noah's side). Menu/toggle/bounded-slider widgets are built but UNTESTED live (scene 01 has none) — verify with a scene that exposes them.

## Backlog / ideas

- **Claude 101 for Designers** — education site + sellable React component library for Framer. Full brief: `notes/claude-101-for-designers.md`. Parked 2026-06-20, not yet prioritised. Build approach: Figma-first design system (tokens > components > sections), then Next.js + React + Tailwind, theme-driven. Doubles as a test case for Figma MCP / design skills pipeline.
- Replace placeholder homepage UIPanel links (Instagram, Patreon, Scenery, Work with me) with real URLs.
- Consider a `vitest exclude` for `.claude/worktrees/` so test counts can't get inflated again.
- Detail-page layout: Direction B (framed 16:9 player on a themed stage) was mocked up and set aside in favour of A; revisit if the full-bleed letterboxing becomes a problem.

## Known rough edges

- Direction A keeps letterboxing: a 16:9 scene full-bleed on a tall viewport leaves margins (accepted tradeoff; real dark scenes look better than the white test scene). The topbar/footbar crush at matching aspect ratios is FIXED (2026-06-19), but at tablet width (~768px) the topbar elements are tight at ~307px (functional but not spacious).
- Three.js chunk-size warning on build (expected, three.js is large).
- `preview_screenshot` glitches on the WASM-player iframe (captures mid-paint); trust DOM `getBoundingClientRect`, screenshot a 404 scene for clean chrome captures.
- **Linked scene assets:** the pilot scene (`01.cv`) references a linked image `A4 - 1.png` not shipped alongside it, so the player logs "Failed to decode image" and renders without it. Linked image/font assets must be copied into `public/cavalry/scenes/` next to the `.cv`. Need a publish-flow convention for this.
- **Astro content cache:** adding a schema field after content is synced leaves the new field `undefined` in `entry.data`; clear `.astro/data-store.json` + `.astro/collections` and restart the dev server. Defend with a destructure default in the page regardless.
