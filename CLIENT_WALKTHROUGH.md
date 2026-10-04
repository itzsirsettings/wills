> Historical pre-rebrand document retained for preservation. The active public website is Wills Group of Company (doors, gates, metalwork and interiors). Former business details are not current. See docs/REBRAND_DECISIONS.md for current scope and configuration.

# Client Walkthrough

This document explains the app as a product, not just as code. It is written for a client who is evaluating whether to buy, adopt, or commission the platform.

## 1. What This App Is

This is a complete commerce platform for a product-driven business that needs:

- a strong public-facing website for brand presentation
- a dedicated store for product browsing and checkout
- a secure admin area for managing products and monitoring performance
- real payment verification, customer order capture, and post-purchase communication

The app is designed as a two-part experience:

1. The landing site builds trust, explains the brand, and helps visitors understand the collection.
2. The store handles serious shopping activity such as search, product comparison, cart management, checkout, and payment.

This separation is valuable because it gives the brand room to feel premium while keeping the buying flow focused and conversion-oriented.

## 2. The Main Areas Of The App

The app has three live routes:

- `/` for the public landing website
- `/store` for the transactional storefront
- `/admin` for the protected admin dashboard

Each area serves a different business purpose.

## 3. Landing Website Experience

The landing page is the presentation layer of the brand. It is built to help a visitor move from curiosity to confidence before entering the store.

What a prospective customer sees on the landing site:

- a hero section that introduces the brand clearly
- supporting sections that explain quality, product fit, and visual identity
- product showcase sections that tease featured items
- storytelling sections such as features, blog, FAQ, about, and contact
- a direct call-to-action that pushes serious buyers into the store
- a floating WhatsApp contact button for quick conversations and warm leads

From a sales perspective, this means the app does more than “list products.” It helps a business present itself like a real brand with narrative, positioning, and trust-building.

## 4. Storefront Experience

The store is where the buying journey becomes practical.

When a customer enters `/store`, they can:

- browse a live product catalog
- search products by keyword
- filter by category
- open detailed product previews
- view product images, supplier details, badges, and summaries
- add items to cart
- adjust quantities
- move into checkout when ready

The catalog is connected to Supabase, so it is not a hardcoded storefront. Product data can be managed centrally, and the store can refresh when catalog records change.

This gives the buyer a platform that feels modern and scalable instead of a static brochure site.

## 5. Product Discovery And Product Detail Flow

The store is designed to help customers make decisions quickly.

Key discovery features include:

- search-based browsing
- category-driven browsing
- curated sections like deals, rankings, new arrivals, and tailored selections
- image-first product cards for quick scanning
- product preview modals for deeper inspection without leaving the page

That means a customer can move from discovery to decision without friction.

For a client buying this app, this is important because strong product discovery usually improves:

- time on site
- number of products viewed
- add-to-cart rate
- checkout intent

## 6. Cart And Checkout Experience

Once a customer is ready to buy, the checkout flow is built around a clear order capture process.

The checkout modal collects:

- full name
- email address
- phone number
- city
- delivery address
- state
- delivery notes

Alongside the form, the customer sees:

- cart contents
- item quantities
- line totals
- full order total

This makes the order feel transparent and trustworthy.

When the customer submits the form, the system:

1. validates the request
2. creates the order server-side
3. initializes a Paystack payment session
4. redirects the customer to secure payment

This is not a fake or frontend-only flow. Payment setup and order creation happen through the backend.

## 7. Payment Verification And Order Confirmation

After payment, the app brings the customer back into the experience and verifies the transaction before presenting success.

If payment is successful, the customer sees:

- a verified payment confirmation state
- the order reference
- amount paid
- delivery messaging
- purchased items
- delivery address
- notification status summary

If payment is not yet confirmed, the app shows a retry-friendly pending state instead of silently failing.

This is a strong business feature because it protects the merchant from false confirmations while still keeping the buyer informed.

## 8. Notifications After Purchase

The app supports customer communication after checkout.

When configured, it can send:

- order confirmation email through Resend
- order confirmation SMS through Twilio

This means the buyer of the app is not just purchasing a website. They are purchasing a workflow that can continue customer communication after the sale.

## 9. Admin Dashboard Experience

The admin area lives at `/admin` and is protected by Google sign-in plus an approved email allowlist.

This gives the business owner a cleaner and safer workflow than sharing a password.

Once signed in, the admin gets two core workspaces:

### Analytics

The analytics dashboard shows business performance at a glance, including:

- gross merchandise value
- verified orders
- conversion rate
- average order size
- revenue over time
- category demand
- delivery mix

This helps the owner understand what is selling, what is converting, and where demand is concentrating.

### Product Management

The product manager allows the admin to:

- view all products
- edit product details
- upload or replace product images
- add new products
- delete products

Editable fields include practical commerce data such as:

- name
- price
- category
- supplier
- origin
- MOQ
- lead time
- rating
- badge
- summary

This means the business can operate the catalog internally without needing a developer for every small update.

## 10. Real-Time Catalog Behavior

The catalog is wired to Supabase and listens for product and gallery changes.

In practical terms, that means:

- admin updates can appear in the storefront without rebuilding the whole site
- the store stays closer to live business data
- the platform is better suited for active operations than a static template

For a client, this is a strong upgrade path from traditional brochure websites.

## 11. Security And Reliability Features

The app includes several practical protections that matter in real deployments.

Built-in protections include:

- server-side checkout validation
- Paystack payment verification before success is confirmed
- webhook support for independent payment confirmation
- rate limiting on sensitive endpoints
- hardened security headers on checkout routes
- encrypted order storage support
- protected admin APIs
- Google-based admin authentication

Optional production defenses include:

- Redis-backed rate limiting
- Cloudflare Turnstile checkout CAPTCHA
- outbound security alerts for suspicious events

This is important for a buyer because it shows the platform was built with operational thinking, not just visual design.

## 12. Data And Storage Model

The app supports flexible storage depending on the deployment stage.

- Postgres can be used for production-grade order storage.
- SQLite can be used as a lightweight fallback for development or smaller setups.
- Supabase powers catalog data and admin authentication.

This gives a buyer room to start lean and grow into a stronger backend setup.

## 13. Brand Customization

The platform is not locked to one brand identity.

The marketing content is configurable through structured site configuration, and the product catalog is data-driven. That means a buyer can adapt the platform to:

- a furniture brand
- an appliance business
- a showroom-led retail business
- a hybrid online and offline sales operation

In short, this can be positioned as a branded commerce system, not just a one-off website.

## 14. Why A Buyer Would Want This App

A client buying this app is getting more than a homepage and a cart.

They are getting:

- a branded website
- a dedicated store experience
- secure payment handling
- customer order capture
- post-purchase notifications
- a protected admin system
- live catalog management
- performance analytics

That combination is useful for businesses that want to look premium, sell directly, and manage operations in one place.

## 15. Suggested Live Demo Script

If you are presenting the app to a client, this is a simple walkthrough order:

1. Start on the landing page and explain that it is the brand and trust-building layer.
2. Show the transition into `/store` and explain that the store is the dedicated buying environment.
3. Search for a product, open a product preview, and add an item to cart.
4. Open checkout and show the customer information capture plus order summary.
5. Explain the Paystack redirect and server-side verification flow.
6. Show the payment confirmation screen and point out delivery details and notification status.
7. Open `/admin`, explain the Google-only protected sign-in, and show the analytics dashboard.
8. Switch to product management and show how a product can be edited or added.
9. Close by explaining that the same system handles presentation, commerce, and operations.

## 16. Bottom-Line Positioning

The strongest way to describe this app to a buyer is:

“This is a branded commerce platform with a premium public website, a dedicated transactional store, secure checkout and payment verification, customer notifications, and a protected admin dashboard for analytics and product control.”

That framing makes it clear that the buyer is purchasing a business-ready platform, not just a theme.
