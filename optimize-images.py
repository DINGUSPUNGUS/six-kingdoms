# -*- coding: utf-8 -*-
"""
optimize-images.py -- Six Kingdoms comprehensive image optimiser
Creates responsive WebP variants for fast web delivery.

Output structure:
  images/webp/FILENAME-480.webp   (480px wide, mobile)
  images/webp/FILENAME-800.webp   (800px wide, tablet/card)
  images/webp/FILENAME-1200.webp  (1200px wide, desktop gallery)
  images/webp/FILENAME-1920.webp  (1920px wide, hero backgrounds)

Also re-encodes the same-directory .webp files used by CSS backgrounds
at quality 75 (replacing lower-quality or oversized q82 versions).

Usage:
    pip install Pillow
    python optimize-images.py
"""

import os
from pathlib import Path

import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Run: pip install Pillow")
    raise

QUALITY = 75          # WebP quality — 75 is visually excellent for photos
WIDTHS  = [480, 800, 1200, 1920]
EXTENSIONS = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}

ROOT = Path(__file__).parent
IMAGE_ROOTS = [
    ROOT / "images",
    ROOT / "images" / "eco pool photos",
]

# ── totals ──────────────────────────────────────────────────────────────────
total_before = 0
total_after  = 0
files_done   = 0

def process_image(src: Path, webp_dir: Path):
    global total_before, total_after, files_done

    if not src.is_file():
        return

    # re-encode same-dir .webp (CSS backgrounds) at q75 with 1920 cap
    same_dir_webp = src.with_suffix(".webp")
    if src.suffix in EXTENSIONS and src.suffix != ".webp":
        before = src.stat().st_size
        try:
            with Image.open(src) as img:
                if img.mode not in ("RGB", "RGBA"):
                    img = img.convert("RGB")

                # cap at 1920px for the same-dir hero version
                if img.width > 1920:
                    ratio = 1920 / img.width
                    img = img.resize(
                        (1920, round(img.height * ratio)),
                        Image.LANCZOS
                    )

                img.save(same_dir_webp, "webp", quality=QUALITY, method=6)

            after_sd = same_dir_webp.stat().st_size
            saving = (1 - after_sd / before) * 100
            print(f"  [same-dir] {src.name:50s}  "
                  f"{before/1024:>7.0f}KB -> {after_sd/1024:>6.0f}KB  ({saving:.0f}%↓)")
        except Exception as e:
            print(f"  FAILED same-dir {src.name}: {e}")

        # generate responsive variants into webp/ subfolder
        webp_dir.mkdir(parents=True, exist_ok=True)
        stem = src.stem  # keep original name (spaces included — URL-encode in HTML)

        for width in WIDTHS:
            dest = webp_dir / f"{stem}-{width}.webp"
            try:
                with Image.open(src) as img:
                    if img.mode not in ("RGB", "RGBA"):
                        img = img.convert("RGB")
                    if img.width > width:
                        ratio = width / img.width
                        img = img.resize(
                            (width, round(img.height * ratio)),
                            Image.LANCZOS
                        )
                    img.save(dest, "webp", quality=QUALITY, method=6)
                after = dest.stat().st_size
                total_before += before
                total_after  += after
                files_done   += 1
                saving = (1 - after / before) * 100
                print(f"    -> {width}w  {dest.name:60s}  {after/1024:>6.0f}KB  ({saving:.0f}%↓)")
            except Exception as e:
                print(f"  FAILED {width}w {src.name}: {e}")

# ── main loop ────────────────────────────────────────────────────────────────
print("=" * 80)
print("Six Kingdoms — Image Optimiser")
print("=" * 80)

for img_root in IMAGE_ROOTS:
    if not img_root.exists():
        print(f"Skipping {img_root} (not found)")
        continue

    # webp/ subfolder mirrors the source directory
    if img_root.name == "eco pool photos":
        webp_dir = ROOT / "images" / "webp" / "eco pool photos"
    else:
        webp_dir = ROOT / "images" / "webp"

    print(f"\nProcessing: {img_root.relative_to(ROOT)}")
    print("-" * 60)

    for src in sorted(img_root.iterdir()):
        if src.suffix in EXTENSIONS and src.suffix != ".webp":
            # skip PNGs (logos) — they're small already
            if src.suffix.lower() == ".png":
                print(f"  [skip PNG] {src.name}")
                continue
            process_image(src, webp_dir)

print()
print("=" * 80)
print(f"Responsive variants created : {files_done}")
if files_done:
    pct = (1 - total_after / total_before) * 100 if total_before else 0
    print(f"Total input  : {total_before/1024/1024:.1f}MB")
    print(f"Total output : {total_after/1024/1024:.1f}MB  ({pct:.0f}% smaller overall)")
print("=" * 80)
print()
print("Next steps:")
print("  1. HTML <img> tags -> wrap with <picture> using srcset to images/webp/")
print("  2. CSS background-image .jpg -> already updated to same-dir .webp")
print("  3. Inline style backgrounds -> update .jpg to .webp")
