# GAME_HOOKS.md - how the game places and uses building art (from the code worker, merged into this package)

The second half of this file is the code worker's note `building_hooks.md` (task t264), **verbatim**. This first part reconciles it with the rest of this package.

## Reconciliation (read this first)
1. **Sprite fitting.** The game draws a building with `songSprite(g, model, x, y, w, h)`: centred on `x`, bottom edge on `y`, **scaled to fit the width `w`, height capped at `h`, aspect kept**. So the art box in `buildings.csv` (`max_sprite_box_wu_WxH`) *is* `w x h`: fill it. If your picture is wider/taller than the box, the game shrinks it and every person would look relatively bigger.
2. **Box vs record.** Some buildings are drawn at a different size than their layout record (e.g. armoury record 220 x 160 but drawn as the storehouse art at 1.15 = 280 wide; barracks hall 130 x 90 inside a 300 x 180 yard; stable saddler at 200 x 155 in a 360 x 260 paddock). Both numbers are in `buildings.csv` (`layout_record_box_wu`, `max_sprite_box_wu_WxH`). The art box is the **drawn** size.
3. **Footprint and walking.** The walk-grid blocks the *body* `[x - 0.43w, y - 72, x + 0.43w, y + 5]` and keeps a door lane `[x - 18, y - 20, x + 18, y + 45]` open. So **the visible floor and walls must stay within x +/- 0.43w** (the roof may overhang), and the building must not extend below `y + 5` (the bottom of the canvas). Below `y + 5` the game draws the name plaque at `y + 38 .. 57`, the hover box ends at `y + 35`, builders and key people stand at `y + 16 .. 34`: **keep the ground in front of the door free of painted objects**.
4. **Workers today vs proposed.** Today a workshop worker stands at the door `(x, y - 2)` and goods piles are shown at `(x, y + 28)` in front (stores: `(x, y - 18)` and a fixed grid, see below). The **station and pile positions inside the room** in `buildings.csv` are *proposals* for the new cutaway design: the code worker will read them from `assets/bld_manifest.json`. Until then the picture must still look right with the worker at the door.
5. **State art the code worker listed -> our optional layers.** ruin = `base_damaged` + `roof_damaged` (class H/S: `damaged`); scaffold/under construction/upgrading = `construct_1`, `construct_2`; night lamp glow = `night` (new, an additive light layer); winter roof = `roof_snow` (new). Ribbon overlay, festival lantern strings and the cottage scaffold are small extras we do not request.
6. **New records.** `hall` (Qinghe only, uses the sheet cell `yamen`) and `memorial` (Qinghe only, currently drawn in code) are in the package as `hall` and `memorial`. The old map-only `yamen_map` is merged into `hall` (same picture). Only `granary_map` remains map-only.
7. **Placeholders.** `mine`, `quarry`, `saltworks` (smithy art today) and `lumber` (saddler art today) need their own art; the package already treats them as unique buildings.
8. Keys, anchors: keep **bottom-centre** and the **door at `(x, y - 8)`**. This is already the package convention.
9. These coordinates come from the repository's working tree at the time of writing, which may be ahead of `origin/main` @ `0e9fae0` (some t264 features such as forged-blade glints are not on `origin/main`). Where numbers differ, the code worker's numbers here win.

---
# Verbatim: building_hooks.md
# Building hooks for the art handover (t264)

The 2.5D village (`village-scene.js`) builds one record per building in `townScene(id)` using
`place(key, x, y, w, h, extra)`. Every visual is drawn from the record's **key** and its **model** (the sprite key).
New art drops in when you keep these keys and anchors. You do not need to touch any gameplay code.

## Coordinate convention (all buildings)
- World units are the village canvas: 4000 x 2100 for a base town, plus 280 x 160 per `visualExtent`.
- **Anchor = bottom centre.** `songSprite(g, model, r.x, r.y, r.w, r.h)` draws the sprite centred on `r.x`, with its bottom edge on `r.y`.
  It scales to fit the width `r.w` and caps the height at `r.h`. The aspect ratio is kept.
- **Footprint:** the record reserves `rect = [x - w/2 - 22, y - h - 24, x + w/2 + 22, y + 65]`. The walk-grid blocks the body
  `[x - 0.43w, y - 72, x + 0.43w, y + 5]` (the hospital blocks up to `y - 260`) and leaves a door lane `[x - 18, y - 20, x + 18, y + 45]` open.
- **Door:** `r.door = {x: r.x, y: r.y - 8}`. Porters, patients and walkers path to the door.
- **Label:** a plaque is drawn at `(r.x, r.y + 38..57)`. The hover box is `[x - w/2, y - h, x + w/2, y + 35]`.
- Sprite sheets (`song-art.js`):
  - `assets/song/architecture-v2.png` (4x2): cottage, courtyard, winehouse, granary, smithy, barracks, yamen, treasury
  - `assets/song/workshops-v1.png` (3x2): bowyer, tannery, armourer, saddler, powder, weaver
  - `assets/song/gates-v*.png`: gate_hamlet, gate_village, gate_town

  Each cell is auto-trimmed to its alpha bounds, so the art can be any size. Keep the ground contact at the bottom of the cell.

## Records (key → sprite model, footprint w x h)
| record key | model (sprite key) | w x h | notes |
|---|---|---|---|
| `store:0..2` | `store` → legacy `store2` prop, 2 layers (back at y-80, front at y+1) | 290 x 145 | goods piles are drawn on top, see piles below |
| `treasury` | `treasury` | 230 x 170 | the ingot trays are drawn inside the roof cutaway via `songTreasuryPieces(g, gold, silver, x, top, w, h)` |
| `armoury` | `armoury` → `store2` x1.15 | 220 x 160 | kit racks (`songGoods(..., rack=true)`) drawn at `(x-90+i%5*42, y-40+row*38)`; t264 adds forged-blade glints at `(x-80+i*26, y+22)` |
| `yard` | ground patch + `barracks` at `(x, y-120, 130, 90)` | 300 x 180 | drilling troops are drawn at `(x-126+i%7*42, y-55+row*34)` |
| `stable` | `saddler` at `(x, y-125, 200, 155)` + paddock fence (`townPaddock(r)`) | 360 x 260 | horses inside the paddock |
| `hospital` (`dev:hosp`) | `hospital` → drawn by `vlDraw` from `assets/<tier>/ward.webp` (220 x 310, oy 60) at `VL.X = x-110, VL.Y = y-310` | 230 x 260 | beds in `VL_META.beds`; physician stations in `VL_META.stations` |
| `dev:farm` | `field` (legacy `field` prop, season variant 0..3) | 360 x 220 | up to 6 plots at `(x ± 90, y-130+row*100)` |
| `dev:tannery / smithy / bowyer / armour / saddle / fire` | `SONG_WORKSHOP[WKV[k]]` = tannery, smithy, bowyer, armourer, saddler, powder | 190 x 170 | workshops |
| `dev:market` | `winehouse` | 200 x 165 | |
| `dev:mine / quarry / saltw` | `smithy` | 200 x 165 | placeholders: new art should add `mine`, `quarry` and `saltworks` keys |
| `dev:lumber` | `saddler` | 200 x 165 | placeholder: new art should add a `lumberyard` key |
| `dev:wall` | none (wall drawn by `townWalls`) | 120 x 125 | |
| `dev:tower` | `watchtower` → legacy `tower` prop x0.9 | 120 x 125 | |
| `biz:<DY_BUSINESSES key>` | `songBusinessModel(k)`: restaurant/brewery → winehouse; beauty/papermill/pottery/garden/orchard → courtyard; weaver → weaver; powderworks → powder; arsenal/refinery/kiln → smithy | 185 x 175 | |
| `home:i` | `cottage` or `courtyard` (when prosperity > 55); Xia/Jin towns use `yurt` | 135 x 120 | count = pop/150, clamped to 3..30; skipped when no plot is free |
| **new** `memorial` (Qinghe only, `civic:'memorial'`) | drawn in code by `vwDrawMemorial` (stone wall, names) | 170 x 95 | art key to add: `memorial`. Names go on the face from `y-48` down, in 3 columns |
| **new** `hall` (Qinghe only, `civic:'hall'`) | `yamen` + captured banners | 230 x 190 | banner poles at `(x - w/2 + 20 + i*(w-40)/5, y - 0.45h)`, up to 6 |
| gate (`scene.gate`) | `gate_hamlet / gate_village / gate_town` by `villageGateQuality` | 285 wide, max 210 tall | name plaque at 40-50% of the height |

## Worker station points
- **Workshop worker** (`townEconomy` → `vpWorker(g, r.x, r.y-2, act, dir, frame)`): stands at the door. The acts come from `VC_ACT`
  (tannery stir, smithy hammer, bowyer weave, armour hammer, saddle weave, fire tend). A cycle runs rest → input → work (2.2 s) → output.
- **Builders on a site** (t264): `(r.x - 0.32w, r.y + 16)` hammer, dir 1, and `(r.x + 0.30w, r.y + 18)` lift, dir 3.
- **Key people** (t264, clickable):
  - Sister Su: hospital door `(door.x + 38, door.y + 34)`, or `(yard.x + 120, yard.y + 30)` when there is no hospital
  - Quartermaster: `(store:0.x + w/2 + 18, y + 30)`
  - Smith: `(smithy.x - w/2 - 14, y + 28)`, or the armoury when there is no smithy
  - Gate veteran: `(gate.x + 92, gate.y + 34)`
- Hospital physicians: `VL_META.stations` (stir and count), relative to the ward image.

## Input and output pile points
- Raw goods and outputs move between the building **door** and the store chosen by `townStore(k)`. Each item is assigned:
  - horse → stable
  - silver and gold → treasury
  - equipment (`EQ`) → armoury
  - anything else → the `store:i` whose `goods` list holds it (`TOWN_STORE_GROUPS`)
- A store's pile spot is `logvSpot(k) = (r.x, r.y - 18)`. Other buildings use `(r.x, r.y + 28)`.
- Store piles: good `i` of a store is drawn at `x = r.x - 90 + (i%4)*58 (+12 per stack)`. Its height is `y = r.y - 66 + floor(i/4)*28` for the first 8 goods and `r.y + 28 + ...` after that.
- Haulage carts (plunder, convoys): `logvSpot` lanes at y = 503 (`vcBin().port`).

## States (new in t264, all read from the save)
| state | where | how it is drawn now | what the art can replace |
|---|---|---|---|
| **under construction** | `r.construction = {kind, key, cost, token}` and `!r.built` | `townFoundation` scaffold plus 2 builders | a per-model `<model>_scaffold` frame |
| **upgrading** (built + construction) | `r.built && r.construction` | small scaffold (w 95) next to the building | same |
| **damaged / burned** | `CG.vw.dmg['<town>:<devKey>'] = {k, lv, mo, src:'raid' or 'sack'}` | the sprite drawn at `brightness(.42) sepia(.6)` with smoke and a `Burned · click to repair` tag. When the level dropped to 0, the old model is still drawn as a ruin | a `<model>_ruin` frame (same anchor and footprint) |
| **unveiling** | event `{k:'unveil', b, lv}` | red banner on a pole at `(x, y - 0.9h - 60)`, dust ring at the base, a crowd at `y + 70` | an optional `<model>_ribbon` overlay |
| **festival** | `vwFestOn(id)` (harvest `s.fest` or a victory, `CG.vw.fest[id] >= month`) | lantern strings along the 4 longest streets at `-52..-60` above the road, a crowd at the market, fireworks | lantern props `lantern_string` |
| **night** | `vwDark()` 0..1 (150 s day) | blue grade; a lamp glow at each building door `(x + 0.25w, y + 10)` and house `(x + 14, y + 2)` | a lit-window layer `<model>_night` |
| **season** | `townSeason()` from the calendar month (Dec-Feb winter, Mar-May spring, Jun-Aug summer, Sep-Nov autumn) | ground tint, field variant, bare trees in winter and some in autumn | seasonal roof variants `<model>_snow` |
| **settler house rising** | `VWX.rise['<town>:<i>']` for 6 s after the house count grows | scaffold for 3 s, then fades and slides up 30 px | a `cottage_scaffold` frame |

## Rules for the new art
- Keep the model keys above (or add new ones and map them in `songBusinessModel`, `SONG_WORKSHOP` or the `civic` map in `village-scene.js`).
- Keep **bottom-centre anchors**, and keep the door at the bottom centre: walkers and porters target `(x, y - 8)`.
- Keep the visible body inside `x ± 0.43w` and `y - h .. y + 5`, or the walk-grid will let people walk through walls.
