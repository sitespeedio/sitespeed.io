#!/bin/bash
set -e

google-chrome-stable --version
firefox --version

# Here's a hack for fixing the problem with Chrome not starting in time
# See https://github.com/SeleniumHQ/docker-selenium/issues/87#issuecomment-250475864

sudo rm -f /var/lib/dbus/machine-id
sudo mkdir -p /var/run/dbus
sudo service dbus restart > /dev/null
service dbus status > /dev/null
export $(dbus-launch)
export NSS_USE_SHARED_DB=ENABLED

MAX_OLD_SPACE_SIZE="${MAX_OLD_SPACE_SIZE:-2048}"

exec node --max-old-space-size=$MAX_OLD_SPACE_SIZE /usr/src/app/bin/sitespeed.js "$@"
