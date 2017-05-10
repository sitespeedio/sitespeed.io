---
layout: default
title: Test your page using a mobile phone
description:
keywords: plugin, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Test your page using a mobile phone
---
[Documentation](/documentation/sitespeed.io/) / Mobile phones

# Test on Android
{:.no_toc}

* Lets place the TOC here
{:toc}

# Prerequisites

## Desktop
 * Install the [Android SDK](http://developer.android.com/sdk/index.html#downloads) on your desktop (just the command line tools!). If you are on a Mac and use [Homebrew](http://brew.sh/) just run: <code>brew install android-platform-tools</code>
 * Start the adb-server on your desktop: <code>adb start-server</code>

## On your phone
 * Install Chrome
 * Enable developer USB access to your phone: Go to About device, tap it, scroll down to the Build number, tap it seven (7) times.
 * Disable screen lock on your device.
 * Enable Stay awake
 * Enable USB debugging in the device system settings, under Developer options.
 * Install the [Stay Alive app](https://play.google.com/store/apps/details?id=com.synetics.stay.alive) and start it.
 * Plug in your phone using the USB port on your desktop computer.
 * When you plugin your phone, click OK on the "Allow USB debugging?" popup.

# Run
You are now ready to test using your phone:

~~~bash
$ sitespeed.io --browsertime.chrome.android.package com.android.chrome https://www.sitespeed.io
~~~

You will get result as you would with running this normally with summaries and waterfall graphs.

# Connectivity
If you run by default, the phone will use the current connection. The connectivity flag is currently not supported (would love a PR for that!) but you can set connectivity by using [TSProxy](https://github.com/WPO-Foundation/tsproxy).

1. Download [TSProxy](https://github.com/WPO-Foundation/tsproxy) and make sure you have at least Python 2.7 installed.
2. Check the local IP of your machine (in this example the IP is 10.0.1.7 and the default port for TSProxy is 1080).
3. Start TSProxy and bind it to your IP: <code>python tsproxy.py --bind 10.0.1.7 --rtt=200 --inkbps=1600 --outkbps=768</code>
4. Run <code>$ sitespeed.io --browsertime.chrome.android.package com.android.chrome --browsertime.chrome.args proxy-server="socks://10.0.1.7:1080" https://www.sitespeed.io</code>

You could also use [phuedxs](https://github.com/phuedx) [Micro Device Lab](https://github.com/phuedx/micro-device-lab), but using that requires additional work.

# Video and SpeedIndex
You can also collect a video and get Visual Metrics. The current version doesn't support Docker so you need to install the requirements for [VisualMetrics](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/master/Dockerfile) yourself on your machine before you start. If you have everything setup you can run:

~~~bash
$ sitespeed.io --browsertime.chrome.android.package com.android.chrome --video --speedIndex https://www.sitespeed.io
~~~
