# PRD: Cavalry Lab - Experiments Site

## Problem Statement

Noah produces daily Cavalry experiments but has no public home for them. The work lives locally, invisible to potential clients, the Cavalry community, and social media audiences. There's no way for someone who sees a clip on Instagram to interact with the actual piece, browse the archive, or buy the scene file. The daily practice is happening but the compounding value (audience, revenue, reputation) is leaking.

## Solution

A website that serves as an interactive gallery of Cavalry experiments. The homepage is a navigable 3D space where floating thumbnails represent each experiment. Visitors explore the space, see dynamic connecting lines follow their cursor, and click into any experiment to play with it via the Cavalry web player. Each experiment page optionally links to a Stripe payment page for the scene file. The entire publishing workflow is: export scene + screenshot, write 5 lines of frontmatter, git push.

## Decisions

| # | Question | Choice | Rejected |
|---|----------|--------|----------|
| 1 | Site framing | Experiments-first; the volume IS the portfolio | Separate portfolio section, curated highlights reel |
| 2 | Traffic model | Social (top) -> site (middle) -> Stripe/Scenery/Patreon (bottom) | Site as top-of-funnel, direct sales site |
| 3 | Tech stack | Astro + React components (R3F for 3D, Cavalry player via iframe) | Pure React (Next.js/Vite), no-code (Framer/Webflow), CMS-backed |
| 4 | Hosting | GitHub Pages, `.github.io` subdomain to start | Cloudflare Pages, Vercel, custom domain from day one |
| 5 | Homepage | 3D space of floating thumbnails with layout switcher (grid/constellation/spiral) | Static grid, latest-experiment hero, hybrid hero+grid |
| 6 | Pixelation shader | Thumbnails sharp at viewport centre, intentionally pixelated towards edges | Uniform resolution, blur-based DOF, no effect |
| 7 | Mouse interaction | Dynamic connecting lines: cursor-to-thumbnails AND thumbnail-to-thumbnail, local network activates around cursor | Static connecting lines, tag-based connections, no lines |
| 8 | UI panel | Frosted glass, corner-tucked: layout toggle, external links, "Work with me", light/dark toggle | Navbar, sidebar, full settings page, no panel |
| 9 | Experiment page | Cavalry web player iframe ~80% viewport, title/date/one-liner, optional Stripe link, prev/next, back remembers camera | Overlay/modal on 3D scene, full-page with sidebar metadata |
| 10 | Page transition | Morph animation from 3D thumbnail to experiment page (route-based) | Fade, slide, no transition, overlay without route change |
| 11 | Typography | Sans-serif for UI (buttons, body), monospace for labels (3D space titles, dates) | All monospace, all sans-serif, display/decorative fonts |
| 12 | Text orientation | Horizontal labels only | Angled text along connecting lines (Craft26 style) |
| 13 | Visual tone | Light + dark mode, warm/editorial, inspired by craft26.vercel.app | Dark-only lab aesthetic, gallery/museum minimal, brutalist |
| 14 | Connecting lines meaning | Purely aesthetic, dynamic, mouse-driven | Tag-based semantic connections, chronological, static decorative |
| 15 | Monetization | Stripe payment links in frontmatter per experiment, no store infrastructure | Own store with auth/accounts, Scenery/Patreon only, Gumroad |
| 16 | Thumbnails | Manual screenshot, same folder/name as scene file | Auto-generated headless capture, video thumbnail extraction |
| 17 | Tags | None for now, may add later | Full tag system with filtering from day one |
| 18 | Particles | Ambient particle system in 3D space with DOF and scale variance | No particles, heavy particle effects, interactive particles |
| 19 | About page | None. The site IS the about. "Work with me" link in panel | Dedicated about/bio page, case studies section |
| 20 | Domain strategy | Free `.github.io` to start, custom domain when earned | Buy domain immediately, EES subdomain |

## User Stories

1. As a social media viewer, I want to tap a link from an Instagram post and immediately interact with the Cavalry experiment, so that I experience the work rather than just watching a video of it.
2. As a social media viewer, I want the experiment to load fast and be the first thing I see, so that I don't bounce before the interesting part.
3. As a first-time visitor, I want to land on an explorable 3D space of experiments, so that I understand the breadth and volume of work immediately.
4. As a visitor, I want to move my cursor through the 3D space and see connecting lines activate between nearby thumbnails, so that exploring feels alive and responsive.
5. As a visitor, I want to switch between grid, constellation, and spiral layouts, so that I can browse in whichever way feels natural to me.
6. As a visitor, I want thumbnails near the centre of my view to be sharp and those at the edges to be pixelated, so that the space has visual depth and draws my eye to what I'm focused on.
7. As a visitor, I want to see ambient particles floating in the 3D space with depth of field and scale variance, so that the environment feels atmospheric.
8. As a visitor, I want to toggle between light and dark mode, so that I can browse in my preferred visual environment.
9. As a visitor, I want to click a thumbnail and see it morph-transition into the full experiment page, so that the navigation feels cinematic and connected to the 3D space.
10. As a visitor on an experiment page, I want to interact with the Cavalry web player taking up most of the viewport, so that the experience is immersive.
11. As a visitor on an experiment page, I want to see the title, date, and a one-line description, so that I have minimal context without cluttering the experience.
12. As a visitor on an experiment page, I want to click prev/next to browse experiments sequentially, so that I can explore without returning to the 3D space each time.
13. As a visitor on an experiment page, I want to hit back and return to the 3D space with the camera exactly where I left it, so that I don't lose my place.
14. As a potential buyer, I want to see a "Buy scene file" button on experiments that have one available, so that I can purchase the `.cv` file.
15. As a potential buyer, I want the buy button to link directly to a Stripe payment page, so that purchasing is one click away with no account creation.
16. As a potential buyer, I want experiments without a scene file for sale to simply not show a buy button, so that the absence is invisible rather than a "not available" message.
17. As a potential client, I want to see a "Work with me" link in the UI panel, so that I can reach out if the work impresses me.
18. As a potential client, I want to see external links (Instagram, Patreon, Scenery) in the panel, so that I can follow or engage on other platforms.
19. As Noah (publisher), I want to add a new experiment by dropping a `.cv` file and screenshot, writing 5 lines of frontmatter, and pushing to git, so that daily publishing takes under 2 minutes.
20. As Noah (publisher), I want the site to auto-deploy on git push via GitHub Pages, so that there's no manual deploy step.
21. As Noah (publisher), I want the homepage to automatically include new experiments without touching any index or config file, so that the content collection is the single source of truth.
22. As Noah (publisher), I want to optionally add a Stripe payment link in frontmatter, so that monetization is per-experiment and zero-effort when I don't want it.
23. As Noah (publisher), I want the WASM runtime to be shared across all experiments, so that I only ship scene files, not runtime bundles per experiment.
24. As a mobile visitor, I want the 3D space to be navigable via touch (pinch to zoom, drag to orbit), so that the experience works on my phone.
25. As a mobile visitor on an experiment page, I want the Cavalry web player to fill the screen and respond to touch, so that interaction works without a mouse.

## Implementation Decisions

### Astro + React Islands

The site is an Astro static site. Pages that need interactivity (the 3D homepage, the experiment player page) use React components via Astro's React integration (`@astrojs/react`). Non-interactive pages (if any) ship zero JS. The 3D homepage is a single full-viewport React island.

### Content Collection

Experiments are an Astro content collection. Each experiment is a markdown file with frontmatter:

```yaml
---
title: "Particle Grid"
date: 2026-06-15
description: "Cursor-reactive dot matrix"
scene: "particle-grid.cv"
thumbnail: "particle-grid.png"
stripeLink: "https://buy.stripe.com/xxx"  # optional
---
```

The content collection schema enforces required fields at build time. The scene file, thumbnail, and WASM runtime all live in `public/` and are served as static assets.

### 3D Homepage (React Three Fiber)

A single R3F `<Canvas>` fills the viewport. Each experiment becomes a `<mesh>` with the thumbnail as its texture. Three layout algorithms position the meshes:

- **Grid**: uniform 3D matrix, experiments in rows/columns/depth layers
- **Constellation**: pseudo-random scatter with minimum distance constraints
- **Spiral**: chronological helix, newest at centre, oldest at the edges

Layout algorithms are pure functions: `(experiments: Metadata[]) => Position[]`. Switching layouts animates positions with spring physics (react-spring or R3F's useSpring).

### Pixelation Shader

A custom shader material on each thumbnail mesh. The shader samples the thumbnail texture at reduced resolution based on distance from the viewport centre. The centre threshold and falloff curve are tunable. This is a per-object shader, not a post-processing effect, so it respects depth naturally.

### Connecting Lines

A single `<Line>` component (from drei) redrawn each frame. On each frame:

1. Compute cursor position in world space (raycaster unproject)
2. Find all thumbnails within a radius of the cursor
3. Draw lines from cursor to each nearby thumbnail
4. Draw lines between nearby thumbnails that are mutually within range of the cursor

Lines fade in/out based on proximity (opacity driven by distance). Line colour follows the theme (light/dark mode).

### Particle System

An instanced mesh of small spheres/circles scattered throughout the 3D space. Each particle has randomised position, scale (variance), and a subtle drift animation. DOF is achieved via the same pixelation approach as thumbnails, or via a post-processing depth-of-field pass on the R3F scene. Particles should be visually subtle and not compete with thumbnails.

### Camera State Persistence

Camera position and rotation are serialised to a ref (not URL state) when navigating to an experiment page. On return (back button or explicit back navigation), the camera restores to the serialised state. Astro's view transitions or a shared layout component preserves the React state across route changes.

### Morph Transition

When clicking a thumbnail:

1. Get the thumbnail's screen-space bounding rect (project 3D position to 2D)
2. Navigate to the experiment route
3. The experiment page's player container animates from the thumbnail's rect to its final full-viewport position

This uses Astro view transitions or a shared animation orchestrator. The coordinate transform (3D world -> screen pixels -> transition anchor) is the critical path.

### Cavalry Web Player Integration

Each experiment page embeds the player in an iframe pointing at a shared player HTML page (ported from the spike's `index.html`). The iframe receives the scene URL as a query parameter. The shared WASM runtime (`CavalryWasm.js` + `wasm-lib/`) loads once per session. The player page must be served with COOP/COEP headers for `crossOriginIsolated` (required by the WASM runtime). GitHub Pages does not support custom headers natively, so the player page sets headers via a service worker or the iframe is served from a separate origin that supports headers (e.g. a Cloudflare Worker proxy), or the WASM runtime is tested to confirm it works without `crossOriginIsolated` on GitHub Pages.

### Theme System

Light and dark mode are driven by CSS custom properties on `:root`. The R3F scene reads theme values via a React context that maps to Three.js colours (background, line colour, particle colour, UI overlays). The experiment page iframe receives the theme as a query parameter or via `postMessage`. Toggle state persists in `localStorage`.

### Stripe Integration

No infrastructure. Each experiment's frontmatter has an optional `stripeLink` field. If present, the experiment page renders a "Buy scene file" button linking to that URL. Stripe payment links handle checkout, delivery, and receipts entirely on Stripe's side.

### GitHub Pages Deployment

Astro builds to static output (`output: 'static'`). A GitHub Actions workflow runs `astro build` and deploys to GitHub Pages on push to main. The WASM files in `public/` are served with correct MIME types by GitHub Pages by default (`.wasm` → `application/wasm`).

### COOP/COEP Header Challenge

The Cavalry WASM runtime requires `crossOriginIsolated` (COOP: same-origin, COEP: require-corp). GitHub Pages does not allow custom response headers. Options to resolve:

1. **Service worker shim**: a service worker intercepts responses and adds the headers. This is a known pattern (e.g. `coi-serviceworker`).
2. **Serve player from a different origin**: the iframe points to a Cloudflare Worker or Pages deployment that adds headers. The main site stays on GitHub Pages.
3. **Test without**: the WASM runtime may work without `crossOriginIsolated` (SharedArrayBuffer would be unavailable, but the runtime may not need it). Verify during development.

Decision to be made during Phase 1 based on testing.

## Build Sequence

### Phase 1: Astro Skeleton + Cavalry Player Page

Set up the Astro project with React integration. Create the content collection schema. Build a single experiment page that embeds the Cavalry web player in an iframe. Port the spike's `index.html` to a shared player page. Verify WASM loading and `setAttribute()` on GitHub Pages (resolve COOP/COEP). Deploy. At this point: the site has no 3D homepage, but individual experiment URLs work and are shareable from social media.

**Testable**: content collection validates frontmatter, player iframe loads scene, WASM renders, deploy succeeds.

### Phase 2: 3D Homepage - Static Layout

Build the R3F canvas. Load experiment thumbnails as textures on meshes. Implement one layout algorithm (constellation) with static positions. Orbit controls for camera navigation. Click a thumbnail to navigate to the experiment page (no morph transition yet, simple route change). Back button returns to 3D space (no camera state persistence yet).

**Testable**: layout algorithm returns correct positions for N experiments, thumbnails render as textures, click navigates to correct route.

### Phase 3: Layout Switcher + UI Panel

Add grid and spiral layout algorithms. Build the frosted glass UI panel with layout toggle. Animate layout transitions (spring physics). Add external links and "Work with me" to the panel.

**Testable**: all three layout algorithms produce valid positions, switching layouts animates smoothly, panel renders with correct links.

### Phase 4: Pixelation Shader + Particles

Implement the per-object pixelation shader (sharp centre, pixelated edges). Build the instanced particle system with scale variance and DOF. Tune the visual balance between thumbnails and particles.

**Testable**: pixelation falloff function maps viewport-centre distance to LOD tier correctly, particle positions have correct variance distribution.

### Phase 5: Connecting Lines + Mouse Interaction

Implement cursor-to-thumbnail and thumbnail-to-thumbnail proximity lines. Lines activate/deactivate based on cursor world-space position. Opacity fades with distance.

**Testable**: proximity graph function correctly identifies which connections activate for a given cursor position and thumbnail set.

### Phase 6: Theme System (Light/Dark)

Implement CSS custom properties for light/dark. Wire theme context into R3F scene (background, lines, particles). Propagate theme to iframe via postMessage or query param. Add toggle to UI panel. Persist in localStorage.

**Testable**: theme toggle propagates to all rendering contexts (DOM, R3F, iframe), localStorage persists preference.

### Phase 7: Camera Persistence + Morph Transition

Serialise camera state on experiment page navigation. Restore on back. Implement morph transition: 3D position -> screen rect -> animate to player viewport.

**Testable**: camera state serialise/deserialise round-trips correctly, 3D-to-screen projection produces correct pixel coordinates.

### Phase 8: Mobile + Polish

Touch controls (pinch zoom, drag orbit) on the 3D homepage. Responsive experiment page. Performance profiling at 50+ experiments. Progressive loading for thumbnails.

**Testable**: touch events drive camera correctly, experiment page renders at mobile viewports.

### Phase 9: Publishing CLI Script

A shell script or Node script that takes a `.cv` file path and title, generates the frontmatter markdown file with today's date, copies the scene and thumbnail to the correct directories, and optionally commits.

**Testable**: script produces valid frontmatter file, copies assets to correct paths.

## Testing Decisions

### What makes a good test

Tests verify external behaviour at defined seams, not internal implementation. A test should break when the feature breaks for the user, not when code is refactored. Visual/aesthetic qualities (does the pixelation look good, does the particle system feel right) are verified by eye in the dev server, not automated.

### Seams

1. **Layout engine**: pure function tests. Input: experiment metadata array. Output: position array. Assert correct count, no overlapping positions (minimum distance), bounds within scene limits. Test all three algorithms. Edge cases: 1 experiment, 200 experiments, switching algorithms preserves the same experiment set.

2. **Proximity system**: pure function tests. Input: thumbnail positions + cursor world position + activation radius. Output: which connections are active (cursor-to-thumbnail pairs, thumbnail-to-thumbnail pairs) and which LOD tier each thumbnail falls into. Assert: thumbnails outside radius have no connections, thumbnails at centre are LOD 0 (full res), thumbnails at edge are max LOD.

3. **Camera state round-trip**: unit test the serialise/deserialise. Input: camera position, rotation, zoom. Serialise to storable format, deserialise, assert values match within floating point tolerance.

4. **Content pipeline**: build-time validation via Astro content collections. A test experiment with valid frontmatter builds. A test experiment with missing required fields fails the build. An experiment with no `stripeLink` renders no buy button. An experiment with a `stripeLink` renders the button with the correct URL.

5. **Cavalry iframe contract**: integration test. The player page constructs the correct scene URL from query params. WASM loads without errors. A known `.cv` file renders a non-empty canvas. COOP/COEP headers are present (or the service worker shim is active).

6. **Theme propagation**: the toggle sets a CSS class/attribute on `:root`, the R3F context updates, and the iframe receives the new theme value. Assert all three rendering contexts reflect the same theme after a toggle.

7. **Morph transition coordinates**: pure function test. Input: a 3D world position + camera matrix + viewport dimensions. Output: screen-space pixel rect. Assert against known projections. This is the critical seam between the 3D scene and the page transition system.

### Prior art

No existing test infrastructure in this repo (greenfield). Use Vitest for unit tests (Astro's recommended test runner). Pure function tests for layout, proximity, camera serialisation, and coordinate projection. Astro's built-in content collection validation handles the content pipeline seam. Manual testing in dev server for visual/interaction quality.

## Out of Scope

- **Tag/filter system**: deferred. May add later when the experiment count warrants it.
- **Search**: not needed at current scale.
- **User accounts or auth**: no login, no saved preferences beyond localStorage theme.
- **Store/checkout infrastructure**: Stripe payment links only, no cart, no account, no order history.
- **Breakdowns/tutorials**: no process content on the site. That's for social captions or Patreon.
- **About/bio page**: the work IS the portfolio. "Work with me" link suffices.
- **CMS**: content is markdown files in git, not a hosted CMS.
- **Analytics**: can be added later (Plausible, Fathom) but not in initial build.
- **Custom domain**: `.github.io` for now, domain purchased when the project has momentum.
- **Animated thumbnail previews**: static screenshots only. Hover-to-play may come later.
- **Audio/sound design**: silent experience for now.
- **Scenery/Patreon integration beyond links**: no API sync, no auto-upload. Manual link in frontmatter.

## Further Notes

- **WASM runtime licensing**: Cavalry's web player runtime ships with the desktop app and is not on a public CDN. Confirm redistribution rights before deploying. The runtime is currently in the cavalry-spike repo under `runtime/cavalry-web-player/`.
- **GitHub Pages 1GB limit**: with WASM runtime (~3MB shared) + scene files + thumbnails accumulating daily, the repo could approach the limit within a year. Monitor size and migrate to Cloudflare Pages (no limit, equally free) if needed.
- **COOP/COEP is the highest-risk technical unknown**: GitHub Pages cannot set custom headers. The service worker shim (`coi-serviceworker`) is the most likely solution but must be validated early in Phase 1. If it fails, the player iframe may need to be served from a separate Cloudflare Worker origin.
- **Performance ceiling**: at 200+ experiments, the 3D scene will have 200+ textured meshes plus particles. Instanced rendering and LOD (low-res textures for distant thumbnails) should keep this performant, but profiling is needed once the count exceeds ~50.
- **The existing cavalry-spike at `/Users/nwj/Desktop/2026/MR/CT/MAKERS TABLE/cavalry-spike/` contains the proven web player integration**: WASM loading, `setAttribute()` at 60fps, transport controls, video asset pipeline, and a React component (`CavalryBackground.tsx`). This is the reference implementation, not the deployment target. Code will be ported and adapted, not copied wholesale.
