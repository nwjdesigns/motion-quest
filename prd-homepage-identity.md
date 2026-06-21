# PRD: Homepage Identity Pass

## Problem Statement

Someone lands on Motion Quest and can't tell what it is, who made it, or why they should care. The homepage is a full-bleed 3D constellation on system-ui with no visible title, no author presence, and no entrance choreography. The detail page has a type system (wordmark, mono-caps tags, sized hierarchy) but the homepage has none of it. The two pages feel like different sites. For a motion design portfolio, the homepage itself doesn't move. And the page transition between them is a solid-colour cover-up rectangle, not a real morph.

## Solution

Give the homepage a voice. Replace the text wordmark with a dynamic SVG pinwheel mark that reacts to user interaction (spins on orbit, bursts on navigation, reverses on back). Establish consistent chrome across pages (top bar, footer). Apply a proper type system (Helvetica Neue + mono). Kill the UIPanel. Build a real thumbnail-to-player morph transition using Astro View Transitions with a 3D-to-DOM snapshot handoff. Make the return journey equally seamless with a full reverse morph. Add a carousel dot indicator on the detail page. Implement a staggered entrance. Go fully monochrome — let the experiment thumbnails be the only colour.

## Decisions

| # | Question | Choice | Rejected |
|---|----------|--------|----------|
| 1 | Brand presence level | Bookended: mark top-left, footer bottom, consistent across pages | Minimal (mark only), Statement (mark + tagline) |
| 2 | Wordmark format | SVG pinwheel mark replaces text `MQ™` everywhere | Keep text wordmark, mark + text lockup coexisting |
| 3 | Mark behaviour | Dynamic: idle spin (~0.5 RPM), orbit-reactive speed, burst on nav, CW forward / CCW back, faster during loading | Static mark, rotation on hover only, page-transition-only animation |
| 4 | Mark colour | Uses `--mq-text`, theme-reactive | Fixed colour, accent colour, dedicated token |
| 5 | Homepage structure | Consistent 64px top bar (mark left, theme toggle right, centre empty) | Floating mark (no bar), mark integrated into UIPanel |
| 6 | UIPanel | Kill it. Theme toggle → top bar. Layout toggle → keyboard shortcuts (1/2/3) | Restyle it, minimise to icon, keep with link updates |
| 7 | Entrance | Staggered reveal, specific sequence TBD during build | Simultaneous fade, no entrance, mark-led entrance |
| 8 | Typography | Helvetica Neue primary (UI/nav/body), system mono (tags/meta). Times New Roman held in reserve | System fonts only, full three-font system now, single loaded font |
| 9 | Colour philosophy | Fully monochrome chrome. Thumbnails are the only colour. No accent | Iridescent/chromatic accent, semantic colour, single green accent |
| 10 | Themes | Both dark + light stay | Dark only |
| 11 | Footer | Copyright left, live links right (Instagram only for now). Same bar both pages | Links in killed UIPanel, no footer, copyright-only |
| 12 | Carousel indicator | 7-dot sliding window. Active dot elongated. Edge dots scale down. No colour | Dots (all same size), fraction counter, progress bar |
| 13 | Page transition (forward) | Thumbnail morphs into player. Astro View Transitions. Snapshot approach for 3D→DOM handoff | Solid cover-up overlay (current), crossfade, camera zoom |
| 14 | Page transition (return) | Full reverse morph. Player shrinks back to node position. Chrome fades. Constellation rebuilds | Asymmetric (simple crossfade back), reverse camera zoom |
| 15 | View Transition implementation | Astro View Transitions API. Escalate to custom SPA only if needed | Custom SPA routing from the start, no framework help |
| 16 | 3D→DOM bridge | Snapshot: on click, DOM image placed at projected rect carries `transition:name` | Hidden DOM thumbnails synced to 3D positions every frame |
| 17 | Action button hovers | Cool hover effects TBD during build | No special treatment, always-on accent |

## User Stories

1. As a first-time visitor, I want to see a recognisable brand mark and author attribution on the homepage, so that I immediately know who made this and what I'm looking at.
2. As a visitor, I want the brand mark to spin gently while the page is idle, so that the site feels alive even before I interact.
3. As a visitor exploring the constellation, I want the mark's rotation speed to increase as I orbit, so that the interface feels responsive to my actions.
4. As a visitor clicking into an experiment, I want the mark to burst-spin forward, so that navigation has a signature moment.
5. As a visitor clicking back to the gallery, I want the mark to spin in reverse, so that I have a sense of spatial direction.
6. As a visitor, I want the mark to spin faster when something is loading, so that I have a non-intrusive loading indicator.
7. As a visitor, I want a consistent top bar across all pages with the mark and theme toggle, so that the site feels like one cohesive product.
8. As a visitor on the homepage, I want the top bar centre to be empty, so that the constellation has visual breathing room.
9. As a visitor on the detail page, I want centred navigation (Gallery / Prev / Next) in the top bar, so that I can move between experiments.
10. As a visitor on the detail page, I want a carousel dot indicator between prev and next, so that I know where I am in the collection.
11. As a visitor, I want the active dot to be visually elongated with surrounding dots scaling down at the edges, so that I have spatial context of nearby experiments.
12. As a visitor, I want the dot window to slide as I navigate, keeping the active dot centred, so that the indicator stays useful regardless of collection size.
13. As a visitor, I want a consistent footer across all pages with copyright and links, so that attribution and navigation are always available.
14. As a visitor, I want to use keyboard shortcuts (1/2/3) to switch constellation layouts, so that I can change views without hunting for a button.
15. As a visitor, I want the site chrome to be fully monochrome, so that the experiment thumbnails are the most visually prominent elements on screen.
16. As a visitor landing on the homepage, I want elements to stagger in rather than appearing all at once, so that the entrance feels choreographed and intentional.
17. As a visitor clicking a thumbnail, I want the thumbnail itself to morph seamlessly into the detail page player (no cover-up rectangle), so that the transition feels continuous and spatial.
18. As a visitor on the detail page clicking Gallery, I want the player to morph back into the thumbnail at its correct position in the constellation, so that the return feels equally seamless.
19. As a visitor, I want the page transition to bridge the 3D canvas and the DOM without a visible seam, so that the WebGL-to-HTML handoff is invisible.
20. As a visitor, I want the constellation to rebuild around the returning thumbnail on back-navigation, so that I re-enter the gallery exactly where I left.
21. As a visitor, I want the site typeset in Helvetica Neue with monospace for technical metadata, so that the typography feels considered and professional.
22. As a visitor on a dark background, I want the brand mark and all chrome to be light, and vice versa, so that the theme system applies uniformly.
23. As a visitor, I want interactive elements to signal their interactivity through opacity, weight, underline, or motion rather than colour, so that the monochrome system stays coherent.
24. As a mobile visitor, I want the same identity system (mark, top bar, footer) adapted to a smaller viewport, so that the experience is consistent across devices.

## Implementation Decisions

### Mark behaviour engine

The SVG mark is a React component that consumes multiple inputs and produces rotation/scale animation values:

- **State machine** with states: `idle`, `hover`, `orbit-active`, `nav-forward`, `nav-back`, `loading`
- **Orbit velocity input**: consumed from the Three.js camera controls (delta rotation per frame). Mapped to rotation speed via a response curve with deceleration (the mark doesn't stop instantly when orbiting stops).
- **Navigation bursts**: on forward navigation, a quarter-turn burst CW with ease-out. On back navigation, same burst CCW.
- **Loading state**: elevated RPM (~2-3x idle) while WASM player initialises or page is fetching.
- **Scale**: 32px height on homepage, 24px on detail page. Transitions between on page change.
- **Direction**: CW is the default/forward direction. CCW for back/reverse actions.
- The engine is a pure function from (currentState, inputs, deltaTime) → (rotationAngle, scale). The React component consumes these values to apply `transform: rotate() scale()`.

### Transition orchestrator

Forward sequence (homepage → detail):
1. Click node → `projectRect()` calculates screen position of thumbnail
2. DOM `<img>` element created at that exact rect with the experiment's thumbnail
3. Three.js canvas remains underneath
4. `<img>` element carries Astro `transition:name="experiment-player"`
5. Chrome (top bar, footer) begins exit animation
6. Astro navigation triggers → View Transition API morphs `<img>` to the detail page's player container (which carries matching `transition:name`)
7. Detail page chrome (top bar with nav, footer, card panel) enters with stagger

Reverse sequence (detail → homepage):
1. Click Gallery → detail chrome begins exit
2. DOM `<img>` placed at player position with `transition:name="experiment-player"`
3. Astro navigation triggers → View Transition API morphs `<img>` to the target position
4. Target position calculated from: saved camera state + layout algorithm + `projectRect()` for the specific slug's node
5. Constellation scene mounts, camera restored, nodes spring into position
6. Snapshot `<img>` removed once constellation is painted and node is at target position

### Entrance choreography

A sequencer function that takes an ordered list of `{ element, delay, duration }` entries and produces a timeline. The specific sequence (which elements enter first) is TBD during build, but the engine is the testable unit. Elements register with the sequencer; the sequencer respects dependency ordering (e.g., top bar must complete before its children animate).

### Chrome system

A shared layout component that renders:
- **Top bar** (64px fixed): Mark (left) + optional centre content (nav + carousel on detail) + theme toggle (right)
- **Footer** (56px fixed): Copyright (left) + links (right)

The component accepts a `page` context prop (`'homepage' | 'detail'`) and conditionally renders the centre nav and carousel. The mark component receives the behaviour engine's output for its transform.

### Carousel dot indicator

- Input: `{ currentIndex, totalCount, windowSize: 7 }`
- Output: `{ visibleIndices, activeIndex, scales }` where scales is an array of multipliers (e.g., `[0.5, 0.7, 0.85, 1.0, 0.85, 0.7, 0.5]` with the active dot getting a width stretch instead of uniform scaling)
- Edge behaviour: at collection start/end, the window clamps and the active dot shifts off-centre
- The scale curve is continuous (not stepped), producing a smooth size falloff from centre to edge

### Typography

- Load Helvetica Neue (or Helvetica Neue equivalent web font). Weights: 400, 500, 600.
- Apply as the `font-family` on `body` for all UI text.
- Monospace remains `ui-monospace, Menlo, monospace` for tool tags, dates, license text.
- Remove Georgia usage. Times New Roman is held in reserve (not loaded or used yet).

### Keyboard shortcuts

- Register on `window` `keydown` in the homepage constellation component.
- `1` → Constellation layout, `2` → Grid layout, `3` → Spiral layout.
- Ignored when an input/textarea is focused (respect focus context).
- Unregistered on unmount.

### Colour system update

- Remove `--mq-accent` and all references to the green accent.
- All interactive states use opacity, weight, underline, or scale — not colour.
- Thumbnails remain as-is (their natural colours provide the palette).
- Hover effects on download/buy buttons: TBD creative treatment during build (scale, underline, weight shift, or motion-based).

## Build Sequence

### Phase 1: Chrome + Typography
Ship the new top bar, footer, and font system. Kill the UIPanel. Add keyboard shortcuts. Both pages get the new chrome. The mark is static (SVG in position, no animation yet). This phase is independently shippable — the site gets its identity frame.

### Phase 2: Mark Behaviour Engine
Build the state machine and animation system for the mark. Wire orbit velocity from Three.js controls. Wire navigation events. Wire loading state from the player. The mark comes alive. Independently testable and shippable — visual enhancement, no functional dependencies.

### Phase 3: Carousel Indicator
Build the 7-dot sliding window with scale curve. Integrate into the detail page nav. Replaces the bare prev/next. Independently shippable.

### Phase 4: Entrance Choreography
Build the stagger sequencer. Wire it into the homepage (top bar → footer → constellation build-in). Define the specific sequence during build. Independently shippable — currently everything just appears, after this it enters with intent.

### Phase 5: Page Transition (Forward Morph)
Replace the solid-colour MorphOverlay with the snapshot approach. Integrate Astro View Transitions. Thumbnail morphs into player. Chrome exits/enters around it. This is the highest-risk phase — the 3D→DOM handoff and View Transition integration may require iteration.

### Phase 6: Page Transition (Reverse Morph)
Build the return journey. Target position resolution (layout + projection for the returning slug). Constellation rebuild timing. Player shrinks back to node. Depends on Phase 5 infrastructure.

### Phase 7: Polish
Monochrome cleanup (remove all accent colour references). Action button hover effects. Responsive tuning. Final timing adjustments across all animations.

## Testing Decisions

### What makes a good test here

Tests verify behaviour at architectural seams — the boundary where one system hands off to another. They test the contract (given these inputs, I get these outputs), not the implementation (how the animation renders on screen). Animation rendering, CSS transitions, and View Transition browser behaviour are NOT tested — those are verified visually during development.

### Test seams

**1. Mark behaviour engine (unit)**
- State transitions: given current state + event → new state
- Velocity mapping: given orbit delta over time → rotation speed output
- Deceleration: given orbit-stop event → speed decreases over N frames to idle RPM
- Burst timing: given nav-forward event → rotation angle over time matches burst curve
- Direction: given nav-back event → rotation is negative (CCW)
- Scale: given page context change → scale interpolates between 32px and 24px
- Composability: given simultaneous inputs (orbiting + nav event) → highest-priority state wins

**2. Transition orchestrator (unit/integration)**
- Forward sequence states: idle → snapshot-placed → chrome-exiting → transitioning → detail-entering → complete
- Each state's entry conditions (e.g., snapshot-placed requires valid rect from projectRect)
- Each state's exit conditions (e.g., chrome-exiting completes before transitioning begins)
- Error handling: what happens if projectRect returns null (node off-screen)
- Reverse sequence: same state testing in reverse direction
- Target resolution: given slug + layout + camera → correct screen rect for return position

**3. Entrance choreography engine (unit)**
- Dependency ordering: element B depends on element A → B's start >= A's start + A's duration
- Stagger offsets: given 5 elements with 100ms stagger → starts at 0, 100, 200, 300, 400
- Combined: dependencies + stagger compose correctly
- Edge case: circular dependencies throw, empty timeline returns empty

**4. Carousel window engine (unit)**
- Centre-active: position 15 of 30, window 7 → indices [12,13,14,15,16,17,18], active=15
- Edge-start: position 0 of 30 → active shifts off-centre, no negative indices
- Edge-end: position 29 of 30 → active shifts off-centre, no overflow indices
- Scale curve: output scales are symmetric around active, continuous falloff
- Elongation: active dot returns a width multiplier distinct from scale
- Small collection: total < window size → show all dots, no scaling

**5. Chrome system (component)**
- Homepage context: renders mark + theme toggle, no nav, no carousel
- Detail context: renders mark + nav (Gallery, Prev, Next) + carousel + theme toggle
- Both contexts: render footer with copyright + links
- Theme toggle: fires callback on click, reflects current theme state
- Mark: receives and applies rotation/scale transform values from behaviour engine

**6. Keyboard shortcut handler (hook)**
- Mount: registers keydown listener on window
- Keys: '1' fires layout(constellation), '2' fires layout(grid), '3' fires layout(spiral)
- Focus guard: does NOT fire when activeElement is input/textarea
- Unmount: removes keydown listener (no leaks)
- Unknown keys: no-op, no error

### Prior art

Tests follow the existing project patterns:
- Pure function I/O assertions (like `morph.test.ts`, `projection.test.ts`)
- React hook testing via `renderHook()` + `act()` (like `use-media-query.test.ts`)
- Component rendering via React Testing Library (like `ui-panel.test.ts`)
- No external mocks beyond `window.matchMedia` pattern already established
- Numeric precision via `toBeCloseTo()` for animation values

## Out of Scope

- Times New Roman integration (held in reserve for when the site grows)
- Detail page content/card redesign (existing type treatment stays)
- Homepage constellation behaviour changes (layouts, physics, particles — unchanged)
- Real experiment content (new scenes, replacing placeholders)
- Linked asset publishing workflow
- Mobile-specific gestures for the constellation
- E2E browser testing (Playwright/Cypress)
- Footer links beyond Instagram (Patreon, Scenery, etc. added when live)
- Specific entrance sequence choreography (decided during build, not pre-specified)
- Specific action button hover effect design (decided during build)

## Further Notes

- The Astro View Transitions integration in Phase 5 is the highest-risk item. If the View Transitions API cannot handle the 3D→DOM snapshot handoff cleanly (timing, z-index, compositor issues), the fallback is a custom transition system that manually animates the snapshot element using WAAPI or CSS transitions, bypassing Astro's built-in View Transitions. The snapshot approach itself (DOM image at projected rect) remains valid either way — only the orchestration layer changes.
- Helvetica Neue is not a free web font. Implementation options: use the system Helvetica Neue (available on macOS/iOS, falls back to Helvetica/Arial elsewhere), or source a web font equivalent. Decision to be made during Phase 1 based on cross-platform rendering checks.
- The mark SVG provided by Noah includes a small ©/monogram element in the corner (paths at x~546, y~104). Confirm during build whether this detail is retained at 24-32px rendered size or simplified for legibility.
- The reverse morph (Phase 6) depends on the constellation being ready to receive the returning thumbnail. If the Three.js scene takes multiple frames to initialise after page load, the reverse morph snapshot may need to hold longer. The transition orchestrator's state machine handles this — it waits in `constellation-rebuilding` until the scene reports readiness.
