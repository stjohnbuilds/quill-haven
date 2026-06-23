#!/usr/bin/env bash
# Hook: Stop — blocks confidence percentages and self-certification phrases.
# Two-tier matching: Tier A = hard block (exit 1), Tier B = warn (exit 0).
# Strips backtick-wrapped content before scanning.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPECTED_DIR="/Users/mariemackay/Dev/QuillHaven"
[ "${CLAUDE_PROJECT_DIR:-$(pwd)}" = "$EXPECTED_DIR" ] || exit 0

bash "$SCRIPT_DIR/_log.sh" "stop-no-self-cert" "START" ""

# Read transcript info from stdin
INPUT=""
if [ ! -t 0 ]; then
  INPUT=$(cat)
fi

# Extract transcript path from JSON
TRANSCRIPT_PATH=$(echo "$INPUT" | grep -o '"transcript_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"transcript_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

# If no transcript path, try to get the assistant text directly
ASSISTANT_TEXT=""
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
  # Get last ~200 lines of assistant content
  ASSISTANT_TEXT=$(tail -n 200 "$TRANSCRIPT_PATH" 2>/dev/null || echo "")
else
  # Try reading from the input directly
  ASSISTANT_TEXT=$(echo "$INPUT" | grep -o '"assistant_response"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"assistant_response"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
  if [ -z "$ASSISTANT_TEXT" ]; then
    # Fallback: use all input as text to scan
    ASSISTANT_TEXT="$INPUT"
  fi
fi

if [ -z "$ASSISTANT_TEXT" ]; then
  bash "$SCRIPT_DIR/_log.sh" "stop-no-self-cert" "SKIP" "no text to scan"
  exit 0
fi

# Strip backtick-wrapped content (inline `code` and ```blocks```)
CLEAN_TEXT=$(echo "$ASSISTANT_TEXT" | perl -pe 's/```[\s\S]*?```//g; s/`[^`]*`//g' 2>/dev/null || echo "$ASSISTANT_TEXT")

# --- TIER A: Hard block (exit 1) ---
# Confidence percentages like "85% confident", "90% sure", "95% ready"
TIER_A_MATCH=$(echo "$CLEAN_TEXT" | grep -iE '\b[0-9]{1,3}%\s*(confident|sure|certain|ready|complete|done|trust|safe|reliable|coverage)' | head -3)

# Self-certification phrases
if [ -z "$TIER_A_MATCH" ]; then
  TIER_A_MATCH=$(echo "$CLEAN_TEXT" | grep -iE 'self[- ]certif|trust me it works|gate at [0-9]+%|grade myself|i.m ([0-9]+%) (confident|sure|certain)|([0-9]+%) confidence' | head -3)
fi

if [ -n "$TIER_A_MATCH" ]; then
  echo ""
  echo "=== SELF-CERTIFICATION BLOCKED (Tier A) ==="
  echo ""
  echo "Your response contains a self-certification phrase:"
  echo "$TIER_A_MATCH"
  echo ""
  echo "Marie's rule: No confidence percentages. No 'trust me it works'."
  echo "Instead use plain words: 'fully checked' / 'code reads right but didn't run' / 'didn't test'"
  echo ""
  echo "Remove the phrase and try again."
  bash "$SCRIPT_DIR/_log.sh" "stop-no-self-cert" "BLOCKED" "Tier A match found"
  exit 1
fi

# --- TIER B: Warn only (exit 0) ---
TIER_B_MATCH=$(echo "$CLEAN_TEXT" | grep -iE 'should just work|looks good to me|feels (good|fine|right)|probably fine' | head -3)

if [ -n "$TIER_B_MATCH" ]; then
  echo ""
  echo "=== SELF-CERTIFICATION WARNING (Tier B) ==="
  echo ""
  echo "Soft-cert phrase detected:"
  echo "$TIER_B_MATCH"
  echo ""
  echo "Consider being more specific: what did you check vs. what you didn't?"
  bash "$SCRIPT_DIR/_log.sh" "stop-no-self-cert" "WARN" "Tier B match found"
  # Exit 0 — warning only, don't block
  exit 0
fi

bash "$SCRIPT_DIR/_log.sh" "stop-no-self-cert" "PASS" "no self-cert phrases"
