# Device setup for Quill Haven

Quill Haven runs on any of these:

| Folder | For | Real site wall? | Time |
|---|---|---|---|
| **[`Windows/`](Windows/SETUP.md)** | Any Windows 10 or 11 laptop | Yes (via admin script) | ~10 min |
| **[`Mac/`](Mac/SETUP.md)** | Any Mac running macOS 12+ | Yes (via Screen Time) | ~15 min |
| **[`Chromebook/Formattable/`](Chromebook/Formattable/SETUP.md)** | Intel / AMD Chromebooks | Yes (baked into setup.sh) | ~1 hour |
| **[`Chromebook/Not Formattable/`](Chromebook/Not%20Formattable/SETUP.md)** | ARM Chromebooks (MediaTek / Rockchip / Snapdragon) | Yes (via Google Family Link) | ~10 min |

## Picking a path

- **Got a Mac or Windows laptop already?** Use it — those paths are
  shorter and the real-wall step is straightforward (Screen Time on
  Mac, registry script on Windows).
- **Buying a Chromebook?** Read [`Chromebook/BEFORE-YOU-BUY.md`](Chromebook/BEFORE-YOU-BUY.md)
  first — "supported" alone isn't enough; you also need the
  write-protect method to be one you can do without a specialist cable.
- **Already have a Chromebook?** Look up the model on
  [mrchromebox.tech](https://docs.mrchromebox.tech/docs/supported-devices.html).
  If it's Intel/AMD and the WP method is "screw" or "battery", use
  `Chromebook/Formattable/`. Otherwise use `Chromebook/Not Formattable/`.

## What "real site wall" means

Without the wall: Quill Haven opens fullscreen on login, but if a user
quits and opens the underlying browser they can still browse anywhere.

With the wall: the browser itself refuses to load anything outside the
Quill Haven allowlist (Quill Haven, Google sign-in, Google Docs/Drive,
Dabble Writer, Typing & Tomes). Pasting `facebook.com` shows a
"blocked" page. Survives reboots, browser updates, app updates.

Pick the wall path when you actually want a write-only device, not just
a write-mostly one.
