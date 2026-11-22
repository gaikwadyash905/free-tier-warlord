---
name: tdd
description: Test-first workflow for new behaviour or a bug fix: red, green, refactor, with coverage and edge cases. Load before writing new code.
---

# Test first

1. **Name the behaviour** in one sentence and list the cases: normal, boundaries (empty, one, max), failures, and for a bug the exact input that breaks.
2. **Red.** Write the smallest failing test for the first case. Run it. It must fail for the right reason (assertion, not import or typo). Quote the failure.
3. **Green.** Write the least code that passes. Run that test, then the whole file.
4. **Repeat** for each case, one at a time.
5. **Refactor** with tests green: remove duplication, rename, simplify. Run the full suite after.
6. **Finish.** Full suite, linter, type-checker; check coverage of the changed code if the project measures it (aim for the changed lines, not a number). Every fixed bug keeps its regression test.

Rules: no real network, clock or randomness in unit tests (inject or fix them). Tests check behaviour, not implementation details. If code can't be tested without a rewrite, say so and propose the smallest seam.
