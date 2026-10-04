# Thewworks SEO & Discoverability Guide

This document outlines the SEO strategy and technical implementation for Thewworks to ensure maximum visibility for the keyword "thewworks" and related printing services.

## Technical Foundation

### 1. Meta Tags & Social Previews
- **Dynamic Title Management**: Managed via the `SEO.tsx` component. Each route (Home, Store, Admin) has a unique title and description.
- **Open Graph (OG)**: Fully implemented for high-quality link previews on WhatsApp, Facebook, and Instagram.
- **Twitter Cards**: Configured with `summary_large_image` to showcase the studio's work when shared on X/Twitter.

### 2. Structured Data (Schema.org)
- **LocalBusiness**: Detailed JSON-LD in `index.html` helps Google understand the physical location (Asaba), services offered, and business hours.
- **Organization**: Establishes the brand entity and connects the logo to the domain.
- **WebSite**: Enables the Sitelinks search box feature in Google Search.

### 3. Crawlability
- **Sitemap**: `public/sitemap.xml` lists all primary routes to guide crawlers.
- **Robots.txt**: `public/robots.txt` ensures private routes (admin, API) are hidden while the rest is fully accessible.
- **Canonical URLs**: Every page specifies its canonical URL to prevent duplicate content issues.

### 4. User Experience & Mobile
- **PWA Manifest**: `public/manifest.json` enables "Add to Home Screen" on mobile devices, boosting user retention and discovery.
- **Theme Color**: Aligned with the brand's orange to provide a premium browser experience on mobile.

## How to Maintain

### Adding New Pages
When creating a new route, simply drop the `<SEO />` component into the page:

```tsx
<SEO 
  title="Your New Page" 
  description="What this page is about." 
  keywords="keyword1, keyword2"
/>
```

### Updating Business Info
Most core business info is located in the Schema.org script in `index.html`. Update the `address`, `telephone`, or `knowsAbout` fields there to reflect any changes in physical location or services.

## Key Search Terms Targeted
- `thewworks` (Primary)
- `printing press asaba`
- `custom packaging nigeria`
- `business cards asaba`
- `branded apparel delta state`
