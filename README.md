# OpenCode NIM Team v5

NVIDIA NIM free endpoints only. Plain files, no scripts. Built for long runs: medical document analysis, physics simulations, calculations, large projects, security work.

```
opencode.jsonc  provider + verified model IDs (incl. deepseek-v4.1-flash), 7 MCP servers, worktree dir, permissions, hard policies
AGENTS.md       global rules (your CLAUDE.md)
agents/         orchestrator (default) + architect builder tester reviewer sec researcher verifier scientist medical
commands/       25 slash commands
skills/         11 skills loaded on demand
plugins/        keepalive.ts — auto-loaded local plugin (see v7 below)
.gitignore      for `git init` in ~/.config/opencode (keeps memory.json and logs out)
```

## Install
From the unzipped folder:
```bash
mkdir -p ~/opencode-backup-$(date +%F) && cp -r ~/.config/opencode/. ~/opencode-backup-$(date +%F)/
cd ~/.config/opencode && rm -rf agents commands skills opencode.json opencode.jsonc && cd -
cp -r agents commands skills opencode.jsonc AGENTS.md .gitignore ~/.config/opencode/
opencode debug agents && opencode mcp list
```
Key: `/connect` -> NVIDIA NIM -> paste `nvapi-...` (or export `NVIDIA_API_KEY`). The config does not set `apiKey`; an empty `{env:...}` would override the key you stored.

## Verify the models once (30 seconds)
```bash
mkdir -p /tmp/mt && cd /tmp/mt
for m in nvidia/mistral-large-4 nvidia/glm-5-3-flash nvidia/deepseek-v4.1-flash; do echo "== $m"; timeout 700 opencode run --model "$m" "Reply with exactly: PONG"; done
```
Model IDs below were checked against NVIDIA's live `/v1/models` list on 2026-11-16; whether each one drives tool calls in agents is what this loop tests.

## Who uses what
| Agent | Model | Why |
|---|---|---|
| orchestrator, architect, builder, reviewer, sec, designer, re | `nvidia/nemotron-ultra` (550B MoE, API id `nemotron-3-ultra-550b-a55b`) | biggest context window on the trusted NIM endpoint: 256K ctx hosted (NVIDIA NIM docs 2026-06-26; config limit set to 262144). Live PONG 2 s 2026-11-17 as the default model. (v9 used `mistral-large-4`, 200K ctx, PONG 3 s.) Engineering agents stay on NIM because agent-loop contexts exceed Groq's 8K TPM per-request cap (live-tested 2026-11-17: ~5K-token prompt → "Request too large") |
| medical | `opencode/nemotron-3.5-super-vl-free` | vision model — needed for scanned reports; PONG 2 s, tool calls verified 2026-11-17; NVIDIA trial endpoint logs prompts, so the agent's redaction-first rule is mandatory |
| tester, researcher | `opencode/glm-5.3-flash-free` | same GLM family as before, but on the keyless Zen endpoint: PONG in 2 s (was ~5 min queue on NIM); zero-retention; tool calls verified |
| scientist, verifier | `opencode/deepseek-v4.1-flash-free` | best WORKING free reasoning model for physics/math agent loops: zero-retention, PONG in 21 s, tool calls verified. Groq `gpt-oss-120b` is stronger on paper (~500 tps, reasoning) but its 8K TPM per-request cap breaks agent sessions once context grows — use it manually via `/models` for one-off small prompts only. Verifier stays DeepSeek-family so it does not share the builder's blind spots |
| title (built-in, v2 native `agents.title.model`) | `opencode/hy4-flash-free` | fastest measured (PONG in 3 s), zero-retention — title prompts contain conversation text |
| any agent, as a manual fallback | `opencode/<zen-free-model>` (keyless, see v8 below) | 1–3 s first byte measured 2026-11-17 |
Also in the catalog: `nvidia/nvidia/nemotron-3.5-super-vl-120b-a12b` (vision; for scanned reports pick it manually in the model picker) and `nvidia/stepfun-ai/step-5-preview`. `nvidia/deepseek-v4.1-flash` hit end-of-life on NIM 2026-11-16T08:00Z (live error 2026-11-17) — declared `disabled: true`; use `opencode/deepseek-v4.1-flash-free` (Zen) instead.

## Free model options beyond NIM (v8, 2026-11-17)
NIM's free queue can take ~5 min to first byte. Faster free options, all verified 2026-11-17:

**Keyless, works today (no signup, inside OpenCode only)** — `opencode/<id>`. Measured first-byte / tool-calling (all 10 probed models called `todowrite` correctly):
| Model | First byte (measured) | Gen speed (est.) | Privacy |
|---|---|---|---|
| `opencode/hy4-flash-free` | 3 s | fastest (~65 tok/s est) | zero retention |
| `opencode/flint-40b-free` | 1 s | ~50 tok/s est | retained 30 d, may train — public data only. ⚠️ per-model free cap hit on the 2nd request (2026-11-17) — unreliable for agent loops |
| `opencode/deepseek-v4.1-flash-free` | 2 s | slowest of the set | zero retention |
| `opencode/glm-5.3-flash-free` | 3 s | ~55 tok/s est | zero retention |
| `opencode/beam-free` | 2 s | ~55 tok/s est | no training, retained 30 d |
| `opencode/nemotron-3.5-super-vl-free` | 2 s | ~50 tok/s est | NVIDIA trial: logged — public data only |
| `opencode/iceman-free`, `opencode/inkling-2-small-free` | 3 s (2026-11-17 re-probe) | ~45–60 tok/s est | retained / may train — public data only |
| `opencode/big-pickle` | cap reached on first probe 2026-11-17 | — | — |
| `opencode/mimo-v2.6-flash-free` | 4–13 s (2026-11-17 re-probe: 4 s) | — | may train — public data only |
| `opencode/longcat-2.5-free` | 4 s | — | zero retention but hosted in China, 100 req/day cap |
Limits: dynamic per-IP daily allowance (unpublished, ~200/day observed; LongCat capped at 100/day), resets 00:00 UTC. For the confidential drones repo use only the zero-retention row (glm-5.3-flash, deepseek-v4.1-flash, hy4-flash, beam).

**Free with account key (no card) — wired in `opencode.jsonc`, models appear in `/models` once you export the env var:**
| Provider | Env vars | Free limits (verified 2026-11-17) | Best for |
|---|---|---|---|
| `groq` | `GROQ_API_KEY` (connected 2026-11-17 — works) | gpt-oss-120b / gpt-oss-20b / qwen3.8-27b: 30 RPM, 1,000 RPD, **8K TPM per request**, 200K TPD each (console.groq.com/docs/rate-limits, re-checked live 2026-11-17: a ~5K-token prompt is rejected "Request too large", a tiny PONG passes; llama-3.3-70b rotated out of the free table). ~500 tps on gpt-oss-120b, 131K ctx, reasoning+tools. Privacy: NOT retained by default and never used for training (Services Agreement §4.2, console.groq.com/docs/your-data, 2026-11-17); ZDR available self-serve | one-off small prompts only (ask a single question, no big file dumps) — agent loops die past ~8K tokens of context. NOT assigned to any agent for that reason |
| `cloudflare` (Workers AI) | `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` | 300 RPM text gen, 10,000 Neurons/day shared (≈49K output tokens/day on llama-3.3-70b-fp8-fast; more on smaller models), reset 00:00 UTC | 300 RPM is generous; daily token budget is small — good for a background/light agent |
| `openrouter` | `OPENROUTER_API_KEY` — ✅ connected 2026-11-17 (`opencode auth list` shows "OpenRouter :free models"; all refs below PONG live in 1–5 s) | `:free` models today (public catalog + live PONG 2026-11-17): `nvidia/nemotron-3-ultra-550b-a55b:free` (1M ctx, 5 s), `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` (256K ctx, reasoning, 2 s, tool calls verified), `nvidia/nemotron-3.5-super-vl:free` (vision, 1 s), `nvidia/nemotron-3.5-lightning:free` (1M ctx), gemma-4-31b/26b, plus `openrouter/free` router. Limits: **20 RPM and 50 req/day shared across ALL :free models** (1,000/day only after a $10 top-up — card). Privacy: per-HOST policy — NVIDIA free hosts are marked "may train" (trial terms: do not submit confidential data) | backup for big-context or vision passes when the Zen quota (~200/day per IP) is exhausted — **public or redacted content only**, never the confidential drones repo. Not assigned as a default agent model because 50 RPD dies mid-task |
| `novita` | `NOVITA_API_KEY` | rotating $0-priced models (currently `zai-org/glm-new` 193K ctx and `apodex/apodex-1.1-mini`); T1 new-account ≈30 RPM / 50M TPM per model; find current $0 ids via `GET /openai/v1/models` (0/0 prices) | $0 lineup churns monthly — cheap volume for light agents |
| `google` (Gemini API free tier) | `GOOGLE_GENERATIVE_AI_API_KEY` | per-project, unpublished; reported 2026-10: gemini-3.8-flash 5 RPM/250K TPM/20 RPD, flash-lite 15 RPM/500 RPD, gemma-4 30 RPM/14,400 RPD; 2.5 models grandfathered-only | gemma-4's 14.4K RPD is real daily volume; **free tier trains on your prompts — never for the confidential repo** |

Also noted, not wired: Cohere trial key (20 RPM, 1,000 calls/month, evaluation-only), SambaNova free tier (20 RPD/model but new accounts reportedly get 402 — unresolved), Mistral La Plateforme free mode (being removed per Oct-2026 reports — unstable), GitHub Copilot Free via the built-in device-OAuth provider (no key/card, small monthly budget — usable through `/connect`).

Excluded after checking 2026-11-17: Cerebras ($5 trial needs a verified card), Hugging Face Inference Providers (free $0.10/mo credit ended 2026-10-07), GitHub Models (retired 2026-07-30), Together AI (no free tier, $5 min), SambaNova (free tier only 20 RPD/200K TPD per model — kept as a footnote, not wired), Pollinations classic (keyless but 1 req/30 s per IP — too slow for agents), Mistral La Plateforme (free mode limits are the lowest of all). Local ollama excluded per your instruction.

## Commands
`/feature /plan /design /build /test /loadtest /review /security-review /sec /debug /commit /pr` (engineering), `/parallel /panel /race /merge /branches /dashboard` (multi-agent + git + IDE dashboard), `/research /verify /science /simulate` (research and physics), `/report` (medical documents), `/continue /checkpoint` (long tasks), `/visual <what>` (v10 — designer agent: diagrams/charts/figures/slides/images), `/re <target>` (v10 — re agent: authorized binary/firmware analysis), `/prove` (v9 — tester runs build→lint→typecheck→full suite with VERDICT).

## IDE mode + self-improving orchestrator (v6, 2026-11-17)
- **PLAN.md as single source of truth**: every multi-step task is planned in `PLAN.md` in the project root (goal, plan with owner agent + session #, decisions, agent session log, verification checklist, needs/gaps, NEXT ACTION). It is injected into every session via the top-level `instructions: ["PLAN.md"]` key, so it survives compaction and restarts. The orchestrator cross-checks PLAN.md against reality before every final response and marks items verified only with evidence (file:line, command output). `/continue` and `/checkpoint` read/write PLAN.md; logs still go to `.scratch/`.
- **Dashboard, not just chat**: the orchestrator ends every reply with a status sidebar (running agents with session #s, `git status`/`git diff --stat`, PLAN.md progress, NEXT). `/dashboard` prints the same plus `opencode session list`, worktrees and `agent/*` branches; the TUI session picker and `opencode serve` (web UI) give the visual overview.
- **Self-upgrade**: when a task needs a skill, MCP, model, command or permission that is not configured, the orchestrator analyses the gap, asks you ONCE with the `question` tool (the `edit */.config/opencode/* = ask` rule is covered by the same approval), then adds it itself (edit `opencode.jsonc`, write the skill/command file, `opencode mcp add --global`), runs `opencode reload`, verifies the new tool appears, records it in PLAN.md and memory, and continues.
- **Creative agents**: every agent file ends with a `## Mindset` block — think outside the box, challenge assumptions, propose non-obvious approaches — within the hard rules (scope, safety, privacy, permissions).
- **Anti-hallucination + memory**: the orchestrator labels every claim [verified: evidence] / [inferred] / [unknown], never claims actions that did not happen, spawns `verifier` for critical claims, stores only verified non-sensitive facts in the Memory MCP, and re-verifies after compaction. Compaction now keeps 64k tokens (buffer 20%) and the provider `headerTimeout` is 600s to absorb the ~5-minute free-endpoint queue.


## MCP servers (direct tools, scoped per agent)
| Server | Gives | Who may use it | Notes |
|---|---|---|---|
| `context7` | current library/framework docs | `orchestrator` + `researcher` only | remote, no key; globally denied for every other agent (web tools are an exfil channel) |
| `deepwiki` | questions about PUBLIC GitHub repos | `orchestrator` + `researcher` only | remote, no auth; the question leaves your machine, never for private code |
| `thinking` | structured step-by-step reasoning | orchestrator, architect, scientist, verifier, sec | `server-sequential-thinking@2.1.1` |
| `memory` | cross-session knowledge graph (`~/.config/opencode/memory.json`) | orchestrator only | durable non-sensitive facts only |
| `playwright` | browser automation | tester only | first run: `npx -y playwright install chromium` |
| `devtools` (v11) | Chrome DevTools: console, network, performance traces | tester only | `chrome-devtools-mcp@1.13.0` pinned to `/usr/lib64/chromium-browser/chromium-browser` via `--executablePath` + `--chrome-arg=--no-sandbox` (no Chrome in PATH, running as root); browser launch live-verified 2026-11-18 (`list_pages` → `about:blank`); stats/CrUX off |
| `playwright-workspace` (v11, OFF) | Microsoft Playwright Workspaces remote browser | tester only | needs an Azure workspace: fill `{region}`/`{workspaceId}` in `opencode.jsonc`, then `opencode mcp auth playwright-workspace` (Entra ID) or set `x-api-key` from `PLAYWRIGHT_WORKSPACE_API_KEY`; template URL in config |
| `canva` (v11) | Canva designs: read/create/comment/export | orchestrator, designer only | remote `https://mcp.canva.com/mcp`, per-user OAuth — first connect returns 401 Bearer until you run `opencode mcp auth canva` and consent in the browser (OAuth metadata live-verified 2026-11-18). Can modify REAL designs — scoped to orchestrator+designer |
| `github` | issues, PRs, code search | asks on every call | OFF by default: `/mcps`, github, sign in, then delete `"disabled": true` in `opencode.jsonc` |
| `mermaid` (v10) | mermaid → SVG/ASCII, **fully local** (`zombie-mermaid mcp`, no browser) | orchestrator, designer | confidential-safe rendering; tools verified live 2026-11-17: `render_mermaid_svg`, `render_mermaid_ascii`, `check/fix_mermaid_sequence_activations` |
| `kroki` (v10) | 29+ diagram engines (mermaid, plantuml, graphviz, d2, c4, bpmn…) → SVG/PNG/PDF via kroki.io | orchestrator, designer | PUBLIC content only — external service (stores no sources per 2026-10-25 policy, but treat as external). Tools verified: `kroki_render`, `kroki_describe` |
| `quickchart` (v10) | Chart.js config → chart PNG/SVG via quickchart.io | orchestrator, designer | PUBLIC data only — free chart URLs are public. Tools verified: `generate_chart`, `download_chart` |
| `excalidraw` (v10) | local `.excalidraw` CRUD + SVG/PNG export, hand-drawn style | orchestrator, designer | fully local, confidential OK. 11 tools verified live 2026-11-17 |
| `mitre` (v10) | MITRE ATT&CK lookup, Navigator layers | orchestrator, sec, re | keyless; 26 tools verified live 2026-11-17 (`mitre_get_technique`, `mitre_search_groups`, …) |
| `shodan`, `virustotal` (v10, env-gated) | host/IP reputation, file/URL analysis | OFF (`"disabled": true`) | **"errors and won't connect" explained (diagnosed live 2026-11-18):** both packages read the key at process startup and fatal-exit without it (`SHODAN_API_KEY environment variable is required.`), so an enabled server without a key errors instead of connecting. Fix: export your free signup key, set `"disabled": false`, reload |
| `experimental_image_generate` (v10 built-in tool) | AI image generation/editing | orchestrator, designer | default model `openrouter/recraft/recraft-v4.1-flash-v2:free` — **PUBLIC prompts only** (free-tier hosts may train). Live-verified 2026-11-17: generated a 92 KB .webp in 17 s. (`opencode/grok-imagine-image-2.0` returned "Invalid credential" — do not use) |

CVE/advisory lookup is via CLI helpers, not MCPs (the npm NVD/OSV MCP servers need Node ≥24; the pypi one breaks on Python 3.14): `~/.local/bin/cve CVE-2021-44228` / `cve -k <kw>` / `cve --cpe <cpe>` (NVD API v2, keyless 5 req/30 s, adds CISA-KEV exploited flag; exit 2 = rate-limited) and `~/.local/bin/osvq --pkg requests --eco PyPI --ver 2.31.0` (OSV.dev, keyless). Both live-verified 2026-11-17.

`gh` and `git` through the shell already cover most GitHub work without this server. To add more (Sentry, Linear, Notion, Cloudflare remote MCPs, ...) copy the `deepwiki` block, change the URL, and sign in through `/mcps`. Every server uses `codemode: false` so models call tools directly instead of writing JavaScript for Code Mode; remove that line from one server if its tools misbehave.

## Parallel agents and git branches
- The orchestrator may run 3 subagents at once, at most 2 of them writers. Writers run in parallel only in separate git worktrees (`.scratch/wt/<task>`, branch `agent/<task>`) with disjoint file ownership. Work merges through `agent/integration-<goal>` and never touches your branch: you approve a fast-forward at the end. Nothing is pushed.
- `/parallel <goal>` splits a goal into modules and fans out. `/panel` runs reviewer + sec + tester in parallel on your diff and returns one ranked verdict. `/race <task>` has two builders compete against the same tests. `/merge` integrates finished branches, `/branches` shows worktrees and agent branches, `/pr` drafts a PR description. The recipe lives in the `parallel-agents` skill; I ran it on a scratch repo (worktrees, merges, fast-forward, cleanup) to confirm it works.
- Worktrees start from the last commit, so commit or stash before `/parallel`. `git branch -D`, `--force` worktree removal, `prune`, `rebase` and pushes ask; force-push is blocked outright.

## Long-running work
The orchestrator keeps `PLAN.md` in the project root (goal, plan, decisions, agent session log, verification checklist, status, NEXT ACTION — see "IDE mode" above). After a restart or compaction run `/continue`. Long simulations run in the background with logs and checkpoints in `.scratch/` (`long-running-work` skill). Compaction keeps 64k tokens and starts at 20% free; snapshots give `/undo`/`/redo`; background compaction is on.

## Medical use
`/report path/to/report.pdf` redacts identifiers into `.scratch/` first, extracts values exactly, explains them with reference ranges, puts urgent findings on top, and ends with questions for your clinician. It is informational, not diagnosis. NVIDIA may log free-endpoint prompts: redact before sending, and never store medical data in the Memory MCP.

## Hardening + anti-idle plugin (v7, 2026-11-17)
- **keepalive plugin** (`plugins/keepalive.ts`, auto-loaded globally): hooks `experimental.idle`; when a *primary* session goes idle but still has pending/in_progress todos or unchecked `- [ ]` items in PLAN.md, it injects a synthetic "keep working" message (max 8 nudges per unchanged state, then waits). Subagent sessions are never hijacked, and a primary session that idles only because subagent children are still running is left alone (the child's report wakes the parent). Every decision is appended to `/tmp/opencode/keepalive.log`. Proven live: a run that created 3 pending todos and replied DONE was nudged and completed all 3 before idling.
- **Web tools are default-deny**: `webfetch`, `websearch`, `context7_*`, `deepwiki_*` are denied globally; only `orchestrator` and `researcher` re-allow them. `medical` additionally denies `memory_*`.
- **Sensitive files**: `*confidential*` (read/edit/grep/glob/shell → ask), `*.pem`/`*.key`/`*id_rsa*`/`*credentials*`/`*secret*`/`*/.npmrc`/`*/.env*` (deny), `*.env` read flipped ask→deny (`.env.example`/`.env.sample` still allowed).
- **Shell bypass-closing asks**: `sh/bash/zsh/eval/exec`, `wget/curl/nc/ncat/ssh/scp/rsync`, `python(3) -c`, `node/perl/ruby -e`, `base64`, and `*|sh*`/`*|bash*` now ask on top of the existing hard denies.
- `/plan` no longer runs as a subagent (`plan` is primary-only in v2); `deepseek-v4.1-flash` is declared in `providers.nvidia.models` so scientist/verifier resolve it with correct limits.

## Claude Code parity
Subagents with isolated context, plan mode (`plan`), todo list, slash commands, skills, memory (`AGENTS.md` plus Memory MCP), permissions with last-match-wins, hard policies instead of PreToolUse blocks, formatter and LSP instead of PostToolUse hooks, snapshots instead of `/rewind`, worktrees, `opencode run` for headless use, MCP, and local TypeScript plugins (`plugins/keepalive.ts`).

## v9 — agentic upgrades adopted from Codex CLI / Claude Code research (2026-11-17)
Researched both CLIs from primary/public sources (openai/codex repo + learn.chatgpt.com docs; Anthropic docs + engineering blog + public prompt captures), audited this config against their checklists, and applied what opencode v2 can actually enforce. Adopted:

- **Global "Agentic discipline" rules in `AGENTS.md`** (injected into every agent, primary and subagent): preamble sentence before non-trivial tool batches; batch independent calls into one message; *prove it works* verification ladder (most-specific test → full suite → linter/type-check, iterate until green, quote command+result); todo discipline (one `in_progress`, mark `completed` immediately, never batch); read-before-edit and no re-read after a successful edit; delete dead code entirely; no unrequested features; cite `path:line`; concise tone, no emojis, objectivity over agreement; delegate broad exploration to `explore`; harness-enforced permissions/hooks — change approach when blocked, never loop retries.
- **`agents/orchestrator.md`**: Communication-style section (preamble, batching, final-reply format: outcome first, evidence, risks, next step). **`agents/builder.md`**: explicit prove-it-works loop with quoted results.
- **`/prove` command** (`commands/prove.md`): routes to `tester`, which runs build → lint → type-check → narrow tests → full suite and ends with a VERDICT + evidence per command (Claude Code's "/verify — prove it works" equivalent).
- **Output budgeting**: `tool_output: {max_lines: 2000, max_bytes: 51200}` caps tool output so a giant log cannot blow the context window (Codex budgets shell output at ~10k tokens).
- **Three-layer command guardrails** (Codex PreToolUse-deny + sandbox equivalent; this Linux box has no seatbelt/bwrap, so enforcement is harness-level): (1) `permissions` asks for push/reset/rebase/clean/curl|sh/etc., (2) `policies` hard denies that approval cannot override — now including `rm -rf / ~ $HOME .` variants, `dd of=/dev/*`, `mkfs*`/`wipefs`/`blkdiscard`, redirects into block devices, `chmod -R 777 /`, `find / -delete`, `shutdown/reboot/poweroff/halt`, force-push — (3) **`plugins/guardrails.ts`**, a `tool.execute.before` hook that regex-blocks the same command class on the raw string before execution (catches mixed flags globs miss) and logs every block to `/tmp/opencode/guardrails.log`. A plugin bug can never block a legitimate call: only intentional `[guardrails]` errors are re-thrown.
- **Compaction**: `auto` + `keep.tokens: 64000` verbatim tail + `buffer: "20%"` + `experimental.background_compaction`. PLAN.md survives compaction because it is re-injected via `instructions` — the Codex "plan survives compaction" equivalent. No custom compaction prompt exists in v2's schema (only auto/keep/buffer); a `session.hook("compaction")` plugin override was considered and skipped as unverified-risk.
- **Model re-probe 2026-11-17**: 5 new Zen free models PONGed — `flint-40b-free` 1 s but hit its per-model free cap on request #2, `mimo-v2.6-flash-free` 4 s, `iceman-free`/`inkling-2-small-free` 3 s, `big-pickle` cap-reached. No reassignment: assignments stay as in "Who uses what" (flint/big-pickle too unreliable). Note: v2 agent `request` frontmatter only merges `headers`/`body` — temperature/effort belong on model `settings`/`variants`, so no per-agent temperature was set (verified schema, not guessed).

**Why this beats Codex/Claude Code defaults on this machine**: per-role free models with zero-retention routing for a confidential repo (vs one paid default model); 3-layer guardrails without needing OS sandboxing; keepalive plugin auto-continues idle sessions with pending work; PLAN.md persists across compaction; review panels, best-of-N races and parallel worktree builders; self-upgrade protocol; `/prove` evidence loop.

## v10 — visuals/design, reverse-engineering and cybersecurity stack (2026-11-17)
New agents, MCPs, skills, commands and local tools, all keyless and sudo-free, installed and live-verified today:

- **Agents**: `designer` (visuals; loads the new `visual-design` skill; confidentiality-aware pipeline choice) and `re` (reverse engineering of user-authorized binaries/firmware; static only, loads the new `reverse-engineering` skill). Both on `nvidia/nemotron-ultra` (256K ctx). Orchestrator playbook entries 16–17 route to them; `/visual` and `/re` slash commands added. `sec` got the MCP permissions + toolbox docs.
- **Orchestrator context maximized**: default model is now `nvidia/nemotron-ultra` — 256K context on the hosted NIM endpoint (docs.nvidia.com/nim 2.0.7, 2026-06-26), the biggest on the trusted provider; live PONG 2 s as default model 2026-11-17. The 1M-ctx models (nemotron-ultra self-hosted, openrouter `:free`) stay manual/pubic-only because their hosts may train. Dead `nvidia/deepseek-v4.1-flash` (EOL 2026-11-16) marked `disabled: true`.
- **Visual MCPs** (all `codemode: false`, keyless): `mermaid` = `zombie-mermaid mcp` — fully LOCAL SVG/ASCII render, no browser, confidential-safe (4 tools verified via stdio tools/list); `kroki` (`kroki-mcp`, 29+ engines, public-only); `quickchart` (`@gongrzhe/quickchart-mcp-server`, chart PNGs, public-only); `excalidraw` (`excalidraw-mcp`, local files, confidential OK, 11 tools verified). All four globally denied except orchestrator + designer.
- **AI images**: built-in `experimental_image_generate` with `experimental.image_generate.model = openrouter/recraft/recraft-v4.1-flash-v2:free`. Live-verified 2026-11-17 (92 KB .webp in 17 s). PUBLIC prompts only. (`opencode/grok-imagine-image-2.0` fails with "Invalid credential" — recorded.)
- **PowerPoint**: python-pptx in the tools venv — the only reliable headless path on this box (marp-cli/mermaid-cli need Chromium, which isn't installed). No browser assumed.
- **Security/RE MCPs**: `mitre` (`mitre-mcp`, 26 ATT&CK tools verified). NVD/OSV as MCPs don't work on this box (Node ≥24 / Python 3.14 incompatibilities, verified live) → CLI helpers instead: `~/.local/bin/cve` (NVD v2 keyless 5 req/30 s + CISA KEV flag; CVE-2021-44228 → CRITICAL 10.0, KEV:true verified) and `~/.local/bin/osvq` (OSV.dev keyless; requests 2.31.0 → 16 vulns verified). Env-gated `shodan`/`virustotal` MCPs wired but `disabled: true`.
- **Local tooling installed** (user-approved, GitHub release binaries → `~/.local/bin`, verified `--version`): `nuclei 3.11.1`, `gitleaks 8.30.1`, `trufflehog 3.99.9`, `trivy 0.76.2`, `gobuster 3.8.2`, `feroxbuster 2.14.0`, `subfinder 2.17.0`, `httpx 1.12.0`, `naabu 2.7.0` (glibc build — the musl asset needs a musl loader absent here), `amass 5.1.3`, `osv-scanner 2.7.1` (+ pre-existing `nmap`, `objdump`/`readelf`/`strings`/`nm`, `exiftool`, docker/podman).
- **Python RE/security venv** `~/.config/opencode/tools/venv` — imports verified live: `capstone, pyelftools, lief, androguard, pwntools, yara-python, semgrep, bandit, pip-audit, binwalk3, scapy` (+ `python-pptx` for slides).
- **CyberChef** as a Node lib in `~/.config/opencode/tools/node` — installed with `--ignore-scripts` (its postinstall build fails), `terser` added, and `crypto-api@0.8.5` src patched (43 extensionless `.mjs` imports) because Node 22 ESM requires extensions. Working invocation (verified): `NODE_PATH=~/.config/opencode/tools/node/node_modules node -e "(async()=>{const c=await require('cyberchef');console.log((await c.bake('48656c6c6f',c.fromHex)).toString())})()"` → `Hello`. Note: `require('cyberchef')` returns a Promise in v11 — always await it.
- **Permission scoping**: visual + security MCP actions are globally denied and re-allowed only for orchestrator/designer/sec/re; `experimental_image_generate` likewise.
- **Full-stack audit 2026-11-17 (v10.1)**: scripted cross-check of all 13 agents, 31 commands, 13 skills, 14 MCP servers, permissions/policies and plugins. Fixed: `/plan` referenced a nonexistent `plan` agent (v2 has none — now runs in the primary agent); dead `nvd_*`/`osv_*` permission entries removed (CVE/OSV lookup moved to `cve`/`osvq` CLIs); architect/builder/reviewer/sec aligned to `nvidia/nemotron-ultra` (matches this table, 256K ctx); `excalidraw.log` (dropped by the excalidraw MCP into the session CWD) added to the repo's `.git/info/exclude`. Verified: `debug config`/`debug agents` OK, all 9 local MCPs answer tools/list (thinking 1, memory 9, mermaid 4, kroki 2, quickchart 2, excalidraw 11, mitre 26, playwright 25, devtools 33), context7 + deepwiki answer initialize over HTTPS, guardrails + keepalive plugins load, live subagent smoke tests passed (designer PONG; explore counted files correctly).

## v11 — Canva + browser MCPs fixed, monitor agent, delegate-by-default, MCP-first (2026-11-18)
- **New MCP servers** (all verified via `opencode debug config` + `opencode mcp list` on 2026-11-18): `canva` (remote, OAuth — see table), `playwright-workspace` (remote template, disabled: Azure-gated), and the existing `devtools` server now actually launches a browser on this box (`--executablePath /usr/lib64/chromium-browser/chromium-browser --chrome-arg=--no-sandbox`; `tools/list` 33 tools + `list_pages` → `about:blank` live-verified via a stdio JSON-RPC probe). `shodan`/`virustotal` root-caused: they fatal-exit at startup without an API key, so they stay `disabled` until you export one (comment in `opencode.jsonc`).
- **Permission audit re-run** (scripted matrix over all agents × all MCP servers): `canva_*` allowed for orchestrator + designer only; `playwright_workspace_*` + `devtools_*` + `playwright_*` for tester only; everything else inherits the global deny. `shodan_*`/`virustotal_*`/`canva_*`/`playwright_workspace_*` added to the global deny list.
- **New `monitor` subagent** (`agents/monitor.md`, `opencode/glm-5.3-flash-free` zero-retention): continuously runs `git status/diff/log` + test runners and reports drift/breakage while builders work. Strictly read-only: `edit`/`write` denied, shell allowlisted to git-read + `ls/cat/wc` + test commands only (piped variants get rejected by the allowlist — use unpiped forms). Smoke-tested live 2026-11-18 (ses_e1436c246ffeZBDlS2E56UMBe3): resolved, ran git commands in the drones repo, flagged the pre-existing uncommitted files without touching them. Orchestrator allows `subagent monitor`.
- **Delegate by default**: `orchestrator.md` now has a "Delegate by default" section (coordinator, not code monkey; writes code only for <3-file trivial changes), playbook 18 (parallel builders in worktrees + `monitor` watchdog + integration branch + full suite + reviewer), and the orchestrator team list documents `monitor`.
- **MCP-first rule** added to `AGENTS.md` (all agents) and the orchestrator Tools section: check configured MCPs before any shell workaround; if a capability is missing, use the self-upgrade path (edit `~/.config/opencode/*`, ask once) instead of scripting around it.

## Honest limits
- I could not run OpenCode or call the NVIDIA endpoint from here; the model IDs come from the public `/v1/models` list, the structure from the OpenCode v2 docs, and everything passes my static checks.
- I checked that every package version exists on npm and that DeepWiki's URL and no-auth status match its docs, but I did not launch the servers. The GitHub MCP URL is from memory (hence off by default).
- Subagents work inside a worktree by starting commands with `cd <path>`; this relies on the model following the brief, and the reviewer will catch stray edits in the main tree.
- Context7 showed `Error` once in your session; it connected earlier the same day. If it persists, `opencode mcp list`, then add a free `CONTEXT7_API_KEY` header.
- Free tier is about 40 requests/min shared by all agents; the orchestrator backs off to 1-2 agents on HTTP 429.
- Guardrails are regex+policy based, NOT kernel-enforced (no seatbelt/bwrap on this box — unlike Codex's OS sandbox). A deliberately obfuscated command could slip past the regex layer; the `policies` hard denies and credential-file denies are the reliable layer. If you want real OS sandboxing, install `bubblewrap` and wrap the opencode process yourself.
- Zen per-IP daily quota (~200/day, per-model caps exist too — flint/big-pickle hit theirs 2026-11-17) can run out mid-task; fallback is `openrouter/*:free` (public/redacted content only, 50 req/day) or `groq/gpt-oss-120b` for one-off <8K-token prompts.
