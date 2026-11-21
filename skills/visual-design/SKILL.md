---
name: "Visual Design"
description: "Use when creating diagrams, charts, scientific figures, slide decks (pptx), or AI-generated images. Covers pipeline choice per confidentiality, render commands, and output hygiene."
---

## 1. Pick the pipeline by confidentiality
| Content | Pipeline | Why |
|---|---|---|
| Confidential (private repo, personal data) | `mermaid_*` MCP (local), `excalidraw_*` MCP (local files), matplotlib, python-pptx — all local | nothing leaves the machine |
| Public | `kroki_*` (29+ engines via kroki.io), `quickchart_*` (chart PNGs) | external but keyless; kroki stores no sources (policy 2026-10-25), quickchart free URLs are public |
| Raster "stunning visuals" / illustrations | `experimental_image_generate` (default model `openrouter/recraft/recraft-v4.1-flash-v2:free`, verified live 2026-11-17, saves .webp) | PUBLIC prompts only — OpenRouter free-tier hosts may train. Pollinations NOT allowed (publicly retrievable ~30 d) |

## 2. Diagrams
- Write mermaid source (`.mmd`): flowchart/sequence/class/state/er/gantt. Render: `mermaid_*` MCP -> SVG (confidential) or `kroki_*` -> SVG/PNG/PDF (public, 29 engines incl. PlantUML/Graphviz/D2/C4/BPMN).
- Hand-drawn: `excalidraw_*` MCP, save `.excalidraw`, export SVG/PNG.
- Save source next to output. Validate: open the SVG/PNG, check it renders (no `Syntax error in graph`).
- mermaid-cli/marp need Chromium — NOT available; do not try `mmdc`.

## 3. Scientific figures
- matplotlib/seaborn in `~/.config/opencode/tools/venv/bin/python`; scripts in `.scratch/`; save SVG + PNG@200dpi; label axes with units; fixed seed; state N; error bars / CI; colorblind-safe palette.

## 4. Charts from data (quick)
- Public data: `quickchart_*` MCP with a Chart.js config (limit 200k chars, 250 labels).
- Anything else: matplotlib.

## 5. PowerPoint (no browser on this box)
- python-pptx: `~/.config/opencode/tools/venv/bin/pip install python-pptx` (already installed 2026-11-17); script in `.scratch/`, output `.pptx` where the user asked. 16:9 (13.333x7.5 in), title slide, consistent colors/fonts, embed exported diagram PNGs. Verify by re-opening with python-pptx and listing slide count.

## 6. AI images (public only)
- `experimental_image_generate` with prompt including style/composition/palette/any text; set `path`. Runs in background; report the saved path when notified.

## 7. Hygiene
- Never send confidential text/images to external renderers. Report FILES CREATED + pipeline used + why. If a render fails, say so and fall back to local.
