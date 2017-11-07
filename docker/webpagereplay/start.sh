#!/bin/bash
set -e

google-chrome --version
firefox --version

RUNS="${RUNS:-5}"
LATENCY=${LATENCY:-100}

webpagereplaywrapper record --start --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go


echo "$@"

/usr/src/app/node_modules/.bin/browsertime -n 1 --xvfb --docker --chrome.args host-resolver-rules="MAP *:80 127.0.0.1:8080,MAP *:443 127.0.0.1:8081,EXCLUDE localhost" --pageCompleteCheck "return true;" "$@"

webpagereplaywrapper record --stop --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go

webpagereplaywrapper replay --start --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go

/usr/src/app/bin/sitespeed.js -n $RUNS --browsertime.xvfb --browsertime.docker --video --speedIndex --browsertime.pageCompleteCheck "return true;" --browsertime.chrome.args host-resolver-rules="MAP *:80 127.0.0.1:8080,MAP *:443 127.0.0.1:8081,EXCLUDE localhost" --browsertime.connectivity.engine throttle --browsertime.connectivity.throttle.localhost --browsertime.connectivity.profile custom --browsertime.connectivity.latency $LATENCY  "$@"

webpagereplaywrapper replay --stop --path /root/go/src/github.com/catapult-project/catapult/web_page_replay_go
