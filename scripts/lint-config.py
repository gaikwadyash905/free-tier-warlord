#!/usr/bin/env python3
"""Static checks for this config (no OpenCode needed). Run: python3 scripts/lint-config.py"""
import json, pathlib, re, sys
root = pathlib.Path(__file__).resolve().parent.parent
errs, warns = [], []

def strip_jsonc(s):
    out, i, ins, esc = [], 0, False, False
    while i < len(s):
        c = s[i]
        if ins:
            out.append(c); esc = (c == "\\" and not esc)
            if c == '"' and not esc: ins = False
            if c != "\\": esc = False
        elif c == '"': ins = True; out.append(c)
        elif s.startswith("//", i):
            while i < len(s) and s[i] != "\n": i += 1
            continue
        else: out.append(c)
        i += 1
    return re.sub(r",(\s*[}\]])", r"\1", "".join(out))

try: cfg = json.loads(strip_jsonc((root / "opencode.jsonc").read_text()))
except Exception as e: sys.exit(f"opencode.jsonc is not valid JSON(C): {e}")

declared = {f"{p}/{m}" for p, v in cfg.get("providers", {}).items() for m in v.get("models", {})}
def model_ok(m): return m.startswith("opencode/") or m in declared

if not model_ok(cfg.get("model", "")): errs.append(f"opencode.jsonc: model {cfg.get('model')} not declared")
tm = cfg.get("agents", {}).get("title", {}).get("model")
if tm and not model_ok(tm): errs.append(f"title model {tm} not declared")

agents = {}
for f in sorted((root / "agents").glob("*.md")):
    t = f.read_text()
    m = re.match(r"---\n(.*?)\n---\n", t, re.S)
    if not m: errs.append(f"{f.name}: no frontmatter"); continue
    fm = m.group(1); agents[f.stem] = fm
    mod = re.search(r"(?m)^model: (\S+)", fm)
    if not mod: errs.append(f"{f.name}: no model")
    elif not model_ok(mod.group(1)): errs.append(f"{f.name}: model {mod.group(1)} not declared in opencode.jsonc")
    if not re.search(r"(?m)^description: ", fm): errs.append(f"{f.name}: no description")
    if "glm-5.3-flash-free" in t.replace("Do NOT use opencode/glm-5.3-flash-free", ""): errs.append(f"{f.name}: uses the deprecated Zen GLM model")

builtin = {"explore", "general"}
orch = agents.get("orchestrator", "")
for r in re.findall(r"resource: (\S+)\n\s+effect: allow", orch):
    if r.strip('"') not in agents and r not in builtin and "_" not in r and r != '"*"':
        errs.append(f"orchestrator allows missing agent '{r}'")
for name, fm in agents.items():
    if name in ("orchestrator", "private"): continue
    if "mode: subagent" not in fm: warns.append(f"{name}: not a subagent")
    if name not in orch.split("## Who does what")[-1].split("## Examples")[0] and name != "private":
        warns.append(f"{name}: not in the orchestrator's routing list")

skills = {f.parent.name for f in (root / "skills").glob("*/SKILL.md")}
for f in (root / "skills").glob("*/SKILL.md"):
    n = re.search(r"(?m)^name: (\S+)", f.read_text())
    if not n or n.group(1) != f.parent.name: errs.append(f"{f}: name must be {f.parent.name}")
for f in list((root / "agents").glob("*.md")) + list((root / "commands").glob("*.md")):
    for s in re.findall(r"`([a-z]+(?:-[a-z]+)+)` skill|skill `([a-z-]+)`", f.read_text()):
        s = s[0] or s[1]
        if s not in skills: errs.append(f"{f.name}: refers to missing skill '{s}'")
for f in (root / "commands").glob("*.md"):
    a = re.search(r"(?m)^agent: (\S+)", f.read_text())
    if a and a.group(1) not in agents: errs.append(f"{f.name}: agent {a.group(1)} missing")

stale = re.compile(r"keepalive|kroki|quickchart|shodan|virustotal|verifier|monitor agent|STATUS:")
for f in root.rglob("*"):
    if f.is_file() and ".git" not in f.parts and f.suffix in (".md", ".jsonc", ".ts") and f.name not in ("README.md", "TESTING.md"):
        if stale.search(f.read_text()): warns.append(f"{f.relative_to(root)}: mentions something removed")

sizes = {n: (root / n).stat().st_size for n in ("AGENTS.md", "agents/orchestrator.md")}
if sum(sizes.values()) > 12000: warns.append(f"always-loaded prompt is {sum(sizes.values())} bytes; keep under about 12000")

print(f"{len(agents)} agents, {len(skills)} skills, {len(list((root/'commands').glob('*.md')))} commands, {len(declared)} declared models")
for w in warns: print("warn:", w)
for e in errs: print("ERROR:", e)
sys.exit(1 if errs else 0)
