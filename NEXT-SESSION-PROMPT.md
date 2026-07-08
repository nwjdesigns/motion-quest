# Next Session: Poster Machine — Layer 1 (grid rig)

## Context

Site live at https://nwjdesigns.github.io/motion-quest/. Repo public. **356 Vitest tests across 31 files.** Astro 6, React, R3F, GitHub Pages, Cavalry WASM player. Full status in `ROADMAP.md`. PRDs: `prd-cavalry-lab.md`, `prd-homepage-identity.md`, **`prd-poster-machine.md` (ACTIVE)**.

Last session (2026-07-08, planning) locked the venture direction: sell Cavalry rigs on this site, starting with **Poster Machine**, built grid-first in three publishable layers. Full spec in `prd-poster-machine.md` (v2). The bigger Merlin "Kay" business-partner agent (merlin #41-#51) is PARKED pending this tester: 1 genuine stranger purchase within 4 weeks of the Layer 3 launch, or we rethink the offer before touching infrastructure.

## Immediate TODO

1. **Layer 1 is Noah-in-Cavalry work**: the editable column grid (Columns, Margin, Gutter, Ink, Paper; Math node for column width, Duplicator linear distribution, Stagger entrance; recipe in the spec). One session, all known nodes. Claude's role while that happens: nothing until a `.cv` exists.
2. **When the `.cv` lands**: publish it (`npm run publish -- <scene>.cv "Grid Study 01"`), write copy/frontmatter, handle linked assets (see rough edge below: linked images/fonts must be copied into `public/cavalry/scenes/` next to the `.cv`), verify the on-scene control panel renders all five controls, commit + push + check the live page.
3. **Open decision (existing)**: does real content replace `exp-01..30` placeholder slugs or land as new named experiments? First real publish forces the answer.
4. **Untracked file `after-effects/text_you_later_main.aep`** still awaiting Noah's call: keep in repo or gitignore.
5. **Untracked `.claude/worktrees/`** in the working tree; should probably be gitignored, ask Noah.

## Layer roadmap (spec is source of truth)

- **L1 grid rig** → publishable "Grid Study 01" (playable grid toy)
- **L2 type snaps to grid** (Cell + Span controls) → layout toy. FIRST in-app check: are Text Shape bounds readable for Span maths? Fallback: Span = plain scale slider
- **L3 animation styles** (Rise/Wave/Pulse riding the grid) + font packaging (Space Grotesk, OFL) + $19 Stripe link → the sellable Poster Machine + daily "one word, one poster" content series

## Standing items (unchanged)

- Detail-page pixel-push: parked until Noah raises it with a mockup
- Detail-page mobile: touch-collapse panels, real-device gesture check
- Times New Roman: reserved for accent typography, Noah will say when
- Dead code: morph library files (`morph.ts`, `morph-animation.ts`, `transition-orchestrator.ts`, `reverse-morph.ts`) + tests unreferenced; clean up when convenient
