---
layout: default
title: Browsertime
description: Access the Web Performance Timeline, from your browser, in your terminal!
keywords: configuration, browsertime, firefox, chrome, video, speed index
author: Peter Hedenskog
category: browsertime
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

<img src="{{site.baseurl}}/img/logos/browsertime.png" class="pull-right img-big" alt="Browsertime logo" width="200" height="175">

# Browsertime
{:.no_toc}

* Lets place the TOC here
{:toc}

Browsertime is the heart of sitespeed.io that handles everything with the browser. At the moment we support Chrome and Firefox on desktop and Chrome on Android. But we want to [support Opera (on Android)](https://github.com/tobli/browsertime/issues/150)  and when(?!) iOS Safari supports WebDriver we will add that too.

Browsertime runs JavaScript in the browser and collect metrics.


## What we can collect

1. Access the Web Performance Timeline, from your browser, in your terminal! Browsertime allows you to Query timing data directly from the browser, to access [Navigation Timing](http://kaaes.github.io/timing/info.html), [User Timing](http://www.html5rocks.com/en/tutorials/webperformance/usertiming/),
[Resource Timing](http://www.w3.org/TR/resource-timing/), first paint and [RUM Speed Index](https://github.com/WPO-Foundation/RUM-SpeedIndex).
2. Generate [HAR](http://www.softwareishard.com/blog/har-12-spec/) files (using [HAR Export trigger](https://github.com/firebug/har-export-trigger) for Firefox and parsing the Chrome log for Chrome).
3. Run custom JavaScript scripts in the browser and get statistics for each run.
4. Record a video of the screen and analyze the result to get First Visual Change, Speed Index, Visual Complete 85 % and Last Visual Change.

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


## How does it work
Browsertime uses Selenium NodeJS to drive the browser. It starts the browser, loads a URL, then executes configurable JavaScripts to collect both metrics and a HAR file.

To get the HAR from Firefox, we use the [HAR Export Trigger](https://github.com/firebug/har-export-trigger) and in Chrome we use [Chrome-HAR](https://github.com/sitespeedio/chrome-har) to parse the timeline log and generate the HAR file.

Oh, and you can run your own Selenium script before (<code>--preScript</code>) and after (<code>--postScript</code>) a URL is accessed, so you can log in/log out or do whatever you want.

## Speed Index and video
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

You can throttle the connection to make the connectivity slower to make it easier to catch regressions. The best way to do that is to set up a network bridge in Docker or use Throttle. Read all about it [here]({{site.baseurl}}/documentation/sitespeed.io/connectivity/).


## Test on your mobile device
Browsertime supports Chrome on Android: Collecting SpeedIndex, HAR and video! This is still really new, let us know if you find any bugs.

You need to [install adb](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#desktop) and [prepare your phone](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#on-your-phone) before you start.

The current version doesn't support Docker so you need to [install the requirements](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/master/Dockerfile) for VisualMetrics yourself on your machine before you start.

If you want to set connectivity you need to use something like [Micro device lab](https://github.com/phuedx/micro-device-lab).

~~~
browsertime --browsertime.chrome.android.package com.android.chrome https://www.sitespeed.io --video --speedIndex
~~~


## Send metrics to Graphite
The easiest way to send metrics is to install [jq](https://stedolan.github.io/jq/) and use it to pick the values you wanna track.

Here's an example on how you can pickup the median SpeedIndex from Browsertime and send it to your Graphite instance.

~~~
echo "browsertime.your.key.SpeedIndex.median" $(cat /tmp/browsertime/browsertime.json | jq .statistics.visualMetrics.SpeedIndex.median) "`date +%s`" | nc -q0 my.graphite.com 2003
~~~
