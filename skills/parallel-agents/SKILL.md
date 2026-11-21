---
name: "Parallel Agents and Git Worktrees"
description: "Use to run several subagents at once safely: split work into independent modules, give each writer its own git worktree and branch, integrate through an integration branch, run review panels and best-of-N races."
---

## When parallel pays off
Parallelise: independent modules with a clear interface (from an SRS), research sub-questions, multi-lens review (correctness / security / behaviour), best-of-2 on a hard problem, tests written while code is implemented.
Stay sequential: tightly coupled changes, shared files, a single small fix, anything where step 2 needs step 1's output. Limits: at most 3 agents running, at most 2 writers, back off on HTTP 429.

## Preconditions
1. `git status --short`: worktrees start from the last COMMIT, so uncommitted changes are invisible to them. If the task depends on them, ask the user to commit or stash first.
2. `.scratch/` must be git-ignored (`echo '.scratch/' >> .git/info/exclude` if not).
3. Split by file ownership: each writer owns a disjoint set of paths. Shared files (lockfiles, package manifests, route tables, `__init__`/index exports, CI config) belong to the orchestrator and are edited after merging.

## Worktree recipe (orchestrator runs these)
```bash
BASE=$(git branch --show-current)                      # remember it
git worktree add .scratch/wt/<task> -b agent/<task> "$BASE"
# repeat per writer; integration worktree:
git worktree add .scratch/wt/integration -b agent/integration-<goal> "$BASE"
git worktree list
```
Dependencies are per worktree: the builder runs `npm ci` / `python3 -m venv .scratch/venv && pip install -r ...` inside its worktree (do not share `node_modules` or a venv across worktrees).

## Brief for a writer in a worktree
Goal, owned paths, forbidden paths, interface contract (signatures from the SRS), acceptance tests, and:
"Work ONLY in `<absolute path>/.scratch/wt/<task>`. Start every shell command with `cd <that path> &&`; read and edit with absolute paths under it. Commit small conventional commits on branch `agent/<task>` (local only, never push). Run the narrow tests, then the full suite there. Report branch, commit list, tests run, anything outside your paths you needed."

## Integrate
```bash
cd .scratch/wt/integration
git merge --no-ff agent/<task-a> -m "merge: <task-a>"
git merge --no-ff agent/<task-b> -m "merge: <task-b>"
# then: shared files, full test suite, linter/type-check, review panel on: git diff "$BASE"...HEAD
```
Conflicts: read both sides and the SRS interface, resolve in the integration worktree, re-run tests. Do not resolve by taking one side blindly. If two branches fought over a file, the ownership split was wrong: note it.
The user's own branch changes only after approval, and only as a fast-forward: `git merge --ff-only agent/integration-<goal>` from a clean main worktree. Never push.

## Review panel (parallel read-only)
Run `reviewer` (correctness, maintainability), `sec` (security, in scope only) and `tester` (run the tests, probe edge cases) on the same diff with different lenses. Merge findings: deduplicate, rank by severity, mark which lens found each.

## Race (best-of-2)
Two builders implement the same spec in separate worktrees (`agent/<task>-a`, `-b`), same acceptance tests. Compare: tests passing, diff size, complexity, reviewer opinion. Keep one, or cherry-pick the best parts (`git cherry-pick`).

## Cleanup
After the user accepted or rejected the result: `git worktree remove .scratch/wt/<task>` then `git branch -d agent/<task>` (merged branches only). Keep failed branches until the user has seen the report. `git worktree list` and `git branch --list 'agent/*' -vv` show what is left; never use `--force`, `-D` or `prune` without the user's approval.

## Failure handling
A writer that stalls or reports blocked: wait (slow is not failed), then read its worktree `git log` and `git diff` to salvage work. A 404 from a subagent means a wrong model ID: do not retry, do the task yourself or via `general`.
