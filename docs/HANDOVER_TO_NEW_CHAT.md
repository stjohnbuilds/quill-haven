# Handover — Quill Haven (updated 2026-06-21)

## COPY-PASTE THIS into a fresh Claude Code chat to bootstrap:

You are continuing work on **Quill Haven** — a whole writing **operating system**.
It runs on an Acer Chromebook Spin 311, but the Chromebook is just the hardware:
on power-on the device boots straight into this home screen — no ChromeOS, no
browser to wander off into. "Only the writing apps" isn't a restriction we add,
it IS the point: a device that can only write. Today it's a static HTML/CSS/JS
"OS" running in a fullscreen browser; the boot/lockdown/USB-installer half is the
big remaining chunk.

Marie is non-technical. Talk like she's 10. Short, no jargon. Plan before
building, one task at a time. End every file-touching reply with a
"Files I changed:" footer. NEVER self-certify with "X% confident" (a hook blocks
it) — say plainly what you tested vs didn't.

Project: /Users/mariemackay/Dev/QuillHaven/   GitHub: stjohnbuilds/quill-haven
Preview: Claude Preview server (launch.json name "home-screen", port 8081).

**YOUR FIRST JOB: build everything in `docs/FINISHING_BATCH.md`.** Marie wants
that whole "finishing" batch done first, in one go (download/export, writing-app
trash+undo, "+"→Chapter/Part, Files folders/drag/rename, Google Drive, home
polish, + the background-picker-into-Settings). Two items need her input first —
they're flagged at the top of that file. THEN the device half (boot/lockdown/USB).

READ FIRST, in order: CLAUDE.md → docs/GAME_PLAN.md (source of truth) →
**docs/FINISHING_BATCH.md** → docs/CODE_HEALTH.md → docs/WRITING_APP_PLAN.md →
TODO.md → this file.

---

## GOTCHAS THAT WILL BITE YOU

1. **CACHING — bump `?v=N` on EVERY CSS/JS change.** Marie's browser caches hard;
   "nothing happened" = stale cache. Locations and CURRENT versions (2026-06-22):
   - `index.html`: theme.css **?v=21**, home.css **?v=24**, home.js **?v=24**, confirm.js **?v=2**
   - `js/home.js` iframe srcs: `apps/writing/index.html?v=18`, `apps/files/index.html?v=5`
   - `apps/writing/index.html`: theme **?v=16**, writing.css **?v=18**, writing.js **?v=18**, confirm.js **?v=2**
   - `apps/files/index.html`: theme **?v=2**, files.css **?v=4**, files.js **?v=5**, confirm.js **?v=2**
   When you change a shared file (theme.css or confirm.js), bump it in ALL pages
   that link it, and bump the iframe `src` in home.js so the app window reloads.
2. **Preview throttles background timers** → the boot splash can "hang" in
   preview. Load with `#frozen` to see the final composed boot frame.
3. **Verify in the browser** with the preview tools. Set localStorage, screenshot,
   then CLEAR your test keys and reload so Marie gets a clean state. Keys used:
   `qh-theme, qh-night, qh-bright, qh-mode, qh-apps, qh-addons, qh-order, qh-clip,
   qh-bg, qh-bg-fit, qh-bg-dim, qh-files, qh-writing2` (+ old `qh-writing`).
4. **St John quill**: the master icon lives at
   `/Users/mariemackay/Dev/StJohn-Author-Studio-4.0/build/icon.iconset/` — it's the
   boot quill (`home-screen/img/quill.png`, masked + theme-tinted).

## CODE STRUCTURE

- `home-screen/index.html` — structure only (boot splash, top bar, clock, dock, settings)
- `home-screen/shared/theme.css` — ALL colours (4 skins), one source of truth
- `home-screen/shared/confirm.js` — `qhConfirm({title,message,confirmText,danger,onConfirm})`,
  the ONE styled popup used by home + every app (don't make another one)
- `home-screen/css/home.css` — home styles
- `home-screen/js/home.js` — home logic; **apps are data-driven** (`BUILTIN_APPS` +
  `DEFAULT_ADDONS` render dock/top/windows/settings). Background logic lives here too
  (`applyBg`, `syncBgRow`, `setBgFit/Dim`, `#customBg`).
- `home-screen/apps/writing/` — Local Writing app (index.html, writing.css, writing.js)
- `home-screen/apps/files/` — Files app (index.html, files.css, files.js)
- `home-screen/fonts/` — bundled EB Garamond + Great Vibes (offline)
- Keep it clean: no duplicate functions, no orphan CSS. Run the CODE_HEALTH checklist.

## WHAT'S DONE

- **Home screen**: gradient + orbs, top bar (even Wi-Fi/battery/cog cells), live
  clock/greeting, dock + top-bar mode, app windows (right-click → Restart/Close).
- **Settings**: Wi-Fi, Brightness, Theme (4 skins) + hue slider, Night Light,
  Google Account, App Bar, **Storage** bar, **Background** (Fill/Fit + Dim), Apps
  list (drag-to-reorder grip + on/off + remove), Add App, Clipboard. All persists.
- **Add App**: name + website + Colour dropdown (20 swatches) + Icon dropdown
  (quill/book/heart/star/pencil/clover/notebook, or the app's live first letter).
- **Local Writing v2** (`apps/writing/`, store `qh-writing2`): Notes + Projects
  tabs; quill side panel that collapses to a faded quill; Projects → Chapters →
  Scenes (header + sub-header + body); chapters auto-number; **drag** to reorder;
  **pencil edit icon** to rename; centred pill toolbar (bold/italic/underline/
  strikethrough/highlight pastel); native Ctrl+Z undo; autosave; old chapters
  migrated to Notes.
- **Files app** (`apps/files/`, store `qh-files`): Documents, Pictures, Downloads,
  USB, Trash. Pictures upload (downscaled) → **set as background**; Trash with
  Restore / Delete-forever (warns). Downloads + USB are honest "shows up on your
  device" placeholders (real once the OS helper exists).
- **Background**: a picture from Files becomes the home wallpaper (`qh-bg`). Shows
  at FULL strength by default (dim off); the top bar + dock go solid over a photo
  so icons stay visible. Fill/Fit + optional Dim in Settings.
- **Shared confirm popup**; default add-ons re-sync their colour/icon.
- Bug sweep done: destructive popups focus Cancel (no accidental Enter-delete);
  data-URL backgrounds quoted; picture-save warns when storage is full.

## DONE — finishing batch (2026-06-22) ✅

All seven items from `docs/FINISHING_BATCH.md` shipped + verified in preview:
1. Background picker → Settings (already done).
2. **Download → "This device" / "Google Drive"** with a real RTF manuscript
   exporter (Times New Roman 12pt, double-spaced, title page, chapters on
   new pages, first-line paragraph indents that go flush after every
   heading, strips highlights, escapes Unicode). Saves a copy into Files →
   Documents alongside the browser download.
3. **Trash + undo** for the writing app — soft-delete with 6-second undo
   toast, third "Trash" tab that appears once anything's in it; restore vs
   Delete-forever; orphan items restore as a Note rather than vanishing.
4. **+ Chapter / Part** — Project's `+` opens a tiny menu. Parts add an
   optional `Project → Part → Chapter → Scene` level; chapter numbering
   stays sequential; parts get their own heading page in the RTF.
5. **Files folders + drag + rename** — sub-folders in Documents/Pictures,
   drag files between them, rename anything. Folder deletes go through
   Trash with restore.
6. **Google Drive UI** — honest "Connect Drive" row in Settings + matching
   "Connect first" message from Download → Drive. **Actual OAuth still
   needs a Google Cloud project setup (Marie's call).**
7. **Home polish** — live Wi-Fi (`navigator.onLine`), live battery
   (`navigator.getBattery`), boot loader driven by real load events,
   Region/timezone picker, Add App refuses distraction domains.

Also new: **Windows kiosk package** at `chromebook-os/Windows/SETUP.md` +
`setup-windows.ps1` at the repo root. Three device paths now covered
(Windows / Not Formattable / Formattable).

## DO NEXT — the device half (the BIG remaining chunk)

- **One-step USB image** for the Formattable Chromebook path — current
  Reformat OS guide is "install Linux Mint, then run our script", which
  works but is multi-step. Bake everything into a custom ISO so it's just
  "boot from USB → wait → done".
- **Real Drive sync** — wire up the OAuth flow once Marie sets up a
  Google Cloud project + client ID. Until then the UI is honest about
  needing setup.
- **True site allowlist on Windows** — Edge URL allowlist via registry
  policy (the kiosk only enforces fullscreen, not URL whitelisting).
- **True site allowlist on Linux** — Chromium managed policy in
  `/etc/chromium/policies/managed/` — that's the proper wall. Currently
  `setup.sh` only does the kiosk launcher.
- **Family Link path for ChromeOS** — for the Not Formattable Chromebook,
  the real lockdown story is a managed child account; doc'd but not
  scripted.
- **Someday:** AI spell checker in the writing app.

Rough status: **~75% overall.** The app side (what Marie uses daily) is
~95% done. The device-install half is ~30% done — written guides for all
three device paths exist, plus shell + PowerShell installers; the
one-step USB image and the real lockdown policies are what's left.

## MARIE'S STYLE / WATCH-OUTS

- Frustrated by: (a) changes not appearing → CACHE, (b) being asked for something
  she already gave, (c) misreading and rebuilding wrong. Confirm understanding.
- "Still grey/yellow" = HUE not lightness. Screenshot and check before claiming fixed.
- She values: no duplicate code (she asked for a dup scan — keep it clean), real
  data-safety (her work must never silently vanish), calm pastel design.
- Reference Typing & Tomes (`/Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/`,
  READ-ONLY) for editor/sidebar feel; build fresh in vanilla JS.
