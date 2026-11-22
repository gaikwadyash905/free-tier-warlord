---
description: "Fix a failing build, type check, lint or test run one error at a time"
agent: builder
subagent: true
---

Fix the build: $ARGUMENTS

Load the `build-fix` skill and follow it. If no command was given, find the project's build or test command and start there.
