---
layout: default
title: Throttle - Simulate slow network connections
description: Simulate slow network connections on Linux and Mac OS X.
keywords: throttle, documentation, web performance
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

# Throttle
{:.no_toc}

* Lets place the TOC here
{:toc}

## Introduction

**Throttle lets you *simulate slow network connections* on Linux and Mac OS X.**

Throttle uses *pfctl* on Mac and *tc* on Linux (you also need *ip* and *route* for Throttle to work on Linux) to simulate different network speeds and is inspired by [tylertreat/Comcast](https://github.com/tylertreat/Comcast), the [connectivity setting in the WPTAgent](https://github.com/WPO-Foundation/wptagent/blob/master/internal/traffic_shaping.py) and [sltc](https://github.com/sitespeedio/sltc).

**What is Throttle good for?**

It is usually used for two different things:

 - You run it as a standalone tool setting simulate different connection speeds.
 - You integrate it in your (web performance) tool to simulate different connections.

You can set the download/upload speed and RTT. Upload/download is in kbit/s and RTT in ms.

## Install

~~~bash
npm install @sitespeed.io/throttle -g
~~~

## Start simulate a slower network connection

Here is an example for running with 3G connectivity. Remember: Throttle will use sudo so your user will need
sudo rights.

~~~bash
throttle --up 330 --down 780 --rtt 200
~~~

## Pre made profiles
To make it easier we have pre made profiles, check them out by *throttle --help*:

~~~
--profile         Premade profiles, set to one of the following
                     3g: up:768 down:1600 rtt:150
                     3gfast: up:768 down:1600 rtt:75
                     3gslow: up:400 down:400 rtt:200
                     2g: up:32 down:35 rtt:650
                     cable: up:1000 down:5000 rtt:14
~~~

You can start throttle with one of the pre-made profiles:

~~~bash
throttle --profile 3gslow
~~~

## Stop simulate the slow network
Stopping is as easy as giving the parameter *stop* to throttle.

~~~bash
throttle --stop
~~~

## Add delay on your localhost (Linux only at the moment)
This is useful if you run [WebPageReplay](https://github.com/catapult-project/catapult/blob/master/web_page_replay_go/README.md) and want to add som latency to your tests.

~~~bash
throttle --rtt 200 --localhost
~~~

## Stop adding delay on localhost (Linux only)

~~~bash
throttle --stop --localhost
~~~

## Use directly in NodeJS


```javascript
const throttle = require('@sitespeed.io/throttle');
// Returns a promise
throttle.start({up: 360, down: 780, rtt: 200}).then(() => ...
```

## Run in Docker (on Linux)

Make sure to run ```sudo modprobe ifb numifbs=1``` before you start the container.

And then when you actually start your Docker container, give it the right privileges with ```--cap-add=NET_ADMIN```

You can also [use Docker networks]({{site.baseurl}}/documentation/sitespeed.io/connectivity/#docker-networks) to change connectivity when testing inside a container.
