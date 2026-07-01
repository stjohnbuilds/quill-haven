# Ghost-Code & Duplication Scan Report — Quill Haven 2.0 One-Shell Rebuild

*A checklist for verifying a clean wipe-and-rebuild. Hand this to another AI; the "How to verify" section at the bottom is the part it should run.*

---

## (a) The problem, in three sentences

Quill Haven's "shell" — the top bar, the app dock, the brightness dimmer and the settings popup — is currently **built twice**: once as the native home screen, and again inside the browser extension that floats over Google Docs. Because the two copies are written by hand in separate files, they have already **drifted apart** (different translucency, different version emoji, one bar has an update button the other lacks), which is exactly why colours shift and apps sometimes go missing. The fix is to build the shell **once** in the extension and show it on every page, so there is only ever one of everything.

> **Read this first — there are TWO repos and it matters.**
> - The **rebuild** lives in `/Users/mariemackay/Dev/quill-haven-2/` — this is the clean tree you keep and finish.
> - The **old build** lives in `/Users/mariemackay/Dev/QuillHaven/` — this is where every ghost file actually sits.
>
> *Verified:* `quill-haven-2/extension/` contains only `content.js, background.js, manifest.json, shell.css, README.md` (no ghosts). `QuillHaven/extension/` still contains `quill-overlay.js, quill-overlay.css, qh-bg.js, qh-early.js, confirm.js, icon-128.png, icon-48.png`.
> **Do not run a "delete ghosts" instruction against `quill-haven-2` — there is nothing to delete there. Delete in `QuillHaven`. Do the consolidation work in `quill-haven-2`.**

---

## (b) Duplication table

Every row is the *same feature authored twice*. "Where it lives now" cites the rebuild repo `quill-haven-2` unless noted.

| Feature | Where it lives now | Bug it causes | Where it should live |
|---|---|---|---|
| **Whole shell scaffold** (bar + dock + settings) | `home-screen/index.html:21-77` + `home-screen/css/home.css` **and** `extension/content.js:113-152` + `extension/shell.css` | Authored twice; any icon/button change must be made in both or they diverge — the root problem | ONE shell in `extension/content.js` shadow root, rendered on every page incl. home |
| **Clock / time tick** | `home-screen/js/home.js:144-161` (`#tbTime`) **and** `content.js:50-51,218-232` (`.qh-time`) | Two identical `Intl` date formatters, two 10s intervals | One `tick()` in the single shell |
| **Battery** (fill + bolt + tooltip) | `home.js:164-182` **and** `content.js:235-253` | Identical `getBattery()` duplicated; two subscriptions | One `initBattery()` in the single shell |
| **Wi-Fi indicator** | `home.js:185-189,274` **and** `content.js:256-261,321` | Same `navigator.onLine` listeners written twice | One `syncWifi()` in the single shell |
| **Theme switcher** | `home.js:192-210` (class on `<html>`) **and** `content.js:25,157-209` (class on shadow host) | THEMES array in two files; edit one and the floating shell turns a different colour — **the colour-shift bug** | One THEMES list + one `applyTheme` in the single shell |
| **Brightness** | `home.js:213,277` (`#screen-filter`) **and** `content.js:162,276-277` (`.qh-screen-filter`) | Same opacity formula in two functions, two elements | One `setBrightness` + one filter element |
| **Night Light** | `home.js:214-221` **and** `content.js:163-164` | Warm-overlay logic duplicated on two filters | One night-light path on the one filter |
| **Screen-filter element** | `index.html:15` (`#screen-filter`) **and** `content.js:115` (`.qh-screen-filter`) | Two separate dimming overlays that can show different brightness | One filter inside the single shadow root |
| **Settings popup** | `index.html:51-77` + `home.css` **and** `content.js:125-149` + `shell.css` | Same form built/styled in two places with different IDs | One settings popup in the single shell |
| **Region / timezone selector** | `index.html:67` + `home.js:280` **and** `content.js:137-139,280-281` | Same five `<option>`s in two files | One region select in the single shell |
| **App dock / launcher** | `home.js:62-88` (reads `localStorage`) **and** `content.js:168-191` (reads `chrome.storage`) | Two stores; if the bridge hasn't run, the floating panel shows **NO apps** — the apps-missing bug | One `renderApps()` reading the one `chrome.storage` list |
| **Power/Wi-Fi/sleep/restart/poweroff actions** | `home.js:226-229,301-309` (POSTs helper directly) **and** `content.js:82-85,282-290` + `background.js:19-30` (relays via worker) | Same five actions on both surfaces; two code paths | One action layer relaying through `background.js` |
| **SVG icon set** | `index.html:23-37` **and** `content.js:88-95` | Identical icons stored twice | One icon object in the single shell |
| **Design tokens / palette** | `theme.css:26-73` **and** `shell.css:14-51` | **Already drifted today** (see below) | One token source |
| **Utilities** (`esc`,`pad`,`$`,`$$`) | `home.js:19-20,146` **and** `content.js:53-58,154-155` | Near-identical helpers duplicated | One set in the single shell |
| **Escape-to-close handling** | `home.js:299` **and** `content.js:296` | Two keydown listeners doing the same thing | One Escape handler |
| **Two-store state + bridge** | `home.js:36-52` (`localStorage` + `syncBridge` + `qh-synced`) **and** `content.js:30-48,60-81,300-312` (`mirrorHome` → `chrome.storage`) | Dual-master design: settings can mismatch between home and the in-Docs shell | **ONE store: `chrome.storage` only.** Delete the bridge |

> **Correction from earlier:** an earlier claim said `qh-apps-full` was never written. That is **false** — `home.js:50-51` does write it and fire `qh-synced`. The real problem is the dual-master design, not a missing key. Fix is still "collapse to one store."

### Critic's extra duplication findings

| Finding | Detail | Action |
|---|---|---|
| **Tokens have ALREADY drifted (live bug)** | `theme.css --bar-bg` = `rgba(255,255,255,0.40)` vs `shell.css` = `0.55`; dark `--bar-bg` `0.65` vs `0.72`; etc. The floating bar is **already** a different translucency than the home bar. | Fix now, one token source |
| **Extension bar MISSING the version emoji + update UI** | Home bar has `#verEmoji` + update overlay; extension bar has wifi/battery/power/settings/time only. The bars are **not** "identical." | Consolidating means **adding** the GitHub version-check into `content.js` which runs on **every page** — new work |

---

## (c) Ghost files

All in the **OLD `QuillHaven` repo**, plus copies on the device. *Verified: helper-manifest v1.7 delivers only `manifest.json, content.js, background.js, shell.css, launch-home.sh`.*

| Path | Why it's a ghost | Action |
|---|---|---|
| `QuillHaven/extension/quill-overlay.js` (42 KB) | Old ~4.9 overlay, not referenced anywhere | Delete |
| `QuillHaven/extension/quill-overlay.css` (12 KB) | Old overlay styles, unreferenced | Delete |
| `QuillHaven/extension/qh-bg.js` | Old background worker, superseded | Delete |
| `QuillHaven/extension/qh-early.js` | Old hide script, unreferenced | Delete |
| `QuillHaven/extension/confirm.js` | Old confirm dialog, unreferenced | Delete |
| `QuillHaven/extension/icon-128.png`, `icon-48.png` | `manifest.json` has no `icons` field | Delete |
| `quill-haven-2/extension/README.md` *(critic find)* | Stray in active folder, not delivered | Delete or move |

**On-device leftovers** (old v1.6 manifest delivered these; v1.7 never cleans them):
`$HOME/.local/share/quill-haven/extension/{quill-overlay.js, quill-overlay.css, qh-bg.js, qh-early.js, confirm.js, icon-*.png}` → delete during redeploy.

> *(critic) `home-screen/shared/confirm.js` does NOT exist in the rebuild repo — that was a cross-repo mix-up. Nothing to delete there.*

---

## (d) KEEP (do not rewrite)

- `quill-haven-2/home-screen/css/theme.css` — the look tokens; becomes the ONE token source.
- `quill-haven-2/home-screen/data/apps.js` — the built-in app registry; clean single source.
- `quill-haven-2/extension/background.js` — helper relay + lockdown logic; sound, single-instance.
- `QuillHaven/helper/helper.py` + `helper-manifest.json` — device delivery + gated update; solid.
- `quill-haven-2/home-screen/js/home.js` version/update block (lines 10-17, 232-267) — correct logic; **lift it**, don't re-author. *(But fix the live emoji bug below.)*
- `QuillHaven/helper/launch-home.sh` — kiosk launcher; keep.

---

## (e) WIPE (gut / rebuild — all in `quill-haven-2`)

- `home-screen/index.html` — strip to wallpaper + logo only; keep `data-qh-home` dropped so the shell renders here too.
- `home-screen/js/home.js` — **delete**; all shell logic moves into the single content-script shell.
- `home-screen/css/home.css` — **delete**; bar/dock/settings styling rebuilt once in `shell.css`.
- `extension/content.js` — keep as the home of the ONE shell but **rewrite** (remove `data-qh-home` early-return + `mirrorHome`; read `chrome.storage` directly).
- `extension/shell.css` — keep as the ONE stylesheet but **absorb the tokens from `theme.css`**.

---

## (f) Device cleanup

`$HOME/.local/share/quill-haven/extension/{quill-overlay.js, quill-overlay.css, qh-bg.js, qh-early.js, confirm.js, icon-*.png}`; the Chromium extension cache for the old shell; old `localStorage` keys (`qh-apps`, `qh-apps-full`, `qh-theme`, `qh-brightness`, `qh-night`, `qh-tz`) so the device starts clean on the `chrome.storage`-only store.

---

## (g) The clean target

ONE shell, authored once in `extension/content.js`, rendered identically on every page (home and inside Docs/Dabble). In a single shadow root: one top bar (Wi-Fi, battery, power, settings, version emoji, clock), one app dock, one screen-filter for brightness + night light, one settings popup (Look / Connection / Power) + version/update UI. One of each control and one of each logic routine. All state in ONE store — `chrome.storage` — read/written directly on every page; `localStorage`, `syncBridge()`, `mirrorHome()`, `qh-synced` are gone. Tokens in one place (`shell.css :host`). Apps from the one `data/apps.js`. Lockdown + update logic in `background.js`/helper unchanged. The home page is a pure wallpaper + logo backdrop. All old overlay files + unused icons gone from repo and device.

### Open risks "done right" must also resolve (do not skip)

1. **LIVE emoji/version slip — fix before any release.** `quill-haven-2/version.json` = **2.0.1 🌱** but `home.js LOCAL` = **2.0.0 🌱** — so an update flags with **no emoji change**, breaking the "every release = new emoji" proof rule. Align versions or pick a new emoji.
2. **Helper-lock secret.** When the helper lock is turned on, the single relay through `background.js` must carry the secret or every power/wifi/update button breaks.
3. **Screen-filter stacking.** One filter in the shadow root at max z-index could tint Google Docs content. Confirm the dim looks right on a real Docs page.
4. **Delete before render.** Drop the `data-qh-home` early-return ONLY when `home.js`/`index.html` shell code is deleted in the same pass — else the home page double-renders (two bars, two clocks, two listeners).

---

## (h) How another AI verifies there's no ghost left

Run from `/Users/mariemackay/Dev/quill-haven-2/` unless noted. Each should give the stated result; anything else = a ghost survived.

**Ghost files gone**
1. `ls quill-haven-2/extension/` → only `manifest.json content.js background.js shell.css`. No `quill-overlay.*`, `qh-bg.js`, `qh-early.js`, `confirm.js`, `icon-*.png`.
2. `ls /Users/mariemackay/Dev/QuillHaven/extension/` → the seven old files deleted.
3. `ls $HOME/.local/share/quill-haven/extension/` (device) → no old overlay files.
4. `grep -rn "quill-overlay\|qh-bg\|qh-early\|confirm.js" quill-haven-2/` → no hits.

**Shell exists exactly once**
5. `grep -rln "topbar\|class=.dock\|settings-overlay" quill-haven-2/home-screen/` → no hits (home page has no bar/dock/settings).
6. `ls quill-haven-2/home-screen/js/` → no `home.js`.
7. `ls quill-haven-2/home-screen/css/` → no `home.css` (only a small wallpaper stylesheet, if any).
8. `grep -rn "screen-filter\|qh-screen-filter" quill-haven-2/` → matches in `content.js`/`shell.css` only. One filter element total.
9. `grep -rn "getBattery" quill-haven-2/` → one match. Same one-hit rule for the clock tick, `syncWifi`, `buildThemeDots`, `setBrightness`, `gradOf`.

**One store, no bridge**
10. `grep -rn "localStorage\|syncBridge\|mirrorHome\|qh-synced" quill-haven-2/` → no hits.
11. `grep -rn "THEMES" quill-haven-2/` → defined in one file.

**Tokens in one place**
12. `grep -n "bar-bg\|bar-border\|panel-bg" quill-haven-2/extension/shell.css quill-haven-2/home-screen/css/theme.css` → bar/panel values in one file; any value in both matches exactly (no `0.40` vs `0.55`).

**Version + emoji honesty**
13. version numbers agree, OR if they differ the emoji also differs. Never "different version, same emoji."

**Double-render guard**
14. With the extension loaded, open the home screen: exactly one top bar, one clock. Two of anything = shell code wasn't deleted before the early-return was dropped.

**No bar missing its parts**
15. The single bar renders the version emoji + update UI on every page (absent from the old `content.js`). Check it appears inside Google Docs too.
