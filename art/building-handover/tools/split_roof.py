#!/usr/bin/env python3
"""Derive a roof layer from a roofed hero image and its roofless (interior) version of the SAME canvas.
Usage: python tools/split_roof.py roofed.png roofless.png roof_out.png [--thr 28]
Pixels that differ between the two images (or exist only in the roofed one) are the roof. Prints an alignment score: if more than ~3% of the pixels
OUTSIDE the roof differ, the generator moved the building; regenerate the roofless version with the edit prompt in PROMPTS.md section 4a."""
import argparse
from PIL import Image, ImageFilter
import numpy as np
ap = argparse.ArgumentParser(); ap.add_argument('roofed'); ap.add_argument('roofless'); ap.add_argument('out'); ap.add_argument('--thr', type=float, default=28); a = ap.parse_args()
A = Image.open(a.roofed).convert('RGBA'); B = Image.open(a.roofless).convert('RGBA')
if A.size != B.size: raise SystemExit(f'size mismatch {A.size} vs {B.size}')
x = np.asarray(A).astype(np.float32); y = np.asarray(B).astype(np.float32)
diff = np.abs(x[..., :3] - y[..., :3]).max(-1) + np.abs(x[..., 3] - y[..., 3])
mask = diff > a.thr
m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
al = np.minimum(np.asarray(m).astype(np.float32), x[..., 3])
roof = np.dstack([x[..., :3], al]).astype(np.uint8); Image.fromarray(roof, 'RGBA').save(a.out)
outside = (~mask) & (x[..., 3] > 8); print('roof pixels:', int(mask.sum()), ' alignment: %.1f%% of non-roof pixels differ' % (100 * (diff[outside] > a.thr).mean() if outside.sum() else 0), '->', a.out)
