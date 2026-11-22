# free-tier-warlord v1

> Squeezing million AI agents, billion MCP servers, and a parallel worktree build system out of $0.00/month in API costs. Zero-retention model routing because I'm paranoid, not paying.

One assistant you talk to (the orchestrator). It answers simple things itself and sends bigger jobs to a team of specialists: coding, design, physics/maths, medical, music, security, research and everyday work. Free models only, plain files, a few small optional scripts. Built for long runs: medical document analysis, physics simulations, large projects, security work and the everyday stuff.

The "million agents, billion MCP servers" is the dream; today it's 13 agents, 10 MCP servers, and a worktree system that runs up to two coders in parallel. The paranoid part, precisely: builder, architect, sec, scientist, `private` and `medical` run on a zero-retention model. The orchestrator and the light agents run on NVIDIA's free endpoint, which may keep what you send, so anything sensitive goes to `private` (Tab). The Privacy table below says who sees what.

**Honest status:** written and checked offline (`scripts/smoke.sh`), never run live. No free model matches the newest Opus. In one independent benchmark write-up, DeepSeek V4.1 Flash, the best free model I found, scored 73% against Opus 5.5's 87%, about Sonnet level. The design makes up for the gap with a small prompt, one specialist per job, test-first work, an independent reviewer and a verify step.

```
opencode.jsonc  providers, models, MCP servers, permissions, hard policies
AGENTS.md       32 lines every agent follows
agents/         orchestrator (default), private (Tab); architect builder tester reviewer sec researcher scientist medical designer music daily
commands/       32 slash commands (shortcuts, never required)
skills/         19 on-demand checklists
plugins/        guardrails.ts (blocks catastrophic shell commands), local-title.ts (session titles made locally)
scripts/        models.sh (health check + failover), redact.py, lint-config.py, smoke.sh
install.sh      backs up and installs into ~/.config/opencode
```

## Install
```bash
./install.sh --dry-run   # see what it will do
./install.sh             # backs up ~/.config/opencode first, runs the config lint
```
Then `/connect` -> NVIDIA NIM -> paste `nvapi-...`, and run `~/.config/opencode/scripts/models.sh check`. Zen free models (`opencode/...`) need no key. Optional keys: `GROQ_API_KEY` (failover), `OPENROUTER_API_KEY` (image generation).

## Models
| Agent | Model | Why |
|---|---|---|
| builder, architect, sec, scientist | `opencode/deepseek-v4.1-flash-free` | best free coding/agent scores in both write-ups I found (DeepSWE 74 vs GLM 63; Bito's own runs 73 vs 66); Zen states zero retention |
| reviewer | `nvidia/nemotron-ultra` | a different model family from builder, so it doesn't share its blind spots |
| orchestrator, researcher, tester, designer, music, daily | `nvidia/glm-5-3-flash` | your choice: fast, tool use, 200K context |
| private, medical | `opencode/deepseek-v4.1-flash-free` | zero retention, text only |
| titles | `local-title` plugin, else `nvidia/glm-5-3-flash` | see Privacy |

Benchmarks are vendor-reported or from one reviewer, not mine. Free lists change often (GLM 5.3 was added to and dropped from NIM several times in October), so don't trust this table: run the check below.

## Failover
```bash
scripts/models.sh check      # real tool-call test of every model in use: PASS/FAIL
scripts/models.sh fallback   # replaces each failing model by its fallback
scripts/models.sh use FROM TO
```
Fallback chain: GLM -> Zen DeepSeek -> NIM DeepSeek -> Groq `gpt-oss-120b` (needs `GROQ_API_KEY`). `private` and `medical` are never moved to a provider that keeps data unless you pass `--force`. NIM's own `deepseek-v4-1-flash` has conflicting evidence (EOL error on 2026-11-17, probe says free on 2026-11-19), so it is declared but only used as a fallback. MiniMax M3.1 Flash is declared (`nvidia/minimax-m3-1-flash`) but unused: tool calling is unconfirmed. Don't use `opencode/glm-5.3-flash-free` (deprecated on Zen).

## Privacy
| Where | Who may keep your text |
|---|---|
| orchestrator, researcher, tester, designer, music, daily, reviewer (`nvidia/*`) | NVIDIA's terms allow improving its products and say not to send sensitive data. I did not read the trial terms themselves. |
| builder, architect, sec, scientist, private, medical (Zen DeepSeek) | Zen states zero retention, read on 2026-11-22. Re-check before relying on it. |

Medical files are redacted locally by `scripts/redact.py` before any model reads them (names, relatives, doctors, hospitals, addresses, phone, email, IDs, dates; keeps age, sex and all values and ranges). Names inside free text can slip through, so skim the copy. Session titles: `local-title.ts` builds them on your machine; if that hook doesn't work in your OpenCode version, the title falls back to the GLM model and your first message goes to NVIDIA, even in `private`. Music stays off web tools. Canva is off (needs an account, edits real designs); image generation needs an OpenRouter key.

## What's in the box
- **Verify loop:** `/tdd`, `/fix-build`, `/verify-all` (build, types, lint, tests, secrets scan, audit), then `reviewer`. Skills `tdd`, `build-fix`, `refactor-and-docs`, `coding-standards`.
- **Memory without clutter:** `PLAN.md` and `CONTEXT.md` load every session; `/learn` proposes lessons and saves only what you approve; `/context-budget` shows what is loaded.
- **Parallel coders:** one worktree and `agent/<task>` branch each, tracked in `PLAN.md`; `/branches`, `/dashboard`; nothing is pushed.
- **MCP:** context7, deepwiki, thinking, memory, mermaid, excalidraw, mitre, playwright, devtools, Parallel (keyless search backup). Canva off.
- **Guardrails:** catastrophic shell commands denied through the documented permission hook (rules tested by `scripts/test-guardrails.mjs`).

## Compared with everything-claude-code
Copied as ideas: plan -> test -> implement -> review -> verify loop, language standards loaded on demand, build-fix and refactor skills, context budget, approved-only learning, install script, hooks. Not copied: 72 agents, 328 skills and 99 commands. A weak model routes worse with a long list, so this keeps 13 agents.

## Limits
- Nothing was run live; model ids, free status and privacy terms came from docs and articles on 2026-11-22.
- The plugin API is only partly documented. Guardrails uses the documented deny hook; `local-title` guesses the event fields and does nothing if they're wrong. There are no automatic post-edit lint hooks because I couldn't confirm a safe way to do them.
- Free tiers rate-limit (NIM about 40 requests a minute shared), so slow is normal: the orchestrator waits instead of relaunching.
- Pushing and publishing are always left to you.
