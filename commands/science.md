---
description: "Derive and numerically verify a physics, maths, algorithm or statistics result, or build and validate a simulation"
agent: scientist
subagent: true
---

Work out and verify: $ARGUMENTS

Load the `physics-modeling` skill. State assumptions and units, derive, check limiting cases, verify numerically in Python under `.scratch/`, quantify uncertainty, and label every result (proved / numerically verified / simulated / literature / conjectured).

For a simulation or a long run, also load `long-running-work`: smoke-test on a tiny case, validate against an analytic or benchmark result plus a convergence study, then run the full job in the background with logs and checkpoints under `.scratch/`. Report results with uncertainty, validation evidence, runtime and the exact commands to reproduce.
