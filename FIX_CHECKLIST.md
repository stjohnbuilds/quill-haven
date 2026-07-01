# Quill Haven — Fix Checklist

Plain-English list of everything the full audit (2026-07-01) found worth fixing,
in the order we should do them. One at a time. Tick as we go.

## Fix first — these break the whole point of the device

- [x] **1. No-wifi fallback screen.** SHIPPED in 2.3.22 🦢 (2026-07-01), inside
      helper/launch-home.sh. When there's no wifi the laptop now shows a calm "No
      Wi-Fi yet — please connect" page with a wifi button, and slides into the
      writing screen by itself the moment it's online. Reaches the device on the
      next Update tap. Still to confirm: one real offline boot on the laptop
      (code reads right; not yet seen running on hardware).

- [ ] **2. Lock the back door.** Right now any website open in the browser can tell
      the computer to open a terminal, restart, or shut down — and Settings has a
      one-tap Terminal button with no confirm. Add a secret code the helper checks,
      and hide/PIN the Terminal button. (Already on TODO.md.)

- [ ] **3. Close the whole-of-Google hole.** Because Google Docs is built in, the
      block-list also lets through Google Search, Gmail and Google News. Tighten the
      rule so only docs.google.com opens, not all of google.com.

## Fix soon — protect your work and stop future sessions being misled

- [ ] **4. Save the safety fixes to GitHub.** Several fixes exist only on this laptop,
      unsaved — one "undo" wipes them. Commit them (carefully, file by file), and fix
      the release-helper script that would silently break the update channel if run.

- [ ] **5. Clean up the notes that lie.** Update CLAUDE.md (points at the wrong repo +
      a crashing release script), fix HANDOVER (says "Mac not Chromebook", says
      blocking is OFF when it's ON, says 3 apps when only Google Docs ships), refresh
      TODO/PUNCHLIST, and add "old — superseded" banners to the out-of-date docs.
      Also write down the real release steps (they currently live nowhere saved).

- [ ] **6. Fix the dead Claude hooks.** Correct .claude/settings.json in this repo, and
      use the copy-paste prompt to fix all the other apps too.

- [ ] **7. Retire the old app.** The old (3,293-line) app is still live at the exact web
      address the lock always trusts, with working power/update buttons. Either take it
      down or stop the lock auto-trusting it.

## Tidy up — lower risk, still worth doing

- [ ] **8. Block-list idle gap.** The first click after the browser has been idle can
      slip past the block-list. Make the lock wait until it's ready before allowing.

- [ ] **9. Catch failed page loads.** A typo or an offline tap lands on a dead error
      page with no dock and no way home. Make failed loads bounce back home.

- [ ] **10. Small cleanups.** Fix qh-diag.sh reporting the wrong version, remove two
      unused font files, and add a few missing block-list domains.

## Later / advanced (optional)

- [ ] **11. Pin releases.** The device follows the moving "main" branch with no tagged
      "known-good" version to roll back to. Add version tags so a bad push isn't
      instantly the product.
