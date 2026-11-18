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

{:toc}

## Introduction

**Throttle simulates slow network connections on Linux and macOS.**

Throttle uses *pfctl* on macOS and *tc* on Linux (the *ip* command must also be available) to shape the network. It is inspired by [tylertreat/Comcast](https://github.com/tylertreat/Comcast), the [connectivity setting in WPTAgent](https://github.com/WPO-Foundation/wptagent/blob/main/internal/traffic_shaping.py) and [sltc](https://github.com/sitespeedio/sltc).

**What is Throttle good for?**

There are two common use cases:

 - Run it as a standalone tool to simulate a different connection speed on your machine.
 - Use it from a (web performance) tool to set the connection speed before a test.

You can set the upload speed, the download speed and/or the round-trip time (RTT). Upload and download are in kbit/s and RTT in ms. Since 6.0.0 Throttle also shapes IPv6 traffic on both macOS and Linux.

## Install

```bash
npm install @sitespeed.io/throttle -g
```

On macOS, add these lines to `/etc/pf.conf` if they don't already exist. Without them you will get a `pfctl: Syntax error in config file: pf rules not loaded` error when you start Throttle:

```shell
pf_enable="YES"
pflog_enable="YES"
```

On Linux you need the `ip` command. On Debian/Ubuntu you can install it with:

```bash
sudo apt-get install -y net-tools iproute2
```

## Start simulating a slower network connection

Here is an example with 3G connectivity. Throttle uses *sudo* under the hood, so your user needs sudo rights.

```bash
throttle --up 330 --down 780 --rtt 200
```

You can also set just one of the values, for example only RTT:

```bash
throttle --rtt 200
```

## Pre-made profiles

To make life easier, Throttle ships with a set of pre-made profiles. You can list them with `throttle --help`:

```shell
--profile         Premade profiles, set to one of the following
                     3g: up:768 down:1600 rtt:150
                     3gfast: up:768 down:1600 rtt:75
                     3gslow: up:400 down:400 rtt:200
                     2g: up:256 down:280 rtt:400
                     cable: up:1000 down:5000 rtt:14
                     dsl: up:384 down:1500 rtt:25
                     3gem: up:400 down:400 rtt:200
                     4g: up:9000 down:9000 rtt:85
                     lte: up:12000 down:12000 rtt:35
                     edge: up:200 down:240 rtt:420
                     dial: up:30 down:49 rtt:60
                     fois: up:5000 down:20000 rtt:2
```

Start Throttle with a profile:

```bash
throttle --profile 3gslow
```

or the short form:

```bash
throttle 3gslow
```

## Add packet loss

By default there is no packet loss. That is intentional: if you want repeatable runs at the same network speed, packet loss only adds noise. If you want to simulate a really bad network you can add packet loss with `--packetLoss`. The value is in percent.

```bash
throttle --profile 3gslow --packetLoss 5
```

## Use a configuration file

Instead of passing flags on the command line you can keep your settings in a JSON file and point Throttle at it with `--config`.

`config.json`:

```json
{
    "up": 330,
    "down": 200,
    "rtt": 1000
}
```

Then run:

```bash
throttle --config config.json
```

## Stop simulating the network

To stop, pass `stop` (or `--stop`) to Throttle:

```bash
throttle --stop
```

or

```bash
throttle stop
```

## Add delay on localhost

This is useful when you test against a local web server or run [WebPageReplay](https://github.com/catapult-project/catapult/blob/main/web_page_replay_go/README.md) and want to add latency to your tests.

```bash
throttle --rtt 200 --localhost
```

## Stop adding delay on localhost

```bash
throttle --stop --localhost
```

## Use directly in Node.js

Throttle is an ES module and exports `start` and `stop` as named exports:

```javascript
import { start, stop } from '@sitespeed.io/throttle';
// Returns a promise
start({ up: 360, down: 780, rtt: 200 }).then(() => ...);
```

or with async/await:

```javascript
import { start, stop } from '@sitespeed.io/throttle';

const options = { up: 360, down: 780, rtt: 200 };
await start(options);
// Do your thing and then stop
await stop();
```

## Log all commands

You can log every network command Throttle runs by setting `LOG_THROTTLE=true`:

```bash
LOG_THROTTLE=true throttle 3gslow
```

or by passing `--log` on the command line:

```bash
throttle 3gslow --log
```

## Run in Docker (on Linux)

Run `sudo modprobe ifb numifbs=1` on the host before you start the container.

When you start your Docker container, give it the right privileges with `--cap-add=NET_ADMIN`.

You can also [use Docker networks]({{site.baseurl}}/documentation/sitespeed.io/connectivity/#docker-networks) to change connectivity when testing inside a container.
