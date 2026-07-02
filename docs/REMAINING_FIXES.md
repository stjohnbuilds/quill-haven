> ⚠️ **SUPERSEDED / HISTORY (pre-rebuild, 1.x).** Do NOT follow this doc. Its ground
> rules are now WRONG and dangerous: the device runs the 2.x app from `quill-haven-2`,
> updates are gated on Marie's tap (never "push to main and it applies"), and
> `tools/release.sh` is stale/crashes. The live fix list is **`FIX_CHECKLIST.md`** and
> the current process is in **`CLAUDE.md`**. Kept only for history.

# Quill Haven — Remaining Fixes (handoff work-order)

**Purpose.** A detailed, self-contained to-do so another AI or developer (e.g.
DeepSeek) can pick up and fix every outstanding issue without this conversation.
Each item says: what's wrong, exactly where, how to fix it step by step, and how
to verify. Work **top to bottom** — it's ordered most-important first.

## Ground rules (do not break these)
- **Marie is non-technical.** Never ask her to type terminal commands. You make
  the changes and `git push` to `main` yourself (the device pulls from `main`).
- **Every release gets a NEW emoji.** Use `tools/release.sh` (see bottom) — it
  bumps the version + a fresh emoji in ALL places and recomputes hashes. Never
  hand-edit one version location and forget the others (that caused real bugs).
- **No self-certifying.** Say what you tested vs reasoned. No confidence %.
- **End every file-touching reply with a "Files I changed:" footer.**
- After editing any `extension/*` or `helper/launch-home.sh` file, update its
  `sha256` in `helper/helper-manifest.json` and bump the `# rev:` line in
  `helper/launch-home.sh` (so the device relaunches Chromium). `release.sh` does
  this for you.
- Verify on the device by reboot: the pill emoji changing = the update landed.

## How updates reach the device (so your fix actually ships)
- **Home screen** (`home-screen/*`): served live from GitHub Pages. The service
  worker is now network-first, so a push shows up after a reboot (maybe two).
- **Overlay** (`extension/*`) + **launcher** (`helper/launch-home.sh`): pulled by
  the helper's self-updater, which compares each file's sha256 in
  `helper/helper-manifest.json`. Update those hashes or the device won't pull.
- **Helper code** (`helper/helper.py`): top-level `sha256` + `version` in
  `helper-manifest.json` (use `tools/release-helper.sh`).
- **System files / Chromium policy** (`helper/quill-haven-policy.json`): pushed
  via `helper/device-manifest.json` (bump its `version` + the sha256).

---

# HIGH — do before it goes on more laptops

## FIX-1 — Writing has no automatic backup (data-loss risk) ⚠️ biggest real risk
**Problem.** The local writing pad stores everything in `localStorage`
(`qh-writing2`) on one device. Drive auto-backup is OFF until an OAuth client ID
is set up. A profile wipe / reinstall loses the novel with no warning.
**Where.** `home-screen/js/home.js` (~953, ~995, `qh-drive-autobackup`);
`home-screen/apps/writing/writing.js` (autosave/persist).
**Fix (pick both a safety net AND a warning):**
1. Add a **local auto-export**: on every save (debounced ~30s) also write a
   timestamped `.json` backup into the Files app's Documents area and, if a USB
   handle exists, to the USB. This gives an on-device second copy with zero setup.
2. Add a **first-run prompt** (and a persistent banner in Settings) that says
   "Your writing is only on this device. Turn on Drive backup" with a one-tap
   path to `docs/DRIVE_SETUP.md`. Don't let it be silently off.
3. **Warn before any destructive reset** (restore/wipe) with the shared
   `qhConfirm`, showing what will be lost.
**Verify.** Type in the pad, trigger a save, confirm a fresh backup file appears
in Documents (and on USB if connected). Reload — data intact.
**Done when.** There is always a second copy without the user doing anything,
and no reset path destroys data without a confirm.

## FIX-2 — "No buttons" trap: a non-running overlay strands the user (QH-3)
**Problem.** `extension/qh-early.js` hides the native top-bar/dock at page start
and has **no timer to undo it**. If the overlay script never runs (parse error,
the `if (window.__qhOverlay) return` guard, a crash before its try/catch), the
native UI stays hidden forever → a kiosk with no apps, power, or wifi.
**Where.** `extension/qh-early.js` (whole file); recovery currently only in
`extension/quill-overlay.js:~572-576` (a `catch`).
**Fix.**
1. In `qh-early.js`, after adding the `#qh-early-hide` style, set a
   `setTimeout(~4000ms)` that REMOVES the hide style.
2. When the overlay successfully renders (`quill-overlay.js`), clear that timer
   / set a flag (e.g. `window.__qhOverlayUp = true`) so the hide stays only when
   the overlay is actually up. Have the timeout check the flag before removing.
3. Net effect: overlay up within 4s → native UI stays hidden (overlay covers it).
   Overlay never comes up → native buttons come back, user is never stranded.
**Verify.** Temporarily break the overlay (rename `quill-overlay.js` in a local
copy) and confirm the home screen's own buttons reappear after ~4s.
**Done when.** No code path can leave the screen with no buttons.

## FIX-3 — Helper API has no authentication (shell-escape back door) (QH-1)
**Problem.** `helper/helper.py` serves `127.0.0.1:8137` with NO auth. Any local
process or stray page can POST `/poweroff`, `/reboot`, `/go-home`, `/terminal`.
`/terminal` spawns a real terminal — a full shell escape from a "locked" OS. The
`Access-Control-Allow-Origin` header only controls reading the reply; the side
effect already happened.
**Where.** `helper/helper.py:~185-264` (handlers), `:186-190` (CORS),
`:239-243` (`/terminal`). Caller: `extension/qh-bg.js` (the relay).
**Fix.**
1. `setup.sh`: generate a random per-install token, write it to
   `~/.local/share/quill-haven/helper-token` (mode 600).
2. `helper.py`: on every POST (and sensitive GET), require a header
   `X-QH-Token: <token>`; 403 if missing/wrong. Read the token from the same file.
3. The overlay relay (`qh-bg.js`) reads the token (the extension can fetch it
   from the helper via a localhost handshake that itself requires being
   same-origin, or setup.sh writes it where the extension can read) and adds the
   header. Requiring a custom header also forces a CORS preflight, blocking
   no-cors drive-by POSTs.
4. Keep it bound to `127.0.0.1` only (already is).
**Verify.** `curl -X POST http://127.0.0.1:8137/terminal` returns 403; the
overlay's buttons still work.
**Done when.** Unauthenticated POSTs are rejected; the overlay still functions.

## FIX-4 — Root file-writer can write anywhere (QH-2)
**Problem.** `helper/qh-admin.sh` runs as passwordless root and does
`cp "$src" "$dest"; chmod "$mode" "$dest"` with NO allowlist of destinations.
`device-manifest.json` (fetched from GitHub) supplies `dest`. The sha256 check is
self-referential (same manifest gives file + hash), so it can't detect a changed
manifest. Repo/MITM compromise = write any root file anywhere (RCE).
**Where.** `helper/qh-admin.sh:~17-21`; `helper/helper.py:~131,147-159,166`;
`setup.sh` (the `NOPASSWD: /usr/local/bin/qh-admin` line).
**Fix.**
1. In `qh-admin.sh`, hardcode an allowlist of permitted `dest` prefixes (today
   only `/etc/chromium/policies/managed/` and `/etc/chromium-browser/policies/managed/`).
   Reject (exit non-zero, log) any `dest` outside it.
2. Optional hardening: verify the manifest against a committed public key.
**Verify.** A manifest entry targeting `/etc/sudoers.d/x` is refused; the normal
policy push to the two allowed paths still works.
**Done when.** `qh-admin` can only write the allowlisted paths.

---

# MEDIUM

## FIX-5 — Power-off button sometimes does nothing
**Problem.** The pill's power/poweroff goes through the MV3 background relay
(`chrome.runtime.sendMessage` → `qh-bg.js` → helper). The service worker can be
asleep, so the first tap is dropped.
**Where.** `extension/quill-overlay.js:~113-123` (`helperAction`),
`extension/qh-bg.js` (relay).
**Fix.** Make `helperAction` wake-and-retry: if `sendMessage` returns no
response / errors (`chrome.runtime.lastError`), wait ~150ms and retry up to ~3x.
Optionally have `qh-bg.js` use a keep-alive. Confirm the helper replies before
treating it as done.
**Verify.** Cold-load a page (worker asleep), tap power, confirm it fires first
try.
**Done when.** Power/restart/home fire reliably on the first tap.

## FIX-6 — Clean shutdown (hide the scary "[FAILED] Failed to…" flash)
**Problem.** On power-off, raw systemd shutdown text flashes (looks broken).
**Where.** Linux boot config, not web code. `setup.sh` (GRUB + plymouth).
**Fix.**
1. In `setup.sh`, install `plymouth` + a theme, and add `quiet splash` (and
   `loglevel=3 rd.systemd.show_status=false vt.global_cursor_default=0`) to
   `GRUB_CMDLINE_LINUX_DEFAULT` in `/etc/default/grub`, then `update-grub`.
2. Because this needs `update-grub` (which `qh-admin` can't run), apply it in
   `setup.sh` (runs on install) — existing devices need a one-line re-run OR add
   a tiny helper endpoint that runs it once. Keep a fallback so a bad cmdline
   never blocks boot.
**Verify.** Shut down — a clean splash, no red failure text.
**Done when.** No raw shutdown text is visible to the user.

## FIX-7 — Battery "time left" (≈ Xh) readout
**Problem.** Marie wants an estimate like "~4h" by the battery.
**Where.** `helper/helper.py` (new endpoint), `extension/quill-overlay.js` (pill
battery area ~153), `home-screen/js/home.js` (top-bar battery, optional).
**Fix.**
1. Add helper `GET /battery` returning percent + status + minutes-to-empty,
   read from `upower -i $(upower -e | grep BAT)` or
   `/sys/class/power_supply/BAT*/` (`energy_now`/`power_now`, or `time_to_empty`).
2. Overlay polls it (every ~60s) and shows "~Xh" next to the battery icon; hide
   the estimate while charging.
**Verify.** On the device, the pill shows a sane "~Xh" that drops over time.
**Done when.** A trustworthy time-left shows on battery.

## FIX-8 — Simple built-in Wi-Fi picker
**Problem.** Adding Wi-Fi uses the native `nm-connection-editor` ("looks like
1999"). Marie wants: see networks → tap → type password → done.
**Where.** `helper/helper.py` (new endpoints), `extension/quill-overlay.js` (UI).
**Fix.**
1. Helper `GET /wifi-list` → `nmcli -t -f SSID,SIGNAL,SECURITY dev wifi list`
   (parse, dedupe, sort by signal). Helper `POST /wifi-connect` with `{ssid,
   password}` → `nmcli dev wifi connect "$ssid" password "$password"`.
2. Overlay: a small panel listing networks (name + signal + lock), tap one →
   password field → Connect → show connecting/connected/failed.
3. **Keep the native window as a fallback** button so she's never stuck offline
   if `nmcli` misbehaves. Untestable off-device — guard everything.
**Verify.** On device: list shows real networks; connecting works; fallback opens.
**Done when.** She can join Wi-Fi from the overlay without the native editor.

## FIX-9 — One app list (kill the duplication + the add-app lag) (QH-5/8/7)
**Problem.** The built-in app list is written twice — `home.js` `BUILTIN_APPS`
(~241-251) and a hand-copy in `quill-overlay.js` (~31-41) — and already drifted.
Added apps reach the overlay's switcher only via `bridgeHome()` which runs only
at overlay init / timezone change, so a new app needs ~2 home reloads to appear.
**Where.** `home-screen/js/home.js:241-256, 606-608 (addApp)`;
`extension/quill-overlay.js:31-41, 470-484, 554-556`.
**Fix (single source of truth).**
1. Have the home screen write its FULL list (built-ins + add-ons + order +
   visibility) into `chrome.storage.local` whenever it changes — call
   `bridgeHome()` (or a direct write) from `addApp`, `removeApp`, `saveOrder`,
   and visibility toggles.
2. Delete the overlay's hard-copy `BUILTIN_APPS`; the overlay reads the whole
   list from `chrome.storage.local` only.
3. Add a `chrome.storage.onChanged` listener in the overlay that rebuilds the
   switcher live — no reload needed.
4. (Related QH-7) Generate the three extension file-lists (`manifest.json`,
   `setup.sh`, `helper-manifest.json`) from one source, or add a check script
   that fails if they diverge.
**Verify.** Add an app on the home screen → it appears in the bottom-right
switcher immediately, on the home page and inside an app.
**Done when.** The app list exists in exactly one place and updates everywhere live.

## FIX-10 — Hard restart can lose ~½ second of unsaved typing (QH-4)
**Problem.** Update / `/go-home` do `pkill -x chromium` (not graceful). Text
typed since the last 500ms autosave is lost.
**Where.** `helper/helper.py:~122-123` (extras update), `:~234-238` (`/go-home`).
**Fix.** Before `pkill`, ask pages to flush (e.g. POST a "flush" the overlay
listens for, or send SIGTERM and wait briefly for a clean close) so autosave
runs first. Then kill.
**Verify.** Type, trigger go-home, reopen — the last words are still there.
**Done when.** A normal restart never drops recent keystrokes.

---

# LOW

## FIX-11 — No automated tests (QH-11)
Add smoke tests for the riskiest logic: save/restore (`writing.js`/`files.js`),
the app-list sync, and the helper self-updater hash/compile path. Even a few
Node/browser test stubs beat zero.

## FIX-12 — `setBg` silently swallows a full-storage error (QH-9)
`home-screen/js/home.js:~178-181` catches `QuotaExceededError` with no feedback.
Mirror the writing/files `persist()` pattern: surface a "not enough room" popup.

## FIX-13 — Docs vs code: default apps disagree
`CLAUDE.md` says Google Docs, Dabble, Typing & Tomes ship by default, but
`home.js` seeds only Docs + Local Writing + Files (`DEFAULT_ADDONS = []`,
~256). Either seed Dabble + Typing & Tomes as default add-ons, or fix the docs.
(This is why Dabble had to be added by hand.)

---

# Already done (2026-06-24) — do not redo
- Site lock → 20-site distraction **blocklist** (Dabble + normal sites work).
- **Service worker → network-first** (was cache-first/stale → "no update" bug).
- setup.sh fetches **all 8 overlay files**; battery tuning; Surface touch driver.
- **Pill full length** (no resize); **round grip dots**; **load bar removed**.
- **Dino boot root fix** — launcher waits for connectivity before loading.
- Emoji history so far: ⭐3.1 → 🪶4.0 → 📝4.1 → 🎨4.2 → 💤4.3 → ✒️4.4 → 📖4.5.

# Releasing (built-in emoji rule)
Run **`tools/release.sh`** (see the file). It auto-picks the NEXT unused emoji,
writes the version + emoji into `version.json`, `extension/quill-overlay.js`,
`home-screen/js/home.js`, `home-screen/service-worker.js`, and
`extension/manifest.json`, bumps the launcher rev, and recomputes every
`helper-manifest.json` hash. Then commit + push. This is how "every update gets a
new emoji" is enforced — don't hand-bump versions.
