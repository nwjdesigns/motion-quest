# 2026-10-01: Marc Lou playbook, release cadence, web housing

Strategy session, no code. Opened from the Motion Quest folder.

## What happened

1. Noah pasted a screenshot of Marc Lou's ShipFast pricing page and asked whether we could make our own version. (Transcribed, not approved as a direction: three dark cards, Starter / All-in / a highlighted ShipFast + CodeFast bundle, struck-through anchor prices, ticked feature lists with greyed-out missing items, a "discount for the first N customers (N left)" banner, yellow and green CTAs.)
2. I swept the estate and found an existing pricing component in `EES/CLIENTS/SNAPLIST/landing-react/src/components/Pricing.tsx` (React 19 + Vite), and answered it as a design question. Noah added that "it's on GitHub".
3. **Correction:** he wasn't asking about the page design, he was asking whether we could build the product itself (pasted two pages of the playbook on ShipFast's launch). I answered: yes, and open-source equivalents exist (next-forge, Vercel's Next.js SaaS Starter, Open SaaS), then framed it as "would anyone buy ours".
4. **Correction:** he wasn't testing demand for a template; he was asking whether we could build and ship our own products the way Marc does. I answered: building isn't our gap; a reusable selling layer (payments, accounts, product page) and distribution are.
5. Noah asked me to read the playbook (`~/Downloads/Ive-made-3M-with-my-36-startups-Marc-Lou.pdf`, 33 pages). The method in brief: small bets measured in weeks, roughly 90% of products fail, building tools you use yourself, no free plan on paid products, free side tools promoting paid ones, launch videos as the distribution engine, and an audience built over years before the big hit.
6. Mapped it to us: building is proven; launch videos are Noah's craft and the biggest edge; the gaps are a reusable selling layer and public distribution. Two tensions, both his call: the stealth blueprint versus building in public, and Instagram-only versus wherever each product's buyers are.
7. Noah: so much is on ice that we could release every four weeks. I surveyed `EES/BUILDS` and `PLUGINS` and listed candidates by readiness (Champ, Text You Later, Poster Machine, a private Cavalry plugin, Screen Recorder/Dorus, Wiggle Room, the measurement tool idea).
8. **Decided:** the private Cavalry plugin is release 1, **free**, because it was inspired by other people's work. Recorded in that repo's directive and roadmap and in memory (`project_ees_release_cadence.md`); it is kept unnamed in this public repo.
9. **Decided:** next session is a **web design pass so every release has a home**. It is now the primary item in `NEXT-SESSION-PROMPT.md`, opening on the container question (this public repo, or a separate EES product site).

## Open

- Where the housing lives, and whose name it goes out under.
- Whether a paid checkout is designed now or with the first paid release.
- Snaplist's release state, assumed launched 2026-05-04 (it had a launch day), unconfirmed.
