"""Build local WOFF2 fonts. Requires fonttools[woff] and brotli.

Montserrat is downloaded from the same Google Fonts release used by the site.
Miama Nueva is the existing project font. Keep all OpenType layout features.
"""
from io import BytesIO
from pathlib import Path
from urllib.request import urlopen
from fontTools import subset
from fontTools.ttLib import TTFont

COURSE = Path(__file__).resolve().parents[1] / "public" / "course"
OUT = COURSE / "optimized"
OUT.mkdir(exist_ok=True)
FONTS = {
    "montserrat-regular": "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-.ttf",
    "montserrat-bold": "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w-.ttf",
    "montserrat-light-italic": "https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq_p9aX8.ttf",
}

def convert(font, name):
    options = subset.Options()
    options.layout_features = ["*"]
    # Latin, Cyrillic, punctuation, currencies and the arrows used by the UI.
    unicodes = set(range(0x0000, 0x0250)) | set(range(0x0400, 0x0530)) | set(range(0x2000, 0x2200))
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)
    font.flavor = "woff2"
    destination = OUT / f"{name}.woff2"
    font.save(destination)
    print(f"{destination.name}: {destination.stat().st_size} bytes")

convert(TTFont(COURSE / "miama-nueva.otf"), "miama-nueva")
for name, url in FONTS.items():
    with urlopen(url, timeout=30) as response:
        convert(TTFont(BytesIO(response.read())), name)
with urlopen("https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/OFL.txt", timeout=30) as response:
    (OUT / "Montserrat-OFL.txt").write_bytes(response.read())
