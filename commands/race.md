---
description: "Best-of-two: two builders implement the same task on separate worktrees, keep the better one"
---

Race two implementations of: $ARGUMENTS

Load the `parallel-agents` skill. Write or confirm the acceptance tests first. Create worktrees `agent/<task>-a` and `agent/<task>-b`, give both builders the same spec with different suggested approaches, and run them in parallel. Compare tests passing, diff size, complexity and a reviewer's opinion; keep the better one (or cherry-pick the best parts into an integration branch), report why, and leave the user's branch untouched.
