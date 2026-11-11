# 2026-11-10: Short-form format research (what performs in motion, creative tech, art direction)

Research session, no code. Opened with no project folder; closed into Motion Quest on 2026-11-11 at Noah's request ("add any value to motion quest").

## The ask

"Find the top 10 performing vids for our motion/creative tech/art direction niche that we can use as content ideas for insta."

## What happened

1. Web search (four queries) returned general marketing blogs only. No reel-level view counts exist on the open web for this niche.
2. Instagram in the browser pane redirects every page to its login, including public profiles. I stopped and asked Noah to sign in.
3. **Correction:** "cant you go look via other 3rd parties for insta?" I tried them. Imginn is behind a bot check, Picuki redirects to Tikvib whose hashtag pages return "Content does not exist", HypeAuditor and Influencers.club are account-level and mostly paywalled, and search results limited to `instagram.com` show profiles with no counts. All dead.
4. **Correction:** "can you look on tiktok?" TikTok hashtag pages load without a login, and the page's own `item_list` responses carry play, like, share and save counts. This worked first time. I should have tried it before asking for a sign-in.
5. Pulled 883 videos across 11 hashtags and ranked them (table below).
6. Noah said to watch the ten. He interrupted the first video load: "why you doing generative design?" The browser pane had been left on `#generativeart`, one of the 11 hashtags I chose myself without naming them first. It supplied 24 of the 883 videos and none of the top 10. **No video was watched.**
7. Noah: "lets get some ideas together... or should we just do our own mini designs". My answer: do our own, and use the list as a format guide. **Nothing was decided and no ideas were written.**

## Method (reusable)

- Open `tiktok.com/tag/<tag>` in the browser pane. No login needed.
- Hook `fetch` and `XMLHttpRequest` in the page, keep every response whose URL contains `item_list`, and read `itemList[].stats` (`playCount`, `diggCount`, `shareCount`, `collectCount`), `createTime`, `video.duration`, `desc`, `author.uniqueId`.
- Scroll to load more pages. Move between tags with `history.pushState` plus a `popstate` event so the hook survives; a full navigation loses it and misses the first 30 videos.
- Re-fetching the signed `item_list` URL by hand returns an empty body. Only the page's own requests work.
- Run one tag at a time. Two scripts at once interleave and mislabel the tags.

Hashtags used (my choice, not Noah's): `#motiondesign`, `#motiongraphics`, `#touchdesigner`, `#creativecoding`, `#creativetechnology`, `#interactiveart`, `#projectionmapping`, `#generativeart`, `#artdirection`, `#creativedirector`, `#brandidentity`.

## Top 10 (posted May 2025 onwards, one per creator, off-niche removed)

Counts read on 2026-11-10. "What it is" is my reading of the caption; none of these were watched.

| # | Creator | Plays | Saves | Length | Posted | What it is (from the caption) |
|---|---|---|---|---|---|---|
| 1 | [zakshineman](https://www.tiktok.com/@zakshineman/video/7578964832246926614) | 34.8M | 206K | 15s | 2025-12-01 | "Shelves aren't so boring", projection mapping on a shelf |
| 2 | [indent126](https://www.tiktok.com/@indent126/video/7690280024573840671) | 30.9M | 676K | 61s | 2026-09-27 | Maths functions mapped to pitch, creative coding |
| 3 | [dfiftyd50](https://www.tiktok.com/@dfiftyd50/video/7556202990529563920) | 26.7M | 204K | 24s | 2025-10-01 | "The Toxic Filter Machine", a titled projection art piece |
| 4 | [tims.eye](https://www.tiktok.com/@tims.eye/video/7626377677313969416) | 25.6M | 117K | 10s | 2026-04-08 | "What's next?", a projection mapping series |
| 5 | [juniperdots](https://www.tiktok.com/@juniperdots/video/7678539945010679071) | 24.8M | 604K | 16s | 2026-08-27 | Tweened animation meme |
| 6 | [motion.by.nick](https://www.tiktok.com/@motion.by.nick/video/7584215648704777502) | 16.4M | 19K | 16s | 2025-12-15 | Projection mapping a snowman (After Effects, MadMapper) |
| 7 | [gabriel.riccieri](https://www.tiktok.com/@gabriel.riccieri/video/7554542882200292619) | 10.9M | 195K | 31s | 2025-09-26 | Anamorphic 3D video mapping made in Blender |
| 8 | [motionsoier](https://www.tiktok.com/@motionsoier/video/7608441102428835090) | 8.1M | 372K | 18s | 2026-02-19 | "Cerebro", a motion graphics piece on an anime |
| 9 | [sinnonz](https://www.tiktok.com/@sinnonz/video/7507796694839381254) | 7.6M | 144K | 19s | 2025-05-24 | Kinetic typography to a Daniel Caesar lyric |
| 10 | [klsr.av](https://www.tiktok.com/@klsr.av/video/7530701346450722070) | 7.0M | 142K | 24s | 2025-07-24 | Own music with own TouchDesigner visuals |

Just below the list: [emeraldlit_](https://www.tiktok.com/@emeraldlit_/video/7672159090004495634) (6.8M, After Effects play, project file offered), [gyumania](https://www.tiktok.com/@gyumania/video/7512472169704606993) (5.0M, a fake ad for a favourite drink), [ladydeersoap](https://www.tiktok.com/@ladydeersoap/video/7597700022473379080) (3.5M, "first project i made without a tutorial", TouchDesigner), [behind.chadari](https://www.tiktok.com/@behind.chadari/video/7670479973538401568) (1.6M plays, 522K likes, a creative director's behind-the-scenes; the best art direction match).

## Patterns

- **Projection mapping dominates.** Without the one-per-creator rule it takes six of the top ten. The roadmap already parks projection mapping as an output medium (hardware research, 2026-08-15); this is the first demand evidence for it.
- **Short wins.** Eight of the ten are under 25 seconds.
- **Saves cluster on motion graphics and typography.** Rows 2, 5 and 8 have the highest saves.
- **Series beat one-offs.** "What's next?" and "upgraded my table / monitor / shelf" kept landing with each instalment.
- **Fake brand ads sit just below the top.** "What if Apple made an ad for Spotify" pieces ran between 600K and 2M.
- **Art direction is thin** on these hashtags. Nothing in that lane reached the top 10.

## Limits

- These are TikTok numbers, not Instagram. Instagram is the only channel for this project, so treat the formats as a guide and the counts as indicative.
- Hashtag pages show TikTok's own selection of roughly 100 videos per tag, not a complete census.
- Captions and counts only. Nothing was watched.
- The 883-row dataset lived in the browser page and was not saved. Re-run the method above to rebuild it.

## Open

- Whether to make our own mini designs or build ideas from the list. Noah raised it; undecided.
- If mini designs: what they are. Noah originates; nothing was proposed.
- Whether to watch the ten before using them.
- Which hashtags count as the niche. Noah has not confirmed the 11.
- I asked which account this is for and suggested screen-recording existing pieces as a cheap test. Both were written before I had read this project's record, which says Instagram, Noah's own account. The screen-recording suggestion is mine and unreviewed.
