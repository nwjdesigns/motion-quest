# Cavalry Lab — Roadmap

Source of truth for project status. GitHub issues #1-#13 are all still OPEN (this project does not auto-close them), so use THIS file, not issue state, for what is done.

- **Live:** https://nwjdesigns.github.io/motion-quest/
- **Stack:** Astro 6 + React + R3F (three.js directly, no drei), content collection (Zod), GitHub Pages deploy, Cavalry WASM player (coi-serviceworker for COOP/COEP)
- **Tests:** 172 Vitest across 20 files
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

## Next up

1. **Info-panel type hierarchy + Figma layout.** The detail panel's type hierarchy reads weak — title/date/description/label/tags all sit at near-identical size and weight. Noah wants to design the panel layout in Figma FIRST (Switchyard 2026 file, node `886-668`), then implement. Paused mid-design-out. Open sub-decision: where the UI control panel (layout toggle / theme / external links) lives on the detail page.
2. **Real content.** `exp-01`..`exp-30` still placeholders (thumbnail + `.md`, no `.cv`); `particle-grid` + `01` are real. Noah provides the `.cv` path, Claude handles copy + markdown + commit. Open: do real scenes REPLACE the exp-01..30 slugs or land as new named experiments?
3. **Compositional/design craft.** Homepage identity (no visible title/author), typography (system-ui everywhere), entrance animations, panel design language. Noah flagged the site reads "low craft."
3. **Detail-page mobile.** The redesigned floating panels do not collapse on touch like the homepage UIPanel (no `☰` toggle). Add a touch-collapse + real-device gesture check (pinch/drag/tap can't be verified in desktop preview).
4. **Scene interactivity.** The player auto-binds cursor to Control Centre `double2`/`int2` attributes only; real scenes need those CC attributes exposed in Cavalry.

## Backlog / ideas

- Replace placeholder homepage UIPanel links (Instagram, Patreon, Scenery, Work with me) with real URLs.
- Consider a `vitest exclude` for `.claude/worktrees/` so test counts can't get inflated again.
- Detail-page layout: Direction B (framed 16:9 player on a themed stage) was mocked up and set aside in favour of A; revisit if the full-bleed letterboxing becomes a problem.

## Known rough edges

- Direction A keeps letterboxing: a 16:9 scene full-bleed on a tall viewport leaves margins (accepted tradeoff; real dark scenes look better than the white test scene).
- Three.js chunk-size warning on build (expected, three.js is large).
- `preview_screenshot` glitches on the WASM-player iframe (captures mid-paint); trust DOM `getBoundingClientRect`, screenshot a 404 scene for clean chrome captures.
- **Linked scene assets:** the pilot scene (`01.cv`) references a linked image `A4 - 1.png` not shipped alongside it, so the player logs "Failed to decode image" and renders without it. Linked image/font assets must be copied into `public/cavalry/scenes/` next to the `.cv`. Need a publish-flow convention for this.
- **Astro content cache:** adding a schema field after content is synced leaves the new field `undefined` in `entry.data`; clear `.astro/data-store.json` + `.astro/collections` and restart the dev server. Defend with a destructure default in the page regardless.
