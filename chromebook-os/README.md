# Chromebook OS packages

Two Chromebooks, two different setups:

## `arm-chromeos/` — for the Acer Spin 311 (the one you have)

That Chromebook has an ARM chip, so we **can't** wipe ChromeOS off it.
This package makes it pretend to be a Quill Haven device: install
Quill Haven as an app, set it to open at login, hide the shelf, remove
everything else. As close to "its own OS" as we can get without
reformatting.

→ Open `arm-chromeos/SETUP.md` and follow the steps.

## `intel-linux/` — for the Gateway Chromebook 311 (when it arrives)

That one has an Intel chip, so we **can** wipe ChromeOS and put a real
Linux OS on it that boots straight into Quill Haven. No login screen,
no Chrome underneath — the real thing.

This package will be built once you have the Gateway in your hands.
