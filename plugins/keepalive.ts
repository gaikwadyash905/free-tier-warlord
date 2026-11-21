// keepalive plugin — DISABLED
// The idle-nudge loop causes weaker models to spawn duplicate subagents.
// Re-enable by restoring the original code from keepalive.ts.backup or git history.
//
// To re-enable: copy the original plugin code back here and reload opencode.

import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "keepalive",
  async setup(_ctx) {
    // intentionally empty — plugin disabled
  },
})
