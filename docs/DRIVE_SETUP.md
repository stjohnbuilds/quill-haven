# Quill Haven — Google Drive setup (one-time)

This is the 10-minute, one-time setup that turns the "Save to Google
Drive" button in Quill Haven into a real one-click backup. You only do
this once, ever, regardless of how many Chromebooks you run Quill Haven
on.

Why: Google requires every app that wants to talk to Drive to register
itself first. You'll create a small "project" in Google's console under
your account, and Google will give you back an ID that says "Quill Haven
is allowed to ask users to sign in." Then Quill Haven uses that ID to
ask YOU to sign in (and any other future user too).

If you skip this, the "Save to Google Drive" button stays inactive —
"Full backup (.zip)" still works for downloading and dragging into Drive
manually.

---

## What you need

- The Google account you want backups to live in.
- About 10 minutes.
- A web browser that's not in kiosk mode (so you can actually see the
  Google Cloud Console).

## The steps

### 1. Make a project

1. Go to **console.cloud.google.com** in a normal browser.
2. Sign in with the Google account you want backups in.
3. At the top, click the project dropdown → **NEW PROJECT**.
4. Name it **Quill Haven** (organization can stay "No organization").
5. Click **CREATE**, wait ~10 seconds, then make sure the project
   dropdown now says "Quill Haven".

### 2. Turn on the Drive API for the project

1. Top-left menu (☰) → **APIs & Services** → **Library**.
2. Search **Google Drive API** → click it → **ENABLE**.

### 3. Configure who can use it

1. ☰ → **APIs & Services** → **OAuth consent screen**.
2. User type: **External** → **CREATE**.
3. Fill in:
   - **App name:** Quill Haven
   - **User support email:** your email
   - **Developer contact:** your email
   - (skip everything else)
4. Click **SAVE AND CONTINUE** until you reach **Test users**.
5. Click **ADD USERS**, paste your own email, **SAVE AND CONTINUE**.
6. Back to dashboard. You're done with this section.

> The "this app isn't verified" warning when you sign in later is
> NORMAL. It only matters if you want strangers to use Quill Haven. For
> your own use you click **Advanced → Continue** and that's it.

### 4. Create the Client ID

1. ☰ → **APIs & Services** → **Credentials**.
2. **CREATE CREDENTIALS** → **OAuth client ID**.
3. Application type: **Web application**.
4. Name: **Quill Haven Web**
5. Under **Authorized JavaScript origins**, click **ADD URI** and add
   BOTH:
   - `https://stjohnbuilds.github.io`
   - `http://localhost:8081`
6. Click **CREATE**.
7. A dialog shows your **Client ID** — copy it (looks like
   `1234567890-abcdef.apps.googleusercontent.com`).

### 5. Paste it into Quill Haven

1. Open Quill Haven.
2. Settings (top-right cog) → **Google Drive** row → click it.
3. A small popup asks for the Client ID — paste it, hit OK.
4. Click **Google Drive** again → "Sign in to Google" → sign in with
   the account you set up.
5. **Done forever.** The Settings row will now say
   "Connected as your@email.com".

### 6. Try it

1. Open Local Writing → click the Download icon (top of the side
   panel).
2. Pick **Save to Drive**.
3. A Word file (`Your Book.rtf`) lands in your Google Drive (root
   folder by default).

### 7. Turn on auto-backup (optional but nice)

Once you're connected, the Settings → Google Drive area shows a new
**Auto-backup to Drive** toggle. Flip it on and every 30 minutes Quill
Haven silently uploads a `quill-haven-autobackup-YYYY-MM-DD-HHMM.json`
to your Drive — so if anything ever happens to the device, the latest
30-min snapshot is already off-device.

---

## What gets uploaded — three different shapes

- **Save to Drive** (manual, single book/note) → one `.rtf` file with
  whatever's open in the writing app. Editable in Word.
- **Auto-backup** (silent, every 30 min when enabled) → one `.json`
  file with the FULL restorable state (every project, note, file
  setting). Used by "Restore backup" to put a fresh device back to the
  saved state.
- **All projects bundle** → goes to **device only**, never Drive.
  That's a `.zip` for reading off-device or moving onto a USB.

## Restoring later

In Settings → **Restore backup**, pick a `.json` or `.zip` from your
device. It confirms with the date + counts before replacing everything.
To restore from Drive: download the latest `quill-haven-autobackup-*.json`
from your Drive onto the new device, then use Restore backup.

## What if I lose the Client ID

Just repeat Step 4. It's reusable forever. If you ever want to delete
the project entirely, you can — Quill Haven would just go back to the
"Connect Google Drive" prompt and you'd make a new one.

## What this CAN'T do (today)

- **Direct restore from Drive without downloading.** Today restore
  means downloading the latest auto-backup `.json` from your Drive,
  then using Settings → Restore backup. A "Restore directly from Drive"
  one-click flow isn't built yet.
