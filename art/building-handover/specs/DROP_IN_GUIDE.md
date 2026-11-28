# DROP_IN_GUIDE.md - how finished art gets into the game

The reader of this file is the artist/GPT *and* whoever integrates. The artist only has to deliver masters (see `deliverables_template/`); `tools/pack_building.py` makes every file the game needs. How much of the new art shows up **without code changes** depends on the path:

| Path | What it needs | Which buildings | What the player gets |
|---|---|---|---|
| **Z - zero code** | replace 3 PNG sheets | 17 cells: cottage, courtyard (also used by 5 commerce buildings today), smithy, barracks, treasury, restaurant (winehouse), granary (map only), yamen (= the Qinghe hall and map plates), bowyer, tannery, armourer, saddlery (also the stable today), firelance (powder), weaver, 3 gates | better pictures, still one static stamp each: no layers, no roof fade |
| **M - metadata only** | replace atlas pieces and edit rect numbers (no logic) | storehouse + armoury (`vunified.webp`, entries `store8_0` back + `store8_1` front), 4 field seasons, watchtower (`tower.webp`), hospital (`ward.webp`) | better pictures for those, still static; hospital beds stay at today's positions |
| **C - code** | the code worker's loader (see section C) | all 36 types | the real target: cutaway + roof fade + stations + unique art for the 13 buildings that borrow another building's art |

## Z. Zero-code sheet swap
Files: `assets/song/architecture-v2.png` (4 columns x 2 rows), `assets/song/workshops-v1.png` (3 x 2), `assets/song/gates-v1.png` (3 x 1). The game slices each sheet **by an equal grid**, trims transparent margins and fits the result into the building's box, bottom-centre. Cell order (row by row, left to right):
* architecture: cottage, courtyard, winehouse, granary, smithy, barracks, yamen, treasury
* workshops: bowyer, tannery, armourer, saddler, powder, weaver
* gates: gate_hamlet, gate_village, gate_town
Rules: keep the same grid and order, one building per cell, transparent background, building bottom-centre inside its cell (pad it about 4% from the cell edges), and **fill every cell** before swapping a sheet (a missing cell leaves a hole). The images are cached by name with `?v=0.61`: if the file name stays the same, bump that number in `song-art.js`, or save under a new file name and change the name there (one line each).
Make them with `python tools/pack_building.py --masters deliverables --out build --sheets` (add `--sheet-mode roofed` to bake the roof in so the static picture shows a roofed building; default is cutaway = base+props only). Output: `build/assets/song/*.png`.
Honest limit: this path can **not** deliver the interiors-with-workers look; for a static stamp, `roofed` mode is usually the right choice.

## M. Metadata-only swaps
* **`assets/{hi,md,lo}/vunified.webp`**: one atlas for storehouse back/front, vcomp/vbld legacy, fields and gates (kit). Rects are in `VU_META` in `village-unified.js` (`rects.hi|md|lo[name] = [x, y, w, h]`, and `items[name]` with anchor/size). Re-pack the atlas, update the rects. Today's rect values per entry are in `buildings.csv` (column `current_files_all_tiers`). Kit tier scales are 1.5 / 1.0 / 0.5 px per wu (not the new 3 / 1.5 / 0.75).
* **`assets/{hi,md,lo}/ward.webp`**: replace with same-aspect art (hi 330 x 465, md 220 x 310, lo 110 x 155). The hospital bed positions (8 beds), apprentice and clerk spots are image-local numbers in `village-life.js` (`VL_META`): **if you keep today's portrait room, put beds exactly where the code expects them** (positions in `buildings.csv` row `hospital`, column `current_draw_call_and_anchor`). Squarish 240 x 230 needs path C.
* **`assets/{hi,md,lo}/tower.webp`**: hi 304 x 464, md 152 x 232, lo 76 x 116, drawn at 0.9 scale.

## C. What the code worker must add (not the artist)
Listed here so the artist knows the intent and the integrator has a checklist.
1. Load `assets/<tier>/bld_<key>__<layer>.webp` with fallback to today's art if a file is missing; read `assets/bld_manifest.json` for anchors, stations, piles, roof fade.
2. Draw order: ground, `base`, workers/goods, `props` (+ `props_l2/l3` at level >= 2/3), then `roof` with alpha `f(sc)` (section 4 of `TECH_SPEC.md`).
3. Use the unique art for every building: storehouse vs armoury (same art today), stable (saddler art today), beauty/papermill/pottery/garden/orchard (courtyard art today), firelance/powderworks/arsenal/refinery and others sharing sprites. See `buildings.csv` column `art_shared_with_other_buildings_now`.
4. Move workers to the manifest stations (today: one front-centre spot).
5. Hospital: 4 x 2 bed layout + `props_l2` extra mats; remove the 220 x 310 portrait constraint.
6. Damaged and construction layers (optional).
7. Tier loading by device (hi/md/lo) like the existing kit.
The code worker's notes on how the game places and uses buildings are in `specs/GAME_HOOKS.md`. The manifest loader above is a request to the code worker and may not exist yet: until it does, deliver masters and use path Z/M to preview.

## Preview without the game
`tools/pack_building.py` also writes `preview/<variant>__roofless.png` and `__roofed.png`: composites on transparency. Put them on the green `#8FA56A` (game grass) and on dark `#222` to check edges, and next to `specs/people_scale_lineup.png` for scale.
