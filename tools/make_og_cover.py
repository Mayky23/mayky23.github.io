"""Render assets/images/social/og-cover.jpg (1200x630) from tools/og-cover.html.

Usage (from the repo root):  python tools/make_og_cover.py

Requires Google Chrome or Chromium installed, plus Pillow to convert to JPEG.
Set CHROME=/path/to/chrome if it is not found automatically.
"""
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "tools" / "og-cover.html"
OUTPUT = ROOT / "assets" / "images" / "social" / "og-cover.jpg"


def find_chrome():
    candidates = [
        os.environ.get("CHROME"),
        "google-chrome", "chromium", "chromium-browser", "chrome",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ]
    for c in candidates:
        if c and (shutil.which(c) or Path(c).exists()):
            return shutil.which(c) or c
    raise SystemExit("Chrome no encontrado: define la variable CHROME con su ruta.")


def main():
    with tempfile.TemporaryDirectory() as tmp:
        png = Path(tmp) / "og.png"
        subprocess.run([
            find_chrome(), "--headless=new", "--disable-gpu", "--hide-scrollbars",
            "--allow-file-access-from-files", "--force-device-scale-factor=1",
            "--window-size=1200,630", "--virtual-time-budget=3000",
            f"--screenshot={png}", TEMPLATE.as_uri(),
        ], check=True, capture_output=True)
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(png) as im:
            im.convert("RGB").crop((0, 0, 1200, 630)).save(OUTPUT, "JPEG", quality=88, optimize=True)
    print(f"ok: {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
