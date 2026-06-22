# Quill Haven — Windows kiosk setup

Use this guide on any Windows 10 or 11 laptop. Quill Haven runs as a real
installed app (a PWA) and opens fullscreen on every login — no taskbar,
no Edge browser bar, nothing else. Press the power button, sign in,
write.

> **You do NOT need a USB stick for this.** Everything happens through
> Microsoft Edge on the laptop itself.

Takes about 10 minutes.

---

## What you need

- The Windows laptop, plugged in.
- A Microsoft Edge browser (it ships with Windows).
- Wi-Fi.

---

### Step 1 — Update Windows

1. Click **Start** → **Settings** → **Windows Update** → **Check for
   updates**. Install anything offered. Restart if it asks.

### Step 2 — Open Edge and go to Quill Haven

1. Open **Microsoft Edge** (the green/blue swirl icon).
2. In the address bar, type:
   ```
   https://stjohnbuilds.github.io/quill-haven/
   ```
3. Press **Enter**. Quill Haven should appear.
4. **Wait 10 seconds** so it saves itself onto the laptop (works without
   internet later).

### Step 3 — Install Quill Haven as an app

1. Look at the **right end of the address bar**. You'll see a small
   icon that looks like a screen with a down-arrow, OR the three dots
   (**…**).
2. Click it. If you clicked the three dots → **Apps** → **Install Quill
   Haven**.
3. A box says **Install Quill Haven**. Click **Install**.
4. Tick **Pin to taskbar** and **Pin to Start** when offered.
5. Quill Haven opens in its own window — no address bar.

### Step 4 — Make it open every time you sign in

Pick ONE of these two methods:

**A) Easy way (everyone):** run one PowerShell command. Open PowerShell
(press the Windows key, type "PowerShell", press Enter), paste this in
and press Enter:

```
irm https://stjohnbuilds.github.io/quill-haven/setup-windows.ps1 | iex
```

It sets Quill Haven to launch fullscreen at every login and prints
what's next.

**B) Manual way:** in Edge, click the three dots (**…**) → **Apps** →
**Manage apps** → find **Quill Haven** → tick **Start on login** and
**Open as window**.

### Step 5 — Auto sign-in (so you don't see the login screen)

1. Press **Windows key + R**. A small "Run" box opens.
2. Type **netplwiz** and press Enter.
3. Untick **Users must enter a user name and password to use this
   computer**.
4. Click **Apply**. Enter your password twice when asked, then **OK**.

### Step 6 — Hide the taskbar (so it feels like its own OS)

1. **Right-click** the taskbar (the bar at the bottom).
2. Click **Taskbar settings**.
3. Turn on **Automatically hide the taskbar**.

### Step 7 — Test it

1. Click **Start** → your account icon → **Sign out**.
2. The laptop signs you back in by itself.
3. Quill Haven opens by itself, fullscreen, no browser bar, no taskbar.

If it does — you're done.

---

## Updating Quill Haven later

It updates by itself the next time you have internet. If something looks
stuck, open Quill Haven and press **Ctrl + Shift + R**.

---

## What this CAN and CAN'T do

- **It DOES** open straight into Quill Haven with no browser bar, no
  taskbar, on every login.
- **It DOES NOT yet** block other websites — if you go hunting in
  regular Edge you can still browse. For a true site wall, ask Claude
  to set up **Microsoft Family Safety** — that gives you OS-level
  allowlisting (only Quill Haven + the 3 writing apps load).

---

## If something goes wrong

Tell Claude exactly which step you're on and what's on screen. Don't
try to fix it alone.
