---
description: "Run and analyse tests, find coverage gaps (tester)"
agent: tester
subagent: true
---

Test: $ARGUMENTS

Find the project's test commands, run the narrowest relevant tests then the full suite, rerun failures 3 times to check flakiness, and report passed/failed/skipped/not run plus concrete missing tests.
