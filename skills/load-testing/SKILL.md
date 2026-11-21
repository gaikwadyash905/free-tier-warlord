---
name: "Load and Performance Testing"
description: "Use for benchmarks, load tests, capacity planning and performance bottleneck analysis of services and functions on localhost, staging or lab systems."
---

## Method
1. **Goal and SLO**: target throughput, p95/p99 latency, error budget. Without numbers, derive them from the expected users (requests/s = users x actions/user/s; peak = 3-10x average).
2. **Environment**: localhost/staging only, production-like data volume, warm-up (discard first 30-60 s), fixed seeds, note CPU/RAM/network of generator and target (the generator must not be the bottleneck: watch its CPU).
3. **Workload model**: closed (N users with think time; Locust/k6 VUs) vs open (fixed arrival rate; k6 `constant-arrival-rate`, `wrk2`, `vegeta`). Use open model to find saturation and avoid coordinated omission.
4. **Run**: ramp (step load) -> steady state (>= 5 min) -> spike -> soak (hours, for leaks). Repeat 3 times and report variance.
5. **Measure**: latency p50/p95/p99/max, throughput, error rate, saturation (CPU, memory, GC, DB connections, queue depth, disk, network). Use RED (rate, errors, duration) for services and USE (utilisation, saturation, errors) for resources.
6. **Analyse**: find the knee where latency rises; Little's law `L = lambda x W` to check consistency; locate the first bottleneck with profiling (`py-spy`, `perf`, `pprof`, flamegraphs, `EXPLAIN ANALYZE`); change one thing at a time and re-measure.

## Tools
`k6` (scripts in JS), `locust` (Python), `wrk`/`wrk2`, `hey`, `vegeta`, `pytest-benchmark`, `hyperfine` (CLI), `criterion` (Rust). Put scripts in `.scratch/` or `loadtest/`.

## Report
Environment, workload definition, table of load step vs p50/p95/p99/errors, saturation point, bottleneck with evidence, recommended fix and the re-test result, limits (what was not tested).
