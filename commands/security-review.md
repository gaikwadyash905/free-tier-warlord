---
description: "Security review of the current uncommitted changes"
agent: reviewer
subagent: true
---

Security-review the current changes. Focus: $ARGUMENTS

Status:
!`git status --short`

Diff (truncated to 1500 lines):
!`(git --no-pager diff HEAD 2>/dev/null || git --no-pager diff) | head -n 1500`

Load the `security-testing` and `code-review` skills. List assets, trust boundaries and attacker capabilities, then report exploitable issues (authn/authz, injection, SSRF, path traversal, secrets, crypto, race conditions, dependency risk) with `path:line`, impact and a concrete fix. Separate confirmed issues from hypotheses.
