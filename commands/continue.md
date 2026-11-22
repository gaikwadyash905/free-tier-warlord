---
description: "Pick up where we left off, using PLAN.md and CONTEXT.md in the project root"
---

Pick up where we left off. Notes: $ARGUMENTS

Plan:
!`head -n 120 PLAN.md 2>/dev/null || echo "(no PLAN.md: ask what to pick up)"`

Context:
!`head -n 80 CONTEXT.md 2>/dev/null || echo "(no CONTEXT.md yet)"`

Git status:
!`git status --short 2>/dev/null | head -n 40`

Say where we are in 3 short lines, then carry on from "Next" in PLAN.md (skill `long-running-work`). If a specialist was still working when we stopped, check its branch with `git log` and `git diff` before starting anything new.
