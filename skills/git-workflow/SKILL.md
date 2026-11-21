---
name: "Git Workflow"
description: "Use when committing, branching, writing commit messages or PR descriptions, or working with git worktrees. Never pushes or rewrites history unless asked."
---

- Before committing: `git status`, `git diff` (staged and unstaged). Stage explicit paths (`git add <path>`), not `git add -A`. Never stage `.scratch/`, `.env*`, keys, build output, large binaries.
- Branches: work on a feature branch, `type/short-description` (e.g. `feat/rate-limiter`, `fix/null-user-id`).
- Commits: small and atomic (one logical change plus its tests). Conventional format: `type(scope): imperative summary` (<= 72 chars), types `feat fix refactor perf test docs build ci chore`; body explains why, not what; breaking changes noted with `!` or `BREAKING CHANGE:`. Match the repository's existing style (`git log --oneline -10`).
- Do not push, force-push, amend published commits, rebase shared branches, or run `git reset --hard` / `git clean -f` without the user's explicit request.
- PR description: what and why, how it was tested (commands and results), risks and rollback, screenshots for UI, linked issues.
- Parallel experiments and multi-agent work: one git worktree per writer under `.scratch/wt/<task>` on `agent/<task>` (skill `parallel-agents`). Agents commit on `agent/*` branches only; the user's branch changes only after approval, by fast-forward. Delete a worktree only after its branch is merged or abandoned.
- Useful reads: `git diff <base>...HEAD` (what this branch added), `git log --oneline <base>..HEAD`, `git branch --list 'agent/*' -vv`, `git worktree list`, `git bisect run <cmd>`, `git blame -w -C`, `git stash push -m <msg>` before risky experiments.
- Merge conflicts: understand both sides before resolving; re-run tests after.
