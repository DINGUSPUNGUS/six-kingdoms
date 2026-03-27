"""
convert-to-webp.py — Six Kingdoms image optimiser
Run once to convert all site images to WebP. Originals are kept as fallback.

Usage:
    pip install Pillow
    python convert-to-webp.py
"""

import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Run: pip install Pillow")
    raise

QUALITY = 82
SCRIPT_DIR = Path(__file__).parent
IMAGE_DIRS = [
    SCRIPT_DIR / "images",
    SCRIPT_DIR / "images" / "eco pool photos",
]
EXTENSIONS = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}

total_before = 0
total_after = 0
converted = 0
skipped = 0

for img_dir in IMAGE_DIRS:
    if not img_dir.exists():
        print(f"  skipping {img_dir} (not found)")
        continue

    for src in sorted(img_dir.iterdir()):
        if src.suffix not in EXTENSIONS:
            continue

        dest = src.with_suffix(".webp")

        if dest.exists():
            skipped += 1
            continue

        before = src.stat().st_size
        try:
            with Image.open(src) as img:
                # Convert palette or RGBA images sensibly
                if img.mode in ("P", "RGBA"):
                    img = img.convert("RGBA")
                elif img.mode != "RGB":
                    img = img.convert("RGB")
                img.save(dest, "webp", quality=QUALITY, method=6)

            after = dest.stat().st_size
            saving = (1 - after / before) * 100
            print(f"  {src.name:55s}  {before/1024:>6.0f}KB → {after/1024:>6.0f}KB  ({saving:.0f}% smaller)")
            total_before += before
            total_after += after
            converted += 1
        except Exception as e:
            print(f"  FAILED {src.name}: {e}")

print()
print(f"Converted : {converted} files")
print(f"Skipped   : {skipped} (already had .webp)")
if converted:
    total_saving = (1 - total_after / total_before) * 100
    print(f"Total size: {total_before/1024/1024:.1f}MB → {total_after/1024/1024:.1f}MB  ({total_saving:.0f}% smaller)")
print()
print("Done. Original files kept alongside .webp versions.")
print("Update styles.css parallax URLs to use .webp, and add .webp to HTML preload hints.")
