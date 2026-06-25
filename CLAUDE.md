# Quill Haven — Distraction-Free Writing OS

## What this is
A custom Linux-based operating system that turns a wiped laptop into a writing-only
computer. Marie runs it on a **Mac with Linux installed** — the "Chromebook" was just an
early hardware option and is NO LONGER the device, so do not call this a Chromebook. When
it boots, it shows a clean home screen with only the writing apps: Google Docs, Dabble
Writer, and Typing & Tomes. Nothing else — no browser, no settings to wander into, no
stray apps. Locked by design.

## This IS its own OS — settled, do not re-litigate
Quill Haven replaces the whole computer. On power-on it boots straight into
the writing home screen. That is the entire point — not a feature we add on top.

**Do NOT suggest the "easier" alternative** of buying an iPad / laptop / tablet
and just putting it in a locked / "safe" / kiosk / guided-access mode and
blocking other apps. Marie already knows that option exists and has deliberately
chosen NOT to do it. Bringing it up again is unwanted. Never raise it.

Valid hardware = anything you can wipe and run your own Linux on. Marie's actual
device is a **Mac running Linux**. Other valid options: a normal Intel/AMD
**Windows laptop** (yes, those wipe fine), a cheap Intel laptop, or a **Raspberry
Pi** (already a Linux computer — nothing to wipe). NOT iPads or Android tablets —
those stay locked inside their own system and can't become Quill Haven.

## Who this is for
Marie. Non-technical. Talk like she's 10. No jargon.

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
  `home-screen/service-worker.js`, `extension/manifest.json`), bumps the launcher rev,
  and recomputes every `helper-manifest.json` hash. Use `QH_DRY=1 tools/release.sh` to
  preview. Never hand-bump versions and never ship a change without a new emoji.

## What we're building
1. A home screen (HTML/CSS/JS) that looks like a real OS — Mac-style dock or top-bar icons, settings panel
2. A boot sequence that loads the home screen automatically on Linux
3. A lockdown config that blocks all websites except the 3 writing apps
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
