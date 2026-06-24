#!/usr/bin/env bash
# Quill Haven — full device setup for Linux Mint (any wiped Intel/AMD laptop,
# incl. an Intel Mac). Run AFTER installing Linux Mint. SAFE TO RE-RUN any time.
#
#   curl -L https://stjohnbuilds.github.io/quill-haven/setup.sh | bash
#
# One command sets up EVERYTHING, so a reinstall on any laptop is one paste:
#   - Chromium kiosk that boots straight into Quill Haven (no password)
#   - A SELF-UPDATING helper so the Power/Restart/Sleep/Exit buttons work AND
#     future helper fixes arrive from GitHub on their own (no re-run)
#   - "Come home" key (Command+H) to leave any app from anywhere
#   - Site allowlist (write-only) including the full Google sign-in flow
#   - Recovery escape hatch (quill-haven-recovery / quill-haven-enable)

set -euo pipefail

RAW="https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/helper"
ME="$(whoami)"
HELPER_DIR="$HOME/.local/share/quill-haven"

say() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }

say "Updating packages"
sudo apt-get update -y
say "Installing Chromium + helpers"
sudo apt-get install -y chromium unclutter xdotool python3 curl xfce4-terminal

# Chromium must be the APT build, not snap — snap ignores /etc/chromium policies.
if snap list 2>/dev/null | grep -q '^chromium '; then
  say "Switching Chromium from snap to apt (snap ignores the lockdown policy)"
  sudo snap remove chromium || true
  sudo apt-get install -y chromium || true
fi

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
# Power buttons work without a password (polkit) — harmless if already allowed
# ---------------------------------------------------------------------------
say "Killing the 'Welcome to Linux Mint' popup at boot"
mkdir -p "$HOME/.linuxmint/mintwelcome"
touch "$HOME/.linuxmint/mintwelcome/norun.flag"
rm -f "$HOME/.config/autostart/mintwelcome.desktop" 2>/dev/null || true

say "Stopping the 'unlock keyring' password prompt"
# Wipe any old keyring so auto-login won't get blocked by an unlock prompt.
rm -f "$HOME/.local/share/keyrings/login.keyring" 2>/dev/null || true
rm -f "$HOME/.local/share/keyrings/default" 2>/dev/null || true
# Don't autostart the keyring at all (no saved passwords needed inside Quill Haven).
mkdir -p "$HOME/.config/autostart"
for f in gnome-keyring-secrets gnome-keyring-pkcs11 gnome-keyring-ssh gnome-keyring-gpg; do
  cat > "$HOME/.config/autostart/${f}.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=$f (disabled)
Exec=/bin/true
Hidden=true
X-GNOME-Autostart-enabled=false
EOF
done

say "Allowing power / restart / sleep without a password"
sudo tee /etc/polkit-1/rules.d/49-quillhaven.rules >/dev/null <<EOF
polkit.addRule(function(action, subject) {
    if (subject.user == "$ME" &&
        (action.id == "org.freedesktop.login1.power-off" ||
         action.id == "org.freedesktop.login1.reboot" ||
         action.id == "org.freedesktop.login1.suspend" ||
         action.id == "org.freedesktop.login1.power-off-multiple-sessions" ||
         action.id == "org.freedesktop.login1.reboot-multiple-sessions" ||
         action.id == "org.freedesktop.login1.suspend-multiple-sessions")) {
        return polkit.Result.YES;
    }
});
EOF

# ---------------------------------------------------------------------------
# The SELF-UPDATING helper — pulls itself + future fixes from GitHub
# ---------------------------------------------------------------------------
say "Installing the self-updating helper"
mkdir -p "$HELPER_DIR"
fetch_to() {  # url dest  — only overwrites on a clean download
  if curl -fsSL "$1" -o "$2.dl" 2>/dev/null; then mv "$2.dl" "$2"; fi
}
fetch_to "$RAW/helper.py"     "$HELPER_DIR/helper.py"
fetch_to "$RAW/run-helper.sh" "$HELPER_DIR/run-helper.sh"
# Seed the version file from the manifest so the first update check is honest.
curl -fsSL "$RAW/helper-manifest.json" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["version"])' > "$HELPER_DIR/helper-version.txt" 2>/dev/null \
  || echo "0" > "$HELPER_DIR/helper-version.txt"
cp "$HELPER_DIR/helper.py" "$HELPER_DIR/helper.py.bak" 2>/dev/null || true
chmod +x "$HELPER_DIR/run-helper.sh" "$HELPER_DIR/helper.py" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Kiosk launcher — opens Quill Haven, starts the helper, allows the localhost call
# ---------------------------------------------------------------------------
say "Creating the Quill Haven launcher"
cat > "$HELPER_DIR/launch-home.sh" <<'LAUNCH'
#!/usr/bin/env bash
xset s off || true; xset -dpms || true; xset s noblank || true
pgrep -f unclutter   >/dev/null || unclutter -idle 2 -root &
pgrep -f run-helper.sh >/dev/null || "$HOME/.local/share/quill-haven/run-helper.sh" &
exec chromium \
  --kiosk \
  --user-data-dir="$HOME/.quill-profile" \
  --no-first-run --noerrdialogs --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=TranslateUI,LocalNetworkAccessChecks \
  --overscroll-history-navigation=1 \
  "https://stjohnbuilds.github.io/quill-haven/"
LAUNCH
chmod +x "$HELPER_DIR/launch-home.sh"
sudo ln -sf "$HELPER_DIR/launch-home.sh" /usr/local/bin/quill-haven-launch

# ---------------------------------------------------------------------------
# "Come home" — leave any app from anywhere
# ---------------------------------------------------------------------------
say "Adding the Come-home key (Command+H)"
sudo tee /usr/local/bin/quill-home >/dev/null <<'HOME'
#!/usr/bin/env bash
# Ask the helper to go home; if the helper is down, do it directly.
curl -fsS -X POST http://127.0.0.1:8137/go-home >/dev/null 2>&1 && exit 0
pkill -x chromium 2>/dev/null; pkill -x chromium-browser 2>/dev/null
sleep 1
exec /usr/local/bin/quill-haven-launch
HOME
sudo chmod +x /usr/local/bin/quill-home
# Bind a few combos so at least one works on a Mac keyboard.
for combo in "<Super>h" "<Primary><Alt>h" "<Super>Escape"; do
  xfconf-query -c xfce4-keyboard-shortcuts -p "/commands/custom/$combo" -n -t string -s "/usr/local/bin/quill-home" 2>/dev/null \
  || xfconf-query -c xfce4-keyboard-shortcuts -p "/commands/custom/$combo" -s "/usr/local/bin/quill-home" 2>/dev/null || true
done

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
pkill -f run-helper.sh 2>/dev/null || true
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
# Chromium allowlist + Local-Network opt-in (so the power button can reach the helper)
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
    "accounts.google.com",
    "accounts.youtube.com",
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
  "LocalNetworkAccessAllowedForUrls": ["https://stjohnbuilds.github.io"],
  "LocalNetworkAccessRestrictionsTemporaryOptOut": true,
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
