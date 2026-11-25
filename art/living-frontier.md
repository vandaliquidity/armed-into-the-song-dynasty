# A Living Frontier: artwork and integration

The game retains an orthographic 2.5D presentation, with depth-sorted buildings, exposed working interiors and shaded animated figures. This is a Song-inspired visual adaptation, not an exact costume or architectural reconstruction. The historical reference basis remains [song-visuals.md](song-visuals.md).

## Editable civilian models

[build_song_people.py](build_song_people.py) creates the actual articulated meshes, cloth materials, faces, hats, limbs, tools, lighting and orthographic camera. [song-people-source.blend](../assets/song/people-3d/song-people-source.blend) contains the six roles as a clean editable gallery. These figures are 3D models, rendered into directional sprite atlases for the existing browser renderer.

Regenerate with Blender 5.2:

```
blender --background --python art/build_song_people.py
```

`-- --preview` renders four model previews into `test-results`. `-- --source-only` rebuilds the editable gallery without rendering the atlases. The full render uses CPU Cycles, eight samples and denoising. Seven transparent atlases contain 360 poses: six roles × eight directions × five frames, and six work actions × four directions × five frames. The manifest records cell dimensions. Runtime normalization fixes the foot baseline and world height; it does not replace military units or change population. Source regeneration requires Blender; playing the game does not.

## Generated environment assets

The built-in imagegen tool supplied the following transparent PNG sheets. Selected originals were copied into the repository with their alpha preserved. Runtime canvas extraction trims the individual objects and caches scaled images; it does not repaint them. Generation briefs:

* [goods-v1.png](../assets/song/goods-v1.png): twenty separate resource props, five columns by four rows. Grain baskets, timber, masonry, ore, hides, leather, salt, nitre, tea, silk, wine, sulphur, charcoal, gunpowder, grenades, treasury chest, gold, silver, food and folded cloth. Warm natural materials, muted mineral colours, softly lit orthographic three-quarter views, matching the existing Song building set; transparent background, no labels or people.
* [racks-v1.png](../assets/song/racks-v1.png): nine individual wooden equipment displays, three columns by three rows: spears, dao, bows, crossbows, lances, shields, light armour, iron armour and saddles. The same camera, material treatment and ground baseline; transparent background and clear separation between cells.
* [gates-v1.png](../assets/song/gates-v1.png): three increasingly prosperous Song-inspired gatehouses, from modest timber/earth construction to tiled village gate and substantial masonry town entrance. Front-facing three-quarter architectural depth, open passage, blank name boards, grey tiles and timber, no imperial yellow roofs, no people, transparent background. The actual settlement name is drawn at runtime.

The renderer draws only actual stored quantities and equipment. Aliases for additional food, textile, clay and metal resources reuse the appropriate family of props; they are not all unique models. Construction quality follows existing prosperity and wall levels and grants no extra defence statistics. Gold and silver remain in the official treasury.

## Validation

`tests/song-people.cjs` checks complete poses, directions, walking frames, size, anchors, save compatibility, missing-asset fallback and the busy-village frame budget. `tests/living-frontier.cjs` checks full carrier paths, growing wards, optional quest controls, real material spending and cart/reward conservation. `tests/siege-ranks.cjs` checks standing separation, gate ownership, actual damage and breach traversal. Existing battlefield, motion, village economy and campaign regressions cover adjacent behavior.
