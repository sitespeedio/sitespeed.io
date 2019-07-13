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

## Run tests on mobile phones
{:.no_toc}

* Lets place the TOC here
{:toc}

## Test on Android
You can run your tests on Chrome on Android phones.

### Prerequisites

We normally recommends using our Docker containers when you run sitespeed.io/Browsertime. However driving Android from Docker only works on a Linux host since there's is no way at the moment to map USB on Mac. If you use a Mac Mini or another Mac computer you should use the npm version.

#### Desktop

If you don't use Docker you need to:

- Install the [Android SDK](http://developer.android.com/sdk/index.html#downloads) on your desktop (just the command line tools!). If you are on a Mac and use [Homebrew](http://brew.sh/) just run: <code>brew tap caskroom/cask && brew cask install android-platform-tools</code>
- Start the adb-server on your desktop: <code>adb start-server</code>

#### On your phone

- Install Chrome
- Enable developer USB access to your phone: Go to _About device_ (or _About phone_) in your settings, tap it, scroll down to the _Build number_, tap it seven (7) times.
- Disable screen lock on your device.
- Enable _Stay awake_ in _Developer options_.
- Enable USB debugging in the device system settings, under _Developer options_.
- Install the [Stay Alive app](https://play.google.com/store/apps/details?id=com.synetics.stay.alive) and start it.
- Plug in your phone using the USB port on your desktop computer.
- When you plugin your phone, click OK on the "Allow USB debugging?" popup.

### Run

You are now ready to test using your phone:

```bash
sitespeed.io --browsertime.chrome.android.package com.android.chrome https://www.sitespeed.io
```

Remember: To test on Android using Docker you need to be on Linux (tested on Ubuntu). It will not work on OS X.

```bash
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}  -n 1 --browsertime.chrome.android.package com.android.chrome --browsertime.xvfb false https://www.sitespeed.io
```

You will get result as you would with running this normally with summaries and waterfall graphs.

### Connectivity

If you run by default, the phone will use the current connection.

#### gnirehtet and Throttle

You can use the connection of your desktop by reverse tethering. And then set the connectivity on your desktop computer.

1. Download [gnirehtet](https://github.com/Genymobile/gnirehtet) (Java or Rust version)
2. Install [Throttle](https://github.com/sitespeedio/throttle) (works on Mac OS X or Linux that has tc installed): <code>npm install @sitespeed.io/throttle -g</code>
3. Make sure your phone is plugged into your desktop using USB.
4. Start gnirehtet: <code>./gnirehtet run</code>
5. Start throttle: <code>throttle 3g</code>
6. Run sitespeed.io.

Note: the first time you run gnirehtet you need to accept the vpn connection on your phone.

#### TSProxy

You can set connectivity by using [TSProxy](https://github.com/WPO-Foundation/tsproxy).

1. Download [TSProxy](https://github.com/WPO-Foundation/tsproxy) and make sure you have at least Python 2.7 installed.
2. Check the local IP of your machine (in this example the IP is 10.0.1.7 and the default port for TSProxy is 1080).
3. Start TSProxy and bind it to your IP: <code>python tsproxy.py --bind 10.0.1.7 --rtt=200 --inkbps=1600 --outkbps=768</code>
4. Run <code>\$ sitespeed.io --browsertime.chrome.android.package com.android.chrome --browsertime.chrome.args proxy-server="socks://10.0.1.7:1080" https://www.sitespeed.io</code>

You could also use [phuedxs](https://github.com/phuedx) [Pi Network Conditioner](https://github.com/phuedx/pinc), but using that requires some additional work but more reliable metrics.

### Video and SpeedIndex

You can also collect a video and get Visual Metrics. Running on Mac or without Docker you need to install the requirements for [VisualMetrics](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/master/Dockerfile) yourself on your machine before you start. If you have everything setup you can run:

```bash
sitespeed.io --browsertime.chrome.android.package com.android.chrome --video --visualMetrics https://www.sitespeed.io
```

And using Docker (remember: only works in Linux hosts):

```bash
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}  -n 1 --browsertime.chrome.android.package com.android.chrome --browsertime.xvfb false https://www.sitespeed.io
```

If you want to run Docker on Mac OS X, you can follow Appiums [setup](https://github.com/appium/appium-docker-android) by creating a docker-machine, give ut USB access and then run the container from that Docker machine.

### Driving multiple phones from the same computer

If you wanna drive multiple phones from one computer using Docker, you need to mount each USB port to the right Docker container.

You can do that with the `--device` Docker command:
`--device=/dev/bus/usb/001/007`

The first part is the bus and that will not change, but the second part _devnum_ changes if you unplug the device or restart,

You need to know which phone are connected to which usb port.

Here's an example on how you can get that automatically before you start the container, feeding the unique id (that you get from _lsusb_).

```bash
#!/bin/bash

# Example ID, change this in your example
ID=22b8:2e76
LSUSB_OUTPUT=$(lsusb -d $ID)

if [ -z “$LSUSB_OUTPUT” ]; then
 echo “Could not find the phone”
 exit;
fi

BUS=`echo $LSUSB_OUTPUT | grep -Po 'Bus \K[0-9]+'`

# Read the device number:
DEV=`echo $LSUSB_OUTPUT | grep -Po 'Device \K[0-9]+'`

echo $BUS/$DEV
```

### Running different versions of Chrome
You can choose which Chrome version you want to run on your phone using `--chrome.android.package` to specify each versions package name.

* Chrome Stable - *com.android.chrome*
* Chrome Beta - *com.chrome.beta*
* Chrome Dev - *com.chrome.dev*
* Chrome Canary - *com.chrome.canary*
* Chromium - *org.chromium.chrome*

If you installed Chrome Canary on your phone and want to use it, then add `--chrome.android.package com.chrome.canary` to your run.
 Driving different versions needs different versions of the Chromedriver. The Chrome version number needs to match the Chromedriver version number. Browsertime/sitespeed.io ships with the latest stable version of the Chromedriver. If you want to run other versions, you need to [download from the official Chromdriver page](https://chromedriver.chromium.org/downloads). And then you specify the version by using `--chrome.chromedriverPath`.

### Collect trace log

One important thing when testing on mobile is to analyze the Chrome trace log. You can get that with _browsertime.chrome.collectTracingEvents_:

```bash
sitespeed.io --browsertime.chrome.android.package com.android.chrome --cpu --video --visualMetrics https://www.sitespeed.io
```

### Cookies
 
Chrome on Android do not support WebExtensions and we use the [Browsertime Extension](https://github.com/sitespeedio/browsertime-extension) to set cookies, block requests and basic auth.

But you can set a cookie on Android you can do that with adding a request header `-r key:value`.