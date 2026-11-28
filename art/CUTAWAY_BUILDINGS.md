# Cutaway villages, v0.70

This implements the supplied `handover_buildings_lite.zip` in the existing 2.5D canvas renderer. Its instructions were treated as the art/geometry specification; they did not replace the game's campaign, economy or save owners. Xia/Jin settlement artwork and character/unit artwork retain their existing owners.

## Artwork and source

The final runtime artwork is `assets/{hi,md,lo}/bld_<variant>__<layer>.webp`, described by `assets/bld_manifest.json`. The set has 49 unique base variants. The high-resolution PNG masters and original generated inputs are kept locally in `art/building-masters/deliverables/` and `art/building-masters/generated/`; these development files are not loaded by the game. A delivery archive in `test-results/building-delivery.zip` collects the masters, runtime layers, manifest and source notes.

Artwork was created with the built-in **imagegen** tool. The production prompt plan is in `art/building-masters/generation-plan.json`; single-building corrections are in `art/building-masters/single-asset-repairs.json` and plain seasonal fields in `art/building-masters/field-repairs.json`. The smithy and cottage establish the painting style; later images use those references, and each removable roof uses its corresponding interior as its reference. Reference advertisements from the supplied package were used for cutaway readability, not copied into the game's artwork. Small level-two/three furnishings are deterministic code-native 2D additions in the pack script, positioned clear of the proposed stations and delivery points. They represent equipment, not inventory grants. The non-medical decorative upgrade layers are packaged for future calibration but kept out of the active renderer: their generic benches could cover painted furniture. The hospital care mats remain active.

`art/pack_cutaway_buildings.py` applies one registration transform to each base and roof pair, splits the front kerbs/posts into the foreground layer and creates level additions. It removes residual alpha haze/key-colour contour pixels, exports exact master canvases, then writes premultiplied-alpha hi/md/lo WebP tiers. It uses the handover's metadata and packing utilities. The supplied documents and tools are under `art/building-handover/`.

With the generated PNG inputs present:

```powershell
python art/pack_cutaway_buildings.py
python art/building-handover/tools/check_deliverable.py --masters art/building-masters/deliverables
node tests/cutaway-village.cjs
```

For development, `--partial` packs only complete variant layer sets. The production manifest is packed without that option. PNG masters are archived locally rather than duplicating hundreds of megabytes in the static-site repository; a fresh checkout needs that master archive to rebuild identical bitmap tiers. The runtime WebP files and exact generation prompts are versioned.

## Integration

`song-buildings.js` loads the manifest and each building's complete tier atomically. Missing layers retain the old artwork instead of showing a partially assembled building. Only built buildings or real construction orders are displayed. Registered canvases keep the bottom-centre anchor; close view draws base, live workers/goods, foreground props and then the fading roof. The handover's roof fade is used: opaque at scale <=0.40 and absent at >=0.70. The same paintings supply map plates and building thumbnails, with cached map plates invalidated when a new set finishes loading.

`village-scene.js` remains the placement/navigation owner. Planned footprints remain reserved so homes do not move when later workshops are built. The enclosed expansion ward is larger to fit all developed facilities and permanent homes. Cutaway floors have actual door approaches and usable internal routes; hospital beds are collision obstacles. The stable has a usable connection between its barn and paddock. Ground aprons are sized to the new platforms.

The existing `village-economy.js` still derives visible deliveries from the real workshop/commerce recipes and committed construction costs. `village-work-actions.js` adds borrowed tools, carried inputs, bench placement, work gestures, output-rack placement and tool returns. Porters collect the finished parcels. Seasonal farmers sow and tend rows, cut autumn crops and leave bundles for collection. Row progress persists through saves and is bounded by the actual seasonal production budget. These are representative visual work cycles; the campaign's production, payment, casualties and monthly advancement owners are unchanged. A drawing frame never manufactures goods or advances time.

The treasury uses registered attachment coordinates for the six empty trays and the existing `treasuryContents` representation of actual reserves. No ingots are baked into the picture. The hospital changes to two rows of four beds and four level-two side mats; `vlSlots` maps the existing persistent patient IDs into that layout. Recovery, capacity, stretcher journeys and company identities remain under `village-life.js`. Name plaques are drawn with the real font from the manifest's traditional-character strings; generated glyphs are not used.

## Residents and ownership

`village-residents.js` stores a small visible roster under `CG.villageResidents`, bounded by actual population and using the existing character sprites. IDs, names, home assignments, workplace assignments, meeting history and completed visible deliveries survive campaign saves. No new population, production bonus or civilian casualty result is invented. The displayed roster follows population and staffed workplaces, capped at 64 representatives; names already recorded remain available when the display limit changes.

Established workers can begin on duty on their first appearance. New visible residents introduced by actual population growth enter through the gate. Named porters claim one queued delivery at a time; collection, carrying, unloading and returning are continuous. The same person is not also drawn as an idle villager while carrying. Staff walk inside to stations rather than appearing as an unrelated worker in front of the picture.

Homes retain their plot and any earned tile-house appearance. A population decline marks surplus houses vacant instead of deleting them. The village chronicle records real development-level changes and population changes. Qinghe's civic hall follows captured banners or earned market-town progress (market built and prosperity >=45); the memorial follows actual fallen records. Existing homecomings, wounded care, festivals, raids, repairs, territorial holdings and Jin-war allies remain active. Named resident profiles also retain the village-war dialogue context. Neither civic illustration grants resources or military strength.

Click a person for their profile, portrait, home/workplace focus and Follow. Pan to stop following. The existing management sidebar becomes a compact Village drawer on phones. There is no added per-resident needs-management panel or recurring approval prompt.

## Geometry adaptations from the handover

The station coordinates were proposals. The small barracks' original x=-80 station lay outside its 130-unit canvas; it is moved to (-25,-26), with its intake/output at (+/-34,-18). Warehouse and armoury dispatch points move inside their open floors; warehouse/armoury clerks stand at (60,-42)/(40,-40). The treasury clerk stands beside the actual counter at (70,-52). Hospital bed coordinates are calibrated from its registered source image; four side mats preserve the level-two capacity without blocking the central entrance. The barracks and stable retain their larger existing yard/paddock records while their art uses the specified smaller building canvas.

These are presentation/navigation adaptations. None change recipes, building costs, population, soldiers, officer recovery or campaign mission rewards.

## Validation

`tests/cutaway-village.cjs` checks complete distinct assets, roof fade, resident identity, stable home plots, actual profile clicks, following, save persistence, developed-town capacity, interior delivery routes, hospital beds/mats, porter uniqueness, conservation, vacant homes and the phone drawer. Existing town economy/scene/street tests cover construction receipts, recipes, navigation, stable horses and frame cost. The economy animation test advances resident walking as well as delivery cycles, because a worker now physically reaches the workstation before its visual work phase.

The handover's automated deliverable checker covers RGBA dimensions, required layers, transparent borders, roof colours and tier completeness. Visual review uses the in-game views and the roofed/roofless contact sheets in `test-results/`. This is art-direction validation, not independent architectural certification.

## v0.70 compact street plan and physical staff

The active 2700 by 2700 scene replaces the 4800 by 2600 spread. Its square curtain wall has a centred southern gate, a central approach, paired shop frontages, residential lanes and larger service compounds. Opening and Gate focus place the gate at the centre of the usable viewport, near its lower edge. Future plots remain reserved without displaying their buildings. The surface changes to small stone flags at prosperity 45 or wall level two. The plan deliberately adapts the Song street rhythm to playable districts; it is not a survey reconstruction. References: [Palace Museum's Song Qingming scroll](https://minghuaji.dpm.org.cn/paint/detail?id=592d80e225aac624977fee2e19452c1f&topicType=12) and [its publication covering streets, shop signs, gates and furniture](https://www.dpm.org.cn/journal_detail/238899.html).

`SONG_INTERIORS` calibrates the main workshops' station positions, working direction, solid furniture footprints and furniture depth masks. Bench goods appear at hand/table height. Furniture cuts the route grid and is drawn again at its own depth so a person walking behind it is actually occluded. Staff use continuous routes rather than switching between a static staff overlay and a separate walking figure.

`art/build_song_rest.py` reposes the existing civilian meshes into actual bent-leg seated poses, retaining their cloth, faces, lighting and eight facings. `song-rest.js` loads the six role atlases into a separate 48-pose cache. Idle staff walk to a resting stool; a material-starved smith returns his tool and rests, then borrows it again when the real recipe becomes affordable. Clerks visit their actual input, shelf/counter and output points, with resting periods. Input/output deliveries have equal queue priority to prevent continually busy trade from starving workshop inputs. `tests/compact-village.cjs` checks square walls, opposite frontages, gate centring, staff travel, furniture collision, seated shortages, resumption after replenishment and conservation.
