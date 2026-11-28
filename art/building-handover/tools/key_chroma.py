#!/usr/bin/env python3
"""Remove a flat magenta (#FF00FF) background and de-spill the edge. Usage: python tools/key_chroma.py in.png out.png [--tol 70]"""
import sys, argparse
from PIL import Image
import numpy as np
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('--tol', type=float, default=70); a = ap.parse_args()
im = np.asarray(Image.open(a.src).convert('RGB')).astype(np.float32)
d = np.sqrt(((im - np.array([255, 0, 255], np.float32)) ** 2).sum(-1))
alpha = np.clip((d - a.tol * .5) / (a.tol), 0, 1)           # soft key
# de-spill: pull magenta out of edge pixels (reduce R and B toward G where they exceed it)
spill = np.clip(np.minimum(im[..., 0], im[..., 2]) - im[..., 1], 0, 255) * (alpha < 1)
out = im.copy(); out[..., 0] -= spill * .8; out[..., 2] -= spill * .8
Image.fromarray(np.dstack([np.clip(out, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA').save(a.dst); print('keyed ->', a.dst)
