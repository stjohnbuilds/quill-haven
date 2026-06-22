# Quill Haven — Game Plan

> **Source of truth for the whole project.** What it is, the code tree, and the
> full feature list. Updated 2026-06-21.

## What This Is

Quill Haven is a **whole operating system for writing**. It runs on a cheap Acer
Chromebook Spin 311, but the Chromebook is just the hardware — Quill Haven
*replaces* what the device does. When it powers on, Marie sees a clean home
screen with ONLY her writing apps. No ChromeOS, no browser to wander into, no
system settings to fiddle with, no distractions. A ~$100 distraction-free
writing machine.

"Only the writing apps" is not a restriction bolted on top — it **is** the whole
point: a device that can only write.

## Who This Is For

Marie. Non-technical. Writes LitRPG romance novels. Uses Dabble Writer, Google
Docs, the built-in Local Writing app, and (optionally) Typing & Tomes.

## Where We Are (status at a glance)

- ✅ **Home screen** — built and polished (the desktop you see on boot)
- ✅ **Local Writing app v2** — built (Notes + Projects, chapters → scenes, drag,
  highlight, autosave)
- ✅ **Add App + settings** — built (colour/icon pickers, drag-reorder, storage bar)
- ⏳ **The OS half** — boot-into-this, lockdown, USB installer, README — still to build
- ⏳ **Home-screen polish pass** — a handful of small tweaks logged in TODO.md

**Install method:** a USB stick is needed **once** to put the OS on the device
(you can't replace an OS from inside ChromeOS without external media). After
that, updates come from GitHub — the in-app "Update available" button already
pulls the latest home screen.

## Core Boundary

The home screen is the ONLY interface. Everything Marie needs is reachable from
it — apps, settings, clipboard. There is no desktop, no file manager, no
terminal, no browser address bar. The browser runs in kiosk/fullscreen mode and
can only load whitelisted URLs.

### The Locked Door Rule (plain-English mental model)

The Chromebook is a room with one door. The door opens to a hallway with a few
doors (Google Docs, Local Writing, Dabble). More doors can be added through
settings. But there is NO door to "the internet", NO door to "system settings",
NO door to "app store". If it's not on the home screen, it doesn't exist.

## Product Shape

- **Home screen** — `home-screen/`, static HTML/CSS/JS, no build step, no
  framework. Split into a few small files (structure / styles / theme / logic)
  so nothing is one giant blob. This is the actual desktop on boot.
- **Boot scripts** *(to build)* — Linux auto-login + auto-launch of the home
  screen in fullscreen Chromium.
- **Lockdown config** *(to build)* — Chromium policy blocking every site except
  the whitelisted writing apps.
- **USB installer** *(to build)* — everything bundled for a fresh-device setup.
- **GitHub repo:** `stjohnbuilds/quill-haven` (public)

## The Apps

### Built-in defaults (always present, can't be removed)

| App | URL | Icon colour |
|---|---|---|
| Google Docs | https://docs.google.com | Pastel pink (#f5d0e5 / #ebbad0) |
| Local Writing | built-in (`apps/writing/`) | Pastel green (#bfe3c4 / #9ed0a8) |
| Files | built-in (`apps/files/`) | Soft blue (#bcd0ea / #9bb6dd) |

### Add-ons (ship by default, removable; user can add more)

| App | URL | Icon colour |
|---|---|---|
| Dabble Writer | https://app.dabblewriter.com | Lavender (#ddd0f0 / #ccbbe5) |
| Typing & Tomes | https://typingandtomes.vercel.app | (add via Add App) |

> Dabble ships as a removable default add-on. Google Docs and Local Writing are
> the two true built-ins.

### Always whitelisted (not shown as apps, needed behind the scenes)

- https://accounts.google.com — Google sign-in for Docs
- https://raw.githubusercontent.com — the update checker
- *(Fonts are bundled locally now — no font CDN needed.)*

### Banned by design *(to build)*

The "Add App" button should refuse the obvious distraction sites (social media,
Gmail, YouTube, etc.) so Marie can't sneak one in.

---

## Internal App Tree

```text
QuillHaven/
├── home-screen/                THE home screen (static HTML/CSS/JS, no build step)
│   ├── index.html              structure — boot splash, top bar, clock, dock, settings
│   ├── shared/
│   │   └── theme.css           the skins — colour variables, shared by EVERY page
│   ├── css/
│   │   └── home.css            home-screen styles (layout + components)
│   ├── js/
│   │   └── home.js             home-screen logic — apps (defined once), clock,
│   │                             settings, themes, clipboard, Add App, drag-reorder,
│   │                             storage bar, update check
│   ├── img/
│   │   └── quill.png           the master St John quill (boot splash + writing app)
│   ├── fonts/                  bundled fonts so the OS needs no Wi-Fi for type
│   │   ├── eb-garamond-*.woff2   writing-app body font (regular/500/600/italic)
│   │   └── great-vibes-latin.woff2  the script font on the boot splash
│   └── apps/
│       ├── writing/            the built-in Local Writing app
│       │   ├── index.html      panel (Notes/Projects) + pill toolbar + editor
│       │   ├── writing.css     editor styles (uses shared/theme.css)
│       │   └── writing.js      Notes/Projects, chapters → scenes, drag, rename,
│       │                         highlight, autosave to device
│       └── files/              the built-in Files app
│           ├── index.html      folders (Documents/Pictures/Downloads/USB/Trash)
│           ├── files.css       file-card styles (uses shared/theme.css)
│           └── files.js        documents, pictures→background, trash; Downloads
│                                 & USB are real once the OS helper exists
│
├── boot/                        (TO BUILD) Linux boot sequence
│   ├── autologin.conf           auto-login config
│   ├── start-quillhaven.sh      launch Chromium kiosk pointing at the home screen
│   └── quillhaven.service       systemd service file
│
├── config/                      (TO BUILD) browser lockdown
│   └── lockdown.json            Chromium managed policy — whitelist only
│
├── installer/                   (TO BUILD) USB installer package
│   ├── install.sh               setup script
│   └── README-SETUP.md          step-by-step for Marie
│
├── docs/
│   ├── GAME_PLAN.md             (this file) source of truth for the whole project
│   ├── CODE_HEALTH.md           file structure + code-health rules
│   ├── WRITING_APP_PLAN.md      Local Writing app spec (confirmed)
│   ├── HANDOVER_TO_NEW_CHAT.md  bootstrap for the next AI session
│   ├── IDEAS.md                 parked nice-to-haves
│   └── AI_ASSESSMENT_PROMPT.md  prompt for a fresh AI to audit everything
│
├── version.json                 version number for the update checker
├── CLAUDE.md                    project rules for AI sessions
├── TODO.md                      task tracking
├── .gitignore
└── .claude/
    ├── launch.json              preview server config (port 8081)
    ├── settings.json            Claude Code settings
    └── hooks/                   safety + logging hooks
```

---

## Feature Breakdown

### 1. Home Screen — DONE

A real-OS-looking desktop, split across a few small files.

**Boot splash:**
- The real St John **quill** (masked image, tinted to the current theme) next to
  a script-font "QuillHaven", then a "Your writing sanctuary" tagline and a
  loading bar; fades into the home screen.
- Boot splash matches the saved theme (no colour flash).

**Background:** soft pastel gradient with slow frosted orbs; theme-aware.

**Top bar:** frosted strip — update button (only when a new version exists),
app icons in "Top" mode, Wi-Fi / battery / settings cog, live date+time.

**Clock area:** big time, time-of-day greeting, full date.

**Dock:** frosted centred bar of app icons; hover animation; name tooltips
(hidden while an app is open); switchable to the top bar.

**Settings panel:** slides in; close via X / click-outside / Escape.
- General card: Wi-Fi, Brightness, Theme picker (+ hue slider), Night Light,
  Google Account link, App Bar (Dock/Top), **Storage** bar.
- Apps section: each app has a **grip handle (drag to reorder)**, mini icon,
  on/off toggle, and a remove × (add-ons only).
- **Add App**: name + website + a **Colour** dropdown (20 theme-aware swatches)
  + an **Icon** dropdown (quill, book, heart, star, pencil, clover, notebook, or
  the app's own first letter). Saves the chosen colour + icon onto the new app.
- Clipboard history: recent copies, click to re-copy (with a toast).

**App windows:** fullscreen iframe with traffic-light close buttons; right-click
an icon for Restart / Close.

**Themes:** four skins in one shared file — Purple (default), Wood, Slate, Dark
— plus a hue slider and a separate Night Light warm filter. (See Design Language.)

**Persistence:** theme, Night Light, brightness, dock/top mode, app on/off,
app order, and clipboard all survive a reload.

**Update checker:** reads `version.json` from GitHub; shows "Update available"
when newer; the in-app update pulls and loads the latest screen. *(Making an
update "stick" across a device reboot is part of the OS setup, later.)*

### 2. Local Writing App — DONE (v2)

The built-in offline writing app (pastel-green icon), opened from the home
screen. Matches the home-screen theme.

- **Two tabs: Notes and Projects** in a side panel that **collapses to a small
  faded quill** and slides back out.
- **Projects → Chapters → Scenes.** Each scene has a **header + sub-header +
  body**. New chapters auto-number ("Chapter 1, 2, 3…").
- **Drag** to reorder projects / chapters / scenes / notes. **Double-click** a
  name to rename. Delete with a confirm.
- **Centred pill toolbar**, all-in-one: bold, italic, underline, strikethrough,
  and **highlight** (Typing & Tomes pastel colours + remove).
- Large EB Garamond writing space; live word count; autosaves to the device
  (localStorage). Old single-list chapters were migrated into Notes.

### 2.5 Files App — DONE (v1), in the dock

A real OS-style Files app (soft-blue folder icon). Folders: **Documents**,
**Pictures**, **Downloads**, **USB**, **Trash**.
- **Pictures**: upload an image → "Set as background"; the home screen applies it
  live (downscaled, saved as `qh-bg`). A "Default" card restores the pastel look.
- **Documents**: ready to receive manuscripts downloaded from the writing app.
- **Trash**: deleted files with restore / delete-forever.
- **Downloads + USB**: placeholders today — they become real (browse real files,
  see a plugged-in USB, drag manuscripts across) once the OS-side helper is built
  with the boot/installer. The web page alone is sandboxed; the helper gives it
  real file + USB access.

### 3. Boot Sequence — TO BUILD

Auto-login to a "writer" user, auto-launch Chromium in kiosk/fullscreen pointed
at the local home screen. No window chrome, no address bar, no tabs.

### 4. Browser Lockdown — TO BUILD

Chromium managed policy: whitelist the writing-app domains + Google sign-in +
the update host; block everything else, dev tools, and incognito.

### 5. USB Installer — TO BUILD

A script that lays everything down on a fresh Linux install and wires up
auto-login, auto-launch, and lockdown. Plus a README: "what this is" + how to
install and update.

### 6. Home-screen polish — UPCOMING (logged in TODO)

- Even spacing of the top-bar Wi-Fi / battery / cog
- Make Wi-Fi + battery feel "live" (hover state; battery shows its level)
- Loading bar that tracks the real boot time, not a fixed animation
- A one-time Region/timezone setting so the clock is right
- Ban the obvious distraction sites in Add App

### 7. Future ideas

- AI spell checker in the writing app (3-level slider + off)
- A common-apps quick-add list was built then removed at Marie's request

---

## Design Language

| Element | Value |
|---|---|
| Background | Light pastel gradient + frosted orbs (default); themes tint it, Dark repaints |
| Glass | rgba(255,255,255,0.5) + backdrop blur |
| Radius | 16px cards, 10px icons, ~7px buttons |
| Font | System stack for UI; EB Garamond for the writing app; Great Vibes on the boot splash |
| Hover | scale + gentle lift, ~0.15–0.2s |
| Animations | Slow, calm (20–25s orb drift) |

### Themes (4 skins)

A theme is about the ACCENT colour, not repainting everything:

- **Purple (default)** — soft pastel background, white panels, lavender accent.
- **Wood** and **Slate** — same light background + white panels; a whisper of
  tint and a different accent (toggles, slider, highlight, links, writing caret).
- **Dark** — the one full dark mode (re-colours everything).
- **Night Light** is separate: a warm filter you toggle on/off, not a skin.

All skins live in one file — `home-screen/shared/theme.css` (CSS variables) —
linked by the home screen and every app so they always match.

---

## Hardware

- **Device:** Acer Chromebook Spin 311 (11.6") · MediaTek MT8183 · 4 GB RAM · 64 GB eMMC
- **Cost:** ~$100 used
- **OS plan:** wipe ChromeOS, install lightweight Linux (Debian/Ubuntu minimal + Chromium)

---

## Rules

1. **One source of truth per thing.** Apps are defined once and render everywhere.
2. **No frameworks.** Static HTML/CSS/JS. No React, no build step, no npm.
3. **Offline first.** Everything works without internet except the web apps.
4. **Locked by design.** No escape hatches. If it's not on the home screen, it doesn't exist.
5. **Pretty by default.** Modern, calm, pastel — not a chunky school-laptop UI.
6. **Plan before building.** Plan, review, then build. One task at a time.

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-21 | Initial home screen: default apps, settings panel, clipboard, dock/top toggle, update checker |
| 1.1 | 2026-06-21 | Boot splash + theme picker; themes reworked to 4 real skins; persistence + update-apply fixes |
| 1.2 | 2026-06-21 | Code split into index.html + css/home.css + shared/theme.css + js/home.js; Local Writing app (v1) added as 2nd default |
| 1.3 | 2026-06-21 | Apps data-driven; Add App + remove apps; Dabble becomes a removable default add-on |
| 1.4 | 2026-06-21 | Fonts bundled locally (EB Garamond + Great Vibes); boot splash matches saved theme |
| 1.5 | 2026-06-21 | Real St John quill on the boot splash (bigger, theme-tinted); tagline/loader no longer "lift" |
| 1.6 | 2026-06-21 | Add App polish: colour dropdown (20 swatches), icon dropdown (incl. proper clover; "A" replaced by live first-letter), saves chosen colour/icon; drag-to-reorder apps; storage bar |
| 1.7 | 2026-06-21 | **Local Writing v2** — Notes/Projects tabs, collapsing quill panel, chapters → scenes (header + sub-header), drag, rename, highlight, autosave; old chapters migrated to Notes |
| 1.8 | 2026-06-21 | Writing-app review fixes (pen/line highlight icon, no-bracket placeholders, no tree lines, pencil rename, native typing undo confirmed); even top-bar icon spacing |
| 1.9 | 2026-06-21 | **Files app** added to the dock — Documents, Pictures (→ set home-screen background), Trash; Downloads/USB are device-side placeholders. Next: Download button (This device / Google Drive) to fill Documents |
