import { Plugin } from "@opencode/plugin"

// local-title: names a session from the first words of your first message, on this
// machine, so the first message is NOT sent to a model just to make a title.
// Uses ctx.session.hook("title"): per the OpenCode docs "set result to supply the title".
// The docs don't list the event's fields, so this looks for the text in a few likely
// places and does nothing if it can't find any (OpenCode then makes the title with
// agents.title.model as before). Check it: TESTING.md step 3.

function textOf(x: any): string {
  if (typeof x === "string") return x
  if (!x || typeof x !== "object") return ""
  if (typeof x.text === "string") return x.text
  if (Array.isArray(x.parts)) return x.parts.map(textOf).join(" ")
  if (Array.isArray(x.content)) return x.content.map(textOf).join(" ")
  if (typeof x.content === "string") return x.content
  return ""
}

function firstUserText(event: any): string {
  const direct = textOf(event?.prompt) || textOf(event?.text) || textOf(event?.input)
  if (direct.trim()) return direct
  const msgs: any[] = event?.messages ?? event?.input?.messages ?? []
  for (const m of msgs) {
    if ((m?.role ?? m?.info?.role) === "user") {
      const t = textOf(m).trim()
      if (t) return t
    }
  }
  return ""
}

export function makeTitle(text: string): string {
  const line = text.replace(/\s+/g, " ").trim()
  if (!line) return ""
  return line.length <= 60 ? line : line.slice(0, 57).trimEnd() + "..."
}

export default Plugin.define({
  id: "local-title",
  async setup(ctx: any) {
    try {
      await ctx.session.hook("title", (event: any) => {
        try {
          const title = makeTitle(firstUserText(event))
          if (title) event.result = title
        } catch {
          /* leave the default behaviour */
        }
      })
    } catch {
      /* hook not available in this version */
    }
  },
})
