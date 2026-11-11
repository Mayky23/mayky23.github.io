"""Regenerate the web-ready images used by index.html.

Usage (from the repo root):  python tools/optimize_images.py

Requires Pillow. Sources stay untouched:
  assets/images/optimized/*.jpg   -> 1200x675 intermediates
  assets/images/avatar/icon.png   -> avatar original
Outputs:
  assets/images/optimized/*-640.webp, *-1200.webp -> 16:9 project covers (srcset)
  assets/images/avatar/avatar-320.png, avatar-160.png
  assets/images/icono_web/favicon-32.png, favicon-180.png
The Open Graph cover is generated separately: python tools/make_og_cover.py
"""
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"


def save_covers():
    sharpen = ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2)
    for src in sorted((IMAGES / "optimized").glob("*.jpg")):
        with Image.open(src) as im:
            im = im.convert("RGB")
            for width in (640, 1200):
                height = round(width * 9 / 16)
                out = im.resize((width, height), Image.LANCZOS).filter(sharpen)
                out.save(src.with_name(f"{src.stem}-{width}.webp"), "WEBP", quality=84, method=6)


def save_avatar_and_icons():
    with Image.open(IMAGES / "avatar" / "icon.png") as im:
        im = im.convert("RGBA")
        for size in (320, 160):
            im.resize((size, size), Image.LANCZOS).save(
                IMAGES / "avatar" / f"avatar-{size}.png", optimize=True
            )
    with Image.open(IMAGES / "icono_web" / "icon.png") as im:
        im = im.convert("RGBA")
        for size in (32, 180):
            im.resize((size, size), Image.LANCZOS).save(
                IMAGES / "icono_web" / f"favicon-{size}.png", optimize=True
            )


if __name__ == "__main__":
    save_covers()
    save_avatar_and_icons()
    print("done")
