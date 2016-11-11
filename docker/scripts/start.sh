#!/bin/bash
set -e

google-chrome-stable --version
firefox --version

MAX_OLD_SPACE_SIZE="${MAX_OLD_SPACE_SIZE:-2048}"

exec node --max-old-space-size=$MAX_OLD_SPACE_SIZE /usr/src/app/bin/sitespeed.js "$@"
