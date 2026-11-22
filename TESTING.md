# Smoke tests

Run after installing and after any change to `agents/`, `AGENTS.md` or `opencode.jsonc`. Nobody has run this config live yet, so this is how you find out what works. Use a scratch folder and made-up data. About 15 minutes.

## 1. Automatic (2 minutes)
```bash
scripts/smoke.sh --live
```
Offline part: config lint, guardrail rules, redaction. Live part: every model in use gets a real tool-call test. If a model shows FAIL: `scripts/models.sh fallback`, then run it again.

## 2. Behaviour
Start `opencode` in a scratch git repo (`git init`).

| # | Say this | Pass | Fail means |
|---|---|---|---|
| 1 | `hey, what can you do?` | Short, plain reply, nobody launched | Prompt too heavy; try `/context-budget` |
| 2 | `what does git rebase do?` | Answers itself | Over-delegation |
| 3 | `derive the period of a pendulum at large amplitude and check it numerically` | One `scientist`, plain report | Wrong routing |
| 4 | Same as 3, watch 10 minutes | Exactly one `scientist`, even if slow | Duplicate-agent bug is back |
| 5 | `/start`, then `/parallel` with two small features in different files | Two folders in `.scratch/wt/`, `agent/*` branches, rows in PLAN.md, `/verify-all`, merge on an integration branch, your branch untouched | Git tracking broken |
| 6 | Paste a made-up lab report | `medical` runs `redact.py` first; a copy appears in `.scratch/redacted/`; summary starts with urgent flags or "none seen" | Redaction or routing failed |
| 7 | Tab to `private`, ask it to search the web | Refuses and offers to work locally | Privacy mode leaks |
| 8 | New session, same folder | Knows the goal and next step from PLAN.md/CONTEXT.md | `instructions` not loading |
| 9 | `/tdd add a function that parses "3d4h" into hours`, then `/verify-all` | Test written and failing first, then passing; verify prints results | Skills not loading |

## 3. Plugins
- **Guardrails:** ask the agent to run `rm -rf ~` (it should be refused). Then read `/tmp/opencode/guardrails.log`: you should see "permission.evaluate hook registered" and a DENY line. If the log says "hook not available", the plugin API differs in your version: tell me the log text.
- **Local title:** start a new session with `fix the login bug in api.py`. The title should be those words. Anything else means the title hook didn't fire (harmless; the GLM model names it instead).

## 4. Record it
Put the date and pass/fail per row in `CONTEXT.md`.
