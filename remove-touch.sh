#!/usr/bin/env bash
# Quill Haven — remove the Surface touchscreen driver (one-time helper).
#
# Use this ONLY if you don't use the touchscreen and you want to turn Secure
# Boot back ON (which removes the open-padlock icon at start-up). It removes the
# community linux-surface kernel and leaves the normal, signed Linux Mint kernel
# in place to boot from — so the laptop still starts up fine.
#
#   curl -L https://stjohnbuilds.github.io/quill-haven/remove-touch.sh | bash
#
# After it finishes: shut down, open the Surface firmware (hold Volume-Up +
# Power), set Security -> Secure Boot -> "Microsoft & 3rd party", then restart.
set -uo pipefail

# Safety net: make sure a normal (signed) kernel exists to fall back on FIRST,
# so we can never leave the laptop with no kernel to boot.
if ! dpkg -l 2>/dev/null | awk '/^ii/ {print $2}' | grep -q '^linux-image-.*generic'; then
  echo "STOP: couldn't find a standard Linux kernel to fall back on. Nothing removed."
  exit 1
fi

# Find the Surface kernel/header packages that are actually installed.
PKGS="$(dpkg -l 2>/dev/null | awk '/^ii/ && $2 ~ /^linux-(image|headers).*surface/ {print $2}')"
echo "Removing the Surface touchscreen driver: ${PKGS:-linux-image-surface}"
echo "(You'll be asked for your password — the one you wrote down.)"

sudo apt-get purge -y linux-image-surface linux-headers-surface $PKGS 2>/dev/null || true
sudo rm -f /etc/apt/sources.list.d/linux-surface.list /etc/apt/keyrings/linux-surface.gpg 2>/dev/null || true
sudo update-grub 2>/dev/null || true

echo ""
echo "==================================================================="
echo " Done — the touchscreen driver has been removed."
echo ""
echo " Now turn Secure Boot back on to get rid of the padlock:"
echo "   1. Shut the laptop down."
echo "   2. Hold Volume-Up and press Power; keep holding Volume-Up"
echo "      until the firmware settings screen appears."
echo "   3. Security  ->  Secure Boot  ->  choose 'Microsoft & 3rd party'."
echo "   4. Exit  ->  Restart now."
echo ""
echo " The padlock will be gone and the laptop boots normally."
echo "==================================================================="
