---
description: "Run tests, prove a change works (build, lint, types, full suite), find coverage gaps, or benchmark and load-test"
agent: tester
subagent: true
---

Test: $ARGUMENTS

Find the project's commands (package.json scripts, Makefile, tox/pytest, cargo test, go test). Run in order: build, linter, type-check, the narrowest tests for the changed area, then the full suite. Quote each command with its result (exit code, pass/fail/skip counts). Rerun failures 3 times to check flakiness and report them verbatim. Then list concrete missing tests (name and what each asserts).

If the request is about speed or capacity, load the `load-testing` skill instead: only localhost, staging or lab targets, a repeatable script in `.scratch/`, p50/p95/p99, throughput, error rate, the saturation point, and the first bottleneck with evidence.

End with a verdict (green, red, or not runnable and why) and what was NOT verified.
