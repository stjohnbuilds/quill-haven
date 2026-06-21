# Handover — Quill Haven (updated 2026-06-21)

## COPY-PASTE THIS into a fresh Claude Code chat to bootstrap:

You are continuing work on **Quill Haven** — a custom Linux-based OS for Marie's
Acer Chromebook Spin 311. On boot it shows a branded splash, then a clean home
screen with ONLY writing apps. No browser, no distractions. Locked by design.

Marie is non-technical. Talk like she's 10. Short. No jargon. Plan before
building. One task at a time. End every file-touching reply with a
"Files I changed:" footer. NEVER self-certify with "X% confident" (a hook blocks
it). Push to GitHub without asking when commits are sitting locally.

Project: /Users/mariemackay/Dev/QuillHaven/   GitHub: stjohnbuilds/quill-haven
Preview: the Claude Preview server (launch.json name "quillhaven", port 8081).

READ FIRST, in order:
1. CLAUDE.md
2. docs/GAME_PLAN.md
3. docs/CODE_HEALTH.md   (real file structure + a deep-dive checklist)
4. docs/IDEAS.md         (parked ideas)
5. docs/WRITING_APP_PLAN.md  (Marie still owes a detailed Notes/Projects nav plan)
6. TODO.md
7. This file

---

## GOTCHAS THAT WILL BITE YOU (read these)

1. **CACHING.** The home screen loads separate files (css/home.css,
   shared/theme.css, js/home.js) with a cache-buster `?v=N`. Marie's browser
   caches hard — when she says "nothing happened," it's usually stale cache.
   **Every time you change a CSS/JS file, BUMP `?v=`** in index.html (3 links),
   apps/writing/index.html (3 links), and `writing.src` in js/home.js. Currently
   at **?v=6**. Also tell her to hard-refresh (Cmd+Shift+R).
2. **Preview tab throttles timers in the background**, so the boot splash can
   "hang" in preview — fine on a real foreground screen. To preview the final
   boot frame, load the page with `#frozen`.
3. **St John Author Studio logo**: Marie sent a *screenshot for inspiration* — she
   does NOT have the file. Do NOT keep asking for it. The boot icon is a
   hand-drawn detailed quill; refine by eye if she wants.
4. **Verify in the browser** with the preview tools (screenshots). Clear
   localStorage + reload between checks; reset to defaults when done.

## CODE STRUCTURE (code health ~95/100 — keep it there)

- `home-screen/index.html` — structure only
- `home-screen/shared/theme.css` — ALL colours (the skins), one source of truth
- `home-screen/css/home.css` — home screen styles
- `home-screen/js/home.js` — home logic; **apps are data-driven** (one
  `BUILTIN_APPS`/`DEFAULT_ADDONS` list renders dock, top bar, windows, settings).
  `recolorAppIcons()` retints icons per theme without reloading views.
- `home-screen/apps/writing/` — Local Writing app (own 3 files), links theme.css.
- Checks: no duplicate functions, no orphan CSS. Run the deep-dive checklist in
  CODE_HEALTH.md before claiming done.

## THEMES (final model — do NOT revert to whole-screen tints)

- **Pastel** (default; swatch id is still `purple` in code, hover label
  "Pastel"), **Wood**, **Slate**, **Dark**.
- Light themes keep a near-white background + white panels; they only add a
  *faint* tint and change the **accent colour** (toggles, slider, settings icons)
  and the app-icon colours. Dark is the one full dark mode.
- **Hue slider** shows under Pastel AND Dark; it rotates every pastel + icon
  colour at once (body `hue-rotate`).
- Wood must read COOL (no yellow/green) — Marie is very sensitive to this.

## WHAT'S DONE

- Home screen, dock, top-bar mode (icons next to Wi-Fi), live clock.
- App windows have NO title bar; the open app's name shows centered/caps/faint in
  the top bar; close via right-click -> "Restart app / Close" (apps hide, they
  don't really close — nothing is lost).
- Settings: Wi-Fi (display), Brightness, Theme + hue slider, Night Light toggle,
  Google Account, App Bar (dock/top), Apps list, Add App, Clipboard history.
- Everything persists (theme, hue, night, brightness, dock/top, app on/off, clipboard).
- 4 themes + Night Light filter. Boot splash: "Quill Haven" fades in, detailed
  grey quill, typewriter tagline, loading bar.
- Add App (name + website + colour + icon). Remove app WITH a confirm popup.
  Dabble is a removable default add-on; Google Docs + Local Writing are built-in.
- Local Writing app: EB Garamond editor, bold/italic/underline/heading/bullets,
  chapters, autosave, word count, matches theme live.

## WHAT TO BUILD NEXT (queued — Marie asked for these)

1. **Add App pickers as DROPDOWNS** (she asked twice): a small "pill" for Colour
   and one for Icon, each opening a dropdown with lots of options (theme-aware:
   browns in Wood, slates/blues in Slate, pastels otherwise; else all colours).
   Roughly DOUBLE the current options.
2. **More/better icons** in the picker: keep quill (a touch more pointed), add
   **clover** (replace the leaf) and a **spiral notebook**; improve the "A"
   (letter) option — Marie thinks it looks bad.
3. **Common-apps quick list** to add popular apps in one tap.
4. **Drag-to-reorder apps** (grip handle), saved order.
5. **Storage indicator** in settings.
6. **Local Writing v2** — Notes + Projects tabs sidebar (T&T feel), title+subtitle,
   strikethrough, numbered chapters with rename. WAITING on Marie's detailed nav
   plan (docs/WRITING_APP_PLAN.md). Reference the read-only T&T Sidebar.tsx.
7. Chromebook phase: boot scripts, lockdown config, USB installer, README.

## MARIE'S STYLE / WATCH-OUTS

- She gets very frustrated when (a) changes don't appear (-> cache!), (b) you ask
  for something she already gave, (c) you misread and rebuild wrong.
- Colours: "still yellow" means HUE, not lightness — move cooler. Screenshot and
  check before claiming fixed.
- Reference Typing & Tomes (READ-ONLY) for editor/sidebar feel; build fresh.
