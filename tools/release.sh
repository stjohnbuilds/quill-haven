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
import json, re, sys, hashlib, datetime, pathlib

DRY = bool(__import__('os').environ.get('QH_DRY'))
arg = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] else None

# Ordered emoji rotation. The script picks the one AFTER the current emoji, so
# every release is new and never repeats until the whole list cycles. Add more
# to the end any time; never reorder/remove (it would re-use an old emoji).
ROTATION = ['⭐','🪶','📝','🎨','💤','✒️','📖','🕯️','☕','📜','🔖','🌙','✨','🌿',
            '🍵','🪴','📚','🖋️','🎐','🌸','🦉','🧸','🛋️','🌧️','🫖','🕊️','🌻','🍂']

root = pathlib.Path('.')
vj = json.loads((root/'version.json').read_text())
cur_ver, cur_emoji = vj['version'], vj['emoji']

# Next version
if arg:
    new_ver = arg
else:
    parts = cur_ver.split('.')
    parts[-1] = str(int(parts[-1]) + 1)
    new_ver = '.'.join(parts)

# Next emoji
if cur_emoji in ROTATION:
    new_emoji = ROTATION[(ROTATION.index(cur_emoji) + 1) % len(ROTATION)]
else:
    new_emoji = ROTATION[0]
today = datetime.date.today().isoformat()

print(f"Release: {cur_ver} {cur_emoji}  ->  {new_ver} {new_emoji}   ({today})")

edits = []  # (path, oldtext, newtext) for dry-run preview / apply

def sub_file(path, pattern, repl, count=1):
    p = root/path
    text = p.read_text()
    new, n = re.subn(pattern, repl, text, count=count)
    if n != count:
        sys.exit(f"ERROR: expected {count} match for {pattern!r} in {path}, got {n}")
    edits.append((p, text, new))

# version.json (rewrite cleanly)
vj['version'], vj['emoji'], vj['date'] = new_ver, new_emoji, today
edits.append((root/'version.json', (root/'version.json').read_text(),
              json.dumps(vj, ensure_ascii=False, indent=2) + '\n'))

# overlay + home + service worker + extension manifest
sub_file('extension/quill-overlay.js', r"(var LOCAL_VERSION = ')[^']*(')", rf"\g<1>{new_ver}\g<2>")
sub_file('extension/quill-overlay.js', r"(var localEmoji = ')[^']*(')", rf"\g<1>{new_emoji}\g<2>")
sub_file('home-screen/js/home.js',     r"(var LOCAL_VERSION = ')[^']*(')", rf"\g<1>{new_ver}\g<2>")
sub_file('home-screen/js/home.js',     r"(var LOCAL_EMOJI = ')[^']*(')",   rf"\g<1>{new_emoji}\g<2>")
sub_file('home-screen/service-worker.js', r"(const VERSION = ')[^']*(')",  rf"\g<1>{new_ver}\g<2>")
sub_file('extension/manifest.json',    r'("version":\s*")[^"]*(")',        rf'\g<1>{new_ver}\g<2>')
# launcher rev — any change forces the helper to relaunch Chromium
sub_file('helper/launch-home.sh',      r"(# rev: )\S+",                    rf"\g<1>v{new_ver}-{today}")

if DRY:
    for p, old, new in edits:
        print(f"  would update {p}")
    print("DRY RUN — nothing written. Re-run without QH_DRY to apply.")
    sys.exit(0)

for p, old, new in edits:
    p.write_text(new)

# Recompute every extension/launcher hash in helper-manifest.json (preserve format)
hm_path = root/'helper/helper-manifest.json'
hm_text = hm_path.read_text()
hm = json.loads(hm_text)
for e in hm['extras']:
    new_sha = hashlib.sha256((root/e['src']).read_bytes()).hexdigest()
    hm_text = hm_text.replace(e['sha256'], new_sha)
hm_path.write_text(hm_text)

# Verify
hm = json.loads(hm_path.read_text())
bad = [e['name'] for e in hm['extras']
       if hashlib.sha256((root/e['src']).read_bytes()).hexdigest() != e['sha256']]
if bad:
    sys.exit("HASH MISMATCH after write: " + ", ".join(bad))

print("Updated: version.json, quill-overlay.js, home.js, service-worker.js, "
      "manifest.json, launch-home.sh, helper-manifest.json (hashes verified).")
print(f"Next: git add -A && git commit -m 'Release {new_ver} {new_emoji} — <what>' && git push")
PY
