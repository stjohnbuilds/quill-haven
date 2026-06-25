# Quill Haven — install on a laptop

**One USB stick. Wipes the laptop. Installs Quill Haven as the operating
system.** Same process for every supported laptop. After this, the laptop
boots straight into Quill Haven — no other OS, no other browser, no other
apps.

## What works

Any laptop with an **Intel or AMD chip**:
- **Windows laptops** — any maker, any age.
- **Intel Macs** (pre-2020-ish, before Apple Silicon).
- **Intel / AMD Chromebooks** — needs one extra firmware-unlock step first.
- **Microsoft Surface** (Intel models — Surface Laptop Go, Surface Laptop,
  etc.) — needs Secure Boot turned **off** first (see Step 3). The touchscreen
  driver then installs automatically in Step 5.

## What doesn't work

These devices physically refuse to install another operating system —
nothing we can do:
- **Apple Silicon Macs** (M1, M2, M3, M4 — any 2020+ Mac).
- **ARM Chromebooks** (MediaTek, Rockchip, Qualcomm Snapdragon).

For these, the device stays whatever it is. Quill Haven isn't an option.

---

## What you need

- The laptop you're installing onto, plugged into power.
- A **USB stick — 16GB or bigger**, any brand.
- A second computer (any Mac, Windows or Linux machine) to prepare the
  USB stick. Just used for the USB step then put aside.
- Wi-Fi on both machines.
- About **1 hour** of uninterrupted time.

---

## What's going to happen (the big picture)

You'll do four things, in order. (Five if it's a Chromebook — there's
an extra unlock step at the start.)

1. **Make the USB installer** on the second computer. (~15 min)
2. **(Chromebook only)** Unlock the Chromebook's firmware. (~10 min)
3. **Boot the laptop from the USB.** (~2 min — just pressing the right
   key at startup)
4. **Install Linux Mint** from the USB. (~20 min)
5. **Run the Quill Haven setup script** to turn it into a writing
   device. (~10 min)

After step 5 the laptop reboots and opens straight into Quill Haven —
no sign-in screen, no browser, no Quill Haven "app" running inside
something else. It IS the operating system.

---

## Step 1 — Make the USB installer (on the second computer)

We're putting **Linux Mint XFCE** on the USB stick. Linux Mint is the
new operating system; XFCE is the lightweight desktop edition.

1. Open a web browser on the second computer and go to:
   ```
   https://linuxmint.com/edition.php?id=320
   ```
2. Click any **Download mirror** near you. A file ending in `.iso`
   downloads (about 2.5GB).
3. Also download **balenaEtcher** from:
   ```
   https://etcher.balena.io/
   ```
   Install it like a normal app.
4. Plug the USB stick into the second computer.
5. Open **balenaEtcher** → **Flash from file** → pick the Linux Mint
   `.iso` → **Select target** → pick the USB stick → **Flash!**
6. Wait 5–10 minutes. Eject the USB when it says "Flash Complete!".

✅ You now have a Linux installer USB.

---

## Step 2 — (Chromebook only) Unlock the firmware

**Skip this section if the laptop is a Windows machine or an Intel Mac
— go straight to Step 3.**

Chromebooks come locked to only run ChromeOS. We need to swap the
firmware for normal PC firmware first.

> **This voids the Chromebook's warranty.** Point of no return. Make
> sure you want to keep going.

First, turn on **Developer Mode**:
1. Hold **Esc + Refresh (↻) + Power** all at once. The Chromebook
   restarts to a recovery screen.
2. Press **Ctrl + D** → **Enter**.
3. It wipes itself and restarts (5–15 minutes).
4. After it reboots you'll see an "OS verification is OFF" warning
   screen on every boot — press **Ctrl + D** to skip it.
5. Sign in with any Google account.

Then flash new firmware:
1. Press **Ctrl + Alt + → (Forward arrow)** all at once. A black
   text-only screen appears.
2. At the `localhost login:` prompt, type:
   ```
   chronos
   ```
   and press Enter. (Press Enter again if it asks for a password.)
3. Paste:
   ```
   cd; curl -LO mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh
   ```
4. A menu appears. Pick **Install/Update UEFI (Full ROM) Firmware**.
5. Say **Y** to each warning.
6. Say **YES** to the backup (keep that backup file forever — it's
   the only way to put ChromeOS back).
7. Wait. The Chromebook turns off when done.

If you hit "Hardware write-protect enabled. Cannot flash Full ROM
firmware" — your Chromebook has a CR50/Ti50 security chip and needs a
$30 SuzyQable from US, 1–3 week ship. See `BEFORE-YOU-BUY.md`.

✅ The Chromebook is now a normal PC and ready for Step 3.

---

## Step 3 — Boot the laptop from the USB

> **Microsoft Surface only — do this first.** A Surface refuses to boot Linux
> until Secure Boot is off:
> 1. Turn the Surface fully off. Hold **Volume-Up** and press **Power** once;
>    keep holding Volume-Up until the firmware screen appears.
> 2. Tap **Security** → **Secure Boot** → choose **None**.
> 3. Tap **Exit** → **Restart now**.
>
> Then boot from the USB using the **Volume-Down** trick in the table below
> (hold Volume-Down while pressing Power, until Linux Mint appears).

1. Plug the USB stick into the laptop.
2. Turn the laptop on, **immediately** and **repeatedly** press the
   boot-menu key. Which key depends on the maker:

| Laptop maker | Press at boot |
|---|---|
| Windows — Dell, Lenovo, ASUS, Acer | **F12** |
| Windows — HP | **F9** or **Esc** |
| Windows — MSI, Toshiba | **F11** |
| Windows — Samsung | **F12** or **Esc** |
| Intel Mac | hold **Option (⌥)** the whole time |
| Intel/AMD Chromebook (after Step 2) | **Esc** |
| Microsoft Surface | hold **Volume-Down** while pressing Power |

3. A menu appears. Pick the USB stick (often called something like
   "USB", "UEFI: SanDisk", "Generic USB Device").
4. After a minute you see a **Linux Mint desktop** — running entirely
   from the USB.

> If F12 doesn't work, try F2, F10, Esc, Del one at a time across a
> few restarts. Every maker is slightly different. If nothing works,
> tell Claude the laptop's maker + model.

---

## Step 4 — Install Linux Mint

1. On the Linux Mint desktop, double-click the **Install Linux Mint**
   icon.
2. Follow the wizard:
   - **Language:** English
   - **Keyboard:** leave default (or pick your country)
   - **Wi-Fi:** connect to your network
   - **Multimedia codecs:** tick the box ✅
   - **Installation type:** pick **Erase disk and install Linux Mint**
     (this wipes whatever was on the laptop)
   - **Time zone:** wherever you are
   - **Who are you?**
     - Your name: whatever you want
     - Computer's name: **quillhaven**
     - Username: short, all lowercase, no spaces (e.g. **writer**)
     - **Pick a password and WRITE IT DOWN somewhere safe.** You'll
       need it once in Step 5. (We'll make it stop asking for it after
       that.)
     - Tick **Log in automatically** ✅
3. Click **Install Now**. Wait ~15 minutes.
4. When it says **"Installation Complete"** → **Restart Now**.
5. When prompted, remove the USB stick → press Enter.

✅ The laptop now boots into a normal Linux Mint desktop. Almost done.

---

## Step 5 — Turn it into Quill Haven

1. After the laptop boots into Linux Mint, click the **menu** in the
   bottom-left corner.
2. Find and open **Terminal** (may be under "System Tools", or type
   "terminal" into the search).
3. Copy this entire line, paste it into the terminal (Ctrl+Shift+V),
   and press Enter:
   ```
   curl -L https://stjohnbuilds.github.io/quill-haven/setup.sh | bash
   ```
4. Enter the password you wrote down in Step 4 (you won't see dots —
   that's normal).
5. Wait ~5 minutes. The script installs Chromium, sets Quill Haven to
   open fullscreen on every login, bakes in the URL allowlist that
   blocks every site except the writing apps, and reboots.
6. After the reboot, **Quill Haven opens by itself.** No login, no
   desktop, no Chrome, nothing else.

✅ Done. The laptop is now a Quill Haven device.

---

## Updating Quill Haven later

It updates by itself the next time the laptop has internet. If
something looks stuck, open Quill Haven and press **Ctrl + Shift + R**.

## Emergency: getting a desktop back

If you ever need to escape Quill Haven (to fix Wi-Fi, etc.):

- Hold **Ctrl + Alt + F2** at the same time. A text-only login appears.
  Log in with the username + password from Step 4.
- Type `quill-haven-recovery` and press Enter. Quill Haven turns off
  for the next boot, dropping you back to a normal Linux Mint desktop.
- To turn Quill Haven back on: type `quill-haven-enable`, then restart.

## If something goes wrong

Stop. Tell Claude:
- Which step number you're on.
- What you're seeing on screen (a photo helps).
- What the last thing you did was.
