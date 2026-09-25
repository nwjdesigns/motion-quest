# 2026-09-25: Meet invisibility cloak (idea capture)

Idea-only session. No code, no tests. Noah pitched a Chrome extension for Google Meet: wave your fingers in front of your face like John Cena ("you can't see me") and you disappear into the background; stop waving and you come back. His quality bar: "freaking solid", very reactive, high quality.

## Chronology

1. Noah pitched the idea; unsure where it should live (Motion Quest or a build in the EES parent).
2. Estate sweep across all lanes for segmentation and hand-tracking prior art (first grep failed on zsh globbing; re-run with quoted globs and `-i`).
3. Found `MR/CT/BUILDERS TABLE/lab/lib/hands.js`, a tested MediaPipe HandLandmarker wrapper (vendored, GPU, confidence 0.6). It is MakeReign code, so rebuild the pattern for EES rather than copy it. No person-segmentation code anywhere in the estate.
4. Recommended home `EES/BUILDS/` (beside Screen Recorder), not Motion Quest.
5. Technical read given: getUserMedia takeover on meet.google.com; MediaPipe segmentation with a running clean plate; oscillating hand-near-face gesture with hysteresis. Riskiest assumption named as the LOOK, cheapest test a local webcam-in/cloaked-out page.
6. Noah: log it on the roadmap. Added to `ROADMAP.md` Backlog.
7. Decision: the whole body vanishes, hand included ("having a hand visible ... will be too hard"). Noted detection is unaffected because tracking reads the raw camera.
8. Decision: hidden only while waving, back when waving stops (short hysteresis only).
9. Decision: edge is a shimmer carrying a very subtle army camo pattern; strength built as dials.
10. Decision: the shimmer is motion-driven while cloaked. Still means fully invisible; moving in frame shows shimmer where you moved. Consequence flagged: the waving hand will always shimmer a little.
11. Committed `54aae3b`. Noah asked about extension-side controls; proposed popup: on/off, Recapture background, Camo and Shimmer sliders, keyboard shortcut, status dot; gesture sensitivity not exposed.
12. Noah: keep the shortcut; "YEAH WELL OBVS EVERYONE SHOULD SEE ME TURN INVISIBLE?" My "badge vs secret" question was badly worded (I meant a "cloak installed" label); read as no badge. Committed `cd81d5e`.
13. Pushed both commits to `nwjdesigns/motion-quest` main (`1fddfe1..cd81d5e`).

## Correction

- Step 12: a question about whether others "see" the cloak, in a product whose entire point is being seen, read as absurd. Phrase the actual object ("a small label on your video saying the extension is on") rather than an abstraction.

## State

All product questions closed. Full spec lives in the `ROADMAP.md` Backlog entry "Meet invisibility cloak". Next step when Noah picks it up: grill-light / PRD, then Phase 1 is the local test page (look first), before any extension plumbing.
