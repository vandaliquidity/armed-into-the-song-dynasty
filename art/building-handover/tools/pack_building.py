#!/usr/bin/env python3
"""Pack artist masters into the files the game loads.

Input  (--masters): folder with one PNG per layer, flat or in sub-folders:
        <variant_key>__<layer>.png      e.g. smithy__base.png, smithy__props.png, smithy__roof.png, gate_town__base.png
        All layers of one variant MUST have the same pixel size = box_wu * 6 (see specs/buildings_spec.json) and the anchor at bottom-centre.
Output (--out):
        assets/hi|md|lo/bld_<variant>__<layer>.webp      transparent WebP at 3.0 / 1.5 / 0.75 px per world unit
        assets/bld_manifest.json                           geometry for the code (anchors, stations, piles, levels, roof fade)
        preview/<variant>__roofless.png, __roofed.png      base+props(+roof) composites for human review
        assets/song/*.png                                  ONLY with --sheets: drop-in replacements for the three existing atlases (no code change)
Usage:  python tools/pack_building.py --masters deliverables --out build [--sheets] [--sheet-mode cutaway|roofed]
Needs:  pip install pillow numpy
"""
import argparse, json, os, sys, glob
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SPEC = json.load(open(os.path.join(HERE, '..', 'specs', 'buildings_spec.json'), encoding='utf-8'))
SHEETS = {'architecture': (4, 2, ['cottage', 'courtyard', 'winehouse', 'granary', 'smithy', 'barracks', 'yamen', 'treasury'], 'architecture-v2.png'),
          'workshops': (3, 2, ['bowyer', 'tannery', 'armourer', 'saddler', 'powder', 'weaver'], 'workshops-v1.png'),
          'gates': (3, 1, ['gate_hamlet', 'gate_village', 'gate_town'], 'gates-v1.png')}

def find(masters, name):
    hits = glob.glob(os.path.join(masters, '**', name + '.png'), recursive=True)
    return hits[0] if hits else None

def comp(layers):
    out = None
    for im in layers:
        out = im.copy() if out is None else Image.alpha_composite(out, im)
    return out

def resize_premult(im, size):
    """premultiplied-alpha resize: no dark or light fringes on transparent edges"""
    arr = np.asarray(im).astype(np.float32); al = arr[..., 3:4] / 255.0
    pm = np.concatenate([arr[..., :3] * al, arr[..., 3:4]], 2)
    chans = [np.asarray(Image.fromarray(pm[..., c], 'F').resize(size, Image.LANCZOS)) for c in range(4)]
    t = np.stack(chans, 2); a2 = np.clip(t[..., 3:4] / 255.0, 1e-4, 1)
    rgb = np.clip(t[..., :3] / a2, 0, 255); return Image.fromarray(np.concatenate([rgb, np.clip(t[..., 3:4], 0, 255)], 2).astype(np.uint8), 'RGBA')

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--masters', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--sheets', action='store_true'); ap.add_argument('--sheet-mode', default='cutaway', choices=['cutaway', 'roofed'])
    ap.add_argument('--quality', type=int, default=90); a = ap.parse_args()
    manifest = {'version': 1, 'ppwu': SPEC['ppwu'], 'roof_fade_sc': SPEC['roof_fade_sc'], 'buildings': {}}
    got = {}; problems = []
    for key, b in SPEC['buildings'].items():
        W, H = b['master_canvas_px']; layers = {}
        for lay in b['layers_required'] + b['layers_optional']:
            p = find(a.masters, f'{key}__{lay}')
            if not p:
                if lay in b['layers_required'] and any(find(a.masters, f'{key}__{x}') for x in b['layers_required']):
                    problems.append(f'{key}: missing required layer {lay}')
                continue
            im = Image.open(p).convert('RGBA')
            if im.size != (W, H): problems.append(f'{key}__{lay}: size {im.size} != expected {(W, H)}'); continue
            layers[lay] = im
        if not layers: continue
        got[key] = layers
        for tier, ppwu in SPEC['ppwu'].items():
            d = os.path.join(a.out, 'assets', tier); os.makedirs(d, exist_ok=True)
            size = (round(b['box_wu'][0] * ppwu), round(b['box_wu'][1] * ppwu))
            for lay, im in layers.items():
                resize_premult(im, size).save(os.path.join(d, f'bld_{key}__{lay}.webp'), 'WEBP', quality=a.quality, method=6, alpha_quality=100)
        os.makedirs(os.path.join(a.out, 'preview'), exist_ok=True)
        base = [layers[k] for k in ('base', 'props', 'props_l2', 'props_l3') if k in layers]
        comp(base).save(os.path.join(a.out, 'preview', f'{key}__roofless.png'))
        if 'roof' in layers: comp(base + [layers['roof']]).save(os.path.join(a.out, 'preview', f'{key}__roofed.png'))
        m = {k: v for k, v in b.items() if k not in ('layers_required', 'layers_optional', 'zero_code_sheet_cell')}; m['layers'] = sorted(layers.keys())
        manifest['buildings'][key] = m
    os.makedirs(os.path.join(a.out, 'assets'), exist_ok=True)
    json.dump(manifest, open(os.path.join(a.out, 'assets', 'bld_manifest.json'), 'w'), indent=1, ensure_ascii=False)
    if a.sheets:
        os.makedirs(os.path.join(a.out, 'assets', 'song'), exist_ok=True)
        owner = {}
        for key, b in SPEC['buildings'].items():
            if b['zero_code_sheet_cell']: owner[tuple(b['zero_code_sheet_cell'])] = key
        for sh, (cols, rows, names, fname) in SHEETS.items():
            CW = CH = 640; sheet = Image.new('RGBA', (cols * CW, rows * CH), (0, 0, 0, 0)); n = 0
            for i, nm in enumerate(names):
                key = owner.get((sh, nm))
                if key is None or key not in got: continue
                L = got[key]; stack = [L[k] for k in ('base', 'props') if k in L] if a.sheet_mode == 'cutaway' else [L[k] for k in ('base', 'props', 'roof') if k in L]
                im = comp(stack); bb = im.getbbox()
                if not bb: continue
                im = im.crop(bb); sc = min((CW * 0.92) / im.width, (CH * 0.92) / im.height)
                im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS)
                sheet.alpha_composite(im, ((i % cols) * CW + (CW - im.width) // 2, (i // cols) * CH + CH - im.height - round(CH * 0.04))); n += 1
            if n: sheet.save(os.path.join(a.out, 'assets', 'song', fname)); print(f'sheet {fname}: {n}/{len(names)} cells filled' + ('  -> a partly filled sheet must NOT be dropped in: finish all cells first' if n < len(names) else ''))
    print(f'packed {len(got)} variants; {len(problems)} problems')
    for p in problems: print('  PROBLEM:', p)
    sys.exit(1 if problems else 0)

if __name__ == '__main__': main()
