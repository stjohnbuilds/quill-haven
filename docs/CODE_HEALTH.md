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

## Where we are today

- **Done:** the home screen is split into `index.html` (structure, ~227 lines),
  `css/home.css` (looks), `js/home.js` (behaviour), and `shared/theme.css`
  (the skins). The old single file was 958 lines.
- The Local Writing app lives in `apps/writing/` as three small files and links
  the same `shared/theme.css`, so it wears the exact same skin.
- **Done:** apps are now data-driven — defined once in `js/home.js` and rendered
  into the dock, top bar, windows, and settings. Add/remove apps supported, so
  there's no more copy-pasted icon markup.

## Code-health follow-ups (tracked in TODO.md)

- Done: theme variables in `shared/theme.css`; home screen split into
  `home.css` / `home.js`; `index.html` is just structure; apps are data-driven
  (defined once) with add/remove support.
- Optional later: `js/home.js` could be split into `home.js` + `apps.js` if it
  keeps growing. Not needed yet.

## Deep-dive / full-scan checklist (for a tester or the next AI)

Run all of these and report pass / fail with evidence:

- [ ] **No duplicate functions** — `grep -oE "^function [a-zA-Z0-9_]+" home-screen/js/home.js | sort | uniq -d` returns nothing.
- [ ] **No orphaned CSS** — every class defined in a `.css` file is used in HTML or JS.
- [ ] **No dead markers** — no `TODO` / `FIXME` / `console.log` left in shipped code.
- [ ] **No leftover hardcoded markup** that should come from the data-driven app list.
- [ ] **One source of truth** — all colours live in `shared/theme.css`; every app is defined once in the `BUILTIN_APPS` / add-ons list in `home.js` (icon, colour, name pulled from there for dock, top bar, window, and settings).
- [ ] **One job per file** — structure (HTML), looks (CSS), behaviour (JS) kept apart; no giant blob.
- [ ] **No frameworks, no build step**; `index.html` is structure only.
- [ ] **Themes** — every skin keeps the light background + white panels (Dark excepted); only a faint tint + the accent colour change.
- [ ] **Works after reload** — theme, night light, brightness, app bar, app on/off, clipboard, and Local Writing content all persist.

## How the Local Writing app fits

- Lives in `apps/writing/` as three small files.
- Links `shared/theme.css` and reads the saved theme (`qh-theme` / `qh-night`)
  so it always matches the home screen. It listens for theme changes so it
  updates live while open.
- Saves manuscripts to the device (localStorage). Offline-first.
- v1 stays simple: editor + small toolbar + chapters + autosave + word count.
  Notes/Projects tabs and the AI spell-checker come later.
