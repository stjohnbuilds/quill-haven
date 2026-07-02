> ⚠️ **SUPERSEDED / HISTORY (pre-rebuild, 1.x).** This describes the RETIRED old app
> and is no longer "the single source of truth". The live app is the 2.x rebuild in
> `quill-haven-2`; the current source of truth is **`CLAUDE.md`** + **`FIX_CHECKLIST.md`**.
> Kept only for history.

# Quill Haven — Game Plan (the brain)

> **The single source of truth for the whole project.** Goal, who it's for, how
> it's used, the real file tree, every feature, the ideas list, and version
> history. If any other doc disagrees with this one, this one wins — fix the
> other doc. Last updated 2026-06-22 (v2.0).

---

## 1. What this is

Quill Haven is a **whole operating system for writing**. You take a cheap laptop,
wipe it, and Quill Haven becomes the entire computer. When it powers on, it boots
**straight into a clean home screen with only writing apps** — no Windows, no
ChromeOS, no web browser to wander into, no app store, no settings to get lost
in. A distraction-free writing machine.

"Only the writing apps" is not a restriction bolted on top — it **is** the whole
point: a device that can only write.

This is settled and not up for debate: Quill Haven IS the operating system. It is
**not** "an app you install inside Windows/Mac" and **not** "a tablet in a locked
kiosk mode." Those alternatives have been considered and deliberately rejected.

## 2. Who this is for

Marie. Non-technical — every doc and every screen talks like she's ten, no
jargon. She writes LitRPG romance novels and uses Dabble Writer, Google Docs, the
built-in Local Writing app, and (optionally) Typing & Tomes.

## 3. How it's used — devices & use cases

The **same** Quill Haven is used three ways:

1. **Try it live in any browser** — the home screen is hosted at
   `https://stjohnbuilds.github.io/quill-haven/`. Click around, themes, the
   writing app, the files app — everything saves to that browser. This is the
   demo / "what it looks like" link. No install, no account.
2. **Installed as the whole OS on a wiped laptop** — the real product. One USB
   stick wipes the laptop, installs Linux Mint, and runs `setup.sh`, which makes
   the laptop boot straight into Quill Haven in fullscreen kiosk mode. (The kiosk
   loads the home screen from the GitHub Pages URL above, with a baked-in
   allowlist that blocks every other site.)
3. **A Raspberry Pi build** *(future, not written yet)* — a Pi already *is* a
   Linux computer, so there's nothing to wipe; it runs the same kiosk off an SD
   card. Needs its own short instruction sheet because the "get the system on"
   step differs (flash an SD card vs. boot a USB installer). Can be a tablet shape
   (Pi + touchscreen, e.g. RasPad) or a keyboard-computer (Pi 400).

**Marie's mix:** she sets these up on Mac sometimes and Windows laptops other
times. After Linux is installed, the Quill Haven step is identical on every
machine — only the "boot from USB" key differs (covered in the instruction sheet).

**Starting devices that work** (anything you can wipe and put your own Linux on):

| Device | Works? | Note |
|---|---|---|
| Windows laptop (Intel/AMD) | ✅ | Easiest. Any maker, any age. |
| Intel Mac (pre-2020) | ✅ | Boot the USB by holding **Option (⌥)**. |
| Intel/AMD Chromebook | ✅ | One extra firmware-unlock step first. |
| Raspberry Pi | ✅ (future sheet) | Already Linux — runs from an SD card. |

**Will NOT work** (firmware refuses another OS — out of scope):
Apple Silicon Macs (M1/M2/M3/M4, any 2020+ Mac), ARM Chromebooks (MediaTek /
Rockchip / Snapdragon), iPads, Android tablets.

→ Step-by-step install: [`devices/SETUP.md`](../devices/SETUP.md).
→ Buying a Chromebook for this: [`devices/BEFORE-YOU-BUY.md`](../devices/BEFORE-YOU-BUY.md).

## 4. Status at a glance

- ✅ **Home screen** — built and polished (the desktop you see on boot).
- ✅ **Local Writing app v2** — Notes + Projects → optional Parts → Chapters →
  Scenes, drag, rename, highlight, soft-delete trash + undo, autosave, RTF export.
- ✅ **Files app** — Documents / Pictures / Downloads / USB / Trash, sub-folders,
  drag, rename; pictures → home-screen wallpaper; real USB via File System Access.
- ✅ **Backup / restore** — Download → full `.zip` (Word files + restorable JSON);
  Settings → Restore backup (all-or-nothing).
- ✅ **Google Drive sync** — framework done; one-button upload once a Client ID is
  pasted (see [`DRIVE_SETUP.md`](DRIVE_SETUP.md)).
- ✅ **Settings** — Wi-Fi, Brightness, 4 themes + hue slider, Night Light, Google
  account, Drive, App Bar, Storage bar, Region/timezone, Background picker, Apps
  list (drag/on-off/remove), Add App (with distraction-site ban), Clipboard.
- ✅ **OS install side** — `devices/SETUP.md` (one USB → wipe → Linux Mint → run
  `setup.sh`) + `setup.sh` (Chromium kiosk, autostart, URL allowlist, recovery
  escape hatch). Works on Windows / Intel Mac / Intel-AMD Chromebook.
- ⏳ **Remaining device work** — a one-step custom USB ISO (install + kiosk in one
  boot instead of two), and the Raspberry Pi instruction sheet.
- ⏳ **Parked ideas** — see §9.

**Updates:** the home screen reads `version.json` from GitHub and shows an
"Update available" button; the service worker also auto-updates the device the
next time it has Wi-Fi.

## 5. Core boundary — the locked-door rule

The home screen is the ONLY interface. Everything is reached from it — apps,
settings, clipboard. There is no desktop, no file manager, no terminal, no
browser address bar. The browser runs in kiosk/fullscreen and can only load
allowlisted URLs.

Mental model: the laptop is a room with one door, opening to a hallway with a few
doors (Google Docs, Local Writing, Files, Dabble…). More doors can be added in
settings. But there is NO door to "the internet", "system settings", or an "app
store". If it's not on the home screen, it doesn't exist.

## 6. The apps

### Built-in defaults (always present, can't be removed)

| App | URL | Icon colour |
|---|---|---|
| Google Docs | https://docs.google.com | Pastel pink |
| Local Writing | built-in (`apps/writing/`) | Pastel green |
| Files | built-in (`apps/files/`) | Soft blue |

### Add-ons (ship by default, removable; user can add more)

| App | URL | Note |
|---|---|---|
| Dabble Writer | https://app.dabblewriter.com | Removable default add-on (lavender) |
| Typing & Tomes | https://typingandtomes.vercel.app | Added manually via Add App |

### Always allowlisted (not shown as apps, needed behind the scenes)

- https://accounts.google.com — Google sign-in for Docs/Drive
- https://raw.githubusercontent.com + the GitHub Pages host — update checker + the
  home screen itself
- Fonts are bundled locally — no font CDN needed.

### Banned by design

Add App refuses obvious distraction sites (social media, Gmail, YouTube, etc.) so
a distraction can't be sneaked in.

---

## 7. Internal file tree (the real one)

```text
QuillHaven/
├── index.html                  GitHub Pages landing — redirects to home-screen/index.html
├── setup.sh                    the kiosk installer the Linux Mint terminal runs
├── version.json                version number for the in-app update checker (2.0)
├── README.md                   public landing / "try it live" + install pointer
├── LICENSE                     MIT
├── CLAUDE.md                   project rules for AI sessions (incl. "this IS its own OS")
├── TODO.md                     task tracking
│
├── home-screen/                THE home screen (static HTML/CSS/JS, no build step)
│   ├── index.html              structure — boot splash, top bar, clock, dock, settings
│   ├── manifest.json           web-app manifest (icon/name for the kiosk)
│   ├── service-worker.js       offline cache + auto-update (versioned cache, network-first shell)
│   ├── shared/
│   │   ├── theme.css           the 4 skins — colour variables, linked by EVERY page
│   │   └── confirm.js          qhConfirm() — THE one styled popup used everywhere
│   ├── css/
│   │   └── home.css            home-screen styles (layout + components)
│   ├── js/
│   │   └── home.js             home logic — apps (defined once in BUILTIN_APPS/DEFAULT_ADDONS),
│   │                             clock, settings, themes, background, clipboard, Add App,
│   │                             drag-reorder, storage bar, backup/restore, Drive, update check
│   ├── img/                    the St John quill (boot splash + writing app) + iconset
│   ├── fonts/                  bundled EB Garamond + Great Vibes (offline-safe type)
│   └── apps/
│       ├── writing/            built-in Local Writing app
│       │   ├── index.html      panel (Notes/Projects/Trash) + pill toolbar + editor
│       │   ├── writing.css     editor styles (uses shared/theme.css)
│       │   └── writing.js      notes/projects/parts/chapters/scenes, drag, rename, trash+undo,
│       │                         highlight, autosave, RTF export
│       └── files/              built-in Files app
│           ├── index.html      folders (Documents/Pictures/Downloads/USB/Trash)
│           ├── files.css       file-card styles (uses shared/theme.css)
│           └── files.js        documents, pictures→background, sub-folders, drag, rename,
│                                 trash, real USB via File System Access API
│
├── devices/                    install instructions (one USB path)
│   ├── README.md               table / overview of the install
│   ├── SETUP.md                the step-by-step (USB → wipe → Linux Mint → setup.sh)
│   └── BEFORE-YOU-BUY.md       Chromebook write-protect check before buying one
│
├── docs/
│   ├── GAME_PLAN.md            (this file) the brain — source of truth
│   ├── CODE_HEALTH.md          code rules + deep-dive audit checklist
│   ├── HANDOVER_TO_NEW_CHAT.md bootstrap for the next AI session (gotchas, cache map)
│   ├── AI_ASSESSMENT_PROMPT.md copy-paste prompt for a fresh AI to audit everything
│   └── DRIVE_SETUP.md          the 10-minute Google Cloud setup for Drive sync
│
└── .claude/
    ├── launch.json             preview server config (port 8081)
    ├── settings.json           Claude Code settings
    └── hooks/                  safety + logging hooks (logs are gitignored)
```

---

## 8. Feature breakdown

### Home screen — DONE
Boot splash (theme-tinted St John quill + script "Quill Haven" + tagline + a
loading bar that tracks real load time); pastel gradient with slow frosted orbs;
frosted top bar (update button, app icons in Top mode, live Wi-Fi + battery +
settings cog, live date/time); big clock + time-of-day greeting; frosted dock
(switchable to the top bar); settings panel (slides in; close via X / click-out /
Escape). App windows open as fullscreen iframes with traffic-light close buttons;
right-click an icon for Restart / Close. Everything persists across a reload.

### Local Writing app — DONE (v2)
Built-in offline writing app (pastel-green icon), matches the home theme.
- Three tabs — **Notes**, **Projects**, **Trash** — in a side panel that
  collapses to a small faded quill and slides back out.
- **Projects → optional Parts → Chapters → Scenes.** Each scene has a header +
  sub-header + body. Chapters auto-number; a "Move to…" appears when Parts exist.
- **Drag** to reorder; **pencil** to rename; delete with a confirm.
- Centred pill toolbar: bold / italic / underline / strikethrough / highlight.
- Large EB Garamond writing space; live word count; autosave to the device.
- **Soft-delete trash + undo** (6-second toast; orphan restores become a Note).
- **Download/export:** Save to device (.rtf), Save to Drive (.rtf), or a full
  bundle .zip of every project + note as Word files plus a restorable JSON.
- **Save hook:** exposes `window.flushAndPersist()` so the home screen can save
  in-flight typing before it ever tears the window down.

### Files app — DONE
Real OS-style Files app (soft-blue icon). Folders: Documents, Pictures,
Downloads, USB, Trash.
- **Pictures:** upload an image → "Set as background" (downscaled, saved as
  `qh-bg`); a "Default" card restores the pastel look.
- **Sub-folders** inside Documents/Pictures, with drag-to-move and rename; folder
  trash + restore.
- **USB:** real drag-and-drop via the File System Access API on installed
  Chromium/Edge (folder handle saved in IndexedDB so it sticks); friendly "not
  supported" fallback elsewhere.

### Backup / restore — DONE
- Download → **Full backup (.zip)** — every project + note as a Word file, plus a
  restorable `quill-haven-backup.json`, plus a README. Pure-JS, no library.
- Settings → **Restore backup** — pick a `.json` or `.zip`; danger-confirms with
  the date + counts; all-or-nothing apply (rolls both keys back if either fails).

### Google Drive sync — DONE (framework)
`window.QHDrive` handles Client ID storage, Google sign-in, and multipart upload.
Paste a Client ID (see DRIVE_SETUP.md) → Download → Drive uploads the .zip.
Optional silent auto-backup every 30 min once connected.

### Distraction wall — DONE
Add App refuses obvious distraction domains. On the installed device, `setup.sh`
bakes a Chromium managed policy (`URLBlocklist=["*"]` + a tight allowlist) so the
browser physically can't reach anything outside the writing apps.

### Device install + update — DONE (one-step ISO outstanding)
`devices/SETUP.md` + `setup.sh`: USB → wipe → Linux Mint → one terminal line →
boots into Quill Haven, allowlist baked in, with `quill-haven-recovery` /
`quill-haven-enable` escape hatches. Updates: versioned service-worker cache +
network-first shell auto-update the device next time it has Wi-Fi; the in-app
"Update available" button is the manual path.

---

## 9. Ideas / roadmap (parked — not built)

- **One-step custom USB ISO** — bake install + kiosk into one boot instead of
  two. Needs ISO-remaster tooling; skip until there's a real device to test on.
- **Raspberry Pi instruction sheet** — the Pi runs the same kiosk off an SD card;
  needs its own short "get the system on" guide.
- **AI spell checker** in the writing app — a 3-level slider + off; would lean on
  a paid API, so partly blocked on hosting.
- **One-click "Restore from Drive"** — today you download the latest auto-backup
  .json from Drive, then Settings → Restore backup.
- **Icons** — Marie wants the real *St John Author Studio* logo on the boot splash
  (needs the image file); the Dabble Writer icon could be nicer.
- Removed on purpose (do not re-add without asking): a "quick-add common apps"
  list; auto-copying downloads into Files → Documents.

---

## 10. Design language

| Element | Value |
|---|---|
| Background | Light pastel gradient + frosted orbs (default); themes tint it, Dark repaints |
| Glass | translucent white + backdrop blur |
| Radius | 16px cards, 10px icons, ~7px buttons |
| Font | System stack for UI; EB Garamond for the writing app; Great Vibes on the boot splash |
| Hover | scale + gentle lift, ~0.15–0.2s |
| Animations | slow, calm (20–25s orb drift) |

**Themes (4 skins, one file `shared/theme.css`):** Purple (default), Wood, Slate,
Dark. A theme is mostly about the accent colour; Dark is the one full repaint.
**Night Light** is separate — a warm filter you toggle on/off, not a skin. Every
page links the one theme file so the home screen and both apps always match (via
the `qh-theme` storage event).

## 11. Hardware

Quill Haven runs on anything you can wipe and put your own Linux on — see §3. No
single "official" device; a cheap Intel/AMD laptop or 2-in-1 is the easy path, a
Raspberry Pi is the from-scratch path. Avoid Apple Silicon Macs and ARM
Chromebooks (firmware won't allow it).

## 12. Rules

1. **One source of truth per thing.** Apps are defined once and render everywhere.
2. **No frameworks.** Static HTML/CSS/JS. No React, no build step, no npm.
3. **Offline first.** Everything works without internet except the web apps.
4. **Locked by design.** No escape hatches. If it's not on the home screen, it
   doesn't exist.
5. **Pretty by default.** Modern, calm, pastel — not a chunky school-laptop UI.
6. **Plan before building.** Plan, review, then build. One task at a time.
7. **Data safety is sacred.** Marie's writing must never silently vanish.

---

## 13. Version history

| Version | Date | Changes |
|---|---|---|
| 1.0–1.9 | 2026-06-21 | Home screen, themes/boot splash, code split, data-driven apps, bundled fonts, Local Writing v2, Files app (full history in git) |
| 2.0 | 2026-06-22 | Finishing batch (RTF/zip export, trash+undo, Parts, Files folders, Drive framework, backup/restore, home polish); one-USB device install + kiosk allowlist; audit fixes (service-worker auto-update, data-loss guards, hidden-row fix, contrast, qhConfirm noCancel); docs consolidated to this brain |
