# ACCEPTANCE.md - a building is accepted only if every box is ticked

Run first: `python tools/check_deliverable.py --masters deliverables --packed build` (add `--partial` while delivering in batches). It checks the machine-checkable items marked **[auto]**. The rest are human checks - the reviewer ticks them with the preview PNGs placed beside `specs/people_scale_lineup.png`.

## A. Files
- [ ] **[auto]** Every required layer present for the variant (`specs/buildings_spec.json` -> `layers_required`), named `<variant>__<layer>.png`, RGBA PNG.
- [ ] **[auto]** Every layer of a variant has exactly the canvas size `box_wu x 6` px and identical registration (flip between layers: nothing moves).
- [ ] **[auto]** `pack_building.py` produced `hi`, `md`, `lo` WebP for every layer (3 tiers x all layers) and `bld_manifest.json`.
- [ ] hi layer files <= 250 KB each (WebP, quality 90).
- [ ] Optional layers that were promised exist (`*_damaged`, `construct_*`, `night`, `roof_snow`); `night` and `roof_snow` are transparent except for the glow / snow.
- [ ] Floor and walls inside x +/- 0.43 of the box width (not applicable to fields, wall kit, barracks yard); nothing below the anchor line; ground in front of the door left empty (name plaque and people go there).

## B. Scale, footprint, geometry
- [ ] Next to the lineup the adult villager (31.1 wu) is believable against doors, benches and beds: door about 38 wu tall, bed about 36 x 16 wu.
- [ ] **[auto]** Art fits inside the box; nothing is cropped at the canvas edge.
- [ ] **[auto]** The base is centred on the anchor (bottom-centre) within 8%; the front edge touches the bottom within 6-10 wu.
- [ ] Class W: the floor plan is **squarish** (1 : 1 to 1 : 1.3), not a long thin shed.
- [ ] Every worker station (`stations` in `buildings.csv`) has a clear floor spot of about 30 x 24 wu, input pile and output rack spots are empty and visible; nothing in `props` covers them.
- [ ] Door at (0,-8) is visible and clear; the approach in front of it is free.
- [ ] Treasury: six empty trays at the stated positions. Gate: blank plaque, flat, at the stated height, archway >= 36 wu clear. Hospital: 8 beds at the positions of the chosen layout. Fields: four seasons share one outline.

## C. Layers and cutaway
- [ ] `base + props` (no roof) is a complete, attractive building: rear and left walls full height, front and right walls cut low, interior function readable at a glance (what is made here?).
- [ ] `roof` alone over the base looks like a finished Song roof (nothing floating, no leftover walls in the roof layer).
- [ ] `roof` contains nothing but the roof, and `base` contains no roof parts; no workers, animals or goods are baked in.
- [ ] Level 2/3 add-ons visibly add equipment (not just recoloured).

## D. Light and edges
- [ ] Light from the **upper left**, shadows to the lower right on every layer (check the roof ridge shading and the interior).
- [ ] Only a short soft contact shadow baked into `base`; no long cast shadow on the ground.
- [ ] **[auto warn]** Clean transparent edges: no white/magenta halo; checked on green `#8FA56A` and on dark `#222` backgrounds.
- [ ] No background remnants, no checkerboard pattern baked in, no watermark or signature.

## E. Song, not something else
- [ ] **Grey tile or thatch** roofs; **no yellow/gold glazed roof** (**[auto]** checks yellow pixels in roofs).
- [ ] Roof forms are 懸山 / 歇山 (or 廡殿 for the town gate). **No 硬山 flush gables, no horse-head walls, no steep Qing corner flicks.**
- [ ] Deep eaves, raised platform, plain or simple bracket sets, vermilion only on official buildings (yamen, treasury, gate tower).
- [ ] No tatami, no shoji, no torii, no terracotta pantiles, no domes, no Middle-Eastern tile (traits of the reference screenshots, which are for *format* only).
- [ ] No anachronisms: glass, modern nails/screws, wheelbarrow rubber tyres, maize/potato/chili/tomato, cotton fields; no cannon or handguns.
- [ ] Interior details are period: high stools/benches, matting, jars, bamboo, no chairs with Qing carved backs.
- [ ] Matches the three style anchors (same palette, same line weight, same level of detail) and the other accepted buildings.

## F. Text and signs
- [ ] **No generated Chinese glyphs anywhere.** Plaques and banners were painted blank and the text was added with `tools/add_signboard_text.py` in **traditional characters exactly as in the `signboard_text_traditional` column** of `buildings.csv`.
- [ ] A second person has proof-read every character (compare with the CSV): no missing strokes, right order, vertical boards read top to bottom.
- [ ] Gate plaques stay blank (the game writes the village name).
- [ ] No Latin letters, numbers or logos on signs.

## G. Uniqueness and consistency
- [ ] The building looks different from every other building (no recoloured copy of the courtyard house / storehouse).
- [ ] The three variants of homes differ visibly (roof shape, layout, props).
- [ ] The set looks like one hand: put all accepted buildings on one sheet at 0.83 zoom (`desktop` screenshots in `current/screenshots` are the comparison) and nothing sticks out in colour or detail.

## Sign-off table (copy into your delivery)
| Variant | auto check | scale | cutaway | light | Song | text | unique | OK |
|---|---|---|---|---|---|---|---|---|
| e.g. smithy | pass | ok | ok | ok | ok | ok | ok | yes |
