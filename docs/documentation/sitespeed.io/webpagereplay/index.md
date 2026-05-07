---
layout: default
title: Use WebPageReplay together with sitespeed.io
description: Use WebPageReplay to find front end performance regressions.
keywords: webpagereplay, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
category: sitespeed.io
twitterdescription: Use WebPageReplay and sitespeed.io.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / WebPageReplay

# WebPageReplay
{:.no_toc}

* Let's place the TOC here
{:toc}

[WebPageReplay](https://github.com/catapult-project/catapult/blob/main/web_page_replay_go/README.md) is a proxy that first records your website and then replays it locally. That makes it easier to find front-end performance regressions: latency and server timings stay constant. We have integrated WebPageReplay in both Browsertime and the sitespeed.io Docker containers to make it easier to use.

There are other replay proxies like [mahimahi](http://mahimahi.mit.edu/), but that one doesn't support HTTP2 by default. We will happily include other proxies in the future.

## Why use WebPageReplay

Using WebPageReplay we get more stable metrics. This is super useful if you want to make sure you find front-end performance regressions. However, testing **without** a proxy is good since you will then get the same variations as your users will get.

## How does it work?

What's cool about how we include WebPageReplay is that the only thing you need to do is start the container with a couple of extra parameters! Inside the Docker container this is what happens:

1. WebPageReplay is started in record mode.
2. Browsertime accesses the URLs you choose once (so they are recorded).
3. WebPageReplay is closed down.
4. WebPageReplay in replay mode is started on localhost.
5. The latency is set up for accessing localhost.
6. Sitespeed.io (using Browsertime) tests the URL as many times as you choose (with the current latency).
7. WebPageReplay in replay mode is closed down.

You can pass any parameter to sitespeed.io/Browsertime as usual.

WebPageReplay tries to make each page load as deterministic as possible. It does that by making the JavaScript Date deterministic (see [deterministic.js](https://github.com/sitespeedio/sitespeed.io/blob/main/docker/webpagereplay/deterministic.js)). That means if you use JavaScript Date in your `--pageCompleteCheck` you need to change it. We do that by default.

## The metrics

How stable will the metrics be? It depends on your page and how it is built. We have seen pages with super stable metrics and we have seen pages with not so stable metrics. You really need to test it yourself.

## Using Docker
If you use our pre-made Docker container, it comes with WebPageReplay so it's really easy to use.

### Using WebPageReplay on desktop

You need to give Docker access to the network with `--cap-add=NET_ADMIN` so that you can set the latency on the replay server. You need to add `-e REPLAY=true` so that the Docker container knows to start WebPageReplay. Then you set the latency: `-e LATENCY=100`. In this example we set the latency to 100 ms.

To run a simple test:

```bash
docker run --cap-add=NET_ADMIN --rm -v "$(pwd):/sitespeed.io" -e REPLAY=true -e LATENCY=100 sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} -n 5 -b chrome https://en.wikipedia.org/wiki/Barack_Obama
```

Remember to verify the HAR files produced so that they look like they should: verify that WebPageReplay replays your website correctly. If it does, then use it :)

### Using WebPageReplay on mobile (Chrome on Android)

Using WebPageReplay in Docker and your Android phone only works on Linux. This is because mounting the USB port doesn't work on Mac OS X.

Using sitespeed.io:

```bash
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --cap-add=NET_ADMIN --shm-size=1g --rm -v "$(pwd):/sitespeed.io" -e REPLAY=true -e LATENCY=100 sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://en.m.wikipedia.org/wiki/Barack_Obama --browsertime.chrome.android.package com.android.chrome --browsertime.xvfb false --browsertime.chrome.args ignore-certificate-errors-spki-list=PhrPvGIaAMmd29hj8BCZOq096yj7uMpRNHpn5PDxI6I= --browsertime.chrome.args user-data-dir=/data/tmp/chrome -n 11
```

Using Browsertime:

```bash
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --cap-add=NET_ADMIN --shm-size=1g --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime:{% include version/browsertime.txt %} https://en.m.wikipedia.org/wiki/Barack_Obama --chrome.android.package com.android.chrome --xvfb false --chrome.args ignore-certificate-errors-spki-list=PhrPvGIaAMmd29hj8BCZOq096yj7uMpRNHpn5PDxI6I= --chrome.args user-data-dir=/data/tmp/chrome -n 11
```

A couple of things:

- You need to run the container in privileged mode to be able to mount USB ports
- Add `-e START_ADB_SERVER=true` to start the ADB server inside the container (that makes it possible to talk to your phone)
- Make sure xvfb is turned off `--xvfb false`
- To ignore HTTPS certificate errors add `--chrome.args ignore-certificate-errors-spki-list=PhrPvGIaAMmd29hj8BCZOq096yj7uMpRNHpn5PDxI6I=` and `--chrome.args user-data-dir=/data/tmp/chrome` (they only work together).

If you want to drive multiple phones from one instance, you can change the ports WebPageReplay is using (making sure they do not collide between phones). You can do that with
`-e WPR_HTTP_PORT=XXX` and `-e WPR_HTTPS_PORT=YYY`. The default ports are 8080 and 8081.

## Using WebPageReplay without Docker

If you don't use Docker, we have a repo that makes it easier for you to use WebPageReplay. It works on Mac and Linux. We have configuration to run tests on Firefox and Chrome. You need to have sitespeed.io installed globally for the scripts to work.

Start by cloning the repo:

```bash
git clone git@github.com:sitespeedio/replay.git
```

Go into the cloned repo. Then you can use our example configuration files to run the tests.

### Desktop

To run tests on desktop use the configuration file for desktop:


```bash
./replay.sh --config desktop.json https://www.sitespeed.io -n 5 -b firefox
```

### Android
Running your tests on an Android you first need to [install ADB and prepare your phone for testing](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#prerequisites).

Then make sure you use the *android.json* configuration file and pass on *ANDROID=true* to the script. The script will then use the first attached Android phone it finds using *adb devices*.

```bash
ANDROID=true ./replay.sh --config android.json https://www.sitespeed.io -n 5 -b chrome
```

If you have multiple phones attached you probably want to run on a specific phone. You can choose phone by passing the DEVICE_SERIAL.

```bash
ANDROID=true DEVICE_SERIAL=ZY322GXR4B ./replay.sh --config android.json https://www.sitespeed.io -n 1 -b firefox
```

If you want to slow down your test, you can add latency on your localhost that serves the web page.

```bash
ANDROID=true ./replay.sh --config android.json --browsertime.connectivity.engine throttle --browsertime.connectivity.throttle.localhost true --browsertime.connectivity.profile custom --browsertime.connectivity.rtt 100 https://www.sitespeed.io
```