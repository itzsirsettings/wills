# Wills Group color palette

Derived from the supplied transparent logo, whose dominant indigo and red pixels were inspected. Primary brand colors are refined representative values, rather than claims of an official existing brand specification.

| Color | Hex |
|---|---|
| Indigo navy | #140640 |
| Deep navy | #10052F |
| Brand red | #970B16 |
| Soft lavender | #E4DDFB |
| Porcelain | #F7F7FA |
| White | #FFFFFF |
| Ink | #181627 |
| Slate | #615D72 |
| Border | #DCD9E5 |

Navy provides structure and dark section backgrounds. Red identifies primary actions and light-surface emphasis. Lavender supports legible emphasis on dark surfaces. White remains the sticky navbar background. Cool neutrals serve content, forms, dialogs and borders.

Shared source: src/brand-palette.css. Legacy market, admin and chevron token names are retained as aliases for compatibility. Existing photography and the logo remain unchanged.

Measured contrast pairs:

- White on brand red: 8.84:1
- Navy on white: 18.59:1
- Slate on porcelain: 5.92:1
- Lavender on navy: 14.19:1
- Muted lavender on raised navy: 9.61:1
- Red on porcelain: 8.27:1

These solid-color checks do not constitute a full WCAG audit; text over photography is checked visually.

Decision: centralize colors in CSS tokens rather than recoloring each component independently. Revisit when a formal brand guide or a supported dark mode is introduced.
