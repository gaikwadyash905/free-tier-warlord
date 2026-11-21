---
description: "Show worktrees, agent branches and what is ahead of the base"
---

Report the state of parallel work and recommend next steps.

Worktrees:
!`git worktree list`

Branches:
!`git branch -vv | head -n 40`

Current branch and status:
!`git branch --show-current; git status --short | head -n 30`

Recent history:
!`git --no-pager log --oneline --graph --all -n 25`

Summarise: which `agent/*` branches exist, which are merged, which have unmerged commits, any dirty worktrees, and the safest next action. Do not change anything.
