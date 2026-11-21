# Campaign review and next priorities

Reviewed 21 November 2026 against the local game, its actual simulation, rendered map/town/battle screens, and browser fixtures. The final audit includes the newer GitHub work through 0cdd910 (faction competition, two-way stances, frontier incursions, balance changes and unified villages), integrated before publication. This is a development audit, not a reading of the player's private browser save. It is not a complete human campaign playthrough or evidence of player retention.

## What is implemented

| Area | Current state | Remaining weakness |
| --- | --- | --- |
| World | 128 connected settlements; resource sites, allied and hostile garrisons, claimable settlements, visible frontier marches | Faction colouring, competition, influence flips, power rankings and threat/supply/trade layers are implemented. Settlement-specific narrative problems remain a useful next step. |
| Economy | Local inventories, physical supply carts, workshop inputs, twelve enterprises, regional goods, finite export buyers, visible stores and treasury | Monthly enterprises and seasonal workshops require careful explanation; v0.52 adds finite restaurant customers, funded merchant contracts and material-based NPC arsenals. Longer campaign surplus still needs playtesting. |
| Armies | Automatic cross-city transfers, equipment-preserving refits, actual recruiting, officers, garrisons, nearest-hospital evacuation | The opening arsenal and manpower grants remain generous. Newer balance work adds levy pay, conquest recovery and scaled Xia pressure; measure their combined effect before changing them again. |
| Battles | Deployment, pause/orders, flanking/cover, field opportunities, persistent casualties and equipment recovery | The five authored continuing Chronicle encounters are the stronghold, royal rescue, river crossing, two-depot relief and fighting convoy withdrawal. Other conquest chapters still use regular campaign battles. Thirty chapters do not mean thirty bespoke battle maps. |
| History | Monthly campaign from 1120, nominally 84 months to early 1127; visible Jin advances and sieges; relief matters on arrival; continuation after either outcome | Later story logistics can take much of the preparation window; players need to send historical aid before reaching the late story chapters. |
| Politics | Spendable earned favour, town charters, real arsenal convoys, public works, command rights, market charters and defence compacts | Four Song blocs now compete for influence, react with two-way stances, exchange demands and tribute, and respond to raids. Campaign choice consequences can connect more directly to those blocs next. |
| Story | Three preserved opening chapters plus 27 continuing chapters across six acts, based on the documented reading through IV:165 | Later novel material remains outside the documented adaptation; the historical final act is an explicit game branch. |

## Delivered in v0.52

The two-depot relief siege and bridge convoy withdrawal now impose different tactical jobs and persistent grain consequences. All five companions evacuate physically after defeat and rest ten monthly turns at Qinghe, with a one-grade demotion; a companion still down after victory rests five. Regular officers have permanent battlefield death and catastrophic-defeat risk, stated before combat. Ordinary commanders keep the campaign playable while the five recover. Named companies, lineage, service histories, scars and memorials provide inspectable attachment.

Persistent Jin camps now train, provision, trade and launch real columns; historical invasions assemble from those actual reserves. Jin and Xia contest a connected frontier. Original Blender riders, soldiers and timber camps distinguish their graphics. Xia raid scaling and Qiang incursions have also been constrained to real sources rather than defence-based troop creation. This improves fairness, but long-run pressure after enemy depopulation needs a full playthrough.

Finite household spending limits restaurant scaling. Song arsenals need materials. Regional contracts consume finite buyer funds and pay on delivery. Town prosperity stages at 45/65/80 require supplied enterprises and grain and visibly improve existing plots. These changes implement the core of the economy/prosperity recommendations below; further regional acquisition options remain proposals.

Automated browser fixtures cover evacuation timing and blocked routes, permanent death and ordinary command, both new mission win/loss paths, cargo conservation, Jin production and historical sieges, finite spending and contract delivery, prosperity display and save migration. These checks establish implementation behaviour, not complete campaign balance or player retention. Next measure two representative campaigns before reducing the explicitly requested opening support.

## Delivered in v0.51

The board previews the next two chapters’ goals, local fees and scripted cargo, with a shortcut to ordinary supply staging; future story dispatches and rewards stay locked. All 27 continuing chapters now have authored execution orders, named stages covering their actual goals, contextual instructions and action shortcuts. The first six continuing chapters specify the intended military/economic sequence, local fees, staging locations, distinct battle jobs and the next institutional reward.

Each chapter has one optional feat, never a new mandatory gate. Actual training, actual manufacture, newly received export payments, battlefield casualties, three-person extraction or an inspectable reserve/institution determines the feat. New-work counters start when the chapter starts; old active saves receive a baseline without receiving retrospective work credit. Reserve feats subtract the ordinary completion fee. There are no speed deadlines or daily-attendance requirements.

Manual acceptance grants five base court merit. An earned feat adds eight base merit and two Qinghe prosperity, subject to the existing favour multiplier and prosperity cap. One persistent acceptance record prevents replay farming. Old completed chapters receive no retrospective payments.

Previously weak story promises now have inspectable effects: the stronghold improves gentry support, the capital concern grants a six-month market charter, the rescue improves court support and the dispatch station improves organisational readiness. Public audit, registered evidence, memorial compensation, occupation and hospital delegation have explicit effects. The next-chapter shortcut presents a consequential choice before locking it.

This mission update retains existing mandatory objectives, starting crossbows, settlement manpower grants, training costs, combat rules, saved progress and historical dates. It also preserves the newer remote balance changes, including paid local levies, recovery penalties after conquest, difficulty selected at campaign start and stronger income from sites/trade.

The integration checks also exposed a startup race in the newer village animation: workers/patients could be called before their renderer script loaded. Rendering now waits for those functions; a delayed-script browser test covers the race.

## Measured balance findings

- The fresh strategic fixture starts with **550 soldiers**, including opening support, and **1,060 stored crossbows and 1,060 leather armour**. Actual opening survivors can change army strength. This makes reserve checks easier than fresh-production or actual-delivery checks.
- The once-only **200 local militia per newly claimed settlement** still exceeds the Song village's 70-man long-term garrison cap. Newer balance code makes these levies draw pay, lowers conquest output initially to 50% and halves capture loot. The initial manpower grant remains an accommodation; evaluate the combined pay/recovery penalties before further nerfs.
- The nine scripted cargo routes total **47 road links** when using Qinghe as the default origin, except the fixed Youzhou return order. Capital cargo is eight links from Qinghe. This is a graph measurement, not an elapsed-time prediction: nearer owned depots, local stock, route closures and parallel work change the result.
- Explicit waiting objectives total **eight months**: county reform one, recovery one, rearmament six. Actual transport, core construction and production add time. Many ordinary preparations can run during travel; mission cargo currently dispatches only while its chapter is active.
- Core farms/workshops/construction settle every third monthly turn; enterprises and enterprise construction operate monthly. A single clearer calendar is more useful than adding another production rule.
- A level-one restaurant's listed base output is **48 silver/month** for **6 silver wages**, plus grain, salt and wine inputs. In v0.52, population, prosperity and real caravan traffic cap its separate household spending budget; wages and materials still apply. Large upgrades need an actual customer base.
- NPC army recruitment consumes real local inputs. v0.52 replaces the separate fixed Song equipment grants with material recipes and funds frontier invasions from local soldiers. Initial stocks, simplified civilian taxes and the explicit story grants remain gameplay abstractions; this is not a complete closed economic simulation.

## Priority recommendations

| Priority | Change | Reason and initial tuning target |
| --- | --- | --- |
| 1 | Make the first hour a complete small dynasty story | A home improvement, a distinct field problem and a visible appointment should form an understandable loop. Playtest for a meaningful decision every 2–4 monthly turns, not merely a report to dismiss. These are starting hypotheses, not measured player data. |
| 1 | Prepare later story contracts in advance | The two-chapter preview and ordinary forward-staging shortcut are implemented. Next, consider accepting future story contracts early while clearly separating staging from story completion. Preserve actual loading and travel. This reduces late crisis surprises without pausing history. |
| Delivered v0.52 | Add two more authored mission battles | A two-front relief siege and a retreating supply-column escort should reuse the player's real army and finite enemy garrisons. Distinct jobs, terrain, entry routes and aftermath matter more than additional enemy hit points. |
| Core delivered v0.52 | Unify NPC market production and army production | Purchase/replenish from actual producers with visible input shortages, local budgets and travel. Otherwise paid recruiting can coexist with an effectively free equipment tap. |
| 2 | Keep Story support; offer an optional Command preset | Easy/Normal/Hard Xia aggression already exists, with selection at campaign start. Preserve that work and current opening support. If needed after playtesting, add an explicit support/manpower preset rather than disguising economy changes inside aggression settings. Do not retrofit reductions into existing saves. |
| 2 | Give regions economic identities | Qinzhou: official markets and cavalry; Longcheng: paid craft industry and household settlement; Deshun: frontier supply; river towns: ferries and hospitals. Use visible demand, projects and local requests to express these roles. |
| Core delivered v0.52 | Give restaurants and luxury trades real demand | Tie customers to residents, prosperity, traffic and garrisons. Let second/third upgrades add variety or regional reach rather than multiplying money without a customer constraint. Keep exact revenue and input forecasts visible. |
| Core delivered v0.52 | Connect commanders to persistent local stories | Veterans should earn inspectable battle histories and operational distinctions. Governors can reduce delays or improve a specific local industry; avoid stacking broad percentage bonuses everywhere. |
| Delivered v0.52 | Make prosperity visible at a few strong thresholds | Unified villages now include actual hauling, workers, patients, unit liveries and updated models. Build on that with three clear prosperity stages that unlock housing, schools, market crowds and treasury activity. Residents and deliveries should reflect real jobs and stock rather than decorative abundance. |
| 3 | Build a post-Jingkang rebuilding campaign | After a fall: rescue households, reopen a road, restore a hospital and reconquer a depot. After a defence: manage court dependence, frontier settlements and the cost of supporting a larger realm. Keep both branches playable. |

## What to measure next

Play two representative runs: a new Story campaign and an existing campaign approaching 1125. Record monthly grain and silver surplus, idle-work reasons, delivery times, company losses, manual-battle decisions and the month each act completes. Compare manual and auto-resolved casualties and equipment recovery for matched forces. Verify that a player using visible instructions can get essential aid to Kaifeng without foreknowledge.

The desired pull is ownership: a town changes because its trades work; soldiers survive because they were trained and cared for; a historical disaster can be changed because the player prepared. The newer faction competition, frontier warnings, tribes, portraits and village work strengthen that identity. More currencies, routine popups or obligatory check-ins would obscure that loop.
