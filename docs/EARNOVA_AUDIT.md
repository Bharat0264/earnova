# Earnova Production MVP Audit

Date: 26 July 2026

## Executive summary

Earnova is an existing full-stack application, not a blank prototype. It already has meaningful commerce, payment, referral, professional-services, administration, and business-dashboard code. The correct next step is to preserve those working verticals while reorganizing the product around three clear pillars:

1. **Earnova Business** — business workspace, analytics, operations, and AI
2. **Earnova Services** — freelancers, CA/tax work, consultants, projects, and B2B requests
3. **Earnova Energy** — solar products, energy enquiries, installation support, and partner opportunities

The current application is suitable for incremental hardening, but it is not yet a production-ready multi-tenant business operating system. Phase 1 should establish the information architecture, design system, role-aware onboarding, route protection, public metadata, baseline security controls, reusable states, and test/build discipline. The later business data model, marketplace state machine, subscription entitlements, and operational admin work require dedicated migrations and separately reviewable phases.

Primary product statement:

> Earnova helps Indian businesses start, run and grow through AI-powered business tools, trusted professional services and sustainable energy solutions.

## Current architecture

### Frontend

- React 18 single-page application built with Vite 5.
- React Router 6 provides client-side routes.
- Tailwind CSS 3 plus shared classes in `client/src/index.css`.
- Authentication and cart data are held in React context.
- API calls use `fetch` through `client/src/utils/api.js`.
- Authentication currently stores a bearer token in `localStorage`.
- Public pages, account pages, and admin pages share one top-level navbar/footer shell.
- Vercel serves the frontend and rewrites `/api/*` to the Render backend.
- Several large feature pages contain UI, state, calculations, persistence, and network code together.

### Backend

- Node.js with Express 4.
- MongoDB through Mongoose 8.
- JWT bearer authentication.
- bcrypt password hashing.
- Razorpay payment creation, verification, webhook handling, and payout integration.
- Cloudinary-backed uploads.
- Nodemailer email utilities.
- REST routes are mounted beneath `/api`.
- CORS has an explicit production allow-list with configurable additional origins.
- Docker configuration exists for MongoDB, API, and Nginx-served frontend.

### Deployment

- Frontend: Vercel configuration in `client/vercel.json`.
- API: external Render service referenced by the Vercel rewrite.
- Container deployment: `docker-compose.yml`, frontend/backend Dockerfiles, and Nginx config.
- Health endpoint exists at `/api/health`.
- There is no readiness endpoint, graceful shutdown handler, deployment runbook, or committed Render manifest.
- The repository uses `env.example`, but the requested conventional root `.env.example` does not exist.

## Existing database models

- `User`
- `Product`
- `Order`
- `PaymentAttempt`
- `Referral`
- `Withdrawal`
- `B2BQuote`
- `SubsidyRequest`
- `FreelancerProfile`
- `FreelanceJob`
- `CAProfile`
- `CATaxJob`
- `ProjectListing`
- `BusinessSubscription`
- `BusinessWorkspace`

The current `BusinessWorkspace` is one mixed document per user. It is not yet a normalized multi-tenant business workspace. It has no `Business`, `BusinessMember`, customer, lead, inventory, sale, expense, invoice, vendor, activity, notification, or AI-insight collections.

## Existing API areas

- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/payment`
- `/api/referral`
- `/api/b2b`
- `/api/subsidy`
- `/api/admin`
- `/api/freelance`
- `/api/ca`
- `/api/projects`
- `/api/business-workspace`
- `/api/services`

## Working features

The following features have real code paths and should be retained:

- Registration, login, current-user lookup, profile update, password update, password reset, and address management.
- Password hashing and JWT verification.
- Product listing/detail, admin product management, image upload, CSV/TSV product import, and reviews.
- Cart and checkout UI.
- Server-side product lookup and server-calculated order totals for Razorpay and cash-on-delivery order creation.
- Razorpay signature verification and a raw-body webhook route.
- Customer order history, cancellation rules, and admin order-state management.
- Referral attribution, dashboard data, withdrawal requests, and admin payout processing.
- Freelance profiles, job creation, payment flow, assignments, and completion/release states.
- CA profiles, document upload, tax-job creation, assignment, delivery, pricing, and withdrawals.
- Project listing submission, moderation, purchase, and seller earning records.
- B2B quote and subsidy-request models/controllers.
- Solar-first product browsing and energy solution content.
- Admin dashboard for users, products, orders, B2B, subsidy, withdrawals, freelance work, CA work, and projects.
- A saved business workspace and subscription activation flow.
- Feature flags/access maps on users.
- Common product, loading, and formatting utilities.
- Responsive Tailwind layouts across many existing pages.

## Partially working features

- **Business workspace:** dashboard-like UI and a saved mixed-data document exist, but the data model is user-scoped rather than tenant/member-scoped and cannot safely support the requested CRM, inventory, invoice, or team permissions.
- **Business AI:** the UI generates dashboard insights from uploaded/manual data, but it is not implemented as a fully authorized, server-grounded assistant with deterministic metric contracts and provider minimization.
- **Subscriptions:** one monthly business subscription exists, but plans, entitlements, usage limits, trials, billing lifecycle, and configurable plan storage do not.
- **Marketplace:** separate freelancer, CA, project, B2B, and energy flows exist, but no shared provider/request/proposal/review model or consistent state machine exists.
- **E-commerce:** product, cart, checkout, payment, orders, cancellation, and review basics exist; seller-owned inventory, shipping events, refund requests, and seller order management do not.
- **Referrals:** attribution and payouts exist, but commission rules are not versioned and the ledger states do not match pending/approved/paid/reversed accounting.
- **Admin:** operational tables exist but permissions are admin-or-not rather than granular; audit logs, disputes, refunds, content, settings, analytics, feature flags, and support operations are absent.
- **Uploads:** product CSV and CA document upload validation exists, but content sniffing, malware scanning, durable import summaries, row-level rollback, and generalized business imports do not.
- **Responsive UX:** many pages use responsive grids, but very large pages and tables have not been systematically verified at all required widths.

## Missing features

### Phase 1 foundation gaps

- Clear three-pillar route architecture.
- Separate public, protected application, partner, and admin layouts.
- Dedicated login/register routes.
- Role/intent selection after registration.
- Persisted, resumable onboarding checklists.
- Consistent page metadata and canonical URLs.
- Public legal/contact/company pages.
- Error boundary, unauthorized/forbidden pages, reusable empty/error/loading states, and a toast system.
- Route-level code splitting.
- Accessible skip link and consistent focus treatment.
- Automated linting, tests, and type checking/checking equivalent for JavaScript.

### Later-phase product gaps

- Normalized multi-tenant business entities and member permissions.
- CRM, leads, sales, purchases, inventory transactions, expenses, invoices, vendors, activities, notifications, and AI insights.
- CSV/Excel business imports with mapping and row-level error reporting.
- Shared service marketplace models and proposals.
- Energy partner assignment and quote tracking.
- Seller portal/data ownership.
- Refund/dispute workflow.
- Configurable subscription plans, entitlements, and usage metering.
- Support tickets and in-app notifications.
- Privacy-conscious analytics service and platform metrics.
- Immutable/append-only admin audit logs.

## Security risks

Severity reflects production risk, not proof of exploitation.

### High

- JWTs are stored in `localStorage`, increasing exposure if an XSS vulnerability occurs. A later auth migration should use short-lived access tokens with safely rotated refresh tokens in secure HTTP-only cookies, with CSRF protection when cookie auth is enabled.
- There is no login/register/password-reset throttling or general API rate limiting.
- Request validation is implemented ad hoc in controllers. There is no central schema-validation layer.
- Multiple controllers return raw `err.message`; some messages may reveal implementation or database validation details.
- The application has no session/token invalidation version, email verification enforcement, or password-reset session revocation.
- The current business workspace is authorized by user ID, but it is not a true tenant/member model and cannot safely accept arbitrary business IDs in Phase 2.

### Medium

- `b2bRoutes.js`, `subsidyRoutes.js`, and `referralRoutes.js` call `router.use(protect, requireFeature(...))` before routes labelled public. Those endpoints are therefore not public as their comments and UI imply.
- Public-facing file validation largely trusts MIME metadata and file extensions.
- The server lacks secure-header middleware/content-security policy.
- CORS errors flow through the generic error handler and production configuration is not validated at startup.
- Password minimum length is six characters and there is no compromised-password or strength policy.
- No audit log records sensitive admin changes.
- No explicit pagination ceiling is consistently enforced across every list endpoint.
- Money fields use mixed rupee-number representations. Financial writes need integer smallest-unit conventions and database transactions in later phases.

### Positive controls already present

- bcrypt hashing.
- JWT signature and expiry verification.
- Admin middleware on admin APIs.
- Owner-scoped queries in core order, CA, workspace, and several freelance paths.
- Server-side product lookup and server-side total calculation for commerce checkout.
- Razorpay signature checks and raw webhook body handling.
- Payment-attempt records and duplicate payment lookup.
- Production CORS allow-list.
- Upload size limits.
- Production stack traces are not returned.

## UX and accessibility problems

- The homepage currently presents many modules and investor/revenue messages with equal visual weight instead of one customer-focused value proposition.
- Navigation exposes many independent services and does not reflect Business, Services, and Energy.
- Public and protected experiences share the same shell.
- Authentication is primarily modal-driven; direct `/login`, `/register`, forgot-password, and reset-password navigation is incomplete.
- Users are not asked what they want to accomplish and see features unrelated to their role.
- Footer legal/support links often point to `/` and social links use `#`.
- Some copy describes “escrow-style” behavior; the product must avoid implying legal escrow.
- Current metadata is solar-product focused and stale relative to the broader positioning.
- Several UI files exceed 500–1,000 lines, making consistent states and responsive behavior difficult.
- Dialog semantics, focus trapping/restoration, and Escape handling are incomplete.
- No global skip link or reduced-motion policy exists.
- Very wide operational tables do not consistently provide mobile card alternatives.
- Several source files contain mojibake characters, affecting visible typography.

## Technical debt

- `BusinessSolutionsPage.jsx` (~1,090 lines), `CAServicesPage.jsx` (~835 lines), `FreelancePage.jsx` (~536 lines), `HomePage.jsx` (~446 lines), and `Navbar.jsx` (~365 lines) are oversized.
- `adminController.js` (~820 lines) and `paymentController.js` (~605 lines) combine many domains.
- Controller-level `try/catch` blocks and response formatting are duplicated.
- Authentication middleware is repeated on routes after a router-level `protect`.
- Product demo data exists in both frontend mock files and backend seed files.
- Old home-section components remain alongside a separately implemented large homepage, creating probable dead/unused UI.
- Route names are inconsistent (`/products`, `/energy-solutions`, `/business-solutions`, `/ca-services`, `/b2b`) and do not form a coherent hierarchy.
- Feature flags and subscription checks overlap without a central entitlement service.
- No migration framework or migration history exists for MongoDB schema evolution.
- No test files, lint configuration, or type-check script exist.
- Some generated/local log files and an accidental file named `{` are present at repository root.

## Duplicate or unnecessary modules

Candidates for later cleanup after usage verification:

- Older `client/src/components/home/*` components appear separate from the current monolithic homepage implementation.
- Frontend `mockProducts.js` duplicates seeded/backend catalog concepts, though it may still be needed as an offline fallback.
- Repeated auth/protect middleware in already-protected routers.
- Repeated loading skeletons, badges, cards, field wrappers, API error panels, and status styles.
- Multiple service-specific profile/job concepts should eventually share provider and request primitives without forcing a premature Phase 1 migration.

No potentially working feature should be deleted solely based on this audit.

## Recommended architecture

### Frontend

```text
src/
  app/
    layouts/
    routes/
    guards/
  components/
    ui/
    marketing/
    onboarding/
  features/
    auth/
    business/
    services/
    energy/
    marketplace/
    partner/
    admin/
  services/
    api/
    analytics/
  pages/
```

- Use nested React Router layouts for public, application, partner, and admin surfaces.
- Lazy-load page-level modules.
- Keep the public homepage focused on three pillars and one conversion action.
- Centralize design tokens and reusable UI states.
- Add a metadata component/service for route-specific titles, descriptions, canonical URLs, and robots directives.
- Keep legacy URLs as redirects during the transition.

### Backend

```text
src/
  config/
  middleware/
    auth/
    validation/
    rateLimit/
    errors/
  modules/
    auth/
    business/
    commerce/
    services/
    energy/
    referrals/
    billing/
    notifications/
    support/
    admin/
  services/
  models/
  routes/
```

- Add centralized validation, permissions, error codes, logging, request IDs, and environment checks.
- Keep controllers thin and move calculations/state transitions into services.
- In Phase 2, require a tenant resolver that derives authorized business membership on every business query.
- Use transactions/idempotency for financial state changes.
- Keep deterministic analytics separate from language-model explanations.

## Prioritized implementation roadmap

### Phase 1 — foundation and UI

1. Add this audit.
2. Introduce the three-pillar public route structure with legacy redirects.
3. Add separate public, protected application, partner, and admin route boundaries.
4. Create the design-token system and reusable button/card/form/state components.
5. Replace the homepage with the requested focused marketing flow.
6. Add route-level lazy loading and page metadata.
7. Add role/intent onboarding persisted to the user record.
8. Add protected-route loading, unauthorized, forbidden, not-found, and error states.
9. Add baseline request IDs, secure headers, auth throttling, input normalization, safe errors, and fix incorrectly protected public routes.
10. Add lint/check/test/build scripts and Phase 1 tests.

### Phase 2 — business MVP

Create normalized tenant-safe business entities, member permissions, overview analytics, sales, customers/leads, inventory, expenses, invoices, import, and grounded Business AI.

### Phase 3 — marketplace operations

Unify provider profiles and service requests, add proposals/work/reviews, extend energy enquiries, improve seller commerce, and introduce a versioned referral ledger.

### Phase 4 — monetization and operations

Add configurable plans/entitlements, usage limits, support tickets, notifications, operational analytics, granular admin permissions, feature flags, and audit logs.

## Phase 1 files expected to be modified

The implementation should remain reviewable and primarily touch:

- `client/src/App.jsx`
- `client/src/index.css`
- `client/src/context/AuthContext.jsx`
- `client/src/components/common/Navbar.jsx`
- `client/src/components/common/Footer.jsx`
- `client/src/components/auth/AuthModal.jsx`
- `client/src/pages/HomePage.jsx`
- `client/src/pages/NotFoundPage.jsx`
- `client/index.html`
- `client/package.json`
- `server/src/server.js`
- `server/src/routes/authRoutes.js`
- `server/src/routes/b2bRoutes.js`
- `server/src/routes/subsidyRoutes.js`
- `server/src/routes/referralRoutes.js`
- `server/src/controllers/authController.js`
- `server/src/models/User.js`
- `server/package.json`
- `env.example` and a new `.env.example`

Expected new Phase 1 files:

- Route layouts and guards.
- Public overview/legal/auth pages.
- Protected app shell and role-aware overview/onboarding pages.
- Reusable UI state and metadata components.
- Validation/rate-limit/security middleware.
- Phase 1 tests.
- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`
- `docs/API.md`
- `docs/DATABASE.md`

## Database migration requirements

### Phase 1 additive migration

Add optional/defaulted fields to `User`:

- `accountType`
- `goals`
- `onboarding.status`
- `onboarding.currentStep`
- `onboarding.completedSteps`
- `onboarding.skippedSteps`
- `onboarding.completedAt`

This is backward compatible when defaults are applied. Existing users can be treated as `individual` with onboarding `not_started` until they select an intent. A one-time backfill script is recommended before making any new field required.

### Phase 2 migration

Create normalized collections and indexes for:

- Business
- BusinessMember
- Customer
- Lead
- Product/service owned by a business
- InventoryItem and InventoryTransaction
- Sale and SaleItem
- Purchase
- Expense
- Invoice and InvoiceItem
- Vendor
- PaymentRecord
- Activity
- Notification
- AIInsight

`BusinessWorkspace` mixed data should be migrated through a versioned import job; it should not be destructively replaced.

### Phase 3/4 migrations

- Shared provider/service-request/proposal/work/review entities.
- Energy enquiry assignment and quote history.
- Versioned referral commission rules and immutable ledger entries.
- Plan, subscription, entitlement, usage, billing-event, refund, dispute, support-ticket, feature-flag, analytics-event, and audit-log collections.

## Phase 1 acceptance interpretation

Phase 1 will be considered stable when:

- The homepage communicates one value proposition and only three primary pillars.
- Public modules live on dedicated routes with working legacy redirects.
- Public, app, partner, and admin route boundaries are distinct.
- Registration leads to role/intent onboarding that can be skipped and resumed.
- Protected routes enforce authentication and partner/admin routes enforce role eligibility in both frontend navigation and backend APIs where applicable.
- Shared design tokens, focus styles, loading/error/empty states, and metadata are in use.
- Publicly intended B2B/subsidy/referral endpoints are no longer accidentally blocked by router-wide authentication.
- Lint/check/tests/build commands actually run and pass.
- Required responsive widths and primary flows are manually verified.

