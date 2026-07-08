# Poster Machine — Rig Spec (v2, grid-first)

**Date:** 2026-07-08
**Status:** Ready to build (Cavalry work, Noah's hours). Layer 1 is the next session.
**Purpose:** First sellable rig. Tester for the "strangers pay for NWJ Cavalry products" hypothesis. Zero new infrastructure: publishes to Motion Quest, playable via the web player's on-scene control panel, sold via `stripeLink` frontmatter.
**Supersedes:** v1 of this spec (2026-07-08, same day). Noah's call: "break it down into grid/column editability and that will define everything else." The grid is not a feature of the rig; the grid IS the rig. Everything else rides on it.

## The product in one sentence

An editable typographic grid system for Cavalry: set columns, margins and gutters, snap type to the grid, and animated kinetic-type posters fall out the other end.

## Why grid-first

- Swiss poster logic: lock the layout system, and type, colour and animation become passengers
- Each layer ships on its own: publishable to the site after every session instead of going dark until a finished product exists
- Differentiator: marketplaces sell free-transform templates; nobody sells a layout *system* for motion
- If energy dies at any layer, the layers already shipped were still worth making

## Hard constraints (from the shipped web player)

- Exposed controls must be flat Control Centre attributes. Renderable widget kinds: **slider, scrubber, menu, toggle, colour, text**. Menus only appear for enum attributes; a custom int renders as a stepped slider
- Web player API: generic `setAttribute`/`getAttribute` only (typed setters broken), no group API
- Portrait-first: master comp **9:16**, 1080x1920, 30fps (site renders are portrait-majority for Reels)
- Comp background colour is proven exposable (scene 01 exposed exactly that attribute)

## Build layers

### Layer 1 — the grid itself (one session, publishable as "Grid Study 01")

An editable column grid as a playable object. Dragging Columns re-flows the composition live in the browser.

**Controls (5):**

| Control | Type (widget) | Range | What it does |
|---|---|---|---|
| Columns | int (slider) | 1-8 | Number of columns |
| Margin | double (slider) | 0-200 | Outer margin, px |
| Gutter | double (slider) | 0-100 | Space between columns, px |
| Ink | colour | any | Column/type colour |
| Paper | colour | any | Comp background colour |

**Cavalry recipe (all known nodes):**
- One Basic Shape rect as the column unit
- Math node computes column width: `(1080 - 2*margin - (columns-1)*gutter) / columns`
- Duplicator, linear distribution: count = Columns, spacing = column width + gutter
- Stagger the columns rising in (scene 01 muscle memory) so Layer 1 already loops as a study
- Right-click each attribute → Add to Control Centre

### Layer 2 — type snaps to the grid (publishable as a layout toy)

Add the word. Position locks to grid cells, size is expressed in grid units.

**Controls added:** Text (string → live text widget on the site), Cell (int → Math → x/y placement), Span (type spans N columns).

**Open technical question (test first in-app):** whether Text Shape bounds are readable so Span can mathematically snap type width to N columns. Fallback: Span becomes a plain scale slider. This is the first thing to check when Layer 2 starts.

### Layer 3 — animation rides the grid (this is the sellable Poster Machine)

Rise/Wave/Pulse styles, simplified because they inherit the grid: rise happens within cells, waves travel along columns, pulse maps to grid cells.

**Controls added:** Style (int 1-3, stepped slider in browser), Speed, Seed.

**Verified Cavalry techniques (checked against docs 2026-07-08):**
- A Text Shape is a **sub-mesh**: behaviours treat each glyph as a child. Per-character animation = apply a behaviour (e.g. Oscillator), then **Stagger** offsets it across glyphs. This is the docs' canonical pattern
- **Sub Mesh Deformer** for direct per-glyph transform control; its Recursion setting switches characters vs words
- **Text on a path is native**: drag a spline into the Text Shape; alignment anchors to the path's start/centre/end
- **Duplicator echo trick** (docs canonical, and it is the Stack preset for free): Text Shape into a Duplicator, second Stagger on the Duplicator's Shape Time Offset + Position, Colour Array on fills
- Style switch: each style in its own group, one exposed int driven through **Comparison / If Else** utilities into each group's Visible attribute
- Unverified judgment calls (simplify if they fight for more than 20 min): Speed as a frequency/strength multiplier through Math into each behaviour (not comp time remapping); exact travelling-wave setup (fallback: Oscillator + Stagger on glyph Y, skip the path)

Docs migrated to cavalry.studio/docs (old scenegroup URLs redirect). References worth the "tutorials are reference" exception: Chris Hardcastle "Smarter ways to work with Text in Cavalry" and Ian Waters "Text in Cavalry" (both Medium, Cavalry team).

## Font (licensing decision, matters for selling)

Ship with an SIL OFL typeface so the `.cv` file is legally sellable with its font. Recommended: **Space Grotesk** (poster-weight character, OFL, free). Alternatives: Archivo, Instrument Sans. Do NOT build on Helvetica Neue: it cannot ship with the file.

## Loop + comp

- Master comp: 1080x1920 (9:16), seamless loop, 6-8s at 30fps
- Layer 1/2 studies: continuous loop. Layer 3 posters: in → hold → out so the loop cuts clean
- Version comps referencing the master: 1:1 (1080x1080) and 4:5 (1080x1350) via render queue

## Presets (Layer 3, shipped as settings recipes in the README + launch content)

1. **Broadside** — Rise, density 1, black ink / bone paper
2. **Marquee** — Wave, density 6, warm white on deep navy
3. **Stack** — Rise, density 8, tight leading echo stack (the Duplicator echo trick)
4. **Optician** — Pulse, density 12, ink on ink
5. **Signal** — Wave, density 3, one loud colour pair

## Buyer deliverable (the Stripe purchase)

- The `.cv` scene file (controls exposed exactly as on the site)
- Font files + OFL licence
- README: quickstart, the 5 presets as settings recipes, render/export notes
- Licence: personal + commercial use in end products; no resale/redistribution of the rig itself

**Price: $19 launch.** Raise later with preset-pack tiers.

## Launch loop (once Layer 3 exists; Layers 1-2 publish as free playable studies along the way)

1. Publish to Motion Quest (`npm run publish -- poster-machine.cv "Poster Machine"`), add `stripeLink` + `license` to frontmatter
2. Create the Stripe payment link ($19, one product, no store)
3. Daily series on IG/X: one word, one poster, alternating presets; every post links to the playable page
4. One "how it works" process post mid-week (the control panel screen-capture IS the demo)

## Success measure (tester, 4 weeks from Layer 3 launch)

- Primary: **1+ genuine stranger purchase**
- Secondary: playable-page visits from social, time-on-page, DMs/replies asking about the rig
- If zero sales in 4 weeks: the Kay build (merlin #41-#51) stays parked and we rethink the offer (price, product, audience) before touching infrastructure

## Open items (Noah's call, none block Layer 1)

- Product name: **Poster Machine** (working). Alternatives: Playbill, Broadside, Typesetter
- Final font pick (Space Grotesk recommended)
- Whether site listings replace placeholder slugs or land as new named experiments (existing open roadmap question)
