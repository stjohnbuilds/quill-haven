#!/usr/bin/env bash
# Quill Haven — diagnostics telegraph.
# READS this laptop's real internal state and SENDS it to a private web drop so it
# can be read on another computer. It changes NOTHING on the laptop and sends
# nothing except the report you see printed below.
#
#   curl -L https://stjohnbuilds.github.io/quill-haven/qh-diag.sh | bash -s -- <code>
#
# <code> is the private code word (given in chat). The report is also printed
# here in the terminal.

TOPIC="${1:-qh-mariemk-diag-3f9k2}"   # default drop, so it works with no arg typed
QH="$HOME/.local/share/quill-haven"
OUT="$(mktemp)"
P1="/etc/chromium/policies/managed/quill-haven.json"
P2="/etc/chromium-browser/policies/managed/quill-haven.json"

{
  echo "QUILL HAVEN DIAGNOSTICS  ($(date '+%Y-%m-%d %H:%M:%S'))"
  echo "host: $(hostname 2>/dev/null)   user: $(whoami)"
  echo "os: $( (. /etc/os-release 2>/dev/null; echo "$PRETTY_NAME") )   kernel: $(uname -r 2>/dev/null)"
  echo "chromium: $({ chromium --version || chromium-browser --version; } 2>/dev/null)"

  echo "--- INSTALLED QUILL HAVEN VERSION ---"
  echo "overlay on disk: $(grep -o "LOCAL_VERSION = '[^']*'" "$QH/extension/quill-overlay.js" 2>/dev/null)  $(grep -o "localEmoji = '[^']*'" "$QH/extension/quill-overlay.js" 2>/dev/null)"
  echo "helper version:          $(cat "$QH/helper-version.txt" 2>/dev/null || echo 'none')"
  echo "device-manifest applied: $(cat "$QH/device-version.txt" 2>/dev/null || echo 'none / never applied')  (latest is 2)"
  echo "launcher rev:            $(grep -m1 'rev:' "$QH/launch-home.sh" 2>/dev/null || echo 'no launch-home.sh')"
  echo "extension files present: $(ls "$QH/extension" 2>/dev/null | tr '\n' ' ' || echo 'NONE / dir missing')"

  echo "--- ACTUAL SITE-BLOCKING RULE ON THIS LAPTOP (this shows why sites block) ---"
  for P in "$P1" "$P2"; do
    if [ -f "$P" ]; then
      if grep -q URLAllowlist "$P"; then echo "$P  =>  OLD ALLOWLIST (blocks everything except a short list)";
      else echo "$P  =>  blocklist / other"; fi
      sed 's/^/    /' "$P" 2>/dev/null
    else
      echo "$P  =>  NOT PRESENT"
    fi
  done

  echo "--- UPDATE MACHINERY ---"
  echo "qh-admin (privileged writer): $( [ -x /usr/local/bin/qh-admin ] && echo 'present' || echo 'MISSING' )"
  echo "helper running:               $(pgrep -f run-helper.sh >/dev/null 2>&1 && echo 'yes' || echo 'NO')"
  echo "helper /status reply:         $(curl -fsS --max-time 3 http://127.0.0.1:8137/status 2>/dev/null || echo 'no reply')"

  echo "--- NETWORK / WHAT GITHUB SERVES NOW ---"
  echo "github reachable: $(curl -fsS --max-time 6 -o /dev/null -w 'HTTP %{http_code}' https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/version.json 2>/dev/null || echo 'NO internet to GitHub')"
  echo "github version.json: $(curl -fsS --max-time 6 https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/version.json 2>/dev/null | tr -d '\n ')"
  echo "END OF REPORT"
} > "$OUT" 2>&1

cat "$OUT"
echo ""
echo "================================================================"
if [ -n "$TOPIC" ]; then
  if curl -fsS --max-time 15 -H "Title: Quill Haven diagnostics" --data-binary @"$OUT" "https://ntfy.sh/$TOPIC" >/dev/null 2>&1; then
    echo "SENT to Claude. Go tell Claude it's sent."
  else
    echo "Could NOT send (no internet to the drop). The full report is printed above."
  fi
else
  echo "No code word given — nothing was sent. Re-run with the code word from chat."
fi
echo "================================================================"
rm -f "$OUT"
