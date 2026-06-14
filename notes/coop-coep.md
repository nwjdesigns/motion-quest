# COOP/COEP on GitHub Pages

## Problem

The Cavalry WASM runtime requires `crossOriginIsolated === true` in the browser context. This needs two HTTP headers:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

GitHub Pages does not allow custom response headers.

## Solution

Using `coi-serviceworker` (v0.1.7) by Guido Zuidhof. The service worker intercepts fetch responses and adds the required COOP/COEP headers client-side.

File: `public/coi-serviceworker.js`
Loaded via: `<script src="../coi-serviceworker.js"></script>` in `player.html`

On first visit the service worker registers, sets `crossOriginIsolated`, and reloads the page once. Subsequent visits are immediate.

## Alternatives considered

1. **Cloudflare Worker proxy**: serve the player iframe from a separate origin with real headers. More complex, adds a dependency, but would avoid the reload-on-first-visit.
2. **Test without**: the WASM runtime may work without `crossOriginIsolated` if it doesn't use `SharedArrayBuffer`. Not confirmed.

## If this breaks

If the service worker shim causes issues (e.g. with future browser security changes), the fallback is option 1: serve `player.html` and the WASM runtime from a Cloudflare Worker that sets real headers, and point the iframe to that origin instead.
