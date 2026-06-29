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

# apt must NEVER abort the whole setup. On a RE-RUN the packages are already
# installed, and a flaky third-party repo (e.g. linux-surface) can make
# `apt-get update` fail. With `set -e` that aborted the script at the very first
# step — so the re-run did NOTHING (no file refresh, no policy, no helper). That
# is exactly the "re-run did nothing / sites still blocked" bug. Guard apt and
# carry on to the parts that actually matter.
say "Updating packages (not fatal — skipped if a repo is down)"
sudo apt-get update -y || true
say "Installing Chromium + helpers (skipped if already present)"
sudo apt-get install -y chromium unclutter xdotool python3 curl xfce4-terminal network-manager-gnome || true

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
# Download the Quill Haven extension (the shell: bar, dock, settings, lockdown).
EXT_RAW="https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/extension"
mkdir -p "$HELPER_DIR/extension"
# These FIVE files ARE the extension — they must match extension/manifest.json.
# Without them Chromium loads an empty shell: no bar, no dock, no lockdown.
fetch_to "$EXT_RAW/manifest.json"   "$HELPER_DIR/extension/manifest.json"
fetch_to "$EXT_RAW/apps.js"         "$HELPER_DIR/extension/apps.js"
fetch_to "$EXT_RAW/content.js"      "$HELPER_DIR/extension/content.js"
fetch_to "$EXT_RAW/background.js"   "$HELPER_DIR/extension/background.js"
fetch_to "$EXT_RAW/shell.css"       "$HELPER_DIR/extension/shell.css"
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
    case "$dest" in
        /etc/chromium/*|/etc/chromium-browser/*) : ;;
        *) echo "REJECT $dest (outside allowed paths)"; continue ;;
    esac
    case "$dest" in *..*) echo "REJECT $dest (unsafe path)"; continue ;; esac
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
say "Blocking the common distraction sites (everything else stays open)"
write_policy() {
  sudo mkdir -p "$1"
  sudo tee "$1/quill-haven.json" >/dev/null <<'POLICY'
{
  "URLBlocklist": [
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "x.com",
    "tiktok.com",
    "reddit.com",
    "snapchat.com",
    "pinterest.com",
    "tumblr.com",
    "threads.net",
    "netflix.com",
    "twitch.tv",
    "hulu.com",
    "disneyplus.com",
    "amazon.com",
    "ebay.com",
    "discord.com",
    "9gag.com",
    "imgur.com",
    "buzzfeed.com"
  ],
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

# ---------------------------------------------------------------------------
# Surface touchscreen — ONLY runs on Microsoft Surface hardware, so this stays
# safe on any other laptop. Adds the community linux-surface kernel so the
# touchscreen works. Fully guarded: if it can't run (Secure Boot still on) or
# anything fails, the rest of Quill Haven still installs and the laptop works
# fine on trackpad + keyboard — we can switch touch on later by re-running.
# ---------------------------------------------------------------------------
QH_VENDOR="$(cat /sys/class/dmi/id/sys_vendor 2>/dev/null || true)"
QH_PRODUCT="$(cat /sys/class/dmi/id/product_name 2>/dev/null || true)"
if printf '%s %s' "$QH_VENDOR" "$QH_PRODUCT" | grep -qi surface; then
  sudo apt-get install -y mokutil 2>/dev/null || true
  if mokutil --sb-state 2>/dev/null | grep -qi enabled; then
    say "Surface touchscreen needs Secure Boot turned OFF first (one toggle in the Surface firmware). Skipping touch for now — trackpad + keyboard still work. Turn Secure Boot off, then re-run this and touch switches on."
  else
    say "Microsoft Surface detected — adding the touchscreen driver (linux-surface)"
    {
      sudo mkdir -p /etc/apt/keyrings &&
      curl -fsSL https://raw.githubusercontent.com/linux-surface/linux-surface/master/pkg/keys/surface.asc \
        | sudo gpg --dearmor --yes --output /etc/apt/keyrings/linux-surface.gpg &&
      echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/linux-surface.gpg] https://pkg.surfacelinux.com/debian release main" \
        | sudo tee /etc/apt/sources.list.d/linux-surface.list >/dev/null &&
      sudo apt-get update -y &&
      sudo apt-get install -y linux-image-surface linux-headers-surface iptsd libwacom-surface &&
      sudo update-grub &&
      say "Surface touchscreen driver installed (takes effect after the reboot)"
    } || say "Surface driver step hit a snag — skipped it. Quill Haven still works on the trackpad; we can add touch later."
  fi
fi

# ---------------------------------------------------------------------------
# Battery saver — a writing appliance only needs a short list of things on.
# Tune power management, then switch off background services it never uses.
# Wi-Fi is deliberately kept at FULL power so it never lags — only the rest
# is tuned down. Everything here is safe to re-run and easy to undo.
# ---------------------------------------------------------------------------
say "Tuning for battery (switching off everything a writing machine never uses)"

# The battery/power tuning lives in ONE place — tools/battery.sh — so the very
# same tuning can be re-run on its own later without re-running this installer.
curl -fsSL "https://raw.githubusercontent.com/stjohnbuilds/quill-haven/main/tools/battery.sh" | bash || true

echo ""
echo "==========================================="
echo "  Quill Haven is set up. Rebooting in 5s   "
echo "==========================================="
sleep 5
sudo reboot
