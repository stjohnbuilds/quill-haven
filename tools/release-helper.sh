#!/usr/bin/env bash
# Run from the repo root after editing helper/helper.py.
# Recomputes the hash + bumps the version so the device's self-updater picks it up.
#   tools/release-helper.sh <new-version>
set -euo pipefail
cd "$(dirname "$0")/.."
if command -v shasum >/dev/null 2>&1; then
  HASH=$(shasum -a 256 helper/helper.py | awk '{print $1}')
else
  HASH=$(sha256sum helper/helper.py | awk '{print $1}')
fi
NEXT="${1:?usage: release-helper.sh <new-version>}"
printf '{ "version": "%s", "sha256": "%s" }\n' "$NEXT" "$HASH" > helper/helper-manifest.json
echo "helper-manifest.json -> version $NEXT, sha256 $HASH"
echo "Now: git add helper/ && git commit -m 'helper v$NEXT' && git push"
