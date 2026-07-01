# Quill Haven 2.0 Sheet

Quill Haven is a writing-only Linux computer: it boots straight into a calm writing home screen and only gives access to approved writing tools.

## External App Tree

- **Installer** - sets up Linux, Chromium, Quill Haven files, startup, lockdown, and recovery tools.
- **Fullscreen browser** - Chromium is the hidden base layer that loads the home screen and web apps.
- **Quill Haven shell** - the always-available top layer for Home, app switching, status, Wi-Fi, power, updates, and settings.
- **Home screen** - the simple starting place with only writing apps and safe settings.
- **Writing apps** - Google Docs, Dabble Writer, Typing & Tomes, and Local Writing.
- **Files and backup** - local documents, pictures, USB, export, restore, and Drive backup.
- **Local helper** - the small Linux service that handles real device actions like power, Wi-Fi, screen sleep, and updates.
- **Update system** - checks for a new version, shows it clearly, and only applies it through the approved update path.
- **Docs and support** - plain instructions for setup, recovery, Drive backup, hardware, and future repairs.

## Helper

The helper is the small local Linux bridge: it lets Quill Haven ask the real computer to do things a web page cannot safely do by itself.

It handles:

- Power, restart, sleep, and screen-off.
- Wi-Fi/status checks and opening Wi-Fi settings.
- Going home or relaunching the fullscreen browser.
- Support-only terminal access.
- Applying approved updates to the helper, overlay, launcher, and device policy.

Problems it already solved:

- Updates can reach the device after setup, without re-running the installer.
- Helper, overlay, and launcher files can update from GitHub.
- Downloaded update files are checked against expected hashes before use.
- New helper code is compile-checked before replacing the live helper.
- The old helper is kept as a backup, so a crashing helper can roll back.
- Extension and launcher files are listed in a manifest, so the device knows what to pull.
- System policy files can be updated through a device manifest.
- Double-tapping update does not start two update jobs at once.
- The release script keeps version, emoji, and update hashes in step.

Quill Haven 2.0 should keep this helper idea, but rebuild it with locked access, allowed system paths only, and clearer all-or-nothing update results.

## Greatest Challenges To Solve

- Keep the browser hidden while still letting Google Docs and Dabble run as real web pages.
  - Solved by running Chromium in fullscreen kiosk mode and putting the Quill Haven shell over the real web pages, instead of trying to trap those sites inside a fake app frame.
- Make one clear Quill Haven shell on every page.
  - Solved by using a browser extension overlay for Home, app switching, status, settings, and power; Quill Haven 2.0 must remove any old duplicate shell underneath it.
- Lock the device to writing tools without trapping the user on a broken or blocked page.
  - Solved by launching straight into Quill Haven, using browser policy for site control, and keeping a Home/app switcher available above pages; Quill Haven 2.0 must make blocked pages bounce back cleanly.
- Protect writing data with automatic backup and safe restore.
  - Partly solved by local autosave, a full backup file, Drive upload, and all-or-nothing restore; Quill Haven 2.0 must make a second backup copy happen by default.
- Let the helper control Linux safely, without becoming an escape hatch.
  - Partly solved by keeping Linux actions in a small local helper service; Quill Haven 2.0 must lock that helper so only Quill Haven can call it.
- Make updates visible, reversible enough to trust, and unable to half-install.
  - Solved in shape by version numbers, changing emojis, checked file hashes, and a manual update gate; Quill Haven 2.0 must make the apply step all-or-nothing.
- Keep the whole structure simple enough that future work does not create duplicate paths again.
  - Solved by keeping the app as simple static files with clear outer parts; Quill Haven 2.0 must give each job one owner and delete old paths instead of hiding them.

## Appearance

Quill Haven should feel like a calm, literary writing OS: soft, polished, spacious, and quiet, not like a school laptop, dashboard, or normal website.

- **Overall vibe** - pastel, frosted-glass, gentle, bookish, modern, and distraction-free.
- **Background** - light pastel gradient by default, with subtle soft shapes; user photos can become wallpaper, but bars/panels must stay readable over them.
- **Themes** - Purple is default; Wood is warm neutral; Slate is cool grey; Dark is a full dark mode; Night Light is a separate warm screen filter.
- **Fonts** - system sans-serif for the OS interface, EB Garamond for the writing editor, Great Vibes only for the boot splash logo.
- **Spacing** - generous empty space on the home screen; compact but breathable rows in settings; no crowded toolbars.
- **Panels** - translucent white glass in light themes, dark glass in Dark mode, soft shadows, soft borders, and rounded corners.
- **Corners** - cards around 16px, app icons around 10px, small buttons around 7px.
- **App icons** - rounded-square pastel gradients with simple white line icons: Docs pink page, Local Writing green quill, Files blue folder, Dabble lavender, Typing & Tomes its own distinct writing/game icon.
- **Shell controls** - small, icon-first, always available, and visually lighter than the writing space.
- **Writing area** - calm blank page feeling, large readable serif text, minimal toolbar, no visual noise around the manuscript.
- **Motion** - slow and gentle: small hover lift/scale, calm fades, no bouncy or attention-grabbing animation.
- **Copy rule** - rebuild from this description, not by copying old CSS wholesale; copy the look, not the tangled structure.
