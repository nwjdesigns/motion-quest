# Next Session: Cavalry Lab

## Context

Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **356 Vitest tests across 31 files.** Astro 6, React, R3F, GitHub Pages, Cavalry WASM player. Full status in `ROADMAP.md`. PRDs: `prd-cavalry-lab.md`, `prd-homepage-identity.md`.

Last session (2026-06-22) completed the **entire homepage identity pass (#16-#21)** via multi-agent parallel worktree build. All 6 issues built, tested, and committed on main. Main is 5 commits ahead of origin (not yet pushed).

## Immediate TODO

1. **Push to origin.** `git push` -- 5 commits waiting.
2. **Close GitHub issues #16-#21.** All are built and committed. Use `gh issue close`.
3. **Visually verify deployed site.** After push triggers GitHub Pages deploy, check both homepage and a detail page in browser. Confirm: mark rotates on orbit, entrance staggers on fresh visit, carousel dots show between Prev/Next, forward morph animates on node click, reverse morph plays on Gallery click, underline draw-on hover on action buttons, responsive at 600px.

## What's next after verification

See `ROADMAP.md` "Next up" for the full list. Top candidates:
- **Real content.** Replace placeholder experiments with real Cavalry scenes as Noah publishes them.
- **Detail-page pixel-push.** Noah parked this -- only revisit when he raises it with a mockup.
- **Detail-page mobile.** Touch-collapse panels, real-device gesture check.
- **Times New Roman.** Held in reserve for accent typography. Noah will say when.

## Multi-agent build learnings (for future reference)

- Wave-based integration works well: group independent issues into Wave 1, then sequentially integrate dependent issues
- ConstellationScene.tsx is the merge bottleneck -- every feature touches it
- Agents that branch from old commits can't be cherry-picked; need full manual merge
- **Polish/audit agents go out of scope.** They see the full codebase and delete things from other issues. Future prompts for these agents must say "do NOT remove any existing code/features, only ADD or MODIFY"
- `vitest.config.ts` now excludes `.claude/worktrees/**` to prevent test count inflation
