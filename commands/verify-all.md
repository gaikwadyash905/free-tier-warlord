---
description: "Full check before you trust a change: build, types, lint, tests, secrets scan, then an independent review"
agent: tester
subagent: true
---

Verify everything: $ARGUMENTS

Run these in order and quote each command with its result (exit code, counts). Skip a step only if the project has no such tool, and say so.
1. Build, then type-check, then lint/format check.
2. Narrowest tests for the changed files, then the full suite. Rerun failures 3 times to spot flaky ones.
3. Secrets: `gitleaks detect --no-git --source .` if installed, otherwise `grep -rnEI "(api[_-]?key|secret|token|passw(or)?d)\s*[:=]\s*['\"][^'\"]{8,}" --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.scratch .`. Report location and type only, never the value.
4. Dependencies: `pip-audit`, `npm audit`, `cargo audit` or `osv-scanner` if present.
5. `git status` and `git diff --stat`: anything unexpected changed?

End with one line: green, red, or not runnable and why. Then list what was not verified. The orchestrator will ask `reviewer` for a second opinion after this.
