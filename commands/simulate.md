---
description: "Build, run and validate a physics or numerical simulation (long runs supported)"
agent: scientist
subagent: true
---

Simulate: $ARGUMENTS

Load `physics-modeling` and `long-running-work`. State the model and units, smoke-test on a tiny case, validate against an analytic or benchmark result and a convergence study, then run the full job in the background with logs and checkpoints under `.scratch/`. Report results with uncertainty, validation evidence, runtime and exact commands to reproduce.
