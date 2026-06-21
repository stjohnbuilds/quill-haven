# Quill Haven — Full Assessment Prompt

Copy this entire file into a fresh AI chat. Tell the AI to follow the rules exactly. This is a thorough top-to-bottom check of the entire Quill Haven project.

---

## Who you're reporting to

Marie. Non-coder. She'll READ your report. Use plain English in the summary and the recommended-actions list. Structured detail (file paths, line numbers, code snippets) is fine inside sections, but the **summary at the top** must be readable by someone who doesn't code.

## The app

**Quill Haven** — a custom Linux-based OS for an Acer Chromebook Spin 311. When it boots, it shows a clean home screen with ONLY writing apps (currently Dabble Writer and Google Docs). Nothing else — no browser, no settings to wander into, no apps. Locked by design.

- **Project folder:** `/Users/mariemackay/Dev/QuillHaven`
- **GitHub repo:** `https://github.com/stjohnbuilds/quill-haven`
- **Home screen:** `home-screen/index.html` (static HTML/CSS/JS, single file, no build step)
- **Preview:** `python3 -m http.server 8081 -d home-screen` then open `http://localhost:8081`
- **Design:** pastel purple-pink background, frosted glass dock/panels, animated orbs

## The job

A **top-to-bottom assessment** of everything in this project. Rate each area. Find every bug, gap, and rough edge. **Do not fix anything.** Just report.

---

## READ THESE FILES FIRST (in order)

1. `CLAUDE.md` — project rules and context
2. `docs/GAME_PLAN.md` — the full game plan with app tree, goals, and design language
3. `TODO.md` — what's done and what's left
4. `home-screen/index.html` — the ENTIRE home screen (read the whole file, it's one file)

---

## Section A — Visual & Design Check

Open the home screen in a browser preview (`python3 -m http.server 8081 -d home-screen`).

### A1. Home screen (default state)

Check and rate each:

- [ ] Background gradient loads correctly (pastel purple-pink)
- [ ] Animated orbs visible and moving slowly
- [ ] Top bar: Wi-Fi icon, battery icon, settings cog, date/time — all visible
- [ ] Date/time updates live (watch for 10+ seconds)
- [ ] Clock area: large time, greeting matches time of day, correct date
- [ ] Dock: frosted glass bar at bottom, centered
- [ ] Dock: exactly 2 icons — Dabble (lavender, LEFT) and Google Docs (pink, RIGHT)
- [ ] Dock: hover shows white tooltip with app name
- [ ] Dock: hover animation is gentle (not aggressive bounce)
- [ ] No extra apps showing (T&T should NOT be in dock)
- [ ] Footer visible at bottom of settings: "Quill Haven v1.0 🌸"
- [ ] Overall feel: modern, calm, pretty — not chunky or school-laptop

### A2. Settings panel

- [ ] Settings cog in top bar opens settings panel
- [ ] Settings panel closes with X button
- [ ] Settings panel closes with click outside
- [ ] Wi-Fi row shows "Connected" (display only)
- [ ] Brightness slider works (screen gets darker/brighter)
- [ ] Night Light toggle works (warm sepia tint)
- [ ] Google Account row exists with "Sign in for Docs"
- [ ] App Bar toggle: "Dock" and "Top" buttons
- [ ] Switching to "Top" hides dock, shows icons centered in top bar
- [ ] Switching back to "Dock" shows dock again, hides top icons
- [ ] Apps section: only Dabble Writer and Google Docs listed
- [ ] Apps section: Dabble first (lavender mini icon), Docs second (pink mini icon)
- [ ] App toggles work — turning off an app hides it from dock/top bar
- [ ] Clipboard History section exists (empty when no copies made)

### A3. App views

- [ ] Clicking Dabble icon opens a fullscreen overlay
- [ ] Dabble overlay has traffic-light close buttons (red/yellow/green)
- [ ] Red button closes the overlay and returns to home screen
- [ ] Clicking Google Docs icon opens a fullscreen overlay
- [ ] Docs overlay has traffic-light close buttons
- [ ] Red button closes and returns to home screen
- [ ] Can open one app, close it, open the other — no glitches

### A4. Responsiveness

- [ ] Resize browser to phone size (375px wide) — does it still look decent?
- [ ] Resize to tablet (768px) — dock still centered?
- [ ] Resize to wide desktop (1920px) — nothing breaks?
- [ ] The Chromebook screen is 11.6" / 1366x768 — does it look right at that size?

---

## Section B — Code Quality

Read `home-screen/index.html` line by line.

### B1. HTML structure

- [ ] Valid HTML5 doctype and structure
- [ ] All elements properly closed
- [ ] No orphan elements (floating divs, buttons with no purpose)
- [ ] IDs are unique (no duplicate IDs)
- [ ] Semantic HTML where appropriate (nav, header, main, etc.)

### B2. CSS quality

- [ ] No unused CSS rules (check every class — is it used in the HTML?)
- [ ] No conflicting rules (two rules fighting over the same element)
- [ ] Animations are smooth (no jank, no excessive repaints)
- [ ] Consistent spacing system (not random pixel values)
- [ ] Dark/light contrast sufficient for readability
- [ ] Frosted glass effect works (backdrop-filter)
- [ ] Mobile-safe (no overflow, no elements cut off)

### B3. JavaScript quality

- [ ] No console errors on page load
- [ ] No console errors when interacting with every feature
- [ ] All `onclick` handlers work
- [ ] No memory leaks (intervals cleaned up, no unbounded arrays)
- [ ] `setInterval` for clock — does it clean up? (it shouldn't need to in a single-page app, but check)
- [ ] Clipboard history: does it cap the array size? (won't grow forever?)
- [ ] Settings state: does toggling Dock/Top mode persist correctly?
- [ ] App visibility: does toggling apps on/off persist?
- [ ] Update checker: does it handle fetch failures gracefully? (no internet, wrong URL, etc.)
- [ ] Version comparison: does it correctly compare version numbers?
- [ ] No dead code (functions that are never called)
- [ ] No broken references (calling a function that doesn't exist)

### B4. Security

- [ ] No inline `eval()` or `Function()` constructor
- [ ] No external scripts loaded from CDNs
- [ ] No sensitive data in the file (API keys, tokens, passwords)
- [ ] iframe sandbox attributes on app views? (optional but good)
- [ ] XSS risk: clipboard text is escaped before rendering?

---

## Section C — Feature Completeness

Compare the current state against the Game Plan (`docs/GAME_PLAN.md`).

### C1. What's DONE and working

List every feature that is fully built and functional.

### C2. What's PARTIALLY done

List anything that exists but is broken, incomplete, or has rough edges.

### C3. What's NOT started

List everything from the Game Plan that hasn't been built yet.

### C4. What's MISSING from the Game Plan

Is there anything in the code that ISN'T described in the Game Plan? (features built but not documented)

---

## Section D — File & Project Health

### D1. File inventory

- List every file in the project. For each: what it does, whether it's needed.
- Any files that seem orphaned or unnecessary?

### D2. Git health

```bash
git log --oneline -20
git status
```

- Are commits clean and descriptive?
- Any uncommitted changes?
- Any files that should be in .gitignore but aren't?

### D3. GitHub repo

- Does the repo README exist? Is it useful?
- Is `version.json` correct? Does the update checker point at the right GitHub URL?
- Are there any issues/PRs open?

### D4. Hooks

- Read every hook in `.claude/hooks/`. For each: what it does, does it work, is it necessary.
- Does `.claude/hooks/_log.sh` exist and work?
- Check `.claude/hook-activity.log` — are hooks actually running?

---

## Section E — Readiness for Next Phases

### E1. Boot sequence readiness

- Is the home screen ready to be loaded by a Linux boot script?
- Any hardcoded paths that would break on the Chromebook?
- Any features that require a web server vs. loading as a local file?

### E2. Lockdown readiness

- Which URLs need to be whitelisted for each app to work?
- Are there any external resources the home screen loads that would be blocked?
- Google sign-in flow: will it work inside a locked-down Chromium?

### E3. Future app readiness

- Is the "Add App" feature designed well enough to build?
- Is the settings panel structured to accommodate more apps?
- Is there room in the dock for 4-5 apps without crowding?

---

## Output format (EXACT)

Use this format. One report per section.

````
# QUILL HAVEN ASSESSMENT — <date>

## PLAIN-ENGLISH SUMMARY

- Section A (Visual): N passes, M issues, K broken
- Section B (Code): N clean, M warnings, K problems
- Section C (Features): N done, M partial, K not started
- Section D (Project): <one-sentence verdict>
- Section E (Readiness): <one-sentence verdict>

Things Marie should know first:
1. <plain-English bullet>
2. <plain-English bullet>
3. <plain-English bullet>

## RATINGS

Give an honest rating for each area:

| Area | Rating | Notes |
|---|---|---|
| Visual design | ★★★★☆ | <short note> |
| Code quality | ★★★☆☆ | <short note> |
| Feature completeness | ★★☆☆☆ | <short note> |
| Project health | ★★★★☆ | <short note> |
| Readiness for next phase | ★★☆☆☆ | <short note> |
| **Overall** | **★★★☆☆** | <short note> |

## A. VISUAL & DESIGN CHECK
### A1-A4
For each checklist item: ✓ pass / ⚠ minor / ❌ broken — with a short note.

## B. CODE QUALITY
### B1-B4
For each checklist item: ✓ pass / ⚠ minor / ❌ broken — with a short note.

## C. FEATURE COMPLETENESS
### C1. Done
- <feature> — works: <yes/partially/no>
### C2. Partially done
- <feature> — what's missing: <detail>
### C3. Not started
- <feature>
### C4. Undocumented
- <feature found in code but not in Game Plan>

## D. PROJECT HEALTH
### D1. Files
- <file> — <purpose> — needed: yes/no
### D2. Git
- <assessment>
### D3. GitHub
- <assessment>
### D4. Hooks
- <hook> — <does it work>

## E. READINESS
### E1-E3
- <plain-English assessment per area>

## SUMMARY COUNTS

- Visual checks passed: N / total
- Code checks passed: N / total
- Features done: N
- Features partial: N
- Features not started: N
- Dead files: N
- Bugs found: N

## TOP 10 THINGS TO FIX (do NOT fix — just list)

1. <specific thing> — why it matters
2. <specific thing> — why it matters
...

## WHAT I COULDN'T TEST

- <anything you couldn't verify and why>
````

---

## Hard rules — non-negotiable

1. **Don't fix anything.** Just report.
2. **Don't use confidence words** ("85% sure", "should be fine", "trust me it works"). Use plain words: "fully checked", "code reads right but didn't run", "didn't test".
3. **Every finding must include a specific file path, line number, or element name.** No vague verdicts like "the code looks clean overall".
4. **Actually open the preview in a browser and look at it.** Don't just read the code and guess what it looks like.
5. **Rate honestly.** Marie would rather hear "this needs work" than "looks great" followed by bugs. Prior AIs have told her things were clean when they weren't.
6. **Run every section.** If you stop early, say so at the top.
7. **Read the ENTIRE `index.html` file.** It's one file. No excuse to skip parts.
8. **Compare against the Game Plan.** If something in the Game Plan isn't built, that's a finding. If something is built but not in the Game Plan, that's also a finding.
