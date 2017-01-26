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
 * Install the [Android SDK](http://developer.android.com/sdk/index.html#downloads) on your desktop (just the command line tools!). If you are in Mac and use [Homebrew](http://brew.sh/) just run: <code>brew install android-platform-tools</code>
 * Start the adb-server on your desktop: <code>adb start-server</code>

## On your phone
 * Install Chrome
 * Enable developer USB access to your phone: Go to About device, tap it, scroll down to the Build number, tap it seven (7) times.
 * Disable screen lock on your device.
 * Enable Stay awake
 * Enable USB debugging in the device system settings, under Developer options.
 * Install the [Stay Alive app](https://play.google.com/store/apps/details?id=com.synetics.stay.alive) and start it.
 * Plugin your phone using the USB port on your desktop computer.
 * When you plugin your phone, click OK on the "Allow USB debugging?" popup.

## Connectivity
If you run by default, the phone will use the current connection. The connectivity flag is currently not supported (would love a PR for that!) but you can use [phuedxs](https://github.com/phuedx) [Micro Device Lab](https://github.com/phuedx/micro-device-lab) and connect your phone to the wifi you want to use. There you can choose what kind of connectivity profile you want to use.

## Run
You are now ready to run your and test on your phone:

~~~bash
$ sitespeed.io --browsertime.chrome.android.package com.android.chrome https://www.sitespeed.io  
~~~

You will get result as you would with running this normally with summaries and waterfall graphs.
