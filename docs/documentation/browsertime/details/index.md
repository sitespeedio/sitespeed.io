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

{:toc}

## A simple example

Use our Docker image (Chrome, Firefox, Xvfb and the dependencies needed to record a video are all included):

~~~bash
docker run --rm -v "$(pwd)":/browsertime sitespeedio/browsertime:{% include version/browsertime.txt %} --video --visualMetrics https://www.sitespeed.io/
~~~

Or with Node.js:

~~~bash
browsertime https://www.sitespeed.io
~~~

This loads `https://www.sitespeed.io/` once in Chrome and writes the JSON file with the timing data (`browsertime.json`) and the HAR file (`browsertime.har`) to `browsertime-results/www.sitespeed.io/$date/`. Use `-n 3` to run the URL three times.


## Speed Index and video

The easiest way to get a video and Speed Index is to use [our Docker container](https://hub.docker.com/r/sitespeedio/browsertime/) — it ships with the dependencies needed to run [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics).

The default video has a timer overlay and markers showing when the metrics fire. You can turn that off with `--videoRaw`.

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/video-example.gif">

## Test using Docker

You can build and test changes locally with Docker. First build it:

~~~bash
docker build -t sitespeedio/browsertime .
~~~

Then run it:

~~~bash
docker run --rm -v "$(pwd)":/browsertime-results sitespeedio/browsertime -n 1 --video --visualMetrics https://www.sitespeed.io/
~~~

## Connectivity

You can throttle the network to slow the connection down — that makes regressions easier to spot. The recommended way is to set up a Docker network bridge or use [Throttle]({{site.baseurl}}/documentation/throttle/). Read the full guide [here]({{site.baseurl}}/documentation/sitespeed.io/connectivity/).


## Test on your mobile device

Browsertime supports Chrome on Android (Visual Metrics, HAR and video) and Safari on iOS (HAR via `ios_webkit_debug_proxy`, plus video and Visual Metrics over USB on macOS).

Before you start:

 - [Install ADB](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#desktop) and [prepare your phone](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#on-your-phone).
 - For iOS, install `ios-webkit-debug-proxy` (`brew install ios-webkit-debug-proxy` on macOS).

Mobile testing is not supported in Docker, so install the [VisualMetrics dependencies](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/main/Dockerfile) on your machine first.

If you want to throttle the connection on a real device, use something like [Pi Network Conditioner](https://github.com/phuedx/pinc).

~~~bash
browsertime --android https://www.sitespeed.io --video --visualMetrics
~~~
