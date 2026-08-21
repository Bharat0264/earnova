# Earnova Full Product Rebuild

## Phase 1 — Visual Foundation

Completed 2026-08-21. Reworked the public shell, homepage, navigation, and workspace shell to the compact navy/purple Earnova visual system. The phase preserves existing authenticated business functionality and adds no new backend behavior.

## Commerce verification and Shop alignment

Updated 2026-08-21. `/shop` remains backed exclusively by active MongoDB `Product` records, with server-side filtering, sorting, stock and persisted aggregate review data. Product pages are available at `/shop/product/:id` (with the legacy `/products/:id` route retained), show persisted reviews, and add products to the existing cart before checkout. Checkout continues to rehydrate product prices and stock on the server and uses the existing server-side Razorpay verification flow before creating a MongoDB `Order`.

Seller storefronts and a seller commerce workspace are intentionally not represented as complete features yet: the current `Product` schema has no seller/business/store relation, and no real seller-store records exist to display. They must be introduced with a scoped seller/business data migration before those routes can be published without fake data.

## Business lifecycle connection

Updated 2026-08-21. `/start` now creates a persistent Business, Business Blueprint and roadmap using the selected authenticated workspace. The business idea, industry, company structure, target customer, sales channel, stage, main goal and optional starting budget are stored against the business context. The roadmap contains the connected Start, Build, Source and Operate steps and links each user to its real module.

`/build` and `/source` are authenticated, business-scoped workspaces. New build projects and RFQs are created only through the selected business ID, protected by the existing membership middleware, and update the matching Blueprint area to `IN_PROGRESS`. `/business/passport` is a read-only business identity view that aggregates the current business, Blueprint, roadmap, build projects and RFQs without duplicating an account or creating demonstration data.

## Connected workspace integration

Updated 2026-08-21. `/operate` is a compact command center backed by the business overview, lifecycle, merged activity, and capability status APIs. Revenue, orders, customers, inventory risk, top sold products, recommendations and recent activity are derived from stored business records. Visitors and conversion remain explicitly `Not connected yet` until a real analytics integration exists; no metrics are estimated.

`/activity` merges persistent operational activity with Build, Source, and capability-engine events. `/app/ai` is business-scoped and uses deterministic server-side routing for product stock, recorded sales, Build projects, RFQs, and capability diagnosis. Engine status and verification plans remain the source of truth; UI actions are restricted to fixed internal routes or an explicit manual re-verification request.

### Current architecture and routes

`Business` is the shared identity for Blueprint, roadmap, inventory/products, sales, customers, Build projects, RFQs, BusinessActivity, BusinessEvent, capability evidence, runs, and recovery plans. Primary connected routes are `/start`, `/start/roadmap`, `/build`, `/build/start`, `/build/project/:id`, `/source`, `/source/request`, `/operate`, `/operate/status`, `/activity`, `/business/passport`, and `/app/ai`.

### Deployment notes and limitations

Deploy client and API with MongoDB, authenticated API configuration, and the documented environment variables. Seller storefront publishing remains blocked pending a real business-to-Shop Product relationship and seller/store profile migration. Visitors, conversion, shipping providers, and external payment configuration verification stay unconnected/unconfigured until their respective real integrations are deployed. Existing admin routes are preserved; no legacy backend services were removed in this phase.

## Authenticated cart persistence

Updated 2026-08-21. Added the `Cart` MongoDB model and authenticated `/api/cart` read/replace API. The server accepts only active Product IDs, validates quantities, and rejects unavailable stock before persisting a cart. Guest product carts remain local until sign-in, then transfer into the authenticated cart; checkout still recalculates the cart server-side before creating a payment/order.
