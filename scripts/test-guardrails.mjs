// Tests the BLOCKED rules in plugins/guardrails.ts without OpenCode.
// Run: node scripts/test-guardrails.mjs
import { readFileSync } from "node:fs"
const src = readFileSync(new URL("../plugins/guardrails.ts", import.meta.url), "utf8")
const start = src.indexOf("=", src.indexOf("const BLOCKED")) + 1
const end = src.indexOf("\n]\n", start) + 2
const BLOCKED = new Function(`return ${src.slice(start, end)}`)()
const check = (c) => BLOCKED.find(([re]) => re.test(c))?.[1]

const mustBlock = ["rm -rf /", "rm -rf ~", "rm -rf $HOME/", "rm -rf .", "rm -fr ./", "dd if=/dev/zero of=/dev/sda",
  "mkfs.ext4 /dev/sdb1", "shred -n3 /dev/sda", "chmod -R 777 /", "find / -name x -delete", "reboot", "ls; shutdown -h now", "sudo poweroff", ":(){ :|:& };:"]
const mustAllow = ["rm -rf /tmp/x", "rm -rf .scratch/venv", "rm -rf node_modules", "git status", "ls -la",
  "python3 -m venv .scratch/venv", "find . -name '*.pyc' -delete", "echo rebooting is fun", "git commit -m 'reboot the service'", "grep halt notes.txt"]
let bad = 0
for (const c of mustBlock) if (!check(c)) { console.log("NOT BLOCKED:", c); bad++ }
for (const c of mustAllow) { const r = check(c); if (r) { console.log("WRONGLY BLOCKED:", c, "->", r); bad++ } }
console.log(bad ? `${bad} problem(s)` : `ok: ${mustBlock.length} blocked, ${mustAllow.length} allowed`)
process.exit(bad ? 1 : 0)
