# PROMPTS — ready-to-paste image prompts

Works with GPT-Image / DALL·E style tools (paste the whole block) and Midjourney-like tools (use the one-line `MJ:` version under each). Generate in this order: **(1) style anchors, (2) one building at a time, interior first then roof, (3) variants, damaged and construction via edit prompts**.

## 0. Rules that apply to every prompt

1. Attach the approved **style anchor A and B** (section 1) as reference images to every later prompt and say "match the attached style anchors exactly (palette, line weight, tile size, light)". In Midjourney use `--sref <anchor url>`.
2. The **interior layer and roof layer of one building must have the identical canvas, camera and building position.** Generators drift. The reliable way is the edit workflow in section 4 (generate one complete hero image, then derive layers by editing), not two independent generations.
3. **Never let the generator draw Chinese characters.** Plaques and banners stay blank; text is added afterwards with `tools/add_signboard_text.py` using the text in `ART_DIRECTION.md`.
4. **No people, no animals, no ground plate, no stock of goods.** The game draws workers, patients, horses, goods and soldiers live.
5. Keep the building inside its **max box** (`buildings.csv`). Generator canvases: 1024x1024 (squarish), 1536x1024 (wide), 1024x1536 (tall). Upscale/crop to the exact master canvas afterwards (`specs/TECH_SPEC.md`).
6. One camera for everything: **orthographic, 38 degrees, north up, light from the upper left**. If an image comes back at a different angle, regenerate; do not fix it by hand.

## 1. STYLE ANCHORS (generate these first)

### anchor_a_cutaway
```text
Game sprite, Northern Song dynasty (c. 1120 AD) frontier village, Gansu/Ningxia loess country. Hand-painted digital miniature, richly detailed, thin dark-brown ink outlines of one consistent weight, warm earthen palette (ochre loess plaster, charcoal-grey ceramic tiles, weathered brown timber, celadon and burgundy cloth accents), visible material texture, lived-in detail. Light from the upper left (north-west); soft contact shadow only lower-right, hugging the building.
Strict orthographic camera, 38 degrees elevation, north up, front facing the bottom of the image, turned about 12 degrees so a thin sliver of the right side shows, no perspective convergence. Building centred horizontally, front edge near the bottom-centre, fully inside the canvas with 5% margin.
SUBJECT: STYLE ANCHOR A. A Northern Song smithy workshop, LAYER = cutaway interior (no roof), squarish room about 150 x 150 world units, rear and left walls of rammed earth with timber posts and lattice window, front and right walls cut to a low curb, stone-flag floor, stone forge with box bellows at the rear right, anvil on a log at the rear centre, quench trough at the middle left, tool wall, charcoal bin; bare floor patch for an input pile at the left front and an empty weapon rack at the right front; door gap at the bottom-centre. Also show, beside it at the same scale on the same canvas, the matching ROOF alone floating (grey tile hip-and-gable with a clay chimney), so the palette, roof tile size and line weight are locked. Output on a TRANSPARENT background (PNG alpha). If the tool cannot, use one flat pure magenta #FF00FF background with no gradient and no shadow on it.
Avoid: Ming/Qing style, yellow glazed roofs, palace roofs, sharply upturned flying eaves, horse-head gable walls, pagodas, dragon/gold ornament, Japanese shoji/tatami/torii, Mediterranean terracotta, glass windows, modern/fantasy/steampunk objects, people, animals, ANY letters or Chinese characters (plaques stay BLANK), ground/grass/backdrop/shadow plate, perspective distortion, flat icons, toy blocks, photo or plastic-3D look, true 90-degree top-down, side elevation.
```

### anchor_b_house
```text
Game sprite, Northern Song dynasty (c. 1120 AD) frontier village, Gansu/Ningxia loess country. Hand-painted digital miniature, richly detailed, thin dark-brown ink outlines of one consistent weight, warm earthen palette (ochre loess plaster, charcoal-grey ceramic tiles, weathered brown timber, celadon and burgundy cloth accents), visible material texture, lived-in detail. Light from the upper left (north-west); soft contact shadow only lower-right, hugging the building.
Strict orthographic camera, 38 degrees elevation, north up, front facing the bottom of the image, turned about 12 degrees so a thin sliver of the right side shows, no perspective convergence. Building centred horizontally, front edge near the bottom-centre, fully inside the canvas with 5% margin.
SUBJECT: STYLE ANCHOR B. A Northern Song tiled courtyard house, complete and closed, L-shaped two wings, white clay plaster panels between brown timber posts over a stone footing, grey tile gable roofs with plain ridge ends, lattice windows, plank door, small stone-paved forecourt with a jujube sapling and a jar. Same palette, line weight and light as anchor A. Output on a TRANSPARENT background (PNG alpha). If the tool cannot, use one flat pure magenta #FF00FF background with no gradient and no shadow on it.
Avoid: Ming/Qing style, yellow glazed roofs, palace roofs, sharply upturned flying eaves, horse-head gable walls, pagodas, dragon/gold ornament, Japanese shoji/tatami/torii, Mediterranean terracotta, glass windows, modern/fantasy/steampunk objects, people, animals, ANY letters or Chinese characters (plaques stay BLANK), ground/grass/backdrop/shadow plate, perspective distortion, flat icons, toy blocks, photo or plastic-3D look, true 90-degree top-down, side elevation.
```

### anchor_c_people_scale
```text
Using the two attached style anchors (do not change them), produce a SCALE CHECK image only: stand five villagers (adult man, woman, elder, child, porter; plain Song-era hemp clothes, no letters) in front of the courtyard house in the same orthographic 38-degree camera. The house is 135 world units wide and an adult is 31 world units tall, so the house must be 4.35 adults wide and a child about 0.6 of an adult. This image is only for checking proportions and is not an asset. Flat magenta #FF00FF background.
```

Review checklist for the anchors: grey tiles (not yellow, not terracotta), swept eaves only slightly curved, thin dark-brown outlines, light from the upper left, no letters, transparent edges clean. Do not continue until the user approves A and B.

## 2. Shared blocks

**HEADER (paste first)**
```text
Game sprite, Northern Song dynasty (c. 1120 AD) frontier village, Gansu/Ningxia loess country. Hand-painted digital miniature, richly detailed, thin dark-brown ink outlines of one consistent weight, warm earthen palette (ochre loess plaster, charcoal-grey ceramic tiles, weathered brown timber, celadon and burgundy cloth accents), visible material texture, lived-in detail. Light from the upper left (north-west); soft contact shadow only lower-right, hugging the building.
Strict orthographic camera, 38 degrees elevation, north up, front facing the bottom of the image, turned about 12 degrees so a thin sliver of the right side shows, no perspective convergence. Building centred horizontally, front edge near the bottom-centre, fully inside the canvas with 5% margin.
```
**FOOTER (paste last)**
```text
Output on a TRANSPARENT background (PNG alpha). If the tool cannot, use one flat pure magenta #FF00FF background with no gradient and no shadow on it.
Avoid: Ming/Qing style, yellow glazed roofs, palace roofs, sharply upturned flying eaves, horse-head gable walls, pagodas, dragon/gold ornament, Japanese shoji/tatami/torii, Mediterranean terracotta, glass windows, modern/fantasy/steampunk objects, people, animals, ANY letters or Chinese characters (plaques stay BLANK), ground/grass/backdrop/shadow plate, perspective distortion, flat icons, toy blocks, photo or plastic-3D look, true 90-degree top-down, side elevation.
```

**LAYER: INTERIOR CUTAWAY (already inside every `interior` block)**
```text
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
```

**LAYER: ROOF ONLY (already inside every `roof` block)**
```text
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
```

**LAYER: SOLID (already inside every `solid` block)**
```text
LAYER = ONE COMPLETE SPRITE, roof in place, closed and finished, no cutaway. Door at bottom-centre of the front. No people.
```

## 3. Per-building prompts

**How to paste.** Every prompt = `HEADER` (section 2: STYLE + CAMERA) + the building block below + `FOOTER` (BACKGROUND + NEGATIVE). `interior` = base cutaway layer, `roof` = roof layer, `solid` = single complete sprite (homes, gates, towers, fields). **The fully expanded, single-paste version of every prompt is already assembled in `prompts/<key>__<layer>.txt` (and `prompts/prompts.json`)** - use those if you do not want to concatenate.

### bld_home_cottage — 民居(茅屋) / Cottage (thatch)  (Homes, class H, variants: home_cottage_a, home_cottage_b, home_cottage_c)

**solid**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Cottage (thatch). Walls: rammed-earth (夯土) or earth-brick lower walls, whitewashed upper wall, lattice window (直欞窗), plank door. Roof: thatched 懸山 (overhanging gable) roof of straw or reed with ridge bundles; very gently curved. Fixed furniture and props: grain jars and a basket at the door, a woodpile, a small wattle fence, hanging maize/millet cobs and dried gourds under the eave, a hen coop optional. Worker stations (one standing worker each, leave floor free in front of the item): no fixed worker stations. Ground plan about 100 x 100 world units (an adult is 31 wu tall: about 3.2 adults wide). No signboard text. Note: frontier poor house: mostly earth, little timber.
LAYER = ONE COMPLETE SPRITE, roof in place, closed and finished, no cutaway. Door at bottom-centre of the front. No people. Generate three different variants (a, b, c) with the same footprint box.
CANVAS: 1024x1024 (1:1); max bounding box 135 x 120 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Cottage (thatch), complete closed building, grain jars and a basket at the door, a woodpile, a small wattle fence, hanging maize/millet cobs and dried gourds under the eave, a hen coop optional, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof_optional**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Cottage (thatch). Roof: thatched 懸山 (overhanging gable) roof of straw or reed with ridge bundles; very gently curved. Ground plan about 100 x 100 wu (about 3.2 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 135 x 120 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Cottage (thatch), roof only, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_home_courtyard — 民居(瓦院) / Courtyard house (tile)  (Homes, class H, variants: home_courtyard_a, home_courtyard_b, home_courtyard_c)

**solid**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Courtyard house (tile). Walls: white-plaster panels between brown timber posts over a stone footing. Roof: grey-tile 懸山 (overhanging-gable) roofs on two connected wings, plain ridge with small 鴟尾/ridge-end ornaments (modest). Fixed furniture and props: small stone-paved forecourt, jar, a jujube or willow sapling, firewood, drying cloth, wooden gate (版門). Worker stations (one standing worker each, leave floor free in front of the item): no fixed worker stations. Ground plan about 105 x 100 world units (an adult is 31 wu tall: about 3.4 adults wide). No signboard text. Note: no dougong on private homes.
LAYER = ONE COMPLETE SPRITE, roof in place, closed and finished, no cutaway. Door at bottom-centre of the front. No people. Generate three different variants (a, b, c) with the same footprint box.
CANVAS: 1024x1024 (1:1); max bounding box 135 x 120 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Courtyard house (tile), complete closed building, small stone-paved forecourt, jar, a jujube or willow sapling, firewood, drying cloth, wooden gate (版門), grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof_optional**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Courtyard house (tile). Roof: grey-tile 懸山 (overhanging-gable) roofs on two connected wings, plain ridge with small 鴟尾/ridge-end ornaments (modest). Ground plan about 105 x 100 wu (about 3.4 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 135 x 120 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Courtyard house (tile), roof only, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_storehouse — 仓廒 / Storehouse (open-topped granary)  (Civic / storage, class W, variants: storehouse_a, storehouse_b)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Storehouse (open-topped granary). Walls: rammed-earth side walls, timber frame, raised plank floor on stone piers. Roof: long grey-tile 懸山 roof raised on stone footings, ventilation louvres in the gable; roof layer must be removable. Fixed furniture and props: sacks, grain baskets, jars, timber bundles, stone blocks; the game draws the REAL stock quantities as separate goods sprites (assets/song/goods-v1.png) in rows of 4 starting x-90, y-66, spacing 58 / 28 wu - leave bay floor EMPTY and clean there; no stock painted in. Worker stations (one standing worker each, leave floor free in front of the item): stacking bay at front-right. Ground plan about 160 x 120 world units (an adult is 31 wu tall: about 5.2 adults wide). Signboard: a flat blank dark-lacquer plaque (text '倉廒' will be added later in post) in the front. Note: official granary look (官倉): sober, repetitive bays.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1536x1024 (3:2); max bounding box 300 x 165 wu (ratio 1.82), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Storehouse (open-topped granary), roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, sacks, grain baskets, jars, timber bundles, stone blocks; the game draws the REAL stock quantities as separate goods sprites (assets/song/goods-v1.png) in rows of 4 starting x-90, y-66, spacing 58 / 28 wu - leave bay floor EMPTY and clean there; no stock painted in, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 3:2 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Storehouse (open-topped granary). Roof: long grey-tile 懸山 roof raised on stone footings, ventilation louvres in the gable; roof layer must be removable. Ground plan about 160 x 120 wu (about 5.2 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1536x1024 (3:2); max bounding box 300 x 165 wu (ratio 1.82), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Storehouse (open-topped granary), roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 3:2 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_treasury — 大宋官库 / Song treasury (roof cutaway)  (Civic / storage, class W, variants: treasury)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Song treasury (roof cutaway). Walls: thick rammed-earth outer wall with timber frame, stone steps. Roof: official building: dignified grey-tile hip-and-gable (歇山) with dougong; roof layer removable; keep a rear/side roof strip in the BASE (as now) so it still reads as a cutaway. Fixed furniture and props: SIX EMPTY dark timber trays in two columns of three at the positions above (do not paint ingots/coins), red-lacquered posts, iron-bound chests along the back wall, stone steps, paper seals (封條) on chests. Worker stations (one standing worker each, leave floor free in front of the item): counting table or counter at front-right. Ground plan about 150 x 120 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '官庫' will be added later in post) in the front. Note: vermilion posts only here and on the hall/yamen.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1536x1024 (3:2); max bounding box 230 x 170 wu (ratio 1.35), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Song treasury (roof cutaway), roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, SIX EMPTY dark timber trays in two columns of three at the positions above (do not paint ingots/coins), red-lacquered posts, iron-bound chests along the back wall, stone steps, paper seals (封條) on chests, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 3:2 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Song treasury (roof cutaway). Roof: official building: dignified grey-tile hip-and-gable (歇山) with dougong; roof layer removable; keep a rear/side roof strip in the BASE (as now) so it still reads as a cutaway. Ground plan about 150 x 120 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1536x1024 (3:2); max bounding box 230 x 170 wu (ratio 1.35), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Song treasury (roof cutaway), roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 3:2 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_armoury — 武库 / Armoury  (Civic / storage, class W, variants: armoury)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Armoury. Walls: rammed-earth, iron-studded plank doors. Roof: long sober grey-tile roof, lower than the storehouse, small watch-pennant on the ridge. Fixed furniture and props: empty weapon racks and armour stands along the back wall (the game fills them: do NOT paint spears/bows in), a sentry stool, pennant, sand bucket (fire safety). Worker stations (one standing worker each, leave floor free in front of the item): counting table or counter at front-right. Ground plan about 150 x 110 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '武庫' will be added later in post) in the front. Note: more fortified than the granary.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1536x1024 (3:2); max bounding box 280 x 165 wu (ratio 1.70), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Armoury, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, empty weapon racks and armour stands along the back wall (the game fills them: do NOT paint spears/bows in), a sentry stool, pennant, sand bucket (fire safety), grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 3:2 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Armoury. Roof: long sober grey-tile roof, lower than the storehouse, small watch-pennant on the ridge. Ground plan about 150 x 110 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1536x1024 (3:2); max bounding box 280 x 165 wu (ratio 1.70), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Armoury, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 3:2 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_barracks — 兵营 / 校场 / Barracks hall and drill yard  (Civic / storage, class W, variants: barracks)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Barracks hall and drill yard. Walls: timber hall on stone base, low rammed-earth yard wall. Roof: long sober grey-tile hall with open veranda, muted red pillars, small pennants. Fixed furniture and props: weapon racks, archery butt targets, timber training posts (木人樁), caltrop barricades (拒馬), banner pole, water jar; yard = packed sand with raked lines. Deliver the HALL and the YARD FURNITURE as separate sprites; the sand floor tint stays in code. Worker stations (one standing worker each, leave floor free in front of the item): hammering block / anvil / pounding bench at rear-left. Ground plan about 280 x 160 world units (an adult is 31 wu tall: about 9.0 adults wide). Signboard: a flat blank dark-lacquer plaque (text '校場' will be added later in post) in the front. Note: frontier garrison: plain.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1536x1024 (3:2); max bounding box 130 x 90 wu (ratio 1.44), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Barracks hall and drill yard, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, weapon racks, archery butt targets, timber training posts (木人樁), caltrop barricades (拒馬), banner pole, water jar; yard = packed sand with raked lines. Deliver the HALL and the YARD FURNITURE as separate sprites; the sand floor tint stays in code, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 3:2 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Barracks hall and drill yard. Roof: long sober grey-tile hall with open veranda, muted red pillars, small pennants. Ground plan about 280 x 160 wu (about 9.0 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1536x1024 (3:2); max bounding box 130 x 90 wu (ratio 1.44), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Barracks hall and drill yard, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 3:2 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_stable — 马厩 / Stables  (Civic / storage, class W, variants: stable)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Stables. Walls: half-height plank partitions, rammed-earth back wall. Roof: low long grey-tile roof over open stalls with timber partitions. Fixed furniture and props: feed troughs, hay bales, saddle stands, hanging bridles, water trough, tethering posts, manure cart. Worker stations (one standing worker each, leave floor free in front of the item): lifting-and-carrying bench or frame at middle-left. Ground plan about 170 x 120 world units (an adult is 31 wu tall: about 5.5 adults wide). Signboard: a flat blank dark-lacquer plaque (text '馬廄' will be added later in post) in the front. Note: no horses painted in (the game animates them).
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 155 wu (ratio 1.29), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Stables, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, feed troughs, hay bales, saddle stands, hanging bridles, water trough, tethering posts, manure cart, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Stables. Roof: low long grey-tile roof over open stalls with timber partitions. Ground plan about 170 x 120 wu (about 5.5 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 155 wu (ratio 1.29), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Stables, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_hospital — 医馆 / Hospital (Lv1-2)  (Civic / storage, class W, variants: hospital)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Hospital (Lv1-2). Walls: whitewashed plaster between brown timber posts, lattice windows, grey-tile roof; palette must match the rest of the village (the current ward has a red roof and brick floor and clashes). Roof: grey-tile 懸山 with a short covered porch at the front. Fixed furniture and props: eight low timber beds with cloth screens/bamboo mats and folded quilts (empty - game draws patients), a hundred-drawer medicine cabinet (百眼櫥), medicine roller/grinder boat (藥碾), clay decoction stove with jars, hanging herb bundles, a gourd sign, water basin, a bamboo screen. NO red crosses. Worker stations (one standing worker each, leave floor free in front of the item): stirring vat / pot / trough at front-right; counting table or counter at front-centre; pouring / quenching / ladling trough at rear-left. Ground plan about 190 x 190 world units (an adult is 31 wu tall: about 6.1 adults wide). Signboard: a flat blank dark-lacquer plaque (text '醫館' will be added later in post) and a hanging cloth banner (hanging gourd sign 懸壺) in the front. Note: Song 惠民藥局 (state pharmacy) and 安濟坊 (relief wards) are authentic references.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 240 x 230 wu (ratio 1.04), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Hospital (Lv1-2), roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, eight low timber beds with cloth screens/bamboo mats and folded quilts (empty - game draws patients), a hundred-drawer medicine cabinet (百眼櫥), medicine roller/grinder boat (藥碾), clay decoction stove with jars, hanging herb bundles, a gourd sign, water basin, a bamboo screen. NO red crosses, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Hospital (Lv1-2). Roof: grey-tile 懸山 with a short covered porch at the front. Ground plan about 190 x 190 wu (about 6.1 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 240 x 230 wu (ratio 1.04), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Hospital (Lv1-2), roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_watchtower — 望楼 / Watchtower (Lv1-2)  (Civic / storage, class S, variants: watchtower_l1, watchtower_l2)

**solid**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Watchtower (Lv1-2). Walls: rammed-earth base (墩台) + timber frame above. Roof: small grey-tile pavilion roof (Lv2) or open platform with thatch shade (Lv1). Fixed furniture and props: beacon fire basket (烽火臺 style), signal drum, ladder, spear rack on platform. Worker stations (one standing worker each, leave floor free in front of the item): no fixed worker stations. Ground plan about 40 x 40 world units (an adult is 31 wu tall: about 1.3 adults wide). No signboard text. Note: Song border beacon towers (烽燧/烽火臺) were rammed-earth.
LAYER = ONE COMPLETE SPRITE, roof in place, closed and finished, no cutaway. Door at bottom-centre of the front. No people. Generate two variants: level 1 (timber frame tower with an open platform) and level 2 (taller, tiled roof, beacon basket).
CANVAS: 1024x1536 (2:3); max bounding box 70 x 105 wu (ratio 0.67), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Watchtower (Lv1-2), complete closed building, beacon fire basket (烽火臺 style), signal drum, ladder, spear rack on platform, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 2:3 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_gate — 村门 / Village gate (3 tiers: hamlet, village, town)  (Civic / storage, class S, variants: gate_hamlet, gate_village, gate_town)

**solid**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Village gate (3 tiers: hamlet, village, town). Walls: rammed-earth with brick facing, stone threshold. Roof: hamlet: thatch/plank gate shed; village: grey-tile 懸山 gatehouse; town: masonry (磚城) gate with a two-bay tile tower and modest dougong. Fixed furniture and props: PLAQUE AREA MUST BE BLANK AND FLAT: a dark timber board 96x23 wu at the height given in "draws". Banner poles, a couple of lanterns optional, rammed-earth wall stubs left/right so walls connect. Worker stations (one standing worker each, leave floor free in front of the item): no fixed worker stations. Ground plan about 200 x 70 world units (an adult is 31 wu tall: about 6.5 adults wide). No signboard text. Note: no imperial gate-tower scale.
LAYER = ONE COMPLETE SPRITE, roof in place, closed and finished, no cutaway. Door at bottom-centre of the front. No people. Generate THREE variants as three separate images: (hamlet) modest timber and rammed-earth gate shed; (village) grey-tile gatehouse; (town) masonry gate with a small tile tower. The name plaque is a flat blank dark board 96 x 23 wu at 50% of the height above the bottom edge (40% for the town gate), centred; the open archway is at least 36 wu wide; short rammed-earth wall stubs left and right.
CANVAS: 1536x1024 (3:2); max bounding box 285 x 210 wu (ratio 1.36), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Village gate (3 tiers: hamlet, village, town), complete closed building, PLAQUE AREA MUST BE BLANK AND FLAT: a dark timber board 96x23 wu at the height given in "draws". Banner poles, a couple of lanterns optional, rammed-earth wall stubs left/right so walls connect, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 3:2 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_wall_kit — 寨墙 / Palisade/wall kit (optional, P3)  (Civic / storage, class S, variants: wall_kit)

**solid**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Palisade/wall kit (optional, P3). Walls: rammed earth layers visible (夯土層), brick facing in Lv3. Roof: none (crenellated parapet 垛口). Fixed furniture and props: none. Worker stations (one standing worker each, leave floor free in front of the item): no fixed worker stations. Ground plan about 60 x 20 world units (an adult is 31 wu tall: about 1.9 adults wide). No signboard text. Note: OPTIONAL - only after buildings are done.
LAYER = ONE COMPLETE SPRITE, roof in place, closed and finished, no cutaway. Door at bottom-centre of the front. No people. Deliver a straight horizontal tile 60 wu long, a corner piece, and an end cap, each in three levels (earth+palisade, rammed earth with parapet, brick-faced with battlements); tiles must repeat seamlessly left to right.
CANVAS: 1024x1536 (2:3); max bounding box 60 x 80 wu (ratio 0.75), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Palisade/wall kit (optional, P3), complete closed building, none, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 2:3 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_field — 田庄(农田) / Farm field plots (4 seasons)  (Farm, class F, variants: field_spring, field_summer, field_autumn, field_winter)

**solid**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Farm field plots (4 seasons). Walls: low earth ridge boundaries (田埂). Roof: none. Fixed furniture and props: terraced millet/wheat rows (northwest crops: millet 粟, wheat, sorghum), irrigation channel, stone boundary markers, scarecrow in summer. Worker stations (one standing worker each, leave floor free in front of the item): lifting-and-carrying bench or frame at front-centre. Ground plan about 160 x 106 world units (an adult is 31 wu tall: about 5.2 adults wide). No signboard text. Note: 4 seasonal variants, same footprint and same tile edges so plots can sit side by side.
LAYER = ONE COMPLETE SPRITE, roof in place, closed and finished, no cutaway. Door at bottom-centre of the front. No people. Generate FOUR seasonal variants as separate images with identical footprint and tile edges: spring (green shoots), summer (tall green millet and wheat), autumn (golden, stooks), winter (bare frosted furrows).
CANVAS: 1536x1024 (3:2); max bounding box 160 x 106 wu (ratio 1.51), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Farm field plots (4 seasons), complete closed building, terraced millet/wheat rows (northwest crops: millet 粟, wheat, sorghum), irrigation channel, stone boundary markers, scarecrow in summer, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 3:2 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_smithy — 铁匠铺 / Smithy  (Military workshops, class W, variants: smithy)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Smithy. Walls: rammed-earth rear and left walls, timber posts, low front curb; stone-flag or beaten-earth floor. Roof: low grey-tile 懸山 roof with a clay chimney stack; roof covers rear 2/3 in the hero view. Fixed furniture and props: stone forge with bellows (木扇風箱), anvil on a log, quench trough, tongs and hammers on the back wall, charcoal bin, grindstone. Worker stations (one standing worker each, leave floor free in front of the item): hammering block / anvil / pounding bench at middle-centre; tended fire, furnace or kiln mouth at rear-right; pouring / quenching / ladling trough at middle-left. Ground plan about 150 x 150 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '鐵匠鋪' will be added later in post) and a hanging cloth banner (iron-red cloth banner "鐵") in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Smithy, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, stone forge with bellows (木扇風箱), anvil on a log, quench trough, tongs and hammers on the back wall, charcoal bin, grindstone, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Smithy. Roof: low grey-tile 懸山 roof with a clay chimney stack; roof covers rear 2/3 in the hero view. Ground plan about 150 x 150 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Smithy, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_tannery — 皮坊 / Tannery  (Military workshops, class W, variants: tannery)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Tannery. Walls: rammed-earth rear and left walls, timber posts, low front curb; stone-flag or beaten-earth floor. Roof: simple grey-tile shed on the rear half, front half open to sky. Fixed furniture and props: two or three large shallow wooden vats (soaking/tanning), stretched hides on timber frames, scraping beam, lime pit, rinsing barrels, rope lines. Worker stations (one standing worker each, leave floor free in front of the item): stirring vat / pot / trough at middle-left; stirring vat / pot / trough at middle-centre; lifting-and-carrying bench or frame at rear-right. Ground plan about 150 x 150 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '皮坊' will be added later in post) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Tannery, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, two or three large shallow wooden vats (soaking/tanning), stretched hides on timber frames, scraping beam, lime pit, rinsing barrels, rope lines, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Tannery. Roof: simple grey-tile shed on the rear half, front half open to sky. Ground plan about 150 x 150 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Tannery, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_bowyer — 弓弩坊 / Bowyer  (Military workshops, class W, variants: bowyer)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Bowyer. Walls: rammed-earth rear and left walls, timber posts, low front curb; stone-flag or beaten-earth floor. Roof: tiled shed roof over the rear bay, bows hanging under the eaves. Fixed furniture and props: wood-bending jig (steam box), bamboo/horn/sinew staves, bowstring winder, crossbow stocks on a bench, arrow-straightening block, finished bows hung under eaves (hang only 2-3). Worker stations (one standing worker each, leave floor free in front of the item): weaving / stitching / binding bench or loom at middle-left; lifting-and-carrying bench or frame at middle-right. Ground plan about 150 x 150 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '弓弩坊' will be added later in post) and a hanging cloth banner (cloth banner "弓") in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Bowyer, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, wood-bending jig (steam box), bamboo/horn/sinew staves, bowstring winder, crossbow stocks on a bench, arrow-straightening block, finished bows hung under eaves (hang only 2-3), grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Bowyer. Roof: tiled shed roof over the rear bay, bows hanging under the eaves. Ground plan about 150 x 150 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Bowyer, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_armourer — 甲坊 / Armourer  (Military workshops, class W, variants: armourer)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Armourer. Walls: rammed-earth rear and left walls, timber posts, low front curb; stone-flag or beaten-earth floor. Roof: long open-front grey-tile workshop; no open fire in the art (it is not a forge). Fixed furniture and props: lamellar plate (札甲) laying table, lacing awl and cord, helmet blocks on stands, hanging dark lamellar coats (2-3 only), small anvil for plates. Worker stations (one standing worker each, leave floor free in front of the item): hammering block / anvil / pounding bench at middle-left; weaving / stitching / binding bench or loom at middle-right. Ground plan about 150 x 150 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '甲坊' will be added later in post) and a hanging cloth banner (lamellar helmet sign) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Armourer, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, lamellar plate (札甲) laying table, lacing awl and cord, helmet blocks on stands, hanging dark lamellar coats (2-3 only), small anvil for plates, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Armourer. Roof: long open-front grey-tile workshop; no open fire in the art (it is not a forge). Ground plan about 150 x 150 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Armourer, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_saddlery — 鞍坊 / Saddlery  (Military workshops, class W, variants: saddlery)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Saddlery. Walls: rammed-earth rear and left walls, timber posts, low front curb; stone-flag or beaten-earth floor. Roof: open-front tile-roofed workshop. Fixed furniture and props: saddle trees on stands, stitching horse (縫皮凳), leather rolls, stirrup pairs, bridles hanging, awl and thread, awning. Worker stations (one standing worker each, leave floor free in front of the item): weaving / stitching / binding bench or loom at middle-left; lifting-and-carrying bench or frame at middle-right. Ground plan about 150 x 150 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '鞍坊' will be added later in post) and a hanging cloth banner (leather strap banner) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Saddlery, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, saddle trees on stands, stitching horse (縫皮凳), leather rolls, stirrup pairs, bridles hanging, awl and thread, awning, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Saddlery. Roof: open-front tile-roofed workshop. Ground plan about 150 x 150 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Saddlery, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_firelance — 火药作 / Fire-lance works  (Military workshops, class W, variants: firelance)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Fire-lance works. Walls: rammed-earth rear and left walls, timber posts, low front curb; stone-flag or beaten-earth floor. Roof: low grey-tile roof over the rear bay, thick rammed-earth side walls (fire protection). Fixed furniture and props: mortar and pestle (石臼), ceramic jars, bamboo tubes, a timber mixing table, sand buckets, a water barrel, iron-banded chest. No cannons, no modern explosives. Worker stations (one standing worker each, leave floor free in front of the item): tended fire, furnace or kiln mouth at middle-left; stirring vat / pot / trough at middle-right. Ground plan about 150 x 150 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '火藥作' will be added later in post) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Fire-lance works, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, mortar and pestle (石臼), ceramic jars, bamboo tubes, a timber mixing table, sand buckets, a water barrel, iron-banded chest. No cannons, no modern explosives, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Fire-lance works. Roof: low grey-tile roof over the rear bay, thick rammed-earth side walls (fire protection). Ground plan about 150 x 150 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 190 x 170 wu (ratio 1.12), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Fire-lance works, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_market — 集市 / Market  (Economy sites, class W, variants: market)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Market. Walls: rammed earth and timber; open sides. Roof: open timber market hall: grey-tile roof on posts with side awnings (Qingming-scroll street-shop feel). Fixed furniture and props: three counters with scales (秤), baskets, hanging cloth banners (幌子), a signboard post, weigh beam, ox cart parked, stacked jars and bolts of cloth. Worker stations (one standing worker each, leave floor free in front of the item): counting table or counter at middle-centre; stacking bay at middle-right. Ground plan about 150 x 150 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '集市' will be added later in post) and a hanging cloth banner (cloth awnings with trade signs, 酒 banner optional) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 165 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Market, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, three counters with scales (秤), baskets, hanging cloth banners (幌子), a signboard post, weigh beam, ox cart parked, stacked jars and bolts of cloth, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Market. Roof: open timber market hall: grey-tile roof on posts with side awnings (Qingming-scroll street-shop feel). Ground plan about 150 x 150 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 165 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Market, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_lumber — 伐木场 / Lumber camp  (Economy sites, class W, variants: lumber)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Lumber camp. Walls: rammed earth and timber; open sides. Roof: small timber lean-to roof (tile or plank) over a saw pit; mostly open yard. Fixed furniture and props: log piles, a two-man pit saw (大鋸), axes on a rack, a sawyer trestle, cut planks stacked, a ox-drag sledge. Worker stations (one standing worker each, leave floor free in front of the item): hammering block / anvil / pounding bench at middle-left; lifting-and-carrying bench or frame at middle-right. Ground plan about 150 x 150 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '伐木場' will be added later in post) and a hanging cloth banner (none) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 165 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Lumber camp, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, log piles, a two-man pit saw (大鋸), axes on a rack, a sawyer trestle, cut planks stacked, a ox-drag sledge, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Lumber camp. Roof: small timber lean-to roof (tile or plank) over a saw pit; mostly open yard. Ground plan about 150 x 150 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 165 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Lumber camp, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_quarry — 采石场 / Quarry  (Economy sites, class W, variants: quarry)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Quarry. Walls: rammed earth and timber; open sides. Roof: small plank lean-to / awning over the dressing bench; mostly open rock-cut yard. Fixed furniture and props: cut stone blocks, wedge-and-hammer rows, a lifting tripod (木起重架) and rope, a dressing bench, a sledge, rubble heaps. Worker stations (one standing worker each, leave floor free in front of the item): hammering block / anvil / pounding bench at middle-left; pressing / pushing / grinding station at middle-right. Ground plan about 150 x 150 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '石場' will be added later in post) and a hanging cloth banner (none) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 165 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Quarry, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, cut stone blocks, wedge-and-hammer rows, a lifting tripod (木起重架) and rope, a dressing bench, a sledge, rubble heaps, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Quarry. Roof: small plank lean-to / awning over the dressing bench; mostly open rock-cut yard. Ground plan about 150 x 150 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 165 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Quarry, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_mine — 冶坑 (铁矿) / Ore pits (iron)  (Economy sites, class W, variants: mine)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Ore pits (iron). Walls: rammed earth and timber; open sides. Roof: timber headframe with a small thatch/tile cover over the pit mouth, ore-washing trough. Fixed furniture and props: pit mouth with timber props, hand windlass (轆轤), baskets of ore, ore-washing trough, small roasting heap, pick rack, a cart on planks. Worker stations (one standing worker each, leave floor free in front of the item): pressing / pushing / grinding station at middle-left; lifting-and-carrying bench or frame at middle-right. Ground plan about 150 x 150 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '坑冶' will be added later in post) and a hanging cloth banner (none) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 165 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Ore pits (iron), roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, pit mouth with timber props, hand windlass (轆轤), baskets of ore, ore-washing trough, small roasting heap, pick rack, a cart on planks, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Ore pits (iron). Roof: timber headframe with a small thatch/tile cover over the pit mouth, ore-washing trough. Ground plan about 150 x 150 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 165 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Ore pits (iron), roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_saltworks — 盐池 / Salt works  (Economy sites, class W, variants: saltworks)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Salt works. Walls: rammed earth and timber; open sides. Roof: light open timber and thatch awning over the boiling pans; shallow evaporation pans in the yard. Fixed furniture and props: shallow square brine pans edged in earth, a boiling pan on a clay stove, rakes, white salt heaps, wicker baskets, a yoke-and-bucket (扁擔) rack, a brine well. Worker stations (one standing worker each, leave floor free in front of the item): pressing / pushing / grinding station at middle-left; stacking bay at middle-right. Ground plan about 150 x 150 world units (an adult is 31 wu tall: about 4.8 adults wide). Signboard: a flat blank dark-lacquer plaque (text '鹽池' will be added later in post) and a hanging cloth banner (none) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 165 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Salt works, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, shallow square brine pans edged in earth, a boiling pan on a clay stove, rakes, white salt heaps, wicker baskets, a yoke-and-bucket (扁擔) rack, a brine well, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Salt works. Roof: light open timber and thatch awning over the boiling pans; shallow evaporation pans in the yard. Ground plan about 150 x 150 wu (about 4.8 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 200 x 165 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Salt works, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_brewery — 酒坊 / Brewery  (Commerce businesses, class W, variants: brewery)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Brewery. Walls: timber and plaster, open work bay. Roof: two-storey grey-tile house front with a storage loft, open ground-floor work bay. Fixed furniture and props: steaming grain cauldron (蒸鍋), cooling mats, fermenting jars (大缸) in rows, a distilling still (蒸酒器) at Lv2+, wine barrels, ladles, a wine banner pole. Worker stations (one standing worker each, leave floor free in front of the item): stirring vat / pot / trough at middle-left; pouring / quenching / ladling trough at middle-right. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '酒坊' will be added later in post) and a hanging cloth banner (wine banner "酒" (酒旗) on a pole) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Brewery, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, steaming grain cauldron (蒸鍋), cooling mats, fermenting jars (大缸) in rows, a distilling still (蒸酒器) at Lv2+, wine barrels, ladles, a wine banner pole, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Brewery. Roof: two-storey grey-tile house front with a storage loft, open ground-floor work bay. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Brewery, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_beauty — 香皂香膏作 / Beauty (soap and balm) workshop  (Commerce businesses, class W, variants: beauty)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Beauty (soap and balm) workshop. Walls: timber and plaster, open work bay. Roof: small courtyard house with a lean-to work bay, grey tile. Fixed furniture and props: pressing stone (壓榨), herb drying racks, small porcelain pots (celadon), mortar, oil jars, soap blocks on a cooling table, a charcoal brazier. Worker stations (one standing worker each, leave floor free in front of the item): pressing / pushing / grinding station at middle-left; stirring vat / pot / trough at middle-right. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '香藥鋪' will be added later in post) and a hanging cloth banner (perfume/herb sachet banner) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Beauty (soap and balm) workshop, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, pressing stone (壓榨), herb drying racks, small porcelain pots (celadon), mortar, oil jars, soap blocks on a cooling table, a charcoal brazier, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Beauty (soap and balm) workshop. Roof: small courtyard house with a lean-to work bay, grey tile. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Beauty (soap and balm) workshop, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_restaurant — 清河酒楼 / Restaurant (Qinghe tavern)  (Commerce businesses, class W, variants: restaurant)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Restaurant (Qinghe tavern). Walls: timber and plaster, open work bay. Roof: two-storey tavern in the Qingming-scroll style: tile roof, projecting upper balcony, decorated bunting arch (彩樓歡門) over the entrance. Fixed furniture and props: low tables with stools and chairs (Song-era high furniture), wine jars, kitchen range at the rear left, a counter with an abacus-free ledger (算籌 optional), lanterns, a hanging wine banner. Worker stations (one standing worker each, leave floor free in front of the item): pouring / quenching / ladling trough at middle-left; counting table or counter at middle-right. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '清河酒樓' will be added later in post) and a hanging cloth banner (bunting arch 歡門 + banner "酒") in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Restaurant (Qinghe tavern), roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, low tables with stools and chairs (Song-era high furniture), wine jars, kitchen range at the rear left, a counter with an abacus-free ledger (算籌 optional), lanterns, a hanging wine banner, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Restaurant (Qinghe tavern). Roof: two-storey tavern in the Qingming-scroll style: tile roof, projecting upper balcony, decorated bunting arch (彩樓歡門) over the entrance. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Restaurant (Qinghe tavern), roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_kiln — 炭窑 / Charcoal kiln  (Commerce businesses, class W, variants: kiln)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Charcoal kiln. Walls: timber and plaster, open work bay. Roof: earth-domed kiln with a small thatch rain shed beside it; most of the site open. Fixed furniture and props: beehive earth kiln with a smoking vent, stacked timber billets, finished charcoal in sacks and baskets, a poker rack, a water jar. Smoke is drawn by the game: leave the vent clear. Worker stations (one standing worker each, leave floor free in front of the item): tended fire, furnace or kiln mouth at middle-centre; stacking bay at front-right. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '炭窯' will be added later in post) and a hanging cloth banner (none) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Charcoal kiln, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, beehive earth kiln with a smoking vent, stacked timber billets, finished charcoal in sacks and baskets, a poker rack, a water jar. Smoke is drawn by the game: leave the vent clear, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Charcoal kiln. Roof: earth-domed kiln with a small thatch rain shed beside it; most of the site open. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Charcoal kiln, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_powderworks — 军器火药作 / Powder works  (Commerce businesses, class W, variants: powderworks)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Powder works. Walls: timber and plaster, open work bay. Roof: low grey-tile roof over the rear bay; thick earth walls. Fixed furniture and props: stone mill (石磨) for grinding, wooden mixing troughs, drying trays, jars of nitre and sulphur (just jars), a water barrel, sand buckets, a separated charcoal bin. Worker stations (one standing worker each, leave floor free in front of the item): stirring vat / pot / trough at middle-left; tended fire, furnace or kiln mouth at middle-right. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '火藥作' will be added later in post) and a hanging cloth banner (none (plain)) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Powder works, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, stone mill (石磨) for grinding, wooden mixing troughs, drying trays, jars of nitre and sulphur (just jars), a water barrel, sand buckets, a separated charcoal bin, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Powder works. Roof: low grey-tile roof over the rear bay; thick earth walls. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Powder works, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_arsenal — 军器监分作 / Ordnance foundry  (Commerce businesses, class W, variants: arsenal)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Ordnance foundry. Walls: timber and plaster, open work bay. Roof: large grey-tile hall with a clay chimney, hip-and-gable end. Fixed furniture and props: casting pit and crucible furnace, ladles, clay moulds, iron grenade shells (震天雷 style cast spheres) cooling on a rack, anvils, a hoist beam, charcoal bin. Worker stations (one standing worker each, leave floor free in front of the item): hammering block / anvil / pounding bench at middle-left; pouring / quenching / ladling trough at middle-right; lifting-and-carrying bench or frame at middle-centre. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '軍器監' will be added later in post) and a hanging cloth banner (red pennant) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Ordnance foundry, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, casting pit and crucible furnace, ladles, clay moulds, iron grenade shells (震天雷 style cast spheres) cooling on a rack, anvils, a hoist beam, charcoal bin, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Ordnance foundry. Roof: large grey-tile hall with a clay chimney, hip-and-gable end. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Ordnance foundry, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_garden — 菜麻圃 / Market garden  (Commerce businesses, class W, variants: garden)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Market garden. Walls: timber and plaster, open work bay. Roof: no roof or a tiny well-head roof; a small tool shed. Fixed furniture and props: raised beds of cabbage, beans and hemp, a well with a sweep (桔槔), watering buckets, bamboo trellis, compost, a tool shed with thatch. Worker stations (one standing worker each, leave floor free in front of the item): lifting-and-carrying bench or frame at middle-left; lifting-and-carrying bench or frame at middle-right. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '菜圃' will be added later in post) and a hanging cloth banner (none) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Market garden, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, raised beds of cabbage, beans and hemp, a well with a sweep (桔槔), watering buckets, bamboo trellis, compost, a tool shed with thatch, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Market garden. Roof: no roof or a tiny well-head roof; a small tool shed. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Market garden, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_orchard — 果园 / Orchard  (Commerce businesses, class W, variants: orchard)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Orchard. Walls: timber and plaster, open work bay. Roof: no roof; a small picking shed. Fixed furniture and props: jujube / apricot / pear trees in rows (Gansu: apricot, pear, jujube), ladders, fruit baskets, a sorting table, crates, a straw shed. Worker stations (one standing worker each, leave floor free in front of the item): stacking bay at middle-left; lifting-and-carrying bench or frame at middle-right. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '果園' will be added later in post) and a hanging cloth banner (none) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Orchard, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, jujube / apricot / pear trees in rows (Gansu: apricot, pear, jujube), ladders, fruit baskets, a sorting table, crates, a straw shed, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Orchard. Roof: no roof; a small picking shed. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Orchard, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_weaver — 织造作 / Weaving house  (Commerce businesses, class W, variants: weaver)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Weaving house. Walls: timber and plaster, open work bay. Roof: tiled shed roof, timber frame, open front. Fixed furniture and props: two upright looms (織機) with warp threads, a spinning wheel (紡車), reeling frame (絡車), baskets of hemp, bolts of unpatterned cloth, a dyeing tub optional. Worker stations (one standing worker each, leave floor free in front of the item): weaving / stitching / binding bench or loom at middle-left; weaving / stitching / binding bench or loom at middle-right. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '織造作' will be added later in post) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Weaving house, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, two upright looms (織機) with warp threads, a spinning wheel (紡車), reeling frame (絡車), baskets of hemp, bolts of unpatterned cloth, a dyeing tub optional, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Weaving house. Roof: tiled shed roof, timber frame, open front. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Weaving house, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_papermill — 纸坊 / Paper mill  (Commerce businesses, class W, variants: papermill)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Paper mill. Walls: timber and plaster, open work bay. Roof: tiled shed roof over the pulping bay; drying yard open. Fixed furniture and props: soaking pit and pulping trough, a stone trip-hammer or stone roller, a papermaking vat with bamboo screen (抄紙簾), drying wall with sheets (焙牆), stacks of paper, rags and bamboo piles. Worker stations (one standing worker each, leave floor free in front of the item): lifting-and-carrying bench or frame at middle-left; pressing / pushing / grinding station at middle-right. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '紙坊' will be added later in post) and a hanging cloth banner (paper sheet banner (blank)) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Paper mill, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, soaking pit and pulping trough, a stone trip-hammer or stone roller, a papermaking vat with bamboo screen (抄紙簾), drying wall with sheets (焙牆), stacks of paper, rags and bamboo piles, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Paper mill. Roof: tiled shed roof over the pulping bay; drying yard open. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Paper mill, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_pottery — 陶瓷窑 / Pottery kiln  (Commerce businesses, class W, variants: pottery)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Pottery kiln. Walls: timber and plaster, open work bay. Roof: earth dragon kiln (龍窯) humped along the rear with small chimneys; thatch rain shed over the wheels. Fixed furniture and props: potter wheel (轆轤), clay pile, drying shelves with greyware and celadon-green bowls, a kiln mouth, saggar stacks, glaze jars. Worker stations (one standing worker each, leave floor free in front of the item): tended fire, furnace or kiln mouth at middle-centre; pressing / pushing / grinding station at middle-left. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '陶窯' will be added later in post) and a hanging cloth banner (none) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Pottery kiln, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, potter wheel (轆轤), clay pile, drying shelves with greyware and celadon-green bowls, a kiln mouth, saggar stacks, glaze jars, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Pottery kiln. Roof: earth dragon kiln (龍窯) humped along the rear with small chimneys; thatch rain shed over the wheels. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Pottery kiln, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_refinery — 冶铁作 / Steel works  (Commerce businesses, class W, variants: refinery)

**interior**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Steel works. Walls: timber and plaster, open work bay. Roof: tall clay furnace stack with a tile hood, grey tile roof on the rear bay. Fixed furniture and props: blast/crucible furnace with a clay tuyere, double-acting box bellows (木扇), tilt hammer, ingot rack, coal heap, quench tank, ore baskets. Worker stations (one standing worker each, leave floor free in front of the item): hammering block / anvil / pounding bench at middle-left; tended fire, furnace or kiln mouth at rear-right. Ground plan about 145 x 145 world units (an adult is 31 wu tall: about 4.7 adults wide). Signboard: a flat blank dark-lacquer plaque (text '冶鐵作' will be added later in post) in the front.
LAYER = BASE/INTERIOR CUTAWAY, NO roof. Rear and left walls full height with timber frame; front and right walls cut down to a knee-high curb with a clean section showing wall thickness, so the whole textured floor is visible. Floor plan SQUARISH (on screen about 1.6x wider than deep, never a long rectangle). Door gap bottom-centre with a clear aisle. Fixed workstations at the listed positions with free floor around each (animated workers stand there). Bare floor patch for an INPUT PILE at the LEFT front and an empty OUTPUT RACK at the RIGHT front; no big stock of goods (the game adds live quantities). No people.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Steel works, roofless cutaway interior with low front wall, textured floor, workstations, input pile left, output rack right, blast/crucible furnace with a clay tuyere, double-acting box bellows (木扇), tilt hammer, ingot rack, coal heap, quench tank, ore baskets, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

**roof**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Steel works. Roof: tall clay furnace stack with a tile hood, grey tile roof on the rear bay. Ground plan about 145 x 145 wu (about 4.7 adults wide).
LAYER = ROOF ONLY. Draw only the roof (tiles, ridge, eaves, gable ends, brackets) exactly where it sits on the building, sized to cover the whole square floor plan plus about 12 wu overhang, soft gently upswept eave tips (Song, not Qing). Everything else fully transparent: no walls, floor, props or ground shadow. Crisp clean edges so it can fade over the interior. Same canvas, camera and framing as the interior layer.
CANVAS: 1024x1024 (1:1); max bounding box 185 x 175 wu (ratio 1.06), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Steel works, roof only, everything else transparent/magenta, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_hall — 官署(衙门) / Yamen hall (Qinghe only; also map plates)  (Qinghe-only civic, class S, variants: hall)

**solid**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Yamen hall (Qinghe only; also map plates). Walls: rammed-earth platform, timber frame, white plaster panels, plank doors with studs. Roof: modest official hall: grey tile 歇山 (hip-and-gable) with chiwen ridge ends, three bays, visible simple brackets, vermilion posts, raised stone platform with a ramp and steps. Fixed furniture and props: stone lions optional (small), a pair of drum and bell stands, lanterns, a plain stone-paved forecourt; keep the facade clear for banners. Worker stations (one standing worker each, leave floor free in front of the item): no fixed worker stations. Ground plan about 190 x 120 world units (an adult is 31 wu tall: about 6.1 adults wide). No signboard text. Note: vermilion posts only on official buildings; frontier scale, not a palace.
LAYER = ONE COMPLETE SPRITE, roof in place, closed and finished, no cutaway. Door at bottom-centre of the front. No people.
CANVAS: 1024x1024 (1:1); max bounding box 230 x 190 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Yamen hall (Qinghe only; also map plates), complete closed building, stone lions optional (small), a pair of drum and bell stands, lanterns, a plain stone-paved forecourt; keep the facade clear for banners, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_memorial — 纪念碑墙 / Memorial wall (Qinghe only)  (Qinghe-only civic, class S, variants: memorial)

**solid**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Memorial wall (Qinghe only). Walls: dressed grey stone and brick. Roof: a long low stone screen wall (影壁 style) with a small grey-tile capping roof along the top; no hall behind it. Fixed furniture and props: BLANK flat pale stone or plaster face, about 130 x 40 wu, centred and starting 48 wu above the base (the game writes names in 3 columns), stone plinth, two small incense burners, a few steles beside it, cypress or pine sapling, offerings (empty). Worker stations (one standing worker each, leave floor free in front of the item): no fixed worker stations. Ground plan about 140 x 50 world units (an adult is 31 wu tall: about 4.5 adults wide). No signboard text. Note: solemn, sober, no gold; names are never painted by the artist.
LAYER = ONE COMPLETE SPRITE, roof in place, closed and finished, no cutaway. Door at bottom-centre of the front. No people.
CANVAS: 1536x1024 (3:2); max bounding box 170 x 95 wu (ratio 1.79), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Memorial wall (Qinghe only), complete closed building, BLANK flat pale stone or plaster face, about 130 x 40 wu, centred and starting 48 wu above the base (the game writes names in 3 columns), stone plinth, two small incense burners, a few steles beside it, cypress or pine sapling, offerings (empty), grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 3:2 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

### bld_granary_map — 粮仓(地图图标) / Granary (campaign-map plates only)  (Map-only (optional), class S, variants: granary_map)

**solid**  (paste = HEADER + block + FOOTER)
```text
SUBJECT: Granary (campaign-map plates only). Walls: -. Roof: long raised granary, grey tile. Fixed furniture and props: see storehouse. Worker stations (one standing worker each, leave floor free in front of the item): no fixed worker stations. Ground plan about 0 x 0 world units (an adult is 31 wu tall: about 0.0 adults wide). No signboard text. Note: re-render only for consistency (P3).
LAYER = ONE COMPLETE SPRITE, roof in place, closed and finished, no cutaway. Door at bottom-centre of the front. No people. Keep the same silhouette language as the matching village building; it is shown very small on the campaign map.
CANVAS: 1024x1024 (1:1); max bounding box 75 x 62 wu (ratio 1.21), filling about 90% of the canvas.
```
**MJ:** `Northern Song dynasty 1120 AD frontier Granary (campaign-map plates only), complete closed building, see storehouse, grey ceramic tile roofs with gently swept eaves, rammed-earth and timber, hand-painted game sprite, orthographic 38 degree view, light from upper left, flat magenta background --ar 1:1 --style raw --stylize 150 --sref <STYLE_ANCHOR_URL> --no Ming Qing yellow glazed roof pagoda text letters people shadow plate`

## 4. Edit workflow for layers, variants, damage and construction

Run these on an **approved hero image** (the complete building with its roof, generated from the `solid` style of prompt, or the `interior` image plus its roof composited).

**4a. Remove roof -> interior layer**
```text
Edit the attached approved building sprite. Keep every pixel of the camera, scale, framing, canvas size, palette and line style IDENTICAL. Remove the roof completely and show the interior as a cutaway: rear and left walls full height, front and right walls cut down to a low curb with a clean section, textured floor, fixed workstations, bare patch for an input pile at the left front and an empty output rack at the right front. Do not move or resize anything that remains. Transparent background.
```

**4b. Roof only -> roof layer**
```text
Edit the attached approved building sprite. Keep canvas size, camera and the exact position of the roof IDENTICAL. Delete everything that is not roof (walls, floor, props, shadows) so only the roof remains on a transparent background. The roof's underside/eave edge must be clean and crisp.
```

**4c. Split foreground props from base**
```text
Edit the attached interior cutaway sprite. Keep canvas size, camera and positions IDENTICAL. Keep ONLY the foreground items that should draw IN FRONT of a worker standing at the stations: the low front curb, near-side vats/benches/troughs, hanging items under the front eave, front rails. Delete everything else to transparent. (The remaining items form the PROPS layer; the original image minus these items form the BASE layer: save the base as a second output with those foreground items erased and the floor behind them inpainted.)
```

**4d. Damaged variant (base and roof)**
```text
Edit the attached sprite. Same camera, framing, canvas and scale. Show it RAID-DAMAGED: scorched timber, a collapsed section of roof or wall, broken tiles, charring and soot, scattered debris; still clearly the same building, same footprint. Do not add smoke or fire (the game adds effects).
```

**4e. Construction stage 1**
```text
Edit the attached sprite into UNDER-CONSTRUCTION stage 1: bare rammed-earth footing and a floor of stone sleepers with the first timber posts raised and bamboo scaffolding; no walls or roof. Same camera, canvas and footprint.
```

**4f. Construction stage 2**
```text
Edit the attached sprite into UNDER-CONSTRUCTION stage 2: complete timber frame with beams and half the rafters, walls half built, roof tiles on only the rear half, bamboo scaffolding at the front. Same camera, canvas and footprint.
```

**4h. Night layer (lit windows)**
```text
Edit the attached sprite. Keep canvas, camera and every pixel position IDENTICAL. Output ONLY a transparent-background NIGHT-LIGHT layer: warm orange glow of lit paper windows, a lantern by the door and a soft warm spill on the floor/ground just in front of the door, painted as light only (it will be added on top of the building at night). Everything else fully transparent. No people, no flames drawn as objects.
```

**4i. Winter roof (snow)**
```text
Edit the attached ROOF-ONLY sprite. Same canvas, camera and roof shape. Output the same roof covered with a thin layer of fresh snow (white-blue shadows, tile rows still showing at the eaves, icicle hints), transparent background. Same light from the upper left.
```

**4g. Level add-on layers (props_l2, props_l3)**
```text
Edit the attached interior cutaway sprite. Keep canvas, camera and every existing pixel IDENTICAL. Output ONLY the NEW items for level N on a transparent background: [level text from the building row in buildings.csv, column level_visual_plan], e.g. a second anvil and a covered stock shed. Items must stand on bare floor or yard, not overlap the workstation positions.
```

## 5. If the tool cannot output transparency

Generate on flat magenta `#FF00FF`, then run `python tools/key_chroma.py in.png out.png` (removes the key colour and de-spills the edge). Check edges on a green and a dark background (`ACCEPTANCE.md`).
