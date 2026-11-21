---
description: "IDE-style dashboard: running agents, git changes, diffs, plan progress, worktrees, sessions"
---

Dashboard for the current project. $ARGUMENTS

Plan (PLAN.md, single source of truth):
!`head -n 60 PLAN.md 2>/dev/null || echo "(no PLAN.md yet)"`

Git changes and diff:
!`git status --short 2>/dev/null | head -n 30`
!`git diff --stat 2>/dev/null | tail -n 5`
!`git log --oneline -n 5 2>/dev/null`

Top-level sessions (newest first):
!`opencode session list 2>/dev/null | head -n 15`

Agent worktrees and branches:
!`git worktree list 2>/dev/null | head -n 10`
!`git branch --list 'agent/*' 2>/dev/null | head -n 10`

Summarise on one screen: agents running (with session #s), uncommitted changes, diff size, PLAN.md progress, and the next action.
