# Quill Haven — full reformat install

Use this guide on any Chromebook with an **Intel or AMD chip** — these
can have ChromeOS wiped off completely and a custom operating system
installed in its place. The result: press the power button, Quill Haven
opens. No sign-in screen, no Chrome browser, no other operating system
underneath. It IS the OS.

> **Get help running this one.** It takes about an hour and has a few
> technical steps (firmware flash, OS install). Best done with Claude on
> the line, step by step.

---

## What you need before starting

- **The Chromebook**, plugged into its charger.
- **A USB stick — 16GB or bigger.** (8GB technically works, but 16GB
  gives breathing room and they cost about the same. Any brand is fine.)
- **A second computer** (Mac, Windows, or Linux — any works) to prepare the USB stick.
- **Wi-Fi**, on both machines.
- **About 1 hour** of uninterrupted time.

---

## What's going to happen (the big picture)

You'll do five things, in order. Each one is its own section below.

1. **Make a USB installer** on another computer. (~15 min)
2. **Turn on Developer Mode** on the Chromebook. (~15 min, mostly waiting)
3. **Unlock the Chromebook's firmware** so it stops being a Chromebook. (~10 min)
4. **Install our new operating system** from the USB stick. (~20 min)
5. **Run the Quill Haven setup script** to turn it into a writing device. (~10 min)

After step 5 you reboot, and you're done forever.

---

## Step 1 — Make the USB installer (on another computer)

We're putting **Linux Mint XFCE** on the USB stick. This is the new
operating system. It's free, friendly, and runs fast on cheap hardware.

1. On another computer, open a web browser and go to:

   ```
   https://linuxmint.com/edition.php?id=320
   ```

2. Click any **Download mirror** near you (United Kingdom is fine).
   A file ending in `.iso` will start downloading. It's about 2.5GB.
3. While it downloads, also download **balenaEtcher** (the tool that
   puts the .iso onto the USB):

   ```
   https://etcher.balena.io/
   ```

   Install it like a normal Mac app (drag into Applications).
4. Plug the USB stick into another computer.
5. Open **balenaEtcher**. Click **Flash from file** → pick the Linux
   Mint .iso. Click **Select target** → pick your USB stick (it'll
   show its size). Click **Flash!**.
6. Wait 5–10 minutes. When it says "Flash Complete!", eject the USB
   stick from another computer.

✅ You now have a Linux installer USB.

---

## Step 2 — Turn on Developer Mode

The next step needs the `shell` command in crosh, which ChromeOS hides
unless Developer Mode is on. Turning it on **wipes the Chromebook** —
that's fine because we're about to wipe it anyway, but save any files
on it first if you haven't.

1. Hold **Esc + Refresh (↻) + Power** all at once. The Chromebook
   restarts to a recovery screen with a yellow warning triangle.
2. Press **Ctrl + D**. A new screen asks to turn off OS verification —
   press **Enter**.
3. It wipes itself and restarts. Takes 5–15 minutes. Let it.
4. After it reboots, you'll see a scary "OS verification is off" screen
   every time it turns on. Just press **Ctrl + D** to skip past it.
   (Step 3 below replaces this screen with normal PC firmware, so it
   only matters for a short while.)
5. Sign in with any Google account again to get to the desktop.

✅ Developer Mode is on. `shell` will now work in crosh.

---

## Step 3 — Unlock the Chromebook's firmware

The Chromebook has special firmware that only lets it run ChromeOS. We
need to swap that for normal PC firmware first.

> **This step "voids the warranty" of the Chromebook.** That's fine —
> the warranty is the price of owning your own device. You can't undo
> this step easily, so this is the point of no return. Make sure you
> want to keep going before you start.

1. Press **Ctrl + Alt + → (Forward arrow)** all at once. The Forward
   arrow is the second key in the top row (the one after Back ←). The
   screen goes black with white text — that's a real text-only terminal.
2. At the `localhost login:` prompt, type:

   ```
   chronos
   ```

   and press Enter. If it asks for a password, press Enter (or use the
   one you set, if you set one).
3. Type or paste this whole line (Ctrl+Shift+V to paste), then press
   Enter:

   ```
   cd; curl -LO mrchromebox.tech/firmware-util.sh && sudo bash firmware-util.sh
   ```

   The flag in the middle is `-LO` (one short dash, capital **L**, then
   capital **O** — two letters squished together).
4. A menu appears (white text on dark background).
5. Type the number for **Install/Update UEFI (Full ROM) Firmware** and
   press Enter.
6. It will warn you several times. Type **Y** and press Enter for each
   warning, until it asks if you want a backup.
7. **Say YES to the backup.** It saves a copy of the original firmware
   to your USB stick — keep it somewhere safe forever (it's the only
   way to put ChromeOS back exactly as it was).
8. Wait. The screen will print lots of text. When it finishes, the
   Chromebook will turn off.

> **Why not the normal Chrome terminal (crosh)?** On newer ChromeOS
> versions `sudo` in crosh fails with a "no new privileges" error. The
> Forward-arrow terminal above doesn't have that limit.
>
> If you ever want to get back to the normal ChromeOS desktop while
> still in the text terminal: **Ctrl + Alt + ← (Back arrow)**.

✅ The Chromebook is no longer a Chromebook. Don't turn it on yet.

---

## Step 4 — Install our new operating system

1. Plug the **USB stick** into the Chromebook.
2. Press the **power button**. A new screen appears (might say "boot
   menu" or have a logo). It should boot from the USB automatically.
   If it doesn't, press **F12** or **Esc** repeatedly while powering on
   and pick the USB from the list.
3. After a minute you'll see a Linux Mint desktop. There's an icon on
   the desktop called **Install Linux Mint** — double-click it.
4. Follow the installer:
   - **Language:** English
   - **Keyboard:** (leave default, or pick UK)
   - **Wi-Fi:** connect to your network
   - **Multimedia codecs:** tick the box ✅
   - **Installation type:** pick **Erase disk and install Linux Mint**
     (this wipes ChromeOS forever)
   - **Time zone:** wherever you are
   - **Who are you?**
     - Your name: whatever you want
     - Your computer's name: **quillhaven**
     - Pick a username: short, all lowercase, no spaces (e.g. **writer**)
     - **Pick a password and WRITE IT DOWN somewhere safe.** You'll need
       it later. (We'll make it stop asking for it once setup is done.)
     - Tick **Log in automatically** ✅
5. Click **Install Now**. Wait ~15 minutes.
6. When it says "Installation Complete", click **Restart Now**.
7. When it tells you to remove the USB stick — pull it out and press
   Enter.

✅ Linux Mint is installed. The Chromebook now boots to a normal desktop.

---

## Step 5 — Turn it into Quill Haven

This is the magic step. You'll run **one command** that installs Quill
Haven, sets it to open on power-on, and hides everything else.

1. After the Chromebook boots into Linux Mint, look in the bottom-left
   corner for the **menu** (like a Windows Start menu). Click it.
2. Find and open **Terminal** (might be under "System Tools" or just
   search for "terminal").
3. Copy this entire line, paste it into the terminal, and press Enter:

   ```
   curl -L https://stjohnbuilds.github.io/quill-haven/setup.sh | bash
   ```

4. It will ask for your password (the one you wrote down in Step 4).
   Type it and press Enter. (You won't see the dots — that's normal.)
5. The script will install Chromium browser, set Quill Haven to launch
   on startup, and hide all the desktop bits. Takes about 5 minutes.
6. When it says **"Quill Haven is ready! Rebooting in 5 seconds..."**,
   wait. The Chromebook restarts on its own.
7. After the restart, **Quill Haven opens by itself.** No login, no
   desktop, no Chrome — just Quill Haven.

✅ Done. That's your writing device.

---

## URL Quill Haven lives at

```
https://stjohnbuilds.github.io/quill-haven/
```

All Quill Haven installs point at this URL. The setup script above
fetches everything from here. After the first time, it works offline.

---

## How to update Quill Haven later

It updates by itself the next time you have internet. If something
looks stuck, ask Claude — we can SSH in and force it.

---

## Emergency: how to get a desktop back

If you ever need to get out of Quill Haven (to fix something, change
Wi-Fi, etc.):

- Hold **Ctrl + Alt + F2** at the same time. A text-only login appears.
  Log in with your username and password.
- Type `quill-haven-recovery` and press Enter. This drops you back to a
  normal Linux Mint desktop.
- To go back to Quill Haven: restart.

---

## If something goes wrong

Stop. Don't keep trying things. Open Claude and say:

- Which **step number** you're on
- What you're **seeing on screen** (a photo helps)
- What the **last thing you did** was

We'll work it out together.
