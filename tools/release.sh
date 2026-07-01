#!/usr/bin/env bash
# Quill Haven release tool — the "every update gets a NEW emoji" rule, built in.
#
# It bumps the version AND picks the next unused emoji, and writes BOTH into every
# place that must agree (so they can never drift again), then recomputes all the
# device update-hashes. Run from anywhere:
#
#   tools/release.sh             # auto-bump minor (4.5 -> 4.6) + next emoji
#   tools/release.sh 5.0         # explicit version + next emoji
#   QH_DRY=1 tools/release.sh     # show what it WOULD do, change nothing
#
# After it runs (and not in dry-run): git add -A && git commit && git push.
set -euo pipefail
cd "$(dirname "$0")/.."

python3 - "${1:-}" <<'PY'
import json, re, sys, hashlib, datetime, pathlib, os

DRY = bool(os.environ.get('QH_DRY'))
arg = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] else None

# Ordered emoji rotation. The script picks the one AFTER the current emoji, so
# every release is new and never repeats until the whole list cycles. Add more
# to the end any time; never reorder/remove (it would re-use an old emoji).
ROTATION = ['⭐','🪶','📝','🎨','💤','✒️','📖','🕯️','☕','📜','🔖','🌙','✨','🌿',
            '🍵','🪴','📚','🖋️','🎐','🌸','🦉','🧸','🛋️','🌧️','🫖','🕊️','🌻','🍂']

root = pathlib.Path('.')
vj = json.loads((root/'version.json').read_text())
cur_ver, cur_emoji = vj['version'], vj['emoji']

# Guard: if helper.py was edited but helper-manifest.json wasn't re-stamped, the
# device's self-updater won't pull the new helper — the update gate would half-deploy
# (new overlay lands, old helper stays, /apply-update 404s). Refuse to release until
# they agree. Runs before any writes, so a failed check changes nothing.
_hm = json.loads((root/'helper/helper-manifest.json').read_text())
_helper_sha = hashlib.sha256((root/'helper/helper.py').read_bytes()).hexdigest()
if _hm.get('sha256', '').lower() != _helper_sha:
    sys.exit("ERROR: helper.py has changed but helper/helper-manifest.json is stale.\n"
             "       Run  tools/release-helper.sh <next-helper-version>  first "
             "(e.g. 1.8), then re-run this.")

if arg:
    new_ver = arg
else:
    parts = cur_ver.split('.'); parts[-1] = str(int(parts[-1]) + 1)
    new_ver = '.'.join(parts)

new_emoji = ROTATION[(ROTATION.index(cur_emoji) + 1) % len(ROTATION)] if cur_emoji in ROTATION else ROTATION[0]
today = datetime.date.today().isoformat()
print(f"Release: {cur_ver} {cur_emoji}  ->  {new_ver} {new_emoji}   ({today})")

# Accumulate edits per file IN MEMORY so multiple edits to the same file compound
# (the earlier bug: each edit re-read the original, so the last write clobbered
# the rest — LOCAL_VERSION stayed behind while the emoji moved).
work = {}
def load(p):
    if p not in work: work[p] = (root/p).read_text()
    return work[p]
def sub(p, pattern, repl):
    new, n = re.subn(pattern, repl, load(p), count=1)
    if n != 1: sys.exit(f"ERROR: expected 1 match for {pattern!r} in {p}, got {n}")
    work[p] = new

# version.json (rewrite cleanly)
vj['version'], vj['emoji'], vj['date'] = new_ver, new_emoji, today
work['version.json'] = json.dumps(vj, ensure_ascii=False, indent=2) + '\n'

sub('extension/quill-overlay.js', r"(var LOCAL_VERSION = ')[^']*(')", rf"\g<1>{new_ver}\g<2>")
sub('extension/quill-overlay.js', r"(var localEmoji = ')[^']*(')",    rf"\g<1>{new_emoji}\g<2>")
sub('home-screen/js/home.js',     r"(var LOCAL_VERSION = ')[^']*(')", rf"\g<1>{new_ver}\g<2>")
sub('home-screen/js/home.js',     r"(var LOCAL_EMOJI = ')[^']*(')",   rf"\g<1>{new_emoji}\g<2>")
# NOTE: home-screen/service-worker.js is deliberately NOT version-bumped any more.
# It is pinned + byte-stable so the home screen can't silently re-pin on reboot (the
# update gate). Bumping it would reinstall the worker and defeat that. Leave it alone.
sub('extension/manifest.json',    r'("version":\s*")[^"]*(")',        rf'\g<1>{new_ver}\g<2>')
sub('helper/launch-home.sh',      r"(# rev: )\S+",                    rf"\g<1>v{new_ver}-{today}")

if DRY:
    for p in work: print(f"  would update {p}")
    print("DRY RUN — nothing written. Re-run without QH_DRY to apply.")
    sys.exit(0)

for p, text in work.items():
    (root/p).write_text(text)

# Recompute every extension/launcher hash in helper-manifest.json (preserve format)
hmp = root/'helper/helper-manifest.json'
hm_text = hmp.read_text(); hm = json.loads(hm_text)
for e in hm['extras']:
    hm_text = hm_text.replace(e['sha256'], hashlib.sha256((root/e['src']).read_bytes()).hexdigest())
hmp.write_text(hm_text)

# Verify everything agrees
hm = json.loads(hmp.read_text())
bad = [e['name'] for e in hm['extras']
       if hashlib.sha256((root/e['src']).read_bytes()).hexdigest() != e['sha256']]
ov = re.search(r"var LOCAL_VERSION = '([^']*)'", (root/'extension/quill-overlay.js').read_text()).group(1)
hv = re.search(r"var LOCAL_VERSION = '([^']*)'", (root/'home-screen/js/home.js').read_text()).group(1)
if bad: sys.exit("HASH MISMATCH: " + ", ".join(bad))
if not (ov == hv == new_ver): sys.exit(f"VERSION DRIFT: overlay={ov} home={hv} want={new_ver}")

print("Updated version + emoji in version.json, the overlay, the home screen and the extension manifest; hashes + versions verified consistent.")
print(f"Next: git add -A && git commit -m 'Release {new_ver} {new_emoji} — <what>' && git push")
PY
