---
name: reverse-engineering
description: "Use when analyzing user-authorized binaries, firmware, APKs or malware samples (static, lab-only): triage, parsing, disassembly, IOC extraction, CVE/ATT&CK mapping. Includes the exact tool commands installed on this box."
---

## 0. Scope gate
- Only targets the user explicitly authorized. Malware: STATIC only — never execute the sample; work on copies in `.scratch/`. No attacks on third parties. Report defensively (capabilities, IOCs, mitigations).

## 1. Triage (fast, read-only)
```
file sample; sha256sum sample; exiftool sample | head -30
strings -n 8 sample | sort -u | head -100        # URLs, paths, keys, mutexes
ls -la; du -h sample                              # entropy spot-check: python one-liner in venv
~/.config/opencode/tools/venv/bin/python -c "import yara; ..."   # yara-python rule triage
```

## 2. Format parsing
```
readelf -a sample            # ELF headers/sections/symbols/dynamic
objdump -d -M intel sample   # disassembly quick look
~/.config/opencode/tools/venv/bin/python - <<'EOF'
from elftools.elf.elffile import ELFFile          # pyelftools: sections, symbols, DWARF
import lief                                        # lief: ELF/PE/Mach-O/APK imports/exports/resources
b = lief.parse("sample"); print(b.header, [str(i) for i in b.imported_functions])
from pwntools import ELF                          # pwntools: e=ELF("sample"); e.symbols, e.plt, e.got
e = ELF("sample", checksec=False)
EOF
androguard: ~/.config/opencode/tools/venv/bin/python -c "from androguard.core.apk import APK; a=APK('app.apk'); print(a.get_permissions(), a.get_main_activity())"
```
Firmware: `~/.config/opencode/tools/venv/bin/binwalk3 sample.img` then extract to `.scratch/`.

## 3. Targeted disassembly with capstone (scripts in .scratch/)
```
~/.config/opencode/tools/venv/bin/python - <<'EOF'
from capstone import *
from elftools.elf.elffile import ELFFile
import sys
f=open("sample","rb"); e=ELFFile(f)
# find .text, disassemble a function by symbol
md=Cs(CS_ARCH_X86, CS_MODE_64)
for sec in e.iter_sections():
    if sec.name==".text":
        code=sec.data(); addr=sec['sh_addr']
        for i in md.disasm(code, addr):
            if i.address > addr+0x2000: break
            print(f"0x{i.address:x}: {i.mnemonic} {i.op_str}")
EOF
```

## 4. Bulk decode / deobfuscation
```
# v11 API: require('cyberchef') returns a Promise -> await it (crypto-api src patched 2026-11-17 for .mjs extensions)
NODE_PATH=~/.config/opencode/tools/node/node_modules node -e "
(async()=>{ const c=await require('cyberchef');
  console.log((await c.bake('48656c6c6f', c.fromHex)).toString());
  console.log((await c.bake('aGVsbG8=', [c.fromBase64, c.toHex])).toString()); })()"
# JS malware deobfuscation: node + acorn/esprima AST, or CyberChef 'JavaScript' ops
```

## 5. Vuln / ATT&CK mapping
- `~/.local/bin/osvq --pkg <name> --eco <ecosystem> --ver <version>` (or `--commit`/`--purl`): OSV.dev advisories, keyless. `~/.local/bin/cve CVE-...` / `cve -k <keyword>` / `cve --cpe <cpe>`: NVD API keyless 5 req/30s, adds CISA-KEV exploited flag (exit 2 = rate-limited, wait 30s). `mitre_*` MCP: map behaviors to techniques (e.g. T1055 process injection).
- `osv-scanner` (binary, also `--lockfile`) / `trivy fs .` on extracted project dirs.

## 6. Report
sample hash, format, capabilities, key functions (address + summary), IOCs (domains/IPs/hashes/mutexes/registry), ATT&CK IDs, CVEs, detection suggestions (yara snippet), confidence, NOT analyzed. Format: STATUS / SUMMARY / details / COMMANDS RUN / NOT VERIFIED / NEXT.

## 7. Not installed (ask orchestrator first)
Ghidra (543 MB + JDK 21), radare2 (source build), tshark (no static build; scapy covers pcaps).
