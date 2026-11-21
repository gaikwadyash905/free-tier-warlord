---
description: "Prove it works: build + lint + type-check + full test suite, with quoted evidence (tester)"
agent: tester
subagent: true
---

Prove the current change works: $ARGUMENTS

Find the project's verification commands (package.json scripts, Makefile, tox/pytest, cargo test, go test). Run in order: build/compile, linter, type-check, the narrowest tests covering the changed area, then the FULL suite. Quote each command with its result (exit code, pass/fail/skip counts). If anything fails, rerun it up to 3 times to check flakiness and report the failure verbatim. End with: VERDICT (green / red / not runnable + exact reason), the evidence per command, and what was NOT verified.
