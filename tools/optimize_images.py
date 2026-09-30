"""Regenerate the web-ready images used by index.html.

Usage (from the repo root):  python tools/optimize_images.py

Requires Pillow. Sources stay untouched:
  assets/images/proyecto/*        -> project screenshots (originals, unused by the page)
  assets/images/optimized/*.jpg   -> 1200x675 intermediates
  assets/images/avatar/icon.png   -> avatar original
Outputs:
  assets/images/optimized/*-640.webp, *-1200.webp -> 16:9 project covers (srcset)
  assets/images/avatar/avatar-320.png, avatar-160.png
  assets/images/icono_web/favicon-32.png, favicon-180.png
  assets/images/social/og-cover.jpg (1200x630, Open Graph / Twitter card)
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "assets" / "images"


def save_covers():
    sharpen = ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2)
    for src in sorted((IMAGES / "optimized").glob("*.jpg")):
        if src.stem == "ciberMalaga":  # not used by the page
            continue
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


def load_font(names, size):
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def save_og_cover():
    out_dir = IMAGES / "social"
    out_dir.mkdir(exist_ok=True)
    w, h = 1200, 630
    canvas = Image.new("RGB", (w, h), (18, 18, 18))
    draw = ImageDraw.Draw(canvas)

    # subtle card, same palette as the site (dark + gold)
    draw.rounded_rectangle((40, 40, w - 40, h - 40), radius=36, fill=(30, 30, 31), outline=(56, 56, 56), width=2)
    draw.rounded_rectangle((80, 82, 92, h - 82), radius=6, fill=(255, 219, 112))

    with Image.open(IMAGES / "avatar" / "icon.png") as av:
        av = av.convert("RGBA").resize((300, 300), Image.LANCZOS)
        tile = Image.new("RGBA", av.size, (58, 58, 60, 255))  # same onyx tile as the sidebar avatar
        av = Image.alpha_composite(tile, av).convert("RGB")
        mask = Image.new("L", av.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, 299, 299), radius=60, fill=255)
        canvas.paste(av, (w - 40 - 60 - 300, (h - 300) // 2), mask)

    bold = ["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"]
    regular = ["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"]
    draw.text((130, 150), "Miguel Ángel", font=load_font(bold, 76), fill=(250, 250, 250))
    draw.text((130, 238), "Roldán de Haro", font=load_font(bold, 76), fill=(250, 250, 250))
    draw.text((130, 350), "SOC L1 · DFIR · Wazuh SIEM", font=load_font(regular, 38), fill=(255, 219, 112))
    draw.text((130, 406), "Ciberseguridad, hardening y automatización", font=load_font(regular, 30), fill=(214, 214, 214))
    draw.text((130, 505), "mayky23.github.io", font=load_font(regular, 28), fill=(150, 150, 150))

    canvas.save(out_dir / "og-cover.jpg", "JPEG", quality=88, optimize=True)


if __name__ == "__main__":
    save_covers()
    save_avatar_and_icons()
    save_og_cover()
    print("done")
