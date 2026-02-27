# Ecomai Project

Multi-tenant AI e-commerce backend scaffold (Node.js + Express) with tenant-aware auth and domain modules.

## What was left and now implemented
From the platform plan, the missing core backend slices were:
- marketing campaigns module
- website settings module

These are now implemented with tenant isolation and layered architecture.

## Implemented slices (architecture-first)
- Auth: `POST /v1/auth/login`
- Shops: `GET /v1/shops/me`, `GET /v1/shops` (super_admin)
- Customers: `GET /v1/customers`, `POST /v1/customers`
- Products: `GET /v1/products`, `POST /v1/products`
- Orders: `GET /v1/orders`, `POST /v1/orders`
- Delivery: `POST /v1/orders/:orderId/delivery-requests`, `GET /v1/delivery-requests`, `PATCH /v1/delivery-requests/:deliveryRequestId/status`
- Marketing campaigns: `GET /v1/marketing-campaigns`, `POST /v1/marketing-campaigns`, `POST /v1/marketing-campaigns/generate-draft`
- Website settings: `GET /v1/website-settings/me`, `PATCH /v1/website-settings/me`

## Architecture approach
Implemented by layers to align with the platform plan:
- `routes/` for HTTP concerns
- `services/` for domain rules
- `repositories/` for persistence abstraction (currently in-memory store)
- `errors/` for structured domain errors

This allows swapping in PostgreSQL-backed repositories without changing route contracts.

## Database
`db/schema.sql` now includes tenant-scoped tables for:
- `shops`, `users`, `customers`, `products`, `orders`, `order_items`, `delivery_requests`, `marketing_campaigns`, `website_settings`

## Quick start
```bash
npm install
npm run start
```

Demo users:
- `super@ecomai.dev` / `password123` (super_admin)
- `admin@coffee.dev` / `password123` (shop_admin for `shop_1`)
- `staff@coffee.dev` / `password123` (shop_user for `shop_1`)
