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
   - `index.html`: theme.css **?v=21**, home.css **?v=24**, home.js **?v=28**, confirm.js **?v=2**
   - `js/home.js` iframe srcs: `apps/writing/index.html?v=23`, `apps/files/index.html?v=7`
   - `apps/writing/index.html`: theme **?v=16**, writing.css **?v=19**, writing.js **?v=23**, confirm.js **?v=2**
   - `apps/files/index.html`: theme **?v=2**, files.css **?v=5**, files.js **?v=7**, confirm.js **?v=2**
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

## DONE — full session (2026-06-22) ✅

**Finishing batch (the original 7):**
1. Background picker → Settings (was already done).
2. Download → "This book" / Google Drive + RTF manuscript exporter (TNR
   12pt, double-spaced, title page, per-chapter pages, first-line
   paragraph indents that go flush after every heading, Unicode-safe).
3. Trash + undo for the writing app (soft-delete, 6s toast, third Trash
   tab, orphan → Note on restore).
4. "+" → Chapter / Part menu; optional `Project → Part → Chapter → Scene`;
   parts get their own heading page in the RTF.
5. Files folders + drag + rename (sub-folders inside Documents/Pictures,
   folder trash + restore).
6. Google Drive end-to-end framework — `window.QHDrive` handles Client
   ID storage, Google Identity Services sign-in, multipart Drive upload.
   `docs/DRIVE_SETUP.md` walks Marie through the 10-min Cloud Console
   setup. Once she pastes a Client ID, Download → Drive uploads the .zip.
7. Home polish — live Wi-Fi/battery, real-progress boot loader, region/
   timezone picker, Add App distraction-site ban.

**Backup / restore (new):**
- Download → "Full backup (.zip)" — every project + every note as a Word
  file, plus a restorable `quill-haven-backup.json`, plus a README, all
  in one .zip. Pure-JS store-only zip generator (no library).
- Settings → "Restore backup" — pick a `.json` or `.zip`, danger-confirm
  with the date + counts, replace everything, reload.
- Save-failure hardening — quota-exceeded writes surface a one-shot
  danger popup naming what to delete to free room.

**Files app USB (new):**
- Real USB drag-drop on installed Chromium/Edge via the File System
  Access API. Pick the USB folder once, handle saved in IndexedDB so it
  sticks across sessions. Drag-in to copy across, "Copy in" to pull onto
  the device.

**Device install side — three paths, real walls on each:**
- **One install path only:** `devices/SETUP.md` covers wiping any
  Intel/AMD laptop (Windows / Intel Mac / Intel-AMD Chromebook —
  Chromebook needs a firmware unlock first) and installing Linux Mint +
  the Quill Haven kiosk. The repo-root `setup.sh` is the one-line
  installer the Linux Mint terminal runs. Browser-install / PWA paths
  were removed — Quill Haven IS the OS, not a thing inside another OS.
- ARM Chromebooks + Apple Silicon Macs can't run this path because
  their firmware refuses to install another OS. They're out of scope.
- Old reference (since deleted): `devices/SETUP.md` (Intel/AMD Chromebooks)
  SETUP.md` (firmware unlock, Linux Mint install) + `setup.sh` at the
  repo root (Chromium kiosk launcher + bakes the URL allowlist into
  `/etc/chromium/policies/managed/` automatically).

**Repo housekeeping (new):**
- Top-level `README.md` (GitHub Pages landing).
- `LICENSE` (MIT).
- `docs/AI_ASSESSMENT_PROMPT.md` and `docs/CODE_HEALTH.md` refreshed for
  outside review.

## DO NEXT — fixes from the 2026-06-22 outside audit

These are the audit findings that **still apply** after the
browser-install demolition (Windows/Mac PWA + Family Link were already
deleted, so any audit point about `setup-windows.ps1` / FAMILY_LINK.md
is N/A). Work them in this order — top items are highest impact.

### Marie's restructure ask (do alongside the fixes)
- Rename `devices/` → `instructions/`.
- Inside, write **three product-named guides** (instead of the one
  universal SETUP.md): `Mac Instructions.md`, `Windows Instructions.md`,
  `Chromebook Instructions.md`. Each tailored to that product only — no
  cross-references, drop sections that don't apply (e.g. no firmware-
  unlock step in the Mac/Windows guides). Keep
  `instructions/BEFORE-YOU-BUY.md` (it's Chromebook-specific) and
  `instructions/README.md` (table of all three). Update every doc that
  links to the old `devices/` paths (`README.md`, `HANDOVER`,
  `AI_ASSESSMENT_PROMPT`, `CODE_HEALTH`, `TODO`).

### CRITICAL bugs from the audit

1. **Service worker serves stale shell.** `home-screen/service-worker.js`
   uses a constant cache name (`quill-haven-v1`) that never changes +
   cache-first for `./index.html`. Once a device has the SW installed,
   it serves the OLD index.html forever — auditor proved it (cached
   shell referenced `home.js?v=23` while disk was `v=28`, hiding the
   Region + Restore-backup rows from the live UI). Defeats the whole
   GitHub-update story. **Fix:**
   - Make cache name versioned (e.g. `quill-haven-${VERSION}`); read
     `VERSION` from version.json or hardcode and bump per release.
   - Use **network-first for `index.html`** (other assets are
     cache-busted via `?v=` already and can stay cache-first).
   - Add `self.skipWaiting()` + `clients.claim()` so the new SW takes
     over immediately.
   - On `activate`, delete every cache that isn't the current one.
   - Also: `setup.sh`'s headless pre-warm step bakes the stale SW shell
     onto the device. Either drop the pre-warm OR confirm the new SW
     auto-updates correctly so the bake doesn't permanently stick.

2. **#autoBackupRow shows when Drive isn't connected.** `home.css:326`
   `.settings-row { display: flex }` overrides the HTML `hidden`
   attribute, so the toggle renders even though `hidden` is set.
   **Fix:** add a global `[hidden] { display: none !important; }` to
   `home.css` (and the same to writing.css/files.css for safety).

3. **Two data-loss windows in `home-screen/js/home.js`:**
   a. `renderApps()` (~line 465) blasts the writing iframe via
      `innerHTML = ''` WITHOUT first flushing the in-flight edits.
      Toggling/reordering/removing an app while mid-sentence drops the
      last typed text. **Fix:** writing app exposes
      `window.flushAndPersist = function() { flush(); persist(); }` on
      its iframe window. home.js, before any iframe tear-down, calls
      `iframe.contentWindow.flushAndPersist?.()`. Wrap in try/catch.
   b. `_applyRestore` writes `qh-writing2` then `qh-files` in two
      separate try/catch — second can fail silently after the first
      succeeded, leaving a half-applied restore. **Fix:** snapshot the
      OLD values of both keys first, then attempt both writes; if
      either throws, restore both snapshots.

4. **`version.json` frozen at 1.0** despite 1.9 worth of history. The
   "Update available" button never fires. **Fix:** bump to `2.0`, bump
   the matching `LOCAL_VERSION` constant in `home.js`, bump the footer
   `Quill Haven v1.0 🌸` in `index.html`. Going forward, bump on every
   release (when ready, document in HANDOVER's "version bump"
   discipline).

5. **Typing & Tomes is named in `CLAUDE.md` + `README.md` as a
   shipping app but is NOT in `DEFAULT_ADDONS` in `home.js`.** So the
   icon never appears — user has to Add App it manually. **Fix:** add
   to `DEFAULT_ADDONS` alongside Dabble Writer. Sensible pastel
   colour (sage/mint to avoid clashing with Local Writing's green).
   URL: `https://typingandtomes.vercel.app`.

### MEDIUM bugs

6. **`theme.css` linked at three different cache versions** — `?v=21`
   in `home-screen/index.html`, `?v=16` in `apps/writing/index.html`,
   `?v=2` in `apps/files/index.html`. A shared file should be bumped
   in all three at once. **Fix:** sync all three to the current actual
   highest (probably `?v=22`), and write a one-line rule in
   `CODE_HEALTH.md` saying "shared files = bump everywhere".

7. **`qhConfirm` always shows a Cancel button** — info-only popups
   ("Saved to Drive", etc.) have a pointless Cancel next to OK.
   **Fix:** add `noCancel: true` option to `qhConfirm` in
   `shared/confirm.js`; when set, hide the Cancel button and make OK
   full-width + focused. Update callers that are info-only (Drive
   success messages, the "needs setup" popups, the storage-full
   warnings).

8. **Files → Documents never auto-populated.** The writing app used
   to copy downloads here but doesn't anymore (Marie asked for that to
   be removed). `CODE_HEALTH.md:96` still claims the auto-copy
   happens. **Fix:** delete that checklist item in CODE_HEALTH (the
   feature isn't coming back; the doc is wrong).

### LOW / polish

9. **Low contrast** — top-bar `#topWifi`, `#topBattery`, settings cog
   are very pale on the light background. Files app sidebar labels
   ("Pictures", folder names) washed-out grey. Bump opacity / colour
   via the theme variables (don't hardcode).

10. **GAME_PLAN.md is significantly stale.** Lists `boot/`, `config/`,
    `installer/` directories that don't exist; marks the OS-install
    half "to build" even though setup.sh ships; omits `instructions/`
    (or `devices/`), the service worker, manifest, confirm.js, the
    Mac/Windows paths, the backup/restore/Drive feature set. **Fix:**
    rewrite. Tree section should reflect the actual repo (run
    `find . -maxdepth 3 -type d -not -path '*/.*'` for the truth).
    Feature breakdown should reflect what shipped.

### Future / not blocking

- **One-step custom USB ISO** — bake everything into one ISO so the
  install + kiosk step is one boot instead of two. Needs ISO remaster
  tooling (Cubic on Linux or Docker-based remaster). Skip until there's
  a real device to test on.
- **AI spell checker** — 3-level slider + off. Would lean on a paid
  API so partly blocked on hosting.
- **Restore from Drive in one click** (today: download the latest
  auto-backup .json from Drive, then Settings → Restore backup).
- **Address remaining audit items** marked ⚠ minor that we triaged out
  (full list in the 2026-06-22 audit report — search the chat for
  "QUILL HAVEN ASSESSMENT").

Rough status when this list was written: **~92% overall.** App side
~99%. Device-install side ~80% (one-USB install + URL allowlist
shipped; one-step custom ISO is the only outstanding piece).

## MARIE'S STYLE / WATCH-OUTS

- Frustrated by: (a) changes not appearing → CACHE, (b) being asked for something
  she already gave, (c) misreading and rebuilding wrong. Confirm understanding.
- "Still grey/yellow" = HUE not lightness. Screenshot and check before claiming fixed.
- She values: no duplicate code (she asked for a dup scan — keep it clean), real
  data-safety (her work must never silently vanish), calm pastel design.
- Reference Typing & Tomes (`/Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/`,
  READ-ONLY) for editor/sidebar feel; build fresh in vanilla JS.
