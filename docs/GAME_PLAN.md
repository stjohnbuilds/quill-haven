# Quill Haven — Game Plan

## What This Is

Quill Haven is a custom Linux-based operating system for an Acer Chromebook Spin 311. When it boots, Marie sees a clean home screen with ONLY her writing apps. Nothing else — no browser to wander into, no settings to fiddle with, no distractions. Locked by design. A $100 distraction-free writing machine.

## Who This Is For

Marie. Non-technical. Writes LitRPG romance novels. Uses Dabble Writer, Google Docs, and eventually Typing & Tomes and a local writing app.

## Core Boundary

The home screen is the ONLY interface. Everything Marie needs is accessible from the home screen — apps, settings, clipboard. There is no desktop, no file manager, no terminal, no browser address bar. The browser runs in kiosk/fullscreen mode and can only load whitelisted URLs.

### The Locked Door Rule (plain-English mental model)

Marie's Chromebook is a room with one door. The door opens to a hallway with exactly 2 doors right now (Dabble Writer, Google Docs). More doors can be added later through settings. But there is NO door to "the internet." There is NO door to "system settings." There is NO door to "app store." If it's not on the home screen, it doesn't exist.

## Product Shape

- **One HTML file** (`home-screen/index.html`) — the entire home screen UI. Static HTML/CSS/JS, no build step, no framework.
- **Boot scripts** (to be built) — Linux auto-login + auto-launch of home screen in fullscreen Chromium.
- **Lockdown config** (to be built) — Chromium policy JSON blocking all sites except whitelisted writing apps.
- **USB installer** (to be built) — everything bundled for a fresh Chromebook setup.
- **GitHub repo:** `stjohnbuilds/quill-haven` (public)

## The Apps

### Default (ship with these)

| App | URL | Icon Colour | Position |
|---|---|---|---|
| Dabble Writer | https://app.dabblewriter.com | Lavender (#ddd0f0 / #ccbbe5) | Left |
| Google Docs | https://docs.google.com | Pastel pink (#f5d0e5 / #ebbad0) | Right |

### Future (added via "Add App" button in settings)

| App | URL | Icon Colour |
|---|---|---|
| Local Writing App | built-in | Pastel green |
| Typing & Tomes | https://typingandtomes.vercel.app | Bluish purple |

### Always Whitelisted (not shown as apps, but allowed for login)

- https://accounts.google.com

---

## Internal App Tree

```text
QuillHaven/
├── home-screen/
│   └── index.html              THE home screen — single file, all CSS/JS embedded
│                                 ├── Background: pastel purple-pink gradient + animated orbs
│                                 ├── Top bar: Wi-Fi, battery, settings cog, date/time
│                                 ├── Clock: centered time + greeting + date
│                                 ├── Dock: frosted glass bar, centered, app icons
│                                 ├── Top-bar mode: app icons centered in top bar (toggle in settings)
│                                 ├── Settings overlay:
│                                 │   ├── Settings card: Wi-Fi, Brightness, Night Light, Google Account, App Bar toggle
│                                 │   ├── Apps card: per-app visibility toggles
│                                 │   └── Clipboard History: last copied items, click to re-copy
│                                 ├── App views: fullscreen iframe wrappers with traffic-light close buttons
│                                 └── Update checker: fetches version.json from GitHub
│
├── boot/                        (TO BUILD) Linux boot sequence scripts
│   ├── autologin.conf           auto-login config
│   ├── start-quillhaven.sh      launch Chromium in kiosk mode pointing at home screen
│   └── quillhaven.service       systemd service file
│
├── config/                      (TO BUILD) Browser lockdown
│   └── lockdown.json            Chromium managed policy — whitelist only
│
├── installer/                   (TO BUILD) USB installer package
│   ├── install.sh               setup script
│   └── README-SETUP.md          step-by-step for Marie
│
├── docs/
│   ├── GAME_PLAN.md             (this file) source of truth for the whole project
│   └── AI_ASSESSMENT_PROMPT.md  handover prompt for a fresh AI to audit everything
│
├── version.json                 version number for update checker
├── CLAUDE.md                    project rules for AI sessions
├── TODO.md                      task tracking
├── .gitignore
└── .claude/
    ├── launch.json              preview server config (port 8081)
    ├── settings.json            Claude Code settings
    └── hooks/                   safety hooks
        ├── _log.sh              shared logger
        ├── post-tool-use-tracker.sh
        ├── pre-tool-use-git.sh
        ├── stop-build-check.sh
        ├── stop-no-mess.sh
        ├── stop-no-self-cert.sh
        └── user-prompt-submit.sh
```

---

## Feature Breakdown

### 1. Home Screen (DONE)

The home screen is a single HTML file that looks like a real OS desktop.

**Background:**
- Pastel purple-pink gradient (#ede0ff → #f8e0f0 → #e4ecff)
- 3 animated frosted orbs floating slowly
- Fade-in on load

**Top Bar:**
- Frosted glass strip across the top
- Left side: update button (hidden by default, shown when GitHub version.json is newer)
- Center: app icons when in "Top" mode
- Right side: Wi-Fi icon, battery icon, settings cog, date/time
- Date/time updates every second

**Clock Area (center of screen):**
- Large time display (hours:minutes)
- Greeting based on time of day (Good morning / Good afternoon / Good evening)
- Day of week + month + date

**Dock (bottom of screen):**
- Frosted glass bar, centered horizontally
- App icons with gradient backgrounds
- Soft hover animation (scale 1.08, lift 3px)
- White tooltips with dark text on hover
- Hidden when "Top" mode is active

**Settings Panel:**
- Opens from cog icon, slides in as overlay
- Close with X button
- One settings card: Wi-Fi (display only), Brightness slider, Night Light toggle, Google Account link, App Bar (Dock/Top toggle)
- Apps section: per-app on/off toggles with mini icons
- Clipboard History: shows recent copies, click to re-copy with toast notification
- Footer: "Quill Haven v1.0 🌸"

**App Views:**
- Fullscreen overlays with iframe loading the app URL
- Traffic-light close buttons (red/yellow/green circles) top-left
- Red closes, yellow/green are decorative

**Update Checker:**
- Fetches `version.json` from GitHub on page load
- If remote version > local version, shows "Update available" button in top bar

### 2. Boot Sequence (TO BUILD)

- Auto-login to a "writer" user account (no password prompt)
- Auto-launch Chromium in kiosk/fullscreen mode
- Point Chromium at the local home screen HTML file
- No window decorations, no address bar, no tabs

### 3. Browser Lockdown (TO BUILD)

- Chromium managed policy JSON
- Whitelist: docs.google.com, app.dabblewriter.com, accounts.google.com
- Block everything else
- No address bar access
- No developer tools
- No incognito mode

### 4. USB Installer (TO BUILD)

- Script that copies everything to the right places on a fresh Linux install
- Sets up auto-login, auto-launch, and lockdown
- Tested on Acer Chromebook Spin 311 with Linux installed

### 5. Future: Local Writing App (PLANNED)

- Built into the home screen as a new app view
- ContentEditable editor with formatting toolbar
- EB Garamond font, line-height 2.1
- Sidebar with Notes and Projects tabs
- Saves to localStorage (offline-first)
- AI spell checker with 3-level slider (proof / light edit / line edit) + off position
- Pastel green icon colour

### 6. Future: Add App Button (PLANNED)

- In settings, below the apps list
- Paste a URL, give it a name, pick a colour
- Saves to localStorage
- New app appears in dock/top bar

### 7. Future: Storage Indicator (PLANNED)

- Bar in settings showing how much localStorage is used
- Relevant once the local writing app stores manuscripts

---

## Design Language

| Element | Value |
|---|---|
| Background | Pastel purple-pink gradient with frosted orbs |
| Glass effect | rgba(255,255,255,0.5) + backdrop-filter blur(24px) |
| Border | 1px solid rgba(255,255,255,0.5) |
| Border radius | 16px (cards), 10px (icons), 6px (buttons) |
| Text colour | #595254 (body), #6b5f6e (top bar), #b0a0b8 (muted) |
| Font | System font stack (-apple-system, BlinkMacSystemFont, etc.) |
| Hover | scale(1.08) translateY(-3px), transition 0.2s |
| Tooltips | White background, dark text, subtle shadow |
| Toggles | Lavender (#c9a0e0) when on, grey when off |
| Animations | Gentle, slow (20-25s orb drift), 0.15-0.3s transitions |

---

## Hardware

- **Device:** Acer Chromebook Spin 311 (11.6" screen)
- **CPU:** MediaTek MT8183
- **RAM:** 4 GB
- **Storage:** 64 GB eMMC
- **Cost:** $100 used
- **Status:** Purchased, not yet arrived
- **OS plan:** Wipe ChromeOS, install lightweight Linux (likely Debian or Ubuntu Server minimal + Chromium)

---

## Rules

1. **One file = one truth.** The home screen is one HTML file. Settings, apps, clipboard — all in there.
2. **No frameworks.** Static HTML/CSS/JS only. No React, no build step, no npm.
3. **Offline first.** Everything works without internet except the web apps themselves.
4. **Locked by design.** No escape hatches for the user. If it's not on the home screen, it doesn't exist.
5. **Pretty by default.** Modern, calm, pastel. Not a chunky school-laptop UI.
6. **Plan before building.** Plan first, review, then build.
7. **One task at a time.** Don't bundle changes.

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-06-21 | Initial home screen: 2 default apps (Dabble, Docs), settings panel, clipboard history, dock/top-bar toggle, update checker |
