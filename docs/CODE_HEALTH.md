# Quill Haven — Code Health & Structure

Goal: keep the project clean and easy to change. No one giant file, no big
blobs of code. Still no frameworks and no build step — the browser loads
plain files directly.

## Where the tree lives

**The full file tree + feature breakdown is in [`GAME_PLAN.md`](GAME_PLAN.md).**
This file does NOT duplicate the tree — it would go stale. Go there for
"what file does what".

## Rules of thumb

1. **One job per file.** Structure (HTML), looks (CSS), and behaviour (JS)
   stay apart once a thing is big enough to deserve its own files.
2. **Themes live once.** All skin colours sit in `home-screen/shared/theme.css`.
   Nothing else redefines colours — every screen links this one file.
3. **Apps are data-driven.** Each app is defined ONCE in `BUILTIN_APPS` /
   `DEFAULT_ADDONS` inside `home-screen/js/home.js`. The dock, top bar,
   windows and settings all render from that one list. Don't paste app
   markup anywhere else.
4. **Each built-in app is its own small folder** under `home-screen/apps/`
   (writing/, files/). The home screen opens an app in an `<iframe>`
   pointing at that app's page, so the app stays fully separate from the
   home screen's code.
5. **One shared confirm dialog.** `home-screen/shared/confirm.js`
   (`qhConfirm(...)`) is THE styled popup used everywhere. Don't make
   another. Don't fall back to `window.alert`/`window.confirm`.
6. **Cache versions matter.** When you change a CSS/JS file, bump its
   `?v=N` in every page that links it AND in the iframe `src` in
   `home.js` (otherwise the app window keeps loading the old version).
   Current versions are listed in `HANDOVER_TO_NEW_CHAT.md`.
7. **Keep files small and readable.** If a file grows too big, split it.
   No frameworks, no build step.

## Where we are today (2026-06-22)

Split achieved end-to-end:
- Home screen: `index.html` (structure), `css/home.css` (looks),
  `js/home.js` (behaviour), `shared/theme.css` (skins),
  `shared/confirm.js` (THE popup).
- Apps each have their own folder under `apps/`:
  - `apps/writing/` — index.html + writing.css + writing.js (Notes /
    Projects / Parts / Chapters / Scenes; trash + undo; RTF export).
  - `apps/files/` — index.html + files.css + files.js (Documents /
    Pictures / Downloads / USB / Trash; sub-folders + drag + rename).
- Fonts bundled locally in `home-screen/fonts/` so the OS needs no Wi-Fi
  for type.
- Apps are fully data-driven (one source of truth in `home.js`).

The OS-install half is partially built: written guides + a setup.sh
(Linux) and a setup-windows.ps1 (Windows) live at the repo root and in
`devices/`. A one-step USB image is still to do.

## Deep-dive / full-scan checklist (for a tester or the next AI)

Run all of these and report `✓ pass` / `⚠ minor` / `❌ broken` with
file paths + line numbers for evidence.

### Code hygiene
- [ ] **No duplicate functions in home.js** — `grep -oE "^function [a-zA-Z0-9_]+" home-screen/js/home.js | sort | uniq -d` returns nothing.
- [ ] **No duplicate functions in writing.js / files.js** — same grep on each.
- [ ] **No leftover debug code** — no `console.log`, `debugger`, or `alert` calls in shipped JS.
- [ ] **No leftover `TODO` / `FIXME` / `XXX`** markers in JS, CSS, or HTML (other than in `docs/` and `TODO.md` where they're meant to live).
- [ ] **No orphaned CSS classes** — every class defined in a `.css` file is used in HTML or JS. Spot-check 10 across home.css, writing.css, files.css.
- [ ] **No orphan IDs in HTML** — every `id="..."` is referenced from JS or CSS or has a clear role.
- [ ] **No duplicate IDs** — `grep -h 'id="[^"]\+"' home-screen/index.html home-screen/apps/*/index.html | grep -oE 'id="[^"]+"' | sort | uniq -d` returns nothing.

### One source of truth
- [ ] **Colours only in theme.css.** Grep for hex colours in JS files and other CSS — anything outside theme.css is a finding (icons SVGs aside).
- [ ] **Apps defined once.** Every dock icon, top-bar icon, and Settings app row corresponds to an entry in `BUILTIN_APPS` or the user's add-ons (`qh-addons`). No hardcoded `<button class="dock-icon">` markup for specific apps.
- [ ] **The shared confirm popup.** Search for `window.confirm(` and `window.alert(` — there should be NO calls left (apart from the fallback inside `confirm.js`).

### Persistence keys (everything below survives a reload)
- [ ] `qh-theme`, `qh-night`, `qh-bright`, `qh-mode`, `qh-apps`, `qh-addons`, `qh-order`, `qh-clip`, `qh-bg`, `qh-bg-fit`, `qh-bg-dim`, `qh-tz`, `qh-drive`.
- [ ] `qh-writing2` (writing app state: notes, projects, parts, chapters, scenes, trash, sel, open, tab, collapsed).
- [ ] `qh-files` (documents, pictures, folders.{documents,pictures}, trash).
- [ ] No code path silently wipes any of these.

### Cache versions (bump-on-every-change discipline)
- [ ] `home-screen/index.html`: `theme.css?v=`, `home.css?v=`, `confirm.js?v=`, `home.js?v=` — all match the latest content.
- [ ] `home-screen/js/home.js` iframe srcs: `apps/writing/index.html?v=`, `apps/files/index.html?v=` — match the writing / files pages' own latest.
- [ ] `apps/writing/index.html` and `apps/files/index.html`: theme.css, their own css/js, confirm.js — all bumped to current.

### Behaviour (smoke test)
- [ ] Boot splash fades cleanly (don't get stuck at <100%).
- [ ] Loading bar tracks REAL progress — not a fixed 3.6s animation. Confirm it doesn't hit 100% before `window load` fired (no internet inspector required — just `getComputedStyle` of `.boot-loader-fill` over the first 2 seconds).
- [ ] Live Wi-Fi: `topWifi` opacity drops + `wifiSub` says "Offline" when you toggle `navigator.onLine` off in dev tools.
- [ ] Live battery: `topBatteryFill` width matches `navigator.getBattery().level * 15`.
- [ ] Region/timezone picker: changing the value in Settings updates the clock immediately.
- [ ] Add App refuses obvious distraction domains (facebook.com, youtube.com, gmail.com, etc.) with a friendly popup.
- [ ] Writing app: `+` on a project opens Chapter / Part menu; Parts create a `Project → Part → Chapter → Scene` level.
- [ ] Writing app: deleting anything (note / project / part / chapter / scene) moves it to `data.trash`, shows an undo toast, and the Trash tab appears.
- [ ] Writing app: undo restores to original location; if the original container is gone (orphan), the item becomes a Note.
- [ ] Writing app: Download → "This device" downloads an `.rtf`, AND saves a copy into Files → Documents.
- [ ] Writing app: Download → "Google Drive" shows the honest "Connect Drive first" popup (doesn't pretend to save).
- [ ] Files app: "+ New folder" tile creates a folder with inline rename; drag a file card onto a folder card to move it in; click folder to navigate in; back tile returns to root.
- [ ] Files app: folder delete soft-trashes the folder; files inside become root-level orphans until restore.
- [ ] Backgrounds: photo from Files → set as background in Settings; persists; Dim slider works; top bar / dock go solid over a photo so icons stay visible.

### Look / feel
- [ ] All four skins (Purple / Wood / Slate / Dark) work end-to-end — toggle each from Settings and verify the writing app and files app pick up the same skin via `qh-theme` storage event.
- [ ] No tab/window jank — switching tabs in the writing app doesn't flash.
- [ ] Empty states have a sentence of plain-English guidance (no blank panels).

### Boundary checks
- [ ] No network calls leave the page except: the GitHub `version.json` update check, and the writing apps the user explicitly opens (Google Docs, Dabble, Typing & Tomes, custom add-ons). Confirm with a quick scan for `fetch(`, `XMLHttpRequest`, `<img src="http`, `<link href="http`, `@import`.
- [ ] Fonts are loaded from `home-screen/fonts/` — no Google Fonts CDN link anywhere.
- [ ] No frameworks, no build step. `index.html` references only relative `home-screen/` paths.

## What this doc is NOT

- It's not the source of truth for what exists (that's `GAME_PLAN.md`).
- It's not the to-do list (that's `TODO.md`).
- It's not the bootstrap for a new AI chat (that's `HANDOVER_TO_NEW_CHAT.md`).
- It's not the full assessment prompt (that's `AI_ASSESSMENT_PROMPT.md`).
