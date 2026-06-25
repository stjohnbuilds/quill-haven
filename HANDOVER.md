# HANDOVER — Quill Haven, 2026-06-24

New chat: read this, then `MEMORY.md` and `CLAUDE.md`. The overlay extension is
**built, shipped, and working on the real device.** This is no longer "go build it" —
it's "keep refining it."

---

## 0. THE DEVICE (read this first — it has been corrected many times)
Quill Haven runs on a **Mac with Linux installed**. It is **NOT a Chromebook** — that
was an early hardware option that's been dropped. Do not call it a Chromebook. The tech
stack is Chromium in `--kiosk` mode on Linux; only the *device wording* matters here.

## 1. WHAT QUILL HAVEN IS
A locked-down writing OS. On power-on the Mac-Linux boots straight into Chromium kiosk
showing a home screen + writing web apps (Google Docs, Dabble Writer, Typing & Tomes),
everything else blocked. Three layers:
- **Home screen** (`home-screen/`, hosted on GitHub Pages at
  `stjohnbuilds.github.io/quill-haven/` which redirects to `/home-screen/`). The visual
  source of truth (icons, colours, settings).
- **Overlay extension** (`extension/`) — a Chrome extension injected on EVERY page so the
  status pill + app switcher ride on top of every app. This is the main UI now.
- **Helper** (`helper/`) — a local Python service (port 8137) for power/wifi/terminal/
  screen-off, plus self-updating from GitHub.

## 2. CURRENT STATE (all working, confirmed on hardware)
| Thing | Version | Status |
|-------|---------|--------|
| Home screen | 4.3 💤 | On the device, its native top-bar + dock are hidden by the overlay; just wallpaper + clock show. |
| Overlay extension | 4.3 💤 | Pill + app switcher + settings + drag + screen-off. Loads in kiosk (CONFIRMED working). |
| Helper | 1.7 | Self-updates; serves power/restart/sleep/terminal/wifi-settings/**screen-off**. |
| version.json | 4.3 💤 | Drives the pill emoji + update pulse. |

Repo: `stjohnbuilds/quill-haven`. Git user here: `stjohnbuilds`. Push to `main` (the
device pulls from main — a branch would never reach it).

## 3. THE OVERLAY (extension/) — what it does
- **Top-right pill**: a three-dot **grip** (drag handle) + collapses to emoji + 24h time;
  TAP the body to pop out wifi / battery / power / settings-gear. (Hover was removed — it
  stuck "open" on the touchscreen.)
- **Bottom-right app switcher**: a grip + the current-app bubble; tap the bubble → a
  pop-out CARD listing each app (icon + name) + Home. Tap a row to switch.
- **Drag**: ONLY the three-dot grips move the widgets (everything else taps normally).
  Positions persist in `chrome.storage` (posPill/posDock). Do NOT go back to
  "drag the whole widget" — it stole taps and Marie hated it.
- **Settings gear**: on the HOME page it opens the REAL full home settings (it clicks the
  home's own hidden gear → `toggleSettings()`), so brightness/Drive/storage/restore/apps/
  clipboard are all there and wired. Off-home it shows a small "quick settings" panel
  (theme/wifi/region/power/terminal) labelled "all settings on Home".
- **Auto screen-off**: after 5 idle minutes the overlay calls helper `/screen-off`
  (`xset dpms force off`); any touch/key wakes it. Battery saver that avoids the flaky
  Asahi suspend. 5 min is hard-coded for now (no picker yet).
- All visuals are REUSED from the home screen (exact app icons/colours from `home.js`
  `BUILTIN_APPS`, status SVGs from `index.html`, theme vars mirrored from `theme.css`).
  Extension files: manifest.json, quill-overlay.js, quill-overlay.css, qh-bg.js (helper
  relay worker), qh-early.js (document_start native-chrome hide), confirm.js.

## 4. HOW DEPLOY / UPDATES WORK (important)
- Push to GitHub `main`. The helper polls every 6h (and ~20s after boot) and pulls
  `helper/helper-manifest.json` (verifies sha256 of each file, py_compiles helper.py,
  atomic swap, rollback on crash).
- **To make an update land after ONE reboot**, bump the `# rev:` line in
  `helper/launch-home.sh` every release — that changes its hash, so the helper restarts
  Chromium and the new extension loads ~20–30s after the next boot. (Without it, extension
  changes need two reboots.)
- **EVERY release gets a NEW emoji** (Marie reads the pill emoji as "which version am I
  on" + proof an update landed). Bump `version.json` (version + different emoji) AND the
  matching `LOCAL_VERSION`/emoji in BOTH `extension/quill-overlay.js` and
  `home-screen/js/home.js`. Emoji history: ⭐3.1 → 🪶4.0 → 📝4.1 → 🎨4.2 → 💤4.3.
- After editing extension/helper files: recompute sha256 and update every entry in
  `helper/helper-manifest.json` (the helper.py top-level sha when helper.py changes; bump
  its `version` only when helper.py changes). Verify with the python hash-check before push.
- raw.githubusercontent caches a few minutes — version.json may lag briefly after a push;
  it's cosmetic and self-resolves (the sha-verified self-update is unaffected).

## 5. LOCAL TESTING (no device needed)
The overlay uses `chrome.storage`/`chrome.runtime`, so test with a stub harness: create a
temporary `extension/_test.html` + `_test-stub.js` (stub `window.chrome`), serve the repo
root (`python3 -m http.server 8082`), load `/extension/_test.html`, and use the preview
tools to screenshot / eval. Test REAL taps via dispatched `pointerdown`+`pointerup`+`click`
(an earlier `.click()`-only test missed a real tap bug). Delete the test files after.

## 6. OPEN / NEXT TASKS (asked for, not yet built)
- **In-overlay Wi-Fi picker** — replace the native Linux `nm-connection-editor` ("looks
  like 1999"). New helper endpoints `/wifi-list` (`nmcli ... dev wifi list`) +
  `/wifi-connect`, plus an overlay UI (user types the password). KEEP the native window as
  a fallback so she's never stuck offline if untested nmcli fails. Untestable from dev.
- **Screen-off picker + optional auto-shutdown** — make the 5-min adjustable (5/10/15/30/
  Never) in settings; add optional "shut down after ~1h idle" (default OFF). Marie approved
  the screen-off; auto-shutdown not yet confirmed.
- **Tiny DPMS tightening** — `/screen-off` does `xset +dpms; xset dpms force off`; reviewer
  noted this leaves X's default DPMS timers active too (benign). Optional: add
  `xset dpms 0 0 0` so only the overlay controls blanking.
- **Hide the desktop-flash during the update-restart** — when the helper restarts Chromium,
  the bare Linux desktop flashes for ~2s. OS-level fix (hide the dock / plain background).
- **Lock down remaining escape hatches** (keyboard shortcuts to the Linux desktop) for a
  fully airtight "its own thing" feel.
- Older asks still open: a "Check for updates now" button (`/check-update` helper endpoint),
  Google Docs recents list.

## 7. HARDWARE RESEARCH (Marie is shopping for a machine)
Full brief: `docs/HARDWARE_REQUIREMENTS.md` (untracked — commit/push if she wants the
researcher to link it). Verified June 2026:
- Needs: Intel/AMD laptop OR Apple-silicon Mac on **Fedora Asahi**. 4GB RAM min, 8GB+ best.
- Apple chips: **M1 ✅, M2 ✅ (both daily-usable). M3 = NOT reliable (no GPU → too slow).
  M4/M5/A18 'MacBook Neo' = ❌.** Best value = used **M1 MacBook Air (8GB)**.
- Surface: Intel clamshells work with the `linux-surface` kernel; Snapdragon/'Copilot+' ❌.
- Avoid the trap: same model name spans chips by year (MacBook Air = M1/M2/M3/M4) — pin the
  YEAR. M3+ MacBooks look identical to M1/M2 but don't work.

## 8. WORKING-STYLE NOTES (from CLAUDE.md / MEMORY.md — follow exactly)
- Marie is non-technical. Short, plain answers. **NEVER** soothing/wellness language.
- REUSE existing assets, never invent icons/colours/UI.
- Never tell her to type terminal commands — deploy via the helper / git push yourself.
- No self-certifying / confidence %. Say "untested on hardware" honestly.
- Every file-touching reply ends with a "Files I changed:" footer.
- "Files I changed" + the emoji rule are non-negotiable.

## 9. KEY GOTCHAS
- Site root redirects to `/home-screen/`, so local apps live at
  `.../quill-haven/home-screen/apps/...` (HOME_BASE in the overlay must include
  `home-screen/`). Getting this wrong = the Files/Writing 404 bug.
- The overlay hides native chrome only AFTER it renders, and removes the hide on error —
  so a glitch can never leave the home screen with no buttons.
- Each update restart can log her out of an app if its login is a session cookie; normal
  use keeps her signed in (persistent `--user-data-dir` profile). Tell her to tick "keep
  me logged in" if offered.
