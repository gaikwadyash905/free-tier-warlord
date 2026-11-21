---
description: "Authorized security assessment of your own code or localhost/staging target"
agent: sec
subagent: true
---

Security assessment: $ARGUMENTS

State the scope you are assuming (targets, allowed techniques, out of scope). If it is not clear that the target is owned or authorized, stop and return `STATUS: blocked` with the scope questions. Otherwise follow the `security-testing` skill and return the findings table.
