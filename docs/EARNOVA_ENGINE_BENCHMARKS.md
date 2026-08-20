# Earnova Engine Benchmarks

Deterministic graph-planner scenarios. Counts are generated from the current six-node capability graph, not external calls.

| Scenario | Full checks | Selective checks | Reduction |
| --- | ---: | ---: | ---: |
| Shipping configuration changed | 6 | 2 | 66.7% |
| Payment configuration changed | 6 | 2 | 66.7% |
| Inventory changed | 6 | 2 | 66.7% |
| Website deployment changed | 6 | 2 | 66.7% |
| Unrelated marketing event | 6 | 0 | 100% |

Execution duration is deliberately not reported: this deterministic planning benchmark performs no external verification calls.
