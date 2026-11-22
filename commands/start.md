---
description: "Set up PLAN.md and CONTEXT.md for this project (skips files that already exist)"
---

Set up the planning docs for this folder. About the project: $ARGUMENTS

Existing files:
!`ls PLAN.md CONTEXT.md 2>&1 | head -n 4`

Look around first (README, `git status`, top-level files). Then create whichever of these is missing, short and specific to this project, and leave existing ones alone:
- `PLAN.md`: `# Goal`, `# Steps` (checklist, with who does each), `# Who's working on what` (agent, branch, files, status), `# Next`
- `CONTEXT.md`: `# About`, `# Decisions` (what and why), `# Conventions and gotchas`

No secrets, medical or personal data in either file. Add `.scratch/` to `.gitignore` or `.git/info/exclude` if it isn't ignored. Confirm in two lines.
