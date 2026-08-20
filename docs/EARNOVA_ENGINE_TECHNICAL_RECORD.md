# Earnova Capability Engine — Technical Record

Implementation record date: 2026-08-21. This is an engineering record, not a patent application or a claim of novelty.

## Technical problem and baseline

A business can appear ready while one operational dependency has become stale or failed. A naive verifier reruns every check after every change, increasing provider calls, latency, and diagnostic noise.

## Earnova approach

Earnova represents operational readiness as a directed capability graph. `SELL_ONLINE` depends on public web presence, product availability, payment acceptance, order capture, and fulfilment. Each leaf is supported by evidence with a normalized result and expiry timestamp. The engine deterministically derives parent state from dependency state.

Events map to direct evidence targets. The engine traverses only affected parents, preserves unrelated valid evidence, and creates a minimum prerequisite-first verification plan. For degraded states it returns the closest fault chain and a smallest-scope recovery proposal. Recovery is never an autonomous external action and requires confirmation.

## Evidence, freshness, and adapters

Evidence records are business-scoped and include capability key, evidence type, provider, state, observation/expiry times, fingerprint, and safe metadata. Current implementation supports internal product availability evidence. Other providers return an unconfigured state until a real adapter exists; no fake checks are created.

## Benchmark methodology and results

The deterministic benchmark compares the six-node full graph with the selective planner for shipping, payment, inventory, website deployment, and unrelated marketing events. It measures planned graph checks, not provider/network latency. Actual current results are maintained in [EARNOVA_ENGINE_BENCHMARKS.md](EARNOVA_ENGINE_BENCHMARKS.md).

## Implementation files

- `server/src/services/capabilityEngine.js` — graph, derivation, selective plan, isolation, recovery template
- `server/src/models/CapabilityEvidence.js` and `server/src/models/VerificationRun.js` — persisted evidence and run history
- `server/src/controllers/capabilityController.js` — customer-safe capability status response
- `server/src/models/BusinessEvent.js` — business event foundation
- `server/test/capability-engine.test.js` — deterministic engine tests
