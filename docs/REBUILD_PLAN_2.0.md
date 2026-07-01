# Quill Haven 2.0 — Wipe & One-Shell Rebuild Plan

**The principle (the fix for the whole mess):** there is ONE user interface — one
top bar + one app dock + one settings popup — built ONCE, inside the part that can
float over any website. That one interface shows on **every** page: the home screen
*and* inside Google Docs/Dabble. The home screen becomes just a wallpaper + logo
backdrop with no controls of its own. One interface. One data store. No second
anything, so nothing can drift or shift.

**Why this kills the bugs you saw:** the colour shift, the mismatched settings, the
incomplete apps popup — all of them existed because there were TWO interfaces. With
one, there is nothing to disagree.

---

## What we KEEP (not wiped — these are clean and single)
- The **helper** (the engine, in the old repo) — untouched.
- The **font + logo image files** (binary assets, not code).
- The **look** (colour + font values) — re-typed into the one shell, not copied wholesale.
- The **lockdown** idea and the **update-gate** idea — rebuilt as one of each.

## What we WIPE (delete and rebuild from scratch)
- All of `quill-haven-2/home-screen/` code (its bar, dock, settings, JS).
- All of `quill-haven-2/extension/` code (the separate floating shell).
- The **leftover old-overlay files** in the old repo's `extension/` folder and on the laptop.

---

## The steps — each with a PROOF you (or another AI) can check

### Step 0 — Freeze & scan (no code) ✅ in progress
Run the ghost-code scan, write this plan. **Proof:** the scan report + this file exist.

### Step 1 — WIPE
Delete every 2.0 code file (home-screen code + extension code). Keep only the font/logo assets.
**Proof:** `git log` shows the files were **deleted** (not edited), and a file listing shows no old shell code remains. *Another AI can run `git show --stat` on the wipe commit and confirm deletions.*

### Step 2 — Build the ONE shell (fresh)
One file builds the whole interface: top bar (wifi, battery, power, settings, version, clock), one app dock, one settings popup (theme, brightness, night-light, wifi, region, power, version/update), add-a-website. One screen filter. Reads/writes ONE store (the extension's storage).
**Proof:** a preview screenshot of the shell, **plus** a grep showing each control (settings popup, dock, screen-filter, theme, clock, battery, version) is defined in **exactly one file**.

### Step 3 — Build the home backdrop
A near-empty page: wallpaper + logo only. No bar, no dock, no settings, no control JS.
**Proof:** searching the home page for "dock", "settings", "bar" returns **zero** hits. The home page is ~20 lines.

### Step 4 — One shell on EVERY page
The same shell renders on the home backdrop AND inside Docs/Dabble — identical bar, dock, colour. No shift (one filter).
**Proof:** two screenshots (shell over the home backdrop, shell over a fake Google Docs) that are **identical**, side by side.

### Step 5 — Fold lockdown + updates into the one shell
One lockdown, one update-check — living in the single shell.
**Proof:** grep shows **one** lockdown routine and **one** update routine in the whole codebase.

### Step 6 — Clean redeploy to the laptop
**Wipe the laptop's stale extension folder first**, then deliver only the new one-shell files; repoint nothing else.
**Proof:** the delivery manifest lists **only** the new files; a startup self-check confirms the laptop's extension folder holds nothing else.

### Step 7 — On-laptop test
Home backdrop + shell; open Docs → same shell, no colour shift, settings work, version visible, Home works.
**Proof:** you see it; the checklist passes.

---

## Verification gate
After Step 5, before anything touches the laptop, an **independent AI** runs the
"How another AI can verify" checklist from the scan report. We only redeploy once it
finds **zero** duplicates and **zero** ghost files.
