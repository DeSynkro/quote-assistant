#!/usr/bin/env bash
set -euo pipefail

cd /work/src-tauri

cargo test

cargo tauri build --bundles appimage

mkdir -p /dist

appimage="$(find "${CARGO_TARGET_DIR}/release/bundle/appimage" -maxdepth 1 -type f -name '*.AppImage' | head -n 1)"
if [ -z "${appimage}" ]; then
    printf 'No AppImage was produced.\n' >&2
    exit 1
fi

version="$(tr -d '[:space:]' < /work/VERSION)"
output="/dist/Quote-Assistant-${version}.AppImage"
install -m 755 "${appimage}" "${output}"
printf 'Built AppImage: %s\n' "${output}"
