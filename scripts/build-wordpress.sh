#!/usr/bin/env bash
# Builds the WordPress plugin zip from the app files. Usage: scripts/build-wordpress.sh [output.zip]
set -euo pipefail
cd "$(dirname "$0")/.."
out="$(realpath -m "${1:-darood-wa-salam.zip}")"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

dest="$work/darood-wa-salam"
mkdir -p "$dest/app"
cp wordpress/darood-wa-salam.php wordpress/readme.txt "$dest/"
cp -r index.html styles.css app.js sw.js manifest.webmanifest data fonts icons "$dest/app/"

rm -f "$out"
(cd "$work" && zip -qr "$out" darood-wa-salam)
echo "Built $out"
