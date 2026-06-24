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
sudo apt-get install -y chromium unclutter xdotool python3 curl xfce4-terminal network-manager-gnome

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
# Nuke the whole keyrings folder + pre-create a BLANK-password keyring so the
# OS never pops up "choose a password for the new keyring" on first boot.
rm -rf "$HOME/.local/share/keyrings" 2>/dev/null || true
mkdir -p "$HOME/.local/share/keyrings"
cat > "$HOME/.local/share/keyrings/default" <<EOF
login
EOF
# Empty login.keyring file with the magic header so the daemon treats it as
# created with no password (matches what GNOME writes on "use unsafe storage").
printf 'GnomeKeyring\n\n\x00' > "$HOME/.local/share/keyrings/login.keyring"
chmod 600 "$HOME/.local/share/keyrings"/* 2>/dev/null || true
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
fetch_to "$RAW/helper.py"       "$HELPER_DIR/helper.py"
fetch_to "$RAW/run-helper.sh"   "$HELPER_DIR/run-helper.sh"
fetch_to "$RAW/launch-home.sh"  "$HELPER_DIR/launch-home.sh"
# Seed the version file from the manifest so the first update check is honest.
curl -fsSL "$RAW/helper-manifest.json" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["version"])' > "$HELPER_DIR/helper-version.txt" 2>/dev/null \
  || echo "0" > "$HELPER_DIR/helper-version.txt"
cp "$HELPER_DIR/helper.py" "$HELPER_DIR/helper.py.bak" 2>/dev/null || true
chmod +x "$HELPER_DIR/run-helper.sh" "$HELPER_DIR/helper.py" "$HELPER_DIR/launch-home.sh" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Admin helper — lets the helper push system-level fixes from GitHub
# ---------------------------------------------------------------------------
say "Installing the admin helper (so future fixes push without re-running this)"
sudo tee /usr/local/bin/qh-admin >/dev/null <<'ADMIN'
#!/usr/bin/env bash
set -euo pipefail
DIR="${1:-}"
[ -d "$DIR" ] || { echo "Usage: qh-admin <workdir>"; exit 1; }
[ -f "$DIR/files.tsv" ] || { echo "No files.tsv in $DIR"; exit 1; }
while IFS=$'\t' read -r name dest mode; do
    [ -z "$name" ] && continue
    src="$DIR/$name"
    [ -f "$src" ] || { echo "SKIP $name (not found)"; continue; }
    mkdir -p "$(dirname "$dest")"
    [ -f "$dest" ] && cp -a "$dest" "${dest}.qh-bak"
    cp "$src" "$dest"
    chmod "$mode" "$dest"
    echo "OK $dest"
done < "$DIR/files.tsv"
ADMIN
sudo chmod +x /usr/local/bin/qh-admin
# Allow the helper to call qh-admin without a password — scoped to this one script
echo "$ME ALL=(ALL) NOPASSWD: /usr/local/bin/qh-admin" | sudo tee /etc/sudoers.d/quill-haven >/dev/null
sudo chmod 440 /etc/sudoers.d/quill-haven

# ---------------------------------------------------------------------------
# Kiosk launcher — pulled from GitHub (the helper keeps it up to date)
# ---------------------------------------------------------------------------
say "Setting up the Quill Haven launcher"
sudo ln -sf "$HELPER_DIR/launch-home.sh" /usr/local/bin/quill-haven-launch

# ---------------------------------------------------------------------------
# "Come home" — leave any app from anywhere
# ---------------------------------------------------------------------------
say "Adding the Come-home key (Ctrl+H)"
sudo tee /usr/local/bin/quill-home >/dev/null <<'HOME'
#!/usr/bin/env bash
# Ask the helper to go home; if the helper is down, do it directly.
curl -fsS -X POST http://127.0.0.1:8137/go-home >/dev/null 2>&1 && exit 0
pkill -x chromium 2>/dev/null; pkill -x chromium-browser 2>/dev/null
sleep 1
exec /usr/local/bin/quill-haven-launch
HOME
sudo chmod +x /usr/local/bin/quill-home
# Bind Ctrl+H to come-home by dropping the XFCE shortcut XML directly
# (xfconf-query from inside curl|bash has no D-Bus and silently no-ops).
mkdir -p "$HOME/.config/xfce4/xfconf/xfce-perchannel-xml"
cat > "$HOME/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-keyboard-shortcuts.xml" <<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<channel name="xfce4-keyboard-shortcuts" version="1.0">
  <property name="commands" type="empty">
    <property name="custom" type="empty">
      <property name="&lt;Primary&gt;h" type="string" value="/usr/local/bin/quill-home"/>
      <property name="&lt;Super&gt;Escape" type="string" value="/usr/local/bin/quill-home"/>
      <property name="override" type="bool" value="true"/>
    </property>
  </property>
</channel>
XML

# ---------------------------------------------------------------------------
# Open at login
# ---------------------------------------------------------------------------
say "Setting Quill Haven to open at login (custom session — no XFCE flash)"
# Custom X session: login goes STRAIGHT to Chromium kiosk, no XFCE desktop.
# This kills two birds: no Linux-desktop flash on boot, and no XFCE panel/taskbar
# leaking when the user hits the Command/Super key.
sudo tee /usr/share/xsessions/quill-haven.desktop >/dev/null <<EOF
[Desktop Entry]
Name=Quill Haven
Comment=Quill Haven distraction-free writing OS
Exec=/usr/local/bin/quill-haven-launch
Type=Application
EOF
# Tell lightdm to use that session for the autologin user.
sudo tee -a /etc/lightdm/lightdm.conf.d/12-quillhaven-autologin.conf >/dev/null <<EOF
user-session=quill-haven
autologin-session=quill-haven
EOF
# Belt-and-braces: keep the autostart entry too, so even if someone logs into
# the normal XFCE session (e.g. after recovery), Quill Haven still opens.
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
    "www.google.com",
    "accounts.google.com",
    "accounts.google.co.uk",
    "docs.google.com",
    "drive.google.com",
    "drive.usercontent.google.com",
    "play.google.com",
    "myaccount.google.com",
    "apis.google.com",
    "clients6.google.com",
    "ogs.google.com",
    "ssl.google.com",
    "oauth2.googleapis.com",
    "content.googleapis.com",
    "googleapis.com",
    "googleusercontent.com",
    "lh3.googleusercontent.com",
    "ssl.gstatic.com",
    "fonts.gstatic.com",
    "fonts.googleapis.com",
    "gstatic.com",
    "accounts.youtube.com",
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
