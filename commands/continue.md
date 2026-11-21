---
description: "Resume a long task from PLAN.md in the project root"
---

Resume the task. Notes: $ARGUMENTS

Plan file (single source of truth, auto-loaded via `instructions`):
!`head -n 200 PLAN.md 2>/dev/null || echo "(no PLAN.md: ask what to resume)"`

Git status:
!`git status --short 2>/dev/null | head -n 40`

Restate where we are in 3 lines, then carry on from NEXT ACTION in PLAN.md following the `long-running-work` skill.
