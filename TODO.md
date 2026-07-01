# TODO — Quill Haven

> 📌 **2026-07-01:** Full audit done — the live fix list is now **`FIX_CHECKLIST.md`**
> (11 items). Shipped 2.3.22 🦢 (Wi-Fi panel + no-wifi boot screen = fix #1) and
> 2.3.23 🐇 (fix #2 back-door lock: Origin gate + trusted-tap + Terminal confirm;
> Wi-Fi fixes from Marie's live test: connected network named, Disconnect button,
> saved passwords, working on/off switch; home-screen logo baked into SVG so it
> can never mis-render). Marie tapped Update for 🦢; 🐇 awaits her tap. Offline-boot
> splash still unconfirmed on hardware. Next: fix #3 (close the all-of-Google hole).

> ⚠️ **CURRENT WORK (2026-06-25) is in the 2.x rebuild, not this old list.**
> The app was rebuilt as ONE shell in repo `quill-haven-2`; **2.1.0 🌳 is live on the
> laptop and confirmed working.** The live to-do list is now
> **`quill-haven-2/PUNCHLIST.md`**, and the plan/state is in `HANDOVER.md`. Most items
> below relate to the OLD app and are superseded. Read HANDOVER.md first.

## 🔧 Active list (2026-06-24) — priority order

**✅ MILESTONE: the update pipeline works.** Pushes now land on the device
(emoji confirmed changing on hardware: 📜 → 🔖), Dabble opens, and a setup re-run
no longer bails early. Everything below builds on this.

### ▶ NEXT UP (Marie's order, 2026-06-24)
- [~] **1. "Updates available" gate** — BUILT + verified in preview; awaiting Marie's
      OK to ship (release 4.10 🌙). Stops auto-applying; shows "Update available";
      applies only on her tap + confirm. NOTE: one last auto-update carries the switch
      over, then manual from then on.
      • helper.py: removed the 6-hourly auto-apply; added POST /apply-update (applies
        device-manifest + extras + helper-self, then restarts), with a one-at-a-time guard.
      • service-worker.js: now CACHE-FIRST / PINNED + byte-stable — home screen can't
        silently refresh on reboot; only doUpdate's cache-clear pulls a new version.
      • overlay + home.js: emoji no longer changes on check (only flags); tap → confirm
        → apply; offline-guarded; 15s fallback reload.
      • release-helper.sh FIXED (was wiping extras); release.sh refuses to ship a stale
        helper hash (no half-deploy). Ship = tools/release-helper.sh 1.8 → tools/release.sh.
      • Adversarially reviewed (5-way); real findings fixed (offline blank-screen, SW
        unregister window, double-tap/concurrent-apply, ship footgun, stale docs).
- [ ] **2. Battery "time left"** (≈ Xh) in the pill — the helper reads it from the
      laptop (upower / /sys/class/power_supply) and the pill shows it.

### 🔎 Full-sweep fix list (2026-06-25) — read every file + clicked the live app
~60 raw findings boiled down (9 false alarms cut). Grouped so nothing's forgotten.

**A. Writing safety — do first, protects the novel**
- [ ] Save never fails silently — keep "NOT saved" showing until a save really succeeds
      (writing.js persist(): don't hide after one warning / reset _saveFailedWarned).
- [ ] Storage bar shows live usage, not only when Settings opens (home.js updateStorage()).
- [ ] Block typing when no scene is loaded so text can't vanish into nothing (writing.js loadEditor()).
- (see "Writing backup" below — a real off-device copy is the biggest safety win, its own task.)

**B. Duplication cleanup — kills the "two settings" + the core mess (overlay copies home)**
- [ ] One settings: delete the overlay's quick-settings; the gear always opens the home
      screen's full settings (overlay buildSettings/openSettings).
- [ ] One app list: overlay reads the home list, not its own BUILTIN copy (overlay BUILTIN vs home.js BUILTIN_APPS).
- [ ] One of everything else the overlay copies — theme colours, the "are you sure?" box,
      version/emoji — borrow from home, don't duplicate (~26 spots, all one root).

**C. Security back-doors (already listed below, restated)**
- [ ] Lock the helper endpoints to the real screen only (Origin/token check in helper.py).
- [ ] Stop the root file-writer writing outside an allowlist (qh-admin.sh dest check).

**D. Small bugs + dead leftovers**
- [ ] Fill or remove the always-empty greeting line (home.js / index.html).
- [ ] Cap the settings panel width so it doesn't run off small screens (home.css .settings-panel).
- [ ] Warn the user if reordering apps didn't save (home.js saveOrder()).
- [ ] Wire up (or remove) the Files app receiving downloads from Writing (files.js).
- [ ] Make launch-home.sh use the same chromium / chromium-browser detection as the helper.
- [ ] Bin the junk: ~8 stale docs, unused /desktop endpoint, __pycache__ + .DS_Store (gitignore them).

**✅ Done this session:** update gate (approve-before-apply); fixed release-helper.sh (was wiping extras).

### Then (from the audit + earlier asks)
- [ ] Writing backup — only one copy of the novel today; a reset loses it. (biggest real risk)
- [ ] "Blocked page = stuck" trap — a blocked site should bounce home, not dead-end.
- [ ] Lock the helper back door — terminal/power endpoints need a token. (security)
- [ ] Limit the root file-writer to an allowlist of paths. (security)
- [ ] Clean shutdown — hide the "[FAILED] Failed to…" flash on power-off.
- [ ] Simple built-in Wi-Fi picker (keep the native window as a fallback).
- [ ] One app list — finish single-source (lag already fixed in 4.6); remove the
      overlay's hard-copy of BUILTIN.
- [ ] Graceful restart — don't drop the last ½-second of typing on update/go-home.
- [ ] Small: add smoke tests; setBg out-of-room warning; docs-vs-code default apps.

**Done this session (2026-06-24)**
- [x] "No buttons" safety net (FIX-2): qh-early.js self-clears the native-UI hide
      after ~4.5s unless the overlay comes up — never strands the user. (4.6)
- [x] Releases 4.5 📖 (full pill, round dots, dino root fix, load bar gone) and
      4.6 🕯️ (no-buttons net, power-off retry, live app-list). tools/release.sh now
      auto-bumps the emoji + every version and self-checks for drift.
- [x] Site lock flipped allowlist → 20-site distraction BLOCKlist (unblocks
      Dabble + normal sites); device-manifest v2 pushes it to the device.
- [x] Release 4.4 ✒️ — emoji bump as an update-pipeline test.
- [x] setup.sh: fetch ALL 8 overlay files (was missing 3 → no overlay on fresh
      install); battery tuning (TLP, disable printing/BT/avahi/modem); auto
      Surface touch driver (guarded, Secure-Boot-aware).
- [x] remove-touch.sh — one-time drop of the Surface kernel so Secure Boot can
      go back on (padlock off).
- [x] docs/QUILL_HAVEN_CODE_AUDIT_INSTRUCTIONS.md — brief for an external AI scan.
- [x] devices/SETUP.md — Surface install steps (Secure Boot off + USB boot).

## Status at a glance (2026-06-23)

Home screen v3.1 is live on the device. The next big task is rebuilding
the UI as a **Chrome extension** so the pill (top bar) and dock (app
switcher) appear on EVERY page — not just the home screen. This fixes
the "trapped in Google Docs with no way home" problem. See HANDOVER.md
for the full design and instructions.

## What's left

### Extension (next up)
- [ ] **Chrome extension overlay** — pill (top bar) + dock (app switcher)
      injected on every page. Must reuse existing home-screen icons,
      colors, settings. See HANDOVER.md for Marie's full design spec.
- [ ] **Strip the home screen** — once the extension works, remove the
      top bar, dock, and settings from the home screen (extension handles it).
- [ ] **"Check for updates" button** in settings — calls a new `/check-update`
      endpoint on the helper so Marie doesn't wait 6 hours.

### Device side
- [ ] **One-step custom USB ISO.** Today: install Linux Mint from a
      generic Mint USB, then run `setup.sh`. Goal: a single Quill Haven
      ISO that boots straight into the kiosk with no script step.
      Needs ISO remaster tooling (Cubic on Linux or Docker-based
      remaster).

### App side (nice-to-have, not blocking)
- [ ] **Google Docs recents** — show a recent-docs list instead of the
      full Google Drive interface.
- [ ] **Restore from inside the writing app** — currently lives in the
      home-screen Settings panel (which is correct), but a "load from
      backup" link inside Local Writing's empty state might reduce
      confusion if she ever wipes the device and reaches for it.

### Future
- [ ] AI spell checker in the writing app (3-level slider + off).

## Home-screen polish (from Marie's boot walkthrough 2026-06-21)
- [x] Top-bar status icons evenly spaced — all three (Wi-Fi / battery / cog) are
      now identical 28×24 centred cells, so center-to-center spacing is uniform
      (38px each side) no matter the glyph width.
- [x] Wi-Fi + battery feel "live" — Wi-Fi opacity tracks `navigator.onLine`,
      battery fill tracks `navigator.getBattery()`; titles show "Connected" /
      "Offline" + "62% (charging)".
- [x] Boot loading bar tracks REAL boot/load time — ~15% on script load,
      35% on DOMContentLoaded, 75% on `document.fonts.ready`, 100% on
      `window load`. Removed the fixed 3.6s CSS animation.
- [x] Region/timezone picker in Settings — a curated dropdown of ~20 common
      zones (default Auto). Stored in `qh-tz`; clock uses Intl.DateTimeFormat.
- [x] Add App BANS the obvious distraction sites — facebook/instagram/x/
      tiktok/youtube/netflix/reddit/gmail/etc. Refused with a friendly
      "That one's a distraction" popup; nothing is added.

## Fix soon (found in the assessment)
(all clear)

## Build next (the big features)
- [x] Add App — Colour + Icon pickers as dropdowns (a pill you tap that opens a
      list), theme-aware options, roughly double the choices. (Marie asked twice)
      Sub-tasks:
        - [x] Better icons: sharper quill, proper three-leaf clover/shamrock,
              spiral notebook; the "A" glyph removed — the no-icon choice now
              previews the app's own first letter live as you type the name
        - [x] Colour picker as a dropdown pill — "Colour" pill opens the swatch
              dropdown, theme-aware (pastels / muted browns in Wood / cool slates
              in Slate); choices grown to 20 per theme
        - [x] Icon picker as a dropdown pill (all the icons)
        - [x] Save + show the chosen colour/icon on the new app
- [~] Add App — common-apps quick list: built it, but Marie decided against it,
      so it was fully removed (no leftover code)
- [x] Local Writing v2 — rebuilt: Notes + Projects tabs; quill sidebar that
      collapses to a faded quill; Projects → Chapters → Scenes (each scene has a
      header + sub-header + body); chapters auto-number ("Chapter N"); drag to
      reorder; centred pill toolbar (bold/italic/underline/strikethrough/highlight
      with T&T pastels); large writing space; autosaves; old chapters migrated to
      Notes.

### Local Writing v2 — review fixes (Marie 2026-06-21)
- [x] Highlighter icon — now the simple pen/line icon (from the add-app set),
      moved before the toolbar divider
- [x] Typing undo already works — native Ctrl/Cmd+Z (confirmed). T&T relies on the
      same browser-native undo (no custom history stack), and our autosave never
      resets the editor DOM, so undo "does the right amount" for free.
- [x] Placeholders cleaned: "Scene title" / "Subtitle" (dropped the brackets)
- [x] Removed the vertical indent lines in the tree
- [x] Rename now via a pencil EDIT icon on each row (double-click was broken —
      the single click re-rendered the row before the double-click registered)
- [x] **Trash + delete-undo** — soft-delete to `qh-writing2.trash` (notes,
      projects, parts, chapters, scenes); 6-second undo toast; third Trash
      tab appears once anything's in it; orphan restores fall back to Notes;
      two-step "Delete forever" via the shared qhConfirm. (Shipped 2026-06-22.)
- [x] **Save to Google Drive** — full framework in `window.QHDrive`: paste a
      Cloud Console OAuth Client ID once, sign in with Google, then Download
      → "Google Drive" uploads the full backup .zip. Steps: docs/DRIVE_SETUP.md.
      (Shipped 2026-06-22.)
- [x] **Download button → "This device" or "Google Drive"** — top-right of
      the writing panel; three options: "This book" (single .rtf), "Full
      backup" (.zip of every project + note as .rtf + raw .json), "Google
      Drive" (same .zip uploaded). Manuscript RTF: Times New Roman 12pt,
      double-spaced, 1" margins, title page, chapter-per-page, first-line
      paragraph indent (flush after every heading), strips highlights,
      Unicode-safe. (Shipped 2026-06-22.)
- [x] Collapse arrow moved to a faint floating arrow on the panel's right
      edge, halfway down. (Shipped 2026-06-22.)
- [x] "+" on a project opens a tiny menu with **Chapter** or **Part**. Parts
      are an optional level above Chapters (Project → Part → Chapter →
      Scene); chapter numbering stays sequential across top-level + parts;
      Parts get their own heading page in the RTF. (Shipped 2026-06-22.)

### Data safety (Marie's worry: "it can't vanish on me")
- Saving is solid day-to-day: the writing app autosaves to the device on every
  change and again when it closes; settings save too. Verified, no code path wipes
  data, migration only seeds when empty.
- BUT it is **device-only** — a browser-data wipe or a dead device loses it,
  because there is no backup yet. The Save-to-Drive + download-manuscript items
  above ARE the safety net; worth doing at least the download/backup one soon.
- [x] Save-failure hardening — writing.js + files.js persist() catch quota
      errors and surface a one-shot danger popup naming what to delete to
      free room. Writing app's "Saved" indicator stays at "NOT saved" until
      a write succeeds again. (Shipped 2026-06-22.)
- [x] **Restore from backup** — Settings → Restore backup → pick a
      `quill-haven-backup-*.json` (or the whole `.zip`, we walk it). Confirms
      with the date + counts before replacing `qh-writing2` + `qh-files`,
      then reloads. (Shipped 2026-06-22.)
- [x] **Full backup .zip** — Download → "Full backup" packs every project
      and note as a Word file in `Projects/` and `Notes/` plus a restorable
      `quill-haven-backup.json` plus a README, all in one .zip. Pure-JS
      store-only zip generator (no library). (Shipped 2026-06-22.)
- [x] Drag to reorder apps — grip handle on each row in Settings, order saved and
      applied to dock + top bar (qh-order in localStorage)
- [x] Storage space indicator in settings — bar + "X used of Y" via the browser
      storage estimate
- [x] **Files app** (new dock app, apps/files/) — Documents, Pictures, Trash all
      work in the browser today; Downloads + USB are honest "shows up on your
      device" placeholders (real once the OS helper exists). Pictures: upload an
      image → "Set as background" (downscaled, saved as qh-bg; the home screen
      applies it live and hides the orbs). Trash holds deleted files with
      restore / delete-forever. Documents is ready to receive downloaded
      manuscripts (the Download flow below fills it).
- [x] Background legibility — over a photo the top bar + dock go solid
      (--bar-bg-strong / --dock-bg-strong) so icons stay visible.
- [x] Background adjust — a "Background" row in Settings (shows when a picture is
      set): Fill/Fit + a Dim slider (fades the photo toward the theme so text
      stays readable) + Remove background. Reused the existing toggle + slider
      components (no duplicates).
- [x] **Finishing batch #1 — background PICKER moved into Settings** (2026-06-21).
      The "Background" row is now always visible with a thumbnail strip: a Default
      tile + one tile per picture from the Files app; tap to set (live), active
      tile gets the accent ring. Fill/Fit + Dim only appear once a picture is set;
      the Default tile clears it (old "Remove background" button gone). Files →
      Pictures lost its "Set as background" buttons + Default card; now just
      Add + Delete, a "Background ·" tag on the current one, and a header hint
      "Set your background in Settings." `setBg`/`renderBgGallery` in home.js;
      qh-files added to the storage listener so new pics show up live.

### Review round 2 (Marie 2026-06-21)
- [x] **One shared confirm dialog** — `shared/confirm.js` (`qhConfirm`), styled +
      theme-aware, used by the home screen, the writing app, AND the Files app.
      Removed the home screen's old inline confirm + its CSS (no duplicates).
- [x] Files "Delete forever" + "Empty trash" now show a red warning popup.
- [x] Writing-app deletes use the shared popup too (no more ugly browser alert).
- [x] App icon colours nudged a little more pastel / less grey; Files is now a
      proper periwinkle blue (was greyish). Default add-ons (Dabble) re-sync to
      their latest colour even if already saved.
- [x] Dock order confirmed: Docs → Local Writing → Files → Dabble.

### Bug sweep of recent changes (2026-06-21) — found + fixed
- [x] Accidental-delete risk: the warning popup focused the red "Delete" button,
      so a stray Enter could delete. Now destructive popups focus Cancel, and
      Enter only activates the focused button (Escape still cancels).
- [x] Background images now quoted in CSS url("…") (avoids breakage on odd data).
- [x] Adding a picture when the device is full failed silently — now it reverts
      and says "Not enough room" instead of pretending it saved.
- Checked & OK: drag only reorders within the same group (scenes can't jump to
  another chapter); trash restore/forever correct; deleting the open item picks a
  sensible next one; scripts load in the right order; no duplicate functions; no
  leftover debug code; default add-ons re-sync their colour.
- Known (not bugs): setting a background from Files shows once you close Files
  (can't preview live behind it); dark theme + photo handled by the Dim slider.

- [x] Background no longer auto-dims — a set picture now shows at full strength
      by default (Marie: "let me design it and leave it as is"). The Dim slider
      stays, defaulting to 0, in case she ever wants to fade it for legibility.

### Files app v2 — basics (Marie 2026-06-21)
- [x] **Make folders** + drag files between folders inside Documents/
      Pictures. "+ New folder" tile creates a folder with inline rename;
      folder cards click-through to navigate; back tile returns to root.
      (Shipped 2026-06-22.)
- [x] Rename a file or folder (Rename button on every card). (Shipped 2026-06-22.)
- [x] **USB section is real** — uses the File System Access API on
      Chromium/Edge. Click USB → pick the drive once → it sticks (handle
      saved in IndexedDB). Drag files in to copy across; "Copy in" pulls
      files from USB into Documents/Pictures. Falls back to a friendly
      "not supported" message on Firefox/Safari. (Shipped 2026-06-22.)

## For the device (the OS install side)
> Quill Haven IS the OS. One install path: `devices/SETUP.md` walks
> through wiping any Intel/AMD laptop (Windows / Intel Mac /
> Intel-AMD Chromebook), installing Linux Mint, and running
> `setup.sh` to drop into the Quill Haven kiosk. Browser/PWA install
> paths were deleted — they didn't match the vision.
- [x] Boot sequence — Chromium kiosk launcher via `setup.sh`.
      (Shipped 2026-06-22.)
- [x] Lockdown — true URL allowlist baked into setup.sh as a Chromium
      managed policy in `/etc/chromium/policies/managed/`. (Shipped
      2026-06-22.)
- [x] One install guide that covers Windows / Intel Mac / Intel
      Chromebook in one document. (Shipped 2026-06-22.)
- [x] Top-level README on GitHub. (Shipped 2026-06-22.)
- [ ] One-step custom USB ISO — current path is "Linux Mint install
      then setup.sh". Bake everything into one ISO.

## Future
- [ ] AI spell checker in the writing app (3-level slider + off).

## Done
- [x] Boot quill redrawn to match the St John feather — full barbed plume, curved
      spine, fine nib + ink dot (matches the screenshot)
- [x] Dock tooltip no longer floats over an open app — hover name-labels are hidden
      while an app is open (the app name already shows in the top bar)
- [x] Boot font (Great Vibes) bundled locally in home-screen/fonts/ — boot screen
      works with no Wi-Fi; removed the Google Fonts link from the home page
- [x] Writing-app font (EB Garamond) bundled locally too — 4 variants (regular,
      500, 600, italic) in Latin + Latin-ext; removed its Google Fonts link so the
      whole OS now needs no Wi-Fi for fonts
- [x] Home screen — background, orbs, top bar, clock, greeting, date
- [x] Dock with apps + hover tooltips
- [x] Top bar / Dock toggle
- [x] Settings panel (open / close / X / click-outside / Escape)
- [x] Clipboard history (within a session)
- [x] App views with traffic-light close buttons
- [x] Themes reworked into real skins — Purple (default), Wood, Slate, Dark (each re-colours the whole UI)
- [x] Removed the girly pastel themes
- [x] Night Light fixed — its own on/off toggle, warms the screen, reverts cleanly
- [x] Theme + Night Light saved between restarts
- [x] Boot animation — bigger quill, typewriter tagline, loading bar
- [x] All settings now save between restarts — brightness, dock/top, app on/off, clipboard
- [x] Update button fixed — downloads the latest version from GitHub and loads it
      (making it stick after a reboot is part of the Chromebook setup later)
- [x] Code health: split the one 958-line file into index.html (227 lines) +
      css/home.css + shared/theme.css + js/home.js — themes are now one shared file
- [x] Local Writing app — its own files (apps/writing/), EB Garamond editor,
      toolbar (bold/italic/underline/heading/bullets), chapters sidebar, autosave
      to device, word count, matches the theme. 2nd default app (green)
- [x] Apps are now data-driven (defined once) — dock, top bar, windows, and
      settings all render from one list; each icon defined once
- [x] Add App button — add your own app (name, website, colour); shows a letter icon
- [x] Remove apps — add-ons (incl. Dabble) can be removed; built-ins (Docs, Local
      Writing) stay. Dabble is now a default add-on, not hardcoded
