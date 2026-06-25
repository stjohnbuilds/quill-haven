# Quill Haven — Hardware & OS Requirements (research brief)

Purpose: hand this to a hardware-research assistant to judge whether a given
machine can run Quill Haven, and to shop for the cheapest machine that can.

## What Quill Haven is (context)
A locked-down "writing OS" layer on top of Linux. On power-on the machine boots
straight into Chromium in **kiosk mode**, showing a custom home screen plus a
small set of writing web apps. Everything else (other sites, the desktop,
settings) is blocked. It is NOT a normal desktop the user can wander around.

## The one hard constraint (decides every device)
The device must be able to **run a mainstream Linux** that can launch **Chromium
in kiosk mode** with: enterprise managed policies (URL allow/block list) AND a
loaded unpacked extension (`--load-extension`). If a machine can't run that, it
can't run Quill Haven — nothing else matters.

## Software / OS it depends on
- **Linux** (desktop distro). Currently built around: **systemd**
  (`systemctl poweroff/reboot/suspend`), **NetworkManager** (`nmcli`),
  **Python 3** (local helper service), and an **X11 session + lightweight window
  manager** (XFCE-class: `xfwm4`, `xfsettingsd`, plus `xset`, `unclutter`,
  `xrandr`). A Wayland-only or non-systemd distro would need adapting.
- **Chromium** (or Chrome) with: `--kiosk`, managed policies in
  `/etc/chromium/policies/managed/`, and unpacked-extension loading.
- **Internet access** — the home screen and writing apps are web-hosted, and
  updates are pulled from GitHub. Wi-Fi is effectively required.
- A small amount of **sudo** for first-time install of the lockdown policy.

## Apps it runs (all web-based)
- Google Docs (needs Google sign-in; optional Google Drive backup)
- Dabble Writer (app.dabblewriter.com)
- Typing & Tomes (typingandtomes.vercel.app)
- Plus two lightweight local web apps (a writing pad + a files view)

## Hardware features it USES (must work on the device)
- **Display** — fullscreen browser; resolution auto-detected. No discrete GPU needed.
- **Keyboard** — core; this is a writing machine.
- **Pointer** — trackpad/mouse and/or **touchscreen** (the overlay is tap-friendly).
- **Wi-Fi** — essential (apps are online).
- **Battery + power** — power-off and restart (reliable); see sleep note below.
- **USB port** — for the install USB and for the in-OS Files app / USB sticks.
- **Speakers** — optional (only if a writing app plays sound).

## Hardware it does NOT need (safe to ignore when shopping)
Webcam, microphone, discrete/dedicated GPU, external-monitor output, Bluetooth
(optional, only for a wireless mouse/keyboard), cellular/LTE, fingerprint reader,
high-refresh or high-color display.

## Minimum vs recommended specs
| Spec | Minimum | Comfortable |
|------|---------|-------------|
| CPU | 64-bit dual-core, ~2015+ (x86-64), Apple M1+, or Raspberry Pi 4+ | quad-core, M1/M2, or Pi 5 |
| RAM | 4 GB | 8 GB (Google Docs + Dabble are JS-heavy) |
| Storage | 32 GB SSD/eMMC | 64 GB+ SSD |
| Screen | ~1366×768 | 1080p+ |
| Wi-Fi | required | 5 GHz |
| Ports | 1× USB | USB-A + USB-C |

## Chip / platform compatibility (decision table, verified June 2026)
- **Intel / AMD laptops** (any wipeable Windows-class laptop): ✅ any mainstream
  Linux (Mint, Ubuntu, Fedora, Debian). **Easiest + cheapest path.**
- **Older Intel Macs** (pre-2020): ✅ any mainstream Linux.
- **Apple-silicon Macs via Fedora Asahi Remix:**
  - M1 (incl. Pro/Max/Ultra): ✅ fully supported, daily-usable
  - M2 (incl. Pro/Max/Ultra): ✅ fully supported, daily-usable
  - M3: ⚠️ NOT reliable yet (June 2026). Boots and basic hardware works
    (keyboard/trackpad/Wi-Fi/USB), but the **GPU is unsupported**, so graphics are
    software-rendered — "extremely slow, barely keeps up with scrolling a terminal."
    No polished desktop, no ETA. Would make Chromium + web apps crawl. **Don't shop on M3.**
  - M4, M5: ❌ not supported (in development, no timeline)
  - A18 Pro (2026 "MacBook Neo"): ❌ not supported — unusual chip, unlikely soon
- **Microsoft Surface Laptop line (clamshell, non-kickstand):**
  - Intel models — Surface Laptop 1–6, Surface Laptop Go 1–3, Surface Laptop
    Studio 1–2: ✅ work, but Surface hardware is fussy under Linux — usually needs
    the community **linux-surface** kernel for full support (touchscreen, sleep,
    and Wi-Fi on some models). Check the exact model on the linux-surface list.
  - Arm / Snapdragon X models — Surface Laptop 7 (2024+) and any "Copilot+ PC":
    ❌ avoid. Linux boots but keyboard/touchpad/touchscreen/audio/USB are
    still broken or partial. Not usable yet.
  - Rule of thumb: "Copilot+" or "Snapdragon X" on the box = skip; "Intel Core" = OK.
  - Note: Surface is fussier than a plain Dell/Lenovo/HP or a used M1/M2 MacBook.
- **Raspberry Pi 4/5 (4 GB+):** ✅ already Linux; works for light use (plugged in).
- ❌ **Cannot be used:** iPads, Android tablets, phones, or anything locked to its
  own system that you can't wipe and install Linux on.

**Sweet spot for an Apple machine:** a used **M1 or M2 MacBook** — fully Linux-
supported and cheap secondhand. For lowest cost overall: a used **Intel/AMD
laptop** with 8 GB RAM and an SSD.

## Known constraints to factor into research
- **Sleep/suspend is weak on Apple-silicon Linux (Asahi).** Plan: use
  screen-off-on-idle + manual/auto power-off instead (both reliable). Don't pick a
  machine assuming lid-close sleep on Asahi will be perfect.
- **Lockdown layer currently assumes X11 + systemd + NetworkManager.** A target
  distro that's Wayland-only or uses a different network/init stack will need the
  launch + lockdown scripts adapted (not a rewrite, but work).
- **Kiosk must permit a loaded unpacked extension.** Confirm on the target.
