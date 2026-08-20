# Earnova Production Readiness

Updated: 2026-08-21

## Product and routes

Earnova connects an authenticated user and selected `Business` through Start, Build, Source, Operate, activity, and account flows. Primary routes are `/`, `/start`, `/start/roadmap`, `/build`, `/build/start`, `/source`, `/source/request`, `/operate`, `/operate/status`, `/activity`, and `/account`. Routes that create or view business data remain protected and enforce business membership on the API.

## Business and engine architecture

`Business` owns a `BusinessBlueprint`, roadmap items, Build projects, RFQs, business events, capability evidence, and verification-run history. The initial capability graph is `SELL_ONLINE` depending on public web presence, product availability, payment acceptance, order capture, and fulfilment. Evidence has a normalized state, observation time, expiry time, and provider-safe metadata. The deterministic engine derives status, marks only event-related evidence stale, plans prerequisite-first selective rechecks, isolates a fault chain, and produces a confirmation-required recovery plan.

## Evidence and freshness

The current application has an internal product/inventory evidence adapter. External web, payment, and shipping checks remain unconfigured until their respective approved integrations are present. Freshness is policy-driven in `server/src/services/capabilityEngine.js`; expired evidence is treated as stale rather than indefinitely verified.

## Security controls

- Business-scoped APIs use authenticated membership and object-ID validation.
- Capability status never returns provider secrets, credentials, raw evidence metadata, or internal graph details to customer UI.
- Capability checks do not initiate payment transactions.
- No arbitrary URL verifier is enabled; therefore no customer-provided URL is fetched by the capability engine. Any future web adapter must enforce approved-domain and SSRF protection before release.
- Recovery plans are advisory and explicitly require user confirmation before external mutation.

## Environment and deployment

Use the existing `.env.example` as the environment-variable contract. Configure the production API base, database connection, authentication secret, and only the approved payment/email/provider credentials required by the deployment. Do not commit secret values. Deploy the API and client together with database migrations/index creation reviewed against production data first.

## Known release limitations

- Full external website, Razorpay configuration, and shipping adapters are not implemented; their capability states remain unconfigured instead of simulated.
- The legacy admin/seller/provider surfaces are preserved for compatibility and require a separate product migration before being removed.
- Browser-based end-to-end tests require a running API, configured database, and test credentials; they were not run in this workspace.

## Benchmarks

See [EARNOVA_ENGINE_BENCHMARKS.md](EARNOVA_ENGINE_BENCHMARKS.md). The benchmark measures graph-planning work only, not network calls or provider latency.
