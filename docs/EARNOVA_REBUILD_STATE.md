# Earnova Rebuild State

Last audited: 2026-08-21. This is the persistent baseline for rebuild work; update it instead of repeating a repository-wide audit.

## Existing Architecture

- **Client:** React 18 SPA, Vite 5, React Router 7, Tailwind CSS 3, Lucide. Entry: `client/src/main.jsx`; routes: `client/src/App.jsx`; design tokens/shared utilities: `client/src/index.css`.
- **Server:** Node/Express 4 REST API under `/api`, Mongoose 8/MongoDB. Entry: `server/src/server.js`; routes: `server/src/routes/index.js`; controllers/services/models are domain-organized but not yet modularized by product stage.
- **Data:** MongoDB. Existing core domains include User, Product, Order, PaymentAttempt, Business/Billing/operations models, CA/freelance/service models, referrals, support, B2B, energy, projects, and admin audit records. Recent additive lifecycle models: `BusinessRoadmapItem`, `BusinessEvent`.
- **Route groups:** public React routes plus protected `/app/*`, `/partner/*`, `/firm/*`, `/admin/*`; API areas include auth, products, orders, payment, business, operations, CA, freelance, projects, B2B, subsidy, referral, support, admin, and fees.

## Reusable Systems

- Secure authentication: bcrypt passwords, JWT/session cookie response, Google OAuth, password reset, auth middleware, role-aware guards. User roles/account types include customer/individual, business owner, product seller, freelancer, CA consultant, energy partner, and admin.
- Commerce: product catalogue, cart context, checkout, order history, server-calculated totals, payment attempts, Razorpay order/signature/webhook flows.
- Business operations: normalized tenant model (`Business`, `BusinessMember`, customers, leads, products, sales, expenses, invoices, activities), membership middleware, CSV import and deterministic analytics.
- Services: freelancer, CA, energy, provider/service request, support, projects, B2B and referral systems.
- Common UI: public/app/partner/firm layouts; navbar/footer; protected route, feature gate, route states, page metadata, buttons, product/cart/checkout components.
- Security middleware: request IDs, security headers, CORS allow-list, auth/reset/operation rate limits, upload limits and validation. Payments stay server-verified.

## Obsolete UI

- The old public navigation and broad hub-style home experience are obsolete for the rebuild. Legacy public pages should become redirects or nested destinations, not top-level navigation.
- Oversized pages to replace incrementally rather than extend: `BusinessSolutionsPage.jsx`, `CAServicesPage.jsx`, `FreelancePage.jsx`, legacy `HomePage.jsx`, and parts of `AdminPage.jsx`.
- Old standalone labels such as Energy, CA Services, Freelancing, Projects, B2B and Marketplace should be nested under **Start / Build / Source / Operate** where appropriate. Do not delete their APIs before route mapping and regression checks.

## Data Migration Considerations

- All rebuild changes must be additive and backward compatible. Never drop existing collections.
- Preserve `BusinessWorkspace` legacy documents while normalized `Business` records remain the operational source; migrate only with a versioned, idempotent job and reconciliation counts.
- `BusinessRoadmapItem` and `BusinessEvent` are additive. Populate roadmap items lazily/idempotently per business.
- Shop orders, hire requests, and build projects need optional `businessId` links before they can participate in the capability graph. Avoid making `businessId` mandatory for personal use.
- Use integer paise and server-side recomputation for financial writes; preserve Razorpay verification and webhook idempotency.

## New Target Architecture

Product positioning: **From idea to operating business.**

User stages: **Start → Build → Source → Operate**.

Technical lifecycle: **Business Blueprint → Business Capability Graph → Evidence Collection → Evidence Freshness → Selective Invalidation → Minimum Reverification → Fault Isolation → Recovery → AI Explanation Layer**.

Implement a new app shell with these public destinations and connected context:

1. Start: goal intake, business blueprint, onboarding and roadmap.
2. Build: productized web-presence projects, packages and deployment evidence.
3. Source: products/procurement and verified professional services.
4. Operate: tenant-safe business dashboard, health, recommendations and activity.

The deterministic recommendation engine remains the source of truth. AI may explain a recommendation but cannot change payments, purchases, hiring, legal records, or business state without confirmation.

## Phase Implementation Plan

1. Design system and application shell; map legacy URLs to the four stages.
2. Start and Business Blueprint: profile intake, normalized goals, roadmap templates.
3. Build and Source: package/configurator, projects, procurement/service association to a business.
4. Operate: dashboard, activity, health/status and real empty states.
5. Capability Verification Engine: capability/evidence models, freshness and scoped invalidation.
6. Fault isolation, recovery UX, AI explanation boundary, benchmarks.
7. Integration QA, security review, responsive verification and deployment release.

## Files Likely To Change

- Client: `src/App.jsx`, `src/index.css`, public/app layouts, navigation, pages, reusable components, auth/business contexts, API utility.
- Server: business/services/projects/orders routes/controllers/models, lifecycle/capability services, admin resources, validation and permission middleware.
- Docs: this file, checklist, API/database/deployment migration notes.

## Files That Must Not Be Broken

- `server/src/controllers/paymentController.js`, `server/src/routes/paymentRoutes.js`, Razorpay webhook raw-body handling.
- `server/src/middleware/auth.js`, role/business-access middleware and protected admin routes.
- Existing Mongoose schemas/collections, migrations, environment configuration, Docker/Vercel/Render deployment files.
- User auth, order ownership, CA/private-file protection, support, seller/partner and admin workflows.

## Environment Requirements

- Required: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`; `PORT` and `NODE_ENV` for runtime.
- Payments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`; payouts may need `RAZORPAY_ACCOUNT_NUMBER`.
- Optional integrations: Google OAuth client ID, Cloudinary credentials, email SMTP settings.
- Local runtime: client on 5173 and API on 5000. Vite proxies `/api` to the API; both must run for login and data flows.
- Deployments: Vercel frontend rewrite points to the Render API; Docker Compose supports Mongo/API/Nginx.

## Audit Constraints

- Do not rescan generated files, `node_modules`, locks, binaries or artifacts for future phases unless a specific issue requires it.
- Before changing a shared API/model, consult this state file and then inspect only the named files relevant to that change.

## Phase 1 Changes (2026-08-21)

- Replaced the public product shell with Start, Build, Source and Operate navigation; added a responsive bottom navigation.
- Rebuilt the homepage around the “From idea to operating business” positioning and a deterministic intent entry point, with no fabricated platform metrics.
- Added polished phase landing routes for `/start`, `/build`, `/source`, `/operate`, and `/activity`; retained legacy feature routes and backend capabilities for later mapping.
- Shared foundation now includes page/container/stage primitives, responsive navigation styling, and existing reusable state, form, card, modal and toast primitives.
- Phase 1 does not migrate data or alter auth/payment/server behavior. Phase 2 should build business blueprints on the existing Business and lifecycle additions.

## Phase 2 Changes (2026-08-21)

- Added additive `BusinessBlueprint` persistence, linked one-to-one to an existing tenant-safe Business.
- Extended Business with slug, online/offline/hybrid model, launch status, expanded stage values and planning fields; no existing collections were removed.
- Updated customer-facing roadmap items to use the simpler Phase 2 statuses and the Start → Build → Source → Operate journey. Roadmap and capability state remain separate concepts.
- Added protected blueprint read/write endpoints behind `loadBusinessAccess`; writes require owner/admin membership and all roadmap access is business-scoped.
- Expanded the Start intake to capture a compact blueprint and route a new business to `/start/roadmap`.

## Phase 3 Changes (2026-08-21)

- Added additive `BuildProject`, `Supplier`, and `RFQ` models. Build projects and RFQs can be user-scoped or explicitly business-scoped.
- Added owner-safe project and RFQ APIs under `/api/business-modules`, with business-scoped creation protected by membership and write-role checks.
- Added `/build/start` and `/source/request` forms. Pricing remains quote-based until configurable admin package pricing is introduced.

## Phase 4 Changes (2026-08-21)

- Added protected `/operate` command center with business selection, real lifecycle counts, status rows, recommended action and activity feed.
- Extended BusinessEvent use for roadmap, blueprint, Build and RFQ creation; events remain lightweight, tenant-scoped records for the later capability engine.
- Reused existing business, inventory, sales, payment-state and roadmap services; unavailable integrations render not-connected states rather than made-up data.

## Phase 5 Changes (2026-08-21)

- Added provider-independent capability graph, evidence persistence, TTL freshness policy, deterministic derivation and selective invalidation mapping.
- Initial safe adapter is internal inventory/product evidence; payment, web, order and fulfilment remain unconfigured until an approved configured integration supplies evidence.
- Added tenant-safe capability status API and `/operate/status` customer view. No external URL or financial action is performed.

## Phase 6 Changes (2026-08-21)

- Added deterministic descendant invalidation, minimal dependency-ordered verification planning with cycle detection, fault chains, recovery proposals and non-AI fallback explanation templates.
- Added `VerificationRun` schema and an engine benchmark baseline in `docs/EARNOVA_ENGINE_BENCHMARKS.md`. Recovery is advisory and always requires confirmation.

## Phase 7 Changes (2026-08-21)

- Corrected roadmap completion rendering to use the persisted uppercase status, and made the homepage intent input deterministically route Start, Build, Source, Operate, and business-status questions to the unified product flows.
- Added protected activity and build-project views, backed by business events and owner-scoped project retrieval rather than placeholder data.
- Added deterministic capability-engine tests for derivation, freshness, selective invalidation, minimum planning, cycle handling, fault isolation, and confirmation-required recovery.
- Added production-readiness and technical-engine records. Browser end-to-end testing remains environment-dependent and is documented as a release gate rather than represented as completed.
