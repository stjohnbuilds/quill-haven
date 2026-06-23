#!/usr/bin/env bash
# Hook: PostToolUse — silently logs file edits to .claude/edit-log.txt

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPECTED_DIR="/Users/mariemackay/Dev/QuillHaven"
[ "${CLAUDE_PROJECT_DIR:-$(pwd)}" = "$EXPECTED_DIR" ] || exit 0

# Read tool use info from stdin
INPUT=""
if [ ! -t 0 ]; then
  INPUT=$(cat)
fi

# Extract tool name and file path from the JSON input
TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# Only log write/edit operations
case "$TOOL_NAME" in
  Write|Edit|NotebookEdit)
    if [ -n "$FILE_PATH" ]; then
      EDIT_LOG="${CLAUDE_PROJECT_DIR:-$EXPECTED_DIR}/.claude/edit-log.txt"
      mkdir -p "$(dirname "$EDIT_LOG")"
      echo "$(date '+%Y-%m-%d %H:%M:%S')  $TOOL_NAME  $FILE_PATH" >> "$EDIT_LOG"

      # Rotate if > 500 lines
      if [ -f "$EDIT_LOG" ]; then
        LINE_COUNT=$(wc -l < "$EDIT_LOG" | tr -d ' ')
        if [ "$LINE_COUNT" -gt 500 ]; then
          tail -n 500 "$EDIT_LOG" > "$EDIT_LOG.tmp" && mv "$EDIT_LOG.tmp" "$EDIT_LOG"
        fi
      fi

      bash "$SCRIPT_DIR/_log.sh" "post-tool-use-tracker" "LOGGED" "$TOOL_NAME $FILE_PATH"
    fi
    ;;
  *)
    # Not a file-edit tool, skip silently
    ;;
esac
