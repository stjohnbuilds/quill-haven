# TODO — Quill Haven

## Fix soon (found in the assessment)
- [ ] Bundle the boot font locally so it works without Wi-Fi
- [ ] Dock tooltip shows on top of an open app (small visual glitch)

## Build next (the big features)
- [ ] Local Writing v2 — Notes + Projects tabs sidebar (T&T feel), title+subtitle,
      strikethrough, numbered chapters, rename. WAITING on Marie's detailed nav
      plan — captured in docs/WRITING_APP_PLAN.md
- [ ] Drag to reorder apps (grip handle on each row, order saved)
- [ ] Storage space indicator in settings

## For the Chromebook (later)
- [ ] Boot sequence scripts (auto-start the home screen)
- [ ] Lockdown config (block everything except the writing apps + login + fonts + update)
- [ ] USB installer package
- [ ] README on GitHub so the repo explains itself

## Future
- [ ] AI spell checker in the writing app (3-level slider + off)

## Done
- [x] Home screen — background, orbs, top bar, clock, greeting, date
- [x] Dock with apps + hover tooltips
- [x] Top bar / Dock toggle
- [x] Settings panel (open / close / X / click-outside / Escape)
- [x] Clipboard history (within a session)
- [x] App views with traffic-light close buttons
- [x] Themes reworked into real skins — Purple (default), Wood, Slate, Dark (each re-colours the whole UI)
- [x] Removed the girly pastel themes
- [x] Night Light fixed — its own on/off toggle, warms the screen, reverts cleanly
- [x] Theme + Night Light saved between restarts
- [x] Boot animation — bigger quill, typewriter tagline, loading bar
- [x] All settings now save between restarts — brightness, dock/top, app on/off, clipboard
- [x] Update button fixed — downloads the latest version from GitHub and loads it
      (making it stick after a reboot is part of the Chromebook setup later)
- [x] Code health: split the one 958-line file into index.html (227 lines) +
      css/home.css + shared/theme.css + js/home.js — themes are now one shared file
- [x] Local Writing app — its own files (apps/writing/), EB Garamond editor,
      toolbar (bold/italic/underline/heading/bullets), chapters sidebar, autosave
      to device, word count, matches the theme. 2nd default app (green)
- [x] Apps are now data-driven (defined once) — dock, top bar, windows, and
      settings all render from one list; each icon defined once
- [x] Add App button — add your own app (name, website, colour); shows a letter icon
- [x] Remove apps — add-ons (incl. Dabble) can be removed; built-ins (Docs, Local
      Writing) stay. Dabble is now a default add-on, not hardcoded
