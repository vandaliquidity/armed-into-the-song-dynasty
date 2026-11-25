# Village 3D source and runtime

The campaign model and `townScene()` remain authoritative. `village-3d.js` lazily starts the WebGL presentation on entering a village. `village-3d-renderer.mjs` calls the existing economic, walking, horse, medical, cart and edict animation owners once per frame, then renders their results. It neither calls the previous town frame at the same time nor changes the monthly production owner. Saves contain no WebGL objects.

`village-3d-models.mjs` builds solid Song timber frames, plaster walls, open doors, upturned hip roofs, workshops, scaffolded construction, gates, enclosure walls and trees. Static pieces are batched by material. Roofs can be hidden and the treasury roof is cut away by default. Goods follow actual stocks and committed construction deliveries. Character parts are grouped into instanced meshes and articulated around shoulders/hips; the moving cargo uses the same real jobs as the 2D view. One original world unit maps to 0.05 metres.

People and animals come from the project's editable `build_song_people.py` and `build_song_animals.py` source. Rebuild the local GLB files with:

```powershell
& 'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe' --background --python art/export_village_models.py
```

The exporter preserves the authored cloth dyes as glTF base colours, tags articulated parts, applies geometry modifiers and reduces dense animal surfaces for real-time rendering. Procedural Blender cloth/fur bump shaders are not baked; the meshes retain their shaped garments, collars, faces, kit and animal anatomy. These are actual meshes viewed from any camera angle, not the earlier fixed-angle sprite atlases.

The pinned Three.js 0.187.0 runtime, controls and glTF loader are copied from the npm package into `assets/vendor/three/`, with its MIT `LICENSE`. Addon imports use local relative paths. GLTFLoader also requires BufferGeometryUtils and SkeletonUtils. Official references: [renderer](https://threejs.org/docs/pages/WebGLRenderer.html), [orbit controls](https://threejs.org/docs/pages/OrbitControls.html), [glTF loader](https://threejs.org/docs/pages/GLTFLoader.html). WebGL2 is required; unsupported devices and a lost context return to the existing 2D view. Only the village uses WebGL; the campaign map and tactical renderer retain their existing owners.

Run `node tests/village-3d.cjs` for browser checks. The same check accepts a public game URL as its first argument. Screenshots go into ignored `test-results/`. Existing town scene/economy/street tests deliberately select 2D to cover that fallback as well.
