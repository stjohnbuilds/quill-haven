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

# ROOT-CAUSE fix for the "boots into the dino game" problem: wait until the home
# host is actually reachable BEFORE loading it, so Chromium never opens on the
# offline error page. Polls up to ~30s, then falls through (so a genuinely
# offline boot still proceeds rather than hanging forever).
for _ in $(seq 1 30); do
  curl -fsS --max-time 2 -o /dev/null "https://stjohnbuilds.github.io/quill-haven-2/version.json" && break
  sleep 1
done

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
    "https://stjohnbuilds.github.io/quill-haven-2/home-screen/"
  sleep 2
done
