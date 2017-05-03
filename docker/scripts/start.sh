#!/bin/bash
set -e

google-chrome --version
firefox --version

# Here's a hack for fixing the problem with Chrome not starting in time
# See https://github.com/SeleniumHQ/docker-selenium/issues/87#issuecomment-250475864

sudo rm -f /var/lib/dbus/machine-id
sudo mkdir -p /var/run/dbus
sudo service dbus restart > /dev/null
service dbus status > /dev/null
export $(dbus-launch)
export NSS_USE_SHARED_DB=ENABLED

# Start adb server and list connected devices
if [ -n "$START_ADB_SERVER" ] ; then
  sudo adb start-server
  sudo adb devices
fi

# Inspired by docker-selenium way of shutting down
function shutdown {
  kill -s SIGTERM $PID
  wait $PID
}

MAX_OLD_SPACE_SIZE="${MAX_OLD_SPACE_SIZE:-2048}"

exec node --max-old-space-size=$MAX_OLD_SPACE_SIZE /usr/src/app/bin/sitespeed.js "$@" &

PID=$!

trap shutdown SIGTERM SIGINT
wait $PID
