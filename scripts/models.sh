#!/usr/bin/env bash
# Model health check and failover for this config.
#   scripts/models.sh list                 which model each agent uses
#   scripts/models.sh check [model ...]    probe each model (default: all in use) with a real tool call
#   scripts/models.sh fallback [--force]   replace every model that failed `check` by its fallback
#   scripts/models.sh use FROM TO          replace one model id everywhere
# CONFIG_DIR defaults to the folder above this script. `private` and `medical` are never moved to
# a model that keeps your data unless you pass --force.
set -u
CONFIG_DIR="${CONFIG_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$CONFIG_DIR" || exit 2

# model -> fallback (first working one wins). Edit freely.
declare -A FALLBACK=(
  [nvidia/glm-5-3-flash]="opencode/deepseek-v4.1-flash-free"
  [opencode/deepseek-v4.1-flash-free]="nvidia/deepseek-v4-1-flash"
  [nvidia/nemotron-ultra]="opencode/deepseek-v4.1-flash-free"
  [nvidia/deepseek-v4-1-flash]="groq/gpt-oss-120b"
  [opencode/hy4-flash-free]="opencode/deepseek-v4.1-flash-free"
)
# models that keep or train on what you send (do not use for private/medical)
LEAKY_RE='^(nvidia|groq|openrouter)/'
PROTECTED="agents/private.md agents/medical.md"
STATE="${TMPDIR:-/tmp}/models-failed.txt"

models_in_use() {
  { grep -h '^model: ' agents/*.md | sed 's/^model: //'
    grep -hoE '"model": *"[^"]+"' opencode.jsonc | sed -E 's/"model": *"([^"]+)"/\1/'; } | sort -u
}

probe() {  # probe MODEL -> 0 if it answers and really used a tool
  local m="$1" d word out
  d="$(mktemp -d)"; word="kiwi$RANDOM"; echo "$word" > "$d/probe.txt"
  for attempt in 1 2; do
    out="$(cd "$d" && timeout "${PROBE_TIMEOUT:-300}" opencode run --model "$m" \
      "Use your read tool to read the file probe.txt in this folder. Reply with only the word it contains." 2>&1)"
    if grep -q "$word" <<<"$out"; then rm -rf "$d"; return 0; fi
    sleep 5
  done
  rm -rf "$d"; return 1
}

replace_everywhere() {  # replace_everywhere FROM TO [skip-protected]
  local from="$1" to="$2" skip="${3:-yes}" f n=0
  for f in agents/*.md opencode.jsonc; do
    if [ "$skip" = yes ] && [[ " $PROTECTED " == *" $f "* ]] && [[ "$to" =~ $LEAKY_RE ]]; then
      grep -qF "$from" "$f" && echo "  kept $from in $f (would send it to a provider that keeps data; use --force)"; continue
    fi
    if grep -qE "^model: ${from}\$|\"model\": *\"${from}\"" "$f"; then
      sed -i -E "s#^model: ${from}\$#model: ${to}#; s#(\"model\": *\")${from}\"#\1${to}\"#" "$f"
      echo "  $f: $from -> $to"; n=$((n+1))
    fi
  done
  [ "$n" -gt 0 ] || echo "  nothing uses $from"
}

cmd="${1:-list}"; shift || true
case "$cmd" in
  list)
    for f in agents/*.md; do printf '%-14s %s\n' "$(basename "$f" .md)" "$(grep -m1 '^model: ' "$f" | sed 's/model: //')"; done
    printf '%-14s %s\n' "default" "$(grep -m1 -oE '^  "model": *"[^"]+"' opencode.jsonc | sed -E 's/.*"model": *"//; s/"$//')"
    printf '%-14s %s\n' "titles" "$(grep -A2 '"title"' opencode.jsonc | grep -oE '"model": *"[^"]+"' | sed -E 's/"model": *"//; s/"$//')" ;;
  check)
    command -v opencode >/dev/null || { echo "opencode not found on PATH"; exit 2; }
    list=("$@"); [ ${#list[@]} -gt 0 ] || mapfile -t list < <(models_in_use)
    : > "$STATE"; bad=0
    for m in "${list[@]}"; do
      if probe "$m"; then echo "PASS  $m"; else echo "FAIL  $m"; echo "$m" >> "$STATE"; bad=$((bad+1)); fi
    done
    [ "$bad" -eq 0 ] && echo "all models answered and used a tool" || echo "$bad failed; run: scripts/models.sh fallback"
    exit $((bad>0)) ;;
  fallback)
    force=no; [ "${1:-}" = "--force" ] && force=yes
    [ -s "$STATE" ] || { echo "No failed models recorded. Run: scripts/models.sh check"; exit 1; }
    while read -r m; do
      to="${FALLBACK[$m]:-}"; [ -n "$to" ] || { echo "no fallback listed for $m"; continue; }
      echo "$m failed -> $to"; replace_everywhere "$m" "$to" "$([ $force = yes ] && echo no || echo yes)"
    done < "$STATE"
    echo "Now run: scripts/models.sh check" ;;
  use)
    [ $# -eq 2 ] || { echo "usage: models.sh use FROM TO"; exit 2; }
    replace_everywhere "$1" "$2" no ;;
  *) sed -n '2,8p' "$0"; exit 2 ;;
esac
