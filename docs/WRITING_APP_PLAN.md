# Local Writing app — plan & feedback

> **STATUS: plan confirmed by Marie 2026-06-21.** Ready to build once she says go.

## Navigation plan (Marie's — confirmed 2026-06-21)

**Sidebar / nav**
- Matches the **Typing & Tomes** sidebar feel: a quill nav that **pops out and
  slides back in** (collapses to a little faded quill).
- Two tabs inside it: **Notes** and **Projects**.

**Projects structure (like Typing & Tomes)**
- **Projects** contains projects.
- A project opens into **Chapters**.
- A chapter contains **Parts** (scenes).
- Each scene has **one header + one sub-header**.
- Everything **draggable** to reorder.

**Editor**
- **Simple formatting only:** bold, italic, underline, strikethrough, highlight.
- **Pull the highlight logic** from Typing & Tomes (its pastel highlight colours).
- Put the controls in **one centered pill panel** (all-in-one), with a **large
  writing space** below.

## Feedback captured 2026-06-21 (action once the plan is confirmed)

**Toolbar / editor**
- Remove the "Header" (H) button — it just looks like bold and is confusing.
- Add **strikethrough**.
- Keep Bold / Italic / Underline (they combine — good) and bullets.
- Default to a **Title + Subtitle** at the top instead of the header button.
- Number chapters with digits: "Chapter 1", "Chapter 2", … A new chapter should
  default to the next number (not the words, not just "New chapter").
- Let chapters be renamed.
- First-line indent: parked — Marie said "that's okay" for now.

**Sidebar (match Typing & Tomes)**
- Study T&T's `Sidebar.tsx` — the collapse-into-a-quill behaviour and faded style.
- Consider **highlights** (T&T has pastel highlight colours).

## Reference (READ-ONLY — do not edit)
- `/Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/components/Sidebar.tsx`
- `/Users/mariemackay/Dev/Typing-and-Tomes-3.3-active/components/EtherealEditor/`
