#!/usr/bin/env bash
# Supervisor for the Quill Haven helper. Keeps it running, and if a freshly
# self-updated helper crashes twice in a row, rolls back to the known-good copy.
DIR="$HOME/.local/share/quill-haven"
LIVE="$DIR/helper.py"
BAK="$DIR/helper.py.bak"
fails=0
while true; do
  python3 "$LIVE"; rc=$?
  if [ "$rc" -eq 75 ] || [ "$rc" -eq 0 ]; then
    fails=0; continue                 # 75 = self-updated & wants relaunch; 0 = clean
  fi
  fails=$((fails + 1))                 # crashed
  if [ "$fails" -ge 2 ] && [ -f "$BAK" ]; then
    cp "$BAK" "$LIVE"; fails=0         # ROLL BACK to the last good version
  fi
  sleep 3
done
