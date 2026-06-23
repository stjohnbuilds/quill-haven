# Real site wall on a non-formattable Chromebook — Google Family Link

The basic Not-Formattable setup (`SETUP.md` in this folder) gets you
Quill Haven opening on login with no shelf and no Chrome bar. But it
**hides** other sites, not BLOCKS them — if a user hunts around, they
can still find regular Chrome and browse anywhere.

If you want a real wall — Chrome physically can't visit anything except
Quill Haven and the 3 writing apps — the only path on a personal
Chromebook (without enrolling it in Google Workspace, which costs money
and is overkill) is **Google Family Link**.

> This is the same lockdown parents use for kids' devices. The
> mechanism is a "child" Google account managed from a "parent" Google
> account on a phone. It's awkward but it's the only thing that
> actually works at the OS level on a non-formattable Chromebook.

---

## What you need

- A phone with the **Family Link** app (free, Google).
- A second Google account to be the "child" account on the Chromebook.
  You can make a fresh one (it can be yours — `marie+kiosk@gmail.com`
  works fine as a Gmail alias).
- About 20 minutes.

## The shape of the setup

1. Your **main** Google account becomes the "parent".
2. A **second** Google account (the writer account) becomes the
   "child".
3. From your phone, you tell Family Link which sites the writer account
   is allowed to visit. That allowlist gets pushed to Chromebooks
   signed into that account.

---

## Step 1 — Make the writer account

If you don't already have a second Google account:

1. On any computer, sign out of Google.
2. Go to `accounts.google.com/signup` → make a fresh account. Email it
   something like `[yourname]writing@gmail.com`.
3. Note the password somewhere safe.

## Step 2 — Add Family Link on your phone

1. On your phone, install **Family Link** (App Store / Play Store).
2. Open it. Sign in with your **main** Google account.
3. Tap **+** (add member) → **Add child** → **Invite a child to join
   your family group**.
4. Enter the writer account's email + password from Step 1.
5. Follow Family Link's prompts to set the writer account up as a
   managed child account. Accept the consent screens.

## Step 3 — Set the site allowlist

In Family Link, with the writer account selected:

1. Tap **Controls** → **Google Chrome and the web**.
2. Choose **Only approved sites**.
3. Tap **Manage sites** → **Approved**.
4. Add each of these one at a time:
   - `stjohnbuilds.github.io`
   - `accounts.google.com`
   - `docs.google.com`
   - `drive.google.com`
   - `googleusercontent.com`
   - `gstatic.com`
   - `googleapis.com`
   - `app.dabblewriter.com`
   - `dabblewriter.com`
   - `typingandtomes.vercel.app`
5. Tap **Block** for any obvious distraction site you want to be extra
   sure of (optional — "Only approved sites" already blocks everything
   not on the allowlist).

## Step 4 — Sign the Chromebook in with the writer account

1. On the Chromebook, sign out of any current account.
2. At the login screen, **Add person** → sign in with the writer
   account.
3. The Chromebook will set itself up as a supervised device. This
   takes a few minutes.
4. Once signed in, run the normal **Not Formattable** setup
   (`SETUP.md`) under this writer account:
   - Open Chrome
   - Go to `https://stjohnbuilds.github.io/quill-haven/`
   - Install as app
   - Set to open at startup
   - Hide the shelf
   - Sign out + back in to test

## Step 5 — Test the wall

After the basic setup, try to visit anything not on your allowlist
(e.g. `https://example.com`). Chrome should show:

> **This site is blocked by your parent**

If you see that, the wall works. From now on the Chromebook is
physically locked to Quill Haven and the writing apps.

---

## Removing it later

In Family Link on your phone, you can:
- Add or remove sites from the allowlist any time
- Turn supervision off completely (the account becomes a normal Google
  account again)
- Stop using Family Link altogether

The Chromebook isn't permanently changed — it's all controlled by the
account's "supervised" status.

## Awkward bits to know up front

- Family Link is designed for kids. The phone app has "child"
  terminology throughout. You'll see "your child" all over the place.
  Ignore it — for our purposes it's just the words Google uses for
  "managed account".
- Some Google services show a "supervised account" banner when you
  sign in (Google Docs in particular). It's not loud but it's there.
- The writer account is a "real" Google account for backup purposes —
  Google Drive works normally inside it.
- If you want to also use Google Docs on this Chromebook with your
  MAIN Google account, you can't (Family Link blocks adding accounts).
  Pick one identity for the writing device.
