#!/usr/bin/env bash
# Quill Haven kiosk launcher. Starts Chromium in fullscreen kiosk mode and the
# helper service. If Chromium crashes, it restarts automatically.
# This file is kept up to date by the helper's self-update (no re-run needed).
# rev: v2.3.21-2026-07-01  (adds an offline "connect to Wi-Fi" screen: a boot with no
#                    Wi-Fi now shows a friendly page + opens the Wi-Fi picker instead of a
#                    dead Chrome error page, then slides into the writing screen by itself
#                    once online. Still clears the cached background service worker each
#                    launch so a frozen worker can't block Update/Terminal.)

xset s off 2>/dev/null; xset -dpms 2>/dev/null; xset s noblank 2>/dev/null

# Use whichever Chromium binary this distro installed — some call it chromium-browser.
# (Matches the helper's own detection so boot can't fail on a "command not found".)
BROWSER="$(command -v chromium || command -v chromium-browser || echo chromium)"

# Hide the mouse cursor after 2 seconds of inactivity
pgrep -f unclutter >/dev/null || unclutter -idle 2 -root &

# Start the helper (power/restart/sleep/wifi/updates)
pgrep -f run-helper.sh >/dev/null || "$HOME/.local/share/quill-haven/run-helper.sh" &

# Window manager — needed so the terminal can appear on top of kiosk Chromium.
# xfwm4 is already installed on XFCE Linux Mint. Chromium --kiosk still goes
# fullscreen with no decorations; the WM just handles window stacking.
pgrep -x xfwm4 >/dev/null || xfwm4 &

# XFCE settings daemon — makes keyboard shortcuts (Ctrl+H = come home) work.
pgrep -x xfsettingsd >/dev/null || xfsettingsd &

# Detect screen resolution so Chromium fills every pixel (no black bars)
RES=$(xdpyinfo 2>/dev/null | awk '/dimensions:/{print $2}')
if [ -z "$RES" ]; then
  RES=$(xrandr 2>/dev/null | grep '\*' | head -1 | awk '{print $1}')
fi
W=${RES%x*}
H=${RES#*x}
SIZE_FLAGS=""
if [ -n "$W" ] && [ -n "$H" ]; then
  SIZE_FLAGS="--window-position=0,0 --window-size=$W,$H"
fi

# Load the Quill Haven overlay extension (the pill + app switcher that ride on
# every page). Only added if the extension actually downloaded, so a partial
# download can never stop the laptop from booting into the home screen.
EXT_DIR="$HOME/.local/share/quill-haven/extension"
# One-time sweep: the old two-shell overlay files are no longer used (the one shell
# is content.js). The helper only ever ADDS files, never deletes, so clear the stale
# ones here so nothing ghost can ever load alongside the new shell.
rm -f "$EXT_DIR/quill-overlay.js" "$EXT_DIR/quill-overlay.css" "$EXT_DIR/qh-bg.js" \
      "$EXT_DIR/qh-early.js" "$EXT_DIR/confirm.js" "$EXT_DIR/icon-48.png" "$EXT_DIR/icon-128.png"
EXT_FLAGS=""
if [ -f "$EXT_DIR/manifest.json" ]; then
  EXT_FLAGS="--load-extension=$EXT_DIR --disable-extensions-except=$EXT_DIR"
fi

# The writing screen and the version signal both live on GitHub Pages.
HOME_URL="https://stjohnbuilds.github.io/quill-haven-2/home-screen/"
VER_URL="https://stjohnbuilds.github.io/quill-haven-2/version.json"
OFFLINE_PAGE="$HOME/.local/share/quill-haven/offline.html"

# "Are we online?" = can we reach the home host right now.
is_online() { curl -fsS --max-time 2 -o /dev/null "$VER_URL"; }

# The "no Wi-Fi" splash is a real delivered file (helper/offline.html via the update
# manifest), styled to match the home screen. This launcher only POINTS at it. If it's
# somehow missing, we fall back to the home URL — never worse than before.

# Short grace wait so a normal boot (Wi-Fi takes a few seconds to join) still lands
# straight on the writing screen. If Wi-Fi is switched OFF, skip the wait entirely —
# this was the long black screen Marie saw. If we're still offline after ~6s, the
# splash takes over (it self-heals to the writing screen the moment we're online).
if nmcli radio wifi 2>/dev/null | grep -qi disabled; then
  : # Wi-Fi is off — no point waiting; the splash will say so.
else
  for _ in $(seq 1 6); do
    is_online && break
    sleep 1
  done
fi

# If Chromium ever crashes, restart it so Marie is never dumped to a bare X.
while true; do
  # Force the extension's background service worker to recompile from the current
  # background.js on disk. On an in-place relaunch Chromium otherwise restores the OLD
  # compiled worker from this profile, freezing background.js a version behind — the
  # cause of "Update says not-allowed" and the dead Terminal/Update buttons. Only these
  # two caches are removed (rebuilt automatically); Cookies / Login Data are untouched,
  # so the Google sign-in survives. The */ glob covers Default or any numbered profile.
  for d in "$HOME/.quill-profile"/*/"Service Worker" "$HOME/.quill-profile"/*/"Code Cache"; do
    [ -d "$d" ] && rm -rf "$d"
  done
  # Online -> writing screen. Offline -> the local splash (which self-heals to the
  # writing screen the instant a connection appears), so a lost Wi-Fi never leaves a
  # bare Chrome error page. Re-checked every relaunch, so it recovers on its own.
  # Belt-and-braces: if the splash file somehow didn't write, fall back to the network
  # rather than a file-not-found — the worst case can never be worse than before.
  if is_online; then
    TARGET="$HOME_URL"
  elif [ -f "$OFFLINE_PAGE" ]; then
    TARGET="file://$OFFLINE_PAGE"
  else
    TARGET="$HOME_URL"
  fi
  "$BROWSER" \
    --kiosk \
    --start-fullscreen \
    $SIZE_FLAGS \
    $EXT_FLAGS \
    --user-data-dir="$HOME/.quill-profile" \
    --no-first-run --noerrdialogs --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-features=TranslateUI,LocalNetworkAccessChecks \
    --overscroll-history-navigation=1 \
    "$TARGET"
  sleep 2
done
