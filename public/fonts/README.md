# Wills typography

The active web fonts are WOFF2 conversions of the user-supplied files in
`Orbitron,Ubuntu/`. Glyph coverage and the Orbitron weight axis are preserved.

- Orbitron: large homepage hero title and footer Wills wordmark (weight 500).
- Ubuntu Light (300): supporting text and default body copy.
- Ubuntu Medium (500): headings across the homepage and all policy pages.
- Ubuntu Regular, Bold and italics: available for existing controls and emphasis.

The three primary faces are preloaded; remaining faces load only when used.
All fonts are served locally with `font-display: swap`.

Regenerate the fonts with `python scripts/optimize-fonts.py` after installing
`fonttools` and `brotli`. The generator verifies character coverage, glyph metrics
and the variable weight axis against the checked-in source fonts.

**Decision:** Retain the supplied fonts and compress them to WOFF2.
**Alternatives:** Serve the original TTF files or load fonts from a third party.
**Rationale:** WOFF2 reduces transfer size while keeping font delivery local.
**Revisit when:** The supplied fonts or the site's typography requirements change.

Orbitron's OFL and Ubuntu's UFL notices accompany the generated files as
`orbitron-OFL.txt` and `ubuntu-UFL.txt`. Earlier Bricolage files remain as legacy
assets and are no longer referenced by the site's styles.
