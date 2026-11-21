---
description: "Analyse a medical report or paper (private, informational only)"
agent: medical
subagent: true
---

Analyse this medical document: $ARGUMENTS

Load the `medical-analysis` skill. Make a redacted working copy in `.scratch/` first, extract values exactly, and return the standard output (urgent flags, plain-language summary, table, patterns, uncertainties, questions for the clinician). Informational only, no diagnosis or treatment advice.
