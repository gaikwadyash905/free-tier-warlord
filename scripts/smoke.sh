#!/usr/bin/env bash
# Offline checks (seconds, no API key): config lint, guardrail rules, redaction.
# Add --live to also probe every model in use with a real tool call (needs opencode and your keys).
set -u
cd "$(cd "$(dirname "$0")/.." && pwd)" || exit 2
fail=0
step() { printf '\n== %s\n' "$1"; shift; "$@" || { echo "FAILED: $*"; fail=1; }; }
step "config lint" python3 scripts/lint-config.py
step "guardrail rules" node scripts/test-guardrails.mjs
t="$(mktemp -d)"
printf 'Patient Name: Test Person\nDOB: 01/02/1990\nMobile: +91 98765 43210\nHemoglobin 9.1 g/dL (13.0-17.0) LOW\nSeen by Dr. Jane Roe on 5 Nov 2026\n' > "$t/in.txt"
step "redaction" bash -c "python3 scripts/redact.py $t/in.txt $t/out.txt >/dev/null && ! grep -qE 'Test Person|98765|Jane|1990' $t/out.txt && grep -q '13.0-17.0' $t/out.txt && echo ok: identifiers removed, ranges kept"
[ "${1:-}" = "--live" ] && step "models (live)" scripts/models.sh check
echo; [ $fail -eq 0 ] && echo "ALL PASSED" || echo "SOMETHING FAILED"; exit $fail
