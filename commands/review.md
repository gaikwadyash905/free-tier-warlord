---
description: "Independent review of the current uncommitted changes (add \"security\" to focus on security)"
agent: reviewer
subagent: true
---

Review the current changes. Focus: $ARGUMENTS

Status:
!`git status --short`

Diff (truncated to 1500 lines):
!`(git --no-pager diff HEAD 2>/dev/null || git --no-pager diff) | head -n 1500`

Use the `code-review` skill. Report findings by severity with `path:line`, then a verdict: ship or fix first.

If the focus mentions security, also load the `security-testing` skill and report exploitable issues (authn/authz, injection, SSRF, path traversal, secrets, crypto, races, dependency risk) with `path:line`, impact and a concrete fix; separate confirmed issues from hypotheses.
