# Next Session: Cavalry Lab — detail-page pixel-push (+ real content)

## Context

Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **203 Vitest tests across 21 files.** Astro 6, React, R3F, GitHub Pages, Cavalry WASM player. Full status in `ROADMAP.md`.

Last session (2026-06-19) fixed a **16:9 layout bug**: `--content-right` in the detail page was crushing the topbar/footbar to ~0px when a landscape scene filled a landscape viewport. Fixed by capping `--content-right` at `60vw`. Verified across desktop (1440x810), tablet (768x1024), mobile (375x812), both themes, portrait and landscape scenes.

Prior session (2026-06-17) shipped the **detail-page type-treatment redesign**: top bar (`MQ™` · nav · theme toggle), restructured title card, footer bar. Description removed from the page.

## Priority 1: detail-page pixel-push

Noah's verdict (2026-06-17): **"still quite a bit to pixel push but for now good enough."** It's NOT pixel-perfect to his mockup. **Ask him to re-paste the target mockup (or a fresh annotated screenshot)** and treat it as the source of truth. Likely areas (he saw these but DECLINED them last round — only act if he raises them):

- **Left-rail alignment:** the card *text* (title/tags/date) is indented ~28px from the `MQ™` wordmark and the `©2026` footer — the card's *edge* aligns with them, the text doesn't.
- **"Made in Cavalry" placement:** currently pushed to the far card edge by `space-between`.
- **Spacing/proportions** generally — title size, tag padding, card padding, row gaps. Measure the DOM before eyeballing.

### How to work (validated)
- **Measure before guessing.** Read real geometry first, offer concrete candidates. Don't freelance changes he didn't name.
- **Keep adjacent metadata in ONE typeface.**
- Match the mockup 1:1. Verify in the preview pane, drive real interactions, read state back.

## Priority 2: real content + linked-asset convention (unchanged)

- `exp-01`..`exp-30` still placeholders. Noah hands a `.cv` path; handle copy + markdown + commit DIRECTLY. Flow: `.cv` → `public/cavalry/scenes/`, `.png` → `public/cavalry/`, write `src/content/experiments/<slug>.md` (include `aspectRatio`; portrait = `0.5625`), restart dev server.
- **Open:** do real scenes REPLACE `exp-01..30` slugs or land as new named experiments?
- **Linked assets:** `01.cv` references `A4 - 1.png` not shipped beside it. Copy linked image/font assets into `public/cavalry/scenes/` next to the `.cv`.

## Known rough edges

- **Tablet topbar tightness:** at 768px wide with a 16:9 scene, the topbar has ~307px. Functional but tight — brand and nav can run close. Mobile breakpoint (600px) handles smaller widths.
- **Cavalry web-player typed attribute setters are BROKEN** — use generic `setAttribute({r,g,b,a})`. No group-name API.
- Scene 01 only exposes 2 Control Centre attributes (backgroundColor + strength). Menu/toggle/bounded-slider widgets are built but UNTESTED live.
- Astro content cache can go stale when a schema field is added post-sync. Clear `.astro/data-store.json` + `.astro/collections`, restart.
- `preview_screenshot` glitches on the WASM canvas paint, but captures the HTML chrome fine.
- Untracked `after-effects/text_you_later_main.aep` is unrelated AE work — leave it.
