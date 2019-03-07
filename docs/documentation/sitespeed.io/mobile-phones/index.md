---
layout: default
title: Test your page using a Android mobile phone.
description: You can use Chrome on your Android phone to test your pages (and get a video and Speed Index).
keywords: mobile, android, browsertime, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Test your page using a mobile phone
---
[Documentation](/documentation/sitespeed.io/) / Mobile phones

# Test on Android
{:.no_toc}

* Lets place the TOC here
{:toc}

# Prerequisites
Driving Android from Docker only works on a Linux host since there's is no way at the moment to map USB on Mac!

## Desktop
If you don't use Docker you need to:

 * Install the [Android SDK](http://developer.android.com/sdk/index.html#downloads) on your desktop (just the command line tools!). If you are on a Mac and use [Homebrew](http://brew.sh/) just run: <code>brew tap caskroom/cask && brew cask install android-platform-tools</code>
 * Start the adb-server on your desktop: <code>adb start-server</code>

## On your phone
 * Install Chrome
 * Enable developer USB access to your phone: Go to *About device* (or *About phone*) in your settings, tap it, scroll down to the *Build number*, tap it seven (7) times.
 * Disable screen lock on your device.
 * Enable *Stay awake* in *Developer options*.
 * Enable USB debugging in the device system settings, under *Developer options*.
 * Install the [Stay Alive app](https://play.google.com/store/apps/details?id=com.synetics.stay.alive) and start it.
 * Plug in your phone using the USB port on your desktop computer.
 * When you plugin your phone, click OK on the "Allow USB debugging?" popup.

# Run
You are now ready to test using your phone:

~~~bash
sitespeed.io --browsertime.chrome.android.package com.android.chrome https://www.sitespeed.io
~~~

Remember: To test on Android using Docker you need to be on Linux (tested on Ubuntu). It will not work on OS X.

~~~bash
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}  -n 1 --browsertime.chrome.android.package com.android.chrome --browsertime.xvfb false https://www.sitespeed.io
~~~

You will get result as you would with running this normally with summaries and waterfall graphs.

If you want test coming Chrome versions you can use *com.chrome.beta* for latest beta and *com.chrome.dev* for latest development version (make sure installed them on your phone first).

# Connectivity
If you run by default, the phone will use the current connection. 

## gnirehtet and Throttle
You can use the connection of your desktop by reverse tethering. And then set the connectivity on your desktop computer.

1. Download [gnirehtet](https://github.com/Genymobile/gnirehtet) (Java or Rust version)
2. Install [Throttle](https://github.com/sitespeedio/throttle) (works on Mac OS X or Linux that has tc installed):  <code>npm install @sitespeed.io/throttle -g</code>
3. Make sure your phone is plugged into your desktop using USB.
4. Start gnirehtet: <code>./gnirehtet run</code>
5. Start throttle: <code>throttle 3g</code>
6. Run sitespeed.io.

Note: the first time you run gnirehtet you need to accept the vpn connection on your phone.

## TSProxy
You can set connectivity by using [TSProxy](https://github.com/WPO-Foundation/tsproxy).

1. Download [TSProxy](https://github.com/WPO-Foundation/tsproxy) and make sure you have at least Python 2.7 installed.
2. Check the local IP of your machine (in this example the IP is 10.0.1.7 and the default port for TSProxy is 1080).
3. Start TSProxy and bind it to your IP: <code>python tsproxy.py --bind 10.0.1.7 --rtt=200 --inkbps=1600 --outkbps=768</code>
4. Run <code>$ sitespeed.io --browsertime.chrome.android.package com.android.chrome --browsertime.chrome.args proxy-server="socks://10.0.1.7:1080" https://www.sitespeed.io</code>

You could also use [phuedxs](https://github.com/phuedx) [Pi Network Conditioner](https://github.com/phuedx/pinc), but using that requires some additional work but more reliable metrics.

# Video and SpeedIndex
You can also collect a video and get Visual Metrics. Running on Mac or without Docker you need to install the requirements for [VisualMetrics](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/master/Dockerfile) yourself on your machine before you start. If you have everything setup you can run:

~~~bash
sitespeed.io --browsertime.chrome.android.package com.android.chrome --video --speedIndex https://www.sitespeed.io
~~~

And using Docker (remember: only works in Linux hosts):

~~~bash
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}  -n 1 --browsertime.chrome.android.package com.android.chrome --browsertime.xvfb false https://www.sitespeed.io
~~~

If you want to run Docker on Mac OS X, you can follow Appiums [setup](https://github.com/appium/appium-docker-android) by creating a docker-machine, give ut USB access and then run the container from that Docker machine.

# Collect trace log
One important thing when testing on mobile is to analyze the Chrome trace log. You can get that with *browsertime.chrome.collectTracingEvents*:

~~~bash
sitespeed.io --browsertime.chrome.android.package com.android.chrome --browsertime.chrome.collectTracingEvents --video --speedIndex https://www.sitespeed.io
~~~

You can also change which categories to get. In this example we only get the devtools.timeline category.

~~~bash
sitespeed.io --browsertime.chrome.android.package com.android.chrome --chrome.timeline https://www.sitespeed.io
~~~


# Collect the net log
If you really want to deep dive into the what happens you can use the Chrome net log. You collect it with *browsertime.chrome.collectNetLog*:

~~~bash
sitespeed.io --browsertime.chrome.android.package com.android.chrome --browsertime.chrome.collectNetLog https://www.sitespeed.io
~~~


