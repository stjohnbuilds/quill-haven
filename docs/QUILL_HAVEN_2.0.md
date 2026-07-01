# Quill Haven 2.0 — Build Plan

> **Marks:** 🟩 = new this round, please check · 🟪 = later / to-do
> (Earlier notes you already approved are now folded in as plain text.)

Quill Haven is a writing-only Linux laptop. It turns on straight into a calm writing home
screen and only opens approved internet writing tools — Google Docs, Dabble, and any website
you add. The internet part is the whole difference from a locked tablet: these are real web
pages, not apps trapped in a fake frame.

**How to read this:** this file is the plan. We build 2.0 fresh from these descriptions — we
do **not** copy the old code (copying brings the old bugs with it). Anything marked 🟪
**(LATER)** is parked on purpose and built after the main OS works.

---

## Build order (and why)
Appearance is first because it's the look everything else is drawn on. Apps is its own chunk
because Google Docs has to run as a real page, not in its own box. Then the helper, the
screens, the safety, and the packaging. Writing and Files come last.

1. **Appearance** — the look (colours, themes, fonts)
2. **Helper** — carried over; does the real-computer jobs
3. **Shell** — the bar + dock + settings that float on every page
4. **Home screen** — the calm backdrop + logo + app grid
5. **Apps** — Google Docs, Dabble, and "add a website"
6. **Lockdown** — block everything else; a blocked page sends you home
7. **Updates** — nothing installs until you approve it
8. **Security** — lock the helper so only Quill Haven can use it
9. **Installer** — set the laptop up safely
10. 🟪 **Writing app** — (LATER)
11. 🟪 **Files + backup** — (LATER)

---

## 1. Appearance — the look, built first
Calm, soft, bookish, distraction-free. Pastel and frosted-glass. We copy the *look*, not the
old CSS.

- Background: soft pastel gradient. 🟪 *(LATER: set your own wallpaper from a Google Drive photo.)*
- Themes: Purple (default), Wood, Slate, Dark, plus a warm Night Light filter. App icons
  re-tint to match the theme.
- Fonts: plain sans-serif for the interface, EB Garamond for writing, a fancy script for the
  boot logo only.
- Glassy panels, soft shadows, rounded corners. Gentle motion — small hover lifts and fades.

## 2. Helper — the part we keep
A tiny background program that does the real-computer jobs a web page can't: power, restart,
sleep, screen-off, Wi-Fi, come-home, and applying updates. Only the laptop itself can reach
it. It already restarts itself if it stops, waits for the internet before loading the screen,
checks every update before trusting it, keeps a backup to undo a bad one, and does one update
at a time. 🟩 *Shutting down or restarting shows a calm screen, not the scary "[FAILED]…"
system text.*

🟪 *(LATER, small: the secret handshake lock + a fully all-or-nothing update step — see Security.)*

## 3. Shell — the bar that's always there
One bar at the top (clock, Wi-Fi, battery, power, settings cog, update flag) and one dock (the
app switcher), floating on top of every page so you always have controls and never get stuck.

**Settings — there is one.** Tap the cog anywhere — on the home screen or inside Google Docs —
and the same one settings popup opens. No second version, no second place. One cog, one popup.

Inside settings:
- **Wi-Fi** — a simple built-in picker: see your networks, tap one, type the password.
- **Brightness** — a slider.
- **Theme** — Purple / Wood / Slate / Dark, a colour slider, and a Night Light toggle.
- **Battery** — a battery symbol with a lightning bolt when charging; hover it to see the
  percentage and time left (e.g. "2h 05m").
- **Region** — a short list of common time zones (not hundreds), plus Auto.
- **Power** — sleep, restart, power off.
- **Google account / Drive** — sign in (for Docs and backup).
- **Open terminal** — support only.

Other shell behaviour:
- **One app list, shared.** The dock and the home grid read the same list. Add, rename, or
  reorder an app and it shows up everywhere instantly — no reload, no reboot.
- **Move it by the grip.** Drag the bar/dock by a small handle only, so tapping a button never
  drags it by accident.
- **Fits small screens.** The settings popup caps its width and scrolls inside, so it never
  runs off the edge.
- If reordering apps ever fails to save, it tells you (no silent loss).
- The shell is the only bar on every page. If it ever fails to load, the home screen shows
  minimal fallback buttons so you're never stuck.

## 4. Home screen — the calm backdrop
Just the wallpaper, the **Quill Haven logo** (where the clock used to be — the time's already
top-right, so no clock here), and the grid of your apps. The grid reads the one shared app list.

## 5. Apps — the approved web tools
The websites Quill Haven is allowed to open: Google Docs and Dabble to start, plus an "add a
website" button. Each opens fullscreen with the shell floating on top. (Google Docs can't be
wrapped in its own box — that's exactly why the OS is built this way.) Adding or removing a
website here updates what the lockdown lets through.

## 6. Lockdown — locked to writing, without trapping you
Boots straight in and blocks everything except your approved apps. If you ever hit a blocked
or broken page, you land back home instead of getting stuck on an error page.

## 7. Updates — you approve, then it installs
- Nothing installs on its own. You tap "Update" to apply it.
- **A new emoji every update, enforced** — the release tool refuses to ship without a new
  emoji, so it can never be skipped or faked.
- The emoji changes only **after** the new version is actually running — so a changed emoji
  always means it really landed.
- The home screen is "pinned": it can't quietly update itself on a reboot, only when you
  approve. This stops a bad update sneaking on overnight.
- The whole 2.0 can arrive as one update (no re-install), as long as no brand-new system
  program is needed.
- 🟩 *Before it restarts to apply an update (or to come home), it gives the page a moment to
  save first, so you don't lose the last few words you typed.*

## 8. Security
- **Lock the helper** so only Quill Haven can press its buttons (power, restart, update). This
  matters now, not just later — it stops anything else on the laptop from using the helper.
- The part that changes protected system files only writes to approved folders.
- 🟪 *(LATER) Extra hardening matters more once the Writing/Files apps exist; the lockdown
  covers the basics until then.*

## 9. Installer — set up without breaking
Setup happens in steps: install the browser, copy the files, set the lock, start the helper.
If one step fails partway you could end up with a broken, half-built laptop. So at the end the
installer checks everything actually landed and tells you clearly if anything's missing —
instead of leaving a broken machine. It also detects the right browser name and keeps one safe
way back to a normal desktop if Quill Haven ever fails.

## 10. 🟪 Writing app — (LATER)
A calm editor, built only after the whole OS is solid and bug-free. 🟩 *(new — writing-safety
fixes folded in)* When built:
- **Never loses text silently** — if a save can't finish (e.g. disk full) it keeps showing
  "NOT saved" until it really saves; it never warns once then goes quiet.
- **Won't let you type into nothing** — if no page is open the editor is off, so words can't
  vanish into an empty slot.
- **Shows storage live**, so you see space running low before it's a problem.
- Remembers your place, and lets you drag to reorder scenes.

## 11. 🟪 Files + backup — (LATER)
The real point is backup: an automatic copy of your writing to Google Drive (sign in once). A
local file browser is optional and comes last, if at all. 🟩 *If a Files browser is built,
downloads from the Writing app must actually land in it (the old one had a button that went
nowhere).*

---

## How we build it (so old problems can't come back)
- Build from these descriptions; never paste old code.
- The helper is the fixed centre; everything else is new.
- One piece at a time, shown working before moving on.
- Every "done" is double-checked by a separate pass, not just trusted.
