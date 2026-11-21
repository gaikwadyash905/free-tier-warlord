---
description: "Reverse-engineer an authorized binary/firmware/APK/sample (re agent, static lab-only)"
agent: re
subagent: true
---

Reverse-engineer: $ARGUMENTS

Load the `reverse-engineering` skill. Scope gate first: confirm the target is user-authorized; static analysis only, never execute samples. Use the installed toolbox (readelf/objdump/strings/exiftool, tools venv with capstone/pyelftools/lief/pwntools/androguard/binwalk3/yara, CyberChef node API, nvd/osv/mitre MCPs). Report capabilities, key functions, IOCs, ATT&CK, CVEs, mitigations.
