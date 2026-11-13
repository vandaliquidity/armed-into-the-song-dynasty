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

## Local preview

Serve this folder with `python -m http.server 8766 --bind 127.0.0.1`, then open [the campaign preview](http://127.0.0.1:8766/?preview=frontier). The preview starts directly on the campaign map and uses a separate save slot. The normal URL keeps the story campaign and its existing saves.

GitHub Pages serves the root files directly; no build step is required. Upload `index.html`, `frontier.js`, `campaign-ui.js`, `campaign-ui.css`, `battlefields.js` and `song-music.js` together with the existing `assets` folder.

## Verification

Run `npm ci` and `npm test`. On Windows, tests use installed Microsoft Edge; elsewhere, run `npx playwright install chromium` first, or set `GAME_BROWSER` to a Chromium executable. Tests start their own local servers and cover map connectivity, old-save migration, monthly planning and seasonal settlement, play beyond the historical crisis, inventory, warehouse placement, logistics completion, all seven battlefield identities, route access at all 95 settlements, objective capture, raid withdrawal and timed defence. Screenshots are written to `test-results/`.
