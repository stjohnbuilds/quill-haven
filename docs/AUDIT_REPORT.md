# Quill Haven — Code Audit Report (read-only)

**Date:** 2026-06-24
**Scope:** Full static read-only audit per `docs/QUILL_HAVEN_CODE_AUDIT_INSTRUCTIONS.md`.
**What was done:** All three layers read in full (home-screen, extension, helper),
plus `setup.sh`, version files, and manifests. Nothing was edited, fixed, or moved.
**What was NOT done:** No on-device / live testing. The kiosk was not booted; the
500 ms autosave, `beforeunload` timing, sync-lag reload count, and stranding path
were reasoned from code, not observed running. Items needing that are marked
`needs-testing`.

---

## 1. Executive summary

**Readiness: PARTLY READY — needs focused repair before going on more devices.**

The code is, on the whole, careful and defensive — saves are debounced and flushed,
deletes are soft with undo, quota errors surface clearly, and the overlay restores
the native UI if it crashes. There is no outright "won't launch" blocker. But there
are a handful of real risks that matter before distribution:

**Biggest risks (highest first):**
1. **Data loss exposure** — the only copy of the user's writing is single-device
   browser storage (`localStorage`); Drive backup is OFF by default and needs setup.
   A profile reset loses the novel with no warning. (high)
2. **Helper security** — the local service on `127.0.0.1:8137` has *no auth*; a
   `/terminal` and `/poweroff` endpoint can be hit by any local process or stray web
   page. And the root file-writer (`qh-admin`) can write *any* file to *any* path,
   trusting a manifest fetched from GitHub with self-supplied hashes. (high)
3. **Stranding risk** — if the overlay script ever fails to run (parse error, crash
   before its try/catch), the native buttons stay hidden with no self-timeout to
   restore them — a kiosk with no apps/power/wifi. (high, needs-testing)
4. **Update can look like it didn't land** — the service worker is cache-first and
   its version is stale at 3.1, so new app code can be masked until "Update" is
   tapped. Directly affects Marie's "which version am I on" trust signal. (medium)
5. **App list duplicated** in home.js and the overlay, and **already drifted**. (medium)

**Top next actions:** add a token/origin check to the helper; constrain `qh-admin`
to an allowlist of destination paths; add a self-clearing timer to `qh-early.js`;
bump the service-worker version on release; make the duplicated app list a single
source; turn on (or strongly prompt) local backup.

**Code-health score: 57 / 100 (provisional)** — "fragile, needs focused repair."
See §10.

---

## 2. Source goals read

Read: `CLAUDE.md`, `HANDOVER.md`, `README.md`, `TODO.md`, `devices/SETUP.md`,
`docs/` (this audit's instructions, plus the others present).

- **Purpose:** a locked-down "writing OS" — a wiped Intel/Mac laptop running Linux
  Mint that boots straight into Chromium kiosk showing a home screen + 3 writing web
  apps and nothing else.
- **User:** Marie. Non-technical. Single owner-operator.
- **Platform:** currently a Microsoft Surface Laptop Go running Linux Mint (X11/XFCE).
  NOT a Chromebook, NOT an iPad.
- **"Done means":** powers on → writing home screen → can open Docs / Dabble /
  Typing & Tomes and a local writing pad → never gets stranded, never silently loses
  writing → updates land and are visible.

**Goal conflict found:** `CLAUDE.md` lists the three apps as Google Docs, Dabble,
and Typing & Tomes. But the home screen's built-in list (`home.js:241-251`) ships
only **Google Docs, Local Writing, Files** — Dabble and Typing & Tomes are NOT
seeded (`DEFAULT_ADDONS = []`, `home.js:256`) and must be added by hand. The doc and
the code disagree about what ships by default. (low)

---

## 3. External tree map

| Path | Type | Purpose | Distribution relevance | Risk |
| --- | --- | --- | --- | --- |
| `home-screen/` | source | the GitHub-Pages-hosted UI (home + writing + files apps) | served from web, not on device | data lives here |
| `extension/` | source | MV3 overlay (pill + switcher) injected on every page | pulled to device by setup/updater | app-list duplication |
| `helper/` | source | local Python service (port 8137) + self-updater + root installer | pulled to device | security surface |
| `setup.sh` | install | one-command installer | the front door | file-list must match manifest |
| `version.json` | config | remote source of truth for version/emoji | drives the update pill | OK |
| `tools/release-helper.sh` | build | release helper | dev only | — |
| `docs/`, `devices/` | docs | goals, setup, this audit | reference | some overlap/staleness |
| `index.html` (root) | source | redirect/landing | minor | — |
| `remove-touch.sh` | install | one-time Surface touch-driver removal | device-specific | — |
| `.DS_Store` | junk | macOS cruft, tracked in repo? | none | tidy-up only |

No secrets found in any tracked file. No build artifacts. The active app version is
clear (4.3 / 💤 in the three user-facing places).

---

## 4. Internal tree map & data flow

**Three layers, cleanly separated:**

- **Home screen** (`home-screen/`, served from GitHub Pages) — the visual source of
  truth. Owns the built-in app list, settings, and the two local apps (writing,
  files) that store data in `localStorage`.
- **Overlay extension** (`extension/`, on device) — injects a status pill + bottom-
  right app switcher on *every* page so the user can navigate even inside Google
  Docs. Keeps its own hard-copy of the built-in app list and reads added apps from
  `chrome.storage.local`.
- **Helper** (`helper/`, on device) — Python service on `127.0.0.1:8137` for
  power/wifi/screen-off/terminal/go-home, plus a 6-hourly self-updater that pulls new
  files from GitHub and can place files as root via `qh-admin`.

**App-list data flow:**
`home.js` writes `qh-addons` / `qh-apps` / `qh-order` to **page localStorage**. The
overlay's `bridgeHome()` (`quill-overlay.js:470`) — which runs *only* on the home
origin, and only at init or on a timezone change — copies those into
`chrome.storage.local`. The overlay's switcher reads from `chrome.storage.local`.
On non-home pages (Docs, Dabble) the overlay genuinely cannot read the home's
localStorage (different origin), so it shows the *last synced* list. **There is no
single source of truth**, and the sync only fires on a home-page reload — see §5
and Issue QH-5.

**Settings/look flow:** the reverse direction — theme/timezone flow
`chrome.storage` → `localStorage` inside `bridgeHome()`. The two directions don't
fight (app list goes one way, look goes the other). Sound design.

**Writing data flow:** writing app DOM → in-memory `data` (`flush()`) → debounced
500 ms → `localStorage['qh-writing2']` (`persist()`). Files app similarly →
`localStorage['qh-files']`. `beforeunload` flushes + persists; the home screen also
flushes every open iframe before tearing windows down. **On restart:** localStorage
is keyed to the stable profile dir (`--user-data-dir="$HOME/.quill-profile"`,
`launch-home.sh:52`), so it survives a normal Chromium relaunch — but NOT a profile
wipe, and a hard `pkill` can drop the last in-memory keystrokes.

---

## 5. Feature & user-pathway map

| Journey | Tested? | Result / issue |
| --- | --- | --- |
| Boot → home | code only | Reads correct; not booted live |
| Open an app | code only | Works in code |
| Switch app via overlay switcher | code only | Works, but list can be stale (QH-5) |
| Add / remove an app | code only | **Lag:** new app may need ~2 home reloads to appear in the overlay switcher (QH-5) |
| Change settings (theme/bg/tz) | code only | Works; `setBg` is the one unguarded write (QH-9) |
| Drag the pill | code only | Works; listeners never detached (cosmetic) |
| Screen-off + wake | code only | `/screen-off` via `xset`; fine |
| Self-update + restart | code only | Hash-checked; `pkill` restart can drop unsaved in-memory text (QH-4) |
| Overlay crash / no-overlay | needs-testing | Restores native UI on a *caught* throw; NOT if the script never runs (QH-3) |

---

## 6. Testing performed

Static code reading and cross-file tracing only. Concrete cross-checks run via
`grep`/file compare:
- Version/emoji across all five places (result in §3 / Issue QH-6).
- File list across `manifest.json` vs `setup.sh` vs `helper-manifest.json` (Issue QH-7).
- BUILTIN_APPS in `home.js` vs the overlay's hard-copy (Issue QH-8).

No live/runtime testing. No real manuscripts used (none touched at all).

---

## 7. Issues found

### QH-1 — Helper API has no authentication (poweroff / terminal / go-home reachable)
- **Severity:** high · **Confidence:** confirmed
- **Location:** `helper/helper.py:185-264`; CORS at `:186-190`
- **What's wrong:** No token, no auth, no server-side Origin check. The only "Origin"
  in the file is the *response* header `Access-Control-Allow-Origin` (`:187`) — that
  only controls whether a browser may *read* the reply; it does not stop the request
  arriving, and the side effect (power off, spawn terminal) has already happened.
- **Why it matters:** Any local process — or a stray web page via a no-cors POST —
  can hit `/poweroff`, `/reboot`, `/go-home`, or `/terminal`. `/terminal` spawns a
  real terminal emulator: a full shell escape from a "locked-down" OS whose whole
  premise is that no shell is reachable. `/poweroff` / `/go-home` are data-loss
  triggers (unsaved text).
- **Verify:** `curl -X POST http://127.0.0.1:8137/terminal` on the device.
- **Evidence:** `subprocess.Popen([term])` at `helper.py:239-243`; no `self.headers["Origin"]` read anywhere.
- **Next step:** require a per-install shared-secret header (forces a CORS preflight)
  or validate `Origin`/`Sec-Fetch-Site` server-side before acting. *(Do not fix in this read-only pass.)*

### QH-2 — Root file-writer can write anywhere; trusts a GitHub manifest's own hashes
- **Severity:** high · **Confidence:** confirmed
- **Location:** `helper.py:131,147-159,166` → `qh-admin.sh:17-21` → `setup.sh:150`
- **What's wrong:** `device-manifest.json` is fetched from GitHub; each entry's `dest`
  and `mode` are passed to `qh-admin` which runs as passwordless root and does
  `cp "$src" "$dest"; chmod "$mode" "$dest"` with **no allowlist of destinations**.
  The sha256 check is **self-referential** — the same manifest supplies both file and
  hash, so it cannot detect a malicious/changed manifest.
- **Why it matters:** Anyone who can change the repo (or MITM `raw.githubusercontent.com`)
  can write any root-owned file anywhere on every device — e.g. `/etc/sudoers.d/`,
  `/root/.ssh/authorized_keys`, or replace `qh-admin` itself. Today's manifest is
  benign (writes only the two Chromium policy files), but nothing in code constrains it.
- **Evidence:** `qh-admin.sh:20-21`; `setup.sh:150` `NOPASSWD: /usr/local/bin/qh-admin`.
- **Next step:** hardcode an allowlist of permitted `dest` paths in `qh-admin.sh`.

### QH-3 — No self-timeout in `qh-early.js`: a non-running overlay strands the user
- **Severity:** high · **Confidence:** likely (needs-testing to trigger)
- **Location:** `extension/qh-early.js` (whole file); recovery only in `quill-overlay.js:572-576`
- **What's wrong:** `qh-early.js` hides the native top-bar/dock at `document_start`
  and has **no timer to ever undo itself**. The undo lives entirely in the overlay's
  `catch`. If the overlay script never reaches its try — a parse/syntax error, the
  early `if (window.__qhOverlay) return` guard (`:13-15`), or a crash before the try —
  the hide persists forever and the home screen shows no buttons.
- **Why it matters:** Worst case for a kiosk: no apps, no power, no wifi, and by design
  no browser/OS chrome to fall back on. Recovery depends on a *different* file succeeding.
- **Evidence:** `qh-early.js` appends `#qh-early-hide` style, no `setTimeout`; overlay
  guard returns before the try at `quill-overlay.js:13-15`.
- **Next step:** add a self-clearing `setTimeout` in `qh-early.js` that removes the
  hide after ~4 s unless the overlay has signalled it is up.

### QH-4 — Update / `/go-home` kills Chromium with `pkill` (unsaved in-memory text lost)
- **Severity:** medium · **Confidence:** likely / needs-testing
- **Location:** `helper.py:122-123` (extras update), `:234-238` (`/go-home`)
- **What's wrong:** `pkill -x chromium` is not a graceful close. localStorage itself
  survives (stable profile dir), but any text typed since the last 500 ms autosave —
  or unsynced Google-Docs buffer — is lost, with no "saving…" guard or page signal first.
- **Next step:** signal pages to flush, or wait, before killing.

### QH-5 — App-list sync lags: an added app may need ~2 home reloads to reach the switcher
- **Severity:** medium · **Confidence:** confirmed
- **Location:** `quill-overlay.js:470-484,554-556`; `home.js:606-608` (`addApp`)
- **What's wrong:** `bridgeHome()` is the only path copying `qh-addons`/`qh-apps`/
  `qh-order` into `chrome.storage.local`, and it runs only at overlay init or on a
  timezone change. `addApp` writes localStorage + re-renders the home grid but never
  reloads and never touches `chrome.storage`. The overlay has no `storage.onChanged`
  listener. So a freshly added app shows in the home grid instantly but not in the
  bottom-right switcher until a reload (often two, since the switcher builds from the
  pre-bridge values in the same init).
- **Why it matters:** Reads as "I added the app but it's not in the corner menu" — looks broken.
- **Next step:** call `bridgeHome()` from `addApp/removeApp/saveOrder`, or add a
  `chrome.storage.onChanged` rebuild.

### QH-6 — Version drift: extension manifest and service worker stuck at 3.1
- **Severity:** medium · **Confidence:** confirmed
- **Location:** `extension/manifest.json:4` (`"version":"3.1"`),
  `home-screen/service-worker.js:10` (`VERSION='3.1'`, cache `quill-haven-3.1`)
- **What's wrong:** The three *user-facing* places agree (4.3 / 💤): `version.json`,
  `home.js:1243-1244`, `quill-overlay.js:22-23`. But the extension manifest and the
  service worker are both still 3.1, despite the SW's own comment saying keep it in
  step. The SW only rotates its cache and re-activates when its *own bytes* change —
  so a stale `VERSION` means the cache key never rotates on a version bump, and new
  app code can be masked until the manual "Update" button wipes caches (see QH-10).
- **Why it matters:** Directly undercuts Marie's "the changing emoji proves an update
  landed" trust signal — the page can keep serving old code while the pill says new.
- **Next step:** bump the SW `VERSION` (and the manifest version) every release.

### QH-7 — File-list maintained in three places (currently in sync; nothing enforces it)
- **Severity:** medium · **Confidence:** confirmed
- **Location:** `extension/manifest.json`, `setup.sh:110-119`, `helper/helper-manifest.json:5-13`
- **State:** **Currently consistent** — all three list the same 8 extension files.
  The historical "downloaded only 5 of 8" bug is fixed. But the lists are hand-kept
  with no check that they stay aligned; the next added/removed extension file can
  silently desync again and produce a no-overlay install.
- **Next step:** generate the three lists from one source, or add a CI/check that
  compares them.

### QH-8 — Built-in app list duplicated in two files and already drifted
- **Severity:** medium · **Confidence:** confirmed
- **Location:** `home-screen/js/home.js:241-251` vs `extension/quill-overlay.js:31-41`
- **What's wrong:** The overlay holds a hand-copy of `BUILTIN_APPS` ("copied verbatim").
  It already differs — the overlay omits the `sub:` fields and carries hand-synced
  `?v=24`/`?v=8` cache-bust strings that must be mirrored by hand. Any future field or
  version bump on the home side must be manually duplicated or the overlay's local-app
  links break.
- **Next step:** single source (e.g. the overlay reads the list from `chrome.storage`
  seeded by the home screen, no hard-copy).

### QH-9 — `setBg` is the one storage write with no quota guard (silent fail)
- **Severity:** low · **Confidence:** likely
- **Location:** `home.js:178-181`
- **What's wrong:** Background image is written to `qh-bg` in a try/catch that
  swallows `QuotaExceededError` with no feedback, unlike the writing/files `persist()`
  which report "out of room." Image is downscaled first (≤1600px JPEG), so overflow is
  unlikely, but if it ever happened the background would silently fail to set.

### QH-10 — Service worker cache-first + `ignoreSearch` masks `?v=` cache-busting
- **Severity:** medium · **Confidence:** likely
- **Location:** `service-worker.js:48,57,64`; app srcs `home.js:245,248`
- **What's wrong:** The SW matches with `{ ignoreSearch: true }`, which strips the
  `?v=` query the apps use to bust cache — so bumping `?v=` does NOT defeat the SW
  cache. Combined with the stale SW VERSION (QH-6), a normal Pages deploy can keep
  showing old code until "Update" is tapped. The likeliest cause of a future "the
  update didn't land" report.

### QH-11 — No automated tests
- **Severity:** medium · **Confidence:** confirmed
- **Location:** whole repo (no test files in `git ls-files`)
- **What's wrong:** Zero tests. Every change is verified by hand on hardware. For the
  risky logic (sync, save, self-update, root-write), there is no safety net.

**Lower / safe (with evidence):** no command injection in the helper (fixed argv,
no `shell=True`); server bound to `127.0.0.1` only; no secrets in any file; soft
delete with undo in both apps; quota errors surface in writing/files; restore is
atomic with rollback; the overlay's *caught*-throw recovery works.

---

## 8. Data, save & cloud safety

- **Local (on device):** all writing in `localStorage['qh-writing2']`, all files in
  `localStorage['qh-files']`. Survives normal reload/relaunch (stable profile dir).
  Lost on a profile wipe. ~500 ms of keystrokes at risk on a hard kill (QH-4).
- **Cloud (external):** Google Docs / Dabble store in their own clouds — safe from a
  device wipe. The *local* writing pad has **no automatic backup by default** —
  `qh-drive-autobackup` is off until the owner sets up an OAuth client ID
  (`home.js:953,995`). **This is the single biggest real-world data-loss vector:** out
  of the box, the only copy of a novel written in the local pad is on one device, and
  a profile reset takes it with no warning. Drive-backup failures are also silent by
  design (`home.js:985-987`).

---

## 9. Packaging & distribution risks

- `setup.sh` is a `curl | bash` one-command installer — fetches helper + all 8
  extension files (currently complete). The `curl|bash` pattern itself is a trust
  point (no signature).
- Self-updater hashes are **enforced** before apply (`helper.py:71`), with a
  `py_compile` check, backup, and atomic replace — good — but hashes are
  self-referential (no signing key), so repo/MITM compromise = RCE + root (QH-2).
- Root path (`qh-admin` + `device-manifest`) is unconstrained (QH-2).
- Dev-vs-device gap: the helper is unreachable in a browser preview; the overlay
  shows a friendly "only on the Quill Haven laptop" message rather than failing
  silently — good for dev, but means much of this can only be truly verified on hardware.

---

## 10. Code-health score (provisional)

| Category | Weight | Score | Note |
| --- | ---: | ---: | --- |
| Single source of truth (app list, file lists, version) | 20% | 10/20 | app list duplicated+drifted; versions split; file lists hand-kept |
| Separation of the 3 layers | 15% | 12/15 | clean, well-defined boundaries |
| Data/save safety | 15% | 9/15 | good saving; but single-copy local, backup off by default |
| Main workflow reliability | 15% | 10/15 | works in code; sync lag; cache masking |
| Error handling & safe-failure | 10% | 6/10 | caught-throw recovery good; no-run stranding gap |
| Test coverage | 10% | 1/10 | none |
| Install/update/distribution | 10% | 5/10 | hashes enforced but unsigned; root write open |
| Maintainability & clarity | 5% | 4/5 | readable, defensive, well-commented |
| **Total** | | **57/100** | **fragile — needs focused repair** |

Provisional because on-device behaviour (stranding, autosave timing, sync reload
count) was not observed live. A couple of high-severity items (data-loss exposure,
helper security, stranding) keep this short of "ready" even though the average is mid.

---

## 11. Coverage tracker

| Area | Checked? | Method | Result | Remaining uncertainty |
| --- | --- | --- | --- | --- |
| Source goals | Yes | files read | done; doc/code app-list conflict | — |
| External tree | Yes | folder inspection | mapped | — |
| Internal tree + data flow | Yes | code inspection | mapped | live behaviour |
| App-list single-source | Yes | code inspection | duplicated + drifted (QH-8) | — |
| File-list drift | Yes | compare lists | in sync now; unenforced (QH-7) | — |
| Version/emoji drift | Yes | compare files | user-facing OK; SW+manifest stale (QH-6) | — |
| Main workflows | Partial | code | work in code | not booted |
| Self-update + restart safety | Partial | code | hash-checked; pkill data window (QH-4) | not run |
| Local data save/load | Partial | code | well-handled; single-copy risk | timing not observed |
| Overlay safe-failure path | Partial | code | caught throw OK; no-run gap (QH-3) | not triggered live |
| Helper endpoints / sudo surface | Yes | code inspection | no auth (QH-1); open root write (QH-2) | — |
| Visual / UX | No | — | not assessed | — |
| Tests | Yes | inspect | none (QH-11) | — |
| Code-health score | Yes | weighted scoring | 57/100 provisional | live areas |

---

## 12. Untested / uncertain

- Nothing was run on hardware. Stranding (QH-3), autosave/`beforeunload` timing
  (QH-4), and the exact reload count for sync lag (QH-5) are reasoned from code.
- Visual / UX pass not performed.
- Real-device differences (touch driver, Secure Boot, kiosk relaunch) not exercised.

## 13. Recommended fix order (highest risk first)

1. **QH-3** self-timeout in `qh-early.js` — never strand the user.
2. **QH-1** add auth to the helper API (kills the `/terminal` shell escape).
3. **QH-2** allowlist `qh-admin` destination paths.
4. **Data safety** — turn on / strongly prompt local backup; warn before a wipe.
5. **QH-6 / QH-10** bump the service-worker version; fix the cache-masking so updates land.
6. **QH-5 / QH-8 / QH-7** make the app list a single source; auto-derive the file list.
7. **QH-11** add at least smoke tests for save, sync, and the updater.

**Final statement:** *Partly ready — the untested on-device areas above (stranding,
save timing, update landing) and the high-severity security/data-loss items must be
addressed and verified on hardware first.*
