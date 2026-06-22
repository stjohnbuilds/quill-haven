# Device setup for Quill Haven

Three install paths — pick the one that matches the device.

## `Windows/`  — for any Windows 10 or 11 laptop

Install Quill Haven as a real installed app (PWA), run Microsoft Edge
in fullscreen kiosk mode on every login. No USB needed, no firmware
faff. ~10 minutes.

→ Open `Windows/SETUP.md`.

## `Not Formattable/`  — for ARM Chromebooks

Chromebooks with **MediaTek / Rockchip / Qualcomm Snapdragon** chips
can't have ChromeOS removed. This path locks ChromeOS down instead:
install Quill Haven as the default app, hide everything else.

→ Open `Not Formattable/SETUP.md`.

## `Formattable/`  — for Intel / AMD Chromebooks

Chromebooks with **Intel or AMD** chips can have ChromeOS wiped off
completely and a custom OS installed in its place. The result boots
directly into Quill Haven — no sign-in, no Chrome, no other OS
underneath. Requires a **16GB USB stick** and about an hour.

→ Open `Formattable/SETUP.md`.

## How to tell which Chromebook is which

Look up the model on [mrchromebox.tech](https://docs.mrchromebox.tech/docs/supported-devices.html).
If the board name appears with "UEFI Full ROM" support, it's
**formattable** in theory. If it doesn't appear, it's **not formattable**.

## ⚠️ Before buying or unlocking a Chromebook

**Read `BEFORE-YOU-BUY.md` first.** "Full ROM supported" alone is NOT
enough — you also need the write-protect disable method to be one you
can actually do (screw or battery), not one that needs a $30 specialist
cable that ships from the US over 1–3 weeks.
