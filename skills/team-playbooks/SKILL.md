---
name: team-playbooks
description: "Use when a task needs several specialists in a row or in parallel: bug fixes, changes to existing code, new applications, specs, physics/maths, research, security, medical documents, DevOps, visuals, music, everyday work, review panels, races."
---

Pick the shortest flow that fits. Skip steps that are overkill for a small change. Always wait for each specialist's report before moving on, and never start a second agent for work one is still doing.

## Coding
- **Small fix or tiny change (under 3 files):** do it yourself, or one `builder`.
- **Bug:** load `debugging`. `explore` finds it, `builder` fixes it and adds a regression test, `tester` runs everything, `reviewer` looks at the diff.
- **Change to existing code:** `explore`, `builder`, `tester`, `reviewer`. Always review security-sensitive code.
- **New or scalable application:** `architect` writes the SRS and design (modules, functions with parameters and return values, load numbers, failure modes), then `builder` goes module by module, `tester` runs unit, integration, load and browser checks, `reviewer` checks the result.
- **SRS or design document only:** `architect`. Before handing it over, check every requirement links to a module, a function and a test.
- **DevOps and infrastructure:** load `devops-delivery`. `builder` writes the files and validates with dry runs, `reviewer` checks. Nothing is applied, deployed or pushed without the person's approval.

## Several coders at once (git tracking)
Load `parallel-agents`. Needs independent pieces with different files.
- **Independent modules:** one worktree and `agent/<task>` branch per builder (two at most), noted in PLAN.md under "Who's working on what". When they report, `tester` does a quick check of each worktree (edits outside owned files, test results). Then merge on `agent/integration-<goal>`, run the full suite with `tester`, and finish with `reviewer`.
- **Review panel for a risky change:** `reviewer`, `sec` and `tester` on the same diff, each with a different focus. Merge their findings into one ranked list.
- **Race on a hard problem:** two builders, two worktrees, same acceptance tests. Keep the better result or combine them.
- **Tests first:** one builder writes tests from the SRS while another implements, each in its own worktree.
- If the pieces share files or depend on each other, go one after another instead.

## Science, research, medical, security
- **Physics, maths, algorithms, statistics, PRNGs:** `scientist` derives and checks numerically (load `physics-modeling`). `researcher` can fetch literature at the same time. Then `researcher` re-checks the key results in check mode.
- **Research or technology comparison:** `researcher`, then `researcher` again in check mode on the claims that matter.
- **Medical document or clinical paper:** `medical` (zero-retention model; removes identifiers first). `researcher` may look up guidelines only with queries that contain no identifiers. `researcher` in check mode re-checks extracted numbers against the source (no identifiers in anything it searches). Never pass identifiers to search, memory or other agents.
- **Security audit or testing:** confirm scope with the person if it isn't clear. `sec` (code, in-scope targets and binaries) and `reviewer` in parallel, `builder` fixes, `sec` re-tests.
- **Reverse engineering of an authorised file:** `sec`. Scope check first.

## Design, music, everyday
- **Diagrams, charts, slides, images, visual design:** `designer`. Diagrams, charts and slides are rendered locally; AI images and Canva are for public subjects only.
- **Music (songs, theory, arranging, production, practice):** `music`. Unfinished lyrics and songs: no web search or image tools; offer the `private` agent if they want them kept off NVIDIA's endpoint.
- **Everyday work (writing, emails, plans, notes, comparing options, organising files):** `daily`. It asks before moving or deleting anything.

## Long or multi-session work
Load `long-running-work`. Keep PLAN.md current, run long jobs in the background with logs in `.scratch/`, and end each reply with what comes next.
