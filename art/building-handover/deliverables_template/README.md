# Delivery layout

Deliver one folder per batch:
```
deliverables/
  <variant>__<layer>.png        (flat or in sub-folders, any depth; the tools search recursively)
  signoff.md                    (table from ACCEPTANCE.md)
```
* `<variant>` is a key from `specs/buildings_spec.json` / `buildings.csv` (e.g. `smithy`, `home_cottage_b`, `gate_town`, `field_autumn`).
* `<layer>` is `base`, `props`, `roof`, `props_l2`, `props_l3`, optional `roof_l3`, `base_damaged`, `roof_damaged`, `construct_1`, `construct_2`. Classes H/S/F deliver `base` only (roof baked in).
* Every PNG: RGBA, straight alpha, exactly `box_wu x 6` px (`master_canvas_px` in the spec), anchor = bottom-centre, identical registration across the layers of one variant.
* Example: smithy = 1140 x 1020 px: `smithy__base.png, smithy__props.png, smithy__roof.png, smithy__props_l2.png, smithy__props_l3.png`.
* Sub-folders under `deliverables/` in this template (homes, civic, workshops, economy, commerce, structures) are only a suggestion for tidiness.

After every batch run:
```
python tools/check_deliverable.py --masters deliverables --partial
python tools/pack_building.py --masters deliverables --out build
```
Send back: `deliverables/` (masters), `build/` (packed WebP tiers, manifest, previews) and `signoff.md`.
