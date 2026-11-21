---
description: "Commit the current changes with conventional messages (never pushes)"
---

Commit the current changes. Notes: $ARGUMENTS

Load the `git-workflow` skill. Stage only intended files (never `.scratch/`, secrets or build output), split unrelated changes into separate commits, use conventional commit messages that match the repository's style, and do not push.

Status:
!`git status --short`

Change summary:
!`git --no-pager diff HEAD --stat | tail -n 40`

Recent history (match this style):
!`git --no-pager log --oneline -8`
