# TECH_SPEC.md - exact technical requirements

Everything below is a **requirement** unless marked *guideline*. Machine-readable per-variant numbers: `specs/buildings_spec.json` (also read by `tools/`). Human tables: `buildings.md`, `buildings.csv`.

## 1. Units and scale
* **wu = world unit**, the game's village coordinate. Everything in the spec is in wu.
* **Master scale: 6 px per wu.** A building with box 190 x 170 wu is painted on a **1140 x 1020 px** canvas (`master_canvas_px` in the spec). Paint at that size or at an exact multiple that you then downscale to it.
* People (from the game's own sprite code; see `specs/people_scale_lineup.png`):

| Thing | wu | master px (6/wu) | hi px (3/wu) |
|---|---|---|---|
| Adult villager / soldier (standing) | **31.1** | 187 | 93 |
| Child | 19 | 114 | 57 |
| Mounted rider (with horse) | ~45 | 270 | 135 |
| 1 metre (real world) | ~18 | 108 | 54 |
| Door opening - *guideline* | 38 tall x 22 wide | 228 x 132 | |
| Gate archway clear opening - **requirement** | >= 36 wide | >= 216 | |
| Workshop eave height - *guideline* | 60-70 | 360-420 | |

* Zoom: the camera shows the village at 0.24 screen px per wu (whole village) up to about 1.3 (max zoom); desktop entry is about 0.83. At 0.83 the adult is 26 screen px tall. Roofs and signs must still read at 0.83; fine detail is for max zoom (retina 2.6 px/wu is why the hi tier is 3 px/wu).

## 2. Camera and projection
* Orthographic, **38 degree elevation**, north up, the front of every building faces the bottom of the image, yaw about 12 degrees (a hint of the right-hand side wall). Do not use perspective, fisheye or isometric 30 degree dimetric.
* Keep this camera for all 36 types and all layers (same camera = layers can be stacked and neighbours match). Existing villagers, animals and ground are drawn for this camera; changing it would break them.
* Ground contact: the front edge of the platform sits on the bottom of the canvas (6-48 px margin allowed); the sprite is horizontally centred on the anchor.

## 3. Light
* **Key light from the upper left (north-west), warm** (about 5200 K, "late-morning sun"), soft; fill from the sky, cool and weak.
* Cast shadow falls to the **lower right**, soft-edged, about 25% black. **Bake only a very short contact shadow under the building** into `base`; do not paint long cast shadows onto the ground (the game draws its own ground and shadows and they must not double).
* Interior is lit by the same light: the rear wall's inside face is lit, the left inner wall is shaded.
* No hard rim light, no bloom, no vignette, no background gradient.

## 4. Canvas, anchor and layers
* **Anchor = bottom-centre of the canvas** = the record point (x, y). The door is at 8 wu above the anchor: `(0, -8)`. `anchor_wu` in the spec: `(box_w/2, box_h)`.
* Station / pile coordinates are in wu relative to the anchor: **+x right, +y down** (so y = -50 is 50 wu up the screen).
* **Every layer of one building is the SAME canvas size and registered identically** (pixel for pixel). Never crop a layer; the pack tool and the game assume identical rects.
* **Max box**: the art may not exceed the `box_wu` in the spec (the village layout reserves plots by this box). You may use less. Footprint on the ground (`ground_plan_wu`) is the floor area inside the walls.
* **Squarish rooms**: for class W buildings the floor plan is roughly square (width : depth 1 : 1 to 1.3 : 1). No long thin sheds. The sprite itself may be wider than tall because of the roof overhang.

### Layer split (class W = workshops, stores, hospital, stable, ...)
| Layer file suffix | Content | z-order | Required |
|---|---|---|---|
| `__base` | floor, rear and left walls (full height), low front kerb/right half-wall, platform, fixed machinery, *soft contact shadow*. **No workers, no goods.** | 2 | yes |
| `__props` | foreground items that may overlap workers (front tools, benches, jars at the front, hanging goods, the near corner posts) | 4 | yes |
| `__roof` | complete roof (+ eave brackets, ridge ornaments), nothing else. Fades out when zoomed in | 5 | yes |
| `__props_l2`, `__props_l3` | extra equipment shown from level 2 / 3 upward (only for buildings with levels >= 2 / 3: see the spec) | 4 | where levels > 1 |
| `__roof_l3` | alternative roof for level 3 if it differs | 5 | optional |
| `__base_damaged`, `__roof_damaged` | burnt / broken state (raid); class H/S/F: single `__damaged` | 2/5 | optional |
| `__night` | light-only overlay: warm lit windows, lantern at the door, soft glow on the ground in front; transparent elsewhere; drawn additively at night | 6 (top) | optional |
| `__roof_snow` | the roof with a thin layer of snow (winter) | 5 | optional |
| `__construct_1`, `__construct_2` | scaffold/foundation stages (the whole building in one layer) | 2 | optional |

Order: ground (game) < base < workers and carried goods (game, animated) < props < roof.
Class H/S/F (homes, gate, watchtower, fields, wall kit): **one `__base` layer with the roof baked in**, because they are not cutaways (homes may get an optional roof layer in future). Home variants `a`, `b`, `c` are separate variant keys.

### Roof fade
The game multiplies the roof layer alpha by `f(sc)` where `sc` is the zoom (screen px per wu): 1 at `sc <= 0.40`, 0 at `sc >= 0.70`, linear in between (`roof_fade_sc` in the manifest; the code worker may tune it). At the whole-village zoom the player sees roofs only; at desktop entry (0.83) the interiors. Therefore: **`base+props` without the roof must look complete and intentional** (rear wall, platform, floor, rafters not needed), and **`roof` alone over the base must look like a finished building**.

## 5. File format, tiers and naming
* **Master (what you deliver and what we archive): PNG, RGBA, 8-bit, straight (non-premultiplied) alpha, sRGB**, at `box_wu x 6` px. Name: `<variant_key>__<layer>.png`, e.g. `smithy__base.png`, `smithy__roof.png`, `home_cottage_b__base.png`, `gate_town__base.png`. All variant keys are in `buildings.csv` (column `variant_keys_to_deliver`) and `specs/buildings_spec.json`.
* **Game files (made by `tools/pack_building.py`, you do not need to do it by hand): transparent WebP**, quality 90, alpha lossless (`alpha_quality=100`), premultiplied-alpha resampling (no fringes).

| Tier | px per wu | Smithy (190x170) | When the game uses it |
|---|---|---|---|
| `hi` | 3.0 | 570 x 510 | desktop / retina |
| `md` | 1.5 | 285 x 255 | default |
| `lo` | 0.75 | 143 x 128 | phones, low power, whole-village view |

Path and name: `assets/{hi,md,lo}/bld_<variant_key>__<layer>.webp`. Target size: <= 250 KB per hi layer file, <= 80 KB md, <= 25 KB lo; the whole set should stay under about 40 MB hi.
* **Transparent edges**: real alpha, anti-aliased 1-2 px, **no matte halo**, no magenta/white fringe, no semi-transparent haze inside the shape. The pack tool resamples premultiplied; your master must already be clean (`tools/key_chroma.py` helps if your generator only produces a flat background).
* **No text baked into the art** except text you added with `tools/add_signboard_text.py` (see `ACCEPTANCE.md`).

## 6. Manifest (what the code reads; the pack tool writes it)
`assets/bld_manifest.json`, schema version 1. One sample entry:
```json
{"version":1,"ppwu":{"hi":3.0,"md":1.5,"lo":0.75},
 "roof_fade_sc":{"alpha1_at_or_below":0.4,"alpha0_at_or_above":0.7},
 "buildings":{"smithy":{
   "class":"W","box_wu":[190,170],"master_canvas_px":[1140,1020],
   "anchor_wu":[95.0,170],"door_wu_from_anchor":[0,-8],"levels":3,
   "stations_wu_from_anchor":[{"act":"hammer","x":0,"y":-48},{"act":"tend","x":48,"y":-62},{"act":"pour","x":-50,"y":-38}],
   "input_pile_wu_from_anchor":{"x":-65,"y":-22},"output_rack_wu_from_anchor":{"x":65,"y":-22},
   "ground_plan_wu":[150,150],"plaque_text":"鐵匠鋪",
   "layers":["base","props","props_l2","props_l3","roof"]}}}
```
* `stations_wu_from_anchor`: where animated workers will stand (ACT = animation name used by the game today: hammer, tend, pour, stir, count, ...). **Keep a clear floor spot about 30 x 24 wu around each.** These positions are *proposed* by this package; if you must move one for a better design, change it in the building's row of `specs/buildings_spec.json` and report it (the code worker reads the manifest, not your picture).
* Input pile (left) and output rack (right): paint an **empty** pallet/rack/shelf at those spots; the game draws the live goods itself.

## 7. Existing structures that constrain you (hard constraints)
* **Fit and footprint (from the game code, see `GAME_HOOKS.md`)**: the game scales a sprite to fit its box width and caps the height, aspect kept: fill the box. The floor and walls stay within **x +/- 0.43 of the box width** from the centre (the roof may overhang); nothing is painted below the anchor line; the area below the door (about 60 wu) is kept empty because the game draws the name plaque, builders and key people there.
* **Treasury**: six trays in two columns of three; the game paints live gold and silver ingots on them at fixed positions (details in `buildings.csv`, `ART_DIRECTION.md`). Draw six *empty* dark trays at those positions; do not paint ingots.
* **Hospital**: eight beds. Today's code places them at fixed positions in a portrait room; the **preferred new layout is a squarish 240 x 230 wu ward with 4 x 2 beds**, but that needs a small code change. Both layouts are described in `buildings.md`; deliver the preferred one and say so.
* **Gates**: the plaque must be blank, flat and at the stated height (the game writes the village name). Clear archway >= 36 wu.
* **Fields**: 4 seasons share the same plot outline so they tile.
* The Song sprite sheets are alpha-trimmed and fitted to the box by the code, bottom-centre: if your sprite has extra transparent margin, it is trimmed away at load (zero-code path only).

## 8. Colour and look
Same palette on every building (`ART_DIRECTION.md` section 3). Unified style = same camera, same light, same level of detail, same line weight (soft painterly 2D game art with clean readable silhouettes, light dark-brown edge shading, not photoreal, not flat vector). Style anchors in `PROMPTS.md` section 1 are generated first and **attached to every later prompt** to lock the look.
