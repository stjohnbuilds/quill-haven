# Quill Haven

A distraction-free writing OS. Turn a cheap laptop into a device that
only writes — Google Docs, Dabble Writer, Typing & Tomes, and a built-in
local writing app. No web browser to wander into. No app store. No mail.
No social. Just writing.

**Try it live:** [stjohnbuilds.github.io/quill-haven](https://stjohnbuilds.github.io/quill-haven/)

> Click around. It's the actual home screen — themes, settings, the
> writing app, the files app. Everything saves to your browser; no
> account, no signup.

## Get it on a device

**One install path: one USB stick wipes the laptop and installs Quill
Haven as the operating system.** Same process for any Intel/AMD laptop
— Windows, Intel Mac, or Intel/AMD Chromebook (extra firmware-unlock
step).

→ Read [`devices/SETUP.md`](devices/SETUP.md) for the step-by-step.

**Won't work on:** Apple Silicon Macs (M1/M2/M3+) or ARM Chromebooks
— Apple and Google's firmware refuses to install another OS.

**Buying a Chromebook for this?** [`devices/BEFORE-YOU-BUY.md`](devices/BEFORE-YOU-BUY.md)
covers the write-protect-method check that ruins a lot of "supported"
Chromebooks (the ones that need a $30 specialist cable to unlock).

## What's in it

- **Home screen** — Mac-style dock + top bar, live clock + Wi-Fi +
  battery, 4 themes (Purple/Wood/Slate/Dark) + Night Light, your photos
  as wallpaper, settings panel.
- **Local Writing app** — Projects → optional Parts → Chapters → Scenes;
  Notes; a quill side panel that collapses; soft-delete trash with undo;
  EB Garamond editor with bold/italic/underline/strike/highlight;
  autosave; word count.
- **Files app** — Documents, Pictures, Downloads, USB, Trash. Sub-folders
  + drag + rename. USB drag-and-drop via the File System Access API on
  the installed device.
- **Backup** — Download → "Full backup (.zip)" packs every project + note
  as Word files plus a restorable JSON. Settings → "Restore backup" feeds
  it back in. Google Drive sync exists as a one-button option once you
  paste an OAuth client ID (see [`docs/DRIVE_SETUP.md`](docs/DRIVE_SETUP.md)).
- **Distraction wall** — Add App refuses obvious distraction domains.
  On the installed device, Chromium/Edge URL allowlists block everything
  outside the writing apps at the browser level.

## Update / restore your writing

- **Update Quill Haven itself** — happens by itself the next time you
  have internet, via the service worker. If stuck, `Ctrl + Shift + R`
  inside the app.
- **Restore your writing** — Settings cog → "Restore backup" → pick the
  `quill-haven-backup-*.json` (or the whole `.zip`) you downloaded
  earlier. Confirms before replacing.

## Docs

| Read | Why |
|---|---|
| [`docs/GAME_PLAN.md`](docs/GAME_PLAN.md) | What this is, the full feature list, the file tree |
| [`docs/CODE_HEALTH.md`](docs/CODE_HEALTH.md) | Rules + deep-dive audit checklist |
| [`docs/HANDOVER_TO_NEW_CHAT.md`](docs/HANDOVER_TO_NEW_CHAT.md) | Bootstrap for a new AI chat working on the codebase |
| [`docs/AI_ASSESSMENT_PROMPT.md`](docs/AI_ASSESSMENT_PROMPT.md) | Drop into a fresh AI chat for a full top-to-bottom audit |
| [`docs/DRIVE_SETUP.md`](docs/DRIVE_SETUP.md) | The 10-minute Google Cloud setup for Drive sync |

## Tech

Static HTML/CSS/JS. No framework, no build step, no npm. Three files for
the home screen (HTML/CSS/JS), three more per sub-app, one shared
theme.css for colours, one shared confirm.js for popups. A service worker
caches everything for offline use. The "Full backup" zip generator and
the "Restore" zip reader are both hand-written (no library, no
dependencies) to keep that promise.

The deeper story is in [`docs/GAME_PLAN.md`](docs/GAME_PLAN.md).

## Licence

[MIT](LICENSE) — do whatever you want with the code. If you spin this
into your own write-only OS, a link back is appreciated but not required.
