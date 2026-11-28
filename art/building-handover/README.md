# HANDOVER: re-render every village building of "Armed into the Song Dynasty / 持械入宋"

You (an artist, or an image-generating GPT plus a human operator) have **no access to the game, its code or its history**. This package is everything you need. Start here, then follow the quick start.

## 1. The game in one paragraph
*Armed into the Song Dynasty* (持械入宋) is a browser strategy/village game set in **Northern Song China, about 1120 CE, on the north-west frontier (Qinghe, facing the Western Xia)**. The player grows a small walled village into a fortified town: farmers harvest, workshops (smithy, bowyer, armourer, tannery, saddlery, fire-lance works ...) turn raw materials into weapons, a hospital heals wounded soldiers, soldiers train and march out. The village is a 2D top-down-ish scene (orthographic camera at 38 degrees, north up). **Villagers, animals and carts are animated live and carry goods between buildings**; the buildings are static pictures. Live site: https://vandaliquidity.github.io/armed-into-the-song-dynasty/ (open it and look at the village view; `current/screenshots/` shows it at desktop zoom).

## 2. What is wrong now
1. **Flat stamps.** Each building is one top-down-ish picture: no interior, no sign of what happens inside, while the people walking around it are alive. The player cannot see the smith at the anvil or the beds in the hospital.
2. **Three art families in one village** (painted sheets for homes and workshops, a Blender-rendered kit for stores/fields/hospital/tower, procedural canvas drawing for the rest): the stores and the hospital clash with the painted houses. No unified style.
3. **Reused art.** 13 or more buildings are drawn with *another building's* picture (the armoury is the storehouse at scale 1.15; the stable is the saddler; beauty, paper mill, pottery, garden and orchard all use the courtyard house; ...). Column `art_shared_with_other_buildings_now` in `buildings.csv`.
4. **Not clearly Song.** The painted sheets are decent and roughly Song, but the kit pieces read generic, and nothing has the deep eaves, plain grey tile, brackets and rammed-earth look of c.1120 frontier architecture.
5. (Honest note) The existing Song sheets in `current/` are not ugly. The goal is not "fix the paint", it is "turn static stamps into readable, unified, Song-authentic **cutaway workplaces**".

## 3. The target
* **Authentic Northern Song** (see `ART_DIRECTION.md`): grey tile and thatch, deep gentle eaves, raised platforms, rammed earth and plaster, plain timber, 懸山/歇山 roofs. **Not Ming/Qing** (no yellow glazed roofs, no horse-head walls, no flying corners), not Japanese, not Mediterranean.
* **Cutaway interiors.** Each workshop-like building is a **roof-removed cutaway**: rear and left walls full height, front and right walls cut low, so the room, its machinery, its work spot and its goods rack are visible. The player sees the interior at normal zoom.
* **Separate roof layer** (same canvas) that **fades in when the player zooms out** and fades away when zoomed in.
* **Squarish rooms** (plan about 1 : 1 to 1 : 1.3), not long thin sheds.
* **One unified style** for all buildings: same camera, same light (upper left), same palette, same line weight.
* Props tell the job at a glance (what is made here?), with clear floor spots for the animated workers and for the goods piles.

## 4. Package map
| Path | What it is |
|---|---|
| `README.md` | this file |
| **`buildings.md`** / **`buildings.csv`** | **every building sprite** (36 core types incl. 2 Qinghe-only civic buildings, 1 optional wall kit, 1 map-only cell; 49 variant keys): current art and files, pixel sizes, box, anchor, door, interior function, worker stations, input/output spots, upgrade levels, layers to deliver, tier sizes, signboard text |
| `ART_DIRECTION.md` | Northern Song primer (do / don't, palette), signboard rules, reference list, per-building art direction |
| `PROMPTS.md` and `prompts/*.txt`, `prompts/prompts.json` | **ready-to-paste prompts**: style anchors (generate first), per-building interior and roof prompts, edit prompts to derive layers, negative prompts. `prompts/*.txt` are the fully expanded single-paste versions |
| `specs/TECH_SPEC.md` | exact technical spec: units, camera, light, scale vs people, layers, formats, tiers, naming, manifest |
| `specs/DROP_IN_GUIDE.md` | how finished files go into the game (zero-code sheet swap, metadata swap, code path) |
| `specs/GAME_HOOKS.md` | how the game places, anchors and animates buildings (from the code worker): footprints, walk-grid, door, label zone, states, existing sheet cells |
| `specs/buildings_spec.json` | machine-readable spec used by the tools |
| `specs/people_scale_lineup.png` | **the scale bar**: villagers, rider, cottage, courtyard house, bowyer and smithy at true relative size |
| `specs/layout_template_workshop.png` | diagram of one workshop cutaway: box, anchor, floor, stations, piles, roof zone, light arrow |
| `specs/layers_and_roof_fade.png` | layer order and roof fade diagram |
| `ACCEPTANCE.md` | the checklist every building must pass |
| `refs/` | the **quality bar** (3 images, see below) |
| `current/` | `sprites/` current sprites cut out of the game; `sheets/` the raw source sheets; `screenshots/` desktop views; `contact_sheet_current_sprites.png` |
| `tools/` | `pack_building.py` (masters -> WebP tiers + manifest + preview + drop-in sheets), `check_deliverable.py` (auto QA), `key_chroma.py` (remove a magenta background), `add_signboard_text.py` (real Chinese text on blank boards), `split_roof.py` (derive the roof layer) |
| `deliverables_template/` | the folder layout to deliver in |

## 5. The two kinds of reference (do not confuse them)
* **`refs/` (3 images) = the quality bar for the cutaway *format***: roofs off, squarish rooms, readable interiors with props and piles, crisp and consistent. They are phone screenshots of an advertisement for **another mobile game** (the originals have its status bar and an ad banner; `refs/cropped_no_ui/` has them trimmed). Use them only to judge readability and polish; **do not copy their art or characters**. **They are not Song**: terracotta pantiles, tatami-like mats, Middle-Eastern tile, and their camera is steeper (nearly top-down) than ours (38 degrees). Copy the *readability*, not the materials or the angle.
* **Style target = Northern Song**, from the sources named in `ART_DIRECTION.md` (清明上河圖, 營造法式, surviving 11th-12th century buildings).
* `current/` shows what the game has **now**. Use it for sizes, positions, and to keep the stuff that works (palette, Song feel). Do not copy its flatness.

## 6. Quick start
1. Read `ART_DIRECTION.md` sections 1-3 and `specs/TECH_SPEC.md`.
2. In `PROMPTS.md` section 1, generate the **3 style anchors** (cutaway, house, scale) and have them approved. Attach them to every later prompt.
3. For each building, in priority order (section 7): generate the interior hero, then derive the roofless/roof layers with the edit prompts in `PROMPTS.md` section 4, then props, level add-ons. Remove background with `tools/key_chroma.py` if needed, add signboard text with `tools/add_signboard_text.py`.
4. Save masters as `deliverables/<variant>__<layer>.png` at the exact canvas size (see `deliverables_template/README.md`).
5. `python tools/check_deliverable.py --masters deliverables --partial` -> fix everything it reports.
6. `python tools/pack_building.py --masters deliverables --out build` (add `--sheets` for the zero-code sheets).
7. Walk through `ACCEPTANCE.md`, put the previews next to `specs/people_scale_lineup.png`.
Tools need Python 3, `pip install pillow numpy`; for Chinese text, an installed CJK font (Noto Serif CJK TC Bold).

## 7. Priorities
P1 (biggest visible gain): smithy, bowyer, armourer, tannery, saddlery, firelance, storehouse, armoury, treasury, hospital, barracks, stable, homes. P2: hall, memorial, commerce and economy buildings (brewery, restaurant, market, lumber, quarry, mine, saltworks, kiln, powderworks, arsenal, weaver, papermill, pottery, beauty, garden, orchard, refinery), gates, watchtower, fields. P3: wall kit and the map-only granary cell.
**Out of scope:** the Xia and Jin villages (other factions) and all unit/character sprites.

## 8. Things we are not sure about (please flag if you disagree)
* The worker-station and pile coordinates in `buildings.csv` are **proposals**: the code today has only a door and a single front-centre spot. They will be implemented by the code worker; tell us if a better layout needs different numbers.
* The roof-fade zoom values (0.40 / 0.70) are a first guess.
* The preferred hospital is squarish 240 x 230 wu (4 x 2 beds) but today's code expects a portrait room with fixed bed positions; both are specified.
* The current numbers come from the game's `origin/main` at commit `0e9fae0`; if the repository has since changed sizes, `specs/buildings_spec.json` is the authority for this delivery and the code worker will adapt.
