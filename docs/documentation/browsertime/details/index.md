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

[Documentation]({{site.baseurl}}/documentation/browsertime/) / Details

# Details
{:.no_toc}

* Lets place the TOC here
{:toc}

## A simple example

Use our Docker image (with Chrome, Firefox, XVFB and the dependencies needed to record a video):

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/browsertime-results sitespeedio/browsertime:{% include version/browsertime.txt %} --video --speedIndex https://www.sitespeed.io/
~~~

Or using NodeJS:

~~~bash
browsertime https://www.sitespeed.io
~~~

Load https://www.sitespeed.io/ in Chrome three times. Results are stored in a JSON file (browsertime.json) with the timing data, and a HAR file (browsertime.har) in browsertime-results/www.sitespeed.io/$date/


## Speed Index and video
It's easiest to run [our ready-made Docker container](https://hub.docker.com/r/sitespeedio/browsertime/) to be able to record a video and calculate Speed Index because then you get all dependencies needed for free to run [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics).

The default video will include a timer and showing when the metrics happens, but you can turn that off using <code>--videoRaw</code>.

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/video-example.gif">

## Test using Docker
You can build and test changes using Docker locally. First build it:

~~~bash
docker build -t sitespeedio/browsertime .
~~~

And then just run it:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/browsertime-results sitespeedio/browsertime -n 1 --video --speedIndex https://www.sitespeed.io/
~~~

## Connectivity

You can throttle the connection to make the connectivity slower to make it easier to catch regressions. The best way to do that is to set up a network bridge in Docker or use Throttle. Read all about it [here]({{site.baseurl}}/documentation/sitespeed.io/connectivity/).


## Test on your mobile device
Browsertime supports Chrome on Android: Collecting SpeedIndex, HAR and video! This is still really new, let us know if you find any bugs.

You need to [install adb](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#desktop) and [prepare your phone](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#on-your-phone) before you start.

The current version doesn't support Docker so you need to [install the requirements](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/master/Dockerfile) for VisualMetrics yourself on your machine before you start.

If you want to set connectivity you need to use something like [Pi Network Conditioner](https://github.com/phuedx/pinc).

~~~bash
browsertime --browsertime.chrome.android.package com.android.chrome https://www.sitespeed.io --video --speedIndex
~~~
