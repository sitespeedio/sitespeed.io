#!/bin/bash

google-chrome --version
firefox --version

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
  WAIT_SCRIPT="return (function() {try { var end = window.performance.timing.loadEventEnd; var start= window.performance.timing.navigationStart; return (end > 0) && (performance.now() > end - start + $WAIT);} catch(e) {return true;}})()"

  declare -i RESULT=0
  echo 'Start WebPageReplay Record'
  wpr record $WPR_PARAMS > /tmp/wpr-record.log 2>&1 &
  record_pid=$!
  sleep $RECORD_WAIT

  $BROWSERTIME --browsertime.chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --browsertime.firefox.preference network.dns.forceResolve:127.0.0.1 --browsertime.pageCompleteCheck "$WAIT_SCRIPT" --browsertime.connectivity.engine throttle --browsertime.connectivity.throttle.localhost --browsertime.connectivity.profile custom --browsertime.connectivity.latency $LATENCY "$@"
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
          exec node --max-old-space-size=$MAX_OLD_SPACE_SIZE $SITESPEEDIO --browsertime.firefox.preference security.OCSP.enabled:0 --browsertime.firefox.preference network.dns.forceResolve:127.0.0.1 --browsertime.chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --video --visualMetrics --browsertime.pageCompleteCheck "$WAIT_SCRIPT" --browsertime.connectivity.engine throttle --browsertime.connectivity.throttle.localhost --replay --browsertime.connectivity.profile custom --browsertime.connectivity.latency $LATENCY "$@" &

          PID=$!

          trap shutdown SIGTERM SIGINT
          wait $PID

          kill -s SIGTERM $replay_pid

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

  exec node --max-old-space-size=$MAX_OLD_SPACE_SIZE $SITESPEEDIO "$@" &

  PID=$!

  trap shutdown SIGTERM SIGINT
  wait $PID
}

# Additional start script that the user can copy to the container
# before running Web Page Replay/SiteSpeedIO. 
# For example, adding certificates to the store (https://github.com/sitespeedio/sitespeed.io/issues/2352)
if [ -f "/additionalStart.sh" ]
then
  chmod +x /additionalStart.sh
  /additionalStart.sh
fi

setupADB

if [ $REPLAY ]
then
  runWebPageReplay "$@"
else
  runSitespeedio "$@"
fi
