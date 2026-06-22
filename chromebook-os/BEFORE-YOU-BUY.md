# Before you buy / unlock a Chromebook for Quill Haven

Two paths to a full-reformat Chromebook. Read this BEFORE spending any
money. Both paths have hidden requirements that aren't obvious from
listings.

---

## Path A — Unlock the Chromebook you already have

If you've already bought an Intel/AMD Chromebook (board name appears
on [mrchromebox.tech supported devices](https://docs.mrchromebox.tech/docs/supported-devices.html)
with "Full ROM" support) and it uses **CR50** or **Ti50** for
write-protect, you need a **SuzyQable** (also written SuzyQ cable).

**What it is:** a USB-C cable with custom resistors that puts the
Chromebook into debug mode so the firmware can be unlocked.

**Where to get one (verify availability and shipping to your country
before ordering — this list goes stale):**

- **SparkFun** (US): sells the official Google-spec SuzyQable — ~$15
  cable + shipping. International shipping is slow + expensive.
- **Etsy**: several sellers handmake them. Cheaper international ship.
- **Hackaday / various hobbyist shops**: occasionally in stock.

**Cost realistic:** $20–40 with shipping. **Wait time:** 1–3 weeks.

Once it arrives, the firmware-flash step (Step 3 in
`Formattable/SETUP.md`) will succeed without the "hardware write
protect enabled" error.

---

## Path B — Buy a different Chromebook that doesn't need a cable

Look up the model on
[mrchromebox.tech supported devices](https://docs.mrchromebox.tech/docs/supported-devices.html)
**BEFORE buying.** Check ALL of these, not just one:

| Column to check | What you need to see |
|-----------------|----------------------|
| Board name | Listed in the table at all |
| Firmware | **UEFI Full ROM** ✅ |
| **WP disable method** | **"screw"** ✅ (easy) OR **"battery"** ✅ (medium) — NOT "CR50" / "Ti50" / "CCD" ❌ |

**Plus check these things the table doesn't tell you:**
- **Chip family**: Intel or AMD (NOT MediaTek, Rockchip, or Snapdragon
  — ARM Chromebooks can never be reformatted).
- **Return policy of the seller**: 30+ days, accepts no-receipt
  returns if buying in cash.
- **Build quality**: read trackpad/keyboard reviews. The "screw WP"
  Chromebooks tend to be older or basic education models — verify the
  hardware feel is acceptable BEFORE buying.

**Era to aim for:** ~2017–early 2019. After mid-2019 most Chromebooks
moved to CR50.

---

## The trap

The Mr Chromebox supported-devices table has many columns. Confirming
ONLY that "Full ROM: yes" exists is NOT enough — that just means the
firmware *exists* for the device. You also need the WP disable method
to be achievable without specialist hardware.

A Chromebook can be **"supported" but practically unflashable** for
someone without the right cable.

---

## Quick decision tree

```
Q: Is the Chromebook chip Intel or AMD?
   NO  → ARM. Cannot reformat, ever. Use the "Not Formattable" path.
   YES → continue.

Q: Is the board name on mrchromebox.tech with "UEFI Full ROM" support?
   NO  → Not flashable. Use Not Formattable or pick a different model.
   YES → continue.

Q: What does the WP method column say?
   "screw"   → Buy it. Easiest path. ✅
   "battery" → Buy it. You'll need a Phillips screwdriver. ✅
   "CR50"    → Only buy if you're prepared to order a SuzyQable
                separately and wait 1–3 weeks. ⚠️
   "Ti50"    → Same as CR50. ⚠️
   "CCD"     → Skip. Hard. ❌
```
