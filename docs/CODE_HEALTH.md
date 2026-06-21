# Quill Haven — Code Health & Structure

Goal: keep the project clean and easy to change. No one giant file, no big
blobs of code. Still no frameworks and no build step — the browser loads
plain files directly.

## Where we're heading (ground-up structure)

```text
home-screen/
├── index.html          # the home OS shell
├── shared/
│   └── theme.css       # THE skins (colour variables) — one source of truth,
│                       # linked by the home screen AND every app
└── apps/
    └── writing/
        ├── index.html  # the Local Writing app page (structure)
        ├── writing.css # its styles
        └── writing.js  # its logic (editor, chapters, saving)
```

## Rules of thumb

1. **One job per file.** Structure (HTML), looks (CSS), and behaviour (JS)
   stay apart once a thing is big enough to deserve its own files.
2. **Themes live once.** All skin colours sit in `shared/theme.css`. Nothing
   else redefines colours — every screen links this one file.
3. **Each built-in app is its own small folder** under `apps/`.
4. **Apps open as windows.** The home screen opens an app in an `<iframe>`
   pointing at the app's page, so the app stays fully separate from the home
   screen's code.
5. **Keep files small and readable.** If a file grows too big, split it.

## Where we are today (honest state)

- The home screen is still one file (`index.html`) with its CSS and JS inside
  it. That's fine for now — but the theme/colour part should move into
  `shared/theme.css` so the writing app can share the exact same skins.

## Code-health follow-ups (tracked in TODO.md)

- Move the home screen's theme variables into `shared/theme.css`.
- Later: split the home screen's own CSS and JS into `home.css` / `home.js`
  the same way, so `index.html` is just structure.

## How the Local Writing app fits

- Lives in `apps/writing/` as three small files.
- Links `shared/theme.css` and reads the saved theme (`qh-theme` / `qh-night`)
  so it always matches the home screen. It listens for theme changes so it
  updates live while open.
- Saves manuscripts to the device (localStorage). Offline-first.
- v1 stays simple: editor + small toolbar + chapters + autosave + word count.
  Notes/Projects tabs and the AI spell-checker come later.
