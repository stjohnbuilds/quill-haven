# Quill Haven — set up on a non-formattable Chromebook

Use this guide on any Chromebook with an **ARM chip** (MediaTek,
Rockchip, or Qualcomm Snapdragon) — these can't have ChromeOS removed.
This installs Quill Haven as the default app, hides everything else, and
makes the device feel like it boots straight into the writing OS.

> **No USB stick needed for this path.** Everything happens through
> Chrome on the Chromebook itself.

Takes about 10 minutes. Done once per device.

---

## Step 1 — Update your Chromebook

1. Click the **clock** (bottom-right corner of the screen).
2. Click the **cog** (Settings).
3. Click **About ChromeOS** (left side, near the bottom).
4. Click **Check for updates**. Let it finish. Restart if it asks.

---

## Step 2 — Open Chrome and go to Quill Haven

1. Open **Chrome** (the round red/yellow/green/blue icon).
2. In the address bar at the top, type:

   ```
   https://stjohnbuilds.github.io/quill-haven/
   ```

3. Press **Enter**. Quill Haven should appear.
4. **Wait 10 seconds.** This lets it save itself onto the Chromebook so
   it works even without internet later.

---

## Step 3 — Install it as an app

1. Look at the **right end of the address bar**. You'll see either:
   - A small icon that looks like a screen with a down-arrow, OR
   - The three dots (**⋮**).
2. Click it. If you clicked the three dots, then click **Cast, save and
   share** → **Install page as app...**
3. A box pops up saying **Install Quill Haven**. Click **Install**.
4. Quill Haven opens in its own window — no address bar at the top. It
   now lives in your apps list like a real program.

---

## Step 4 — Make it open every time you sign in

1. Look at the **shelf** (the bar at the bottom of the screen). Find the
   **Quill Haven** icon. If it isn't there, click the circle in the
   bottom-left corner of the screen to open your apps list, find Quill
   Haven, and right-click it.
2. Right-click the Quill Haven icon → **Pin to shelf** (if not already).
3. Right-click it again → **App info** (or the cog icon).
4. Turn on **Open at startup** (might say "Start app when you sign in").
5. Also turn on **Open as window** if you see it.

---

## Step 5 — Hide the shelf

1. **Right-click** anywhere on the shelf (the bar at the bottom).
2. Click **Autohide shelf**. The shelf vanishes unless you push your
   mouse all the way to the bottom edge of the screen.

---

## Step 6 — Remove the distractions

1. Click the circle in the bottom-left to open the apps list (or press
   the **Search** key on the keyboard — it's where Caps Lock usually is).
2. For every app that **isn't** Quill Haven (YouTube, Gmail, Play Store,
   Photos, Files, etc.), right-click it → **Uninstall** or **Remove from
   Chrome**. If Chrome won't let you remove some, that's fine — they
   won't show with the shelf hidden anyway.
3. Open Chrome one last time → click the three dots (⋮) → **Settings** →
   **On startup** → choose **Open the New Tab page**. Then close Chrome.

---

## Step 7 — Test it

1. Click the clock (bottom-right) → **Sign out**.
2. Sign back in.
3. Quill Haven should open by itself, fullscreen, no browser bar, no
   shelf showing.

If it does — you're done. That's your writing device.

---

## Updating Quill Haven later

When Claude makes changes, the next time the Chromebook has internet, the
app will pick them up by itself. If something looks stuck:

1. Open Quill Haven.
2. Hold **Ctrl + Shift + R** at the same time. Done.

---

## What this CAN'T do (and why)

- **The sign-in screen still shows.** ChromeOS won't let us skip it.
  We'd need to fully reformat the Chromebook to remove it — and this
  Chromebook's chip won't let us do that. (The other one will.)
- **Chrome is technically still hiding underneath.** If you really hunt
  for it, you can find it. The point is it never appears unless you go
  looking.
- **The "Open at startup" toggle in Step 4** — if your version of
  ChromeOS doesn't show that toggle, just pin Quill Haven to the shelf
  and tap it once after signing in. One tap. Still feels like a real
  device.

---

## If something goes wrong

Tell Claude exactly which step you're on and what you're seeing on
screen. Don't try to fix it yourself — much easier to talk it through
together.
