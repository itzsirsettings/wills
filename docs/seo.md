> Historical pre-rebrand document retained for preservation. The active public website is Wills Group of Company (doors, gates, metalwork and interiors). Former business details are not current. See docs/REBRAND_DECISIONS.md for current scope and configuration.

# Thewworks SEO Runbook

This site is configured so search engines can crawl and understand the public Thewworks pages.

## What Is Implemented

- Homepage metadata in `index.html` puts `Thewworks` first in the title, description, keywords, Open Graph, and Twitter card tags.
- Canonical URLs point at `https://thewworksict.com/` and route-level SEO keeps `/store` canonical without payment query strings.
- Express injects route-aware initial HTML metadata for `/` and `/store`, so crawlers see the right title, canonical URL, robots tag, social metadata, and JSON-LD before client JavaScript runs.
- `public/robots.txt` allows the public site, points crawlers to `https://thewworksict.com/sitemap.xml`, and keeps private/admin paths out of crawl traffic.
- `public/sitemap.xml` lists the public homepage and store page, plus the primary brand and production images.
- JSON-LD structured data describes the Organization, WebSite, LocalBusiness, and WebPage entities for Thewworks ICT & Prints.
- The `/admin`, checkout callback, and payment-reference URLs emit `noindex, nofollow` through both route metadata and `X-Robots-Tag` headers where applicable.
- Placeholder social profile URLs are intentionally omitted until an official verified profile URL is available.

## Deployment Visibility Checks

Run these after every production deploy:

```bash
npm run seo:dns:check
Resolve-DnsName thewworksict.com
curl -I https://thewworksict.com/
curl -I https://www.thewworksict.com/
curl https://thewworksict.com/robots.txt
curl https://thewworksict.com/sitemap.xml
```

Expected results:

- `thewworksict.com` resolves in DNS.
- `https://thewworksict.com/` returns `200`.
- `https://www.thewworksict.com/` returns `301` to `https://thewworksict.com/`.
- `robots.txt` includes `Sitemap: https://thewworksict.com/sitemap.xml`.
- `sitemap.xml` includes only public indexable pages.

## Google Launch Checklist

1. Deploy a passing production build.
2. Verify `https://thewworksict.com/` in Google Search Console.
3. Submit `https://thewworksict.com/sitemap.xml` in Search Console.
4. Use Search Console URL Inspection for `https://thewworksict.com/` and request indexing.
5. Keep Google Business Profile details aligned with the website:
   - Name: `Thewworks ICT & Prints`
   - Also known as: `Thewworks`
   - Address: `No. 5, Okelue Street, Opposite Wema Bank, by Nnebisi Road, Asaba, Delta State, Nigeria`
   - Phone: `08123986155`
6. Keep social profiles and external directory listings using the same brand spelling and website URL.

## Google Business Profile

Use exactly this public identity so Google can connect the website, maps listing, and external citations:

- Name: `Thewworks ICT & Prints`
- Short/alternate name: `Thewworks`
- Address: `No. 5, Okelue Street, Opposite Wema Bank, by Nnebisi Road, Asaba, Delta State, Nigeria`
- Phone: `08123986155`
- Website: `https://thewworksict.com/`

Do not add unverified social profile links to structured data or the footer. Add them only after the profiles are live, owned, and using the same brand name.

Google can take time to crawl and rank a new or changed website, but this runbook keeps the technical indexing path clean for the branded keyword `thewworks`.

## Reference Links

- Google Search technical requirements: https://developers.google.com/search/docs/essentials/technical
- Ask Google to recrawl URLs and submit sitemaps: https://developers.google.com/search/docs/advanced/crawling/ask-google-to-recrawl
- Search Console URL Inspection: https://support.google.com/webmasters/answer/9012289
- Railway config as code: https://docs.railway.com/reference/config-as-code
- Google Business Profile Help: https://support.google.com/business/
