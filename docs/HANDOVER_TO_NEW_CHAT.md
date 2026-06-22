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
   "nothing happened" = stale cache. Locations and CURRENT versions:
   - `index.html`: theme.css **?v=21**, home.css / home.js at **?v=22**, confirm.js **?v=2**
   - `js/home.js` app srcs: `apps/writing/index.html?v=17`, `apps/files/index.html?v=4`
   - `apps/writing/index.html`: theme/writing.css/writing.js at **?v=16**, confirm.js **?v=2**
   - `apps/files/index.html`: theme **?v=2**, files.css **?v=3**, files.js **?v=4**, confirm.js **?v=2**
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

## DONE — "Move the background PICKER into Settings" ✅ (finishing batch #1, 2026-06-21)

Built + verified in preview. The "Background" row in Settings is now always
visible with a thumbnail strip (Default tile + one tile per Files picture, tap to
set, active tile = accent ring). Fill/Fit + Dim show only once a picture is set;
the Default tile clears it (old "Remove background" button removed). Files →
Pictures lost its "Set as background" buttons + Default card (now Add + Delete
only, a "Background ·" tag on the current one, header hint "Set your background in
Settings."). `setBg` + `renderBgGallery` added in home.js; `qh-files` added to the
storage listener so newly-added pictures appear live. Caches bumped:
home.css ?v=22, home.js ?v=22, files iframe src ?v=4, files.css ?v=3, files.js ?v=4.

## DO NEXT — finishing batch #2: Download → "This device" / "Google Drive"

- **Download button → "This device" / "Google Drive"** + manuscript export (RTF,
  no library; first-line indent rules). Lands a copy in Files → Documents. (Study
  Typing & Tomes export, READ-ONLY.) ← highest value next.
- **Trash + undo for the writing app** (soft-delete projects/notes, restore).
- **Save to Google Drive** (the real off-device backup).
- **Files v2 basics**: make folders, drag files between folders, rename files.
- **"+" → Chapter or Part** (needs Marie's steer: is a Part above Chapters, or
  just another word for a Scene? T&T groups chapters under "Volumes" = Parts).
- **Home polish**: live Wi-Fi/battery, real-progress loading bar, Region/timezone
  setting, ban distraction sites in Add App.
- **THE DEVICE HALF (the big one)**: boot straight into Quill Haven (kiosk),
  lockdown, USB installer, README. This is what makes it a real device (~5% done).
- Someday: AI spell checker in the writing app.

Rough status: **~60% overall** — the screen + apps (what Marie uses daily) is ~80%
done; the device-install half is barely started.

## MARIE'S STYLE / WATCH-OUTS

- Frustrated by: (a) changes not appearing → CACHE, (b) being asked for something
  she already gave, (c) misreading and rebuilding wrong. Confirm understanding.
- "Still grey/yellow" = HUE not lightness. Screenshot and check before claiming fixed.
- She values: no duplicate code (she asked for a dup scan — keep it clean), real
  data-safety (her work must never silently vanish), calm pastel design.
- Reference Typing & Tomes (`/Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/`,
  READ-ONLY) for editor/sidebar feel; build fresh in vanilla JS.
