# Earnova API

Base path: `/api`

## Operational endpoints

- `GET /api/health` — process health; does not require database readiness.
- `GET /api/ready` — returns `200` only while MongoDB is connected.

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET /api/auth/me`
- `PUT /api/auth/onboarding`
- `PATCH /api/auth/profile`
- `PATCH /api/auth/password`

Protected endpoints currently use `Authorization: Bearer <token>`. Error responses include a safe message and may include a request ID. Authentication endpoints are throttled.

## Product modules

- Products: `/api/products`
- Orders: `/api/orders`
- Payments: `/api/payment`
- Referrals: `/api/referral`
- B2B requests: `/api/b2b`
- Subsidy assistance: `/api/subsidy`
- Freelancing: `/api/freelance`
- CA services: `/api/ca`
- Projects: `/api/projects`
- Business workspace: `/api/business-workspace`
- Service overview: `/api/services`
- Administration: `/api/admin`
- Multi-tenant Business MVP: `/api/businesses`

Route/controller source remains the authority for current request and response fields. An OpenAPI contract should be introduced alongside Phase 2 module services.

## Authorization rule

A frontend-supplied resource ID is never sufficient authority. Controllers must derive the authenticated user and query by ownership/membership, or require an authorized admin/provider role. Phase 2 business routes must resolve business membership server-side before every tenant query.

## Phase 2 business workspace

All routes below require bearer authentication. Every route containing `:businessId` first verifies an active `BusinessMember`; writes require owner, admin, or editor membership.

- `GET|POST /api/businesses`
- `GET|PATCH /api/businesses/:businessId`
- `GET|POST /api/businesses/:businessId/customers`
- `GET|POST /api/businesses/:businessId/leads`
- `PATCH /api/businesses/:businessId/leads/:leadId`
- `GET|POST /api/businesses/:businessId/products`
- `PATCH /api/businesses/:businessId/products/:productId/stock`
- `GET|POST /api/businesses/:businessId/sales`
- `GET|POST /api/businesses/:businessId/expenses`
- `GET|POST /api/businesses/:businessId/invoices`
- `PATCH /api/businesses/:businessId/invoices/:invoiceId/status`
- `GET /api/businesses/:businessId/overview`
- `POST /api/businesses/:businessId/assistant`
- `GET /api/businesses/:businessId/imports/:type/template`
- `POST /api/businesses/:businessId/imports/:type/preview`
- `POST /api/businesses/:businessId/imports/:type/execute`

List routes are paginated to a maximum of 100 records per request. Sales, inventory, customers, leads, expenses, and invoices accept `search` where applicable. Analytics accepts `preset=today|last_7_days|last_30_days|current_quarter|current_year|custom`; custom periods also require `start` and may include `end`.

CSV imports accept only `.csv` files up to 2 MB and 5,000 data rows. Supported import types are `customers`, `products`, `inventory`, `expenses`, and `sales`. Preview before execute. The execute response includes imported, rejected, and duplicate counts plus row-level errors.

Prices, tax, discount, revenue, expenses, and invoice values use integer paise. The API recalculates sale and invoice totals and never accepts a frontend total.
