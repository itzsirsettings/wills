# Rebrand decisions and delivery plan

**Approved scope:** Replace public media and rebrand the existing site for Wills Group of Company. Interiors are a core offering. Confirmed WhatsApp: +234 705 745 0799.

## Independently reversible milestones

1. Preserve the original tracked files and interfaces in PRESERVATION_MANIFEST.md. Add the supplied media and transparent logo without deleting originals.
2. Rebrand configuration, main page, supporting components, forms, manifest and metadata. Preserve frontend wildcard behavior and all API paths.
3. Add gallery filters, accessible lightbox, selective video loading and a browser-only project brief with WhatsApp handoff.
4. Validate build, lint, automated tests, media references, route preservation, browser behavior and responsive layouts. Record measured results rather than estimated scores.
5. Add email, address, domain, workshop coordinates and confirmed interior photography when supplied. Production indexing and deployment are a separate release gate.

## Decision: public identity and content

**Decision:** Use the exact confirmed public name, Wills Group of Company. Present doors, gates, metalwork and interiors as core offerings. Use only supplied photographs and descriptive visual captions.

**Alternatives:** Reuse the former business details, make up product statistics, or infer a location from its photos.

**Rationale:** The new business has confirmed its name and WhatsApp only. Former printing prices, statistics, location, certifications, warranties and lead times do not describe this business.

**Revisit when:** The owner supplies verified product specifications, project details, interior portfolio photographs and other business information.

## Decision: preserve component interfaces

**Decision:** Replace the landing composition and hero content while retaining the LandingPage and Hero exports, the root route and wildcard behavior. Extend HeroWithGreeting and the existing collage component without removing their public props. Retain all original sections and backend routes.

**Alternatives:** Rename the components or create a new framework application.

**Rationale:** The old landing page was explicitly a printing business, with hardcoded printing copy and unsupported statistics. Its content must change to fulfill the approved rebrand. A framework or route migration would increase risk without improving this result.

**Revisit when:** Actual product detail pages and editorial content justify additional routes.

## Decision: image strategy

**Decision:** Keep all supplied originals, generate WebP photo variants with real dimensions, and retain the generated logo PNG alpha channel. Videos load after selection and do not autoplay. The hero uses one priority image and manual image selection.

**Alternatives:** Remote stock assets, runtime image transformations or loading all original videos at page load.

**Rationale:** Local static media avoids dependence on the source E: drive at runtime. Responsive variants reduce transfer size. Original files remain recoverable. Background removal used the built-in imagegen tool with the instruction to remove white only and preserve emblem, colors and wording. Alpha was verified as spanning 0 to 255.

**Revisit when:** Traffic, video transfer costs or more media justify object storage and an automated transcoding pipeline. The supplied videos still require audio and caption review before an accessibility-complete public release.

## Decision: enquiries and financial preservation

**Decision:** Use an in-browser project brief with a text download and handoff to the confirmed WhatsApp number. No submission is described as delivered. Do not upload or persist personal data through new server paths in this milestone.

**Alternatives:** Build an email/upload backend or repurpose the existing payment checkout.

**Rationale:** Email recipient and operational delivery requirements are not confirmed. An explicit local-to-WhatsApp handoff is functional without inventing provider integrations. Existing payment verification, webhook, database interfaces, financial catalog IDs/prices, encryption salts and receipt cookie identifiers remain preserved for data compatibility. The financial catalog is legacy internal data and does not set welding prices.

**Revisit when:** Email recipient, retention, anti-spam controls, upload policy and payment requirements are approved. Do not advertise online welding checkout until a proper quote and payment model is defined.

## Decision: production metadata

**Decision:** Use the new name and supplied visual media. Leave email and address unset, require a confirmed domain for production canonical URLs, and keep preview robots and sitemap non-indexable until release configuration is completed.

**Alternatives:** Reuse the old printing domain and local-business address.

**Rationale:** Rebranding must not misidentify the new company or direct visitors to the former business.

**Revisit when:** The owner confirms the domain, email and address. Set VITE_PUBLIC_SITE_URL and PUBLIC_SITE_URL consistently; populate the public sitemap and robots file with actual public routes before deployment.

## Environment configuration

Public build-time values, never secrets:

- VITE_BUSINESS_WHATSAPP: defaults to the confirmed 2347057450799.
- VITE_BUSINESS_EMAIL: optional until confirmed.
- VITE_BUSINESS_PHONE: optional phone contact; WhatsApp is already shown separately.
- VITE_BUSINESS_ADDRESS: optional until confirmed.
- VITE_PUBLIC_SITE_URL: confirmed canonical domain.
- VITE_WORKSHOP_LATITUDE and VITE_WORKSHOP_LONGITUDE: optional verified coordinates; map remains hidden while unknown.

Server:

- PUBLIC_SITE_URL: same confirmed canonical domain.
- All existing Supabase, Paystack, security, database, notification and Redis variable names remain unchanged. Do not reuse the former business credentials for a new business without validating ownership and operational requirements.

## Content still needed

- Email, workshop address and production domain.
- Specific interior product range and additional interior photographs.
- Real project locations, dates and scope where captions should carry project facts.
- Materials, thicknesses, finishes, fittings and lead times for each product.
- Delivery regions, export terms, warranties, pricing and payment terms.
- Registration details, certifications, testimonials and legal policy review if those are to be published.

## Rollback

No database migration or deployment was performed. Original tracked files and media remain. The rebrand is isolated on feat/wills-group-rebrand. Roll back a reviewed commit by reverting it, or deploy the prior immutable artifact if this change is later released. Do not delete the supplied originals or alter legacy financial data as part of rollback.
