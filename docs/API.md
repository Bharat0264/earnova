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

Route/controller source remains the authority for current request and response fields. An OpenAPI contract should be introduced alongside Phase 2 module services.

## Authorization rule

A frontend-supplied resource ID is never sufficient authority. Controllers must derive the authenticated user and query by ownership/membership, or require an authorized admin/provider role. Phase 2 business routes must resolve business membership server-side before every tenant query.
