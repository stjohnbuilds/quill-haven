# HANDOVER — Quill Haven (current as of 2026-06-27)

There is only ONE handover file — this one. The next AI: read the copy-paste block below,
then the files in section 3, and change nothing until you have.

## 📋 COPY-PASTE THIS into a fresh Claude Code chat

> You're picking up **Quill Haven** — a writing-only Linux OS for **Marie**, who is
> **non-technical**. Talk plainly and short, no jargon, **NO wellness/"take a breath"
> language**. Never say something "works" until it has run on her **real laptop** (the preview
> is a mock — it proves layout/look, not device behaviour). End any reply that touches files
> with a **"Files I changed:"** footer. **Push only when she asks.** Every release gets a
> **new emoji** (her proof an update landed).
>
> Two repos: **build** in `quill-haven-2` (`/Users/mariemackay/Dev/quill-haven-2`, github
> `stjohnbuilds/quill-haven-2`, GitHub Pages ON) — **deliver** via `QuillHaven`
> (`/Users/mariemackay/Dev/QuillHaven`, github `stjohnbuilds/quill-haven`). **Live now: 2.3.15
> 🐧, helper 1.10.** App ≈ 1129 lines across 7 files.
>
> **THE KEYSTONE FIX (do not undo):** the long-standing "buttons / updates do nothing" bug was
> a **frozen cached MV3 service worker** — Chromium kept reloading an old `background.js` whose
> relay rejected `/apply-update` etc. as `not-allowed`. The launcher (`helper/launch-home.sh`)
> now **deletes the profile's `Service Worker` + `Code Cache` on every Chromium launch**, so the
> worker always recompiles from disk. Because of this, **updates are now HANDS-FREE** (the
> in-app Update button works). Also: `helper.py` `_cors()` reflects the caller's Origin (it
> bound to 127.0.0.1 only) — don't revert it; `window.confirm`/`prompt` are blocked in kiosk —
> never use them (use the in-app confirm).
>
> Read in order, change nothing first:
> 1. /Users/mariemackay/Dev/QuillHaven/HANDOVER.md (this file)
> 2. /Users/mariemackay/Dev/QuillHaven/CLAUDE.md
> 3. /Users/mariemackay/.claude/projects/-Users-mariemackay-Dev-QuillHaven/memory/MEMORY.md
> 4. /Users/mariemackay/Dev/quill-haven-2/STRUCTURE.md  (the one-place-for-everything law)
> 5. /Users/mariemackay/Dev/quill-haven-2/PUNCHLIST.md  +  /Users/mariemackay/Dev/quill-haven-2/AUDIT_PROMPT.md
>
> To ship a version: in `quill-haven-2` bump `version.json` + `LOCAL` in `extension/content.js`
> + `extension/manifest.json` to a NEW number AND a NEW emoji; commit + push. Copy the changed
> `extension/*` into `QuillHaven/extension/`, recompute their sha256 in
> `QuillHaven/helper/helper-manifest.json` extras, commit + push **only the touched files**
> (this repo has unrelated edits — never `git add -A`). CDN-verify the raw bytes + Pages
> `version.json` are live, THEN Marie taps Update. If you edit `helper.py`, run
> `tools/release-helper.sh <ver>` FIRST (brick risk). **Lockdown is OFF on purpose.**

---

## 1. WHO IS THE USER
**Marie. Non-coder.** Talk like she's 10 — plain English, short (2–4 sentences), no jargon, no
code/hashes in chat. **Banned: ALL wellness/therapy language** ("breathe", "calm down", "I
understand this is frustrating", "don't worry"). When she's annoyed, just fix it — no comfort.
She cannot copy-paste on the device; every TTY command is hand-typed and error-prone — keep
them to ONE short line. She is very sensitive to **code bloat** — justify every added line and
trim genuine fat.

## 2. HARD RULES (these have bitten before)
- **Never say it "works" until it ran on her laptop.** Preview/mock = "code reads right". Only
  she confirms the device half.
- **"Files I changed:" footer** on every reply that touches files (the Stop-hook output is
  swallowed; the footer is how she sees changes).
- **No confidence %, no self-certifying** (a Stop-hook blocks "X% sure" etc.). Say "fully
  checked" / "code reads right, not run on device" / "didn't test".
- **No duplicate components** — one of everything (see STRUCTURE.md). **Plain English always.**
- **Push only when asked.** Never `git add -A` in `QuillHaven` (it carries unrelated edits).
- **Every release = a NEW emoji** (her proof it landed).
- **`window.confirm` / `window.prompt` are silently blocked in Chromium --kiosk** — never use
  them; use the in-app confirm (`askConfirm` in content.js).
- **A bad `helper.py` can BRICK the device** (recoverable only by hand at the TTY). Keep helper
  changes on-demand only (nothing new at startup), `py_compile` first, run
  `tools/release-helper.sh` before `release.sh`/the manual hash step.
- **Never bump/byte-change `home-screen/service-worker.js`** — it's pinned cache-first on purpose.

## 3. READ THESE FILES (IN ORDER)
1. `/Users/mariemackay/Dev/QuillHaven/HANDOVER.md` (this)
2. `/Users/mariemackay/Dev/QuillHaven/CLAUDE.md`
3. `/Users/mariemackay/.claude/projects/-Users-mariemackay-Dev-QuillHaven/memory/MEMORY.md`
4. `/Users/mariemackay/Dev/quill-haven-2/STRUCTURE.md` (the law: one place for everything)
5. `/Users/mariemackay/Dev/quill-haven-2/PUNCHLIST.md` (live to-dos)
6. `/Users/mariemackay/Dev/quill-haven-2/AUDIT_PROMPT.md` (paste-into-fresh-AI dead-code audit)

## 4. BROAD VISION
Quill Haven is a custom Linux OS that turns any Linux-capable computer (Windows laptop, Mac,
Chromebook, Pi) into a **writing-only** machine — it boots straight into a clean home screen
with only the writing apps (ships with Google Docs; user adds others like Dabble). The OS is
the product. It matters because it removes every distraction for a writer who wants a machine
that does one thing. It is NOT a tablet in a locked mode — do not suggest that.

## 5. CURRENT STATE
- **Live: 2.3.15 🐧, helper 1.10.** quill-haven-2 HEAD `14ea171`. App ≈ **1129 lines** (7 files).
- Live home URL: `https://stjohnbuilds.github.io/quill-haven-2/home-screen/`.
- **Build/test:** `node --check` passes on content.js + background.js; the settings rebuild +
  confirm dialog were verified in a local **mock render** (not the real laptop). Marie has
  **confirmed on her laptop**: terminal opens, hands-free updates land, screen-off goes dark.
- **Working now:** boots + writes; bar/dock/settings; themes; draggable bar; **hands-free
  updates** (in-app button); **terminal button**; **screen-off when idle**; rebuilt settings
  panel (Device / Apps / Power, app edit-rename + pop-up Add); in-app **are-you-sure** before
  Restart/Off; honest updater (pulse + "Updated" toast + readable errors + wait-for-publish).
- **Removed this session:** Night light (+ its constant colour filter), the manual "Screen"
  button, dead `_updTimer`.
- **Lockdown is OFF** (`LOCKDOWN_ENABLED = false` in background.js) — deliberate, never tested live.
- **Brightness slider is still a FAKE shade** (a black overlay), NOT the real backlight — Marie
  knows; real dimming is a pending job.

## 6. TOP 5 NEXT JOBS (Marie's chosen order; 1–3 done this session)
1. **Turn on website-blocking** (her #4) — flip `LOCKDOWN_ENABLED = true` in background.js + test
   on the real laptop; the allow-list (`baseDomain`, `INFRA_SUFFIXES`) has never run live. **[Big]**
2. **Real screen dimming** (her #5) — make the brightness slider drive the **real backlight**
   (not the overlay). Needs a one-time device setup: `brightnessctl` (or udev rule / `video`
   group) so the helper can write `/sys/class/backlight/*/brightness`. This is NOT pushable via
   the normal update (system-level). **[Big + User]**
3. **Power-tuning / battery (her #2 leftover)** — TLP install + CPU governor at install time;
   screen-off already works. **[Big / install]**
4. **Hardware power button = instant off, no confirm** — route logind `HandlePowerKey` to a
   confirm. Install-side (setup.sh / device config), not pushable via app update. **[Design call]**
5. **Lock the helper (security)** — shared-secret token so only Quill Haven can call it; do it
   with a cutover so it can't strand the running machine. Then the installer / all-in-one boot
   drive. **[Big]**

## 7. WHAT ONLY MARIE CAN DO
- **Install/confirm on the device** — tap Update; report whether something actually works (only
  she can verify the device half).
- **TTY actions** — open Ctrl+Alt+Fn+F2, log in `marie` + password, type ONE line (e.g.
  `curl -X POST localhost:8137/apply-update`). The reliable fallback if the button ever fails,
  and the only recovery for a bricked helper.
- **The one-time device setup** for real backlight dimming / power-tuning (a TTY install or a
  setup re-run) — these are system-level, not app updates.
- **Authorise pushes** and **design calls** (layout, what to keep/cut).

## 8. WHERE THINGS LIVE + COMMANDS
**Two repos:** `quill-haven-2` = THE APP (build here). `QuillHaven` = delivery + helper + docs.
- App = 7 files in `quill-haven-2`: `home-screen/index.html`, `home-screen/css/home.css`,
  `extension/{apps.js, content.js, shell.css, background.js, manifest.json}`. `content.js` is
  ~90% of it (bar, dock, settings, update popup, confirm). `version.json` = the version source.
- Delivery in `QuillHaven`: `helper/helper.py` (local helper on 127.0.0.1:8137),
  `helper/helper-manifest.json` (version + per-file sha256 the device pulls),
  `helper/launch-home.sh` (the kiosk launcher — **contains the SW-cache-clear keystone fix**),
  `helper/run-helper.sh`, `setup.sh` (installer), `tools/release-helper.sh`.
- **Ship a version (manual):** edit in quill-haven-2 → bump version.json + content.js `LOCAL` +
  manifest.json (new number + new emoji) → `git push`. Copy changed `extension/*` to
  `QuillHaven/extension/`, `shasum -a 256` them, paste into `helper-manifest.json` extras,
  `git add` ONLY those files → `git push`. CDN-verify (curl raw + Pages until hashes/version
  match) → Marie taps Update.
- **Helper edit:** `tools/release-helper.sh <ver>` re-stamps helper version + helper.py hash
  (preserves extras) BEFORE you re-hash extras. Brick risk — `python3 -m py_compile` first.
- **Verify the UI in a mock** (preview can't run the extension normally): a tiny harness that
  mocks `chrome.storage`/`chrome.runtime` and loads apps.js + content.js, served via
  `.claude/launch.json` + the preview tools, then screenshot. (Used this session to verify the
  settings rebuild + confirm dialog.) The mock proves layout/look, NOT device behaviour.
- **Recovery:** Ctrl+Alt+Fn+F2 → TTY. A dead helper: `cd ~/.local/share/quill-haven` →
  `cp helper.py.bak helper.py` → `pkill -f helper.py` → reboot.
