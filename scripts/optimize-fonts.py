"""Compress the supplied font files without changing their glyphs or outlines.

Run once with Python packages fonttools and brotli; generated assets are committed.
"""
from pathlib import Path
from fontTools.ttLib import TTFont

font_dir = Path(__file__).resolve().parents[1] / "public" / "fonts"
for source in sorted(font_dir.glob("bricolage-*.ttf")):
    font = TTFont(source)
    font.flavor = "woff2"
    target = source.with_suffix(".woff2")
    font.save(target)
    print(f"{source.name}: {source.stat().st_size} -> {target.stat().st_size} bytes")
