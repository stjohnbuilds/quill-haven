#!/usr/bin/env bash
# Quill Haven — full device setup for Linux Mint (any wiped Intel/AMD laptop,
# incl. an Intel Mac). Run AFTER installing Linux Mint. SAFE TO RE-RUN any time.
#
#   curl -L https://stjohnbuilds.github.io/quill-haven/setup.sh | bash
#
# This single command sets up EVERYTHING, so a reinstall on any laptop is one
# paste — never the long night again:
#   - Chromium kiosk that boots straight into Quill Haven
#   - Auto-login (no password every boot)
#   - Site allowlist (write-only) INCLUDING the full Google sign-in flow
#   - A tiny local "helper" so the on-screen Power / Restart / Sleep / Exit
#     buttons actually do real things
#   - Two-finger swipe-back to return to the home screen from any app
#   - Recovery escape hatch (quill-haven-recovery / quill-haven-enable)

set -euo pipefail

QUILL_URL="https://stjohnbuilds.github.io/quill-haven/"
HELPER_PORT=8137
ME="$(whoami)"

say() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }

say "Updating packages"
sudo apt-get update -y
say "Installing Chromium + helpers"
sudo apt-get install -y chromium unclutter xdotool python3

# ---------------------------------------------------------------------------
# Auto-login — no password every boot
# ---------------------------------------------------------------------------
say "Turning off the boot password (auto-login for $ME)"
sudo mkdir -p /etc/lightdm/lightdm.conf.d
sudo tee /etc/lightdm/lightdm.conf.d/12-quillhaven-autologin.conf >/dev/null <<EOF
[Seat:*]
autologin-user=$ME
autologin-user-timeout=0
EOF
sudo groupadd -f autologin
sudo gpasswd -a "$ME" autologin >/dev/null 2>&1 || true

# ---------------------------------------------------------------------------
# The helper — lets the on-screen buttons run real OS actions
# (a tiny web server on 127.0.0.1 the home screen can call)
# ---------------------------------------------------------------------------
say "Installing the helper (Power / Restart / Sleep / Exit buttons)"
sudo tee /usr/local/bin/quill-haven-helper >/dev/null <<HELPER
#!/usr/bin/env python3
import http.server, subprocess
PORT = $HELPER_PORT
ACTIONS = {
    "/poweroff": ["systemctl", "poweroff"],
    "/reboot":   ["systemctl", "reboot"],
    "/sleep":    ["systemctl", "suspend"],
    "/desktop":  ["pkill", "-f", "chromium"],
    "/ping":     None,
}
class H(http.server.BaseHTTPRequestHandler):
    def _ok(self, code=200):
        self.send_response(code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
    def do_OPTIONS(self):
        self._ok(204)
    def do_GET(self):
        path = self.path.split("?")[0]
        if path in ACTIONS:
            self._ok()
            self.wfile.write(b"ok")
            cmd = ACTIONS[path]
            if cmd:
                subprocess.Popen(cmd)
        else:
            self._ok(404)
    def log_message(self, *a):
        pass
http.server.HTTPServer(("127.0.0.1", PORT), H).serve_forever()
HELPER
sudo chmod +x /usr/local/bin/quill-haven-helper

# ---------------------------------------------------------------------------
# Kiosk launcher
# ---------------------------------------------------------------------------
say "Creating the Quill Haven launcher"
sudo tee /usr/local/bin/quill-haven-launch >/dev/null <<'LAUNCH'
#!/usr/bin/env bash
xset s off || true; xset -dpms || true; xset s noblank || true
unclutter -idle 1 -root &
# start the helper so Power/Restart/Sleep/Exit work
pgrep -f quill-haven-helper >/dev/null || /usr/local/bin/quill-haven-helper &
exec chromium \
  --kiosk \
  --no-first-run \
  --noerrdialogs \
  --disable-translate \
  --disable-infobars \
  --disable-features=TranslateUI \
  --check-for-update-interval=604800 \
  --overscroll-history-navigation=1 \
  --start-fullscreen \
  "https://stjohnbuilds.github.io/quill-haven/"
LAUNCH
sudo chmod +x /usr/local/bin/quill-haven-launch

# ---------------------------------------------------------------------------
# Open at login
# ---------------------------------------------------------------------------
say "Setting Quill Haven to open at login"
mkdir -p "$HOME/.config/autostart"
cat > "$HOME/.config/autostart/quillhaven.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Quill Haven
Exec=/usr/local/bin/quill-haven-launch
X-GNOME-Autostart-enabled=true
EOF

# ---------------------------------------------------------------------------
# Recovery escape hatch
# ---------------------------------------------------------------------------
say "Installing the recovery escape hatch"
sudo tee /usr/local/bin/quill-haven-recovery >/dev/null <<'RECOVERY'
#!/usr/bin/env bash
pkill -f chromium 2>/dev/null || true
if [ -f "$HOME/.config/autostart/quillhaven.desktop" ]; then
  mv "$HOME/.config/autostart/quillhaven.desktop" "$HOME/.config/autostart/quillhaven.desktop.disabled"
fi
echo "Quill Haven stopped. Run 'quill-haven-enable' then reboot to turn it back on."
RECOVERY
sudo chmod +x /usr/local/bin/quill-haven-recovery
sudo tee /usr/local/bin/quill-haven-enable >/dev/null <<'ENABLE'
#!/usr/bin/env bash
if [ -f "$HOME/.config/autostart/quillhaven.desktop.disabled" ]; then
  mv "$HOME/.config/autostart/quillhaven.desktop.disabled" "$HOME/.config/autostart/quillhaven.desktop"
fi
echo "Quill Haven will open at next login. Reboot to start now."
ENABLE
sudo chmod +x /usr/local/bin/quill-haven-enable

# ---------------------------------------------------------------------------
# Chromium allowlist — write-only, but Google sign-in actually works
# (a host like "google.com" matches all of its subdomains)
# ---------------------------------------------------------------------------
say "Locking the browser to the writing sites (with working Google sign-in)"
write_policy() {
  sudo mkdir -p "$1"
  sudo tee "$1/quill-haven.json" >/dev/null <<'POLICY'
{
  "URLAllowlist": [
    "127.0.0.1",
    "stjohnbuilds.github.io",
    "raw.githubusercontent.com",
    "google.com",
    "googleusercontent.com",
    "gstatic.com",
    "googleapis.com",
    "youtube.com",
    "app.dabblewriter.com",
    "dabblewriter.com",
    "typingandtomes.vercel.app",
    "vercel.app",
    "vercel-scripts.com",
    "vercel.live"
  ],
  "URLBlocklist": ["*"],
  "DefaultBrowserSettingEnabled": false,
  "IncognitoModeAvailability": 1,
  "DeveloperToolsAvailability": 2,
  "TranslateEnabled": false,
  "PasswordManagerEnabled": false
}
POLICY
}
write_policy /etc/chromium/policies/managed
write_policy /etc/chromium-browser/policies/managed

echo ""
echo "==========================================="
echo "  Quill Haven is set up. Rebooting in 5s   "
echo "==========================================="
sleep 5
sudo reboot
