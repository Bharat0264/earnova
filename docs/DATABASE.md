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

Create separate `Business` and `BusinessMember` collections before introducing business IDs to client requests. Every business-owned collection should include an indexed `business` reference. Resolve membership and permission on the server, then scope every query by the authorized business ID.

Do not destructively replace `BusinessWorkspace`. Migrate its mixed data through a versioned import job, preserve the source document, record errors, and reconcile counts before cutover.

## Financial data

New payment, price, tax, discount, commission, invoice and ledger fields should use integer smallest currency units. Critical transitions require idempotency keys and MongoDB transactions where the deployment supports them.
