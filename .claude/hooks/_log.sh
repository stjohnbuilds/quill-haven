#!/usr/bin/env bash
# Shared logger. Every other hook calls this.
# Usage: bash _log.sh "<hook-name>" "<STATUS>" "<detail>"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/../hook-activity.log"
MAX_LINES=1000
mkdir -p "$(dirname "$LOG_FILE")"
echo "$(date '+%Y-%m-%d %H:%M:%S')  [${1:-unknown}]  ${2:-ran}  ${3:-}" >> "$LOG_FILE"
if [ -f "$LOG_FILE" ]; then
  LINE_COUNT=$(wc -l < "$LOG_FILE" | tr -d ' ')
  if [ "$LINE_COUNT" -gt "$MAX_LINES" ]; then
    tail -n "$MAX_LINES" "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
  fi
fi
