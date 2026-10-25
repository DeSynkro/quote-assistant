#!/usr/bin/env bash
set -euo pipefail

cd /work/src-tauri

cargo tauri build \
  --runner cargo-xwin \
  --target x86_64-pc-windows-msvc \
  --no-bundle

mkdir -p /dist

binary="${CARGO_TARGET_DIR}/x86_64-pc-windows-msvc/release/quote-assistant.exe"
if [ ! -f "${binary}" ]; then
    binary="$(find "${CARGO_TARGET_DIR}/x86_64-pc-windows-msvc/release" -maxdepth 1 -type f -name '*.exe' | head -n 1)"
fi
if [ -z "${binary}" ] || [ ! -f "${binary}" ]; then
    printf 'No Windows executable was produced.\n' >&2
    exit 1
fi

install -m 755 "${binary}" /dist/Quote-Assistant.exe
printf 'Built Windows executable: /dist/Quote-Assistant.exe\n'
