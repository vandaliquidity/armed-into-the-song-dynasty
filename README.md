# Armed into the Song Dynasty (持械入宋)

A browser strategy game.

**Play:** [https://vandaliquidity.github.io/armed-into-the-song-dynasty/](https://vandaliquidity.github.io/armed-into-the-song-dynasty/)

## Frontier update

- 95 connected settlements and 145 resource sites, with cities, market towns, forts and regional districts. District boundaries and satellite settlements are schematic gameplay geography.
- Song garrisons and Xia forces appear on the map. Song garrisons remain allied troops, separate from your recruitable roster.
- More starting supplies, local settlement stocks, richer enemy spoils and larger storage capacity. Existing campaigns receive one relief shipment; migration is repeatable without duplicating supplies or resetting progress.
- A single **Planning** stage covers construction, recruitment, trade and movement orders. **Resolve orders** executes movement and creates battles; **End month** advances one month. Three monthly order rounds make one season. Production, construction, training, research and upkeep settle once at season end, preserving the economy and historical calendar. Existing saves retain their seasonal date and start at the first month of that season.
- No turn limit, including after the Jingkang story chapter. Capturing Xingqing presents a victory milestone with **Continue campaign**. Losing your home still ends the campaign normally.
- A redesigned campaign HUD groups resources, navigation and dispatches, with a clickable realm overview, clearer monthly dates and a matching settlement-panel theme.
- Seven battlefield identities: farming hamlets, market towns, frontier forts, prefectural cities, pasture camps, river crossings and mining settlements. Terrain is seeded by settlement identity and persists on repeat visits. Each settlement has reachable key districts; enemy composition and reserve columns depend on its type.
- Assaults can win by securing districts; raids require capturing supplies and returning their actual carriers to the withdrawal point; defence can win by holding the granary through timed assault columns. Campaign battle outcomes still use the existing casualty, capture and loot systems.
- Warehouse piles fill from the top left. Each pile represents 50 units; hover for exact quantities. Gold and silver are kept in the official treasury. Qinghe shows the realm's shared silver reserve.
- Eight-step walking animations where supported, time-based convoy movement, loading pauses, and no second camera jump during logistics scenes. Small village figures retain their medium-resolution atlases to avoid large image swaps during loading.

### v0.9.1

Edict acknowledgement accepts mouse and keyboard input and closes with one action; the ceremony waits for acknowledgement. Leaving the village preserves the pending edict. The treasury uses an open-roof cutaway with visible reserve trays. **Bianliang at Dusk** is a new original qin- and flute-inspired score, with music controls in the campaign navigation. Settlement overviews now explain resource-site development, costs, supply requirements, seasonal delivery and workshop consumption.

### v0.9.2

**Send wounded** in the campaign navigation and battle result popup consolidates wounded soldiers toward their nearest reachable owned hospital, measured by distance along friendly roads. Healthy troops, unit assignments and movement orders stay in place. Patients move one road segment each month, receive the existing seasonal treatment rates, and rejoin their original unit where possible; overflow or orphaned patients recover into the hospital garrison. Missing or captured routes pause or reroute patients without losing them. Evacuations persist in saves. Wounded already at a hospital are admitted there, so they remain when the healthy army marches away.

### v0.10 — The Qinzhou Journey

Open **Missions → Qinzhou Journey** in campaign navigation. Bring the lead army and companions to Qinghe during Planning to start. Existing saves, including those that already completed the old Qinzhou chapter, can play the expedition once.

Prepare either the community or reinforced wagons, choose between a paid post road, an archer-filled gorge and a cavalry-threatened pasture route, then decide whether to promise a rescue. The promise makes the convoy wait at the hamlet and adds a rescue requirement to victory. All surviving wagons must reach the eastern marker; at least one must survive. Route geometry, enemies, costs and wagon speed differ. Casualties become actual campaign dead and wounded, and spent modern supplies persist. Unfinished tactical battles restart on reload; preparation and completed results are saved.

At Qinzhou, choose fair trade or higher cash returns. Lu Wan, a fictional merchant factor, joins the existing officer/governor system with two trust points, earned through helping Qinghe, rescuing villagers and fair dealing. On returning, expand Qinghe's actual market or hospital, receive the surviving cargo, open trade, and see the changes in the village. Failed expeditions grant no trade or chapter rewards; retries require fresh supplies. Completed choices cannot be replayed for rewards. The original chapter-two reward package is not awarded again.

The setting draws on Song frontier horse trade and established local craftsmanship; this expedition, its characters and its schematic routes are fictional. This is one connected narrative arc, rather than a rewrite of every campaign encounter.

### v0.11 — Roads and Companions

**Supply network** automatically requests workshop inputs and basic reserves from connected owned settlements. Carts use owned or allied Song roads, load visibly at the origin, travel one road link per month and unload at the destination. Materials and equipment are local: remote stocks cannot be spent instantly. Recruitment can order available remote equipment and waits for delivery before consuming manpower, silver and kit. Orders and shipments persist; incoming goods prevent duplicate requests. Closed roads reroute or pause cargo, and existing convoy raid/escort rules apply. Donors retain workshop inputs and baseline stocks (150 grain, 60 timber, 40 stone). The panel also supports manual stock targets and cancellation of waiting recruitment; dispatched cargo still belongs to its destination.

The five companions have larger base health pools (600/380/480/400/420), 20% additional damage reduction and one emergency survival window per battle. Numeric health bars and an E/R skill card make their condition and abilities clearer. Existing E skills remain; R provides Captain's Whirlwind, Marksman's Pinning Shot, Engineer's Field Repairs, Medic's Emergency Cover and Comms' Regroup. Select the relevant companion and press R; cooldowns and ammunition costs apply.

While their army is at an owned village, companions grant local passives: Captain shortens recruitment by one season (minimum one) and improves seasonal morale; Marksman reveals an additional road link; Engineer raises workshop capacity by 25% with full material costs; Medic supplies the existing +15 percentage-point recovery bonus; Comms doubles departing internal carts' monthly travel distance. Settlement panels show the effects and let non-commanding companions stay behind and rejoin a physically present army. Posted companions can defend that village. Passive effects follow actual location and do not stack with the same existing bonus.

### v0.12 — Veterans and Missions

Every campaign unit card has **Re-equip / upgrade**. During Planning, at an owned settlement, convert militia or lower-tier troops to supported stronger troop types, or upgrade their armour. The same unit retains its ID, experience, rank chevrons, weapon quality, morale, manpower, local wounded, home and army assignment. Type changes require local barracks; cavalry conversions outside Qinghe also require stables. Shared kit is reused; replaced kit returns to local stores. Only additional kit and the displayed conversion fee are charged, with per-soldier quantities including local wounded. Remote equipment must arrive before the upgrade can be applied; the panel can request missing kit through supply carts. Evacuated patients must rejoin before a whole-unit refit, preventing remote equipment changes at hospitals.

**Missions** replaces the separate Qinzhou navigation shortcut. It lists the three current story chapters, their status, requirements and a **Start / continue next mission** button. The scripted Battle of Qinghe waits until you choose **I am ready** during Planning with Captain Lin's army at Qinghe; old saves with that scripted march are migrated to this held state. Ordinary enemy attacks still advance normally. Completed main chapters cannot be replayed for rewards. The board also lists repeatable frontier raid/claim opportunities adjacent to your armies; planning one creates normal march orders, executed through **Resolve orders**. These operations use the existing map and battle systems, rather than adding new authored story chapters.

### v0.13 — A Living Frontier

Song and Xia field independent columns, reinforce frontier garrisons, fight at enemy settlements, retreat after defeats and capture territory after victories. Troops are deducted from their actual source garrison and survivors arrive at their destination; garrisons replenish gradually each month. Marches take one road link per month, with a visible battle phase before results settle. Animated columns show faction, headcount and their current task. The **Missions** board lists current movements and recent battle reports, with the latest relevant result also shown in settlement inspection. Armies, cooldowns, progress and bounded report history persist in saves. This is a fictional gameplay simulation, not a replay of historical campaign outcomes. NPC war changes only Song/Xia territory and garrisons; player troops and settlements remain in the normal campaign battle system.

### v0.13.1 — Production Recovery

Repairs older all-zero staffing states, normalises invalid and percentage-form staffing values, and distributes scarce labour proportionally across active raw-resource improvements. Explicit manual pauses set in the repaired interface persist in saves. **Auto-assign workers / resume production** restores full staffing requests in either the settlement breakdown or production overview. Both displays explain population versus available labour, assigned workers, manual pauses, shortages, workshop material requirements and the next seasonal delivery. Staffing edits immediately refresh summary totals and save their settings. Production continues to settle once per season (every third month); regression checks verify both raw materials and workshop outputs reach actual local inventories.

## Local preview

Serve this folder with `python -m http.server 8766 --bind 127.0.0.1`, then open [the campaign preview](http://127.0.0.1:8766/?preview=frontier). The preview starts directly on the campaign map and uses a separate save slot. The normal URL keeps the story campaign and its existing saves.

GitHub Pages serves the root files directly; no build step is required. Upload `index.html`, `frontier.js`, `campaign-ui.js`, `campaign-ui.css`, `battlefields.js`, `song-music.js`, `medical.js`, `journey.js`, `supply.js`, `companions.js`, `refit.js`, `missions.js`, `frontier-war.js` and `production.js` together with the existing `assets` folder.

## Verification

Run `npm ci` and `npm test`. On Windows, tests use installed Microsoft Edge; elsewhere, run `npx playwright install chromium` first, or set `GAME_BROWSER` to a Chromium executable. Tests start their own local servers and cover map connectivity, old-save migration, monthly planning and seasonal settlement, play beyond the historical crisis, inventory, warehouse placement, logistics completion, all seven battlefield identities, route access at all 95 settlements, objective capture, raid withdrawal and timed defence. Screenshots are written to `test-results/`.
