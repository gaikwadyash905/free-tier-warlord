---
name: debugging
description: "Use for bugs, failing tests, crashes, flaky behaviour and performance regressions: find the root cause before changing code."
---

1. **Reproduce**: get a minimal, deterministic reproduction (command, input, environment, version). Capture the exact error and stack. If flaky, loop it (`for i in $(seq 20)`), pin seeds and record the failure rate.
2. **Minimise**: delete inputs, config and code until the failure is smallest. Note what changes the behaviour.
3. **Hypothesise**: list 2-4 candidate causes ranked by likelihood; each must predict something you can check.
4. **Isolate**: read the code path end to end; add targeted logging or assertions; `git bisect run <cmd>` to find the offending commit; compare working vs failing environments (versions, env vars, data).
5. **Confirm the root cause** with an experiment that fails with it and passes without it. Do not fix symptoms (no blanket try/except, retries or sleeps unless the cause is genuinely transient).
6. **Fix** the smallest thing that removes the cause; add a regression test that fails before the fix and passes after; look for the same bug pattern elsewhere (`grep`).
7. **Verify**: run the full suite, the original reproduction and neighbouring behaviour. Remove temporary instrumentation.
8. **Report**: cause, evidence, fix, test added, what else could be affected.

Concurrency bugs: look for shared state, ordering assumptions, missing awaits, lock scope. Performance regressions: profile first (`py-spy`, `perf`, flamegraph), do not guess. Heisenbugs: change one variable at a time and record results in PLAN.md.
