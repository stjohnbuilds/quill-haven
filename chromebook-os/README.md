# Chromebook setup

Two install paths for Quill Haven, one per Chromebook chip family.

## `Not Formattable/`

For Chromebooks with **ARM chips** (MediaTek, Rockchip, Qualcomm). These
can't have ChromeOS removed, so this path locks ChromeOS down instead:
install Quill Haven as the default app, hide everything else. No USB
needed. ~10 minutes.

→ Open `Not Formattable/SETUP.md`.

## `Formattable/`

For Chromebooks with **Intel or AMD chips**. These can have ChromeOS
wiped off completely and a custom OS installed in its place. The result
boots directly into Quill Haven — no sign-in, no Chrome, no other OS
underneath. Requires a **16GB USB stick** and about an hour.

→ Open `Formattable/SETUP.md`.

## How to tell which Chromebook is which

Look up the model on [mrchromebox.tech](https://docs.mrchromebox.tech/docs/supported-devices.html).
If the board name appears with "Full ROM" support, it's **formattable**.
If it doesn't appear, it's **not formattable**.
