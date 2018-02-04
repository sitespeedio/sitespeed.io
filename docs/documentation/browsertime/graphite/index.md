---
layout: default
title: Send metrics from Browsertime to Graphite
description: It is super easy with jq and nc.
keywords: configuration, browsertime, graphite
author: Peter Hedenskog
category: browsertime
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

# Send metrics to Graphite
The easiest way to send metrics is to install [jq](https://stedolan.github.io/jq/) and use it to pick the values you wanna track. JQ helps you pick data from a JSON file.

First you just run Browsertime. Here make sure we create the *browsertime.json* in a directory called tmp.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/browsertime-results sitespeedio/browsertime:{% include version/browsertime.txt %} --video --speedIndex  --resultDir tmp https://www.sitespeed.io/ -n 5
~~~

Then we pickup the median SpeedIndex from Browsertime and send it to your Graphite instance.

~~~
echo "browsertime.your.key.SpeedIndex.median" $(cat tmp/browsertime.json | jq .statistics.visualMetrics.SpeedIndex.median) "`date +%s`" | nc -q0 my.graphite.com 2003
~~~

*browsertime.your.key.SpeedIndex.median* is the start of the key that we send to Graphite and *jq .statistics.visualMetrics.SpeedIndex.median* make sure we pick the median value of the 5 runs we did. And *nc* (netcat) sends the data to your Graphite server.
