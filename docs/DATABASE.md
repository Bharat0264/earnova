# Earnova Database

Earnova currently uses MongoDB through Mongoose.

## Existing domains

Users, products, orders, payment attempts, referrals, withdrawals, B2B quotes, subsidy requests, freelancers/jobs, CA profiles/tax jobs, project listings, one business subscription, and one mixed business workspace per user.

## Phase 1 additive fields

The `User` model adds:

- `accountType`
- `goals`
- `onboarding.status`
- `onboarding.currentStep`
- `onboarding.completedSteps`
- `onboarding.skippedSteps`
- `onboarding.completedAt`

Existing records remain readable. Run the onboarding backfill in a controlled environment to add explicit defaults where required for reporting.

## Phase 2 tenant model

Phase 2 adds separate collections for:

- `Business`
- `BusinessMember`
- `BusinessCustomer`
- `BusinessLead`
- `BusinessProduct`
- `BusinessSale` with embedded calculated sale items
- `BusinessExpense`
- `BusinessInvoice` with embedded calculated invoice items and a customer snapshot
- `BusinessActivity`

Every business-owned collection includes an indexed `business` reference. The API resolves membership and permission on the server before every business query. Owner, admin, editor, and viewer membership roles are distinct; viewers cannot mutate records.

Do not destructively replace `BusinessWorkspace`. Migrate its mixed data through a versioned import job, preserve the source document, record errors, and reconcile counts before cutover.

## Financial data

New payment, price, tax, discount, commission, invoice and ledger fields should use integer smallest currency units. Critical transitions require idempotency keys and MongoDB transactions where the deployment supports them.

Phase 2 sales and CSV imports use MongoDB transactions. Sale totals and invoice totals are calculated on the server. Recording a sale decrements inventory and updates the selected customer's order count and recorded lifetime revenue in the same transaction.

## Phase 2 rollout

The new collections are additive and are created by MongoDB when first used. Existing mixed `BusinessWorkspace` documents are preserved and remain readable through the legacy route. Users can create a new tenant workspace without destructive conversion. A later reviewed migration must map legacy imported rows to the normalized product, customer, and sale schemas; do not delete legacy documents during that migration.

## Phases 3 and 4 collections

Marketplace and operations add `ProviderProfile`, `ServiceRequest`, `EnergyEnquiry`, `Notification`, `SupportTicket`, `Plan`, `CommissionRule`, `ReferralLedger`, `PlatformEvent`, and append-only `AuditLog`.

Referral commissions begin as pending ledger entries after verified eligible payments. Each stores its rule key and version. Admin approval is allowed only after the configured period and wallet credit runs inside a MongoDB transaction.
