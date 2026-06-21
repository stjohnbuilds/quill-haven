# TODO — Quill Haven

## Fix soon (found in the assessment)
- [ ] Bundle the boot font locally so it works without Wi-Fi
- [ ] Dock tooltip shows on top of an open app (small visual glitch)

## Build next (the big features)
- [ ] Add App button in settings (paste URL, name, pick colour)
- [ ] Drag to reorder apps (grip handle on each row, order saved)
- [ ] Make Dabble an add-on — defaults become Google Docs + Local Writing
- [ ] Storage space indicator in settings
- [ ] Code-health follow-up: each app icon is copy-pasted in a few spots —
      make the apps data-driven (defined once) while building "Add App"

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
