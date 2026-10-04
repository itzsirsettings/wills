# Shared dot pattern

The site uses one CSS texture in src/brand-pattern.css. Four staggered repeating radial gradients produce large, medium, small and tiny dots with approximate diameters of 6, 4, 2 and 1 pixels. Grids repeat every 144, 96, 48 and 24 pixels with different offsets.

Light sections use navy at 5.5% opacity. Dark sections use lavender at 7.5%, and the photographic hero uses lavender at 9%. Cards can overlap their section texture, providing slightly stronger local detail while retaining faint treatment.

Coverage includes every landing section, offerings strip, footer, shared Card primitive, service/process/design cards, gallery and interior figures, project brief, contact card, gallery dialog and cookie notice. The sticky white navbar remains clear.

Decision: use static CSS instead of raster images. This preserves sharpness at different screen sizes and adds no image requests. Decorative pseudo-elements sit behind content and have pointer-events disabled. Existing photographs retain their original appearance.

Revisit when an approved brand guide specifies a different dot size, density or opacity.
