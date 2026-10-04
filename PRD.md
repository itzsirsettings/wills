> Historical pre-rebrand document retained for preservation. The active public website is Wills Group of Company (doors, gates, metalwork and interiors). Former business details are not current. See docs/REBRAND_DECISIONS.md for current scope and configuration.

# ThewworksICT E-Commerce Application - Product Requirements Document (PRD)

**Version**: 0.0.0  
**Last Updated**: 2026-05-01  
**Classification**: Business Confidential  
**Maintained by**: Development Team

---

## 1. Executive Summary

### 1.1 Product Overview

**Product Name**: ThewworksICT E-Commerce Platform  
**Type**: Full-stack E-commerce Web Application  
**Core Functionality**: Print services marketplace enabling customers to browse products, place orders via secure payment (Paystack), and receive email/SMS notifications. Includes admin dashboard for product and order management.  
**Target Users**: 
- B2C Customers seeking print services (promotional materials, branding)
- Business Admin/Operations team managing catalog and orders
- Suppliers listing products

### 1.2 Problem Statement

Customers need a reliable, secure platform to browse and purchase print services (business cards, branding materials, promotional items).  
The business needs to manage products, track orders, and process payments securely.

### 1.3 Solution Summary

Full-stack React/Express e-commerce application with:
- Product catalog with search/filter
- Secure Paystack payment integration
- Email (Resend) and SMS (Twilio) notifications
- Admin dashboard with analytics
- Supabase-backed data persistence
- Enterprise-grade security (encryption, rate limiting, CSRF protection)

---

## 2. Technical Architecture

### 2.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                              │
│  React 19 + TypeScript + Vite + Tailwind CSS + Radix UI        │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────────┐
│                     SERVER (Node.js/Express)                   │
│  - REST API                                                   │
│  - Security (Helmet, CSRF, Rate Limiting)                    │
│  - Payment Webhook Handler                                   │
└──────┬──────────────────────────────────────┬───────────────┘
       │                                      │
  ┌────▼────┐                    ┌───────────▼───────────┐
  │Supabase │                    │   External Services    │
  │(PostgreS│                    │  - Paystack (payments) │
  │QL + Au │                    │  - Resend (email)      │
  │th + St │                    │  - Twilio (SMS)      │
  │orage) │                    │  - Redis (rate limit)│
  └────────┘                    └──────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend Framework | React | 19.2.0 |
| Build Tool | Vite | 7.3.2 |
| Language | TypeScript | ~5.9.3 |
| Styling | Tailwind CSS | 3.4.19 |
| UI Components | Radix UI | 1.x |
| State Management | Zustand | 5.0.12 |
| Form Handling | React Hook Form + Zod | 7.70.0 / 4.3.5 |
| Backend Framework | Express | 5.2.1 |
| Database | PostgreSQL (via Supabase) | - |
| Authentication | Supabase Auth | - |
| Payments | Paystack | - |
| Email | Resend | 6.12.2 |
| SMS | Twilio | 6.0.0 |
| Security | Helmet | 8.1.0 |
| Testing | Vitest / Playwright | 4.1.5 / 1.59.1 |

### 2.3 Database Schema

#### Core Tables

```sql
-- Product Categories
CREATE TABLE categories (
  name TEXT PRIMARY KEY,
  caption TEXT NOT NULL,
  sku_count TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- Suppliers
CREATE TABLE suppliers (
  name TEXT PRIMARY KEY,
  specialty TEXT NOT NULL,
  score TEXT NOT NULL,
  fulfillment TEXT NOT NULL,
  markets TEXT NOT NULL
);

-- Products
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  supplier TEXT NOT NULL,
  origin TEXT NOT NULL,
  moq TEXT NOT NULL,
  lead_time TEXT NOT NULL,
  rating DOUBLE PRECISION NOT NULL,
  orders TEXT NOT NULL,
  badge TEXT NOT NULL,
  summary TEXT NOT NULL
);

-- Product Galleries
CREATE TABLE product_galleries (
  id TEXT PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image TEXT NOT NULL,
  title TEXT NOT NULL,
  caption TEXT NOT NULL,
  object_position TEXT NOT NULL,
  image_transform TEXT NOT NULL
);

-- Product Tags
CREATE TABLE product_tags (
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (product_id, tag)
);

-- Orders (Encrypted PII)
CREATE TABLE orders (
  reference TEXT PRIMARY KEY,
  receipt_token_hash TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  amount_in_kobo INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  customer_full_name TEXT NOT NULL,  -- Encrypted
  customer_email TEXT NOT NULL,       -- Encrypted
  customer_phone TEXT NOT NULL,      -- Encrypted
  customer_address TEXT NOT NULL,     -- Encrypted
  customer_city TEXT NOT NULL,        -- Encrypted
  customer_state TEXT NOT NULL,        -- Encrypted
  customer_notes TEXT NOT NULL,        -- Encrypted
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  payment_channel TEXT,
  paystack_transaction_id TEXT,
  delivery_message TEXT NOT NULL,
  notification_email_status TEXT NOT NULL,
  notification_sms_status TEXT NOT NULL
);

-- Order Items
CREATE TABLE order_items (
  order_reference TEXT NOT NULL REFERENCES orders(reference) ON DELETE CASCADE,
  item_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  quantity INTEGER NOT NULL,
  image TEXT NOT NULL,
  PRIMARY KEY (order_reference, item_id)
);
```

#### Indexes

```sql
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_reference ON order_items(order_reference);
```

### 2.4 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/admin/me | Admin | Get current admin |
| GET | /api/health | Public | Health check |
| GET | /api/security/csrf-token | Public | Get CSRF token |
| POST | /api/checkout/initialize | Public | Initialize checkout |
| GET | /api/checkout/verify/:reference | Public | Verify payment |
|
### 2.5 Security Architecture

| Layer | Implementation |
|-------|---------------|
| Data at Rest | AES-256-GCM encryption for PII (name, email, phone, address) |
| Key Derivation | HKDF-SHA256 with application-specific salt |
| Token Security | HMAC-SHA256 with timing-safe comparison |
| API Security | Zod input validation, rate limiting |
| CSRF Protection | Double-submit cookie pattern |
| Payment Verification | Paystack signature validation |
| HTTPS | HSTS (1 year max-age in production) |
| Headers | Helmet.js with CSP, X-Frame-Options, etc. |
| Rate Limiting | Redis-backed with in-memory fallback |

---

## 3. Functional Requirements

### 3.1 Customer Features

#### F1: Product Catalog Browse
- **Description**: Users can browse available print products organized by categories
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - [ ] Products display with name, price, image, rating
  - [ ] Category filtering works
  - [ ] Search functionality returns relevant results
  - [ ] Product detail view shows gallery images

#### F2: Shopping Cart
- **Description**: Users can add products to cart and modify quantities
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - [ ] Add to cart increments quantity for existing items
  - [ ] Cart persists across page navigation
  - [ ] Cart displays total price accurately
  - [ ] Remove item functionality works

#### F3: Secure Checkout
- **Description**: Users complete purchase via Paystack payment
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - [ ] Customer details validated (name, email, phone, address)
  - [ ] Paystack payment initializes correctly
  - [ ] Redirect to Paystack checkout page
  - [ ] Payment verification handles success/failure states
  - [ ] Receipt token prevents order manipulation

#### F4: Order Notifications
- **Description**: Users receive order confirmation via email/SMS
- **Priority**: P1 (High)
- **Acceptance Criteria**:
  - [ ] Email sent on successful payment (Resend)
  - [ ] SMS sent on successful payment (Twilio)
  - [ ] Notification status tracked in database

### 3.2 Admin Features

#### F5: Admin Authentication
- **Description**: Only authorized users can access admin dashboard
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - [ ] Supabase authentication required
  - [ ] Email whitelist enforced (ADMIN_EMAILS)
  - [ ] Unauthorized access returns 403

#### F6: Dashboard Analytics
- **Description**: Admin views sales and order metrics
- **Priority**: P1 (High)
- **Acceptance Criteria**:
  - [ ] Total orders count displayed
  - [ ] Revenue calculations accurate
  - [ ] Recent orders list loads
  - [ ] Order status breakdown shown

#### F7: Product Management
- **Description**: Admin can CRUD products
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - [ ] Create new product with image upload
  - [ ] Update existing product details
  - [ ] Delete product removes from catalog
  - [ ] List view with pagination

### 3.3 Security Features

#### F8: Data Encryption
- **Description**: Customer PII encrypted at rest
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - [ ] Customer name encrypted in database
  - [ ] Customer email encrypted in database
  - [ ] Customer phone encrypted in database
  - [ ] Customer address encrypted in database

#### F9: Payment Fraud Prevention
- **Description**: Prevent payment manipulation
- **Priority**: P0 (Critical)
- **Acceptance Criteria**:
  - [ ] Paystack webhook signature verified
  - [ ] Amount verified before order finalization
  - [ ] Receipt token required for verification

#### F10: Rate Limiting
- **Description**: Prevent API abuse
- **Priority**: P1 (High)
- **Acceptance Criteria**:
  - [ ] Checkout initialize: 10 requests/10 min per IP
  - [ ] Checkout verify: 30 requests/10 min per IP
  - [ ] Admin API: 100 requests/15 min per IP
  - [ ] Rate limited requests return 429

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| API Response (p95) | < 200ms | APM |
| Checkout Completion | < 30s | User testing |

### 4.2 Scalability

| Component | Capacity |
|-----------|----------|
| Concurrent Users | 100+ |
| Database Connections | 10 (configurable to 50) |
| Rate Limit Store | Redis or in-memory |

### 4.3 Reliability

| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| Error Rate | < 0.1% |
| Recovery Time | < 5 min |

### 4.4 Security Compliance

| Control | Implementation |
|---------|---------------|
| Data Encryption | AES-256-GCM for PII |
| Key Management | HKDF-derived keys |
| HTTPS | HSTS (production) |
| SQL Injection | Parameterized queries |
| XSS | Content Security Policy |
| CSRF | Token validation |
| Payment PCI | Paystack handling |

---

## 5. UI/UX Specification

### 5.1 Design System

**Color Palette**:
- Primary: [Configured in Tailwind]
- Secondary: [Configured in Tailwind]
- Accent: [Brand colors]

**Typography**:
- Headings: [Font configurations]
- Body: [Font configurations]

**Components** (Radix UI primitives):
- Dialog, Dropdown, Select, Tabs, Toast, etc.

### 5.2 Responsive Breakpoints

| Breakpoint | Width | Target |
|-----------|-------|--------|
| Mobile | < 640px | phones |
| Tablet | 640px - 1024px | tablets |
| Desktop | > 1024px | desktops |

---

## 6. Integrations

### 6.1 External Services

| Service | Purpose | Configuration |
|--------|---------|---------------|
| Paystack | Payment processing | PAYSTACK_SECRET_KEY |
| Supabase | Database, Auth, Storage | VITE_SUPABASE_URL, keys |
| Resend | Email delivery | RESEND_API_KEY |
| Twilio | SMS delivery | TWILIO_ACCOUNT_SID, AUTH_TOKEN |
| Redis | Rate limiting (optional) | REDIS_URL |

### 6.2 Environment Variables

```bash
# Required
PAYSTACK_SECRET_KEY=sk_xxx
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Security (generate: openssl rand -base64 32)
ORDER_STORE_ENCRYPTION_KEY=xxx
ORDER_TOKEN_SECRET=xxx
CSRF_SECRET=xxx  # minimum 32 chars

# Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stankings
DATABASE_SSL_MODE=require
ADMIN_EMAILS=admin@example.com

# Optional Services
REDIS_URL=redis://localhost:6379
RESEND_API_KEY=re_xxx
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx

# Security Alerts
SECURITY_ALERT_WEBHOOK_URL=https://...  # Discord/Slack
```

---

## 7. Deployment

### 7.1 Environments

| Environment | URL | Database | Features |
|-------------|-----|----------|----------|
| Development | localhost:5173 | Local/Supabase dev | Debug logging |
| Staging | staging.example.com | Supabase staging | Full logging |
| Production | example.com | Supabase prod | Security alerts |

### 7.2 Build & Deploy

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
npm run start # Server on port 3001

# Security audit
npm run security:audit
```

---

## 8. Testing

### 8.1 Test Coverage

| Test Type | Tool | Coverage Target |
|----------|------|-----------------|
| Unit Tests | Vitest | Core business logic |
| API Tests | Vitest + Supertest | Endpoint coverage |
| E2E Tests | Playwright | Critical user flows |

### 8.2 Test Commands

```bash
npm run test           # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
npm run test:api      # API tests
npm run test:e2e     # E2E tests
```

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Payment fraud | Low | High | Receipt token + signature verification |
| Data breach | Low | Critical | AES-256-GCM encryption |
| API abuse | Medium | Medium | Rate limiting |
| DDoS | Medium | High | WAF + rate limiting |
| Dependency vulnerability | Medium | Medium | npm audit + updates |

---

## 10. Milestones & Timeline

| Milestone | Description | Target |
|----------|-------------|--------|
| M1 | Core e-commerce functionality | Complete |
| M2 | Admin dashboard | Complete |
| M3 | Security hardening | Complete |
| M4 | Production deployment | In Progress |

---

## 11. Appendices

### A. Security Posture Summary

- ✅ SQL Injection: Protected (parameterized queries)
- ✅ XSS: Protected (CSP + sanitization)
- ✅ CSRF: Protected (token validation)
- ✅ Clickjacking: Protected (X-Frame-Options: DENY)
- ✅ MITM: Protected (HSTS in production)
- ✅ DDoS: Protected (rate limiting + WAF recommended)
- ✅ Payment Fraud: Protected (signature verification)
- ✅ Data Breach: Protected (encryption at rest)
- ✅ Dependency Vulnerabilities: Monitored via npm audit

### B. Auto-Update Instructions

This PRD regenerates automatically when code changes are committed. To update:

```bash
# 1. Make code changes
git add .
git commit -m "description"

# 2. Before push, regenerate PRD
# (Manual: Review this document and update versions above)

# 3. Version updates happen via package.json tags
git tag v0.0.X
git push --tags
```

### C. Revision History

| Date | Version | Changes | Author |
|------|--------|---------|--------|
| 2026-04-28 | 0.0.0 | Initial PRD | Development Team |

---

*This document is maintained as part of the codebase. Last generated: 2026-04-28*