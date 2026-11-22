#!/usr/bin/env bash
# Install this config into ~/.config/opencode (backs up what is there first).
#   ./install.sh            install
#   ./install.sh --dry-run  show what would happen
set -eu
SRC="$(cd "$(dirname "$0")" && pwd)"; DEST="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"; DRY=no
[ "${1:-}" = "--dry-run" ] && DRY=yes
run() { if [ $DRY = yes ]; then echo "would: $*"; else "$@"; fi; }
python3 "$SRC/scripts/lint-config.py" || { echo "Config has errors, not installing."; exit 1; }
if [ -d "$DEST" ]; then B="$DEST-backup-$(date +%F-%H%M)"; echo "Backing up $DEST -> $B"; run cp -r "$DEST" "$B"; fi
run mkdir -p "$DEST"
for d in agents commands skills plugins scripts; do run rm -rf "${DEST:?}/$d"; run cp -r "$SRC/$d" "$DEST/$d"; done
run rm -f "$DEST/opencode.json" "$DEST/opencode.jsonc"
run cp "$SRC/opencode.jsonc" "$SRC/AGENTS.md" "$SRC/.gitignore" "$DEST/"
echo "Installed. Next: /connect -> NVIDIA NIM (paste nvapi-...), then:  $DEST/scripts/models.sh check"
