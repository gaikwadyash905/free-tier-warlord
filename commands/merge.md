---
description: "Integrate agent/* branches: merge, test, review, report (never pushes)"
---

Integrate agent branches. Notes: $ARGUMENTS

Worktrees:
!`git worktree list`

Agent branches:
!`git branch --list 'agent/*' -vv`

Current branch:
!`git branch --show-current`

Follow the `parallel-agents` skill: create or reuse the integration worktree, merge the finished branches with `--no-ff`, resolve conflicts from both sides, run the full tests and a review panel on the merged diff, and report. Only offer a fast-forward of the user's branch after approval. Do not push, force, prune or delete unmerged branches.
