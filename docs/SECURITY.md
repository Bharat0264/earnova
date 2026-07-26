# Earnova Security Baseline

## Implemented in Phase 1

- bcrypt password hashing.
- Signed, expiring JWT bearer tokens.
- Active-user checks and backend admin authorization.
- Role/intent-aware protected frontend routes.
- Auth and password-reset throttling.
- Explicit CORS allow-list.
- Baseline secure response headers.
- Request IDs and production-safe global errors.
- Server-side commerce total calculation.
- Razorpay signature and webhook verification.
- Upload size and MIME allow-lists.
- Owner-scoped queries in core user/order/service flows.

## Known limitations

- Bearer tokens remain in browser local storage for backward compatibility. Move to short-lived access tokens plus rotated secure HTTP-only refresh cookies in a dedicated auth migration. Add CSRF protection when cookies are used.
- Email verification, session invalidation/versioning, device/session management, compromised-password screening, granular admin permissions, append-only audit logs, antivirus upload scanning, and central schema validation are incomplete.
- The current business workspace is user-scoped and must not be treated as the final multi-tenant model.
- Interim privacy/terms content requires legal review.

## Reporting

Do not include secrets, full identity documents, payment credentials, or other users' records in support messages or issue reports. Record the request ID, affected route, timestamp, expected result, and sanitized reproduction details.
