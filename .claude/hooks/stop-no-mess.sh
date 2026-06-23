#!/usr/bin/env bash
# Hook: Stop — "No Mess Left Behind" checklist + TODO update enforcement.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPECTED_DIR="/Users/mariemackay/Dev/QuillHaven"
[ "${CLAUDE_PROJECT_DIR:-$(pwd)}" = "$EXPECTED_DIR" ] || exit 0

bash "$SCRIPT_DIR/_log.sh" "stop-no-mess" "START" ""

echo ""
echo "=== No Mess Left Behind ==="
echo ""
echo "Before you finish this response, check:"
echo "  1. Did you include the 'Files I changed' footer?"
echo "  2. Did you update TODO.md if any task status changed?"
echo "  3. Did you leave any half-done files or temp code?"
echo "  4. Is git clean or do you need to mention uncommitted changes?"
echo "  5. Did you talk like Marie is 10? No jargon?"
echo ""

# Check if TODO.md was updated when edits happened
EDIT_LOG="$EXPECTED_DIR/.claude/edit-log.txt"
TODO_FILE="$EXPECTED_DIR/TODO.md"

if [ -f "$EDIT_LOG" ]; then
  RECENT_EDITS=$(tail -n 50 "$EDIT_LOG" 2>/dev/null | grep -c '.' || echo "0")
  if [ "$RECENT_EDITS" -gt 0 ]; then
    # Check if TODO.md was among the edited files
    TODO_EDITED=$(tail -n 50 "$EDIT_LOG" 2>/dev/null | grep -c 'TODO.md' || echo "0")
    if [ "$TODO_EDITED" -eq 0 ]; then
      echo "REMINDER: Files were edited but TODO.md was NOT updated."
      echo "If a task status changed, update TODO.md."
    fi
  fi
fi

bash "$SCRIPT_DIR/_log.sh" "stop-no-mess" "OK" "checklist printed"
