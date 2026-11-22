---
name: build-fix
description: Fix a failing build, type check, lint or test run one error at a time without making unrelated changes. Load when the build is red.
---

1. Run the failing command and save the full output to `.scratch/build.log`. Say which command it was.
2. Read the **first** error only; later ones are often caused by it. Find the file and line.
3. Fix that one cause with the smallest change. Don't "clean up" nearby code.
4. Re-run the same command. If the error count didn't drop or new ones appeared, undo and rethink; don't stack fixes.
5. Repeat until green, then run the full suite, formatter and linter.
6. If three attempts on the same error fail, stop and report what you tried and what you think the cause is.

Never silence an error to make it pass: no blanket `ignore`, `any`, `unwrap`, skipped tests or deleted assertions unless you explain why in your report.
