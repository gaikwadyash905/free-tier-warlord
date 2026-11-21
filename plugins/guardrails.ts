import { Plugin } from "@opencode/plugin"
import { appendFileSync } from "node:fs"

// guardrails: defense-in-depth shell-command blocker (the Codex "PreToolUse deny"
// equivalent). Permission rules + policies already deny/ask most dangerous commands;
// this plugin adds a regex layer on the raw command string so patterns that globs
// express badly (rm -rf with mixed flags and root targets, dd of=/dev/..., find /
// -delete, fork bombs) are rejected BEFORE execution. Only tool.execute.before may
// fail — a throw there rejects the tool call, the command never runs.
//
// Every decision is appended to LOG_FILE. A bug in this plugin must never block a
// legitimate tool call: only an intentional "[guardrails]" error is re-thrown.

const LOG_FILE = "/tmp/opencode/guardrails.log"

function log(line: string) {
  try {
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
  [/\b(shutdown|poweroff|halt|reboot)\b/, "power command"],
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

export default Plugin.define({
  id: "guardrails",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", async (event) => {
      try {
        if (event.tool !== "shell") return
        const cmd = commandOf(event.input)
        if (!cmd) return
        for (const [re, reason] of BLOCKED) {
          if (re.test(cmd)) {
            log(`${event.sessionID} BLOCKED [${event.agent}] ${reason}: ${cmd.slice(0, 200)}`)
            throw new Error(`[guardrails] blocked: ${reason}. Command: ${cmd.slice(0, 160)}`)
          }
        }
      } catch (err) {
        // re-throw only intentional blocks; swallow anything else so a plugin bug never blocks tools
        if (err instanceof Error && err.message.startsWith("[guardrails]")) throw err
        log(`handler error (ignored): ${String(err)}`)
      }
    })
    log("plugin loaded: execute.before shell guardrails active")
  },
})
