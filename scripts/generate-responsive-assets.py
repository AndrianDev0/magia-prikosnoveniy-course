from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / "public" / "course"


def resize(source: str, target: str, width: int, quality: int) -> None:
    source_path = COURSE / source
    target_path = COURSE / target
    with Image.open(source_path) as image:
        height = round(image.height * width / image.width)
        resized = image.resize((width, height), Image.Resampling.LANCZOS)
        resized.save(target_path, "WEBP", quality=quality, method=6)
    print(f"{target_path.name}: {width}x{height}")


resize("home-desktop-figma.webp", "home-tablet-figma.webp", 1024, 80)
resize("home-desktop-figma.webp", "home-laptop-figma.webp", 1440, 82)
resize("home-desktop-figma.webp", "home-placeholder.webp", 480, 38)
resize("home-mobile-figma.webp", "home-mobile-responsive.webp", 900, 80)
resize("home-mobile-figma.webp", "home-mobile-placeholder.webp", 360, 34)
resize("lessons-desktop-figma.webp", "lessons-tablet-figma.webp", 1024, 78)
resize("lessons-desktop-figma.webp", "lessons-laptop-figma.webp", 1440, 80)
resize("lessons-desktop-figma.webp", "lessons-placeholder.webp", 360, 34)
resize("lessons-mobile-figma.webp", "lessons-mobile-responsive.webp", 900, 78)
resize("lessons-mobile-figma.webp", "lessons-mobile-placeholder.webp", 320, 32)
