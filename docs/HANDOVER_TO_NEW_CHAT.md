# Handover — 2026-06-21

## COPY-PASTE THIS into a fresh Claude Code chat to bootstrap the next session:

```
You are continuing work on Quill Haven — a custom Linux-based operating
system for Marie's Acer Chromebook Spin 311. When the Chromebook boots,
it shows a branded "QuillHaven" splash animation, then a clean home
screen with ONLY writing apps. No browser, no settings to wander into,
no distractions. Locked by design.

Marie is non-technical. Talk like she's 10. Short. No jargon.
End every file-touching reply with a "Files I changed:" footer.
NEVER self-certify with "X% confident" — the hook blocks it.
Plan before building. One task at a time.

THE PROJECT: /Users/mariemackay/Dev/QuillHaven/
Read these files FIRST (in order):
1. CLAUDE.md — project rules
2. docs/GAME_PLAN.md — full blueprint, app tree, design language
3. TODO.md — what's done and what's next

WHAT'S DONE:
- Home screen (home-screen/index.html) — single static HTML file, fully working
- Pastel gradient background with animated frosted orbs
- Top bar with Wi-Fi, battery, settings cog, date/time
- Centered clock + greeting + date
- Frosted glass dock with 2 apps: Google Docs (pink, FIRST) then Dabble Writer (lavender)
- Dock/Top bar toggle in settings
- App icons centered in both dock and top-bar mode
- Settings panel: Wi-Fi, Brightness slider, Appearance themes, Google Account, App Bar toggle
- 5 themes: Blossom (pink default), Ocean (blue), Sage (green), Dark (purple-grey), Night Light (warm sepia)
- Theme choice saved to localStorage
- Clipboard history with copy-to-clipboard and toast notification
- App views with traffic-light close buttons (iframes)
- Update checker (fetches version.json from GitHub)
- Boot splash: "QuillHaven" writes out in script font (Great Vibes) with quill icon, then fades to home screen
- Game Plan doc (docs/GAME_PLAN.md)
- AI Assessment Prompt (docs/AI_ASSESSMENT_PROMPT.md) — ready to hand to another AI for full audit
- Hooks set up (.claude/hooks/)
- GitHub repo: stjohnbuilds/quill-haven (public)

WHAT TO BUILD NEXT (in order):
1. LOCAL WRITING APP — the big one. Called "Local Writing" with a
   faded subtitle "Saves to device, not the cloud". Pastel green icon.
   - ContentEditable editor (like Typing & Tomes uses — reference only)
   - EB Garamond font, line-height 2.1, text-indent 1.15em
   - Formatting toolbar (bold, italic, etc.)
   - Sidebar with Notes tab and Projects tab
   - Chapters navigation in sidebar
   - Saves to localStorage (offline-first)
   - IMPORTANT: The writing app skin MUST match the active theme.
     There are 5 themes already (Blossom/Ocean/Sage/Dark/Night Light)
     defined as CSS classes on <body>. The writing app's background,
     text colours, toolbar, and sidebar should all respond to the
     current theme — use the same CSS class pattern (body.theme-dark,
     body.theme-ocean, etc.) so it automatically matches.
   - AI spell checker with 3-level slider (proof/light edit/line edit) + off position (future, not first build)
   - Reference: /Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/components/EtherealEditor/
   - DO NOT copy T&T code — it's reference-only. Build fresh, simpler.

2. ADD APP BUTTON — in settings, below apps list. Paste a URL, give
   it a name, pick a colour. Saves to localStorage. Also add drag-and-drop
   reordering of apps (three faded dots grip handle on each app row so
   users can drag them into any order they prefer).

3. MAKE DABBLE WRITER AN ADD-ON — Google Docs is the only true default.
   Dabble Writer is currently hardcoded but should become an add-on that
   Marie adds via the Add App button. For now it ships as a default, but
   once Add App works, it should move to an "added" app that can be
   removed. The Local Writing app is the second default (built-in).

4. STORAGE INDICATOR — bar in settings showing localStorage usage.

5. BOOT SEQUENCE — Linux scripts for auto-login + auto-launch Chromium in kiosk mode.

6. LOCKDOWN CONFIG — Chromium policy JSON blocking all sites except whitelisted writing apps.

7. USB INSTALLER — everything bundled for a fresh Chromebook setup.

THE HARDWARE: Acer Chromebook Spin 311 (11.6", MTK MT8183, 4GB RAM,
64GB storage). Bought used for $100. Not here yet. Will wipe ChromeOS
and install lightweight Linux.

THE APPS:
- Google Docs: https://docs.google.com (pink) — DEFAULT, always first
- Local Writing: built-in (pastel green) — DEFAULT, second
- Dabble Writer: https://app.dabblewriter.com (lavender) — ADD-ON
- Typing & Tomes: https://typingandtomes.vercel.app (bluish purple) — ADD-ON
- Always whitelisted: https://accounts.google.com

DESIGN LANGUAGE:
- Pastel gradients with frosted glass (backdrop-filter blur)
- System font stack, gentle animations
- 5 themes: Blossom/Ocean/Sage/Dark/Night Light — ALL new features must support all themes
- Soft hover (scale 1.08, lift 3px), white tooltips
- No frameworks, no build step — static HTML/CSS/JS only

PREVIEW: python3 -m http.server 8081 -d home-screen (port 8081)
```

---

## 1. WHO IS THE USER

Marie. Non-coder. Writing LitRPG romance novels. **Plain English, short, no jargon. Talk like she's 10.**

**NEVER:** repeat back her own idea as your own. Self-certify with a confidence percentage. Add features she didn't ask for.

Every file-touching reply ends with a **"Files I changed:"** footer.

## 2. HARD RULES

- Plan before building. One task at a time.
- No frameworks — static HTML/CSS/JS only.
- Never edit reference-only files (the T&T codebase is read-only reference).
- "Files I changed" footer is mandatory.
- No confidence percentages — plain words only.
- Push without asking when commits are sitting locally.

## 3. READ THESE FILES IN ORDER

1. `/Users/mariemackay/Dev/QuillHaven/CLAUDE.md`
2. `/Users/mariemackay/Dev/QuillHaven/docs/GAME_PLAN.md`
3. `/Users/mariemackay/Dev/QuillHaven/TODO.md`
4. This handover file

## 4. CURRENT STATE

- **Project folder:** `/Users/mariemackay/Dev/QuillHaven/`
- **GitHub:** `https://github.com/stjohnbuilds/quill-haven`
- **Latest commit:** `2a24014` — Google Docs first, Dabble second
- **Preview server:** port 8081
- **The T&T project** (`/Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/`) is separate. Use it as READ-ONLY reference for the writing app architecture, NOT as code to copy.

## 5. TOP PRIORITY: LOCAL WRITING APP

Marie wants a built-in writing app as a second default app on the home screen. Called "Local Writing" with a faded subtitle underneath: "Saves to device, not the cloud."

Key decisions already made:
- ContentEditable with document.execCommand for formatting (same approach as T&T)
- EB Garamond font, generous line-height
- Sidebar with Notes and Projects tabs, chapters navigation
- localStorage for persistence (offline-first)
- AI spell checker later (OpenAI API, 3-level slider) — NOT in the first build
- Pastel green icon colour
- **The writing app's skin MUST match the active theme.** There are already 5 themes (Blossom, Ocean, Sage, Dark, Night Light) applied via CSS classes on `<body>`. The editor background, text colours, toolbar, sidebar — everything — should respond to these theme classes so it automatically matches whatever the user has picked. Look at how `body.theme-dark`, `body.theme-ocean`, `body.theme-sage` are defined in `index.html` for the pattern.
- Push finished work to GitHub for version control

Reference files (READ ONLY):
- `/Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/components/EtherealEditor/EtherealEditor.tsx`
- `/Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/components/EtherealEditor/Toolbar.tsx`
- `/Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/components/EtherealEditor/editorStyles.css`
- `/Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/api/editor-suggestions.ts`

## 6. SECOND PRIORITY: ADD APP + DRAG REORDER

After the writing app, build the Add App button in settings. Also add drag-and-drop reordering — each app row in settings gets three faded dots (grip handle) so the user can drag apps into any order. This order should be saved to localStorage and reflected in both the dock and top-bar mode.

Once Add App works, Dabble Writer should become an add-on (not hardcoded). Google Docs and Local Writing are the two true defaults.

## 6. WHERE THINGS LIVE

| What | Where |
|---|---|
| Project root | `/Users/mariemackay/Dev/QuillHaven/` |
| Home screen | `home-screen/index.html` (single file, all CSS+JS embedded) |
| Game Plan | `docs/GAME_PLAN.md` |
| AI Assessment | `docs/AI_ASSESSMENT_PROMPT.md` |
| This handover | `docs/HANDOVER_TO_NEW_CHAT.md` |
| Task list | `TODO.md` |
| Project rules | `CLAUDE.md` |
| Version file | `version.json` |
| Hooks | `.claude/hooks/` |
| Preview config | `.claude/launch.json` (port 8081) |

## 7. THINGS MARIE HAS BEEN FRUSTRATED ABOUT IN THE PAST

- AI adding features she didn't ask for (spell check toggle, About section)
- AI not completing ALL parts of a change (leaving T&T in the dock when she said remove it)
- AI not making sample data visible on localhost for testing
- AI self-certifying instead of being honest
- Having to repeat herself multiple times

Learn from this. Do exactly what she asks, nothing more, nothing less. If you're not sure, ask.
