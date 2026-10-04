"""Compress supplied fonts and generate Latin subsets with full Unicode fallbacks.

Requires fonttools and brotli. Generated assets are committed; originals stay intact.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
font_dir = root / 'public' / 'fonts'
latin_ranges = [(0, 255), (0x2000, 0x206F), (0x20AC, 0x20AC),
                (0x2122, 0x2122), (0x2190, 0x2193), (0x2212, 0x2212),
                (0x2215, 0x2215), (0xFFFD, 0xFFFD)]
latin = {code for start, end in latin_ranges for code in range(start, end + 1)}


def unicode_range(codes):
    groups = []
    for code in sorted(codes):
        if groups and code == groups[-1][1] + 1:
            groups[-1][1] = code
        else:
            groups.append([code, code])
    return ', '.join(f'U+{start:04X}' if start == end else f'U+{start:04X}-{end:04X}'
                     for start, end in groups)


faces = []
for index, weight in enumerate([400, 500, 600, 700, 800]):
    source = font_dir / f'bricolage-{index}.ttf'
    original = TTFont(source, recalcTimestamp=False)
    original.flavor = 'woff2'
    original.save(source.with_suffix('.woff2'))
    compressed = TTFont(source, recalcTimestamp=False)
    options = subset.Options()
    options.layout_features = ['*']
    options.glyph_names = True
    processor = subset.Subsetter(options=options)
    processor.populate(unicodes=latin)
    processor.subset(compressed)
    if set(compressed.getBestCmap()) != set(original.getBestCmap()) & latin:
        raise ValueError(f'Character coverage changed for weight {weight}')
    for glyph in compressed.getBestCmap().values():
        if original['hmtx'][glyph][0] != compressed['hmtx'][glyph][0]:
            raise ValueError(f'Advance width changed for {glyph} at weight {weight}')
    compressed.flavor = 'woff2'
    target = font_dir / f'bricolage-{index}-latin.woff2'
    compressed.save(target)
    extended = set(original.getBestCmap()) - latin
    for suffix, codes in [('-latin', latin), ('', extended)]:
        faces.append(f"""@font-face {{
  font-family: 'Bricolage Grotesque';
  font-style: normal;
  font-weight: {weight};
  font-stretch: normal;
  font-display: swap;
  src: url(/fonts/bricolage-{index}{suffix}.woff2) format('woff2');
  unicode-range: {unicode_range(codes)};
}}""")
    print(f'Weight {weight}: {source.stat().st_size} -> {target.stat().st_size} bytes (Latin)')

(root / 'src' / 'wills-fonts.css').write_text('\n'.join(faces) + '\n', encoding='utf-8')
