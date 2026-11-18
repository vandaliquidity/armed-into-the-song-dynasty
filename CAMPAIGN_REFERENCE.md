# Campaign reference and adaptation constraints

Updated 2026-11-18. The maintained sequential reading ledger documents Volume I 1–88, Volume II 1–100, Volume III's 133 listed entries, and Volume IV 1–165: 486 of the 526 entries in the 2026-11-15 source snapshot. Later reading is not claimed as a completed full-novel audit. The serial is ongoing.

Version 0.22 implements a 30-chapter campaign (three preserved opening chapters plus 27 new chapters), using these documented arcs and a clearly separated game-history ending. See [campaign design](CAMPAIGN_DESIGN.md) and [reading ledger](STORY_LEDGER.md).

## User direction

Follow the web novel's campaign progression. Retain the game's altered/shortened character names; do not replace them with the original full names. Write game-specific dialogue and mission text. The user explicitly confirmed the naming choice on 2026-11-15. This is a creative constraint, not a legal assessment.

Preserve the already requested monthly turns, unlimited continuation, easier opening with crossbow support, village militia grants, physical logistics, automatic banner mustering and player-controlled mission starts. Those are gameplay accommodations. Do not present their quantities as facts from the novel.

## Source and access

The original is by 茶根儿, published on [Fanqie](https://fanqienovel.com/page/7616151491132279832). Its official contents list four volumes, moving from Qinghe to Longcheng, regional government/the Xia conflict, and the Jingkang-era story. That broad order is verified; chapter titles alone do not establish detailed events, motives or outcomes. As of this check the listing contains 526 chapters and the work is ongoing, so do not invent a completed canonical ending.

The official website exposes opening chapters and short later previews. Later official pages require the app or a signed-in membership for the full text. A further search found publicly readable chapter pages at [沙滩看书](https://www.shaqutongrui.com/book/105462.html) and [速读谷](https://www.sudugu.cc/6302/). The former normally splits a chapter into two pages; follow the actual Next page link before treating a chapter as finished. The latter may split it into several more pages. The militia and furniture passages overlap the official previews. A user upload is no longer a prerequisite for continuing the research.

These are third-party transcriptions, not official editions. Some wording differs from current official previews; dates, casualty figures, troop counts and ranks also conflict between chapters. Fictional weapon performance and alternate-history invasions require separate historical validation. The maintained ledger documents the first 486 entries of the 526-entry snapshot, not the complete serial. Volume III chapter 41 was a placeholder on both main mirrors; its full indexed text was recovered from [天天看小说](https://cn.ttkan.co/novel/pagea/chixierusong-chagener_229.html). A similarly titled short work by another author is not this source.

## Verified foundation and implications

| Evidence | Verified material | Proposed game implication (design, not a claim about the book) |
| --- | --- | --- |
| [Opening chapter](https://fanqienovel.com/reader/7617097262140768792) | The five specialists arrive with a crashed vehicle and finite modern supplies. Communications fail. | Begin with survival, recovery and ammunition decisions. Modern weapons should remain scarce. |
| [Village aftermath](https://fanqienovel.com/reader/7621396800775143961) | Local leaders seek the captain's help with captured equipment, casualties and settlement. Bereaved and wounded households take priority. Armour and bows are retained for defence. Local relief cannot be assumed. | Make village trust, care, recovered equipment and local legitimacy part of the opening, rather than only combat rewards. |
| [Medical chapter](https://fanqienovel.com/reader/7621444454242599449) | The medic and village helpers organise treatment after the attack. | Show medical training and civilian participation as part of settlement growth. |
| [First-force preview](https://fanqienovel.com/reader/7622619438939898430) | The captain begins intensive training with 35 selected villagers. | Treat militia discipline as an earned early milestone. The game's larger starting grant remains a difficulty adjustment. |
| [Commerce preview](https://fanqienovel.com/reader/7623020685585039934) | A furniture sale creates an early commercial opening through the signaller. Sequential reading through III52 further covers workshops, medicine, housing sales, cosmetics, alcohol, distribution and political protection. | Commercial success should fund wages, expansion, county revenue and the capital network, with staffing, materials and access to buyers as constraints. |
| [Qinzhou departure preview](https://fanqienovel.com/reader/7623350327042916926) | The captain and sniper depart with ten selected militia and locally made equipment. | Give the journey a deliberate party and equipment preparation stage. Do not infer the whole journey from this preview. |

## Gaps identified before v0.22 (implementation history)

- `missions.js` exposes three authored chapters, followed by repeatable frontier operations. It does not yet deliver the novel's four-volume story.
- `journey.js` adds a fictional caravan factor and trust branch. Existing saves may already depend on that officer, so replacing the story requires a compatibility plan.
- `field-command.js` awards abstract troop packages for the current three chapters. Sequential reading verifies distinct steps from village militia to county battalions, regional training authority, county civil authority, and acting Deshun military command (III43–47). These should bring existing officers, units and responsibilities into command.
- `history.js` supplies a seven-year preparation window as a prior user-requested pacing adjustment. The novel opens in May 1122; preserve the game's earlier start as a deliberate accommodation. The novel itself explicitly changes remembered history (III41).
- Commerce, medicine, workshops and diplomacy currently exist mainly as sandbox systems. The authored campaign should connect them to story events and visible consequences.

## Additional chapter evidence from the deeper search

These are paraphrased research notes, using game roles rather than copying full character names. They are not implemented missions.

| Volume / chapter | Readable source | Findings and adaptation implications |
| --- | --- | --- |
| I / 14 | [Page 1](https://www.shaqutongrui.com/book/105462/49285972.html), [page 2](https://www.shaqutongrui.com/book/105462/49285972_2.html) | The initial 35 villagers remain agricultural workers while training and guarding. Pay and relief from corvee help attract applicants; five more are accepted under selection rules. The signaller's examination ambitions require books and registration. Early missions should connect farming, discipline, wages and education rather than immediately creating a standing mass army. |
| I / 17 | [Page 1](https://www.shaqutongrui.com/book/105462/49285975.html), [page 2](https://www.shaqutongrui.com/book/105462/49285975_2.html) | The initial furniture sale becomes a repeat wholesale opportunity. Its income supports workshop growth, militia, tools and equipment. The medic argues for funded pharmaceutical work; the captain allocates responsibilities, wages and accounts, then plans the horse-selling journey. Commerce should visibly finance military and civilian improvements. |
| I / 26 | [Page 1](https://www.shaqutongrui.com/book/105462/49285984.html), [page 2](https://www.shaqutongrui.com/book/105462/49285984_2.html) | Successful aid to the neighbouring tribe leads to a sworn relationship, mutual assistance and an agreement to buy locally made hand crossbows. Allied help and equipment commerce should be earned through a shared operation, rather than only filling an abstract influence bar. |
| I / 78 | [Page 1](https://www.shaqutongrui.com/book/105462/49286036.html), [page 2](https://www.shaqutongrui.com/book/105462/49286036_2.html) | The military administration collects captured supplies, then formal rewards and appointments arrive. The captain receives a county military appointment. The signaller retains the civil examination route rather than joining the military register. Government progression should open distinct military and civil opportunities. |
| I / 88 | [Page 1](https://www.shaqutongrui.com/book/105462/49286046.html), [page 2](https://www.shaqutongrui.com/book/105462/49286046_2.html) | Existing county troops need reliable pay, replacement kit and training. Three battalions have an establishment of 1,500; trainers are distributed between them. Small anti-bandit operations precede a major fortified-bandit objective. Commercial routes, housing compensation, farming arrangements and soldiers' families are intertwined with reform. A command appointment should hand over an imperfect force to rebuild, not just grant free elite soldiers. |
| II / 32 | [Page 1](https://www.shaqutongrui.com/book/105462/49286079.html), [page 2](https://www.shaqutongrui.com/book/105462/49286079_2.html) | A new urban residential quarter brings resettlement, orderly streets, drainage, water provision, shops and a larger clinic. Town progression should visibly change living conditions, not only add production icons. |
| III / 43 | [Page 1](https://www.shaqutongrui.com/book/105462/49286191.html), [page 2](https://www.shaqutongrui.com/book/105462/49286191_2.html) | Wider frontier losses and command vacancies lead to an acting regional military appointment after a major victory. The capital learns about the captain's achievements and crossbow technology through official channels. This supports command growth through battlefield results, patronage and civil connections. This transcription contains inconsistencies in names and strength figures; do not reuse its exact figures without checking adjacent chapters or an official copy. |

The initial selective audit was subsequently extended by sequential reading documented through IV:165. The ledger records that deeper evidence; this table preserves the early audit links rather than defining the current coverage.

## Remaining source work and adaptation boundaries

Continue reading accessible chapter pages in sequence and maintain an event ledger with volume/chapter, source confidence, game alias, location, participants, prerequisite, player objective and lasting consequence. Separate verified events from gameplay inventions. Verify the order of appointments, larger commands, major battles, technology, commercial ventures and character turning points. Preserve player agency and label alternate outcomes. Retain existing save progress without duplicating troop or equipment grants. Do not ask the user for an upload again as a prerequisite while readable chapter sources remain available.

The original research changed no gameplay. The v0.22 implementation now connects the documented arcs to real campaign objectives, preserving the existing altered names and saved opening progress. Its final act is an explicit game-history branch, not an asserted ending of the novel.
