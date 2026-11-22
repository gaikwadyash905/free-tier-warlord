---
name: refactor-and-docs
description: Safe refactoring (dead code, duplication, naming) and keeping docs in sync with code. Load for cleanup and documentation updates.
---

## Refactor
1. Make sure tests exist for the code you're touching and pass first. If not, add characterisation tests before changing anything.
2. One kind of change per step (rename, extract, delete dead code) and run the tests after each.
3. Delete code only after searching for every use (`grep` the name, check dynamic uses, config and docs). Say what evidence you used.
4. Behaviour must not change. If it must, that's a separate change.

## Docs
1. After a change, find docs that mention the changed names, flags, endpoints or paths and update them.
2. README: what it is, how to install, how to run, how to test. Keep commands copy-pasteable and run them once.
3. Comments explain why, not what. Remove comments that describe deleted code.
4. Update `CONTEXT.md` when a decision or gotcha is worth remembering.
