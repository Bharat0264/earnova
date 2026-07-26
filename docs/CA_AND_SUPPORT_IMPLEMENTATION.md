# Earnova CA and Support Implementation Plan

## Scope

This plan covers Phase 1 of two connected product areas:

1. A firm-based online CA office.
2. A global, contextual Help Centre and customer-support system.

The implementation extends the existing React/Vite client, Express API, MongoDB/Mongoose models, JWT identity, Razorpay payment integration, Cloudinary media integration, notification model, audit model, and role-aware layouts. It does not introduce a separate identity store or database cluster.

## Existing relevant functionality

- Public CA page at `/services/ca` with individual CA discovery, applications, tax-job submission, payment initiation and work completion.
- `CAProfile` and `CATaxJob` records, CA assignment, job status history and CA payouts.
- Shared `User` identity with customer/admin roles and account types.
- Shared `Business` and `BusinessMember` records for customer-business ownership and access.
- JWT route protection, admin middleware, feature access checks and request IDs.
- Razorpay order creation, signature verification and webhook entry point.
- Cloudinary uploads using in-memory Multer buffers.
- `SupportTicket` schema with customer replies and internal reply flags, but no mounted support routes.
- `AuditLog`, `Notification`, order, project, service-request and payment-attempt records.
- Public, customer, partner and admin React layouts.
- Central API helper that attaches the current JWT.

## Current technical limitations

- CA work is organized around an individual `CAProfile`, not a verified firm with members and assignments.
- Existing `CATaxJob` combines intake, sensitive tax data, payment state, public file URLs and workflow state in one document.
- CA document metadata contains a permanent URL; it does not provide signed, short-lived access.
- CA permissions do not distinguish firm owner, administrator, professional, case manager, reviewer or billing responsibilities.
- The existing user role enum cannot represent support agents or firm membership; domain membership must therefore carry the fine-grained role.
- Service definitions and document requirements are hard-coded into a large page/controller.
- Existing support tickets have no public reference format, queue, service context, related-entity authorization, escalation history, SLA fields or customer API.
- Internal ticket replies live inside the ticket document; projection mistakes could expose internal content.
- No reusable contextual `GetHelp` component exists.
- There is no current antivirus provider. Phase 1 can create a scanning state and integration boundary, but uploads must remain quarantined until a configured scanner marks them clean in production.
- In-memory rate limiting is per process and must be replaced by a shared store before horizontally scaling.
- Full-text Help Centre search can begin with indexed MongoDB text queries but may later need a dedicated search service.

## Proposed routes

### Public CA web routes

- `/services/ca`
- `/services/ca/:serviceSlug`
- `/services/ca/firm/:firmSlug`
- `/services/ca/book-consultation`
- `/services/ca/pricing`
- `/services/ca/how-it-works`
- `/services/ca/faq`

### Customer CA web routes

- `/app/ca`
- `/app/ca/cases`
- `/app/ca/cases/:caseId`
- `/app/ca/consultations`
- `/app/ca/documents`
- `/app/ca/compliance-calendar`
- `/app/ca/payments`
- `/app/ca/completed`
- `/app/ca/settings`

### Firm web routes

- `/firm`
- `/firm/cases`
- `/firm/cases/:caseId`
- `/firm/clients`
- `/firm/team`
- `/firm/tasks`
- `/firm/documents`
- `/firm/consultations`
- `/firm/services`
- `/firm/quotes`
- `/firm/billing`
- `/firm/reports`
- `/firm/settings`
- `/firm/support`

### Help and support web routes

- `/help` and the requested service-category routes
- `/help/article/:articleSlug`
- `/help/contact`
- `/app/support`
- `/app/support/new`
- `/app/support/:ticketId`
- `/partner/support`
- `/admin/support/*`
- `/admin/ca/*`

### API routes

- Public service and firm reads: `/api/ca-office/services`, `/api/ca-office/firms`
- Customer cases: `/api/ca-office/cases`
- Firm workspace: `/api/ca-office/firm/*`
- Private documents: `/api/private-files/*`
- Help content: `/api/help/*`
- Customer support: `/api/support/tickets/*`
- Firm support: `/api/support/firm/*`
- Admin/support operations: `/api/admin/support/*` and `/api/admin/ca/*`

All list endpoints use bounded pagination, allow-listed filters and explicit projections.

## Proposed database models

Phase 1 introduces modular collections:

- `ca_firms`
- `ca_firm_members`
- `ca_professional_profiles`
- `ca_services`
- `ca_service_workflows`
- `ca_cases`
- `ca_case_assignments`
- `ca_case_status_history`
- `ca_document_requirements`
- `ca_case_documents`
- `support_categories`
- `support_tickets`
- `support_ticket_messages`
- `support_internal_notes`
- `support_attachments`
- `support_status_history`
- `support_escalations`
- `help_articles`

Existing `CAProfile` and `CATaxJob` remain readable during migration. New requests write to the new CA domain. Later migration phases may archive or map legacy jobs after reconciliation.

## Role and permission design

Global identity remains in `User`. Domain permissions are derived server-side:

- Customer: own cases, authorized business cases and own tickets.
- Admin: all platform records with audit logging.
- Support agent: support queues assigned through a support-agent profile or explicit assignment; no implicit CA-document access.
- Firm owner / firm administrator: firm administration and firm-scoped case allocation.
- Partner CA: assigned cases or role-policy cases; professional designation stored separately and shown only when verified.
- CA employee / accountant / article assistant: assigned cases only, with task/document capabilities.
- Case manager: assigned customer communication and workflow control.
- Reviewer: assigned review actions.
- Billing administrator: firm billing and quote/payment views, not unrestricted document access.
- Support coordinator: firm-linked support tickets without unrestricted professional or billing access.

Every firm query includes `firmId`; every customer query includes `customerId` or an authorized `businessId`; every case detail request also checks assignment or firm policy. A public case/ticket reference is never used as authorization.

## Data-security risks

- PAN, Aadhaar, banking and tax documents are highly sensitive.
- Cross-tenant object-ID guessing could expose cases, tickets or files.
- Internal notes could leak through broad population or serialization.
- Permanent Cloudinary URLs could bypass application authorization.
- Malicious files could be disguised through MIME or extension spoofing.
- Signed URLs, document names and identification numbers could leak through logs or notification subjects.
- Support agents could gain excessive access by following related-entity links.
- Duplicate payment or ticket submissions could create financial/operational inconsistency.

Mitigations include explicit serializers, ownership middleware, field projection, masked identifiers, private delivery, checksum/version metadata, audit events, safe request logging, bounded lists, rate limiting, validation and separate internal-note collections.

## File-storage design

`PrivateStorageService` is the only application entry point for sensitive uploads.

- Store objects as private/authenticated assets.
- Store metadata only in MongoDB: provider, key/public ID, original filename, sanitized display name, MIME type, extension, size, checksum, version, scan state, uploader, owner/case/firm/ticket links, retention date and deletion state.
- Validate allow-listed MIME types and extensions and reject executables.
- Validate common file signatures before upload.
- Generate non-user-controlled storage keys.
- Return short-lived authenticated download links only after a fresh authorization check.
- Do not persist signed URLs.
- Record download requests in `AuditLog`.
- Expose a malware-scanning adapter. Production must configure a scanner or treat files as quarantined.
- Support access revocation and secure provider deletion.

Phase 1 uses Cloudinary authenticated delivery through the abstraction because it is already configured. An S3-compatible private bucket can replace the adapter without changing domain models.

## Payment and case relationships

- A CA case references its service, accepted quote when present, payment records and firm payout records by stable IDs.
- Phase 1 can create a case before payment and preserve existing Razorpay flows where applicable.
- Amounts are calculated from server-side service or quote records.
- Existing payment verification and webhook mechanisms remain the starting point.
- Later phases add quote versions, milestones, immutable case-payment ledger, commission, payout, refund and reconciliation records.
- No UI or copy describes funds as escrow.

## Ticket escalation design

- Queue and priority are calculated server-side from service, issue category, impact and related entity.
- Security, privacy, sensitive-document exposure and account-takeover issues route to restricted queues.
- An escalation record stores actor, reason, previous/new queue, level, timestamp, follow-up and customer-visible state.
- Customer status history includes only customer-visible events.
- Internal notes are stored separately and are never returned by customer APIs.
- Duplicate detection finds recent open tickets for the same user, related entity and issue category and suggests continuing the existing ticket.
- Escalation does not grant the receiving agent automatic access to a related CA document; separate authorization remains required.

## Migration requirements

1. Seed centrally configured CA services, workflows, support categories and reviewed Help Centre articles using idempotent upserts.
2. Create indexes through Mongoose initialization or the migration script.
3. Create a verified default firm only when an administrator explicitly supplies mapping information; do not invent a production firm.
4. Map verified legacy `CAProfile` records to firm/professional records only through an explicit migration mode and audit the mapping.
5. Map legacy `CATaxJob` records to new cases only after confirming firm/member relationships and private-file migration.
6. Existing public document URLs must be treated as a migration risk and revoked after secure re-storage.
7. Do not delete legacy records in Phase 1.

Migration script: `server/src/data/migrateCAAndSupportPhase1.js`, dry-run by default with explicit `--apply`.

## Files to create or modify

### Server

- Domain configuration for CA services, workflows, issue types and queues.
- Firm, member, service, case, assignment, status-history, document and Help/support models.
- CA-office, support, Help Centre, private-storage and admin controllers/routes.
- Permission, entity-authorization, masking and private-upload helpers.
- `routes/index.js`, security configuration, notification/audit integrations and migration script.
- Authorization, isolation, masking, routing and model tests.

### Client

- Normalize `CAServicesPage`.
- Add CA service detail, firm detail and informational pages.
- Add customer CA workspace and case detail.
- Add firm layout/workspace.
- Add Help Centre, article, support list/form/detail and admin support pages.
- Add reusable `GetHelp`.
- Extend `App.jsx`, app/partner navigation and footer links.
- Add route/config tests.

## Phased implementation order

### Phase 1

1. This implementation plan.
2. Central domain configuration and Mongoose schemas/indexes.
3. Permission and ownership services.
4. Private-storage abstraction and secure upload metadata.
5. Public CA service/firm APIs and pages.
6. Case intake, verified-firm assignment and customer/firm case lists.
7. Help Centre content/search.
8. Contextual support intake, ticket list/detail shell and duplicate suggestion.
9. Admin support queue and CA administration shells.
10. Seed/migration tooling and automated validation.

### Phase 2

Case workflows, service-specific document checklists, fine-grained assignment, customer conversation, internal firm notes, support conversations, escalation actions, notifications and expanded audit events.

### Phase 3

Consultations, quote versions, milestone payments, deliverables, compliance calendar, article administration, reports and satisfaction feedback.

Later phases do not begin until Phase 1 lint, syntax/type checks, tests and production build pass.

## Testing plan

- Model validation and index tests.
- Customer case ownership tests.
- Business tenant-isolation tests.
- Firm-isolation and assignment tests.
- Support ticket ownership tests.
- Related case/order authorization tests.
- Internal-note non-disclosure tests.
- Service-specific issue-category tests.
- Priority and queue calculation tests.
- Duplicate-ticket suggestion tests.
- Filename, MIME, extension, signature, file-size and executable rejection tests.
- Sensitive identifier masking tests.
- Pagination cap and projection tests.
- Public/private route smoke tests.
- Client route/config tests.
- Server and client lint.
- Server syntax/type check.
- Server tests and client tests.
- Client production build.

