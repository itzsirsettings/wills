"""Compress the supplied Orbitron and Ubuntu fonts for local web delivery.

Requires fonttools and brotli. Source fonts and licenses remain intact.
Generated files and src/wills-fonts.css are committed deployment assets.
"""
from pathlib import Path
from shutil import copyfile

from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
source_dir = root / 'Orbitron,Ubuntu'
font_dir = root / 'public' / 'fonts'
faces = [
    ('orbitron-variable', 'Orbitron/static/Orbitron-VariableFont_wght.ttf',
     'Orbitron', 'normal', '400 900'),
    ('ubuntu-light', 'Ubuntu/Ubuntu-Light.ttf', 'Ubuntu', 'normal', '300'),
    ('ubuntu-light-italic', 'Ubuntu/Ubuntu-LightItalic.ttf', 'Ubuntu', 'italic', '300'),
    ('ubuntu-regular', 'Ubuntu/Ubuntu-Regular.ttf', 'Ubuntu', 'normal', '400'),
    ('ubuntu-italic', 'Ubuntu/Ubuntu-Italic.ttf', 'Ubuntu', 'italic', '400'),
    ('ubuntu-medium', 'Ubuntu/Ubuntu-Medium.ttf', 'Ubuntu', 'normal', '500'),
    ('ubuntu-medium-italic', 'Ubuntu/Ubuntu-MediumItalic.ttf', 'Ubuntu', 'italic', '500'),
    ('ubuntu-bold', 'Ubuntu/Ubuntu-Bold.ttf', 'Ubuntu', 'normal', '700'),
    ('ubuntu-bold-italic', 'Ubuntu/Ubuntu-BoldItalic.ttf', 'Ubuntu', 'italic', '700'),
]
licenses = [('Orbitron/OFL.txt', 'orbitron-OFL.txt'),
            ('Ubuntu/UFL.txt', 'ubuntu-UFL.txt')]
required = [relative for _, relative, _, _, _ in faces]
required.extend(relative for relative, _ in licenses)
missing = [relative for relative in required if not (source_dir / relative).is_file()]
if missing:
    raise FileNotFoundError(f"Missing supplied font sources: {', '.join(missing)}")

font_dir.mkdir(parents=True, exist_ok=True)
rules = ['/* Self-hosted web fonts generated from the supplied Orbitron,Ubuntu folder. */']
for name, relative, family, style, weight in faces:
    source = source_dir / relative
    font = TTFont(source, recalcTimestamp=False)
    font.flavor = 'woff2'
    target = font_dir / f'{name}.woff2'
    font.save(target)
    compressed = TTFont(target, recalcTimestamp=False)
    if font.getBestCmap() != compressed.getBestCmap():
        raise ValueError(f'Character coverage changed for {name}')
    if font['hmtx'].metrics != compressed['hmtx'].metrics:
        raise ValueError(f'Glyph metrics changed for {name}')
    if 'fvar' in font:
        expected = [(axis.axisTag, axis.minValue, axis.maxValue)
                    for axis in font['fvar'].axes]
        actual = [(axis.axisTag, axis.minValue, axis.maxValue)
                  for axis in compressed['fvar'].axes]
        if actual != expected:
            raise ValueError(f'Variable font axes changed for {name}')
    rules.append(f"""@font-face {{
  font-family: '{family}';
  font-style: {style};
  font-weight: {weight};
  font-display: swap;
  src: url('/fonts/{name}.woff2') format('woff2');
}}""")
    print(f'{name}: {source.stat().st_size} -> {target.stat().st_size} bytes')
for relative, destination in licenses:
    copyfile(source_dir / relative, font_dir / destination)
(root / 'src' / 'wills-fonts.css').write_text('\n\n'.join(rules) + '\n', encoding='utf-8')
