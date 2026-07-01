#!/usr/bin/env bash
# Quill Haven admin — privileged file installer.
# Called by the helper via: sudo /usr/local/bin/qh-admin <workdir>
# Reads workdir/files.tsv (name<TAB>dest<TAB>mode), copies each file from
# workdir/<name> to <dest>, backs up the old version first.
# The sudoers entry installed by setup.sh limits NOPASSWD to this script only.
set -euo pipefail

DIR="${1:-}"
[ -d "$DIR" ] || { echo "Usage: qh-admin <workdir>"; exit 1; }
[ -f "$DIR/files.tsv" ] || { echo "No files.tsv in $DIR"; exit 1; }

while IFS=$'\t' read -r name dest mode; do
    [ -z "$name" ] && continue
    src="$DIR/$name"
    [ -f "$src" ] || { echo "SKIP $name (not found)"; continue; }
    # Only ever write into the approved system locations, and never via "..", so a
    # bad or injected manifest can't aim this privileged copy at the rest of the disk.
    case "$dest" in
        /etc/chromium/*|/etc/chromium-browser/*) : ;;
        *) echo "REJECT $dest (outside allowed paths)"; continue ;;
    esac
    case "$dest" in *..*) echo "REJECT $dest (unsafe path)"; continue ;; esac
    mkdir -p "$(dirname "$dest")"
    # Back up existing file before overwriting
    [ -f "$dest" ] && cp -a "$dest" "${dest}.qh-bak"
    cp "$src" "$dest"
    chmod "$mode" "$dest"
    echo "OK $dest"
done < "$DIR/files.tsv"
