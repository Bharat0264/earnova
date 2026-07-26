# Admin verification workflows

Earnova administrators can review businesses, independent CA applicants, and CA firm workers. A verification badge means Earnova reviewed the submitted identity and professional evidence. It does not guarantee financial performance, legal compliance, advice, or service outcomes.

All controls are protected by the server's authenticated admin middleware. Review decisions store the admin, time, status, note, and an audit-log event.

## Business verification

Open **Admin panel → Business verification**.

1. A new business begins in `pending`.
2. Check the owner account, business name, industry, contact details, address, and GSTIN when supplied.
3. Use `under_review` while evidence or clarification is being checked.
4. Choose one decision:
   - `verified`: submitted business identity has passed the platform review.
   - `rejected`: evidence did not pass; a review note is mandatory.
   - `suspended`: a previously trusted business needs its trust status removed; a review note is mandatory.
5. Save the review. The reviewer and decision time are recorded and an audit event is created.

Business trust status is separate from the business workspace's `active` or `archived` state. Verification therefore does not silently delete accounting, CRM, inventory, sales, or invoice data.

Admin API:

- `GET /api/admin/business-verifications`
- `PATCH /api/admin/business-verifications/:id`

## Independent CA applicant verification

Open **Admin panel → CA Services → CA worker verification**.

1. Check the applicant's Earnova account and consent.
2. Match the government ID, ICAI membership number, CA certificate, contact details, and practice proof where supplied.
3. Use `under-review` while checks are in progress.
4. Add an admin note describing evidence checked or the reason for a negative decision.
5. Mark the application `verified`, `paused`, or `rejected`. A note is mandatory for paused and rejected applications.

Only verified independent CA profiles are available for assignment to client tax jobs.

Admin API:

- `GET /api/admin/ca-profiles`
- `PATCH /api/admin/ca-profiles/:id`

## CA firm worker verification

Open **Admin panel → CA Services → Open CA office admin → Professionals** or **Verifications**.

1. Confirm the worker's Earnova account and active firm membership.
2. Check the professional designation and masked membership reference.
3. Confirm the connected CA firm has already been verified. Earnova will reject an attempt to verify a worker whose firm is not verified.
4. Use `under_review` during checks, then select `verified`, `rejected`, or `suspended`.
5. Add the evidence summary or decision reason. Rejected and suspended decisions require a note.

Suspending a CA firm worker also suspends their active firm membership. Re-verifying that worker returns a suspended membership to active. Every decision creates a CA audit-log entry without exposing unmasked identity documents.

Admin API:

- `GET /api/admin/ca/professionals`
- `GET /api/admin/ca/verifications`
- `PATCH /api/admin/ca/professionals/:id/verification`

## Status meanings

| Status | Meaning |
| --- | --- |
| Pending | Submitted but not yet reviewed |
| Under review | An administrator is checking evidence or clarification |
| Verified | The platform review passed |
| Rejected | The submitted evidence did not pass |
| Suspended / paused | Existing trust or access is temporarily withdrawn |

