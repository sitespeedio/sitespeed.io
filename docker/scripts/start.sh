#!/bin/bash
set -e

google-chrome --version
firefox --version

BROWSERTIME=/usr/src/app/bin/browsertimeWebPageReplay.js
SITESPEEDIO=/usr/src/app/bin/sitespeed.js

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
  fi
}

function runWebPageReplay() {

  LATENCY=${LATENCY:-100}
  HTTP_PORT=80
  HTTPS_PORT=443
  WPR_PATH=/root/go/src/github.com/catapult-project/catapult/web_page_replay_go
  WPR_PARAMS="--path $WPR_PATH --http $HTTP_PORT --https $HTTPS_PORT"

  webpagereplaywrapper record --start $WPR_PARAMS

  $BROWSERTIME --browsertime.chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$HTTPS_PORT,EXCLUDE localhost" --browsertime.firefox.preference network.dns.forceResolve:127.0.0.1 --browsertime.firefox.acceptInsecureCerts --browsertime.pageCompleteCheck "return (function() {try { if (performance.now() > ((performance.timing.loadEventEnd - performance.timing.navigationStart) + 2000)) {return true;} else return false;} catch(e) {return true;}})()" "$@"

  webpagereplaywrapper record --stop $WPR_PARAMS

  webpagereplaywrapper replay --start $WPR_PARAMS

  $SITESPEEDIO --browsertime.firefox.acceptInsecureCerts --browsertime.firefox.preference network.dns.forceResolve:127.0.0.1 --browsertime.chrome.args host-resolver-rules="MAP *:$HTTP_PORT 127.0.0.1:$HTTP_PORT,MAP *:$HTTPS_PORT 127.0.0.1:$HTTPS_PORT,EXCLUDE localhost" --video --speedIndex --browsertime.pageCompleteCheck "return (function() {try { if (performance.now() > ((performance.timing.loadEventEnd - performance.timing.navigationStart) + 2000)) {return true;} else return false;} catch(e) {return true;}})()" --browsertime.connectivity.engine throttle --browsertime.connectivity.throttle.localhost --browsertime.connectivity.profile custom --browsertime.connectivity.latency $LATENCY "$@"

  webpagereplaywrapper replay --stop $WPR_PARAMS
}


function runSitespeedio(){

  # Inspired by docker-selenium way of shutting down
  function shutdown {
    kill -s SIGTERM ${PID}
    wait $PID
  }

  exec $SITESPEEDIO "$@" &

  PID=$!

  trap shutdown SIGTERM SIGINT
  wait $PID
}

chromeSetup
setupADB

if [ $REPLAY ]
then
  runWebPageReplay $@
else
  runSitespeedio $@
fi
