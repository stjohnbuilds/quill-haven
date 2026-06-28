#!/usr/bin/env bash
# Quill Haven — battery / power tuning. THE one home for it (setup.sh runs this too).
# Safe to run on its own, any time, twice. Turns OFF everything a writing-only
# machine never uses; KEEPS Wi-Fi at full power. No reboot needed.
set -u
say() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }

say "Tuning Quill Haven for battery"

# TLP powers down the CPU/disk/USB/PCIe lanes when idle.
sudo apt-get install -y tlp 2>/dev/null || true
# A rival power daemon can fight TLP — park it so TLP wins.
sudo systemctl mask power-profiles-daemon 2>/dev/null || true
sudo mkdir -p /etc/tlp.d
sudo tee /etc/tlp.d/01-quillhaven.conf >/dev/null <<'TLP'
# Quill Haven: tune for battery, but NEVER throttle Wi-Fi (keeps it snappy).
WIFI_PWR_ON_AC=off
WIFI_PWR_ON_BAT=off
# Power-saving CPU governor + lean toward efficiency on this low-power chip.
CPU_SCALING_GOVERNOR_ON_AC=powersave
CPU_SCALING_GOVERNOR_ON_BAT=powersave
CPU_ENERGY_PERF_POLICY_ON_AC=balance_power
CPU_ENERGY_PERF_POLICY_ON_BAT=power
# The 4415Y has no turbo worth the heat/drain on a writing box — keep it off.
CPU_BOOST_ON_AC=0
CPU_BOOST_ON_BAT=0
# Let idle USB devices sleep (TLP's allow-list keeps keyboard/touch awake).
USB_AUTOSUSPEND=1
# Audio codec sleeps fast when nothing is playing.
SOUND_POWER_SAVE_ON_AC=1
SOUND_POWER_SAVE_ON_BAT=1
# Power down idle PCIe/SATA lanes.
RUNTIME_PM_ON_AC=auto
RUNTIME_PM_ON_BAT=auto
TLP
sudo systemctl enable --now tlp 2>/dev/null || true
sudo tlp start 2>/dev/null || true

# powertop flips a few idle power bits TLP leaves alone. Run it ONCE per boot as
# a one-shot (never a live daemon, so it can't fight TLP).
sudo apt-get install -y powertop 2>/dev/null || true
sudo tee /etc/systemd/system/powertop.service >/dev/null <<'PT'
[Unit]
Description=Quill Haven one-shot powertop --auto-tune
After=multi-user.target
[Service]
Type=oneshot
ExecStart=/usr/sbin/powertop --auto-tune
[Install]
WantedBy=multi-user.target
PT
sudo systemctl enable --now powertop.service 2>/dev/null || true

# A Surface Go has a screen-rotation sensor that polls forever — useless on a
# fixed writing machine. Switch it off (one command turns it back on).
sudo systemctl disable --now iio-sensor-proxy.service 2>/dev/null || true

# Switch off background services a locked writing machine never uses:
# printing, Bluetooth, local-network discovery, the cellular-modem manager.
# (Each is one command to turn back on — e.g. `sudo systemctl enable --now bluetooth`.)
for svc in cups cups.socket cups.path cups-browsed bluetooth \
           avahi-daemon avahi-daemon.socket ModemManager; do
  sudo systemctl disable --now "$svc" 2>/dev/null || true
done
# Turn the Bluetooth radio fully off (saves the most of the four).
sudo rfkill block bluetooth 2>/dev/null || true

say "Battery tuning applied. No reboot needed."
