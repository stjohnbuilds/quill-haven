#!/usr/bin/env bash
# Hook: PreToolUse — auto-commit dirty tree before edits as a safety backup.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPECTED_DIR="/Users/mariemackay/Dev/QuillHaven"
[ "${CLAUDE_PROJECT_DIR:-$(pwd)}" = "$EXPECTED_DIR" ] || exit 0

# Read tool info from stdin
INPUT=""
if [ ! -t 0 ]; then
  INPUT=$(cat)
fi

# Only act on write/edit tools
TOOL_NAME=$(echo "$INPUT" | grep -o '"tool_name"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"tool_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

case "$TOOL_NAME" in
  Write|Edit|NotebookEdit)
    ;;
  *)
    exit 0
    ;;
esac

# Check if we're in a git repo
if ! git -C "$EXPECTED_DIR" rev-parse --git-dir >/dev/null 2>&1; then
  bash "$SCRIPT_DIR/_log.sh" "pre-tool-use-git" "SKIP" "not a git repo"
  exit 0
fi

# Check for dirty tree
if [ -n "$(git -C "$EXPECTED_DIR" status --porcelain 2>/dev/null)" ]; then
  cd "$EXPECTED_DIR"
  git add -A 2>/dev/null
  git commit -m "auto-backup: rolling — last edit $(date '+%Y-%m-%d %H:%M:%S')" --no-verify 2>/dev/null
  bash "$SCRIPT_DIR/_log.sh" "pre-tool-use-git" "COMMITTED" "auto-backup before edit"
else
  bash "$SCRIPT_DIR/_log.sh" "pre-tool-use-git" "CLEAN" "no dirty files"
fi
