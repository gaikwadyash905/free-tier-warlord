import { Plugin } from "@opencode/plugin"
import { appendFileSync, existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

// keepalive: when a primary session goes idle (model stopped emitting tool calls)
// but still has pending todos or unchecked PLAN.md steps, inject a synthetic
// message so the agent loop continues instead of sitting idle.
//
// Bounds its own loop: at most MAX_NUDGES consecutive nudges for the same
// unchanged work signature per session, then it stops until state changes.
//
// Skips sessions that are waiting on running subagent children: a child report
// wakes the parent automatically, so nudging there is pure noise.
//
// All decisions are appended to LOG_FILE so behaviour is auditable (plugin
// console.log does NOT reach opencode.log).

const MAX_NUDGES = 8
const LOG_FILE = "/tmp/opencode/keepalive.log"

function log(line: string) {
  try {
    appendFileSync(LOG_FILE, `${new Date().toISOString()} ${line}\n`)
  } catch {
    /* never throw from logging */
  }
}

function parseMaybe<T>(v: unknown): T | undefined {
  if (typeof v === "string") {
    try {
      return JSON.parse(v) as T
    } catch {
      return undefined
    }
  }
  return v as T | undefined
}

type Todo = { content?: string; status?: string }

function pendingTodos(messages: readonly any[]): Todo[] {
  let current: Todo[] | undefined
  for (const m of messages) {
    const parts = Array.isArray(m?.content) ? m.content : Array.isArray(m?.parts) ? m.parts : []
    for (const p of parts) {
      if (p?.type === "tool" && p?.name === "todowrite") {
        const input = parseMaybe<{ todos?: Todo[] }>(p?.state?.input)
        if (Array.isArray(input?.todos)) current = input.todos // last todowrite wins
      }
    }
  }
  return (current ?? []).filter((t) => t?.status === "pending" || t?.status === "in_progress")
}

function uncheckedPlanItems(directory: string | undefined): number {
  if (!directory) return 0
  try {
    const plan = join(directory, "PLAN.md")
    if (!existsSync(plan)) return 0
    const text = readFileSync(plan, "utf8")
    const all = text.match(/^\s*-\s+\[[ xX]?\]/gm) ?? []
    const done = text.match(/^\s*-\s+\[[xX]\]/gm) ?? []
    return Math.max(0, all.length - done.length)
  } catch {
    return 0
  }
}

export default Plugin.define({
  id: "keepalive",
  async setup(ctx) {
    const state = new Map<string, { nudges: number; signature: string }>()

    await ctx.session.hook("experimental.idle", async (event) => {
      try {
        const bg = (event.background ?? []) as any[]
        // subagent background work returns control to the parent on idle — never hijack that
        if (bg.some((w) => w?.kind === "subagent" && w?.sessionID === event.sessionID)) {
          log(`${event.sessionID}: idle is a subagent itself; skip`)
          return
        }
        // primary session with running subagent children: the child report wakes
        // the parent automatically, so sitting idle is correct — do not nudge
        if (bg.some((w) => w?.kind === "subagent")) {
          log(`${event.sessionID}: idle while ${bg.filter((w) => w?.kind === "subagent").length} subagent(s) still running; skip nudge (child report will wake us)`)
          return
        }

        const info = await ctx.session.get({ sessionID: event.sessionID })
        if (info.parentID) {
          log(`${event.sessionID}: idle is a subagent (parentID set); skip`)
          return
        }

        const messages = await ctx.session.context({ sessionID: event.sessionID })
        const pending = pendingTodos(messages as any[])
        const planOpen = uncheckedPlanItems(info.location?.directory)
        if (pending.length === 0 && planOpen === 0) {
          log(`${event.sessionID}: idle with no pending todos / plan items; nothing to do`)
          return
        }

        const signature = JSON.stringify({ t: pending.map((t) => t.content), p: planOpen })
        const st = state.get(event.sessionID)
        let nudges: number
        if (st && st.signature === signature) {
          if (st.nudges >= MAX_NUDGES) {
            log(`${event.sessionID}: ${st.nudges} nudges, no progress; waiting for state change (pending=${pending.length}, planOpen=${planOpen})`)
            return
          }
          nudges = st.nudges + 1
          st.nudges = nudges
        } else {
          nudges = 1
          state.set(event.sessionID, { nudges: 1, signature })
        }

        const text =
          pending.length > 0
            ? `[keepalive] You stopped, but ${pending.length} todo(s) are still pending: ${pending
                .slice(0, 5)
                .map((t) => `"${t.content ?? "?"}"`)
                .join(", ")}${pending.length > 5 ? ` (+${pending.length - 5} more)` : ""}. Do NOT stop now — work the next pending todo immediately, call todowrite to update statuses as you go, and only end your turn when no todo is pending anymore (or you are genuinely blocked, in which case state the exact blocker).`
            : `[keepalive] No pending todos, but PLAN.md still has ${planOpen} unchecked item(s). Continue with the NEXT ACTION in PLAN.md now; only end your turn when PLAN.md is fully checked off or you are genuinely blocked (state the exact blocker).`

        log(`${event.sessionID}: NUDGE #${nudges} (pendingTodos=${pending.length}, planOpen=${planOpen})`)
        await ctx.session.synthetic({ sessionID: event.sessionID, text })
      } catch (err) {
        log(`${event.sessionID}: ERROR ${String(err)}`)
      }
    })

    log("plugin loaded: primary sessions with pending todos/unchecked PLAN.md are nudged instead of going idle; subagent waits are left alone")
  },
})
