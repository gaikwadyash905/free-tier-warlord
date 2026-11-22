---
description: "Show how much text is loaded into every session and what to trim"
---

Run `wc -c AGENTS.md PLAN.md CONTEXT.md` in the project and `wc -c ~/.config/opencode/AGENTS.md ~/.config/opencode/agents/orchestrator.md` (skip files that don't exist). Add them up and say roughly how many tokens that is (about 4 characters per token).

Anything over about 8 KB of always-loaded text is too much for a small model: name the biggest files and suggest the lines to cut or move into a skill. Don't edit anything unless asked.
