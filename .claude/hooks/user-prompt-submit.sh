#!/usr/bin/env bash
# Hook: UserPromptSubmit — context reminders, build marker, trigger phrases.
# Reads user prompt from stdin for trigger matching.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXPECTED_DIR="/Users/mariemackay/Dev/QuillHaven"
[ "${CLAUDE_PROJECT_DIR:-$(pwd)}" = "$EXPECTED_DIR" ] || exit 0

bash "$SCRIPT_DIR/_log.sh" "user-prompt-submit" "START" ""

# --- Read user prompt from stdin ---
USER_PROMPT=""
if [ ! -t 0 ]; then
  USER_PROMPT=$(cat)
fi
LOWER_PROMPT=$(echo "$USER_PROMPT" | tr '[:upper:]' '[:lower:]')

# --- Context reminders (always print) ---
echo ""
echo "=== QUILL HAVEN — Session Reminders ==="
echo "1. Read CLAUDE.md before changing anything."
echo "2. Check git status — don't overwrite Marie's work."
echo "3. Update TODO.md if task status changes."
echo "4. No duplicate components — find what exists first."
echo "5. 'Files I changed' footer on every response that touches files."
echo "6. Talk like Marie is 10. No jargon."
echo ""

# --- Build marker emoji ---
EMOJI_FILE="$EXPECTED_DIR/src/buildEmoji.ts"
if [ -f "$EMOJI_FILE" ]; then
  CURRENT_EMOJI=$(grep -oP "export const BUILD_EMOJI = ['\"]\\K[^'\"]*" "$EMOJI_FILE" 2>/dev/null || echo "")
  if [ -n "$CURRENT_EMOJI" ]; then
    echo "Live build emoji: $CURRENT_EMOJI (only change on push)"
  fi
fi

# --- TODO progress ---
TODO_FILE="$EXPECTED_DIR/TODO.md"
if [ -f "$TODO_FILE" ]; then
  TOTAL=$(grep -c '^\- \[' "$TODO_FILE" 2>/dev/null || echo "0")
  DONE=$(grep -c '^\- \[x\]' "$TODO_FILE" 2>/dev/null || echo "0")
  if [ "$TOTAL" -gt 0 ]; then
    echo "TODO progress: $DONE / $TOTAL tasks done"
  fi
fi

# --- Trigger phrase matching ---

# Deep-check trigger
if echo "$LOWER_PROMPT" | grep -qE 'deep.?check|deep.?audit|full.?check'; then
  echo ""
  echo "=== DEEP CHECK TRIGGERED ==="
  echo "Run ALL checks:"
  echo "  1. git status --short"
  echo "  2. Any lint / typecheck / build commands available"
  echo "  3. Review recent edits in .claude/edit-log.txt"
  echo "  4. Check TODO.md for stale items"
  echo "  5. Report honestly — no self-certifying."
  bash "$SCRIPT_DIR/_log.sh" "user-prompt-submit" "TRIGGER" "deep-check"
fi

# Handover trigger
if echo "$LOWER_PROMPT" | grep -qE 'handover|hand.?over|hand.?off|next.?ai|next.?session'; then
  echo ""
  echo "=== HANDOVER TRIGGERED ==="
  echo "Write a handover summary:"
  echo "  1. What was done this session"
  echo "  2. What's left / blocked"
  echo "  3. Any known bugs or warnings"
  echo "  4. Files changed (with paths)"
  echo "  5. Update TODO.md"
  echo "  6. Update CLAUDE.md if structure changed"
  bash "$SCRIPT_DIR/_log.sh" "user-prompt-submit" "TRIGGER" "handover"
fi

# Goodnight trigger
if echo "$LOWER_PROMPT" | grep -qE 'goodnight|good.?night|end.?session|wrap.?up|closing.?time'; then
  echo ""
  echo "=== GOODNIGHT TRIGGERED ==="
  echo "Before ending:"
  echo "  1. Commit any uncommitted work"
  echo "  2. Update TODO.md"
  echo "  3. Write a short summary of what got done"
  echo "  4. List anything left mid-flight"
  bash "$SCRIPT_DIR/_log.sh" "user-prompt-submit" "TRIGGER" "goodnight"
fi

# Usability check trigger
if echo "$LOWER_PROMPT" | grep -qE 'usability.?check|visual.?check|ui.?check|ui.?sweep|ui.?pass|walk.?the.?24|24.?point|design.?check|does.?this.?look.?right|how.?does.?it.?look|is.?it.?pretty|look.?at.?the.?screen|tidy.?up.?the.?screen|polish.?pass'; then
  echo ""
  echo "=== USABILITY CHECK TRIGGERED (24 points) ==="
  echo ""
  echo "USABILITY (12 points):"
  echo "  1.  MAIN GOAL — Can the user complete the goal naturally?"
  echo "  2.  EXPECTED BEHAVIOUR — Does it do what a normal person expects?"
  echo "  3.  CLOSE / ESCAPE — Can popups be closed easily?"
  echo "  4.  DATA SAFETY — Is work saved if they click away / refresh?"
  echo "  5.  ACCIDENTAL ACTIONS — Can they accidentally delete something important?"
  echo "  6.  ERROR STATES — Plain English errors? Can they retry?"
  echo "  7.  EMPTY STATES — What does it look like with no data?"
  echo "  8.  LOADING / WAITING — Clear waiting state? No double-click duplicates?"
  echo "  9.  RETURNING LATER — Is their place remembered?"
  echo "  10. KEYBOARD / BASIC ACCESS — Enter submits? Escape closes?"
  echo "  11. MOBILE COMMON SENSE — Works on phone?"
  echo "  12. MATCH THE APP — Consistent with the rest of the app?"
  echo ""
  echo "Report each as: pass / minor / broken with a short note."
  echo "Do NOT end with a confidence percentage."
  bash "$SCRIPT_DIR/_log.sh" "user-prompt-submit" "TRIGGER" "usability-check"
fi

# Interface check trigger (strict mode)
if echo "$LOWER_PROMPT" | grep -qE 'interface.?check|strict.?check|visual.?audit|element.?census'; then
  echo ""
  echo "=== INTERFACE CHECK TRIGGERED (strict mode) ==="
  echo ""
  echo "STRICT MODE — name every element. No vibe-checks."
  echo ""
  echo "STAGE A — ELEMENT CENSUS: List every visible section top-to-bottom."
  echo "STAGE B — ORPHAN HUNT: Walk Stage A, find floaters/anomalies."
  echo "STAGE C — STRANGER TEST: Single weirdest thing a new user would see."
  echo "STAGE D — THE 13 POINTS (name a specific element for each):"
  echo "  1.  FIRST IMPRESSION"
  echo "  2.  SPACE USE"
  echo "  3.  CRAMPED AREAS"
  echo "  4.  ALIGNMENT"
  echo "  5.  VISUAL PRIORITY"
  echo "  6.  TEXT AND LABELS"
  echo "  7.  LONG CONTENT"
  echo "  8.  SMALL SCREENS"
  echo "  9.  CONTRAST / READABILITY"
  echo "  10. CONSISTENCY"
  echo "  11. TOOLTIP AND LAYERING"
  echo "  12. SCROLL BEHAVIOUR"
  echo "  13. TIREDNESS"
  echo ""
  echo "STAGE E — REPORT: pass/minor/broken counts + top 3 fixes."
  echo "Every finding MUST reference a named element."
  bash "$SCRIPT_DIR/_log.sh" "user-prompt-submit" "TRIGGER" "interface-check"
fi

# Full assessment trigger
if echo "$LOWER_PROMPT" | grep -qE 'full.?assessment|in.?depth.?check|run.?assessment|project.?audit|top.?to.?bottom.?check'; then
  echo ""
  echo "=== FULL ASSESSMENT TRIGGERED ==="
  echo ""
  echo "Read docs/AI_ASSESSMENT_PROMPT.md and follow it exactly."
  echo "That file has the full checklist, rules, and output format."
  echo "Do NOT fix anything — just report."
  bash "$SCRIPT_DIR/_log.sh" "user-prompt-submit" "TRIGGER" "full-assessment"
fi

bash "$SCRIPT_DIR/_log.sh" "user-prompt-submit" "OK" "reminders printed"
