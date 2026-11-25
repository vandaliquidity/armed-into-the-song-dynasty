# Village scene v3

The village uses one scene description in `village-scene.js` for visible buildings, construction plots, entrances, stock locations, camera focus, regional landscape and collision. It replaces the old fully furnished template as the active renderer. The older helpers remain for shared sprites, medical figures, transfer queues and asset fallbacks.

Actual development and business levels control completed models. Population supports residential houses; the village entry is a base landmark, with its appearance following prosperity and fortification level. A higher quality gate does not grant defence statistics. Unbuilt developments occupy no visible model. Construction plots have scaffolds until the existing monthly owner completes them. Housing and woodland fill the inhabited core and available countryside around actual development. Settlement seeds, regional layouts, district shifts, approaches and river frontage produce individual scenes. Existing district focus controls use the same scene coordinates as the renderer and its paths.

`village-economy.js` records a successful construction order's cost on its existing build entry. These receipts preserve presentation information in saves; payments still belong to `startBuild` and `dynastyBuild`. Animated construction batches collect and deliver those committed materials once per scene. They do not deduct supplies, create inventory, advance the calendar or impose a real-time construction requirement. A player can leave the village or advance a month normally. Opening an older in-progress save derives its display cost from the existing order without charging again.

Visible workshop cycles use the existing `wkPlan`; commerce uses `dynastyProduction` and its actual wage rules, including the established gold conversion. Inputs travel to the worker, the work phase follows their arrival, outputs travel to storage, and carriers return empty. Production rendering does not replace seasonal/monthly settlement. Existing caravan loading and medical patients retain their simulation owners and use the new doors and lanes. The medical ward appears only at an actual hospital level.

## Animal source

`art/build_song_animals.py` builds shaded, articulated 3D horses, riders, hens and ox carts using the civilian pipeline's materials, camera convention and mesh helpers. The horse's connected body mesh and procedural coat variation avoid the older flat animal drawings. Six transparent atlases contain 224 directional poses. They live in `assets/song/animals-3d/`, together with `manifest.json` and the editable `song-animals-source.blend`.

Regenerate with Blender 5.2:

```
blender --background --python art/build_song_animals.py
```

These assets are rendered from local 3D source, rather than imagegen pictures. No additional generated-image prompt is involved. Earlier architectural and resource imagegen provenance remains in [song-visuals.md](song-visuals.md) and [living-frontier.md](living-frontier.md).

`song-animals.js` trims each pose, registers its feet, measures the solid body separately from thin weapons, and reuses the bounded scaled-sprite cache. Mounted bodies use the same village size regardless of caller radius. Tactical sizes follow the existing collision radius. Song, Xia and Jin use separate kit/coat variants; actual Jin battle metadata selects the Jin variant for mounted enemy actors. Rendering creates no soldiers or livestock resources.

## Checks

`tests/town-scene.cjs` covers visible gates on desktop/phone, absent unbuilt facilities, real construction receipts, complete deliveries, unchanged inventory, saved orders, rendered cavalry proportions and seven settlement layouts. `tests/town-economy.cjs` covers actual recipes, inputs before outputs, empty returns, pauses, shortages, wage funding, dense-town footprints and full routes. These replace the four default-runner checks tied specifically to the retired fixed template (`village-chains`, `village-haul`, `village-unified`, `village-overlap`). Their historical scripts remain available. Current asset, people, hospital, logistics, campaign, production and supply tests continue to cover the shared owners.
