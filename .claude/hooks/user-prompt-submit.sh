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

# --- Build marker emoji (Quill Haven's real source is version.json — the pill emoji) ---
# (Was pointing at src/buildEmoji.ts, a leftover from a React project that doesn't exist
#  here, so it never ran. Now reads the actual version.json this project ships.)
VERSION_FILE="$EXPECTED_DIR/version.json"
if [ -f "$VERSION_FILE" ]; then
  CUR_EMOJI=$(sed -n 's/.*"emoji"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$VERSION_FILE" | head -1)
  CUR_VER=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$VERSION_FILE" | head -1)
  if [ -n "$CUR_EMOJI" ]; then
    echo "Build marker: v$CUR_VER $CUR_EMOJI — the emoji on the pill (only changes on a real release)."
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

# Handover trigger — FULL protocol (per the bible). One file only.
if echo "$LOWER_PROMPT" | grep -qE 'handover|hand.?over|hand.?off|next.?ai|next.?session'; then
  echo ""
  echo "=== HANDOVER PROTOCOL TRIGGERED ==="
  echo "OVERWRITE the ONE handover file (HANDOVER.md) with these 8 sections IN ORDER."
  echo "Replace its contents entirely — do NOT append, do NOT make a v2, do NOT add a"
  echo "second handover file. There is only ever ONE handover file."
  echo "  1. WHO IS THE USER — Marie, non-coder, plain English, banned words (no wellness talk)."
  echo "  2. HARD RULES — the ones that have bitten before (no duplicate components, no"
  echo "     self-certifying, plain English, mandatory 'Files I changed' footer, clickable"
  echo "     links, double-confirm destructive actions, never suggest stopping, push only when asked)."
  echo "  3. READ THESE FILES (IN ORDER) — exact paths to every bootstrap doc the next AI reads."
  echo "  4. BROAD VISION — 2-3 sentences: what the app is, why it matters, who it's for."
  echo "  5. CURRENT STATE — % done, latest commit SHA, test/build status, the correct live URL."
  echo "  6. TOP 5 NEXT JOBS — priority order with an effort tag (Easy / User / Design call / Big)."
  echo "  7. WHAT ONLY THE USER CAN DO — pushes, hands-on tests, design calls, authorisations."
  echo "  8. WHERE THINGS LIVE — file map + the commands actually used."
  echo "Put a COPY-PASTE bootstrap block at the very TOP of the file for a fresh chat, and"
  echo "ALSO show that block back in the reply (in a code block) so Marie can copy it directly."
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
