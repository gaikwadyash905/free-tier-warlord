---
name: long-running-work
description: "Use for multi-hour or multi-session tasks, large builds, long simulations and anything that may outlive one context window: progress file, checkpoints, background jobs, resumability."
---

## Project docs (survive compaction and restarts)
`PLAN.md` and `CONTEXT.md` live in the project root and are loaded into context automatically through the `instructions` config key. Create them at the start of a long task and update PLAN.md after every milestone and before any long wait. Logs, checkpoints and big dumps still go to `.scratch/`. Keep each file under about 60 lines.
```
PLAN.md
# Goal            (what "done" looks like)
# Steps           (- [ ] step: who does it)
# Who's working on what   (agent | branch | files | status)
# Next            (one concrete step)

CONTEXT.md
# About           (what this project is)
# Decisions       (what and why)
# Conventions and gotchas   (key paths, commands, seeds, things that bit us)
```
After compaction or in a new session: read both, run `git status`, say where things stand in 3 lines, continue at Next.

## Work in small verified steps
One module or experiment at a time; test after each; commit only when the user asked. Keep the todo list in step with PLAN.md. Do not re-explore settled decisions.

## Long jobs (simulations, training, builds, load tests)
- Start in the background with a log: `nohup python run.py --seed 1 > .scratch/run1.log 2>&1 & echo $! > .scratch/run1.pid`; poll with `tail -n 20`, `ps -p $(cat ...)`; sleep between polls (`sleep 60`) instead of spamming calls (the model endpoint is rate limited).
- Make jobs resumable: write checkpoints (state, RNG state, step counter) every N steps to `.scratch/ckpt/`; support `--resume`.
- Smoke-test on a tiny problem first; estimate full runtime from it; set a wall-time budget and a stop condition.
- Log parameters, versions (`pip freeze > .scratch/env.txt`), git commit and seed with every result file; never overwrite results, version them.
- Check partial results early for NaNs, drift, divergence or wrong units rather than waiting for the end.

## Rate limits and failures
HTTP 429: wait 60 s, retry once, reduce parallelism. HTTP 404: wrong model ID, do not retry. Slow is not failed: wait; never relaunch a subagent that has not reported. Persist state before risky steps.

## Finish
Update PLAN.md with final status, results location and what was not verified; summarise for the user with evidence.
