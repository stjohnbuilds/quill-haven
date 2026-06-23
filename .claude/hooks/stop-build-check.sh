#!/usr/bin/env bash
# Hook: Stop — reads edit log, checks for syntax errors in JS/HTML/CSS files.
# Hard-blocks on failure.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPECTED_DIR="/Users/mariemackay/Dev/QuillHaven"
[ "${CLAUDE_PROJECT_DIR:-$(pwd)}" = "$EXPECTED_DIR" ] || exit 0

bash "$SCRIPT_DIR/_log.sh" "stop-build-check" "START" ""

EDIT_LOG="$EXPECTED_DIR/.claude/edit-log.txt"
FOUND_CODE_FILES=false

# Check if any code files were edited this turn
if [ -f "$EDIT_LOG" ]; then
  # Look for JS/HTML/CSS files in recent edits (last 50 lines)
  RECENT=$(tail -n 50 "$EDIT_LOG" 2>/dev/null || echo "")
  if echo "$RECENT" | grep -qE '\.(js|ts|tsx|jsx|html|css|json)$'; then
    FOUND_CODE_FILES=true
  fi
fi

if [ "$FOUND_CODE_FILES" = true ]; then
  echo ""
  echo "=== BUILD CHECK: Code files were edited ==="

  ERRORS=0

  # Check JS/JSON files for syntax errors using node -c
  JS_FILES=$(echo "$RECENT" | grep -oE '/[^ ]*\.(js|json)$' | sort -u)
  for f in $JS_FILES; do
    if [ -f "$f" ]; then
      if ! node -c "$f" 2>/dev/null; then
        echo "SYNTAX ERROR in: $f"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  done

  # Check HTML files exist and are not empty
  HTML_FILES=$(echo "$RECENT" | grep -oE '/[^ ]*\.html$' | sort -u)
  for f in $HTML_FILES; do
    if [ -f "$f" ] && [ ! -s "$f" ]; then
      echo "WARNING: Empty HTML file: $f"
    fi
  done

  # If project has a package.json with typecheck, run it
  if [ -f "$EXPECTED_DIR/package.json" ]; then
    if grep -q '"typecheck"' "$EXPECTED_DIR/package.json" 2>/dev/null; then
      echo "Running typecheck..."
      cd "$EXPECTED_DIR" && npm run typecheck 2>&1
      if [ $? -ne 0 ]; then
        echo "TYPECHECK FAILED"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  fi

  if [ "$ERRORS" -gt 0 ]; then
    echo ""
    echo "BUILD CHECK FAILED — $ERRORS error(s) found. Fix before continuing."
    bash "$SCRIPT_DIR/_log.sh" "stop-build-check" "FAIL" "$ERRORS errors"
    exit 1
  else
    echo "Build check passed."
    bash "$SCRIPT_DIR/_log.sh" "stop-build-check" "PASS" "no errors"
  fi
else
  bash "$SCRIPT_DIR/_log.sh" "stop-build-check" "SKIP" "no code files edited"
fi
