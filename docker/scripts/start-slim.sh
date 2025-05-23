#!/bin/bash

firefox --version 2>/dev/null

SITESPEEDIO=/usr/src/app/bin/sitespeed.js

MAX_OLD_SPACE_SIZE="${MAX_OLD_SPACE_SIZE:-2048}"

WORKDIR_UID=$(stat -c "%u" .)
WORKDIR_GID=$(stat -c "%g" .)

# Create user with the same UID and GID as the owner of the working directory, which will be used
# to execute node. This is partly for security and partly so output files won't be owned by root.
groupadd --non-unique --gid $WORKDIR_GID sitespeedio
useradd --non-unique --uid $WORKDIR_UID --gid $WORKDIR_GID --home-dir /tmp sitespeedio

# Need to explictly override the HOME directory to prevent dconf errors like:
# (firefox:2003): dconf-CRITICAL **: 00:31:23.379: unable to create directory '/root/.cache/dconf': Permission denied.  dconf will not work properly.
export HOME=/tmp


# Inspired by docker-selenium way of shutting down
function shutdown {
  kill -s SIGTERM ${PID}
  wait $PID
}

chroot --skip-chdir --userspec='sitespeedio:sitespeedio' / node --max-old-space-size=$MAX_OLD_SPACE_SIZE $SITESPEEDIO "$@" &

PID=$!

trap shutdown SIGTERM SIGINT
wait $PID


