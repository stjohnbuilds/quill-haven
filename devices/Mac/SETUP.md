# Quill Haven — Mac setup

Use this guide on any Mac (Intel or Apple Silicon) running macOS 12 or
newer. Quill Haven runs as a real installed app (a PWA), opens
fullscreen on every login, and — if you want — macOS Screen Time gives
you a real site wall so Safari/Chrome physically can't load anything
except the writing apps.

> **No USB stick needed.** Everything happens through your normal
> browser.

Takes about 15 minutes.

---

## What you need

- The Mac, plugged in.
- **Chrome** or **Microsoft Edge** installed (Safari can install a PWA
  but lacks proper kiosk mode — Chrome/Edge is cleaner).
- Wi-Fi.

---

## Step 1 — Update macOS

1. Apple menu → **System Settings** → **General** → **Software Update**
   → install anything offered.

## Step 2 — Open Chrome (or Edge) and go to Quill Haven

1. Open **Chrome** or **Edge**.
2. In the address bar type:
   ```
   https://stjohnbuilds.github.io/quill-haven/
   ```
3. Press **Return**. Quill Haven loads.
4. **Wait 10 seconds** so it saves itself onto the Mac (works without
   internet later).

## Step 3 — Install Quill Haven as an app

In Chrome:
1. Right end of the address bar → click the small **install icon**
   (screen with a down-arrow) OR menu (⋮) → **Cast, save, and share**
   → **Install page as app…**
2. Click **Install**.
3. Quill Haven opens in its own window — no address bar.

In Edge:
1. Menu (…) → **Apps** → **Install Quill Haven** → **Install**.
2. Tick **Pin to Dock** when offered.

## Step 4 — Make Quill Haven open at login

1. Apple menu → **System Settings** → **General** → **Login Items &
   Extensions**.
2. Under **Open at Login**, click **+**.
3. Pick **Quill Haven** from your **Applications** folder (PWAs install
   into Chrome Apps; if you can't find it, search Spotlight for
   "Quill Haven" — drag the result into the Login Items list).
4. Close Settings.

## Step 5 — Hide the Dock

1. Apple menu → **System Settings** → **Desktop & Dock**.
2. Turn on **Automatically hide and show the Dock**.

## Step 6 — Auto-login (skip the password screen)

1. Apple menu → **System Settings** → **Users & Groups**.
2. Next to **Automatically log in as**, pick your account.
3. Enter your password when asked.

> If "Automatically log in as" is greyed out, you have **FileVault**
> turned on. Either turn FileVault off (System Settings → Privacy &
> Security) — easiest — or accept a one-tap login.

## Step 7 — Test it

1. Apple menu → **Restart**.
2. The Mac signs you back in automatically.
3. Quill Haven opens fullscreen, no Dock, no Chrome bar.

If it does — you're done.

---

## Step 8 — Optional but recommended: real site wall

Steps 1–7 get you "looks like a writing OS, but Chrome is still
hiding". For a TRUE write-only Mac — Chrome and Safari **physically
can't** load anything except Quill Haven + the 3 writing apps — turn
on macOS **Screen Time** with an allowlist.

> Screen Time is built into macOS. Free. No extensions. The wall it
> builds works across every browser on the Mac.

1. Apple menu → **System Settings** → **Screen Time**.
2. **Turn on** Screen Time (top right).
3. Side menu → **Content & Privacy** → turn it on.
4. **Web Content** → choose **Allowed Websites Only**.
5. Click **Customize…** and add each of these one at a time:
   - `stjohnbuilds.github.io`
   - `accounts.google.com`
   - `docs.google.com`
   - `drive.google.com`
   - `googleusercontent.com`
   - `gstatic.com`
   - `googleapis.com`
   - `app.dabblewriter.com`
   - `dabblewriter.com`
   - `typingandtomes.vercel.app`
6. Close Settings.

Try to visit anything not on the list (e.g. `bbc.co.uk`). You should
see:

> **Restricted Site**
> You cannot browse this page at "..." because it is restricted.

If you see that, the wall works.

To **undo** later: Screen Time → Content & Privacy → Web Content →
**Unrestricted Access**.

---

## Updating Quill Haven later

It updates by itself the next time you have internet. If stuck, open
Quill Haven and press **Cmd + Shift + R**.

## What this CAN and CAN'T do

- **It DOES** open straight into Quill Haven on every login.
- **It DOES** survive reboots, app updates, and macOS updates.
- **WITHOUT Step 8:** other websites are hidden but technically
  reachable.
- **WITH Step 8:** other websites are physically blocked by macOS
  itself, in every browser, every app.

---

## If something goes wrong

Tell Claude exactly which step you're on + what's on screen. Don't try
to fix it alone.
