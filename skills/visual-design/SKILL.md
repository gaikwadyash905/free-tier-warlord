---
name: visual-design
description: "Use when creating diagrams, charts, scientific figures, slide decks (pptx), or AI-generated images. Covers pipeline choice per confidentiality, render commands, and output hygiene."
---

## 1. Pick the pipeline
| Content | Pipeline | Notes |
|---|---|---|
| Diagrams, charts, figures, slides | `mermaid_*`, `excalidraw_*`, matplotlib, python-pptx | all local; nothing leaves the machine |
| Raster illustrations, "stunning visuals" | `experimental_image_generate` (default `openrouter/recraft/recraft-v4.1-flash-v2:free`, needs `OPENROUTER_API_KEY`) | PUBLIC prompts only: free-tier hosts may train on them |
| Designs in Canva | `canva_*` (OAuth, `opencode mcp auth canva`) | sends content to Canva and can change real designs; public subjects only |

## 2. Diagrams
- Write mermaid source (`.mmd`): flowchart/sequence/class/state/er/gantt. Render with `mermaid_*` to SVG.
- Hand-drawn: `excalidraw_*`, save `.excalidraw`, export SVG/PNG.
- PlantUML, Graphviz, D2: use the local CLI if installed; otherwise say so and use mermaid.
- Save source next to output. Open the SVG/PNG and check it rendered (no `Syntax error in graph`).
- mermaid-cli/marp need Chromium and are NOT set up here; don't try `mmdc`.

## 3. Scientific figures
- matplotlib/seaborn in `~/.config/opencode/tools/venv/bin/python`; scripts in `.scratch/`; save SVG + PNG@200dpi; label axes with units; fixed seed; state N; error bars / CI; colorblind-safe palette.

## 4. Charts from data
- matplotlib (see section 3). For a quick look at public data, the image tool can't draw exact charts; use matplotlib.

## 5. PowerPoint (no browser on this box)
- python-pptx: `~/.config/opencode/tools/venv/bin/pip install python-pptx` (already installed 2026-11-17); script in `.scratch/`, output `.pptx` where the user asked. 16:9 (13.333x7.5 in), title slide, consistent colors/fonts, embed exported diagram PNGs. Verify by re-opening with python-pptx and listing slide count.

## 6. AI images (public only)
- `experimental_image_generate` with prompt including style/composition/palette/any text; set `path`. Runs in background; report the saved path when notified.

## 7. Hygiene
- Never send confidential text or images to image generation or Canva. Report FILES CREATED + pipeline used + why. If a render fails, say so and fall back to local.
