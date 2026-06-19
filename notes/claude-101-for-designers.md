# Claude 101 for Designers — Project Brief

**Status:** Parked (captured 2026-06-20, not yet prioritised)
**Origin:** Grill-me session, MR/CT main build context

## Problem

Designers on the team try Claude and stop. The dropout is driven by impatience and not seeing the value fast enough. They never had proper foundations, so the friction is structural, not motivational. This needs ground-up education, not tips and tricks.

## Key value propositions

1. **Sellable React component library** — theme-driven, token-based React components packaged and sold on Framer.
2. **Designer education platform** — ground-up Claude Code training that gets designers from zero to shipping prototypes independently.

The site is both the product (components) and the proof (built with the workflow it teaches).

## Audience

MR design team. Assume skill floor of zero (never touched a terminal, no GitHub/Vercel/Supabase accounts). The resource must be modular and progressive so people further along can skip ahead, but nobody hits a wall because a prerequisite was assumed.

## Scope decisions (locked)

- **Tool focus:** Claude Code desktop app. Not Claude.ai, not the CLI.
- **Primary outcome:** Designer can prototype something quickly and host it (git + Vercel + Supabase).
- **Format:** Live site (the medium proves the message — "this site was built the way we're teaching you").
- **Build approach:** Design in Figma first (exercises and improves our Figma MCP / design skills pipeline), then implement. Team has visibility on the full process.
- **Design system architecture:** Three layers — tokens/primitives, components, sections (larger elements composed from components).
- **Visual direction:** Own identity, content-forward (not MR branded). Clean, confident, good typography. Think Vercel docs meets Linear.
- **Theming:** Entire visual layer driven by a single style/token file (style.md equivalent). Swap it and the whole site re-skins.
- **Tech stack:** Next.js + React + Tailwind. CSS variables / theme config as the style layer.
- **Component reuse:** React components built to be packageable and sellable on Framer.
- **Ownership:** Noah builds v1 in its own repo.

## Content structure (draft)

1. What is Claude Code — what it is, why it's different, what it's good at for designers
2. Setup — install Claude Code, create GitHub/Vercel/Supabase accounts, connect everything
3. Your first conversation — how to talk to Claude Code (prompting, context, iteration)
4. Build something — walk through building a real prototype from a design idea
5. Ship it — git, deploy to Vercel, wire up Supabase
6. What's next — Figma MCP, existing codebases, advanced workflows

## Build sequence (when prioritised)

1. **Figma phase:** Build design system in Figma (tokens > components > sections > pages). Uses and stress-tests our Figma MCP skills.
2. **Implement:** Design-to-code via Claude Code. Next.js + React + Tailwind, theme-driven.
3. **Content:** Write the educational modules.
4. **Ship:** Deploy to Vercel, own repo.
5. **Package:** Extract React components for Framer marketplace.

## Secondary value

- Battle-tests and improves the Figma MCP / design skills pipeline
- The component library becomes a sellable Framer product
- Team watches the build process, which is itself educational

## Open questions (for when this gets prioritised)

- Supabase in module 1 or introduced as a "level 2" topic?
- How much of the Framer packaging constraint shapes the component API from day one?
- Does the site need auth/gating or is it fully public?
- Content voice — instructional/formal or conversational?
