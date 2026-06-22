# Finishing Batch — DO THIS FIRST (one go)

> Marie's instruction (2026-06-21): do ALL of the items below first, as one batch,
> before anything else. This is the "finishing" pass on the app side. The big
> device half (boot / lockdown / USB / README) comes AFTER this batch.
>
> Read CLAUDE.md + docs/GAME_PLAN.md + docs/HANDOVER_TO_NEW_CHAT.md first.
> Conventions that still apply: non-technical replies, "Files I changed:" footer,
> NO self-cert percentages, **bump `?v=` on every CSS/JS change** (see HANDOVER for
> the list of cache spots + current versions), verify in the preview + screenshot,
> reuse `shared/confirm.js` (`qhConfirm`) — never make a second popup, keep it
> clean (no duplicate functions / orphan CSS).

## Two things that need Marie BEFORE you build them
- **"+" → Chapter or Part** (item 4): confirm the structure first. Likely a "Part"
  is a level ABOVE chapters (Project → Part → Chapter → Scene), like T&T's
  "Volumes". Ask: *"Is a Part a group of chapters, or just another word for a
  scene?"* Build to her answer.
- **Google Drive** (item 6): real Drive needs a one-time Google sign-in setup
  (an OAuth client ID from a Google account/Cloud project) and internet to Google.
  You can build the UI + flow, but it can't fully work/test until that exists.
  Be honest with Marie about this; don't fake it.

---

## Suggested order (independent → dependent)

### 1. Background picker INTO Settings  (small, already designed)
Marie: *"changing the background needs to be in Settings, and you pick from what's
in Pictures."* Full spec is in HANDOVER ("IN PROGRESS / DO NEXT"). In short:
- `index.html #bgRow`: always visible; add `<div class="bg-gallery" id="bgGallery">`;
  wrap Fill/Fit in `#bgFitToggle`, the Dim row in `#bgDimWrap` (both hidden until a
  picture is set); drop the "Remove background" button (Default tile clears it).
- `home.js`: add `setBg(dataUrl)` + `renderBgGallery()` (reads `qh-files.pictures`,
  renders a Default tile + a tile per picture, tap → setBg, active = current
  `qh-bg`, hint if none). Rewrite `syncBgRow()` to render the gallery + show/hide
  Fit/Dim by whether `qh-bg` is set. Add `qh-files` to the storage listener. Call
  `syncBgRow()` when Settings opens. Remove unused `clearBg`.
- `home.css`: `.bg-gallery` (horizontal scroll), `.bg-tile` (~52×38, active ring),
  `.bg-default` (pastel gradient), `.bg-hint`.
- `files.js renderPictures()`: REMOVE the "Set as background" button + Default card;
  keep Add + Delete (delete → trash, no confirm, recoverable); add a "Background ·"
  tag on the current one + a hint "Set your background in Settings."

### 2. Download → "This device" or "Google Drive" + manuscript export  (highest value)
- Add a **Download** button to the writing app, top of the panel. (Marie earlier:
  put download where the collapse arrow is, and move the collapse arrow to a faint
  arrow halfway down the panel edge — do that reposition here.)
- Click → small dialog with two choices: **This device** / **Google Drive**.
- **This device**: export the CURRENT PROJECT (all chapters → scenes) as a real
  manuscript file, trigger a browser download, AND save a copy into Files →
  Documents (`qh-files.documents` = `{id,name,date,format:'rtf',content}`; the
  Files app already lists + re-downloads these).
- **Format = RTF** (hand-generated, NO library, opens in Word/Docs):
  - Times New Roman 12pt, double-spaced (`\sl480\slmult1`), 1" margins.
  - Title page: project name centered.
  - Each chapter: new page (`\page`), chapter title centered.
  - Scenes: scene header as a sub-heading (or a centered "#" scene break); body
    paragraphs. **First-line indent**: each paragraph's first line indents 0.5"
    (`\fi720`), the FIRST paragraph after a heading is flush (no indent). Marie
    specifically asked for this paragraph behaviour.
  - Convert editor HTML → RTF: `<b>/<strong>`→`\b…\b0`, `<i>/<em>`→`\i…\i0`,
    `<u>`→`\ul…\ulnone`, `<s>/<strike>`→`\strike…\strike0`, paragraphs/`<br>`.
    STRIP highlights (manuscripts don't have them). Escape `\ { }` and non-ASCII.
- **Google Drive**: route to item 6 (if not connected → "Connect Google Drive first").
- Study Typing & Tomes export for reference (READ-ONLY):
  `/Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/components/EtherealEditor/`
  (it uses a docx lib ~50KB — we avoid that with RTF).

### 3. Trash + undo for the writing app (deletes aren't permanent)
- Soft-delete instead of hard-delete. Add `qh-writing2.trash` (array of removed
  items with their type + enough to restore). The four `delete*` functions move to
  trash instead of filtering out.
- Show an **undo toast** after a delete ("Deleted — Undo", ~6s) that restores it.
- A **Trash** view (e.g. a small section under the panel, or a third tab) to
  Restore or **Delete forever** (Forever uses `qhConfirm` danger — already wired).
- Restore logic: put it back where it was; restoring an orphan (e.g. a chapter
  whose project is gone) drops it into Notes (Marie's idea) or a sensible fallback.
- Model from T&T: soft-delete flags + restore + two-step permanent delete; the
  undo toast is our addition.

### 4. "+" → Chapter or Part  (CONFIRM STRUCTURE FIRST — see top)
- After Marie confirms: a project's "+" opens a tiny menu (Chapter / Part). If
  "Part" is a level above chapters, add the optional Part level (Project → Part →
  Chapter → Scene); Parts hold chapters; keep drag + rename working at the new level.

### 5. Files app basics — make folders, drag, rename
- **Make folders**: let the user create folders inside Documents/Pictures (a "New
  folder" action; folders nest one level is fine for v1). Update `qh-files` shape to
  support folders (e.g. each item gets a `folder` id, or a `folders` list).
- **Drag files between folders** (and between Documents/Pictures where it makes
  sense) — reuse the home screen's HTML5 drag pattern.
- **Rename a file** (double-click or a pencil edit, like the writing tree).
- Keep it lean; this is a simple file area, not a full file manager.

### 6. Connect Google Drive (backup) — NEEDS SETUP, be honest
- Goal: a "Connect Google Drive" in Settings + "Save to Drive" in the writing app's
  Download dialog, so notes/projects/manuscripts back up off-device.
- Use Google Identity Services + Drive API (`drive.file` scope). Requires an OAuth
  **client ID** (a Google account / Cloud project — a one-time setup the owner does)
  and internet to Google. Until that exists, "Save to Drive" shows a clear
  "Connect your Google account first" state — do NOT pretend it saved.
- This is the one item that can't be fully finished/tested in the preview without
  the client ID + a real Google account. Flag it to Marie and do as much of the UI
  + flow as you safely can.

### 7. Home-screen polish (4 small things)
- **Live Wi-Fi + battery**: battery via `navigator.getBattery()` (level fills the
  icon + a hover tooltip "78%"); Wi-Fi via `navigator.onLine` (connected vs off) +
  hover tooltip. On the real device these read real hardware (in some browsers
  getBattery is limited — fall back gracefully).
- **Real loading bar**: drive the boot loader width from actual progress instead of
  the fixed 3.6s animation — e.g. ~30% on `DOMContentLoaded`, ~70% when fonts are
  ready, 100% on `window load`, then fade. Remove the fixed-duration CSS animation.
- **Region / clock setting**: a Settings control to pick a timezone (default =
  browser's resolved zone). Store `qh-tz`; the clock uses `Intl.DateTimeFormat`
  with that `timeZone`. A locked offline device can't guess location.
- **Ban distraction sites in Add App**: a bl&#x2011;list of common distraction domains
  (facebook, instagram, x/twitter, tiktok, youtube, netflix, reddit, gmail/mail,
  etc.). If a pasted URL matches, refuse with a friendly message ("That one's a
  distraction — Quill Haven keeps those out"). Keep the list easy to edit.

---

## When the batch is done
- Update TODO.md (tick these), GAME_PLAN.md (features + version history), and this
  note. Then the next big phase is **the device half**: boot-into-this, lockdown,
  USB installer, README (see GAME_PLAN "For the Chromebook").
