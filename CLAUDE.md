# Quill Haven — Distraction-Free Writing OS

## What this is
A custom Linux operating system that turns a wiped computer into a writing-only
computer. It is **not tied to one machine** — it installs on any computer that can run
Linux: a **Windows laptop**, a **Mac**, or a **Chromebook**. The OS is the product, not
the hardware. When it boots, it shows a clean home screen with only the writing apps:
Google Docs, Dabble Writer, and Typing & Tomes. Nothing else — no browser, no settings to
wander into, no stray apps. Locked by design.

## This IS its own OS — settled, do not re-litigate
Quill Haven replaces the whole computer. On power-on it boots straight into
the writing home screen. That is the entire point — not a feature we add on top.

**Do NOT suggest the "easier" alternative** of buying an iPad / laptop / tablet
and just putting it in a locked / "safe" / kiosk / guided-access mode and
blocking other apps. Marie already knows that option exists and has deliberately
chosen NOT to do it. Bringing it up again is unwanted. Never raise it.

Valid hardware = any computer that can run Linux: a **Windows laptop**, a **Mac**, or a
**Chromebook** (and a **Raspberry Pi** works too — it's already a Linux computer). The
point is the OS goes on whatever machine can run Linux; it is not one specific device.
NOT iPads or Android tablets — those stay locked inside their own system and can't become
Quill Haven.

## Who this is for
Marie. Non-technical. Talk like she's 10. No jargon.

## Where the code actually lives (READ THIS FIRST)
The shipping app is the **2.x rebuild** and lives in a **separate repo**:
- **`quill-haven-2`** (`/Users/mariemackay/Dev/quill-haven-2`) — THE SOURCE OF TRUTH.
  The 7-file app (5 `extension/` files + `home-screen/index.html` + `css/home.css`).
  The home screen is served LIVE from its GitHub Pages; the version pill + emoji live
  in `extension/content.js` (`var LOCAL`) and `version.json`.
- **`QuillHaven`** (this repo) — the DELIVERY + device side: the installer (`setup.sh`),
  the on-device helper (`helper/`), the boot launcher (`helper/launch-home.sh`), and a
  mirror of the 5 `extension/` files that the device pulls from `helper-manifest.json`.
- The live fix list from the 2026-07-01 audit is **`FIX_CHECKLIST.md`**. `HANDOVER.md`
  / `TODO.md` / most of `docs/` describe the RETIRED 1.x app — treat as history.

## Rules
- NEVER create duplicate components — check what exists first
- Plan before building
- One task at a time
- "Files I changed" footer on every response
- No confidence percentages or self-certifying
- **EVERY release gets a NEW emoji.** Marie reads the pill emoji as "which version am
  I on" and the changing emoji is her proof an update landed. **This is built in: run
  `tools/release.sh`** — it bumps the version + the NEXT unused emoji in EVERY place
  that must agree (`version.json`, `extension/quill-overlay.js`, `home-screen/js/home.js`,
  `extension/manifest.json`), bumps the launcher rev, and recomputes every
  `helper-manifest.json` hash. Use `QH_DRY=1 tools/release.sh` to preview. Never
  hand-bump versions and never ship a change without a new emoji.
- **Updates are GATED — they apply only when Marie taps "Update" and confirms.** The
  helper (`helper/helper.py`) no longer auto-applies on a timer; the browser POSTs
  `/apply-update` on her tap. `home-screen/service-worker.js` is CACHE-FIRST / PINNED
  and is kept **byte-stable on purpose** — do NOT version-bump it (that's why it left
  the `release.sh` list above); changing it reinstalls the worker and defeats the pin.
- **If you edit `helper/helper.py`, run `tools/release-helper.sh <next-helper-version>`
  BEFORE `tools/release.sh`** (it re-stamps `helper-manifest.json`'s version + hash
  while preserving `extras`). `release.sh` now refuses to run if the helper hash is
  stale, so the gate can't half-deploy (new overlay, old helper).

## What we're building
1. A home screen (HTML/CSS/JS) that looks like a real OS — Mac-style dock or top-bar icons, settings panel
2. A boot sequence that loads the home screen automatically on Linux
3. A lockdown that (a) keeps the laptop on the writing apps, AND (b) hard-blocks a deny-list of common distraction sites (YouTube, Facebook, Instagram, TikTok, Reddit, Bluesky, X, Threads, Snapchat, Pinterest, Tumblr, Netflix, Twitch, Discord) — bounced home even if added as an app. Deny-list lives in `extension/background.js` (`BLOCKED`).
4. A USB installer package with everything ready to go

## The apps
- Google Docs: https://docs.google.com
- Dabble Writer: https://app.dabblewriter.com
- Typing & Tomes: https://typingandtomes.vercel.app

## GitHub
- Repo: stjohnbuilds/quill-haven
- Updates: home screen checks version.json on GitHub, shows "Update available" button in top bar

## Commands
- Preview: open home-screen/index.html in browser
- No build step — this is static HTML/CSS/JS
