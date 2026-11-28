# Building inventory (every building sprite in the game)

Source: `origin/main` @ 0e9fae0 of the game repo (the village view is "Village scene v3": `village-scene.js` + `song-art.js` + `town-models.js` + `village-economy.js` + `village-life.js`).

**36 village building types** to re-render (P1/P2), plus 1 optional wall kit and 1 map-only cell (P3). The full machine-readable table with every column is `buildings.csv` (open in Excel / Sheets).

## How to read this

- **wu** = world unit, the village coordinate system. An adult is 31.1 wu tall; see `specs/people_scale_lineup.png`.
- **Anchor** = bottom-centre of the sprite sits on the record point (x, y). The **door** is (x, y-8).
- **Box** = the largest sprite footprint the layout reserves. Do not exceed it (the layout packs plots by these boxes).
- Station coordinates are **PROPOSED** (today the code has only the door and one worker at the front-centre). They are in wu relative to the anchor: +x right, **+y down** (so -50 means 50 wu above the anchor).
- "Shared art" = the game today draws this building with ANOTHER building's picture. Those are the biggest gaps.

## Summary table

| key | class | name | now drawn as | max box (wu) | drawn now (wu) | levels | shared art today | layers |
|---|---|---|---|---|---|---|---|---|
| `bld_home_cottage` | H | 民居(茅屋) / Cottage (thatch) | song:cottage | 135x120 | 135x96 | 1 | home_courtyard shares the same code path | base (roof baked in) (+ optional damaged, construct_1, night) |
| `bld_home_courtyard` | H | 民居(瓦院) / Courtyard house (tile) | song:courtyard | 135x120 | 135x105 | 1 | reused by 5 commerce buildings today (beauty, papermill, pottery, garden, orchard) | base (roof baked in) (+ optional damaged, construct_1, night) |
| `bld_storehouse` | W | 仓廒 / Storehouse (open-topped granary) | kit:store8 | 300x165 | 300x165 | 3 | armoury reuses the same two sprites at scale 1.15 | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_treasury` | W | 大宋官库 / Song treasury (roof cutaway) | song:treasury | 230x170 | 230x168 | 1 | - | base, props, roof (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_armoury` | W | 武库 / Armoury | kit:store8 | 280x165 | 280x165 | 1 | currently the SAME art as the storehouse at scale 1.15 (that is why it looks identical) | base, props, roof (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_barracks` | W | 兵营 / 校场 / Barracks hall and drill yard | song:barracks | 130x90 | 121x90 | 3 | - | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_stable` | W | 马厩 / Stables | song:saddler | 200x155 | 188x155 | 3 | uses the saddler workshop art today | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_hospital` | W | 医馆 / Hospital (Lv1-2) | kit:ward | 240x230 | 240x230 | 2 | - | base, props, roof, props_l2 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_watchtower` | S | 望楼 / Watchtower (Lv1-2) | kit:tower | 70x105 | 70x105 | 2 | - | base (roof baked in) (+ optional damaged, construct_1, night) |
| `bld_gate` | S | 村门 / Village gate (3 tiers: hamlet, village, town) | song:gate_hamlet | 285x210 | 285x199 (hamlet), 283x210 (village), 224x210 (town) | 3 | - | base (roof baked in) (+ optional damaged, construct_1, night) |
| `bld_wall_kit` | S | 寨墙 / Palisade/wall kit (optional, P3) | procedural:townWallPrism (town-streets.js) | 60x80 | 60x80 | 3 | - | base (roof baked in) (+ optional damaged, construct_1, night) |
| `bld_field` | F | 田庄(农田) / Farm field plots (4 seasons) | kit:field | 160x106 | 160x106 | 3 | - | base (one per season) |
| `bld_smithy` | W | 铁匠铺 / Smithy | song:smithy | 190x170 | 190x143 | 3 | ALSO used by mine, quarry, salt works, kiln, arsenal, refinery today | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_tannery` | W | 皮坊 / Tannery | song:tannery | 190x170 | 190x168 | 3 | - | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_bowyer` | W | 弓弩坊 / Bowyer | song:bowyer | 190x170 | 187x170 | 3 | - | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_armourer` | W | 甲坊 / Armourer | song:armourer | 190x170 | 190x144 | 3 | - | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_saddlery` | W | 鞍坊 / Saddlery | song:saddler | 190x170 | 190x157 | 2 | ALSO the stable and the lumber camp today (saddler art reused) | base, props, roof, props_l2 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_firelance` | W | 火药作 / Fire-lance works | song:powder | 190x170 | 190x151 | 2 | - | base, props, roof, props_l2 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_market` | W | 集市 / Market | song:winehouse | 200x165 | 190x165 | 3 | currently the wine-house art (shared with brewery and restaurant) | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_lumber` | W | 伐木场 / Lumber camp | song:saddler | 200x165 | 200x165 | 3 | currently the saddler art (wrong) | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_quarry` | W | 采石场 / Quarry | song:smithy | 200x165 | 200x150 | 3 | currently the smithy art (wrong) | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_mine` | W | 冶坑 (铁矿) / Ore pits (iron) | song:smithy | 200x165 | 200x150 | 3 | currently the smithy art (wrong) | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_saltworks` | W | 盐池 / Salt works | song:smithy | 200x165 | 200x150 | 2 | currently the smithy art (wrong) | base, props, roof, props_l2 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_brewery` | W | 酒坊 / Brewery | song:winehouse | 185x175 | 185x161 | 3 | wine-house art, shared with market and restaurant | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_beauty` | W | 香皂香膏作 / Beauty (soap and balm) workshop | song:courtyard | 185x175 | 185x143 | 3 | courtyard house art | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_restaurant` | W | 清河酒楼 / Restaurant (Qinghe tavern) | song:winehouse | 185x175 | 185x161 | 3 | wine-house art, shared with market and brewery | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_kiln` | W | 炭窑 / Charcoal kiln | song:smithy | 185x175 | 185x139 | 3 | smithy art | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_powderworks` | W | 军器火药作 / Powder works | song:powder | 185x175 | 185x147 | 3 | powder workshop art (same as the fire-lance works) | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_arsenal` | W | 军器监分作 / Ordnance foundry | song:smithy | 185x175 | 185x139 | 3 | smithy art | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_garden` | W | 菜麻圃 / Market garden | song:courtyard | 185x175 | 185x143 | 3 | courtyard house art | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_orchard` | W | 果园 / Orchard | song:courtyard | 185x175 | 185x143 | 3 | courtyard house art | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_weaver` | W | 织造作 / Weaving house | song:weaver | 185x175 | 185x151 | 3 | weaver workshop art | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_papermill` | W | 纸坊 / Paper mill | song:courtyard | 185x175 | 185x143 | 3 | courtyard house art | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_pottery` | W | 陶瓷窑 / Pottery kiln | song:courtyard | 185x175 | 185x143 | 3 | courtyard house art | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_refinery` | W | 冶铁作 / Steel works | song:smithy | 185x175 | 185x139 | 3 | smithy art (same as arsenal) | base, props, roof, props_l2, props_l3 (+ optional base_damaged, roof_damaged, construct_1, construct_2, night, roof_snow) |
| `bld_hall` | S | 官署(衙门) / Yamen hall (Qinghe only; also map plates) | song:yamen | 230x190 | 230x164 | 1 | map plates use the same picture at 144x100 | base (roof baked in) (+ optional damaged, construct_1, night) |
| `bld_memorial` | S | 纪念碑墙 / Memorial wall (Qinghe only) | procedural:vwDrawMemorial | 170x95 | 170x95 | 1 | - | base (roof baked in) (+ optional damaged, construct_1, night) |
| `bld_granary_map` | S | 粮仓(地图图标) / Granary (campaign-map plates only) | song:granary | 75x62 | 75x47 | 1 | - | base (roof baked in) (+ optional damaged, construct_1, night) |

Class: **W** = working building (cutaway interior + props + roof), **H** = home (solid, roof baked in), **S** = structure (gate, tower, wall), **F** = field.

## Per-building detail

### bld_home_cottage — 民居(茅屋) / Cottage (thatch)  (class H, Homes)

- **Game records / ids:** home:N records, model "cottage" (poor/low prosperity houses; ~1 per 150 inhabitants, up to 30)
- **Current art:** `song:cottage`; assets/song/architecture-v2.png cell architecture[0,0] (col,row) of 4x2; trimmed native 400x284 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/cottage.png
- **Current draw call + anchor:** songSprite(g,"cottage",x,y,135,120) bottom-centre at record (x,y)
- **Sizes:** max box 135x120 wu; drawn now 135x96 wu; layout reserves 135x120 wu; new ground plan about 100x100 wu (squarish)
- **Pixels to deliver:** master 810x720 (6 px/wu); hi 405x360; md 202x180; lo 101x90
- **Inside:** Family dwelling. Villagers spawn at / return to the door. Housing count = population/150.
- **Worker stations now:** villagers appear at the door (0,-8)
- **Worker stations PROPOSED:** none; **input pile** n/a; **output rack** n/a
- **Levels (1):** No levels. Provide 3 visual variants (a, b, c) so rows of houses do not repeat.
- **Shared art today:** home_courtyard shares the same code path

### bld_home_courtyard — 民居(瓦院) / Courtyard house (tile)  (class H, Homes)

- **Game records / ids:** home:N records, model "courtyard" (35% of homes at prosperity>55, otherwise cottage); also used for beauty workshop, paper mill, pottery kiln, garden, orchard (see those rows)
- **Current art:** `song:courtyard`; assets/song/architecture-v2.png cell architecture[1,0] (col,row) of 4x2; trimmed native 435x337 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/courtyard.png
- **Current draw call + anchor:** songSprite(g,"courtyard",x,y,135,120)
- **Sizes:** max box 135x120 wu; drawn now 135x105 wu; layout reserves 135x120 wu; new ground plan about 105x100 wu (squarish)
- **Pixels to deliver:** master 810x720 (6 px/wu); hi 405x360; md 202x180; lo 101x90
- **Inside:** Wealthier household. Villagers use the door as spawn/return point.
- **Worker stations now:** villagers appear at the door (0,-8)
- **Worker stations PROPOSED:** none; **input pile** n/a; **output rack** n/a
- **Levels (1):** No levels. Provide 3 variants (L-shape, U-shape, with side shed).
- **Shared art today:** reused by 5 commerce buildings today (beauty, papermill, pottery, garden, orchard)

### bld_storehouse — 仓廒 / Storehouse (open-topped granary)  (class W, Civic / storage)

- **Game records / ids:** records store:0..2 (one per Storehouse level, max 3 plots). Goods groups drawn inside: grain/fish/veg.. | timber/stone/ore.. | hide/leather/cloth..
- **Current art:** `kit:store8`; assets/{t}/vunified.webp rects store8_0 back hi[0,296,365,190] md[0,198,244,127] lo[0,100,122,64]; store8_1 front hi[1120,488,353,82] md[756,327,236,55] lo[387,166,118,28]; anchors+sizes in village-unified.js VU_META.items. Extracted: current/sprites/kit_store8_0.png (back), kit_store8_1.png (front)
- **Current draw call + anchor:** sprProp("store2",x,y,0,1.25) = back layer at depth y-80 (offset y-35), then sprProp("store2",x,y,1,1.25) = front layer at depth y+1. ALREADY a two-layer cutaway (back+front)
- **Sizes:** max box 300x165 wu; drawn now 300x165 wu; layout reserves 290x145 wu; new ground plan about 160x120 wu (squarish)
- **Pixels to deliver:** master 1800x990 (6 px/wu); hi 900x495; md 450x248; lo 225x124
- **Inside:** Raw goods of the village are stacked in bays by category. Carriers deliver inputs here and fetch them from here. A stacker works at the right end (+60,-6).
- **Worker stations now:** stacker "stack" at (+60,-6) when goods exist; carriers use door (0,-8)
- **Worker stations PROPOSED:** stack @(60,-6); **input pile** (-90, -66); **output rack** (90, -66)
- **Levels (3):** One building per level (up to 3 plots). Each plot is the same building; art needs 2 looks (a, b).
- **Shared art today:** armoury reuses the same two sprites at scale 1.15

### bld_treasury — 大宋官库 / Song treasury (roof cutaway)  (class W, Civic / storage)

- **Game records / ids:** record "treasury" (built once any storehouse exists); gold/silver ingots drawn live on its trays
- **Current art:** `song:treasury`; assets/song/architecture-v2.png cell architecture[3,1] (col,row) of 4x2; trimmed native 432x315 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/treasury.png
- **Current draw call + anchor:** songSprite(g,"treasury",x,y,230,170) then songTreasuryPieces() paints live ingots on SIX trays (3 gold left column, 3 silver right column) at x-w/2+w*(.25|.58 + (slot%4)*.039), y=top+h*(.46+tray*.102+floor(slot/4)*.021). Two guards (spearmen) at x-115 and x+115, bottom y+9. A clerk "count" worker at (x+25, y-8)
- **Sizes:** max box 230x170 wu; drawn now 230x168 wu; layout reserves 230x170 wu; new ground plan about 150x120 wu (squarish)
- **Pixels to deliver:** master 1380x1020 (6 px/wu); hi 690x510; md 345x255; lo 172x128
- **Inside:** Gold (left trays) and silver (right trays) are shown as real ingots. Clerk counts at the right.
- **Worker stations now:** clerk "count" at (+25,-8) (relative to record x,y); 2 guards at (+-115,+9)
- **Worker stations PROPOSED:** count @(25,-8); **input pile** n/a; **output rack** n/a
- **Levels (1):** No levels (a second look for "vault upgraded" is optional).

### bld_armoury — 武库 / Armoury  (class W, Civic / storage)

- **Game records / ids:** record "armoury" (built when Barracks Lv>=1). Real equipment counts drawn on racks
- **Current art:** `kit:store8`; assets/{t}/vunified.webp rects store8_0 back hi[0,296,365,190] md[0,198,244,127] lo[0,100,122,64]; store8_1 front hi[1120,488,353,82] md[756,327,236,55] lo[387,166,118,28]; anchors+sizes in village-unified.js VU_META.items. Extracted: current/sprites/kit_store8_0.png (back), kit_store8_1.png (front)
- **Current draw call + anchor:** sprProp("store2",x,y,0,1.15) back + sprProp("store2",x,y,1,1.15) front
- **Sizes:** max box 280x165 wu; drawn now 280x165 wu; layout reserves 220x160 wu; new ground plan about 150x110 wu (squarish)
- **Pixels to deliver:** master 1680x990 (6 px/wu); hi 840x495; md 420x248; lo 210x124
- **Inside:** Spears, sabres, bows, crossbows, armour, shields, saddles are shown as live goods in rows (x-90+i%5*42, y-40+floor(i/5)*38 wu). Must be a different silhouette from the storehouse.
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** count @(40,-10); **input pile** n/a; **output rack** (0, -45)
- **Levels (1):** No levels.
- **Shared art today:** currently the SAME art as the storehouse at scale 1.15 (that is why it looks identical)

### bld_barracks — 兵营 / 校场 / Barracks hall and drill yard  (class W, Civic / storage)

- **Game records / ids:** record "yard" (Barracks levels 1-3). Troops drawn in a 7x4 grid in the yard in front: figures at x-126+i%7*42, y-55+floor(i/7)*34; recruits in training animate
- **Current art:** `song:barracks`; assets/song/architecture-v2.png cell architecture[1,1] (col,row) of 4x2; trimmed native 433x323 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/barracks.png
- **Current draw call + anchor:** tinted yard rect (x-150,y-160,300,185) + songSprite(g,"barracks",x,y-120,130,90): the hall is small and sits at the BACK of the yard
- **Sizes:** max box 130x90 wu; drawn now 121x90 wu; layout reserves 300x180 wu; new ground plan about 280x160 wu (squarish)
- **Pixels to deliver:** master 780x540 (6 px/wu); hi 390x270; md 195x135; lo 98x68
- **Inside:** Recruits drill; garrison stands in formation on the yard. Deployment starts from here (route end = x,y+35).
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** hammer @(-80,-60); **input pile** n/a; **output rack** (60, -105)
- **Levels (3):** Lv1 hall + sand yard. Lv2 adds archery butts and a pennant gallery. Lv3 adds a second hall and a watch platform.

### bld_stable — 马厩 / Stables  (class W, Civic / storage)

- **Game records / ids:** record "stable" (Stables levels 1-3; needs horses). Paddock with live horses in front
- **Current art:** `song:saddler`; assets/song/workshops-v1.png cell workshops[0,1] (col,row) of 3x2; trimmed native 476x393 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/saddler.png
- **Current draw call + anchor:** songSprite(g,"saddler",x,y-125,200,155) at the back; paddock rect x-160..x+160, y-100..y+40 with procedural fence and animated horses
- **Sizes:** max box 200x155 wu; drawn now 188x155 wu; layout reserves 360x260 wu; new ground plan about 170x120 wu (squarish)
- **Pixels to deliver:** master 1200x930 (6 px/wu); hi 600x465; md 300x232; lo 150x116
- **Inside:** Horses graze in the paddock; hay and hides produced. Saddles and tack hang inside.
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** lift @(-45,-40); **input pile** (-70, -30); **output rack** (70, -30)
- **Levels (3):** Lv1 one shed. Lv2 adds a second stall row and haystack. Lv3 adds a covered trough and a riding ring edge.
- **Shared art today:** uses the saddler workshop art today

### bld_hospital — 医馆 / Hospital (Lv1-2)  (class W, Civic / storage)

- **Game records / ids:** record "hospital" (Hospital Lv1-2, Home clinic maps to it). Drawn by village-life.js as one image at top-left (hospital.x-110, hospital.y-310)
- **Current art:** `kit:ward`; assets/hi/ward.webp 330x465 | assets/md/ward.webp 220x310 | assets/lo/ward.webp 110x155 (1.5/1.0/0.5 px per wu); geometry in village-life.js VL_META. Extracted: current/sprites/kit_ward.png
- **Current draw call + anchor:** drawImage(ward.webp, X, Y, 220, 310) - an existing cutaway interior. 8 beds at image-local (62|158, 148|184|220|256); Lv2 adds 4 mats at (110, 156|188|220|252). Stations: stir at (168,288), count at (110,290). Door/approach at (110,296). Header label bar at (8,52). Overflow mats outside at (30+(k%6)*32, 310+22+floor(k/6)*16)
- **Sizes:** max box 240x230 wu; drawn now 240x230 wu; layout reserves 230x260 wu; new ground plan about 190x190 wu (squarish)
- **Pixels to deliver:** master 1440x1380 (6 px/wu); hi 720x690; md 360x345; lo 180x172
- **Inside:** Wounded soldiers arrive by ox cart from the gate, lie in beds while a physician takes pulses, a helper gives medicine and an apprentice tends the decoction stove; healed men get up and walk to the drill yard. Capacity 160 men at Lv1, 240 at Lv2.
- **Worker stations now:** physician/helper wander between beds; apprentice stir at image-local (168,288), clerk count at (110,290)
- **Worker stations PROPOSED:** stir @(58,-22); count @(0,-20); pour @(-40,-60); **input pile** n/a; **output rack** n/a
- **Levels (2):** Lv1 = 8 beds. Lv2 = same room + 4 extra mats + more medicine shelves (props_l2). TODAY the 8 bed slots are a hard code constraint in a PORTRAIT 220x310 wu room (2 columns x 4 rows, see draws). User wants squarish rooms: PREFERRED = squarish 240x230 wu ward with the 8 beds as 4 columns x 2 rows at dx=-66,-22,+22,+66 and dy=-76,-40 from the anchor (needs a small code change by the code worker; Lv2 mats along the front at dy=-12). FALLBACK if code cannot change: deliver the legacy portrait layout with beds at the old positions.

### bld_watchtower — 望楼 / Watchtower (Lv1-2)  (class S, Civic / storage)

- **Game records / ids:** record "dev:tower" (Watchtower Lv1-2)
- **Current art:** `kit:tower`; assets/hi/tower.webp 304x464 | assets/md/tower.webp 152x232 | assets/lo/tower.webp 76x116 (4.8/2.4/1.2 px per world unit; drawn x0.9). Extracted: current/sprites/kit_tower.png
- **Current draw call + anchor:** sprProp("tower",x,y,0,.9); source tower.webp hi 304x464 (4.8 px/wu => 63x97 wu) drawn x0.9
- **Sizes:** max box 70x105 wu; drawn now 70x105 wu; layout reserves 120x125 wu; new ground plan about 40x40 wu (squarish)
- **Pixels to deliver:** master 420x630 (6 px/wu); hi 210x315; md 105x158; lo 52x79
- **Inside:** Gives +1 sight; spots raids early. A guard stands on the platform (optional).
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** none; **input pile** n/a; **output rack** n/a
- **Levels (2):** Lv1 timber frame tower with platform. Lv2 taller, with a tiled roof and a beacon basket.

### bld_gate — 村门 / Village gate (3 tiers: hamlet, village, town)  (class S, Civic / storage)

- **Game records / ids:** 1 per village. Tier by prosperity: gate_hamlet / gate_village / gate_town. Inner north gate = gate_hamlet small. Walls are drawn procedurally (see wall_kit)
- **Current art:** `song:gate_hamlet`; assets/song/gates-v1.png cell gates[0,0] (col,row) of 3x1; trimmed native 663x463 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/gate_hamlet.png
- **Current draw call + anchor:** songSprite(g,key,p.x,p.y+10,285,210), blank name plaque drawn by code 96x23 wu centred at (x, bottom-h*0.50) [hamlet, village] or (x, bottom-h*0.40) [town] with the village name text. Plus songSprite(g,"gate_hamlet",x,110,112,90) at the north gap
- **Sizes:** max box 285x210 wu; drawn now 285x199 (hamlet), 283x210 (village), 224x210 (town) wu; layout reserves 285x210 wu; new ground plan about 200x70 wu (squarish)
- **Pixels to deliver:** master 1710x1260 (6 px/wu); hi 855x630; md 428x315; lo 214x158
- **Inside:** Entry/exit of all villagers, carts, columns. Walking path passes through the open archway (clear opening >= 36 wu wide).
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** none; **input pile** n/a; **output rack** n/a
- **Levels (3):** Three separate sprites: hamlet (timber+earth), village (tiled gatehouse), town (masonry gate with tower). Natives: 663x463, 718x533, 699x656.

### bld_wall_kit — 寨墙 / Palisade/wall kit (optional, P3)  (class S, Civic / storage)

- **Game records / ids:** dev:wall (Walls Lv1-3) raises the height of the PROCEDURAL wall prism (34 + 18*level wu). Not a sprite today
- **Current art:** `procedural:townWallPrism (town-streets.js)`; procedural (canvas code), no sprite file
- **Current draw call + anchor:** townWallPrism(g,a,b,h,level) between polygon points
- **Sizes:** max box 60x80 wu; drawn now 60x80 wu; layout reserves 120x125 wu; new ground plan about 60x20 wu (squarish)
- **Pixels to deliver:** master 360x480 (6 px/wu); hi 180x240; md 90x120; lo 45x60
- **Inside:** Defence only (battle walls).
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** none; **input pile** n/a; **output rack** n/a
- **Levels (3):** Lv1 earth rampart with timber palisade, Lv2 rammed-earth with parapet, Lv3 brick-faced with battlements. Deliver as horizontal tile (60 wu), corner, and end-cap, left-right and facing-down variants.

### bld_field — 田庄(农田) / Farm field plots (4 seasons)  (class F, Farm)

- **Game records / ids:** record "dev:farm" (Farm Lv1-3): min(6, Farm level*2) plots, 2 columns x 3 rows spaced 180 x 100 wu
- **Current art:** `kit:field`; assets/{t}/vunified.webp rects field_0..3 (spring..winter) hi[676|970|1263|1557,0,292,193] md[452|648|844|1040,0,194,128] lo[228|327|426|525,0,97,64]. Extracted: current/sprites/kit_field_0..3.png
- **Current draw call + anchor:** sprProp("field",f.x,f.y,season,.82) per plot; kit field_0..3 = spring, summer, autumn, winter; source 292x193 px (1.5 px/wu); drawn 159.5 x 105 wu
- **Sizes:** max box 160x106 wu; drawn now 160x106 wu; layout reserves 360x220 wu; new ground plan about 160x106 wu (squarish)
- **Pixels to deliver:** master 960x636 (6 px/wu); hi 480x318; md 240x159; lo 120x80
- **Inside:** Harvest jobs start from the plots. Farmers work here (optional 4th person: sower, reaper, carrier).
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** lift @(0,-30); **input pile** n/a; **output rack** (60, -20)
- **Levels (3):** Same plot art; Lv adds plots. Optional: a field hut / well sprite (farm_hut) at Lv2 and a threshing floor at Lv3.

### bld_smithy — 铁匠铺 / Smithy  (class W, Military workshops)

- **Game records / ids:** record "dev:smithy" (DEV smithy, levels=3)
- **Current art:** `song:smithy`; assets/song/architecture-v2.png cell architecture[0,1] (col,row) of 4x2; trimmed native 410x308 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/smithy.png
- **Current draw call + anchor:** songSprite(g,"smithy",x,y,190,170) bottom-centre at record; worker act "hammer" drawn at (x,y-2)
- **Sizes:** max box 190x170 wu; drawn now 190x143 wu; layout reserves 190x170 wu; new ground plan about 150x150 wu (squarish)
- **Pixels to deliver:** master 1140x1020 (6 px/wu); hi 570x510; md 285x255; lo 142x128
- **Inside:** Ore + timber -> spears and sabres. Input: ore, timber/charcoal. Output: spear, dao.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** hammer @(0,-48); tend @(48,-62); pour @(-50,-38); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a second anvil + bigger forge; Lv3 adds a covered stock shed and iron rack.
- **Shared art today:** ALSO used by mine, quarry, salt works, kiln, arsenal, refinery today

### bld_tannery — 皮坊 / Tannery  (class W, Military workshops)

- **Game records / ids:** record "dev:tannery" (DEV tannery, levels=3)
- **Current art:** `song:tannery`; assets/song/workshops-v1.png cell workshops[1,0] (col,row) of 3x2; trimmed native 474x419 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/tannery.png
- **Current draw call + anchor:** songSprite(g,"tannery",x,y,190,170) bottom-centre at record; worker act "stir" drawn at (x,y-2)
- **Sizes:** max box 190x170 wu; drawn now 190x168 wu; layout reserves 190x170 wu; new ground plan about 150x150 wu (squarish)
- **Pixels to deliver:** master 1140x1020 (6 px/wu); hi 570x510; md 285x255; lo 142x128
- **Inside:** Hides -> leather (armour, shields, saddles). Input: hide. Output: leather.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** stir @(-40,-45); stir @(15,-45); lift @(55,-55); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a third vat and a drying rack; Lv3 adds a second drying frame row.

### bld_bowyer — 弓弩坊 / Bowyer  (class W, Military workshops)

- **Game records / ids:** record "dev:bowyer" (DEV bowyer, levels=3)
- **Current art:** `song:bowyer`; assets/song/workshops-v1.png cell workshops[0,0] (col,row) of 3x2; trimmed native 473x431 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/bowyer.png
- **Current draw call + anchor:** songSprite(g,"bowyer",x,y,190,170) bottom-centre at record; worker act "weave" drawn at (x,y-2)
- **Sizes:** max box 190x170 wu; drawn now 187x170 wu; layout reserves 190x170 wu; new ground plan about 150x150 wu (squarish)
- **Pixels to deliver:** master 1140x1020 (6 px/wu); hi 570x510; md 285x255; lo 142x128
- **Inside:** Timber + hide -> bows; Lv2 makes divine-arm crossbows (神臂弓). Input: timber, hide. Output: bow, xbow.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** weave @(-35,-50); lift @(40,-50); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a crossbow trigger bench (神臂弓 prototype); Lv3 adds a rack of finished stock.

### bld_armourer — 甲坊 / Armourer  (class W, Military workshops)

- **Game records / ids:** record "dev:armour" (DEV armour, levels=3)
- **Current art:** `song:armourer`; assets/song/workshops-v1.png cell workshops[2,0] (col,row) of 3x2; trimmed native 500x379 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/armourer.png
- **Current draw call + anchor:** songSprite(g,"armourer",x,y,190,170) bottom-centre at record; worker act "hammer" drawn at (x,y-2)
- **Sizes:** max box 190x170 wu; drawn now 190x144 wu; layout reserves 190x170 wu; new ground plan about 150x150 wu (squarish)
- **Pixels to deliver:** master 1140x1020 (6 px/wu); hi 570x510; md 285x255; lo 142x128
- **Inside:** Leather -> leather armour and shields; Lv2 iron lamellar. Input: leather, ore. Output: armL, armI, shield.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** hammer @(-30,-48); weave @(40,-50); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds iron-plate bench; Lv3 adds second armour stand row.

### bld_saddlery — 鞍坊 / Saddlery  (class W, Military workshops)

- **Game records / ids:** record "dev:saddle" (DEV saddle, levels=2)
- **Current art:** `song:saddler`; assets/song/workshops-v1.png cell workshops[0,1] (col,row) of 3x2; trimmed native 476x393 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/saddler.png
- **Current draw call + anchor:** songSprite(g,"saddler",x,y,190,170) bottom-centre at record; worker act "weave" drawn at (x,y-2)
- **Sizes:** max box 190x170 wu; drawn now 190x157 wu; layout reserves 190x170 wu; new ground plan about 150x150 wu (squarish)
- **Pixels to deliver:** master 1140x1020 (6 px/wu); hi 570x510; md 285x255; lo 142x128
- **Inside:** Leather + timber -> saddles (cavalry need them). Input: leather, timber. Output: saddle.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** weave @(-35,-48); lift @(40,-48); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (2):** Lv2 adds a second stitching bench and tack wall.
- **Shared art today:** ALSO the stable and the lumber camp today (saddler art reused)

### bld_firelance — 火药作 / Fire-lance works  (class W, Military workshops)

- **Game records / ids:** record "dev:fire" (DEV fire, levels=2)
- **Current art:** `song:powder`; assets/song/workshops-v1.png cell workshops[1,1] (col,row) of 3x2; trimmed native 475x378 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/powder.png
- **Current draw call + anchor:** songSprite(g,"powder",x,y,190,170) bottom-centre at record; worker act "tend" drawn at (x,y-2)
- **Sizes:** max box 190x170 wu; drawn now 190x151 wu; layout reserves 190x170 wu; new ground plan about 150x150 wu (squarish)
- **Pixels to deliver:** master 1140x1020 (6 px/wu); hi 570x510; md 285x255; lo 142x128
- **Inside:** Saltpetre + bamboo -> fire lances (early gunpowder). Input: nitre, sulphur, charcoal. Output: fire-lance (song_fire).
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** tend @(-35,-50); stir @(40,-48); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (2):** Lv2 adds a second mixing bay and a drying rack for tubes.

### bld_market — 集市 / Market  (class W, Economy sites)

- **Game records / ids:** record "dev:market" (DEV market, levels=3); harvest jobs start at the door
- **Current art:** `song:winehouse`; assets/song/architecture-v2.png cell architecture[2,0] (col,row) of 4x2; trimmed native 402x350 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/winehouse.png
- **Current draw call + anchor:** songSprite(g,"winehouse",x,y,200,165)
- **Sizes:** max box 200x165 wu; drawn now 190x165 wu; layout reserves 200x165 wu; new ground plan about 150x150 wu (squarish)
- **Pixels to deliver:** master 1200x990 (6 px/wu); hi 600x495; md 300x248; lo 150x124
- **Inside:** Silver tax +50% per level; buy and sell goods; neighbouring markets open trade routes. Carts and merchants stop here.
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** count @(0,-45); stack @(55,-35); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds two stalls under cloth awnings; Lv3 adds a second storey gallery.
- **Shared art today:** currently the wine-house art (shared with brewery and restaurant)

### bld_lumber — 伐木场 / Lumber camp  (class W, Economy sites)

- **Game records / ids:** record "dev:lumber" (DEV lumber, levels=3); harvest jobs start at the door
- **Current art:** `song:saddler`; assets/song/workshops-v1.png cell workshops[0,1] (col,row) of 3x2; trimmed native 476x393 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/saddler.png
- **Current draw call + anchor:** songSprite(g,"saddler",x,y,200,165)
- **Sizes:** max box 200x165 wu; drawn now 200x165 wu; layout reserves 200x165 wu; new ground plan about 150x150 wu (squarish)
- **Pixels to deliver:** master 1200x990 (6 px/wu); hi 600x495; md 300x248; lo 150x124
- **Inside:** Woodcutters produce timber (less in winter). Output timber to the storehouse.
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** hammer @(-40,-45); lift @(40,-35); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a second saw pit; Lv3 adds a seasoning stack and a covered shed.
- **Shared art today:** currently the saddler art (wrong)

### bld_quarry — 采石场 / Quarry  (class W, Economy sites)

- **Game records / ids:** record "dev:quarry" (DEV quarry, levels=3); harvest jobs start at the door
- **Current art:** `song:smithy`; assets/song/architecture-v2.png cell architecture[0,1] (col,row) of 4x2; trimmed native 410x308 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/smithy.png
- **Current draw call + anchor:** songSprite(g,"smithy",x,y,200,165)
- **Sizes:** max box 200x165 wu; drawn now 200x150 wu; layout reserves 200x165 wu; new ground plan about 150x150 wu (squarish)
- **Pixels to deliver:** master 1200x990 (6 px/wu); hi 600x495; md 300x248; lo 150x124
- **Inside:** Produces stone. Output stone to the storehouse.
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** hammer @(-40,-45); push @(40,-35); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a hoist; Lv3 adds a second cutting face and a shelter.
- **Shared art today:** currently the smithy art (wrong)

### bld_mine — 冶坑 (铁矿) / Ore pits (iron)  (class W, Economy sites)

- **Game records / ids:** record "dev:mine" (DEV mine, levels=3); harvest jobs start at the door
- **Current art:** `song:smithy`; assets/song/architecture-v2.png cell architecture[0,1] (col,row) of 4x2; trimmed native 410x308 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/smithy.png
- **Current draw call + anchor:** songSprite(g,"smithy",x,y,200,165)
- **Sizes:** max box 200x165 wu; drawn now 200x150 wu; layout reserves 200x165 wu; new ground plan about 150x150 wu (squarish)
- **Pixels to deliver:** master 1200x990 (6 px/wu); hi 600x495; md 300x248; lo 150x124
- **Inside:** Produces ore (needs an iron trait or ore node). Output ore to the storehouse.
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** push @(-40,-45); lift @(40,-35); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a second pit and hoist; Lv3 adds a smelting stack.
- **Shared art today:** currently the smithy art (wrong)

### bld_saltworks — 盐池 / Salt works  (class W, Economy sites)

- **Game records / ids:** record "dev:saltw" (DEV saltw, levels=2); harvest jobs start at the door
- **Current art:** `song:smithy`; assets/song/architecture-v2.png cell architecture[0,1] (col,row) of 4x2; trimmed native 410x308 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/smithy.png
- **Current draw call + anchor:** songSprite(g,"smithy",x,y,200,165)
- **Sizes:** max box 200x165 wu; drawn now 200x150 wu; layout reserves 200x165 wu; new ground plan about 150x150 wu (squarish)
- **Pixels to deliver:** master 1200x990 (6 px/wu); hi 600x495; md 300x248; lo 150x124
- **Inside:** Produces salt (needs a salt trait or node). Output salt.
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** push @(-40,-45); stack @(40,-35); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (2):** Lv2 adds more evaporation pans and a drying shed.
- **Shared art today:** currently the smithy art (wrong)

### bld_brewery — 酒坊 / Brewery  (class W, Commerce businesses)

- **Game records / ids:** record "biz:brewery" (DY_BUSINESSES.brewery, levels 1-3, built through Commerce & Council); worker act "stir" at (x,y-2); inputs grain, charcoal -> outputs wine
- **Current art:** `song:winehouse`; assets/song/architecture-v2.png cell architecture[2,0] (col,row) of 4x2; trimmed native 402x350 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/winehouse.png
- **Current draw call + anchor:** songSprite(g,"winehouse",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x161 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: grain, charcoal. Outputs: wine. Worker act: stir.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** stir @(-30,-48); pour @(40,-45); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a still; Lv3 adds a jar yard and cellar door.
- **Shared art today:** wine-house art, shared with market and restaurant

### bld_beauty — 香皂香膏作 / Beauty (soap and balm) workshop  (class W, Commerce businesses)

- **Game records / ids:** record "biz:beauty" (DY_BUSINESSES.beauty, levels 1-3, built through Commerce & Council); worker act "push" at (x,y-2); inputs herbs, oil -> outputs cosmetics
- **Current art:** `song:courtyard`; assets/song/architecture-v2.png cell architecture[1,0] (col,row) of 4x2; trimmed native 435x337 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/courtyard.png
- **Current draw call + anchor:** songSprite(g,"courtyard",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x143 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: herbs, oil. Outputs: cosmetics. Worker act: push.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** push @(-30,-48); stir @(40,-45); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a second press; Lv3 adds a display counter at the front.
- **Shared art today:** courtyard house art

### bld_restaurant — 清河酒楼 / Restaurant (Qinghe tavern)  (class W, Commerce businesses)

- **Game records / ids:** record "biz:restaurant" (DY_BUSINESSES.restaurant, levels 1-3, built through Commerce & Council); worker act "pour" at (x,y-2); inputs grain, salt, wine -> outputs silver (takings)
- **Current art:** `song:winehouse`; assets/song/architecture-v2.png cell architecture[2,0] (col,row) of 4x2; trimmed native 402x350 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/winehouse.png
- **Current draw call + anchor:** songSprite(g,"winehouse",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x161 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: grain, salt, wine. Outputs: silver (takings). Worker act: pour.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** pour @(-35,-45); count @(45,-40); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds the balcony tables; Lv3 adds a second wing.
- **Shared art today:** wine-house art, shared with market and brewery

### bld_kiln — 炭窑 / Charcoal kiln  (class W, Commerce businesses)

- **Game records / ids:** record "biz:kiln" (DY_BUSINESSES.kiln, levels 1-3, built through Commerce & Council); worker act "tend" at (x,y-2); inputs timber -> outputs charcoal
- **Current art:** `song:smithy`; assets/song/architecture-v2.png cell architecture[0,1] (col,row) of 4x2; trimmed native 410x308 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/smithy.png
- **Current draw call + anchor:** songSprite(g,"smithy",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x139 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: timber. Outputs: charcoal. Worker act: tend.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** tend @(0,-50); stack @(55,-30); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a second kiln; Lv3 adds a covered store.
- **Shared art today:** smithy art

### bld_powderworks — 军器火药作 / Powder works  (class W, Commerce businesses)

- **Game records / ids:** record "biz:powderworks" (DY_BUSINESSES.powderworks, levels 1-3, built through Commerce & Council); worker act "stir" at (x,y-2); inputs nitre, sulphur, charcoal -> outputs blackpowder
- **Current art:** `song:powder`; assets/song/workshops-v1.png cell workshops[1,1] (col,row) of 3x2; trimmed native 475x378 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/powder.png
- **Current draw call + anchor:** songSprite(g,"powder",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x147 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: nitre, sulphur, charcoal. Outputs: blackpowder. Worker act: stir.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** stir @(-35,-48); tend @(40,-48); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a second grinding mill; Lv3 adds a separate magazine hut.
- **Shared art today:** powder workshop art (same as the fire-lance works)

### bld_arsenal — 军器监分作 / Ordnance foundry  (class W, Commerce businesses)

- **Game records / ids:** record "biz:arsenal" (DY_BUSINESSES.arsenal, levels 1-3, built through Commerce & Council); worker act "hammer" at (x,y-2); inputs ore, blackpowder, timber -> outputs bomb (grenades)
- **Current art:** `song:smithy`; assets/song/architecture-v2.png cell architecture[0,1] (col,row) of 4x2; trimmed native 410x308 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/smithy.png
- **Current draw call + anchor:** songSprite(g,"smithy",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x139 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: ore, blackpowder, timber. Outputs: bomb (grenades). Worker act: hammer.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** hammer @(-35,-50); pour @(45,-50); lift @(0,-35); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a second furnace; Lv3 adds a testing yard with a sandbag wall.
- **Shared art today:** smithy art

### bld_garden — 菜麻圃 / Market garden  (class W, Commerce businesses)

- **Game records / ids:** record "biz:garden" (DY_BUSINESSES.garden, levels 1-3, built through Commerce & Council); worker act "lift" at (x,y-2); inputs - -> outputs vegetables, beans, hemp
- **Current art:** `song:courtyard`; assets/song/architecture-v2.png cell architecture[1,0] (col,row) of 4x2; trimmed native 435x337 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/courtyard.png
- **Current draw call + anchor:** songSprite(g,"courtyard",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x143 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: -. Outputs: vegetables, beans, hemp. Worker act: lift.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** lift @(-30,-40); lift @(40,-35); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds more beds and a trellis; Lv3 adds a drying frame.
- **Shared art today:** courtyard house art

### bld_orchard — 果园 / Orchard  (class W, Commerce businesses)

- **Game records / ids:** record "biz:orchard" (DY_BUSINESSES.orchard, levels 1-3, built through Commerce & Council); worker act "stack" at (x,y-2); inputs - -> outputs fruit
- **Current art:** `song:courtyard`; assets/song/architecture-v2.png cell architecture[1,0] (col,row) of 4x2; trimmed native 435x337 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/courtyard.png
- **Current draw call + anchor:** songSprite(g,"courtyard",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x143 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: -. Outputs: fruit. Worker act: stack.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** stack @(-30,-40); lift @(40,-35); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds more trees; Lv3 adds a drying rack and a press.
- **Shared art today:** courtyard house art

### bld_weaver — 织造作 / Weaving house  (class W, Commerce businesses)

- **Game records / ids:** record "biz:weaver" (DY_BUSINESSES.weaver, levels 1-3, built through Commerce & Council); worker act "weave" at (x,y-2); inputs hemp -> outputs cloth
- **Current art:** `song:weaver`; assets/song/workshops-v1.png cell workshops[2,1] (col,row) of 3x2; trimmed native 479x392 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/weaver.png
- **Current draw call + anchor:** songSprite(g,"weaver",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x151 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: hemp. Outputs: cloth. Worker act: weave.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** weave @(-35,-48); weave @(40,-48); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a third loom; Lv3 adds a dyeing yard.
- **Shared art today:** weaver workshop art

### bld_papermill — 纸坊 / Paper mill  (class W, Commerce businesses)

- **Game records / ids:** record "biz:papermill" (DY_BUSINESSES.papermill, levels 1-3, built through Commerce & Council); worker act "lift" at (x,y-2); inputs timber, cloth -> outputs paper
- **Current art:** `song:courtyard`; assets/song/architecture-v2.png cell architecture[1,0] (col,row) of 4x2; trimmed native 435x337 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/courtyard.png
- **Current draw call + anchor:** songSprite(g,"courtyard",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x143 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: timber, cloth. Outputs: paper. Worker act: lift.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** lift @(-30,-48); push @(40,-45); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a second vat; Lv3 adds a water-wheel (if near the river).
- **Shared art today:** courtyard house art

### bld_pottery — 陶瓷窑 / Pottery kiln  (class W, Commerce businesses)

- **Game records / ids:** record "biz:pottery" (DY_BUSINESSES.pottery, levels 1-3, built through Commerce & Council); worker act "tend" at (x,y-2); inputs clay, charcoal -> outputs ceramics
- **Current art:** `song:courtyard`; assets/song/architecture-v2.png cell architecture[1,0] (col,row) of 4x2; trimmed native 435x337 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/courtyard.png
- **Current draw call + anchor:** songSprite(g,"courtyard",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x143 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: clay, charcoal. Outputs: ceramics. Worker act: tend.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** tend @(0,-50); push @(-45,-35); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a second kiln mouth; Lv3 adds a drying hall.
- **Shared art today:** courtyard house art

### bld_refinery — 冶铁作 / Steel works  (class W, Commerce businesses)

- **Game records / ids:** record "biz:refinery" (DY_BUSINESSES.refinery, levels 1-3, built through Commerce & Council); worker act "hammer" at (x,y-2); inputs ore, coal -> outputs steel
- **Current art:** `song:smithy`; assets/song/architecture-v2.png cell architecture[0,1] (col,row) of 4x2; trimmed native 410x308 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/smithy.png
- **Current draw call + anchor:** songSprite(g,"smithy",x,y,185,175) with a deferred label; production smoke for kiln/pottery/arsenal/refinery/powderworks/restaurant when active
- **Sizes:** max box 185x175 wu; drawn now 185x139 wu; layout reserves 185x175 wu; new ground plan about 145x145 wu (squarish)
- **Pixels to deliver:** master 1110x1050 (6 px/wu); hi 555x525; md 278x262; lo 139x131
- **Inside:** Inputs: ore, coal. Outputs: steel. Worker act: hammer.
- **Worker stations now:** ONE worker at (0,-2) (front-centre, act per row) between the door and the curb; carriers use the door (0,-8) for both input and output
- **Worker stations PROPOSED:** hammer @(-35,-50); tend @(45,-55); **input pile** (-65, -22); **output rack** (65, -22)
- **Levels (3):** Lv2 adds a second furnace; Lv3 adds a trip-hammer shed.
- **Shared art today:** smithy art (same as arsenal)

### bld_hall — 官署(衙门) / Yamen hall (Qinghe only; also map plates)  (class S, Qinghe-only civic)

- **Game records / ids:** record "hall" (civic:"hall", only in the player home village Qinghe; model = the sheet cell "yamen"; the same cell is used in campaign-map plates). 230x190 wu. Captured enemy banners are drawn by code on poles at (x - w/2 + 20 + i*(w-40)/5, y - 0.45h), up to 6
- **Current art:** `song:yamen`; assets/song/architecture-v2.png cell architecture[2,1] (col,row) of 4x2; trimmed native 437x311 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/yamen.png
- **Current draw call + anchor:** songSprite(g,"yamen",x,y,230,190) + banner poles in code; on map plates songMapPlate draws it at 144x100
- **Sizes:** max box 230x190 wu; drawn now 230x164 wu; layout reserves 230x190 wu; new ground plan about 190x120 wu (squarish)
- **Pixels to deliver:** master 1380x1140 (6 px/wu); hi 690x570; md 345x285; lo 172x142
- **Inside:** District office of the Song state: shows the village is Qinghe, home of the player. No workers inside.
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** none; **input pile** n/a; **output rack** n/a
- **Levels (1):** No levels. One solid sprite (roof baked in). Keep the lower 45% of the facade clear of detail: banners hang there.
- **Shared art today:** map plates use the same picture at 144x100

### bld_memorial — 纪念碑墙 / Memorial wall (Qinghe only)  (class S, Qinghe-only civic)

- **Game records / ids:** record "memorial" (civic:"memorial", only in Qinghe), currently drawn by code (vwDrawMemorial: stone wall with names). 170x95 wu. Names are written by code on the face from y-48 downward in 3 columns
- **Current art:** `procedural:vwDrawMemorial`; procedural (canvas code), no sprite file
- **Current draw call + anchor:** drawn in code; new art would be a sprite with key "memorial" at bottom-centre (x,y)
- **Sizes:** max box 170x95 wu; drawn now 170x95 wu; layout reserves 170x95 wu; new ground plan about 140x50 wu (squarish)
- **Pixels to deliver:** master 1020x570 (6 px/wu); hi 510x285; md 255x142; lo 128x71
- **Inside:** Honours fallen soldiers: names of the dead are painted by the game on the stone face.
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** none; **input pile** n/a; **output rack** n/a
- **Levels (1):** No levels. One solid sprite.

### bld_granary_map — 粮仓(地图图标) / Granary (campaign-map plates only)  (class S, Map-only (optional))

- **Game records / ids:** sheet cell "granary" is used only to compose campaign-map settlement plates (songMapPlate); not in the village view
- **Current art:** `song:granary`; assets/song/architecture-v2.png cell architecture[3,0] (col,row) of 4x2; trimmed native 436x273 px. NO hi/md/lo tiers: one PNG sheet is sliced at load (song-art.js). Extracted copy: current/sprites/granary.png
- **Current draw call + anchor:** songSprite in songMapPlate (tiny)
- **Sizes:** max box 75x62 wu; drawn now 75x47 wu; layout reserves 0x0 wu; new ground plan about 0x0 wu (squarish)
- **Pixels to deliver:** master 450x372 (6 px/wu); hi 225x186; md 112x93; lo 56x46
- **Inside:** -
- **Worker stations now:** none (door only: carriers arrive/leave at (0,-8))
- **Worker stations PROPOSED:** none; **input pile** n/a; **output rack** n/a
- **Levels (1):** -
