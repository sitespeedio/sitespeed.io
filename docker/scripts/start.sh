#!/bin/bash
set -e

google-chrome-stable --version
firefox --version

echo 'Starting Xvfb ...'
export DISPLAY=:99
2>/dev/null 1>&2 Xvfb :99  -ac -nolisten tcp -screen 0 1500x1200x16 &
sleep 1
exec sitespeed.io "$@"
