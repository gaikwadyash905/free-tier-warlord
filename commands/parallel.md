---
description: "Deliver a larger goal with parallel agents on separate git worktrees"
---

Deliver with parallel agents: $ARGUMENTS

Load the `parallel-agents` skill. Map the code (`explore`), split the goal into independent modules with disjoint file ownership and an interface contract for each, check `git status` is clean enough, then create one worktree and branch per writer (max 2 writers, 3 agents total), run them in parallel, merge into an integration branch, run the full suite, and finish with a review panel. If the pieces are coupled or share files, say so and do it sequentially instead. Never push; the user's branch changes only after approval.
