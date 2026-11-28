#!/usr/bin/env python3
"""Automatic part of ACCEPTANCE.md. Usage: python tools/check_deliverable.py --masters deliverables [--packed build]
Checks per layer PNG: RGBA, exact canvas size, content inside canvas with margin, clean alpha edge (no magenta/white halo, soft edge <= 3 px),
content fits the max box, footprint centred on the anchor, roof is grey/dark (not yellow glaze), all layers of a variant same size, packed tiers present.
Human checks (scale vs people, light, Song style, text) remain in ACCEPTANCE.md."""
import argparse, json, os, glob, colorsys, sys
from PIL import Image
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); SPEC = json.load(open(os.path.join(HERE, '..', 'specs', 'buildings_spec.json'), encoding='utf-8'))
def rgb2hsv(a):
    a = a.astype(np.float32) / 255; mx = a.max(-1); mn = a.min(-1); d = mx - mn + 1e-6
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, np.where(mx > 0, d / (mx + 1e-6), 0), mx
def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--masters', required=True); ap.add_argument('--packed'); ap.add_argument('--partial', action='store_true', help='only check variants that have at least one delivered layer (no "missing" FAILs for the rest)'); a = ap.parse_args()
    fails = 0; warns = 0; rows = []
    def rep(level, key, msg):
        nonlocal fails, warns
        if level == 'FAIL': fails += 1
        elif level == 'WARN': warns += 1
        rows.append(f'{level:5} {key}: {msg}')
    nvar = 0
    for key, b in SPEC['buildings'].items():
        W, H = b['master_canvas_px']; sizes = set(); found = False
        if a.partial and not glob.glob(os.path.join(a.masters, '**', f'{key}__*.png'), recursive=True): continue
        for lay in b['layers_required'] + b['layers_optional']:
            hits = glob.glob(os.path.join(a.masters, '**', f'{key}__{lay}.png'), recursive=True)
            if not hits:
                if lay in b['layers_required']: rep('FAIL', f'{key}__{lay}', 'missing required layer')
                continue
            found = True; im = Image.open(hits[0])
            if im.mode != 'RGBA': rep('FAIL', f'{key}__{lay}', f'mode {im.mode}, need RGBA'); continue
            sizes.add(im.size)
            if im.size != (W, H): rep('FAIL', f'{key}__{lay}', f'size {im.size} != {(W, H)}'); continue
            arr = np.asarray(im); al = arr[..., 3]; ys, xs = np.where(al > 8)
            if len(xs) == 0: rep('FAIL', f'{key}__{lay}', 'empty layer'); continue
            l, r, t, bt = xs.min(), xs.max(), ys.min(), ys.max(); m = 2
            if l < m or t < m or r > W - 1 - m or bt > H - 1 - m: rep('FAIL', f'{key}__{lay}', 'content touches the canvas edge (cropped?)')
            rgb = arr[..., :3].astype(int); op = al > 8
            mag = ((rgb[..., 0] > 200) & (rgb[..., 1] < 90) & (rgb[..., 2] > 200) & op).sum()
            if mag > 30: rep('FAIL', f'{key}__{lay}', f'{mag} magenta key pixels left (run key_chroma.py)')
            edge = (al > 8) & (al < 247); frac = edge.sum() / max(1, op.sum())
            if frac > 0.02: rep('WARN', f'{key}__{lay}', f'soft/semi-transparent pixels {frac*100:.1f}% of content (fuzzy or haloed edge?)')
            # white halo: edge pixels much brighter than nearby inner pixels
            from PIL import ImageFilter
            er = Image.fromarray(((al > 200) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(5)); inner = np.asarray(er) > 0
            ring = op & ~inner
            if ring.sum() > 200:
                lum_r = rgb[ring].mean(); lum_i = rgb[inner].mean() if inner.sum() else lum_r
                if lum_r > lum_i + 45: rep('WARN', f'{key}__{lay}', 'edge ring is much brighter than the interior (white halo?)')
            bw, bh = (r - l + 1) / (MASTER_PPWU := SPEC['master_ppwu']), (bt - t + 1) / MASTER_PPWU
            if lay in ('base', 'roof') and (bw > b['box_wu'][0] + 1 or bh > b['box_wu'][1] + 1): rep('FAIL', f'{key}__{lay}', f'content {bw:.0f}x{bh:.0f} wu exceeds max box {b["box_wu"]}')
            if lay == 'base':
                low = ys > bt - 0.10 * (bt - t); cx = xs[low].mean() if low.any() else (l + r) / 2
                if abs(cx - W / 2) > 0.08 * W: rep('WARN', f'{key}__base', f'footprint centre off the anchor by {(cx - W/2)/MASTER_PPWU:.0f} wu')
                if H - 1 - bt > 10 * MASTER_PPWU: rep('WARN', f'{key}__base', f'bottom of art is {(H-1-bt)/MASTER_PPWU:.0f} wu above the canvas bottom (anchor should touch the bottom; 6-8 wu is fine)')
                if b['class'] == 'W':
                    bwid = (r - l + 1) / MASTER_PPWU
                    if bwid > 0 and (bt - t + 1) / MASTER_PPWU > 0 and bwid / ((bt - t + 1) / MASTER_PPWU) > 1.9: rep('WARN', f'{key}__base', 'very wide sprite (aspect > 1.9): is the room squarish?')
            if lay.startswith('roof'):
                h, s, v = rgb2hsv(arr[..., :3]); h, s, v = h[op], s[op], v[op]
                yel = ((h > 38) & (h < 68) & (s > 0.55) & (v > 0.65)).mean(); gold = ((h > 36) & (h < 55) & (s > .5) & (v > .7)).mean()
                if yel > 0.03: rep('FAIL', f'{key}__{lay}', f'{yel*100:.1f}% bright yellow pixels: glazed-yellow roof is Ming/Qing, not Song')
                if s.mean() > 0.40 and b['group_key'] not in ('home_cottage',): rep('WARN', f'{key}__{lay}', f'roof mean saturation {s.mean():.2f}: Song roofs are charcoal/grey (thatch excepted)')
        if found:
            nvar += 1
            if len(sizes) > 1: rep('FAIL', key, f'layers have different canvas sizes {sizes}')
            if a.packed:
                for tier, ppwu in SPEC['ppwu'].items():
                    for lay in b['layers_required']:
                        pth = os.path.join(a.packed, 'assets', tier, f'bld_{key}__{lay}.webp')
                        if not os.path.exists(pth): rep('FAIL', key, f'tier {tier} missing {os.path.basename(pth)}')
                        else:
                            sz = Image.open(pth).size; exp = (round(b['box_wu'][0] * ppwu), round(b['box_wu'][1] * ppwu))
                            if sz != exp: rep('FAIL', os.path.basename(pth), f'size {sz} != {exp}')
    print('\n'.join(rows) or 'no issues'); print(f'\n{nvar} variants checked, {fails} FAIL, {warns} WARN'); sys.exit(1 if fails else 0)
if __name__ == '__main__': main()
