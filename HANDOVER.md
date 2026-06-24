# HANDOVER — Quill Haven, 2026-06-23

## WHAT HAPPENED THIS SESSION (the mess)

The previous AI (me) tried to build a Chrome extension that overlays a pill
(top bar) and dock (app switcher) on every page, so Marie never gets trapped
in an app. **The idea is correct and Marie designed it.** But I:

1. **Made up new icons, colors, and a settings panel from scratch** instead of
   reusing the ones already in the home screen. The result clashed with everything.
2. **Left the old home screen UI running underneath**, so there were TWO top
   bars, TWO docks, two of everything.
3. Marie saw this, rightfully hated it, and asked me to undo everything.

**I have now reverted the device-side changes.** The extension files are still
on her laptop at `~/.local/share/quill-haven/extension/` but the launcher
(`launch-home.sh`) no longer loads them. Her laptop is back to the normal
kiosk home screen (v3.1 ⭐).

## WHAT MARIE WANTS (her words, her design)

The whole app is just TWO floating overlays injected by a Chrome extension onto
every page (Google Docs, Dabble, Typing & Tomes, and the home screen):

### Bottom-right: App switcher
- A single icon showing the CURRENT app (use the actual icon/color from the home screen)
- Tap it → tray slides open showing the OTHER apps + a home button
- Tap an app → navigates to it
- Tray closes on outside click

### Top-right: Status pill
- Slim, compact, frosted-glass pill
- Contents left to right: **emoji** (current version), **wifi**, **battery**,
  **power**, **settings gear**, **date + time** in 24hr format
- The emoji **pulses** if an update is available; hover shows "Update to vX.X"
- Tapping the pulsing emoji triggers the update
- Settings gear opens a popup with the SAME settings as the home screen

### Home screen changes
Once the extension works, the home screen becomes JUST:
- The wallpaper / background gradient
- The clock in the center
- Maybe the boot splash

Remove the top bar, dock, and settings from the home screen — the extension
handles all of that on every page.

## CRITICAL RULE: REUSE, DON'T REINVENT

The home screen already has:
- **App icons** (SVG), **colors**, **gradients** → `allApps()` in `home-screen/js/home.js`
- **WiFi, battery, power, settings SVGs** → in `home-screen/index.html`
- **Theme CSS variables** → `home-screen/shared/theme.css`
- **Settings panel HTML + CSS** → `home-screen/index.html` and `home-screen/css/home.css`

**Extract and reuse these exactly.** Do NOT create new SVGs, new color schemes,
or a new settings panel. If the extension's settings look different from the
home screen's settings, you've already gone wrong.

## HOW TO DELIVER IT

1. **Plan first.** Show Marie the plan before building. One task at a time.
2. **Build the extension** in `extension/` — the files already exist there as
   a starting point (but need redesigning to use the home screen assets).
3. **Test extension loading.** Kiosk mode (`--kiosk`) might block extensions.
   Try `--app=URL --start-fullscreen` instead — that worked this session.
   The flag goes in `helper/launch-home.sh`.
4. **Push via the helper** — not by asking Marie to type commands.
   - Add extension files to `helper/helper-manifest.json` extras
   - Add `--load-extension` to `launch-home.sh`
   - The helper downloads extras and restarts Chromium automatically
   - Helper v1.6 already supports subdirectory extras (`extension/filename`)

## CURRENT STATE

| Thing | Version | Status |
|-------|---------|--------|
| Home screen | v3.1 ⭐ | Working. No greeting, emoji in top bar, wider settings, fixed update |
| Helper | v1.6 | Working. Supports subdirectory extras, restarts Chromium on launch-home.sh changes |
| Extension | exists in repo | NOT loading on device (reverted). Needs full redesign to reuse home-screen assets |
| Kiosk mode | `--kiosk` | Working. Extension loading needs `--app` mode or testing |

## ALSO REQUESTED (not yet built)
- **"Check for updates" button** in settings — triggers the helper immediately
  instead of waiting 6 hours. Add a `/check-update` POST endpoint to helper.py.
- **Google Docs recents list** — show recent docs instead of full Drive UI.

## FILES
- `extension/` — Chrome extension (manifest v3, content scripts)
- `home-screen/` — current home screen (the source of truth for all visual design)
- `helper/helper.py` — self-updating helper (v1.6)
- `helper/helper-manifest.json` — controls what the helper downloads
- `helper/launch-home.sh` — Chromium launcher
- `setup.sh` — first-time device setup

## PATTERNS TO AVOID
1. **Do NOT make up new UI assets.** Reuse what exists in the home screen.
2. **Do NOT tell Marie to type terminal commands.** Use the helper system.
3. **Do NOT leave duplicate UI running.** If the extension handles it, remove it from the home screen.
4. **Do NOT self-certify.** Say "untested on hardware" if you haven't tested on hardware.
5. **Do NOT ask permission for things she already asked for.** Just do it.
6. **Do NOT use soothing/wellness language.** Ever. Read her CLAUDE.md.
