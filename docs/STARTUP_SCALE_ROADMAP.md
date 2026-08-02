# Earnova full-scale startup platform roadmap

This roadmap turns the current MVP into a secure, measurable, multi-tenant platform. It is intentionally staged: financial correctness, privacy and operational control must precede rapid feature expansion.

## Stage 0: launch gates

- Run separate development, staging and production environments with separate databases, payment keys, storage buckets and OAuth clients.
- Manage secrets in the hosting provider's secret manager; rotate any credential ever copied into chat, logs or source files.
- Require CI, reviewed pull requests, protected branches and repeatable database migrations before deployment.
- Add automated backups, point-in-time recovery where available, and a quarterly restore drill.
- Complete legal review of privacy, terms, refunds, marketplace liability, tax-service scope and data-retention policies.
- Establish incident severity levels, an on-call owner, rollback steps and customer communication templates.

## Stage 1: trustworthy core

- Finish the HTTP-only cookie migration and remove browser bearer-token storage after the migration window.
- Add email verification, MFA for administrators and finance roles, session/device management, account recovery and privileged-action re-authentication.
- Add idempotency keys and immutable audit events to orders, payments, refunds, payouts, commissions and webhook processing.
- Use a queue for email, document processing, webhooks, analytics aggregation and other retryable work.
- Add schema validation to every API boundary and publish a versioned OpenAPI contract.
- Quarantine uploads until malware scanning succeeds; encrypt sensitive documents and define automatic deletion schedules.

## Stage 2: scalable platform architecture

- Treat businesses and firms as explicit tenants. Every tenant-owned record must carry a tenant ID and every query must prove membership and permission.
- Adopt granular roles and permissions instead of broad role strings; require two-person approval for large refunds, payouts and verification overrides.
- Split large controllers by use case while retaining a modular monolith. Introduce separate services only when scaling or ownership data justifies them.
- Add Redis for caching, distributed locks, queues and rate limiting when traffic or worker separation outgrows the Mongo-backed baseline.
- Add database indexes based on measured query plans, cursor pagination for large datasets, archiving and retention jobs.
- Serve media through a CDN and use signed, expiring access URLs for private files.

## Stage 3: quality and delivery

- Add database-backed API integration tests and Playwright tests for auth, onboarding, tenant isolation, checkout, payment webhooks, referrals, CA cases and admin review.
- Add ephemeral preview environments, migration checks, smoke tests, progressive delivery and one-command rollback.
- Define service-level objectives for availability, latency, payment success, job delay and support response time.
- Add structured logs, traces, metrics, exception tracking and alerts. Redact tokens, identity data and payment information by default.
- Add dependency, container, secret and static security scanning; commission penetration tests before material payment or document volume.

## Stage 4: product and growth system

- Select one primary acquisition promise and customer segment. Keep secondary offerings discoverable after the main conversion journey.
- Instrument the funnel: acquisition, signup, verification, activation, first value, payment, repeat use, referral and churn.
- Define a north-star metric plus guardrails for refunds, fraud, support load and customer satisfaction.
- Add feature flags, experiment assignment and analytics governance. Never use sensitive tax, identity or payment data for experimentation.
- Build lifecycle messaging, referral fraud controls, partner quality scoring and marketplace dispute workflows.
- Add accessibility testing, localization, low-bandwidth behavior and responsive performance budgets.

## Stage 5: organization and governance

- Assign owners for identity, payments, tenant data, marketplace trust, infrastructure and customer support.
- Maintain a data inventory, access reviews, vendor risk reviews, retention schedules and audit-log review procedures.
- Track unit economics by product line: acquisition cost, activation, gross margin, payment costs, support cost, retention and lifetime value.
- Create capacity and cost forecasts before scaling paid acquisition.

## Release checklist

A production release must have passing CI, an approved migration plan, monitored health/readiness checks, a rollback path, no unresolved critical security findings, tested backups, valid legal content and named operational ownership.
