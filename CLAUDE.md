# Quill Haven — Distraction-Free Writing OS

## What this is
A custom Linux-based operating system for an Acer Chromebook Spin 311. When it boots, it shows a clean home screen with only 3 writing apps: Google Docs, Dabble Writer, and Typing & Tomes. Nothing else — no browser, no settings to wander into, no apps. Locked by design.

## Who this is for
Marie. Non-technical. Talk like she's 10. No jargon.

## Rules
- NEVER create duplicate components — check what exists first
- Plan before building
- One task at a time
- "Files I changed" footer on every response
- No confidence percentages or self-certifying

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
