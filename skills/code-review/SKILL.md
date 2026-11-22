---
name: code-review
description: "Use when reviewing a diff or pull request for correctness, security, concurrency, compatibility, performance and test quality."
---

## Procedure
1. Read `git status` and the full diff; read the surrounding code of each change and the callers. Do not trust the author's description.
2. Understand intent, then review in priority order:
   1. Correctness and data loss: edge cases, off-by-one, null/empty, time zones, overflow, error paths, partial failure, idempotency.
   2. Security: authz on every path, injection, secrets, SSRF/path traversal, unsafe deserialisation, crypto misuse, logging of sensitive data.
   3. Concurrency: races, locks, ordering, shared mutable state, async cancellation, resource leaks.
   4. Compatibility: public API/ABI, schema and migration safety (expand/migrate/contract), config defaults.
   5. Performance: complexity, N+1 queries, unbounded memory/loops, blocking calls in async code.
   6. Observability and operability: logs, metrics, timeouts, retries with backoff.
   7. Tests: do they fail without the change? boundary and failure cases covered? mocks hiding real behaviour?
3. Run what you can (tests, linter, type-check) when allowed; otherwise say you did not.

## Findings format
`severity (blocker|major|minor)` | `path:line` | impact | evidence or reasoning | concrete fix. Mark confirmed vs hypothesis. No style nitpicks the formatter handles. If clean: list what was inspected and what remains unverified.
End with a verdict: ship, or fix first (with the blocking items).
