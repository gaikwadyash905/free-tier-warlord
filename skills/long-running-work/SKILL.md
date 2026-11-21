---
name: "Long-Running Work"
description: "Use for multi-hour or multi-session tasks, large builds, long simulations and anything that may outlive one context window: progress file, checkpoints, background jobs, resumability."
---

## Progress file (survives compaction and restarts)
Create `PLAN.md` in the project root at the start (it is injected into context via the `instructions` config key, so it survives compaction and restarts) and update it after every milestone and before any long wait. Logs, checkpoints and big dumps still go to `.scratch/`:
```
# Goal / done-when
# Plan (numbered checklist; each step: owner agent + session #, e.g. "builder #1")
# Decisions and why
# Agent session log (agent #n -> task -> result -> STATUS)
# Verification checklist (every claim with its evidence: file:line, command + output, test run)
# Needs / gaps (skills, MCPs, models, commands not yet in config)
# Status: done / in progress / blocked
# Key paths, commands, parameters, seeds
# NEXT ACTION (one concrete step)
```
After compaction or in a new session: read it first, run `git status`, restate state in 3 lines, continue at NEXT ACTION.

## Work in small verified steps
One module or experiment at a time; test after each; commit only when the user asked. Keep the todo list synchronised with the progress file. Do not re-explore settled decisions.

## Long jobs (simulations, training, builds, load tests)
- Start in the background with a log: `nohup python run.py --seed 1 > .scratch/run1.log 2>&1 & echo $! > .scratch/run1.pid`; poll with `tail -n 20`, `ps -p $(cat ...)`; sleep between polls (`sleep 60`) instead of spamming calls (the model endpoint is rate limited).
- Make jobs resumable: write checkpoints (state, RNG state, step counter) every N steps to `.scratch/ckpt/`; support `--resume`.
- Smoke-test on a tiny problem first; estimate full runtime from it; set a wall-time budget and a stop condition.
- Log parameters, versions (`pip freeze > .scratch/env.txt`), git commit and seed with every result file; never overwrite results, version them.
- Check partial results early for NaNs, drift, divergence or wrong units rather than waiting for the end.

## Rate limits and failures
HTTP 429: wait 60 s, retry once, reduce parallelism. HTTP 404: wrong model ID, do not retry. Timeout/slow: wait; do not relaunch a subagent that has not reported. Persist state before risky steps.

## Finish
Update the progress file with final status, results location and what was not verified; summarise for the user with evidence.
