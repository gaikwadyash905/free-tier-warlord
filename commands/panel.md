---
description: "Parallel review panel: correctness, security and behaviour on the current diff"
---

Run a review panel on the current changes. Focus: $ARGUMENTS

Status:
!`git status --short`

Diff stat:
!`git --no-pager diff HEAD --stat | tail -n 40`

Launch `reviewer` (correctness, maintainability), `sec` (security of the changed code; no active testing unless the target is clearly local) and `tester` (run tests, probe edge cases) in parallel on this diff with a different lens each. Wait for all reports, then give ONE deduplicated list of findings ranked by severity with `path:line`, which lens found each, and a ship / fix-first verdict.
