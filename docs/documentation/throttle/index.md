---
layout: default
title: Throttle
description: Simulate slow network connections on Linux and Mac OS X.
keywords: throttle, documentation, web performance
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

# Throttle
{:.no_toc}

Simulate slow network connections on Linux and Mac OS X.

Inspired by [tylertreat/Comcast](https://github.com/tylertreat/Comcast), the [connectivity setting in the WPTAgent](https://github.com/WPO-Foundation/wptagent/blob/master/internal/traffic_shaping.py) and [sltc](https://github.com/sitespeedio/sltc).

Throttle uses *pfctl* on Mac and *tc* on Linux to simulate different network speeds.

You can set the download/upload speed and RTT. Upload/download is in kbit/s and RTT in ms.

## Install

```
$ npm install @sitespeed.io/throttle -g
```

## Start simulate a slower network connection

Here is an example for running with 3G connectivity. Remember: Throttle will use sudo so your user will need
sudo rights.

```
$ throttle --up 330 --down 780 --rtt 200
```

## Stop simulate the network
Stopping is as easy as giving the parameter *stop* to throttle.

```
$ throttle --stop
```

## Add delay on your localhost (Linux only at the moment)
This is useful if you run [WebPageReplay](https://github.com/catapult-project/catapult/blob/master/web_page_replay_go/README.md) and want to add som latency to your tests.

```
$ throttle --rtt 200 --localhost
```

## Stop adding delay on localhost (Linux only)

```
$ throttle --stop --localhost
```

## Use directly in NodeJS


```javascript
const throttle = require('@sitespeed.io/throttle');
// Returns a promise
throttle.start({up: 360, down: 780, rtt: 200}).then(() => ...
```

## Run in Docker (on Linux)

Make sure to run ```sudo modprobe ifb numifbs=1``` before you start the container.

And then when you actually start your Docker container, give it the right privileges with ```--cap-add=NET_ADMIN```

You can also [use Docker networks]({{site.baseurl}}/documentation/sitespeed.io/browsers/#docker-networks) to change connectivity when testing inside a container.
