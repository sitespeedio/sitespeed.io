#!/bin/bash
set -e

google-chrome --version
firefox --version

BROWSERTIME=/usr/src/app/bin/browsertimeWebPageReplay.js
SITESPEEDIO=/usr/src/app/bin/sitespeed.js

MAX_OLD_SPACE_SIZE="${MAX_OLD_SPACE_SIZE:-2048}"

HTTP_PORT=80
HTTPS_PORT=443

if [ -n "$START_ADB_SERVER" ] ; then
  WPR_HTTP_PORT=8080
  WPR_HTTPS_PORT=8081
else
  WPR_HTTP_PORT=80
  WPR_HTTPS_PORT=443
fi

# Here's a hack for fixing the problem with Chrome not starting in time
# See https://github.com/SeleniumHQ/docker-selenium/issues/87#issuecomment-250475864
function chromeSetup() {
  sudo rm -f /var/lib/dbus/machine-id
  sudo mkdir -p /var/run/dbus
  sudo service dbus restart > /dev/null
  service dbus status > /dev/null
  export $(dbus-launch)
  export NSS_USE_SHARED_DB=ENABLED
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
    webpagereplaywrapper replay --stop $WPR_PARAMS
    kill -s SIGTERM ${PID}
    wait $PID
  }

  LATENCY=${LATENCY:-100}
  WPR_PATH=/root/go/src/github.com/catapult-project/catapult/web_page_replay_go
  WPR_PARAMS="--path $WPR_PATH --http $WPR_HTTP_PORT --https $WPR_HTTPS_PORT"
  WAIT=${WAIT:-2000}

  webpagereplaywrapper record --start $WPR_PARAMS

  $BROWSERTIME --browsertime.chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --browsertime.firefox.preference network.dns.forceResolve:127.0.0.1 --browsertime.firefox.acceptInsecureCerts --browsertime.pageCompleteCheck "return (function() {try { if (performance.now() > ((performance.timing.loadEventEnd - performance.timing.navigationStart) + $WAIT)) {return true;} else return false;} catch(e) {return true;}})()" "$@"

  webpagereplaywrapper record --stop $WPR_PARAMS

  webpagereplaywrapper replay --start $WPR_PARAMS

  exec node --max-old-space-size=$MAX_OLD_SPACE_SIZE $SITESPEEDIO --browsertime.firefox.acceptInsecureCerts --browsertime.firefox.preference network.dns.forceResolve:127.0.0.1 --browsertime.chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$WPR_HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$WPR_HTTPS_PORT,EXCLUDE localhost" --video --speedIndex --browsertime.pageCompleteCheck "return (function() {try { if (performance.now() > ((performance.timing.loadEventEnd - performance.timing.navigationStart) + $WAIT)) {return true;} else return false;} catch(e) {return true;}})()" --browsertime.connectivity.engine throttle --browsertime.connectivity.throttle.localhost --browsertime.connectivity.profile custom --browsertime.connectivity.latency $LATENCY "$@" &

  PID=$!

  trap shutdown SIGTERM SIGINT
  wait $PID
  webpagereplaywrapper replay --stop $WPR_PARAMS
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

chromeSetup
setupADB

if [ $REPLAY ]
then
  runWebPageReplay "$@"
else
  runSitespeedio "$@"
fi
