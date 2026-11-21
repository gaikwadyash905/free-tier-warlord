---
description: "Independent review of the current uncommitted changes"
agent: reviewer
subagent: true
---

Review the current changes. Focus: $ARGUMENTS

Status:
!`git status --short`

Diff (truncated to 1500 lines):
!`(git --no-pager diff HEAD 2>/dev/null || git --no-pager diff) | head -n 1500`

Use the `code-review` skill. Report findings by severity with `path:line`, then a verdict: ship or fix first.
