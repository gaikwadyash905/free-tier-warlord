---
name: tools-catalog
description: "Use when picking a tool: the connected MCP servers, what each is for, who may use it, privacy limits, plus the local security/reverse-engineering CLIs and Python venvs."
---

Use a connected MCP tool before writing a shell workaround. If a needed capability isn't here, tell the person what's missing; don't edit the config yourself.

## MCP servers
- `context7`: current library and framework docs. Use before writing code against an unfamiliar API.
- `deepwiki`: questions about PUBLIC GitHub repos. The question leaves the machine, so never use it for private code.
- `thinking`: structured step-by-step reasoning for hard planning or debugging.
- `memory`: durable, non-sensitive project facts and preferences only. Never medical, financial or personal data. Orchestrator only.
- `playwright`, `devtools`: browser flows, console, network, performance traces. Tester only.
- `mermaid`: diagrams rendered fully locally.
- `excalidraw`: local `.excalidraw` files with SVG/PNG export, fully local.
- `experimental_image_generate`: AI images (default model `openrouter/recraft/recraft-v4.1-flash-v2:free`). Public prompts only; free-tier hosts may train on them.
- `canva`: read, create and export Canva designs. It can change real designs. Orchestrator and designer only. First use needs `opencode mcp auth canva`.
- `mitre`: MITRE ATT&CK lookup. Orchestrator, sec, re.

## Local helpers (security and reverse engineering)
- CVE and advisory lookup: `~/.local/bin/cve` (NVD) and `~/.local/bin/osvq` (OSV.dev).
- Scanners in `~/.local/bin`: nmap, nuclei, gitleaks, trufflehog, trivy, gobuster, feroxbuster, subfinder, httpx, naabu, amass, osv-scanner. Authorised targets only.
- Python venv `~/.config/opencode/tools/venv`: capstone, pyelftools, lief, androguard, pwntools, yara-python, binwalk3, scapy, semgrep, bandit, pip-audit, python-pptx.
- CyberChef as a Node library: `NODE_PATH=~/.config/opencode/tools/node/node_modules node -e "(async()=>{const c=await require('cyberchef');console.log((await c.bake('48656c6c6f',c.fromHex)).toString())})()"` (the require returns a Promise, so await it).

## Privacy in one line
NVIDIA's free endpoint may keep and use what it receives, so medical, financial, confidential or unfinished creative work goes to the `private` agent (zero-retention model, no web tools) or, for medical documents, to `medical`. `deepwiki`, web search and image generation send content outside; use them for public topics only.

## Scripts in the config folder (`~/.config/opencode/scripts/`)
- `models.sh check|fallback|use|list`: test every model with a real tool call, swap failing ones for fallbacks
- `redact.py FILE`: remove personal identifiers locally before a model sees a document
- `smoke.sh [--live]`: offline checks of the config; `--live` also probes the models
