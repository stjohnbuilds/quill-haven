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
  I on" and the changing emoji is her proof an update landed. Never hand-wave a version
  and never ship a change without a new, unused emoji.
- **How to actually ship a release (the real 2.x process — `tools/release.sh` is STALE
  and CRASHES, do NOT run it; it edits `extension/quill-overlay.js` which no longer
  exists).** By hand:
  1. In `quill-haven-2`: bump version + next unused emoji in all three — `version.json`,
     `extension/content.js` (`var LOCAL = { version, emoji }`), `extension/manifest.json`.
  2. Copy the 5 `extension/` files into this repo's `extension/` (the delivery mirror).
  3. If `helper/helper.py` changed, run `tools/release-helper.sh <next-helper-version>`
     FIRST (re-stamps `helper-manifest.json` version + hash, PRESERVES `extras`).
  4. Re-hash the 6 `extras` in `helper/helper-manifest.json` (5 extension files +
     `launch-home.sh`) with `shasum -a 256`, then VERIFY every hash matches its file.
  5. Commit + push BOTH repos. Confirm the raw CDN serves the new `version.json`.
- **Updates are GATED — they apply only when Marie taps "Update" and confirms.** The
  helper (`helper/helper.py`) does not auto-apply on a timer; the browser POSTs
  `/apply-update` on her tap.
- **The live app has NO service worker.** The home screen is served straight from
  `quill-haven-2` GitHub Pages. `home-screen/service-worker.js` in THIS repo belongs to
  the RETIRED 1.x app — the device never loads it. (Old rule about keeping it byte-stable
  is history.)

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
