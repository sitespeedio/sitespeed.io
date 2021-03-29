#!/bin/bash

google-chrome --version
firefox --version
microsoft-edge --version

BROWSERTIME=/usr/src/app/bin/browsertimeWebPageReplay.js
SITESPEEDIO=/usr/src/app/bin/sitespeed.js
export DBUS_SESSION_BUS_ADDRESS=/dev/null

MAX_OLD_SPACE_SIZE="${MAX_OLD_SPACE_SIZE:-2048}"

HTTP_PORT=80
HTTPS_PORT=443

CERT_FILE=/webpagereplay/certs/wpr_cert.pem
KEY_FILE=/webpagereplay/certs/wpr_key.pem

SCRIPTS=/webpagereplay/scripts/deterministic.js

if [ -n "$START_ADB_SERVER" ] ; then
  WPR_HTTP_PORT=${WPR_HTTP_PORT:-8080}
  WPR_HTTPS_PORT=${WPR_HTTPS_PORT:-8081}
else
  WPR_HTTP_PORT=${WPR_HTTP_PORT:-80}
  WPR_HTTPS_PORT=${WPR_HTTPS_PORT:-443}
fi

WORKDIR_UID=$(stat -c "%u" .)
WORKDIR_GID=$(stat -c "%g" .)

# Create user with the same UID and GID as the owner of the working directory, which will be used
# to execute node. This is partly for security and partly so output files won't be owned by root.
groupadd --non-unique --gid $WORKDIR_GID sitespeedio
useradd --non-unique --uid $WORKDIR_UID --gid $WORKDIR_GID --home-dir /tmp sitespeedio

# Need to explictly override the HOME directory to prevent dconf errors like:
# (firefox:2003): dconf-CRITICAL **: 00:31:23.379: unable to create directory '/root/.cache/dconf': Permission denied.  dconf will not work properly.
export HOME=/tmp

function execNode(){
  chroot --skip-chdir --userspec='sitespeedio:sitespeedio' / node "$@"
}

# If we run Chrome on Android, we need to start the ADB server
function setupADB(){
  # Start adb server and list connected devices
  if [ -n "$START_ADB_SERVER" ] ; then
    sudo adb start-server
    sudo adb devices

    if [ $REPLAY ] ; then
      sudo adb reverse tcp:$WPR_HTTP_PORT tcp:$WPR_HTTP_PORT
      sudo adb reverse tcp:$WPR_HTTPS_PORT tcp:$WPR_HTTPS_PORT
    fi
  fi
}

function runWebPageReplay() {

  # Inspired by docker-selenium way of shutting down
  function shutdown {
    kill -2 $replay_pid
    wait $replay_pid
    kill -s SIGTERM ${PID}
    wait $PID
  }

  LATENCY=${LATENCY:-100}
  WPR_PARAMS="--http_port $WPR_HTTP_PORT --https_port $WPR_HTTPS_PORT --https_cert_file $CERT_FILE --https_key_file $KEY_FILE --inject_scripts $SCRIPTS /tmp/archive.wprgo"
  WAIT=${WAIT:-5000}
  REPLAY_WAIT=${REPLAY_WAIT:-3}
  RECORD_WAIT=${RECORD_WAIT:-3}

  declare -i RESULT=0
  echo 'Start WebPageReplay Record'
  wpr record $WPR_PARAMS > /tmp/wpr-record.log 2>&1 &
  record_pid=$!
  sleep $RECORD_WAIT

  # Add functionality for blocking third-party domains in webpagereplay
  PARAMS=()
  FIRST_PARTY_DOMAINS=()  # create an array of all the first-party domains
  while [[ $# -gt 0 ]]
  do
  key="$1"
  case $key in
      --chrome.blockDomainsExcept) # handle Space-Separated arguments
      FIRST_PARTY_DOMAINS+=("$2")
      PARAMS+=("$1")
      PARAMS+=("$2")
      shift # past argument
      shift # past value
      ;;
      --chrome.blockDomainsExcept=*) # handle Equals-Separated arguments
      FIRST_PARTY_DOMAINS+=(${1#*=})
      PARAMS+=("$1")
      shift # past argument value
      ;;
      *)    # unknown option
      PARAMS+=("$1") # save it in an array for later
      shift # past argument
      ;;
  esac
  done
  eval set -- '${PARAMS[@]}' # restore positional parameters

  PREFIX="execNode ${BROWSERTIME} --browsertime.chrome.args host-resolver-rules=\""
  SUFFIX="EXCLUDE localhost\" --browsertime.firefox.preference network.dns.forceResolve:127.0.0.1 --browsertime.connectivity.engine throttle --browsertime.connectivity.throttle.localhost --browsertime.connectivity.profile custom --browsertime.connectivity.latency $LATENCY "

  EXEC_STRING=$PREFIX
  if [ ${#FIRST_PARTY_DOMAINS[@]} -eq 0 ]
  then 
    # If chrome.blockDomainsExcept flag was not used
    EXEC_STRING+=" MAP *:${HTTP_PORT} 127.0.0.1:${WPR_HTTP_PORT},"
    EXEC_STRING+=" MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,"
  else
    # If chrome.blockDomainsExcept flag was used
    EXEC_STRING=$PREFIX
    for domain in "${FIRST_PARTY_DOMAINS[@]}"
    do
        EXEC_STRING+=" MAP $domain:${HTTP_PORT} 127.0.0.1:${WPR_HTTP_PORT},"
        EXEC_STRING+=" MAP $domain:${HTTPS_PORT} 127.0.0.1:${WPR_HTTPS_PORT},"
    done
  fi
  EXEC_STRING+=$SUFFIX

  eval $EXEC_STRING '$@' # execute the execNode command
  RESULT+=$?

  kill -2 $record_pid
  RESULT+=$?
  wait $record_pid
  echo 'Stopped WebPageReplay record'

  if [ $RESULT -eq 0 ]
    then
      echo 'Start WebPageReplay Replay'
      wpr replay $WPR_PARAMS > /tmp/wpr-replay.log 2>&1 &
      replay_pid=$!

      if [ $? -eq 0 ]
        then
          execNode --max-old-space-size=$MAX_OLD_SPACE_SIZE $SITESPEEDIO --browsertime.firefox.preference security.OCSP.enabled:0 --browsertime.firefox.preference network.dns.forceResolve:127.0.0.1 --browsertime.chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --browsertime.connectivity.engine throttle --browsertime.connectivity.throttle.localhost --replay --browsertime.connectivity.profile custom --browsertime.connectivity.rtt $LATENCY "$@" &

          PID=$!
          
          trap shutdown SIGTERM SIGINT
          wait $PID
          EXIT_STATUS=$?

          kill -s SIGTERM $replay_pid
          exit $EXIT_STATUS

        else
          echo "Replay server didn't start correctly" >&2
          exit 1
        fi

      else
        echo "Recording or accessing the URL failed, will not replay" >&2
        exit 1
      fi
}



function runSitespeedio(){

  # Inspired by docker-selenium way of shutting down
  function shutdown {
    kill -s SIGTERM ${PID}
    wait $PID
  }

  execNode --max-old-space-size=$MAX_OLD_SPACE_SIZE $SITESPEEDIO "$@" &

  PID=$!

  trap shutdown SIGTERM SIGINT
  wait $PID
}

setupADB

# Additional start script that the user can copy to the container
if [ ! -z "$EXTRA_START_SCRIPT" ] && [ -f "$EXTRA_START_SCRIPT" ]
then
  chmod +x $EXTRA_START_SCRIPT
  $EXTRA_START_SCRIPT
fi

if [ $REPLAY ]
then
  runWebPageReplay "$@"
else
  runSitespeedio "$@"
fi
