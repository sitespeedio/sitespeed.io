#!/bin/bash

firefox --version 2>/dev/null

SITESPEEDIO=/usr/src/app/bin/sitespeed.js

MAX_OLD_SPACE_SIZE="${MAX_OLD_SPACE_SIZE:-2048}"

# write files owned by the user who runs the container
# if your volume is mounted at /sitespeed.io, use it as CWD
[[ -d /sitespeed.io && "$PWD" = "/" ]] && cd /sitespeed.io

uid=$(stat -c '%u' . 2>/dev/null || echo 0)
gid=$(stat -c '%g' . 2>/dev/null || echo 0)

if [[ "$uid" -ne 0 && "$gid" -ne 0 ]]; then
  if ! getent group "$gid" >/dev/null 2>&1; then
    groupadd -g "$gid" sitespeedio-host 2>/dev/null || true
  fi
  if ! getent passwd "$uid" >/dev/null 2>&1; then
    useradd -u "$uid" -g "$gid" -M -d /tmp -s /bin/bash sitespeedio-host 2>/dev/null || true
  fi
fi

# exec so that a background job is the command itself: shutdown then
# sends the signal to node, not to the shell around it
run_as_host() {
  if [[ "$uid" -ne 0 && "$gid" -ne 0 ]]; then
    HOME=/tmp exec chroot --skip-chdir --userspec="+${uid}:+${gid}" / "$@"
  else
    HOME=/tmp exec "$@"
  fi
}

function execNode(){
  run_as_host node "$@"
}

# Need to explictly override the HOME directory to prevent dconf errors like:
# (firefox:2003): dconf-CRITICAL **: 00:31:23.379: unable to create directory '/root/.cache/dconf': Permission denied.  dconf will not work properly.
export HOME=/tmp

# Inspired by docker-selenium way of shutting down
# sitespeed.io finishes the current iteration on SIGTERM, so exit with
# its exit code
function shutdown {
  kill -s SIGTERM ${PID}
  local status=0
  wait $PID || status=$?
  exit $status
}

execNode --max-old-space-size=$MAX_OLD_SPACE_SIZE $SITESPEEDIO "$@" &

PID=$!

trap shutdown SIGTERM SIGINT
wait $PID


