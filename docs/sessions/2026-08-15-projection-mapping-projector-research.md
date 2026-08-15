# 2026-08-15 — Projection mapping projector research

Research-only session. No code, no files in `src/`, no tests. Noah asked for a value-for-money projector for projection mapping, then asked specifically about the Epson EB-X49.

## Why this matters to Motion Quest

Projection mapping would be a new **output medium** for the daily practice: Cavalry and After Effects scenes projected onto physical surfaces and objects rather than rendered to a flat 9:16 file. Same source scenes, different final surface. Nothing is committed yet; this is pre-purchase research.

Not currently on the roadmap as a build item. Filed under Backlog / ideas.

## Decision criteria, ordered by what actually decides mapping quality

1. **Can you hard-disable the automatic features?** Auto-keystone, auto-focus, auto-image-fit, HDR tone mapping, overscan. Non-negotiable: these re-adjust mid-session and the map drifts off the object. This single requirement rules out most Anker / XGIMI / Hisense-style smart projectors despite their brightness-per-rand.
2. **Native contrast, not lumens.** Mapping onto an object needs the unlit surround to go black or the illusion collapses. Single-chip DLP beats 3LCD here. Indoors with blackout, 2,500-3,500 ANSI is plenty; camera exposure does the rest. Watch for "dynamic" contrast figures, which are auto-iris marketing, not native performance.
3. **Throw ratio, measured before shopping.** Distance to surface divided by image width. Normal room wants 0.5-0.8:1 (short throw). This spec eliminates most options, so measure first.
4. **Lens shift over keystone.** Lens shift moves the glass and costs nothing. Keystone remaps pixels: dimmer image, softened edges, and that edge is the whole trick.
5. **Native 1080p over faux-4K.** Pixel-shift (XPR) smears hard mapped boundaries. Native 1080p DLP gives a crisper edge.
6. **Laser/LED over lamp.** Lamps dim as they age, which quietly drifts your look consistency across months. Laser is 20,000-30,000 hours.
7. **Fan noise** if recording sound in the same room.

## Headline recommendation

**Used ex-corporate / ex-rental business projectors, not new consumer boxes.** Install-class models (Epson EB-2xxx, NEC P-series, Panasonic PT-VW/VZ) carry real vertical *and* horizontal lens shift, which nothing new at the same price has.

| Budget | Pick | Notes |
|---|---|---|
| R6-10k used | Ex-corporate Epson EB-2xxx / NEC P-series / Panasonic PT-VW-VZ | Real lens shift. Check lamp hours before paying. |
| ~R17k new | Epson EB-FH52 (R17,139, tech.co.za, verified 2026-08-15) | 4,000 lm, 1080p, brightest per rand locally. Lamp not laser, mediocre 3LCD blacks, 1.32-2.14:1 throw needs distance. Lens shift NOT verified, confirm with dealer. |
| ~R20-25k new | Optoma ZH350ST | 1080p, 3,500 lm, laser, 0.5:1 short throw. Best new buy for indoor work. |
| R30k+ | Epson EB-L200SW, BenQ LH820ST class | Laser + short throw + proper install geometry. Overkill unless it becomes client work. |

## Epson EB-X49 verdict: no

Noah asked about this one directly (common SA budget unit, [R9,175 Laptop Direct](https://www.laptopdirect.co.za/Epson-EB-X49-p-288846.php) to R12,556 The Projector Shop).

**Killer spec: native 1024x768, 4:3.** Feed it 16:9 and you get 1024x576 of real image, roughly **590k pixels** against 2.07M for 1080p. Under a third of the detail, and no software fixes it because the panel is the panel. Mask edges land on a coarse grid, so every lit/unlit boundary staircases. That boundary is what mapping sells.

Secondary problems:

- 16,000:1 is **dynamic** (auto-iris). Native for this 3LCD class is nearer 2,000:1, so unlit areas sit in grey haze.
- Throw 1.48-1.77:1 standard. A 2m-wide image needs 3-3.5m of run-up; you cannot get the projector out of your own shot in a normal room.
- No lens shift. Auto vertical + horizontal keystone only (disableable in the Epson menu, at least).
- UHE lamp, [R2,468 replacement](https://www.myprojectorlamps.co.za/projector-lamps/Epson/EB-X49.html), dims with age.

**Exception given:** free or under about R2k used, take it. XGA is fine for learning how mapping feels in MadMapper before spending properly. Just not a purchase.

**Alternative named:** new Epson **EB-FH06** (1080p, ~3,500 lm), same family and menus. Rand pricing not verified, needs a local quote.

## Recommended next move (not yet actioned)

Rent a unit for a day from a Cape Town AV house before buying anything. A few hundred rand answers the two questions specs cannot: does the room go dark enough, and does mapping earn a place in the daily practice. It also yields the exact throw distance, which makes the purchase obvious rather than a guess.

## Software note

TouchDesigner's free non-commercial licence caps output at **1280x1280**, a real constraint for mapping. MadMapper or HeavyM are the cheaper honest routes.

## Open fork

Everything above assumes **interior surfaces and objects**. Building facade mapping is a 6,000+ lumen conversation and a completely different budget. Noah has not said which.

## Sources

- [Interactive & Immersive HQ, budget mapping setups](https://interactiveimmersive.io/blog/outputs/projection-mapping-setups-on-a-budget/)
- [ProjectorCentral, lens offset and shift](https://www.projectorcentral.com/Understanding-Lens-Offset-and-Lens-Shift.htm)
- [HeavyM projector selection guide](https://www.heavym.net/choose-your-projector/)
- [Epson South Africa EB-X49](https://www.epson.co.za/products/eb-x49-v11h982040)
- [B&H PowerLite X49 specs](https://www.bhphotovideo.com/c/product/1559243-REG/epson_v11h982020_powerlite_x49_projector_xga.html)
- [tech.co.za EB-FH52](https://tech.co.za/product/epson-eb-fh52-4000-ansi-lumens-3lcd-1080p-projector/)
- [Optoma ZW350e specs](https://www.optomaeurope.com/product-details/zw350e)
