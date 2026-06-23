# Quill Haven — Full Assessment Prompt

Copy this entire file into a fresh AI chat. Tell the AI to follow the rules
exactly. This is a top-to-bottom check of the entire Quill Haven project.

---

## Who you're reporting to

Marie. Non-coder. She'll READ your report. Use plain English in the summary
and the recommended-actions list. Structured detail (file paths, line
numbers) is fine inside sections, but the **summary at the top** must be
readable by someone who doesn't code.

## The job

A top-to-bottom assessment of everything in this project. Rate each area.
Find every bug, gap, and rough edge. **Do not fix anything.** Just report.

## What Quill Haven is (one paragraph)

Quill Haven is a writing-only operating system. It ships as a static
HTML/CSS/JS "home screen" + two built-in apps (Local Writing, Files) that
together feel like a real OS. The device-install side wipes a laptop and
puts Linux Mint on it with Chromium in kiosk mode pointed at the home
screen — so on power-on the laptop opens straight into Quill Haven, with
the URL allowlist baked in. There is no "install in your existing
browser" path: Quill Haven IS the OS.

---

## READ THESE FILES FIRST (in order)

You MUST read these before doing the checklist below.

1. `CLAUDE.md` — project rules.
2. `docs/GAME_PLAN.md` — **source of truth.** App goals, full file tree,
   feature breakdown, design language, version history.
3. `docs/CODE_HEALTH.md` — code rules + deep-dive checklist. This file's
   checklist IS the technical health audit — run it.
4. `TODO.md` — what's done and what's left, with status.
5. `docs/HANDOVER_TO_NEW_CHAT.md` — gotchas, cache-version map, current
   state notes.
6. `devices/README.md` + `devices/SETUP.md` — the one install path
   (USB stick wipes an Intel/AMD laptop, installs Linux + Quill Haven
   kiosk). `devices/BEFORE-YOU-BUY.md` covers Chromebook write-protect
   checks.
7. `home-screen/index.html`, `home-screen/js/home.js`,
   `home-screen/apps/writing/writing.js`, `home-screen/apps/files/files.js`
   — read each one fully. They're small enough.

If anything in those files contradicts anything below, the files are
authoritative — flag the contradiction as a finding.

---

## How to preview

A preview server is configured in `.claude/launch.json`. From this project
directory, start it however your harness exposes it (typically a
preview/dev-server tool); the home screen lives on port 8081. The boot
splash throttles in some preview environments — append `#frozen` to the
URL to see the final composed boot frame without waiting.

If you can't run a preview server, say so plainly under "What I couldn't
test" — don't guess what it looks like.

---

## The assessment

### A. Visual & Design Check

Open the home screen in the preview and walk the **24-point Usability +
Interface check from `CLAUDE.md`** (the global rules file in the user's
home directory; if your harness doesn't expose it, the 12 Usability + 13
Interface points are also reproduced in many Marie-side bibles — apply
the spirit: every interface finding must name a SPECIFIC element).

Plus check each of these on the home screen + each app:

- Boot splash fades cleanly (loading bar reaches 100% by `window load`).
- Top bar: live Wi-Fi opacity, live battery fill width, clock + date.
- Greeting matches local time (verify with the Region picker in Settings).
- Dock vs Top mode toggle works; switching persists.
- App icons: Google Docs, Local Writing, Files, Dabble (in that order in
  the dock). Hover tooltips. Right-click → Restart / Close.
- Settings panel: Wi-Fi (live), Brightness, Theme (4 skins) + hue slider,
  Night Light, Google Account link, **Google Drive** (honest "not
  connected" state), App Bar Dock/Top toggle, Storage bar, **Region**
  (timezone), **Background** picker (always visible, with thumb strip),
  apps list (drag handle + on/off + remove), Add App, Clipboard history.
- All four skins (Purple / Wood / Slate / Dark) work end-to-end; the
  writing app and files app pick up the same skin via the `qh-theme`
  storage event.
- Local Writing: Notes / Projects / Trash tabs; quill side panel
  collapses to a faded quill; faint edge-collapse arrow halfway down the
  panel; download icon top-right in the side; pill toolbar (B / I / U /
  S / highlight); centred page; word count; "Saved".
- Writing: `+` on a project opens **Chapter / Part** menu (no
  descriptions, just labels); Parts create a `Project → Part → Chapter →
  Scene` level; chapter numbering stays sequential across top-level +
  parts; a **"Move to…"** button on each chapter (visible only when a
  Part exists) moves the chapter between containers.
- Writing → Download: three options — **Save to device** (single
  book/note .rtf), **Save to Drive** (same single file to Drive), **All
  projects bundle** (.zip of everything to device). Sub-labels swap
  book↔note based on the open tab.
- Writing: delete a scene / chapter / part / project / note — see undo
  toast, see Trash tab appear with the right count badge.
- Hover the tree — row width does NOT jump when the edit/add/del buttons
  reveal (they're opacity-faded, not display-toggled).
- Dropdowns (dl-menu, popup-menu, undo-toast) are opaque — you should
  not see anything underneath them.
- Bold text in the editor is visibly heavy (700 weight bundled).
- Files: Documents / Pictures / Downloads / USB / Trash in the sidebar.
- Files: "+ New folder" tile creates a folder with inline rename; drag a
  file card onto a folder to move it in; folder click → navigate in;
  back tile → root.
- Files → USB uses the File System Access API on Chromium/Edge —
  click USB → pick the folder → handle persists. Falls back to a
  friendly "not supported" message elsewhere.
- Settings → **Restore backup** — picking a `quill-haven-backup-*.json`
  or `.zip` confirms with date + counts, then replaces qh-writing2 +
  qh-files on confirm.
- Settings → **Google Drive** — three-state row ("Not connected" / "Ready
  — tap to sign in" / "Connected as <email>"). The OAuth Client ID prompt
  is plain `window.prompt` — point users at `docs/DRIVE_SETUP.md` for
  the 10-min Cloud Console setup.
- Settings → **Auto-backup to Drive** — toggle row that only appears when
  Drive is connected. Off by default. When on, silent 30-min uploads.
- Add App refuses obvious distraction domains (try facebook.com,
  youtube.com, gmail.com) — friendly popup, no add.

### B. Code Quality

Run the **Deep-dive / full-scan checklist** in `docs/CODE_HEALTH.md`.
Every item there. Report `✓ pass` / `⚠ minor` / `❌ broken` with file
paths and line numbers.

### C. Feature Completeness

Compare what's actually built against `docs/GAME_PLAN.md` and `TODO.md`.

- **Done:** list every feature that's fully built and working.
- **Partially done:** anything that exists but is broken, incomplete, or
  has rough edges.
- **Not started:** anything from GAME_PLAN that hasn't been built. (The
  OS-install half — boot kiosk script, lockdown policy — is shipped via
  `devices/SETUP.md` + `setup.sh` at the repo root; the one-step custom
  USB ISO is the only outstanding piece.)
- **Undocumented:** anything built that ISN'T described in GAME_PLAN.

### D. Project Health

- **Files** — anything orphaned or unnecessary. List each top-level file
  in `home-screen/` and `devices/` with: what it does, needed yes/no.
- **Git** — `git log --oneline -20` and `git status`. Are commits clean
  and descriptive? Any uncommitted changes?
- **GitHub** — does the README exist and make sense? Is `version.json`
  correct and used by the update checker? Pages deployment succeeding
  (https://stjohnbuilds.github.io/quill-haven/ loads)?
- **Hooks** — read every file in `.claude/hooks/`. Does
  `.claude/hooks/_log.sh` exist and append to `.claude/hook-activity.log`?
  Is the log actually getting entries?

### E. Readiness for Next Phases

- **Boot kiosk readiness.** Does `setup.sh` install Chromium and write a
  working autostart launcher? Does the recovery escape hatch
  (`quill-haven-recovery`) actually drop the user to the desktop?
- **Lockdown readiness.** `setup.sh` already drops a Chromium managed
  policy in `/etc/chromium/policies/managed/quill-haven.json` with
  URLBlocklist=["*"] + a tight URLAllowlist (Quill Haven + Google
  sign-in/Docs/Drive + Dabble + Typing & Tomes). Verify the JSON is
  syntactically valid and the allowlist is complete enough that the
  writing apps actually work end-to-end.
- **Data safety.** All writing lives in `localStorage` (`qh-writing2`,
  `qh-files`). One device wipe = total loss. Real Google Drive sync is
  the safety net but actual OAuth isn't wired (UI is honest about this).
  Is there ANY other code path that could silently lose data? Verify
  autosave fires on every input event and on `beforeunload`. Verify trash
  always preserves the full payload.

---

## Output format (EXACT)

```
# QUILL HAVEN ASSESSMENT — <date>

## PLAIN-ENGLISH SUMMARY
- Section A (Visual): N passes, M minor, K broken
- Section B (Code): N clean, M warnings, K problems
- Section C (Features): N done, M partial, K not started
- Section D (Project): <one-sentence verdict>
- Section E (Readiness): <one-sentence verdict>

Things Marie should know first:
1. <plain-English bullet>
2. <plain-English bullet>
3. <plain-English bullet>

## RATINGS
| Area | Rating | Notes |
|---|---|---|
| Visual / UX | ★★★★☆ | <short note> |
| Code quality | ★★★★☆ | <short note> |
| Feature completeness (app) | ★★★★★ | <short note> |
| Feature completeness (OS install) | ★★☆☆☆ | <short note> |
| Project health | ★★★★☆ | <short note> |
| **Overall** | **★★★★☆** | <short note> |

## A. VISUAL & DESIGN
Per check: ✓ pass / ⚠ minor / ❌ broken — with a SPECIFIC element name.

## B. CODE QUALITY
Per CODE_HEALTH checklist item: ✓ / ⚠ / ❌ — with file path + line.

## C. FEATURE COMPLETENESS
### Done
- <feature> — works yes/partially/no
### Partial
- <feature> — what's missing
### Not started
- <feature>
### Undocumented
- <feature found in code but not in GAME_PLAN>

## D. PROJECT HEALTH
### Files / Git / GitHub / Hooks
- <one bullet per area>

## E. READINESS
- <plain-English verdict per area>

## TOP 10 THINGS TO FIX (don't fix — just list)
1. <specific finding> — why it matters
...
10. <...>

## WHAT I COULDN'T TEST
- <anything you couldn't verify and why>
```

---

## Hard rules — non-negotiable

1. **Don't fix anything.** Just report.
2. **No confidence percentages** ("85% sure", "should be fine", "trust me
   it works"). Marie's no-self-cert hook blocks these. Use plain words:
   "fully checked" / "code reads right but didn't run" / "didn't test".
3. **Every finding must include a specific file path, line number, or
   element name.** No vague verdicts like "the code looks clean overall".
4. **Actually open the preview in a browser and look at it.** Don't just
   read the code and guess what it looks like. If your harness can't run
   a preview, say so under "What I couldn't test."
5. **Rate honestly.** Marie would rather hear "this needs work" than
   "looks great" followed by bugs. Prior AIs have told her things were
   clean when they weren't.
6. **Run every section.** If you stop early, say so at the top.
7. **Read the WHOLE file when asked.** Don't skip sections you find
   boring.
8. **Compare against the Game Plan.** If something in GAME_PLAN isn't
   built, that's a finding. If something is built but not in GAME_PLAN,
   that's also a finding (means the docs are stale, which IS a problem).
9. **Don't comfort the user.** Marie's CLAUDE.md hard-rules forbid
   "breathe", "calm down", "I understand this is frustrating", etc. Just
   report the facts.
