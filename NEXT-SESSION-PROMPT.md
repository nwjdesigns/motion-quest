# Next Session: Cavalry Lab — info-panel type hierarchy (design in Figma first)

## Context

All 13 build issues (#1-#13) DONE. Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **172 Vitest tests across 20 files.** Astro 6, React, R3F, content collection, GitHub Pages, Cavalry WASM player with coi-serviceworker. Full status in `ROADMAP.md`.

**First real scene is live** as of 2026-06-16: `01` "Pilot: Time Offset + Stagger" (portrait 9:16). The publish pipeline is proven end-to-end. `particle-grid` + `01` are real; `exp-01`..`exp-30` are still placeholders.

**KEY:** Noah's renders are PORTRAIT-majority (9:16, Instagram Reels). Design portrait-first.

## Priority 1: Info-panel type hierarchy

The detail page's info panel (`src/pages/experiments/[...slug].astro`) carries the right content now — title, date, description, "MADE IN CAVALRY {ver} WITH" + tool tags, download/license/buy actions, nav — but the **type hierarchy reads weak**: everything sits at near-identical size/weight, sections feel cramped, tags and nav share a register. Noah called it "a bit weird."

**Process (do NOT freelance the design):** Noah wants to lay the panel out in **Figma first**, then I implement to match.
- Figma file: Switchyard — 2026, node `886-668` (https://www.figma.com/design/G7iUzDJYanNPEuvszIvW5d/Switchyard---2026?node-id=886-668).
- We were about to design-out the current panel's content into that Figma frame (via the `figma-generate-design` + `figma-use` skills) when we closed. Resume there: push the existing panel info into Figma so Noah can arrange the hierarchy, OR implement whatever layout he's drawn by the time you start. Ask which.
- Design principles already loaded in the `design` skill: dual-font (geometric sans body + mono caps for metadata labels), 8px grid, generous spacing, content wins. Mono caps for the small labels is already in place.

**Open sub-decision:** where the UI control panel (layout toggle / theme / external links) lives on the detail page. Noah raised this and we hadn't decided. Resolve before/with the layout.

## Priority 2: Real content + linked-asset convention

- `exp-01`..`exp-30` still placeholders. Noah hands a `.cv` path; I handle copy + markdown + commit DIRECTLY (don't tell him to run the CLI). Flow: `.cv` → `public/cavalry/scenes/`, `.png` → `public/cavalry/`, write `src/content/experiments/<slug>.md` (include `aspectRatio` — portrait is `0.5625`), restart dev server (404s until content re-syncs).
- **Open: replace-vs-new-slug.** Do real scenes replace the `exp-01..30` slugs, or land as their own named experiments? Undecided.
- **Linked assets:** `01.cv` references `A4 - 1.png` not shipped beside it (player logs "Failed to decode image"). Need a convention: copy linked image/font assets into `public/cavalry/scenes/` next to the `.cv`. Ask Noah to export them alongside.

## How I should work (from this session's corrections)

- For a small additive change, make it IN PLACE — don't escalate to a redesign, don't load design tooling unless asked, don't offer option menus. See memory `feedback_small_change_in_place.md`.
- If Noah says a reference/file is coming, WAIT for it before building against guesses.

## Known rough edges

- Astro content cache goes stale when a schema field is added post-sync → field reads `undefined`. Clear `.astro/data-store.json` + `.astro/collections`, restart dev server. Also keep destructure defaults (`tools = []`, `aspectRatio = 16/9`) in the page.
- `preview_screenshot` glitches on the WASM-player iframe (mid-paint); trust DOM measurements.
- Direction A letterboxing on off-aspect viewports (accepted).
- Untracked `after-effects/text_you_later_main.aep` is unrelated AE work — leave it; consider gitignoring `*.aep`.
