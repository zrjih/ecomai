# Ecomai Platform — Comprehensive Improvement Plan

> Full audit of Backend (18 tables, 13 services, 15 route files), Admin Dashboard (16 pages), and Storefront (12 pages + contexts) completed.

---

## Table of Contents
1. [Critical Bugs (Fix Immediately)](#1-critical-bugs-fix-immediately)
2. [Phase 1 — Foundation Fixes (Week 1)](#2-phase-1--foundation-fixes-week-1)
3. [Phase 2 — Core Commerce Features (Week 2-3)](#3-phase-2--core-commerce-features-week-2-3)
4. [Phase 3 — Growth & Engagement (Week 3-4)](#4-phase-3--growth--engagement-week-3-4)
5. [Phase 4 — Professional Polish (Week 4-5)](#5-phase-4--professional-polish-week-4-5)
6. [Phase 5 — Scale & Differentiate (Week 5+)](#6-phase-5--scale--differentiate-week-5)
7. [Feature Matrix: Admin vs Customer](#7-feature-matrix)
8. [Full Bug List](#8-full-bug-list)

---

## 1. Critical Bugs (Fix Immediately)

These are bugs that will cause real problems for any live user. **Fix before anything else.**

| # | Severity | Where | Bug | Fix |
|---|----------|-------|-----|-----|
| 1 | 🔴 HIGH | `src/services/products.js` | `deleteProduct` passes only `productId` to repo — missing `shopId`. Could error or cross-tenant delete. | Pass `(shopId, productId)` to repo |
| 2 | 🔴 HIGH | `src/services/users.js` | `listUsers` returns `password_hash` to API clients | Strip `password_hash` from returned rows |
| 3 | 🔴 HIGH | `src/services/auth.js` | No `is_active` check on login — disabled users can still authenticate | Add `WHERE is_active = true` or check after query |
| 4 | 🔴 HIGH | `CartContext.jsx` | Cart is pure in-memory `useState` — page refresh loses entire cart | Persist to `localStorage` with shop-scoped key |
| 5 | 🔴 HIGH | `StoreAccount.jsx` | `useState` inside render functions (`renderProfile`, etc.) — React hooks violation | Extract into proper sub-components |
| 6 | 🟡 MED | `src/services/shops.js` | `createShop` passes `owner_id` but repo expects `owner_user_id` — owner never saved | Fix parameter name |
| 7 | 🟡 MED | `src/services/orders.js` | Non-variant product `stock_quantity` never decremented on sale | Add product stock decrement path |
| 8 | 🟡 MED | `db/schema.sql` | `products` table references `categories(id)` before `categories` table is created | Reorder table definitions |
| 9 | 🟡 MED | `ShopSettings.jsx` | Calls `shops.update(shop.id, data)` which doesn't exist in API client | Add `shops.update` or fix to use `shops.updateMe` |
| 10 | 🟡 MED | Checkout success/fail/cancel pages | Hardcoded Tailwind colors — ignores shop theme | Apply theme tokens like other pages |
| 11 | 🟡 MED | `CheckoutCancel.jsx` | Says "Your cart is still saved" but cart was already cleared | Don't clear cart until payment confirmed |
| 12 | 🟡 MED | `StoreProductDetail.jsx` | Out-of-stock variants can still be added to cart | Disable add-to-cart when stock = 0 |
| 13 | 🟠 LOW | `Dashboard.jsx` | "Total Revenue" is calculated from last 5 orders only — misleading | Create proper aggregation endpoint |
| 14 | 🟠 LOW | `Customers.jsx` / `Payments.jsx` | Stats calculated from current page only (max 20), not full dataset | Return aggregates from API |
| 15 | 🟠 LOW | Currency | `$` on PDP/cart but `৳` on checkout — inconsistent | Use shop currency setting everywhere |
| 16 | 🟠 LOW | Storefront templates | Dynamic Tailwind classes (`grid-cols-${n}`) won't survive build purge | Use safelist or static class map |

---

## 2. Phase 1 — Foundation Fixes (Week 1)
> Goal: Make the existing platform solid and trustworthy

### 2.1 Cart Persistence (CRITICAL)
- **What**: Save cart to `localStorage` keyed by `cart_{shopSlug}`. Restore on page load.
- **Why**: Currently refreshing the page erases the entire cart. This is the #1 deal-breaker.
- **Where**: `CartContext.jsx`

### 2.2 Product Image Upload
- **What**: 
  - Add `multer` for file upload middleware
  - Store images locally in `/uploads` (or S3 later)
  - Support multiple images per product (add `product_images` table)
  - Show real images on storefront product cards, detail, cart
- **Why**: Emoji placeholders make the platform look like a prototype. No shop owner will use this without real images.
- **Where**: New DB table, new upload route, update product service/routes, update all storefront components

### 2.3 Fix All Critical Bugs (items 1-5 from above)
- Fix `deleteProduct` shopId parameter
- Strip `password_hash` from user list responses
- Add `is_active` check on auth login
- Fix `StoreAccount.jsx` hooks violation
- Fix `createShop` owner parameter name

### 2.4 Currency Consistency
- **What**: Read currency from `website_settings` (add `currency` field if missing). Use it everywhere.
- **Why**: `$` vs `৳` confusion makes the platform look broken.

### 2.5 Fix Schema Ordering
- Reorder `db/schema.sql` so `categories` is created before `products`

---

## 3. Phase 2 — Core Commerce Features (Week 2-3)
> Goal: Feature parity with basic Shopify stores

### 3.1 Forgot Password / Reset Password
- **For Admin Users**: Add `/v1/auth/forgot-password` and `/v1/auth/reset-password` routes
- **For Customers**: Add `/v1/public/shops/:slug/auth/forgot-password` and `/reset-password`
- **Frontend**: Add "Forgot password?" links on both login pages
- **Backend**: Generate time-limited token, send via email (requires email integration)
- **Where**: auth service, customer service, email service (new), login pages

### 3.2 Email Integration (Foundation)
- **What**: Add email sending capability using Nodemailer + SMTP (or SendGrid/Resend)
- **Config**: Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` to env
- **New service**: `src/services/email.js` — templates for: order confirmation, password reset, welcome email, shipping update
- **Why**: Enables password reset, order notifications, marketing campaigns

### 3.3 Coupon / Discount Codes
- **DB**: New `coupons` table (code, type: percentage/fixed, value, min_order, max_uses, used_count, valid_from, valid_until, shop_id)
- **Backend**: New coupon service + routes (CRUD for admin, validate for customer)
- **Admin UI**: New Coupons page (create, list, toggle active/inactive, usage stats)
- **Storefront**: Coupon input field on cart + checkout pages, real-time discount calculation
- **Why**: Every e-commerce platform needs this for promotions

### 3.4 Product Pagination (Storefront)
- **What**: Server-side pagination for public products endpoint (limit/offset params)
- **Storefront**: Add "Load More" or page navigation on `StoreProducts.jsx`
- **Why**: Currently loads ALL products at once — breaks with 100+ products

### 3.5 Product Search (Server-side)
- **What**: Full-text search endpoint using PostgreSQL `tsvector` / `ILIKE` with proper indexing
- **Storefront**: Search bar in header with results dropdown, dedicated search results page
- **Admin**: Improve existing search with debounce and server-side filtering

### 3.6 Shipping & Tax Configuration
- **DB**: New `shipping_rules` table (name, type: flat/free/weight-based, amount, min_order_for_free, shop_id)
- **DB**: New `tax_rules` table (name, rate_percent, applies_to: all/category, shop_id)
- **Backend**: Calculate shipping + tax during checkout
- **Admin UI**: New Shipping & Tax settings section
- **Storefront**: Show real shipping cost and tax on cart/checkout

### 3.7 Order Email Notifications
- **What**: Auto-send emails on: order placed, order confirmed, order shipped, order delivered
- **Admin**: Toggle per notification type in settings
- **Templates**: Professional HTML email templates with shop branding

### 3.8 Customer Detail Page (Admin)
- **What**: Click on customer → see profile, order history, total spent, notes
- **Admin UI**: New `CustomerDetail.jsx` page
- **Routes**: GET `/v1/customers/:id` (with orders included)

---

## 4. Phase 3 — Growth & Engagement (Week 3-4)
> Goal: Features that help shops grow and keep customers coming back

### 4.1 Product Reviews & Ratings
- **DB**: New `reviews` table (product_id, customer_id, shop_id, rating 1-5, title, body, is_verified_purchase, status: pending/approved/rejected)
- **Backend**: CRUD + moderation endpoints
- **Admin UI**: Review management page (approve/reject/respond)
- **Storefront**: Star ratings on product cards, review section on product detail, "Write a Review" for logged-in purchasers
- **Impact**: Social proof is the #1 conversion driver

### 4.2 Wishlist / Save for Later
- **DB**: New `wishlist_items` table (customer_id, product_id, shop_id)
- **Backend**: Add/remove/list wishlist endpoints
- **Storefront**: Heart icon on product cards, dedicated wishlist page under account
- **Impact**: Reduces cart abandonment, enables "back in stock" notifications later

### 4.3 Dashboard Analytics (Admin)
- **Backend**: New aggregation endpoints:
  - Revenue over time (daily/weekly/monthly)
  - Top selling products (by quantity, by revenue)
  - Customer acquisition over time
  - Order status distribution
  - Low stock alerts
- **Admin UI**: Charts using Chart.js or Recharts
  - Revenue line/bar chart with date range picker
  - Top products table
  - Order funnel visualization
  - Low stock warning cards
- **Impact**: Shop owners need data to make decisions

### 4.4 Inventory Management Page (Admin)
- **What**: Dedicated admin page for inventory (API already exists, no UI)
- **Features**: Stock levels per product/variant, manual adjustment form, movement history log, low stock alerts filter, bulk stock update
- **Impact**: Currently no way to view/manage stock from admin panel

### 4.5 User/Staff Management Page (Admin)
- **What**: Dedicated admin page for managing staff users (API exists, no UI)
- **Features**: List users, invite new staff, assign roles (admin/staff/driver), deactivate users
- **Backend**: Add missing routes: PATCH `/v1/users/:id`, DELETE `/v1/users/:id`
- **Impact**: Multi-user shops can't manage their team

### 4.6 Category Landing Pages (Storefront)
- **What**: `/store/:slug/categories/:categorySlug` pages with filtered products
- **Features**: Category header, description, product grid with pagination, breadcrumbs
- **Impact**: Better browsing experience and SEO

### 4.7 Mobile Navigation Upgrade
- **What**: Replace horizontal scroll nav with proper hamburger menu + slide-out drawer
- **Features**: Hamburger icon, animated slide-in menu, category tree, search bar, account/cart links
- **Impact**: Current mobile nav is unconventional and awkward

### 4.8 Order Management Improvements
- **Admin**: 
  - Order search + filtering (by status, date range, customer)
  - Order notes/internal comments
  - Print invoice / packing slip
  - Shipping tracking number field
  - Order timeline / activity log
- **Storefront**:
  - Order cancellation request
  - "Buy Again" / reorder button
  - Order tracking with status updates

---

## 5. Phase 4 — Professional Polish (Week 4-5)
> Goal: Make the platform look and feel premium

### 5.1 Rich Text Editor
- **What**: Add TipTap or ReactQuill for product descriptions and policy pages
- **Where**: Product create/edit, website settings policy tab
- **Impact**: Plain text descriptions look unprofessional

### 5.2 SEO Improvements
- **Backend**: 
  - Sitemap.xml generation endpoint
  - robots.txt endpoint
  - JSON-LD structured data for products (schema.org/Product)
  - Open Graph meta tags
- **Storefront**: 
  - Per-product SEO fields (meta title, meta description)
  - Dynamic page titles (`document.title`)
  - Canonical URLs
- **Impact**: Critical for organic traffic

### 5.3 Proper Logo & Favicon Support
- **What**: Upload shop logo and favicon through admin settings
- **Where**: Website settings, storefront header, browser tab
- **Impact**: Text-only shop name in header looks amateur

### 5.4 Responsive Improvements
- **Storefront**: 
  - Sticky "Add to Cart" bar on mobile product detail
  - Bottom navigation bar for mobile (Home, Search, Cart, Account)
  - Pull-to-refresh on product lists
  - Better touch interactions
- **Admin**: 
  - Better mobile table overflow handling
  - Collapsible filter panels

### 5.5 Admin Notification System
- **What**: Bell icon in admin sidebar with real-time notifications
- **Types**: New order, low stock alert, new customer, payment received, new review
- **DB**: New `notifications` table
- **Impact**: Shop owners need real-time awareness

### 5.6 Bulk Operations (Admin)
- **Products**: Bulk delete, bulk status change, bulk category assign
- **Orders**: Bulk status update, bulk export
- **Customers**: Bulk export
- **Implementation**: Checkbox column + action toolbar

### 5.7 CSV Import/Export
- **Products**: Import products from CSV, export product catalog
- **Orders**: Export orders to CSV/Excel
- **Customers**: Export customer list
- **Impact**: Essential for shops migrating from other platforms

### 5.8 Audit Log Implementation
- **What**: Actually populate the `audit_log` table (already exists in schema)
- **Track**: Product changes, order status changes, settings changes, user actions
- **Admin UI**: Activity log page showing who did what and when
- **Impact**: Accountability and debugging for shop teams

---

## 6. Phase 5 — Scale & Differentiate (Week 5+)
> Goal: Features that make Ecomai special and competitive

### 6.1 Subscription Plan Enforcement
- **What**: Actually check plan limits when creating products/orders
- **Backend**: Middleware that verifies `current_count < plan.limit` for product_limit, order_limit
- **Admin UI**: Usage bars showing "50/100 products used"
- **Billing**: Plan upgrade flow with payment

### 6.2 Multi-Currency Support
- **What**: Per-shop currency setting (BDT, USD, EUR, etc.)
- **Implementation**: Store currency code in shop/settings, format all prices with Intl.NumberFormat
- **Impact**: Makes platform usable internationally

### 6.3 Custom Domain Support
- **What**: Allow shops to use their own domain instead of `/store/slug`
- **Backend**: Domain → shop_id mapping table
- **Impact**: Professional shops need their own domain

### 6.4 Marketing Campaign Execution
- **What**: Actually send email/SMS campaigns (currently data-only)
- **Email**: Use the email service from Phase 2
- **SMS**: Integrate with BulkSMS/Twilio for Bangladesh market
- **Scheduling**: Cron-based campaign scheduler
- **Analytics**: Open rates, click tracking

### 6.5 Blog / Content Pages
- **What**: Simple CMS for shop blog posts
- **DB**: New `blog_posts` table
- **Admin**: Blog post CRUD with rich text editor
- **Storefront**: Blog listing + detail pages
- **Impact**: Huge for SEO

### 6.6 Two-Factor Authentication
- **What**: TOTP-based 2FA for admin users
- **Implementation**: QR code setup, backup codes, verify on login
- **Impact**: Security for shops handling real money

### 6.7 Webhooks System
- **What**: Allow shops to register webhook URLs for events
- **Events**: order.created, payment.received, customer.registered, etc.
- **Impact**: Enables third-party integrations

### 6.8 PWA Support (Storefront)
- **What**: Make storefront installable as mobile app
- **Implementation**: Service worker, manifest.json, offline page
- **Impact**: Mobile commerce shortcut, push notifications

### 6.9 Product Recommendations
- **What**: "Customers who bought X also bought Y" engine
- **Implementation**: Simple co-purchase analysis from order data
- **Storefront**: "You May Also Like" section on product detail and cart

### 6.10 Contact Form / Support System
- **What**: Contact form for customers → admin inbox
- **DB**: New `support_tickets` table
- **Admin**: Support ticket management page
- **Storefront**: Contact page with form
- **Impact**: Reduces WhatsApp-only support dependency

---

## 7. Feature Matrix

### Shop Admin Features

| Feature | Status | Phase |
|---------|--------|-------|
| Product CRUD | ✅ Done | — |
| Product Images | ❌ Missing | Phase 1 |
| Product Variants | ✅ Done | — |
| Product Import/Export | ❌ Missing | Phase 4 |
| Bulk Product Operations | ❌ Missing | Phase 4 |
| Order Management | ✅ Basic | — |
| Order Search/Filter | ❌ Missing | Phase 3 |
| Order Notes | ❌ Missing | Phase 3 |
| Invoice/Packing Slip | ❌ Missing | Phase 3 |
| Order Email Notifications | ❌ Missing | Phase 2 |
| Customer List | ✅ Done | — |
| Customer Detail Page | ❌ Missing | Phase 2 |
| Customer Segmentation | ❌ Missing | Phase 5 |
| Payment Dashboard | ✅ Basic | — |
| Refund Processing | ⚠️ DB Only (no SSLCommerz API call) | Phase 2 |
| Coupon/Discount Management | ❌ Missing | Phase 2 |
| Shipping Configuration | ❌ Missing | Phase 2 |
| Tax Configuration | ❌ Missing | Phase 2 |
| Marketing Campaigns | ⚠️ Data only (no sending) | Phase 5 |
| Inventory Management Page | ❌ Missing (API exists) | Phase 3 |
| Staff/User Management Page | ❌ Missing (API exists) | Phase 3 |
| Analytics Dashboard | ❌ Missing | Phase 3 |
| Review Moderation | ❌ Missing | Phase 3 |
| Website Settings | ✅ Done (9 tabs) | — |
| Logo/Favicon Upload | ❌ Missing | Phase 4 |
| Rich Text Editor | ❌ Missing | Phase 4 |
| Audit Log | ❌ Missing (table exists) | Phase 4 |
| SEO Tools | ⚠️ Basic settings only | Phase 4 |
| Blog/CMS | ❌ Missing | Phase 5 |
| Subscription/Billing | ❌ Missing | Phase 5 |
| Webhooks | ❌ Missing | Phase 5 |
| 2FA | ❌ Missing | Phase 5 |

### Customer/Storefront Features

| Feature | Status | Phase |
|---------|--------|-------|
| Browse Products | ✅ Done | — |
| Product Search | ⚠️ Client-side only | Phase 2 |
| Category Browsing | ⚠️ Filter only, no landing pages | Phase 3 |
| Product Images | ❌ Emoji placeholders | Phase 1 |
| Product Reviews/Ratings | ❌ Missing | Phase 3 |
| Shopping Cart | ⚠️ In-memory (lost on refresh) | Phase 1 |
| Coupon/Promo Code | ❌ Missing | Phase 2 |
| Checkout | ✅ Done (SSLCommerz) | — |
| Multiple Payment Methods | ❌ SSLCommerz only | Phase 5 |
| Shipping Selection | ❌ Always free | Phase 2 |
| Guest Checkout | ✅ Auto-creates account | — |
| Customer Account | ✅ Done (5 tabs) | — |
| Order Tracking | ⚠️ Basic status only | Phase 3 |
| Order Cancellation | ❌ Missing | Phase 3 |
| Reorder/Buy Again | ❌ Missing | Phase 3 |
| Wishlist | ❌ Missing | Phase 3 |
| Forgot Password | ❌ Missing | Phase 2 |
| Email Notifications | ❌ Missing | Phase 2 |
| Store Policies | ✅ Done (4 pages) | — |
| Theme Customization | ✅ Done (5 themes, tokens) | — |
| Mobile Navigation | ⚠️ Horizontal scroll (no hamburger) | Phase 3 |
| SEO/Meta Tags | ⚠️ Basic only | Phase 4 |
| Contact Form | ❌ Missing | Phase 5 |
| Blog | ❌ Missing | Phase 5 |
| PWA / Installable | ❌ Missing | Phase 5 |
| Social Login | ❌ Missing | Phase 5 |

---

## 8. Full Bug List

### Backend Bugs
1. `deleteProduct` missing `shopId` parameter → potential cross-tenant delete
2. `listUsers` returns `password_hash` → security leak
3. No `is_active` check on login → disabled users can authenticate
4. `createShop` passes wrong parameter name (`owner_id` vs `owner_user_id`)
5. Non-variant product stock never decremented on order
6. Schema SQL has forward reference (products → categories)
7. Refresh tokens stored in plaintext (should be hashed)
8. Inventory movements don't update actual stock quantities
9. Per-shop SSLCommerz credentials completely ignored
10. Refund only creates DB record — doesn't call SSLCommerz refund API
11. No webhook signature verification for SSLCommerz IPN
12. `validateBody` middleware defined but never used
13. CORS allows all origins (no restriction)
14. `audit_log` table exists but is never populated
15. `sslcommerz-lts` npm package installed but never imported (dead dependency)

### Admin Frontend Bugs
1. `ShopSettings.jsx` calls `shops.update(id, data)` which doesn't exist in API client
2. `Customers.jsx` stats reflect current page only (max 20), not full dataset
3. `Payments.jsx` totals are from current page only
4. `Products.jsx` — `filterCategory` state declared but never used (dead code)
5. `Dashboard.jsx` — "Total Revenue" is revenue of last 5 orders only
6. No role-based route guards (any logged-in user sees all admin pages)

### Storefront Bugs
1. Cart lost on page refresh (in-memory only)
2. `useState` inside render functions in `StoreAccount.jsx` (hooks violation)
3. Out-of-stock variants can be added to cart
4. Currency inconsistency (`$` vs `৳`)
5. Dynamic Tailwind classes won't survive production build
6. `CheckoutCancel` claims cart is saved but it was already cleared
7. Newsletter subscribe button is non-functional
8. Social icons are emoji instead of proper SVG icons
9. Custom JS injection is an XSS vector (no sanitization)
10. Products link by UUID instead of slug on homepage (bad for SEO)

---

## Implementation Priority Summary

```
WEEK 1 (Foundation):
├── Fix all critical bugs (16 items)
├── Cart localStorage persistence
├── Product image upload system
├── Currency consistency
└── Schema SQL fix

WEEK 2-3 (Core Commerce):
├── Forgot/reset password (admin + customer)
├── Email service integration
├── Coupon/discount system
├── Storefront pagination + server-side search
├── Shipping & tax configuration
├── Order email notifications
└── Customer detail page (admin)

WEEK 3-4 (Growth):
├── Product reviews & ratings
├── Wishlist / save for later
├── Admin analytics dashboard with charts
├── Inventory management page
├── Staff management page  
├── Category landing pages
├── Mobile hamburger menu
└── Order management upgrades

WEEK 4-5 (Polish):
├── Rich text editor
├── SEO (sitemap, structured data, meta tags)
├── Logo & favicon upload
├── Responsive mobile improvements
├── Admin notifications
├── Bulk operations
├── CSV import/export
└── Audit log

WEEK 5+ (Scale):
├── Subscription plan enforcement & billing
├── Multi-currency
├── Custom domains
├── Marketing campaign execution
├── Blog/CMS
├── 2FA, webhooks, PWA
└── Product recommendations
```

---

*Generated from full platform audit — Backend (416 findings), Admin Dashboard (440 findings), Storefront (324 findings)*
