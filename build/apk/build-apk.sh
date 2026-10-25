#!/usr/bin/env bash
set -euo pipefail

cd /work/src-tauri

if [ ! -d gen/android ]; then
    cargo tauri android init --ci
fi

find gen/android -name AndroidManifest.xml -type f -exec \
    sed -i '/android.permission.INTERNET/d' {} +

cargo tauri android build --apk --debug

mkdir -p /dist

apk="$(find gen/android/app/build/outputs/apk -type f -name '*universal*debug*.apk' | head -n 1)"
if [ -z "${apk}" ]; then
    apk="$(find gen/android/app/build/outputs/apk -type f -name '*.apk' | head -n 1)"
fi
if [ -z "${apk}" ] || [ ! -f "${apk}" ]; then
    printf 'No Android APK was produced.\n' >&2
    exit 1
fi

install -m 644 "${apk}" /dist/Quote-Assistant.apk
printf 'Built Android APK: /dist/Quote-Assistant.apk\n'
