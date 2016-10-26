#!/bin/bash
set -e

google-chrome-stable --version
firefox --version

MAX_OLD_SPACE_SIZE="${MAX_OLD_SPACE_SIZE:-2048}"

echo 'Starting Xvfb ...'
export DISPLAY=:99
2>/dev/null 1>&2 Xvfb :99  -ac -nolisten tcp -screen 0 1500x1200x16 &
sleep 1
exec node --max-old-space-size=$MAX_OLD_SPACE_SIZE /usr/src/app/bin/sitespeed.js "$@"
