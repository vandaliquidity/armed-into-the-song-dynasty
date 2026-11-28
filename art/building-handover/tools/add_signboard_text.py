#!/usr/bin/env python3
"""Add real Chinese characters to a blank plaque or banner (generators garble text).
Usage: python tools/add_signboard_text.py in.png out.png --rect X Y W H --text 鐵匠鋪 --font /path/NotoSerifCJK-Bold.ttc [--vertical] [--color 232,214,168] [--index 1]
 --rect is the plaque rectangle in PIXELS of in.png. --index picks the face in a .ttc (Noto Serif CJK: 0 JP, 1 KR, 2 SC, 3 TC, 4 HK)  -> use the TC face for traditional.
Characters are fitted to the rectangle and given a slight darkening edge so they look painted. Always proof-read the result."""
import argparse
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('--rect', nargs=4, type=int, required=True); ap.add_argument('--text', required=True)
ap.add_argument('--font', required=True); ap.add_argument('--index', type=int, default=0); ap.add_argument('--vertical', action='store_true'); ap.add_argument('--color', default='232,214,168'); a = ap.parse_args()
im = Image.open(a.src).convert('RGBA'); x, y, w, h = a.rect; col = tuple(int(c) for c in a.color.split(',')) + (255,)
n = len(a.text); pad = 0.12
size = int(min(h * (1 - 2 * pad), w * (1 - 2 * pad) / n)) if not a.vertical else int(min(w * (1 - 2 * pad), h * (1 - 2 * pad) / n))
font = ImageFont.truetype(a.font, size, index=a.index); lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
for i, ch in enumerate(a.text):
    bb = d.textbbox((0, 0), ch, font=font); cw, chh = bb[2] - bb[0], bb[3] - bb[1]
    if a.vertical: cx = x + (w - cw) / 2 - bb[0]; cy = y + (h - n * size) / 2 + i * size + (size - chh) / 2 - bb[1]
    else: cx = x + (w - n * size) / 2 + i * size + (size - cw) / 2 - bb[0]; cy = y + (h - chh) / 2 - bb[1]
    d.text((cx + 1, cy + 1), ch, font=font, fill=(40, 25, 10, 160)); d.text((cx, cy), ch, font=font, fill=col)
alpha = im.getchannel('A'); out = Image.alpha_composite(im, lay); out.putalpha(alpha); out.save(a.dst); print('text added ->', a.dst)
