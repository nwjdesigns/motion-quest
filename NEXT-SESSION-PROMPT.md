# Next Session: Cavalry Lab — detail-page pixel-push (+ real content)

## Context

Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **203 Vitest tests across 21 files.** Astro 6, React, R3F, GitHub Pages, Cavalry WASM player. Full status in `ROADMAP.md`.

Last session (2026-06-17) shipped the **detail-page type-treatment redesign** from Noah's mockup: a full-width **top bar** (`MQ™` serif wordmark · centred `Gallery`/`← Prev`/`Next →` · theme toggle), a restructured **title card** (28px title with "Pilot:" dropped, **outlined mono-caps** tool tags wrapping 3+2, a `DDMMYYYY` date with the day bolded, "Made in Cavalry" with no version), and a **footer bar** (©2026 Noah Webster-James · Creative Tech). **Description was removed from the page** (schema field kept). `01.md` got British "Colour Array", reordered tags, and `cavalryVersion` 2.7.2. All in `src/pages/experiments/[...slug].astro` + `src/content/experiments/01.md`. Committed, pushed, deployed.

## Priority 1: detail-page pixel-push

Noah's verdict: **"still quite a bit to pixel push but for now good enough."** It's NOT pixel-perfect to his mockup. He works visually — **ask him to re-paste the target mockup (or a fresh annotated screenshot)** and treat it as the source of truth. Likely areas (he saw these but DECLINED them last round — only act if he raises them):

- **Left-rail alignment:** the card *text* (title/tags/date) is indented ~28px from the `MQ™` wordmark and the `©2026` footer — the card's *edge* aligns with them, the text doesn't. If he wants them on one rail, either bump the top-bar/footer left padding to the card-text x, or shift the card so its content lands on the page margin.
- **"Made in Cavalry" placement:** currently pushed to the far card edge by `space-between`. Narrowing the card softened it; he may want it tucked closer to the date.
- **Spacing/proportions** generally — title size, tag padding, card padding, row gaps. Measure the DOM (`getBoundingClientRect`) before eyeballing scaled screenshots.

### How to work (validated last session)
- **Measure before guessing.** When Noah says "alignment/spacing issues" vaguely, read the real geometry first and offer concrete candidates — he picks. Don't freelance changes he didn't name (`feedback_small_change_in_place`, strict-scope rules).
- **Keep adjacent metadata in ONE typeface** (he flagged the date being monospace next to a system-sans "Made in Cavalry").
- Match the mockup 1:1; his visual reference beats guesses. Verify in the preview pane, drive real interactions, read state back.

## Priority 2: real content + linked-asset convention (unchanged)

- `exp-01`..`exp-30` still placeholders. Noah hands a `.cv` path; handle copy + markdown + commit DIRECTLY (don't make him run the CLI). Flow: `.cv` → `public/cavalry/scenes/`, `.png` → `public/cavalry/`, write `src/content/experiments/<slug>.md` (include `aspectRatio`; portrait = `0.5625`), restart dev server.
- **Open:** do real scenes REPLACE `exp-01..30` slugs or land as new named experiments? Undecided.
- **Linked assets:** `01.cv` references `A4 - 1.png` not shipped beside it ("Failed to decode image"). Copy linked image/font assets into `public/cavalry/scenes/` next to the `.cv`; ask Noah to export them alongside.

## Known rough edges

- **Cavalry web-player typed attribute setters are BROKEN** (`setAttributeColor` returns zeros) — use generic `setAttribute({r,g,b,a})`. No group-name API. See `reference_cavalry_player_controls`.
- The new top-bar/footer layout is **bound to the player width** via `--player-w`/`--content-right` CSS vars on the `.page` wrapper. Responsive/real-device behaviour of that binding is UNVERIFIED (desktop preview only). Mobile media query is a basic fallback.
- Scene 01 only exposes 2 Control Centre attributes (backgroundColor + strength). Menu/toggle/bounded-slider control widgets are built but UNTESTED live (no scene exposes them yet).
- Astro content cache can go stale when a schema field is added post-sync → field reads `undefined`. Clear `.astro/data-store.json` + `.astro/collections`, restart. Keep destructure defaults in the page.
- `preview_screenshot` glitches on the WASM canvas paint, but captures the HTML chrome/control panel fine.
- Untracked `after-effects/text_you_later_main.aep` is unrelated AE work — leave it.
