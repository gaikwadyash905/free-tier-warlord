import { Plugin } from "@opencode/plugin"
import { appendFileSync, mkdirSync } from "node:fs"

// guardrails: a regex layer on shell commands for patterns that permission globs
// express badly (rm -rf with mixed flags, dd of=/dev/..., find / -delete, fork bombs).
//
// Two hooks, because the OpenCode docs (checked 2026-11-22) document only one of them
// as a way to deny:
//   1. ctx.permission.hook("evaluate"): documented. Setting event.effect = "deny" with a
//      message blocks the call (a deny already in opencode.jsonc stays final).
//   2. ctx.tool.hook("execute.before"): throwing is NOT documented as blocking; kept as a
//      second chance in case this version honours it.
// Each hook is registered separately inside try/catch, so a wrong guess about one API
// never stops the other, and a bug here never blocks a legitimate call.
// Check it works: run `scripts/test-guardrails.mjs` (rules) and TESTING.md step 3 (live).

const LOG_FILE = "/tmp/opencode/guardrails.log"

function log(line: string) {
  try {
    mkdirSync("/tmp/opencode", { recursive: true })
    appendFileSync(LOG_FILE, `${new Date().toISOString()} ${line}\n`)
  } catch {
    /* never throw from logging */
  }
}

// [regex, reason]. Matched against the whole command string.
const BLOCKED: Array<[RegExp, string]> = [
  // rm with any flag combo targeting filesystem root, home, PWD, or the cwd itself.
  // "/" must be followed by end/space/* so `rm -rf /tmp/x` and `rm -rf .scratch/x` stay legal.
  [
    /\brm\s+(?:-{1,2}[\w-]+\s+)*(?:\/(?:\*|\s|$)|~(?:\/(?:\*|\s|$)|\s|$)|\$HOME(?:\/(?:\*|\s|$)|\s|$)|\$PWD(?:\/(?:\*|\s|$)|\s|$)|\.(?:\/(?:\*|\s|$)|\s|$))/,
    "rm targeting filesystem root, home, or the current directory",
  ],
  [/\bdd\b[^;|&]*\bof=\/dev\//, "dd writing to a block device"],
  [/\bmkfs(?:\.\w+)?\b/, "mkfs formats a filesystem"],
  [/\b(wipefs|blkdiscard|shred)\b[^;|&]*\/dev\//, "device wipe"],
  [/>\s*\/dev\/(sd|hd|vd|xvd|nvme|mmcblk)/, "redirect into a block device"],
  [/\bchmod\s+-R\s+[0-7]{3,4}\s+\//, "recursive chmod on /"],
  [/\bfind\s+\/(?:\s|$)[^;|&]*-delete/, "find / -delete"],
  [/(?:^|[;&|]\s*|\bsudo\s+)(shutdown|poweroff|halt|reboot)\b/, "power command"],
  [/:\(\)\s*\{\s*:\|:&\s*\}\s*;?\s*:/, "fork bomb"],
]

function commandOf(input: unknown): string {
  if (typeof input === "string") return input
  if (input && typeof input === "object") {
    const c = (input as { command?: unknown }).command
    if (typeof c === "string") return c
    try {
      return JSON.stringify(input)
    } catch {
      return ""
    }
  }
  return ""
}

function check(cmd: string): string | undefined {
  for (const [re, reason] of BLOCKED) if (re.test(cmd)) return reason
  return undefined
}

export default Plugin.define({
  id: "guardrails",
  async setup(ctx: any) {
    try {
      await ctx.permission.hook("evaluate", (event: any) => {
        try {
          if (event.action !== "shell") return
          const resources: unknown[] = Array.isArray(event.resources) ? event.resources : []
          for (const r of resources) {
            const reason = check(String(r))
            if (reason) {
              event.effect = "deny"
              event.message = `[guardrails] blocked: ${reason}. Run it yourself in a terminal if you really mean it.`
              log(`${event.sessionID} DENY(permission) [${event.agent}] ${reason}: ${String(r).slice(0, 200)}`)
              return
            }
          }
        } catch (err) {
          log(`permission handler error (ignored): ${String(err)}`)
        }
      })
      log("permission.evaluate hook registered")
    } catch (err) {
      log(`permission hook not available: ${String(err)}`)
    }

    try {
      await ctx.tool.hook("execute.before", async (event: any) => {
        try {
          if (event.tool !== "shell") return
          const cmd = commandOf(event.input)
          const reason = cmd ? check(cmd) : undefined
          if (reason) {
            log(`${event.sessionID} BLOCK(tool) [${event.agent}] ${reason}: ${cmd.slice(0, 200)}`)
            throw new Error(`[guardrails] blocked: ${reason}. Command: ${cmd.slice(0, 160)}`)
          }
        } catch (err) {
          if (err instanceof Error && err.message.startsWith("[guardrails]")) throw err
          log(`tool handler error (ignored): ${String(err)}`)
        }
      })
      log("tool.execute.before hook registered")
    } catch (err) {
      log(`tool hook not available: ${String(err)}`)
    }
  },
})
