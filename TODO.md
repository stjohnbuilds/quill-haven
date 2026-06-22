# TODO — Quill Haven

## ⭐ NEXT (Marie's instruction): do `docs/FINISHING_BATCH.md` first, in one go
The "finishing" batch — download/export, writing-app trash+undo, "+"→Chapter/Part,
Files folders/drag/rename, Google Drive backup, home-screen polish, and the
background-picker-into-Settings. Full specs + the two items that need Marie's input
are in **docs/FINISHING_BATCH.md**. The device half (boot/lockdown/USB) comes after.

## Home-screen polish (from Marie's boot walkthrough 2026-06-21)
- [x] Top-bar status icons evenly spaced — all three (Wi-Fi / battery / cog) are
      now identical 28×24 centred cells, so center-to-center spacing is uniform
      (38px each side) no matter the glyph width.
- [ ] Wi-Fi + battery should feel "live" — react on hover (tooltip or colour
      change; battery shows its level). Right now they're static decoration.
- [ ] Boot loading bar should track the REAL boot/load time, not a fixed 3.6s
      animation — fill as the screen actually finishes loading.
- [ ] Region setting (timezone) so the clock is correct — pick once in Settings
      (or set during install); the clock follows it. A locked device can't guess
      location reliably.
- [ ] Add App should BAN the obvious distraction sites (social media, Gmail,
      YouTube, etc.) so Marie can't sneak one in via "add your own app".

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
      Notes. Plan in docs/WRITING_APP_PLAN.md

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
- [ ] **Trash + delete-undo** instead of the browser "Are you sure?" popup: delete
      moves to a Trash (holds projects AND notes), with an undo notification;
      restore one item or a group; restoring an orphan (e.g. a lone chapter) drops
      it into Notes. Model from T&T: soft-delete flags (isDeleted + deletedAt),
      separate Trash view, explicit restore, two-step permanent delete. T&T has NO
      auto-undo on delete — so the undo TOAST is our addition. Reuse the existing
      styled confirm from settings — do NOT add a new dialog.
- [ ] **Save to Google Drive** — once Drive is connected: a "Save to Drive" action
      for notes + the whole writing app (pops up Drive, pick where to save) so work
      is backed up off-device.
- [ ] **Download button → "This device" or "Google Drive"** (the flow Marie wants):
      a Download button at the top of the writing panel. "This device" exports the
      whole book as a properly formatted manuscript (RTF — no library needed, opens
      in Word) → real download AND a copy lands in the Files app → Documents.
      "Google Drive" = the Save-to-Drive path above. STUDY how Typing & Tomes
      exports a manuscript first. Manuscript paragraph rules: first line of a
      paragraph indents, the rest don't; first paragraph after a heading is flush.
- [ ] Move the collapse arrow to a faint arrow halfway down the panel edge (frees
      the top spot for the download button).
- [ ] The "+" on a project should be a small dropdown: add **Chapter** or **Part**.
      NEEDS A QUICK STEER from Marie on the structure (is "Part" a level above
      Chapters, or just another name for a Scene?).

### Data safety (Marie's worry: "it can't vanish on me")
- Saving is solid day-to-day: the writing app autosaves to the device on every
  change and again when it closes; settings save too. Verified, no code path wipes
  data, migration only seeds when empty.
- BUT it is **device-only** — a browser-data wipe or a dead device loses it,
  because there is no backup yet. The Save-to-Drive + download-manuscript items
  above ARE the safety net; worth doing at least the download/backup one soon.
- [ ] Small hardening: if a save ever fails (storage full), tell the user instead
      of failing silently.
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

### Files app v2 — basics to add (Marie 2026-06-21)
- [ ] **Make folders** + move/drag files between Documents/Pictures/Downloads.
- [ ] Rename a file; basic file actions.
- [ ] On the device: "Add a picture" opens the OS picker (can reach a USB);
      drag a file onto USB/folders. (Needs the OS helper — device phase.)

## For the Chromebook (the OS half — this IS the project)
> Quill Haven is the whole OS. The Chromebook is just the hardware. When the
> device powers on it boots straight into this home screen — no ChromeOS, no
> stray browser. "Only the writing apps" isn't a restriction we add, it's the
> entire point: a device that can only write.
> Install method: USB **once** to put the OS on the device (can't replace an OS
> from inside ChromeOS without external media). After that, updates come from
> GitHub — the "Update available" button already pulls the latest screen.
- [ ] Boot sequence — power on goes straight into Quill Haven (kiosk/fullscreen)
- [ ] Lockdown — only the writing apps run; no internet beyond the allowed sites
- [ ] USB installer package (first-time install)
- [ ] README on GitHub: "what this is" + how to install/update

## Future
- [ ] AI spell checker in the writing app (3-level slider + off)

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
