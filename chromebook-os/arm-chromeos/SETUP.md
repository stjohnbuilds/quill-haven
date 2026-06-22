# Quill Haven — setup for the Acer Spin 311 (the one we can't wipe)

This Chromebook has an ARM chip, so we can't put a real new operating
system on it. **But we can make it pretend** — login screen, then straight
into Quill Haven, fullscreen, no browser bar, no shelf. As close to a real
device as we can get.

Once it's set up, you turn it on → log in → Quill Haven. That's it.

---

## What you'll do (about 10 minutes)

You only need to do this **once**. Follow each step exactly. If a screen
looks different to what's written, stop and tell Claude.

---

### Step 1 — Make sure ChromeOS is up to date

1. Click the **clock** (bottom-right corner).
2. Click the **cog** (Settings).
3. Click **About ChromeOS** (left side, near the bottom).
4. Click **Check for updates**. Let it finish. Restart if it asks.

---

### Step 2 — Open Chrome and go to Quill Haven

1. Open **Chrome** (the round red/yellow/green icon).
2. In the address bar, type:

   ```
   https://stjohnbuilds.github.io/quill-haven/
   ```

3. Press **Enter**. Quill Haven should load.
4. **Wait 10 seconds** so it can save itself to the Chromebook (this is
   what lets it work without internet later).

---

### Step 3 — Install it as an app

1. Look at the **right end of the address bar**. You'll see a small icon
   that looks like a computer screen with a down-arrow, OR three dots (⋮).
2. Click that icon. (If it's the three dots, then click **Cast, save and
   share** → **Install page as app...**)
3. A box pops up saying **Install Quill Haven**. Click **Install**.
4. The address bar will close and Quill Haven will open in its own window.
   It now lives in your apps list like a real program.

---

### Step 4 — Make it open every time you log in

1. Right-click the **Quill Haven** icon in the shelf (the bar at the
   bottom of the screen). If it's not there, click the circle in the
   bottom-left to find it, then right-click it.
2. Click **Pin to shelf** if it isn't already pinned.
3. Right-click it again → **App info** (or the cog).
4. Find the toggle that says **Open at startup** (or "Start app when you
   sign in"). Turn it **on**.
5. Also turn on **Open as window** if you see it.

---

### Step 5 — Hide the shelf (so it really feels like its own OS)

1. **Right-click** anywhere on the shelf (the bar at the bottom).
2. Click **Autohide shelf**. The shelf will disappear unless you push your
   mouse all the way to the bottom edge.

---

### Step 6 — Remove distractions

1. Open the apps list (circle in bottom-left, or push the **Search** key).
2. For every app that ISN'T Quill Haven (Files, YouTube, Gmail, Play
   Store, Photos, etc.), right-click it → **Uninstall** or **Remove from
   Chrome**. Anything Chrome won't let you remove, just ignore — they
   won't show with the shelf hidden.
3. Open Chrome one last time → three dots → **Settings** → **On startup**
   → choose **Open the New Tab page**. Then close Chrome.

---

### Step 7 — Test it

1. Click the clock → **Sign out**.
2. Sign back in.
3. Quill Haven should open by itself, fullscreen, with no browser bar and
   no shelf showing.

If it does — you're done. That's your writing device.

---

## How to update Quill Haven later

When Claude makes changes, the next time the Chromebook has internet, the
app will pick them up by itself. If something looks stuck:

1. Open Quill Haven.
2. Press **Ctrl + Shift + R** (hard refresh). Done.

---

## What this CAN'T do (and why)

- **Login screen still shows.** ChromeOS forces it. We can't remove it
  without wiping the Chromebook (which this chip won't let us do).
- **Chrome still exists underneath.** If you really dig, you can find it.
  The point is it never *appears* unless you go looking.
- **"Auto-launch on login"** is a real ChromeOS feature for normal apps —
  if your version of ChromeOS doesn't show the toggle in Step 4, just
  pin Quill Haven to the shelf and tap it after login. One tap.

---

## If something goes wrong

Tell Claude exactly which step you're on and what you're seeing on screen.
Don't try to fix it yourself — easier to talk it through together.
