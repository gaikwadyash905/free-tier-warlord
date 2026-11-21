---
description: "Draft a PR title and description from the branch diff (does not push)"
---

Draft a pull request description. Notes: $ARGUMENTS

Branch:
!`git branch --show-current`

Commits on this branch (vs main or master):
!`B=main; git rev-parse --verify -q main >/dev/null || B=master; git --no-pager log --oneline $B..HEAD | head -n 40`

Files changed:
!`B=main; git rev-parse --verify -q main >/dev/null || B=master; git --no-pager diff --stat $B...HEAD | tail -n 40`

Load the `git-workflow` skill. Write: title (conventional style), what and why, how it was tested (only commands actually run), risks and rollback, screenshots needed, related issues. Output text only; do not push or open the PR.
