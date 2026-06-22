#!/usr/bin/env bash
# Quill Haven — kiosk setup for Linux Mint XFCE
# Run AFTER installing Linux Mint XFCE on a wiped Chromebook.
#
#   curl -L https://stjohnbuilds.github.io/quill-haven/setup.sh | bash
#
# What it does:
#   1. Installs Chromium browser.
#   2. Launches Quill Haven in fullscreen kiosk mode on every login.
#   3. Disables screen blanking and the mouse pointer when idle.
#   4. Installs a `quill-haven-recovery` command so you can escape later.
#   5. Reboots.

set -euo pipefail

QUILL_URL="https://stjohnbuilds.github.io/quill-haven/"

say() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }

say "Updating package list"
sudo apt-get update -y

say "Installing Chromium and helpers"
sudo apt-get install -y chromium unclutter xdotool

say "Creating Quill Haven launcher"
sudo tee /usr/local/bin/quill-haven-launch >/dev/null <<'LAUNCH'
#!/usr/bin/env bash
# Never blank the screen
xset s off       || true
xset -dpms       || true
xset s noblank   || true
# Hide the mouse pointer when idle
unclutter -idle 1 -root &
# Open Quill Haven fullscreen, nothing else visible
exec chromium \
  --kiosk \
  --no-first-run \
  --noerrdialogs \
  --disable-translate \
  --disable-infobars \
  --disable-features=TranslateUI \
  --check-for-update-interval=604800 \
  --overscroll-history-navigation=0 \
  --disable-pinch \
  --start-fullscreen \
  "https://stjohnbuilds.github.io/quill-haven/"
LAUNCH
sudo chmod +x /usr/local/bin/quill-haven-launch

say "Setting Quill Haven to open at login"
mkdir -p "$HOME/.config/autostart"
cat > "$HOME/.config/autostart/quillhaven.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Quill Haven
Exec=/usr/local/bin/quill-haven-launch
X-GNOME-Autostart-enabled=true
EOF

say "Installing the recovery escape hatch"
sudo tee /usr/local/bin/quill-haven-recovery >/dev/null <<'RECOVERY'
#!/usr/bin/env bash
# Kill Quill Haven now AND stop it launching at next login.
pkill -f chromium 2>/dev/null || true
if [ -f "$HOME/.config/autostart/quillhaven.desktop" ]; then
  mv "$HOME/.config/autostart/quillhaven.desktop" "$HOME/.config/autostart/quillhaven.desktop.disabled"
fi
echo "Quill Haven stopped. Run 'quill-haven-enable' to turn it back on, then reboot."
RECOVERY
sudo chmod +x /usr/local/bin/quill-haven-recovery

sudo tee /usr/local/bin/quill-haven-enable >/dev/null <<'ENABLE'
#!/usr/bin/env bash
if [ -f "$HOME/.config/autostart/quillhaven.desktop.disabled" ]; then
  mv "$HOME/.config/autostart/quillhaven.desktop.disabled" "$HOME/.config/autostart/quillhaven.desktop"
fi
echo "Quill Haven will launch at next login. Reboot to start now."
ENABLE
sudo chmod +x /usr/local/bin/quill-haven-enable

say "Installing Chromium managed policy — the real site allowlist"
# Blocks every URL by default; only the whitelist below loads. This is what
# turns Quill Haven into a true write-only device (no hunting around).
sudo mkdir -p /etc/chromium/policies/managed
sudo tee /etc/chromium/policies/managed/quill-haven.json >/dev/null <<'POLICY'
{
  "URLBlocklist": ["*"],
  "URLAllowlist": [
    "stjohnbuilds.github.io",
    "raw.githubusercontent.com",
    "accounts.google.com",
    "docs.google.com",
    "drive.google.com",
    "www.google.com",
    "ssl.google.com",
    ".googleusercontent.com",
    ".gstatic.com",
    ".googleapis.com",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "app.dabblewriter.com",
    "dabblewriter.com",
    "typingandtomes.vercel.app",
    "vercel-scripts.com",
    "vercel.live"
  ],
  "DefaultBrowserSettingEnabled": false,
  "IncognitoModeAvailability": 1,
  "DeveloperToolsAvailability": 2,
  "TranslateEnabled": false,
  "PasswordManagerEnabled": false
}
POLICY
# Same policy for chromium-browser package (older distros use that path)
sudo mkdir -p /etc/chromium-browser/policies/managed
sudo cp /etc/chromium/policies/managed/quill-haven.json /etc/chromium-browser/policies/managed/quill-haven.json

say "Pre-warming Quill Haven so it works offline"
# Visit the URL headlessly once so the service worker caches the shell
timeout 20 chromium --headless --disable-gpu --no-sandbox "$QUILL_URL" >/dev/null 2>&1 || true

echo ""
echo "==========================================="
echo " Quill Haven is ready! Rebooting in 5 sec  "
echo "==========================================="
sleep 5
sudo reboot
