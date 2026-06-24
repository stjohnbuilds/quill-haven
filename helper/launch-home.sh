#!/usr/bin/env bash
# Quill Haven kiosk launcher. Starts Chromium in fullscreen kiosk mode and the
# helper service. If Chromium crashes, it restarts automatically.
# This file is kept up to date by the helper's self-update (no re-run needed).

xset s off 2>/dev/null; xset -dpms 2>/dev/null; xset s noblank 2>/dev/null

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
EXT_FLAGS=""
if [ -f "$EXT_DIR/manifest.json" ]; then
  EXT_FLAGS="--load-extension=$EXT_DIR --disable-extensions-except=$EXT_DIR"
fi

# If Chromium ever crashes, restart it so Marie is never dumped to a bare X.
while true; do
  chromium \
    --kiosk \
    --start-fullscreen \
    $SIZE_FLAGS \
    $EXT_FLAGS \
    --user-data-dir="$HOME/.quill-profile" \
    --no-first-run --noerrdialogs --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-features=TranslateUI,LocalNetworkAccessChecks \
    --overscroll-history-navigation=1 \
    "https://stjohnbuilds.github.io/quill-haven/"
  sleep 2
done
