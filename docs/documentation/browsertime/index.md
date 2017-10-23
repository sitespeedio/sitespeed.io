---
layout: default
title: Browsertime
description:
keywords: tools, documentation, web performance
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

<img src="{{site.baseurl}}/img/logos/browsertime.png" class="pull-right img-big" alt="Browsertime logo" width="200" height="175">

# Browsertime
{:.no_toc}

Access the Web Performance Timeline, from your browser, in your terminal!

Browsertime allows you to:

 1. Query timing data directly from the browser, to access [Navigation Timing](http://kaaes.github.io/timing/info.html), [User Timing](http://www.html5rocks.com/en/tutorials/webperformance/usertiming/),
[Resource Timing](http://www.w3.org/TR/resource-timing/), first paint and [RUM Speed Index](https://github.com/WPO-Foundation/RUM-SpeedIndex).
 1. Generate [HAR](http://www.softwareishard.com/blog/har-12-spec/) files (using [HAR Export trigger](https://github.com/firebug/har-export-trigger) for Firefox and parsing the Chrome log for Chrome).
 1. Run custom JavaScript scripts in the browser and get statistics for each run.
 1. Record a video of the screen and analyze the result to get First Visual Change, Speed Index, Visual Complete 85 % and Last Visual Change.

## A simple example

Use our Docker image (with Chrome, Firefox, XVFB and the dependencies needed to record a video):

~~~
$ docker run --shm-size=1g --rm -v "$(pwd)":/browsertime-results sitespeedio/browsertime --video --speedIndex https://www.sitespeed.io/
~~~

Or using node:

~~~
$ bin/browsertime.js https://www.sitespeed.io
~~~

Load https://www.sitespeed.io/ in Chrome three times. Results are stored in a JSON file (browsertime.json) with the timing data, and a HAR file (browsertime.har) in browsertime-results/www.sitespeed.io/$date/

## I want more examples
Check out the [examples](https://github.com/sitespeedio/browsertime/blob/master/docs/examples/README.md).

## Browsers
Browsertime supports Firefox and Chrome on desktop. On Android we support Chrome.

But we want to [support Opera (on Android)](https://github.com/tobli/browsertime/issues/150)  and when(?!) iOS Safari supports WebDriver we will add that too.

## How does it work
Browsertime uses Selenium NodeJS to drive the browser. It starts the browser, loads a URL, then executes configurable JavaScripts to collect both metrics and a HAR file.

To get the HAR from Firefox, we use the [HAR Export Trigger](https://github.com/firebug/har-export-trigger) and in Chrome we use [Chrome-HAR](https://github.com/sitespeedio/chrome-har) to parse the timeline log and generate the HAR file.

Oh, and you can run your own Selenium script before (<code>--preScript</code>) and after (<code>--postScript</code>) a URL is accessed, so you can log in/log out or do whatever you want.

# Speed Index and video
It's easiest to run [our ready-made Docker container](https://hub.docker.com/r/sitespeedio/browsertime/) to be able to record a video and calculate Speed Index because then you get all dependencies needed for free to run [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics).

The default video will include a timer and showing when the metrics happens, but you can turn that off using <code>--videoRaw</code>.

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/video-example.gif">

## Test using Docker
You can build and test changes using Docker locally:

~~~
$ docker build -t sitespeedio/browsertime .
$ docker run --shm-size=1g --rm -v "$(pwd)":/browsertime-results sitespeedio/browsertime -n 1 --video --speedIndex https://www.sitespeed.io/
~~~

## Connectivity

You can throttle the connection to make the connectivity slower to make it easier to catch regressions. The best way to do that is to set up a network bridge in Docker.

By default, we use [TSProxy](https://github.com/WPO-Foundation/tsproxy) because its only dependency is Python 2.7, but we have a problem with that together with Selenium, so that it is kind of unusable right now. Help us fix that in [#229](https://github.com/sitespeedio/browsertime/issues/229).

If you run Docker you can use tc as connectivity engine but that will only set the latency; if you want to set the download speed you need to create a network bridge in Docker.

Here's a full example to set up Docker network bridges on a server that has tc installed:

~~~bash
#!/bin/bash
echo 'Starting Docker networks'
docker network create --driver bridge --subnet=192.168.33.0/24 --gateway=192.168.33.10 --opt "com.docker.network.bridge.name"="docker1" 3g
tc qdisc add dev docker1 root handle 1: htb default 12
tc class add dev docker1 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker1 parent 1:12 netem delay 300ms

docker network create --driver bridge --subnet=192.168.34.0/24 --gateway=192.168.34.10 --opt "com.docker.network.bridge.name"="docker2" cable
tc qdisc add dev docker2 root handle 1: htb default 12
tc class add dev docker2 parent 1:1 classid 1:12 htb rate 5mbit ceil 5mbit
tc qdisc add dev docker2 parent 1:12 netem delay 28ms

docker network create --driver bridge --subnet=192.168.35.0/24 --gateway=192.168.35.10 --opt "com.docker.network.bridge.name"="docker3" 3gfast
tc qdisc add dev docker3 root handle 1: htb default 12
tc class add dev docker3 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker3 parent 1:12 netem delay 150ms

docker network create --driver bridge --subnet=192.168.36.0/24 --gateway=192.168.36.10 --opt "com.docker.network.bridge.name"="docker4" 3gem
tc qdisc add dev docker4 root handle 1: htb default 12
tc class add dev docker4 parent 1:1 classid 1:12 htb rate 0.4mbit ceil 0.4mbit
tc qdisc add dev docker4 parent 1:12 netem delay 400ms
~~~

Then when you run your container you add the network with <code>--network cable</code>. You should also tell Browsertime that you set the connectivity external from BT. A full example running running with cable:

~~~bash
$ docker run --shm-size=1g --network=cable --rm sitespeedio/browsertime -c cable --connectivity.engine external --speedIndex --video https://www.sitespeed.io/
~~~

And using the 3g network:

~~~bash
$ docker run --shm-size=1g --network=3g --rm sitespeedio/browsertime -c 3g --nnconnectivity.engine external --speedIndex --video https://www.sitespeed.io/
~~~

And if you want to remove the networks:

~~~bash
#!/bin/bash
echo 'Stopping Docker networks'
docker network rm 3g
docker network rm 3gfast
docker network rm 3gem
docker network rm cable
~~~

## Test on your mobile device
Browsertime supports Chrome on Android: Collecting SpeedIndex, HAR and video! This is still really new, let us know if you find any bugs.

You need to [install adb](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#desktop) and [prepare your phone](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#on-your-phone) before you start.

The current version doesn't support Docker so you need to [install the requirements](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/master/Dockerfile) for VisualMetrics yourself on your machine before you start.

If you want to set connectivity you need to use something like [Micro device lab](https://github.com/phuedx/micro-device-lab).

~~~
browsertime --browsertime.chrome.android.package com.android.chrome https://www.sitespeed.io --video --speedIndex
~~~

## Configuration
Run <code>$ bin/browsertime.js --help</code> and you can see the configuration options:

~~~help
{% include_relative config.md %}
~~~
