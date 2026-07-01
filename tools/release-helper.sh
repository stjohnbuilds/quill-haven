#!/usr/bin/env bash
# Run from the repo root after editing helper/helper.py.
# Recomputes helper.py's hash + bumps the helper version, PRESERVING the extras list
# (the overlay/launcher files the device pulls), so the self-updater keeps delivering
# them. The old version of this script rewrote the file as just {version, sha256} and
# silently dropped extras — which would stop the overlay updating. Don't do that.
#   tools/release-helper.sh <new-version>
set -euo pipefail
cd "$(dirname "$0")/.."
NEXT="${1:?usage: release-helper.sh <new-version>}"
python3 - "$NEXT" <<'PY'
import hashlib, json, pathlib, sys
nxt = sys.argv[1]
p = pathlib.Path('helper/helper-manifest.json')
m = json.loads(p.read_text())
m['version'] = nxt
m['sha256'] = hashlib.sha256(pathlib.Path('helper/helper.py').read_bytes()).hexdigest()
p.write_text(json.dumps(m, indent=2, ensure_ascii=False) + '\n')
print(f"helper-manifest.json -> version {nxt}, sha256 {m['sha256']}")
print(f"extras preserved: {len(m.get('extras', []))} entries")
PY
echo "Now: git add helper/ && git commit -m 'helper v$NEXT' && git push"
