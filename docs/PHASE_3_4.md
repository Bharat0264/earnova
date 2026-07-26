# Earnova Phases 3 and 4

## Phase 3 operations

- Unified provider profiles for freelancers, CA/consultants, project sellers, and energy partners
- Provider verification, availability, service areas, pricing, portfolio, ratings, and completed jobs
- Customer service requests, provider proposals, selection, tracked work states, completion, and reviews
- Explicit payment-recording language; Earnova does not claim escrow
- Residential and commercial energy enquiries with bill, property, roof, location, contact, assignment, quote, and approximate-estimate acknowledgement
- Existing commerce, CA, freelancing, projects, B2B, and solar product flows remain available
- Public Energy and Products discovery; protected transactions still require authentication
- Versioned referral rules and pending, approved, paid, or reversed commission ledgers

## Phase 4 operations

- Configurable Starter, Growth, and Pro plans plus subscription lifecycle and usage fields
- In-app proposal, service, energy, and provider-verification notifications
- Support tickets with priority, assignment, replies, internal notes, and tracked status
- Privacy-conscious allow-listed platform events
- Append-only audit records for sensitive admin operations
- Admin management for businesses, providers, services, energy, support, subscriptions, referrals, analytics, and audit logs
- A visible Admin navigation link for administrators

## Commercial configuration

`npm run seed:operations` defines initial plan prices, limits, and referral rule version 1. Review these commercial values before applying them to production. Read-only plan fallbacks are available when no plan documents exist.

## Manual acceptance

1. Create a professional-service request as a customer.
2. Complete a partner profile and verify it from Admin.
3. Submit and accept a proposal, track delivery, and submit a review.
4. Create an energy enquiry and update it from Admin.
5. Confirm notifications in `/app/notifications`.
6. Open and update a support ticket.
7. Verify the new `/admin` operations and audit sections.
8. Confirm `/energy` and `/products` are publicly browseable while checkout remains protected.

## External production dependencies

- Razorpay recurring billing is not automatically enabled; existing verified payment flows remain authoritative.
- Email delivery depends on configured SMTP credentials.
- Provider identity verification remains a manual admin decision.
- Production plan prices, limits, and commissions require explicit approval before seeding.
