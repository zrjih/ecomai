# Ecomai Platform — Comprehensive Audit & Implementation Roadmap

> **Audit Date:** February 28, 2026
> **Scope:** Full codebase — 18 DB tables, 15 services, 17 route files, 14 repositories, 14 test files, 30+ frontend pages/components
> **Auditor approach:** Business-first thinking — what makes this a sellable, trustworthy, scalable SaaS product

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What's Done and Working Well](#2-whats-done-and-working-well)
3. [What's NOT Done — Critical Gaps](#3-whats-not-done--critical-gaps)
4. [Bugs Found (Categorized)](#4-bugs-found-categorized)
5. [Security Vulnerabilities](#5-security-vulnerabilities)
6. [Business Feature Gaps (Revenue Impact)](#6-business-feature-gaps-revenue-impact)
7. [UX & Flow Improvements](#7-ux--flow-improvements)
8. [New Features for All User Types](#8-new-features-for-all-user-types)
9. [Implementation Roadmap (6 Phases)](#9-implementation-roadmap-6-phases)
10. [Effort Estimation](#10-effort-estimation)

---

## 1. Executive Summary

### The Good
Ecomai has a **solid architectural foundation** — clean layered design (Routes → Services → Repositories → DB), proper multi-tenant scoping via JWT, Docker deployment, and an impressive 18-table PostgreSQL schema with UUIDs, JSONB, and CHECK constraints. The frontend has production-quality components (`UI.jsx` with 19+ reusable exports, WebsiteSettings with 15 tabs, 5 storefront templates). **The skeleton is excellent.**

### The Problem
The platform is **70% built** but the remaining 30% contains the features that **make or break** a real SaaS product:

- **Zero email capability** — no order confirmations, no password resets, no campaign sending
- **Zero input validation on routes** — `validateBody` middleware exists but is literally never wired to any endpoint
- **Payment security holes** — SSLCommerz callbacks have no signature verification (payment forgery possible)
- **No subscription billing** — plans exist in the DB but there's no enforcement, no metering, no recurring charges
- **No discount/coupon system** — the `discount_amount` column exists but there's no coupons table or logic
- **Tax = 0, Shipping = 0** — hardcoded everywhere
- **28 test cases total** — zero HTTP integration tests, zero frontend tests, zero E2E tests
- **Several repository UPDATE queries lack `shop_id` scoping** — potential cross-tenant data mutation

### Business Verdict
**Not production-ready.** With the fixes and features in this plan, it can be a **competitive MVP in 5-6 weeks** and a strong product in 10-12 weeks.

---

## 2. What's Done and Working Well

### ✅ Fully Implemented & Functional

| Feature | Quality | Notes |
|---------|---------|-------|
| Multi-tenant data isolation (JWT `shop_id`) | Good | Every query scoped, 4 role levels |
| Self-service shop registration | Good | Single TX: shop + owner + tokens + default settings |
| Subscription payment via SSLCommerz | Good | Full redirect + callback flow for plan purchase |
| Product CRUD with variants | Good | Slug uniqueness, JSONB attributes, SKU tracking |
| Product image upload + management | Good | Multer, primary selection, sort order |
| Category management + request workflow | Excellent | Hierarchical, customer requests, approve/reject |
| Order creation with inventory decrement | Good | Transactional with rollback |
| Manual payment recording | Basic | Works but doesn't update order.payment_status |
| Refund DB records | Partial | Creates record but no SSLCommerz API call |
| Delivery request lifecycle | Good | Create, assign, track GPS, status updates |
| Driver mobile API | Good | Login, assignments, location, status |
| Marketing campaign CRUD | Basic | Data storage only — zero execution |
| Website Settings customizer | Excellent | 15 tabs, 5 templates, live preview, CSS/JS custom |
| Storefront — Browse, Cart, Checkout | Good | Themed, responsive, SSLCommerz integration |
| Customer accounts (5 tabs) | Excellent | Orders, profile, addresses, security, dashboard |
| Admin dashboard + sidebar | Good | 14 admin pages, collapsible nav, role-aware |
| JWT auth with refresh token rotation | Good | 15m access / 7d refresh, rotation on use |
| Docker Compose deployment | Good | 4 containers, health checks, auto-migration |
| Reusable UI component library | Excellent | 19+ components, toast system, modals, pagination |

### Architecture Strengths
- Clean 3-layer separation (routes → services → repos)
- `asyncHandler` prevents unhandled promise rejections
- `DomainError` for business logic errors with HTTP status codes
- Transaction wrapper `db.withTransaction()` with auto-rollback
- Parameterized SQL everywhere — **zero SQL injection risk**
- Rate limiting on API (300/15min) and auth (20/15min)

---

## 3. What's NOT Done — Critical Gaps

### 3.1 Email System (ZERO email capability)
**Impact: Blocks 8+ features**

No email service exists anywhere. This blocks:
- Password reset / forgot password
- Order confirmation emails
- Shipping notification emails
- Customer welcome emails
- Email verification on registration
- Marketing campaign execution
- Low-stock alerts
- Admin notifications

### 3.2 Input Validation (Completely Missing)
**Impact: Every endpoint is vulnerable to malformed input**

`validateBody` middleware exists in `src/middleware/validate.js` but is **wired to zero routes**. Every POST and PATCH endpoint accepts raw `req.body` with no schema validation. This means:
- Checkout with empty items array
- Negative prices
- Empty required fields
- XSS payloads in text fields
- Arbitrarily long strings

### 3.3 Subscription Billing Engine
**Impact: No revenue from paid plans**

- `subscription_plans` table has 4 tiers (Free/Starter/Growth/Enterprise)
- `subscription_payments` table exists
- But: **no plan enforcement**, no metering, no usage bars, no upgrade/downgrade flow, no recurring billing, no plan expiry

### 3.4 Order State Machine
**Impact: Data integrity risk**

Orders can transition to any status from any state (e.g., `cancelled` → `shipped`). No defined state machine. No cancellation with inventory restore. No refund on cancel.

### 3.5 Audit Logging (Dead Table)
**Impact: Zero accountability for shop teams**

`audit_log` table exists in schema with proper columns but **nothing writes to it**. No service, no middleware, no hook.

### 3.6 Test Coverage
**Impact: Can't ship with confidence**

- 28 test cases across 14 files
- Zero HTTP/integration tests (routes + middleware untested)
- Zero frontend tests
- Zero E2E tests
- No coverage reporting

---

## 4. Bugs Found (Categorized)

### 🔴 Critical Bugs (Will cause real user failures)

| # | Location | Bug | Fix |
|---|----------|-----|-----|
| B1 | `src/services/product-images.js:3` | `DomainError` imported as module object, not destructured — every `throw new DomainError()` throws `TypeError` | Change to `const { DomainError } = require(...)` |
| B2 | `src/services/payments.js` | SSLCommerz callback validation catch block **trusts the callback anyway** — attacker can forge successful payments | Remove silent trust-on-failure; reject on validation error |
| B3 | `src/services/payments.js` | `createManualPayment` marks payment `completed` but **never updates `order.payment_status`** to `paid` | Add `UPDATE orders SET payment_status = 'paid'` in same TX |
| B4 | `src/routes/payments.js` | SSLCommerz callback routes have **zero signature/hash verification** | Implement SSLCommerz hash validation per their docs |
| B5 | `src/services/auth.js` | No `is_active` check on login — disabled/suspended users can authenticate | Add `if (!user.is_active) throw DomainError` |
| B6 | Frontend `OrderDetail.jsx` | `payments.list(id)` passes UUID string to function expecting params object — returns wrong data | Change to `payments.list({ order_id: id })` |
| B7 | `src/routes/register.js` | `GET /payment/status/:shopId` is **public with no auth** — leaks subscription status | Add auth or remove endpoint |

### 🟡 High Bugs (Will cause issues for some flows)

| # | Location | Bug | Fix |
|---|----------|-----|-----|
| B8 | `src/services/orders.js` | Non-variant product `stock_quantity` never decremented on sale — only variant inventory is decremented | Add product stock decrement path |
| B9 | `src/services/orders.js` | No stock validation before decrement — inventory can go **negative** | Check stock ≥ requested quantity before order |
| B10 | Repository layer | `updatePayment`, `updateCampaign`, `updateDeliveryRequest`, `updateCustomer` **have no `shop_id` in WHERE clause** — cross-tenant mutation possible | Add `AND shop_id = $N` to all UPDATE queries |
| B11 | `src/services/delivery-requests.js` | Uses `delivery_address` but schema column is `dropoff_address` — address may not be saved | Fix parameter name |
| B12 | `src/middleware/tenant.js` | Logic is inverted — middleware is effectively a **no-op** that never blocks anything | Fix conditional logic |
| B13 | `SignupSuccess.jsx` | JWT tokens passed via URL params — visible in browser history, referrer headers, server logs | Use POST body or httpOnly cookie instead |
| B14 | `StoreHome.jsx` | `homepage.featured_product_ids` from admin settings is never used — always shows first 8 products | Implement featured product filtering |
| B15 | Frontend | `auth.logout()` API is never called on sign-out — refresh token not revoked server-side | Call `auth.logout({ refreshToken })` on logout |

### 🟢 Low Bugs

| # | Location | Bug | Fix |
|---|----------|-----|-----|
| B16 | `src/store.js` | Dead file — `createId()` never imported anywhere | Delete file |
| B17 | `src/services/products.js` | `getProductBySlug` doesn't attach images like `getProduct` does | Add image fetching |
| B18 | Frontend `Dashboard.jsx` | Revenue calculated from last 5 orders only | Create server-side aggregation endpoint |
| B19 | `StoreProducts.jsx` | No pagination — all products loaded at once | Add server-side pagination |
| B20 | `CheckoutCancel.jsx` | Says "cart is saved" but cart was already cleared on checkout submit | Don't clear cart until payment confirmed |
| B21 | Tests `setup.js` | Teardown missing cleanup for `categories`, `category_requests`, `product_images` | Add cleanup |
| B22 | `Landing.jsx` | Footer links (Blog, Help Center, API Docs, Status, Tutorials) are all `#` | Create pages or remove links |

---

## 5. Security Vulnerabilities

### 🔴 Critical

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| S1 | JWT secret has insecure fallback `'dev-secret-change-me'` | `src/config.js` | Fail-fast if `JWT_SECRET` not set in production |
| S2 | CORS allows **all origins** | `src/app.js` | Whitelist `config.appUrl` + API consumers |
| S3 | SSLCommerz callbacks accept **any POST without signature verification** | `routes/payments.js`, `routes/register.js` | Validate hash per SSLCommerz docs |
| S4 | `validateBody` middleware exists but **wired to zero routes** | All 17 route files | Apply to every POST/PATCH endpoint |

### 🟡 High

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| S5 | Refresh tokens stored **in plaintext** | `services/auth.js` | Hash with SHA-256 before storage |
| S6 | CSP disabled via `contentSecurityPolicy: false` | `src/app.js` | Define proper CSP directives |
| S7 | `custom_js` in website settings = **stored XSS** | `services/website-settings.js` | Sanitize or sandbox; add CSP nonces |
| S8 | SVG uploads allowed — SVG can contain JS | `middleware/upload.js` | Remove `.svg` from allowed extensions or sanitize |
| S9 | `updateUser` doesn't whitelist allowed fields | `services/users.js` | Define explicit field allowlist |
| S10 | No rate-limiting on customer auth endpoints | `routes/public.js` | Apply auth rate limiter |
| S11 | Super admin `x-shop-id` header not validated | `middleware/auth.js` | Verify shop exists before accepting |

### 🟢 Medium

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| S12 | Auth tokens stored in `localStorage` (XSS risk) | `frontend/src/api.js` | Move refresh token to httpOnly cookie |
| S13 | No CSRF protection on form-based callbacks | SSLCommerz flows | Add CSRF tokens |
| S14 | No input sanitization (XSS in JSONB fields) | All services | Add html-escape/DOMPurify before storage |
| S15 | No account lockout after failed login attempts | `services/auth.js` | Track failures, lock after 5 attempts |
| S16 | No password complexity requirements | Registration flows | Enforce uppercase + number + 8+ chars |

---

## 6. Business Feature Gaps (Revenue Impact)

These are features that directly impact whether shops can make money and whether Ecomai can charge for its service.

### Tier 1 — Revenue Blockers (Must have for paid plans)

| # | Feature | Impact | Effort |
|---|---------|--------|--------|
| G1 | **Subscription plan enforcement** — no product/order limits enforced, no metering, no upgrade flow | Shops have no reason to pay | Large |
| G2 | **Tax calculation engine** — hardcoded to ₹0 | Shops can't comply with tax law | Medium |
| G3 | **Shipping cost calculation** — hardcoded to ₹0 | Shops lose money on every order | Medium |
| G4 | **Coupon/discount system** — `discount_amount` column unused | Shops can't run promotions | Medium |
| G5 | **Order confirmation emails** — zero transactional email capability | Customers don't trust the shop | Large |
| G6 | **Forgot password** — users locked out permanently | Critical UX failure | Medium |
| G7 | **Invoice/receipt generation** — no PDF, no receipt | B2B shops can't operate | Medium |

### Tier 2 — Competitive Parity (Must match Shopify-tier basics)

| # | Feature | Impact | Effort |
|---|---------|--------|--------|
| G8 | **Product reviews & ratings** — #1 conversion driver | Shops lose sales without social proof | Large |
| G9 | **Wishlist / Save for Later** — reduces cart abandonment | Lost re-engagement opportunities | Small |
| G10 | **Dashboard analytics with charts** — revenue trends, top products, customer growth | Admins fly blind | Large |
| G11 | **Product search (server-side)** — no full-text search | Customers can't find products | Medium |
| G12 | **Order filtering & search** — no status/date filters in admin | Admins drown in orders | Small |
| G13 | **Inventory management page** — API exists but no UI | Stock management impossible via UI | Medium |
| G14 | **Staff/user management page** — API exists but no admin UI (except super_admin `AllUsers`) | Shop teams can't manage their staff | Small |
| G15 | **Blog / Content pages** — zero SEO content capability | No organic traffic | Medium |

### Tier 3 — Differentiation (Makes Ecomai stand out)

| # | Feature | Impact | Effort |
|---|---------|--------|--------|
| G16 | **AI Website Builder** — LLM-driven theme/layout from industry + brand | Major competitive differentiation | Large |
| G17 | **Marketing campaign execution** — sending emails/SMS | Campaigns are data-only today | Large |
| G18 | **Webhook system** — external integrations | Enables ecosystem | Medium |
| G19 | **Custom domain support** — `shop.com` instead of `/store/slug` | Professional shops require this | Medium |
| G20 | **PWA support** — installable storefront | Mobile commerce shortcut | Small |
| G21 | **Multi-currency support** — USD, EUR, GBP etc. | International expansion | Medium |
| G22 | **Two-factor authentication** — for admin security | Enterprise requirement | Medium |

---

## 7. UX & Flow Improvements

### For Shop Admins

| # | Current Issue | Improvement |
|---|---------------|-------------|
| U1 | Dashboard shows last-5-order revenue only | Server-side aggregation with date-range picker, trend charts (Recharts) |
| U2 | Campaigns can be created but not edited or viewed in detail | Add campaign detail page with edit + status workflow |
| U3 | No variant editing — only create or delete | Add variant update form in ProductDetail |
| U4 | No driver assignment UI in Deliveries page | Add driver dropdown with available drivers |
| U5 | No order notes/internal comments | Add notes field to order detail |
| U6 | No bulk operations anywhere | Add checkbox selection + bulk status change, bulk delete, bulk export |
| U7 | No CSV import/export for products | Essential for shops migrating from other platforms |
| U8 | No notification system (bell icon) | Real-time: new order, low stock, new customer, payment received |
| U9 | No audit log page | Activity log: who did what, when (table exists, just unused) |
| U10 | Currency inconsistency (`$` vs `৳`) | Read currency from website_settings and use everywhere |

### For Customers (Storefront)

| # | Current Issue | Improvement |
|---|---------------|-------------|
| U11 | No product pagination — all products load at once | Server-side pagination with "Load More" or page nav |
| U12 | Newsletter subscribe button is non-functional | Wire to backend API (or Mailchimp/SendGrid list) |
| U13 | No coupon code field at cart/checkout | Add coupon input with real-time discount calculation |
| U14 | Shipping always shows "Free" | Display calculated shipping based on rules |
| U15 | No "Forgot Password" link on login | Add forgot/reset password flow |
| U16 | No product reviews/ratings | Star ratings on cards, review section on detail |
| U17 | No wishlist feature | Heart icon on products, wishlist page in account |
| U18 | No order cancellation request | Allow cancel for pre-shipped orders |
| U19 | No reorder / "Buy Again" button | Quick re-add items from past order to cart |
| U20 | Policy pages render as plain text | Support Markdown or rich text rendering |
| U21 | Mobile nav is horizontal scroll — no hamburger | Proper slide-out drawer menu |
| U22 | Out-of-stock variants can be added to cart | Disable add-to-cart when stock = 0 |
| U23 | Contact form / support tickets | Let customers reach the shop without WhatsApp |

### For Delivery Drivers

| # | Current Issue | Improvement |
|---|---------------|-------------|
| U24 | Driver API exists but **zero driver-facing UI** | Build responsive driver dashboard (assignments, map, status updates) |
| U25 | No push notifications for new assignments | Notify driver on assignment |
| U26 | No delivery route optimization | Show map with route between stops |

### For Super Admins (Platform level)

| # | Current Issue | Improvement |
|---|---------------|-------------|
| U27 | Platform dashboard iterates all shops client-side | Server-side platform analytics endpoint |
| U28 | Hard limit of 200 shops in dropdown | Paginated shop selector with search |
| U29 | No shop suspension enforcement | Middleware to block API access for suspended shops |
| U30 | No platform revenue reporting | MRR, churn, plan distribution, growth charts |

---

## 8. New Features for All User Types

### 8.1 For Shop Owners / Admins

| Feature | Description | Business Value |
|---------|-------------|----------------|
| **Smart Dashboard** | Revenue graphs, conversion funnel, top products, customer cohort analysis, low-stock alerts — all with date range picker | Data-driven decisions |
| **Coupon Builder** | Create fixed/percentage discounts, set min order, expiry, usage limits, auto-apply or code-based | Drive promotions & sales |
| **Shipping Rule Engine** | Flat rate, free-above-threshold, weight-based, zone-based | Accurate order profitability |
| **Tax Configuration** | Per-shop tax rate, per-category exceptions, tax-inclusive/exclusive pricing | Legal compliance |
| **Email Template Builder** | Drag-and-drop email templates for order confirmation, shipping updates, welcome, password reset | Brand-consistent communication |
| **Review Moderation Panel** | Approve/reject/respond to customer reviews with notification | Quality control |
| **Inventory Alerts** | Configurable low-stock thresholds with email/in-app notification | Prevent stockouts |
| **Audit Activity Log** | Who created/edited/deleted what, with timestamps and diffs | Team accountability |
| **CSV Import/Export** | Bulk import products from CSV, export orders/customers/products | Migration & reporting |
| **Rich Text Editor** | TipTap-powered editor for product descriptions, policies, email templates | Professional content |
| **Invoice Generator** | Auto-generate branded PDF invoices on payment capture | B2B requirement |
| **SEO Toolkit** | Sitemap.xml, robots.txt, JSON-LD structured data, product meta tags, Google preview | Organic traffic |
| **Blog/CMS** | Simple blog with categories, rich text, SEO fields | Content marketing |

### 8.2 For Customers (Shoppers)

| Feature | Description | Business Value |
|---------|-------------|----------------|
| **Product Reviews** | 1-5 star rating + text review, verified purchase badge | +15-25% conversion lift |
| **Wishlist** | Save products, get notified on price drops / back-in-stock | Re-engagement |
| **Smart Search** | PostgreSQL full-text search with autocomplete, category filters, sort options | Product discovery |
| **Order Tracking** | Visual timeline + email notifications at each stage | Trust & satisfaction |
| **Quick Reorder** | "Buy Again" button on past orders | Repeat purchases |
| **Coupon Application** | Enter promo code at cart/checkout, see instant discount | Higher AOV |
| **Saved Addresses** | Multiple shipping addresses with nicknames | Faster checkout |
| **Guest Checkout Config** | Configurable per shop — allow/disallow guest checkout | Conversion optimization |
| **Contact Form** | Submit support tickets directly from storefront | Customer support |
| **PWA Install Prompt** | "Add to Home Screen" for mobile shoppers | Mobile engagement |
| **Social Login** | Google/Facebook login for quick registration | Reduced friction |

### 8.3 For Delivery Drivers

| Feature | Description | Business Value |
|---------|-------------|----------------|
| **Driver Mobile Dashboard** | Responsive web app: active assignments, map view, one-tap status updates | Driver productivity |
| **Push Notifications** | Browser push for new delivery assignments | Faster response |
| **Route Overview** | Map with pickup/dropoff pins + distance | Delivery efficiency |
| **Proof of Delivery** | Photo capture + e-signature on delivery | Dispute prevention |
| **Earnings Tracker** | Daily/weekly delivery count and commission | Driver motivation |

### 8.4 For Platform (Super Admin)

| Feature | Description | Business Value |
|---------|-------------|----------------|
| **Platform Analytics** | MRR, ARR, churn rate, plan distribution, shop growth, revenue by plan | Business intelligence |
| **Shop Health Monitor** | Active/inactive shops, error rates, order volume, support tickets | Proactive support |
| **Feature Flag System** | Toggle features per shop/plan without deploys | Gradual rollouts |
| **Announcement System** | Platform-wide announcements to all shop admins | Communication |
| **Plan Usage Enforcement** | Block product creation above limit, show usage bars, upgrade prompts | Monetization |
| **Custom Domain Manager** | CNAME mapping, SSL provisioning per shop | Premium feature |

---

## 9. Implementation Roadmap (6 Phases)

### Phase 0 — Emergency Fixes (3-4 days)
> **Goal:** Fix anything that could cause data loss, security breaches, or runtime crashes

| Task | Files | Est. |
|------|-------|------|
| Fix `DomainError` import in `product-images.js` (B1) | 1 file | 5 min |
| Fix `is_active` check on login (B5) | `services/auth.js` | 15 min |
| Add `shop_id` to all unscoped UPDATE queries (B10) | 5 repo files | 2 hrs |
| Fix manual payment → order.payment_status update (B3) | `services/payments.js` | 30 min |
| Fix SSLCommerz callback validation — don't trust on failure (B2) | `services/payments.js`, `services/subscription-payments.js` | 1 hr |
| Fix tenant.js middleware logic inversion (B12) | `middleware/tenant.js` | 30 min |
| Secure `GET /register/payment/status/:shopId` (B7) | `routes/register.js` | 15 min |
| Fix `delivery_address` → `dropoff_address` mismatch (B11) | `services/delivery-requests.js` | 15 min |
| Fix frontend `payments.list(id)` → `payments.list({order_id: id})` (B6) | `OrderDetail.jsx` | 15 min |
| Fix frontend logout to call `auth.logout()` (B15) | `AuthContext.jsx` | 15 min |
| Non-variant product stock decrement (B8) | `services/orders.js` | 1 hr |
| Stock validation before order creation (B9) | `services/orders.js` | 1 hr |
| Lock down CORS to frontend URL (S2) | `src/app.js` | 15 min |
| Fail-fast if JWT_SECRET not set (S1) | `src/config.js` | 15 min |
| Remove `.svg` from upload allowed extensions (S8) | `middleware/upload.js` | 5 min |
| Fix `getProductBySlug` to include images (B17) | `services/products.js` | 30 min |
| **Total Phase 0** | | **~1.5 days** |

### Phase 1 — Security & Validation Foundation (1 week)
> **Goal:** Make the platform safe to expose to the internet

| Task | Files | Est. |
|------|-------|------|
| **Wire `validateBody` to ALL routes** — define schemas for every POST/PATCH | All 17 route files | 2 days |
| SSLCommerz hash/signature verification on all callbacks | `routes/payments.js`, `routes/register.js` | 4 hrs |
| Hash refresh tokens (SHA-256) before DB storage | `services/auth.js` | 3 hrs |
| Enable Content Security Policy in Helmet | `src/app.js` | 2 hrs |
| Sanitize `custom_css`/`custom_js` (CSP nonce or sandbox) | `services/website-settings.js`, storefront | 3 hrs |
| Add rate-limiting to customer auth endpoints | `routes/public.js` | 1 hr |
| Validate super admin `x-shop-id` against real shops | `middleware/auth.js` | 1 hr |
| Input sanitization layer (html-escape for text fields) | New middleware | 4 hrs |
| Whitelist fields in `updateUser` service | `services/users.js` | 1 hr |
| Password complexity requirements (8+ chars, mixed) | `services/auth.js`, `services/customers.js` | 1 hr |
| Account lockout after 5 failed login attempts | `services/auth.js` | 3 hrs |
| Add structured logging (Pino) | `src/app.js`, new logger module | 4 hrs |
| **Total Phase 1** | | **~5 days** |

### Phase 2 — Core Commerce Completeness (2 weeks)
> **Goal:** Make every shop capable of running a real business

| Task | Files | Est. |
|------|-------|------|
| **Email service** (Nodemailer + SMTP/SendGrid) | New `services/email.js` + templates | 2 days |
| **Forgot/reset password** (admin + customer) | `services/auth.js`, `services/customers.js`, `routes/auth.js`, `routes/public.js`, 2 frontend pages | 1.5 days |
| **Order state machine** — define valid transitions, enforce in service | `services/orders.js` | 4 hrs |
| **Order cancellation** with inventory restore | `services/orders.js` | 4 hrs |
| **Order confirmation emails** — auto-send on create, status change | Email service + order hooks | 1 day |
| **Coupon/discount system** — new `coupons` table, service, routes, admin UI, checkout integration | New table, service, route, 2 frontend pages | 3 days |
| **Tax configuration** — new `tax_rules` table, per-shop rates, checkout calculation | New table, service, order service update | 1.5 days |
| **Shipping rules** — new `shipping_rules` table, flat/free-above/weight-based, checkout calc | New table, service, order service update | 1.5 days |
| **Invoice PDF generation** — auto-generate on payment capture | New service (PDFKit or Puppeteer) | 1 day |
| **Subscription plan enforcement** — middleware checking product/order limits | New middleware, plan service | 1 day |
| **Delivery status → order status sync** (D2 bug) | `services/delivery-requests.js` | 2 hrs |
| Fix cart: don't clear until payment confirmed (B20) | `StoreCheckout.jsx`, `CheckoutCancel.jsx` | 2 hrs |
| Disable add-to-cart for out-of-stock variants (U22) | `StoreProductDetail.jsx` | 1 hr |
| **Total Phase 2** | | **~14 days** |

### Phase 3 — User Experience & Engagement (2 weeks)
> **Goal:** Features that increase conversion and retention

| Task | Files | Est. |
|------|-------|------|
| **Product reviews & ratings** — new table, backend CRUD, moderation, storefront display | New `reviews` table, service, routes, 3 frontend components | 3 days |
| **Wishlist** — new table, backend endpoints, storefront heart icon + page | New `wishlist_items` table, service, routes, 2 frontend components | 1.5 days |
| **Dashboard analytics** — server-side aggregation endpoints + Recharts charts | New analytics service, Dashboard.jsx rewrite | 3 days |
| **Product search (server-side)** — PostgreSQL `ILIKE`/`tsvector` + autocomplete | Product repo + public route + storefront search UI | 1.5 days |
| **Order filtering & search** — status/date range filters in admin | `Orders.jsx`, route params | 4 hrs |
| **Inventory management page** — stock levels, manual adjustments, movement history, low stock alerts | New `InventoryManagement.jsx` | 1.5 days |
| **Staff management page** — list/create/edit/deactivate staff, role assignment | New `StaffManagement.jsx` (for shop_admin) | 1 day |
| **Campaign detail & edit page** — view/edit campaign, status workflow | `CampaignDetail.jsx` | 1 day |
| **Variant editing** — update form in ProductDetail | `ProductDetail.jsx` update | 2 hrs |
| **Driver assignment UI** — dropdown in Deliveries page | `Deliveries.jsx` update | 3 hrs |
| **Storefront pagination** — server-side with "Load More" | `StoreProducts.jsx` update | 3 hrs |
| **Featured products** — honor admin settings `homepage.featured_product_ids` | `StoreHome.jsx` fix | 1 hr |
| **404 page** — catch-all route with styled component | New component + App.jsx | 1 hr |
| **Error boundary** — React Error Boundary wrapper | New component + App.jsx | 2 hrs |
| **Total Phase 3** | | **~14 days** |

### Phase 4 — Professional Polish (2 weeks)
> **Goal:** Make the platform look and feel premium

| Task | Files | Est. |
|------|-------|------|
| **Rich text editor** (TipTap) for product descriptions, policies | New component + integration in forms | 2 days |
| **SEO toolkit** — sitemap.xml, robots.txt, JSON-LD, OG tags, product meta fields | New routes + storefront head management | 2 days |
| **Blog/CMS** — new table, admin CRUD, storefront listing + detail | New `blog_posts` table, service, route, 3 pages | 2.5 days |
| **Audit log implementation** — middleware writes to `audit_log`, admin Activity Log page | New middleware, new admin page | 1.5 days |
| **Admin notification system** — new `notifications` table, bell icon, real-time (SSE) | New table, service, WebSocket/SSE, header component | 2 days |
| **Bulk operations** — checkbox selection + bulk status/delete/export | Multiple admin pages | 1.5 days |
| **CSV import/export** — products import, orders/customers/products export | New service, admin UI additions | 2 days |
| **Mobile navigation upgrade** — hamburger + slide-out drawer for storefront | `StorefrontLayout.jsx` rewrite | 4 hrs |
| **Responsive improvements** — sticky ATC on mobile, better table overflow, collapsible filters | Multiple components | 1 day |
| **Currency consistency** — read from settings, format everywhere via `formatPrice` | All price displays | 4 hrs |
| **Total Phase 4** | | **~14 days** |

### Phase 5 — Testing & Reliability (1.5 weeks)
> **Goal:** Ship with confidence

| Task | Files | Est. |
|------|-------|------|
| **HTTP integration tests** — Supertest for all 75+ endpoints | New test files | 3 days |
| **Tenant isolation tests** — verify Shop A can't access Shop B data | New test file | 1 day |
| **Frontend tests** — Vitest + React Testing Library for critical flows | New test files | 2 days |
| **E2E tests** — Playwright for registration, checkout, admin CRUD | New test directory | 2 days |
| **Coverage reporting** — c8 / Istanbul with min 80% threshold | Config + CI integration | 4 hrs |
| **Fix test setup teardown** — clean categories, product_images, category_requests | `tests/helpers/setup.js` | 1 hr |
| **CI/CD pipeline** — GitHub Actions: lint → test → build → deploy | `.github/workflows/` | 4 hrs |
| **Total Phase 5** | | **~8 days** |

### Phase 6 — Scale & Differentiate (Ongoing)
> **Goal:** Features that make Ecomai unique and competitive

| Task | Estimated Effort |
|------|-----------------|
| AI website builder (LLM-driven theme/layout generation) | 2 weeks |
| Marketing campaign execution (email + SMS sending) | 1.5 weeks |
| Custom domain support (CNAME mapping + SSL) | 1 week |
| Multi-currency support | 1 week |
| Webhook system (event pub/sub + delivery) | 1 week |
| Two-factor authentication (TOTP) | 3 days |
| PWA support (service worker, manifest, offline) | 3 days |
| Driver mobile dashboard | 1 week |
| Product recommendations engine | 1 week |
| Contact form / support tickets | 3 days |
| Social login (Google/Facebook) | 3 days |
| Platform analytics (MRR, churn, growth) | 1 week |
| Background job queue (BullMQ + Redis) | 3 days |
| Real-time delivery tracking (WebSocket) | 3 days |
| A/B testing framework | 1 week |
| Internationalization (i18n) | 1 week |

---

## 10. Effort Estimation

### Timeline Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 0 | 3-4 days | Emergency bug & security fixes |
| Phase 1 | 1 week | Security hardening & input validation |
| Phase 2 | 2 weeks | Core commerce (email, coupons, tax, shipping, billing) |
| Phase 3 | 2 weeks | UX & engagement (reviews, wishlist, analytics, search) |
| Phase 4 | 2 weeks | Polish (rich text, SEO, blog, audit log, bulk ops) |
| Phase 5 | 1.5 weeks | Testing & CI/CD |
| Phase 6 | Ongoing | Differentiation & scale features |

### Key Milestones

| Week | Milestone | What's Achievable |
|------|-----------|-------------------|
| Week 1 | **"Safe MVP"** | All critical bugs fixed, security hardened, input validation on all routes |
| Week 3 | **"Commerce Ready"** | Email working, password reset, coupons, tax, shipping, invoices, plan enforcement |
| Week 5 | **"Growth Ready"** | Reviews, wishlist, analytics dashboard, search, inventory page, blog |
| Week 7 | **"Premium Product"** | Rich text, SEO toolkit, bulk operations, audit log, notifications, full test suite |
| Week 8+ | **"Differentiated"** | AI builder, campaign execution, custom domains, multi-currency |

### Resource Requirements

| Resource | Purpose |
|----------|---------|
| 1 Full-stack developer | Core implementation (Phases 0-5) |
| 1 DevOps/Infra setup | CI/CD, Redis, S3, CDN (can be same person) |
| Email service account | SendGrid or AWS SES ($20-50/month) |
| Redis instance | Job queue, caching, session storage ($15-30/month) |
| S3/R2 bucket | File storage for product images, PDFs ($5-10/month) |
| OpenAI/Anthropic API key | AI website builder (Phase 6) |

### Database Schema Additions Needed

```
New tables to create:
├── coupons              (Phase 2 — discount codes)
├── tax_rules            (Phase 2 — per-shop tax config)
├── shipping_rules       (Phase 2 — shipping rate config)
├── reviews              (Phase 3 — product reviews & ratings)
├── wishlist_items       (Phase 3 — customer wishlists)
├── notifications        (Phase 4 — in-app notifications)
├── blog_posts           (Phase 4 — CMS/blog content)
├── support_tickets      (Phase 6 — customer support)
├── webhooks             (Phase 6 — external integrations)
├── password_reset_tokens (Phase 2 — secure password reset)
└── login_attempts       (Phase 1 — brute force tracking)

Existing tables to modify:
├── orders               (add order_number SERIAL, tracking_number TEXT)
├── products             (add seo JSONB, avg_rating NUMERIC, review_count INT)
├── shops                (add custom_domain TEXT, plan_expires_at TIMESTAMPTZ)
├── users                (add last_login_at, failed_login_count, locked_until)
└── delivery_requests    (add tracking_url TEXT, proof_of_delivery JSONB)
```

---

## Final Verdict

Ecomai has a **strong foundation** — the architecture, multi-tenancy, and component library are genuinely well-built. The gap is in the **"last mile" features** that turn a technical demo into a product businesses will pay for: email, billing enforcement, tax/shipping calculations, coupons, reviews, and proper input validation.

**With Phases 0-3 complete (~5 weeks), Ecomai becomes a viable, sellable MVP.**
**With all 6 phases (~10-12 weeks), it's a competitive alternative to Shopify for the Bangladesh/South Asian market.**

The biggest ROI investments are:
1. **Email service** (unlocks 8+ features)
2. **Coupon system** (direct revenue driver for shops)
3. **Subscription enforcement** (direct revenue for Ecomai)
4. **Product reviews** (proven 15-25% conversion lift)
5. **Input validation** (prevents every trivially-exploitable vulnerability)

---

*This audit was conducted by examining every file in the codebase: 18 DB tables, 15 service files, 17 route files, 14 repository files, 14 test files, 30+ frontend pages, 4 context providers, 2 API clients, and all middleware.*
