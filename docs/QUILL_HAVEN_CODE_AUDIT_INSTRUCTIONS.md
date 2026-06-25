# Quill Haven — Code Audit & Distribution-Readiness Instructions

Hand this file to an AI or developer to produce a **serious, read-only audit**
of the Quill Haven codebase before it goes on more devices. It is based on
Marie's general "App Distribution Readiness Audit Instructions" and tailored to
this specific project so the auditor does not have to rediscover the structure
from scratch.

---

## Core rule (read this first)

**The first pass is READ-ONLY.** The auditor must NOT fix, refactor, delete,
move, rename, clean up, rebuild, edit config, or change versions. The job is to
**understand, test what can be tested, and report with evidence.**

If a serious problem is found, document it clearly — do not silently fix it.

**No self-certifying.** Do not write "ready", "done", or give a confidence
percentage that isn't backed by evidence. Where something wasn't checked, say so
plainly under "Untested / uncertain".

---

## What this app actually is (so you audit the right thing)

Quill Haven is a **locked-down writing OS**: a wiped laptop running **Linux Mint
(X11/XFCE)** that boots straight into **Chromium in kiosk mode**, showing a home
screen plus three writing web apps (Google Docs, Dabble Writer, Typing & Tomes)
and nothing else. The device is a **Mac or Intel laptop running Linux** (currently
a Microsoft Surface Laptop Go) — NOT a Chromebook, NOT an iPad.

It is built in **three layers**. You must understand all three and how they talk:

1. **Home screen** — `home-screen/` (static HTML/CSS/JS, hosted on GitHub Pages
   at `stjohnbuilds.github.io/quill-haven/`). The visual source of truth: icons,
   colours, settings, the app list. Key file: `home-screen/js/home.js`.
2. **Overlay extension** — `extension/` (a Chrome/Chromium MV3 extension injected
   on EVERY page so a status pill + app switcher float on top of every app,
   including Google Docs). Key files: `manifest.json`, `quill-overlay.js`,
   `quill-overlay.css`, `qh-early.js`, `qh-bg.js`, `confirm.js`.
3. **Helper** — `helper/` (a local Python service on port 8137 for
   power/wifi/screen-off/terminal, plus a self-updater that pulls new files from
   GitHub). Key files: `helper.py`, `launch-home.sh`, `helper-manifest.json`,
   `device-manifest.json`, `qh-admin.sh`, `quill-haven-policy.json`.

Plus `setup.sh` at the repo root — the one-command installer
(`curl -L .../setup.sh | bash`) that turns a fresh Mint install into Quill Haven.

### Source-goal files to read FIRST (do not invent goals from code)
`CLAUDE.md`, `HANDOVER.md`, `README.md`, `TODO.md`, `devices/SETUP.md`,
`docs/HARDWARE_REQUIREMENTS.md`, and anything under `docs/`. If a goal is missing,
say so — don't guess.

---

## Known high-risk areas to investigate (do not assume — verify)

These are suspected weak spots. Confirm or clear each with evidence. Do **not**
treat this list as the finding; treat it as where to point the microscope.

1. **App list defined in two places (single-source-of-truth risk).**
   - The home screen defines built-in apps in `home-screen/js/home.js`
     (`BUILTIN_APPS`) and stores user-added apps in `localStorage` (`qh-addons`).
   - The overlay (`extension/quill-overlay.js`) keeps its **own copy** of the
     built-in apps ("copied verbatim from home.js") and reads added apps from
     `chrome.storage.local`, synced from the home screen by a bridge
     (`bridgeHome()`).
   - **Investigate:** Can an app added in the home settings fail to appear in the
     overlay's bottom-right switcher? When does the bridge run, and what happens
     to the switcher on pages that are NOT the home screen (where the overlay
     can't read the home's `localStorage`)? Is there any single source of truth?
     Map exactly how `qh-addons`, `qh-apps`, `qh-order` flow from `localStorage`
     → `chrome.storage.local` → the overlay, and where that sync can lag or drop.

2. **The same file list is maintained in three places (drift risk).**
   - `extension/manifest.json` declares which extension files exist (service
     worker + content scripts).
   - `setup.sh` hard-codes which extension files to download on a fresh install.
   - `helper/helper-manifest.json` lists every file (with sha256) for the
     self-updater.
   - **Background:** a real bug already occurred here — `setup.sh` downloaded only
     5 of the 8 extension files, so a fresh install loaded no overlay. Check
     whether these three lists are still in sync, and whether anything enforces
     that they stay in sync.

3. **Version/emoji is stored in multiple places (drift risk).**
   - A version + emoji appears in `version.json`, in `extension/quill-overlay.js`
     (`LOCAL_VERSION`), in `home-screen/js/home.js`, and a separate version in
     `extension/manifest.json`. The project rule is that all must be bumped
     together every release. **Check whether they currently agree.**

4. **Data safety on the self-update restart.**
   - The helper restarts Chromium to apply updates. Local apps (the writing pad,
     files view) store data in `localStorage`. **Investigate:** can an
     update-restart or a kiosk relaunch lose unsaved writing, drop a session
     login, or clear local data? What is saved, when, and what warns the user?

5. **The two-layer hide of native chrome.**
   - `qh-early.js` hides Linux/Chromium's native UI; the overlay removes the hide
     on error so it can't strand the user with no buttons. **Verify** that
     failure path: if the overlay throws, does the user still have a way to reach
     apps, power, and wifi?

6. **Privileged surface.** The helper exposes HTTP endpoints on `127.0.0.1:8137`
   and can run system actions; `qh-admin` runs with passwordless sudo to place
   files. **Inspect** what the endpoints accept, whether anything beyond
   localhost can reach them, and exactly what `qh-admin` / `device-manifest.json`
   can write as root.

7. **No automated tests (suspected).** Confirm whether any tests exist at all,
   and treat the absence as a code-health risk per the scoring below.

---

## What to produce (required report sections)

Follow this structure. Tie every finding to evidence (a file + line, a command
output, a screenshot, or a reproduced step).

1. **Executive summary** — overall readiness (not assessed / not ready / partly
   ready / likely ready / ready-with-evidence), biggest risks, top next actions,
   what was not checked.
2. **Source goals read** — which goal files you read, the app's purpose, users,
   target platform, and a short "done means" definition. Note missing goals.
3. **External tree map** — actual top-level folders/files; for each: type
   (source/docs/build/config/asset/unknown), purpose, distribution relevance,
   risk. Flag duplicates, stale outputs, secrets, unclear active folders.
4. **Internal tree map** — how the three layers work and talk; the data flow for
   each important data type (typed text, settings, app list, background image,
   files) through `localStorage` ↔ `chrome.storage` ↔ overlay; what happens on
   restart and on failed save.
5. **Feature & user-pathway map** — each main journey (boot → home; open an app;
   switch apps via the bottom-right switcher; add/remove an app; change settings;
   drag the pill; screen-off + wake; self-update). For each: steps, expected
   result, files involved, tested? (yes/no/partial), result, issues.
6. **Testing performed** — name, method, test data, result, evidence, remaining
   uncertainty. Use only fake/disposable data; never real manuscripts.
7. **Issues found** — use the issue format below.
8. **Data, save & cloud safety** — what's stored locally vs in Google
   Docs/Dabble (external cloud); data-loss risks on update-restart, profile wipe,
   or kiosk relaunch.
9. **Packaging & distribution risks** — the `setup.sh` install path, the helper
   self-update (sha-verified), `device-manifest` + `qh-admin`, the Surface
   Secure-Boot/touch-driver path. Flag dev-vs-real-device differences and the
   three-place file-list drift.
10. **Code-health assessment + structure score** — see scoring below.
11. **Coverage tracker** — the table below; mark every area Yes/No/Partial.
12. **Untested or uncertain areas** — be explicit; hide nothing.
13. **Recommended next debugging/fixing order** — highest risk first.

---

## Issue format (use for every issue)

1. Issue ID
2. Title
3. Severity: blocker / high / medium / low
4. Confidence: confirmed / likely / needs-testing
5. Location: file + line / screen / workflow / command
6. What is wrong
7. Why it matters
8. How to reproduce or verify
9. Evidence found
10. Suggested next step
11. (Do not fix during this read-only audit)

**Severity guide:** blocker = can't launch / main workflow unusable / data loss
likely / severe privacy risk. high = important feature fails, unreliable
save/sync, real-device behaviour differs from dev. medium = edge-case failures,
confusing UX, poor performance, missing tests on risky logic. low = polish,
naming, small inconsistency.

---

## Code-health percentage (evidence-based, not a kindness score)

Score 0–100% using this weighting (adjust only with a stated reason):

| Category | Weight |
| --- | ---: |
| Single source of truth (app list, file lists, version) | 20% |
| Clear separation of the 3 layers + responsibilities | 15% |
| Data/save safety (local + update-restart) | 15% |
| Main workflow reliability (boot, switch app, settings, update) | 15% |
| Error handling & safe-failure (never strand the user) | 10% |
| Test coverage & quality | 10% |
| Install/update/distribution structure | 10% |
| Maintainability & clarity for a new dev/AI | 5% |

For each category give: score, evidence, main weakness, confidence. Then a total,
a label, and a plain-language explanation. Mark the score **provisional** if major
areas were not tested. A single blocker or data-loss risk can keep the app
"not ready" even with a decent average.

Labels: 90–100 strong · 75–89 mostly healthy, fix some first · 60–74 workable but
risky · 40–59 fragile, needs focused repair · 0–39 unsafe/too unclear.

---

## Coverage tracker (include filled-in)

| Area | Checked? | Method | Result | Remaining uncertainty |
| --- | --- | --- | --- | --- |
| Source goals | | files read | | |
| External tree | | folder inspection | | |
| Internal tree + data flow | | code inspection | | |
| App-list single-source | | code inspection | | |
| File-list drift (setup/manifest/helper-manifest) | | compare lists | | |
| Version/emoji drift | | compare files | | |
| Main workflows | | manual/code | | |
| Self-update + restart safety | | code/manual | | |
| Local data save/load | | manual/code | | |
| Overlay safe-failure path | | code/manual | | |
| Helper endpoints / sudo surface | | code inspection | | |
| Visual / UX | | screenshot/manual | | |
| Tests | | run/inspect | | |
| Code-health score | | weighted scoring | | |

---

## Stop conditions

Stop and report if: the app is too large to audit honestly in one pass; goals are
missing/contradictory; the active app version is unclear; a main workflow fails;
a data-loss risk is found; the overlay can strand the user; or testing would
require installing/building/modifying files (which this read-only pass forbids).
Stopping with a clear report is success, not failure.

## Final statement (pick one, only if evidence supports it)

- "Not ready for distribution based on the issues above."
- "Partly ready, but the untested areas above must be checked first."
- "Ready only in the areas verified above."
- "Distribution-ready based on the completed checks listed above."
