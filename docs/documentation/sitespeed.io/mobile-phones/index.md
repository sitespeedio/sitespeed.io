---
layout: default
title: Test your page using a Android or iOS mobile phone.
description: You can use Chrome on your Android phone to test your pages (and get a video and Speed Index) or use Safari on iOS.
keywords: mobile, android, safari, ios, browsertime, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Test your page using Android or iOS.
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
try

#### Desktop

If you don't use Docker you need to:

- Install the [Android SDK](http://developer.android.com/sdk/index.html#downloads) on your desktop (just the command line tools!). If you are on a Mac and use [Homebrew](http://brew.sh/) just run: <code>brew install --cask android-platform-tools</code>

#### On your phone
You probably want to setup a new phone from scratch to have a dedicated device. When you start your phone for the first time, follow these instructions:

- Make sure to say *no* to all data collection (on a new Android its something like 4-5 times you need to say no)
- Setup a specific Google account that you use for testing
- Update to latest Chrome in the Play Store (log in with your new user)
- Set volume to zero for Media/Alarm/Ring, and turn off the *Power up/down sound*. Turn off all sounds that you can!
- Disable screen lock on your device (Set Screen Lock to *None*).
- You probably also want to disable notifications from different update services. Do that under  _Settings_ and _Apps_, then choose the service and select _Notifications_ and toggle _Block All_ to _On_.

Next step is to prepare your phone to be used from a computer. To do that you need to enable Developer options:
- Go to _About device_ (or _About phone_) in your settings, tap it, scroll down to the _Build number_, tap it seven (7) times to enable developer options.

Then in _Developer options_:
- Enable _Stay awake_
- Turn off _Automatic System Updates_ 
- Enable _USB debugging_

You are almost ready!
- Plug in your phone using the USB port on your desktop computer.
- When you plugin your phone, click OK on the "Allow USB debugging?" popup.

### Run

You are now ready to test using your phone:

```bash
sitespeed.io --android https://www.sitespeed.io
```

Remember: To test on Android using Docker you need to be on Linux (tested on Ubuntu). It will not work on OS X.

```bash
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}  -n 1 --android --browsertime.xvfb false https://www.sitespeed.io
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

If you use OS X you can use the [Ryan Wirth wrapper for gnirehtet](https://github.com/RyanWirth/gnirehtet) that makes it even simpler.

Note: the first time you run gnirehtet you need to accept the vpn connection on your phone.

#### TSProxy

You can set connectivity by using [TSProxy](https://github.com/WPO-Foundation/tsproxy).

1. Download [TSProxy](https://github.com/WPO-Foundation/tsproxy) and make sure you have at least Python 2.7 installed.
2. Check the local IP of your machine (in this example the IP is 10.0.1.7 and the default port for TSProxy is 1080).
3. Start TSProxy and bind it to your IP: <code>python tsproxy.py --bind 10.0.1.7 --rtt=200 --inkbps=1600 --outkbps=768</code>
4. Run <code>\$ sitespeed.io --android --browsertime.chrome.args proxy-server="socks://10.0.1.7:1080" https://www.sitespeed.io</code>

You could also use [phuedxs](https://github.com/phuedx) [Pi Network Conditioner](https://github.com/phuedx/pinc), but using that requires some additional work but more reliable metrics.

### Video and SpeedIndex

You can also collect a video and get Visual Metrics. Running on Mac or without Docker you need to install the requirements for [VisualMetrics](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/main/Dockerfile) yourself on your machine before you start. If you have everything setup you can run:

```bash
sitespeed.io --android --video --visualMetrics https://www.sitespeed.io
```

And using Docker (remember: only works in Linux hosts):

```bash
docker run --privileged -v /dev/bus/usb:/dev/bus/usb -e START_ADB_SERVER=true --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}  -n 1 --android --browsertime.xvfb false https://www.sitespeed.io
```

If you want to run Docker on Mac OS X, you can follow Appiums [setup](https://github.com/appium/appium-docker-android) by creating a docker-machine, give out USB access and then run the container from that Docker machine.

### Driving multiple phones from the same computer

If you wanna drive multiple phones from one computer using Docker, you need to mount each USB port to the right Docker container.

You can do that with the `--device` Docker command:
`--device=/dev/bus/usb/001/007`

The first part is the bus and that will not change, but the second part _devnum_ changes if you unplug the device or restart,

You need to know which phone are connected to which USB port.

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
You can choose which Chrome version you want to run on your phone using `--chrome.android.package` to specify each versions package name. By default (just using  `--android` Chrome stable version is used):

* Chrome Stable - *com.android.chrome*
* Chrome Beta - *com.chrome.beta*
* Chrome Dev - *com.chrome.dev*
* Chrome Canary - *com.chrome.canary*
* Chromium - *org.chromium.chrome*

If you installed Chrome Canary on your phone and want to use it, then add `--chrome.android.package com.chrome.canary` to your run.
 Driving different versions needs different versions of the ChromeDriver. The Chrome version number needs to match the ChromeDriver version number. Browsertime/sitespeed.io ships with the latest stable version of the ChromeDriver. If you want to run other versions, you need to [download from the official ChromeDriver page](https://chromedriver.chromium.org/downloads). And then you specify the version by using `--chrome.chromedriverPath`.

### Collect trace log

One important thing when testing on mobile is to analyse the Chrome trace log. You can get that with `--cpu`:

```bash
sitespeed.io --android --cpu https://www.sitespeed.io
```

### Running Firefox
To run Firefox stable you just run:

```bash
sitespeed.io --android -b firefox https://www.sitespeed.io
```

Note that collecting the HAR is turned off since we cannot use the HAR Export trigger on Android.

### Only run tests when battery temperature is below X
You can configure your tests to run when the battery temperature of your phone is below a certain threshold. Over heated mobile phones throttles the CPU so its good to keep track of the temperature (if you send metrics to Graphite/InfluxDB the battery temperature is automatically sent).

Use `--androidBatteryTemperatureLimit` to set a minimum battery temperature limit before you start your test on your Android phone. Temperature is in [Celsius](https://en.wikipedia.org/wiki/Celsius).

In this example the tests will start when the battery is below 32 degrees. By default sitespeed.io will wait two minutes and then check again. You can configure the wait time with `--androidBatteryTemperatureWaitTimeInSeconds`.

```bash
sitespeed.io --android --androidBatteryTemperatureLimit 32 https://www.sitespeed.io
```

### Run on a rooted device
You can run on fresh Android device or on a rooted device. If you use rooted device and you use a Moto G5 or a Pixel 2 it will be configured for as stable performance as possible if you add `--androidRooted` to your run. We follow [Mozillas setup](https://dxr.mozilla.org/mozilla-central/source/testing/raptor/raptor/performance_tuning.py) best practise to do that. Make sure you only do that for a phone that you have dedicated to performance tests, since it will be kept in that performance state after the tests.

### Power usage testing
You can run power usage tests on your webpage with android. To do so, you would need to provide the `--androidPower true` option:

```bash
sitespeed.io --android -b firefox --androidPower true https://www.sitespeed.io
```

To get data from this, you need to make sure your phone has its charging disabled. One method of doing this could be to run adb over wifi instead of through a USB connection. Alternatively, if your phone is rooted, you can use commands that are similar to these (they are model-specific):

```bash
Pixel 2
-------
Disable: adb shell "su -c 'echo 1 > /sys/class/power_supply/battery/input_suspend'"
Enable: adb shell "su -c 'echo 0 > /sys/class/power_supply/battery/input_suspend'"

Moto G5
-------
Disable: adb shell "su -c 'echo 0 > /sys/class/power_supply/battery/charging_enabled'"
Enable: adb shell "su -c 'echo 1 > /sys/class/power_supply/battery/charging_enabled'"
```

Results from this are gathered into the `android.power` entry in the browsertime results JSON. The measurements are all in mAh (milliampere-hours). The metrics that are obtained depend on the major android version being used (Android 7 doesn't have smearing which gives the `screen` and `proportional` metrics), but you will usually find these:

* total: The total power used by the application.
* cpu: The total cpu power used by the application.
* sensor: The total sensor power used by the application.
* screen: The total screen power (smeared) used by the application.
* full-screen: The total screen power used during the test (not specific to the application).
* wifi: The total wifi power used by the application.
* full-wifi: The total wifi power used during the test (not specific to the application).
* proportional: The proportionally smeared power usage portion of the application (power usage of background applications that are propotionally attributed to all open applications).

## Test on iOS

You can run your tests on Safari on iOS.

### Prerequisites

To be able to test you need latest OS X Catalina on your Mac computer and iOS 13 on your phone (or iPad).

#### Desktop

Run your test using npm (instead of Docker).

*SafariDriver* the driver that drives Safari is bundled in OS X. But to be able to use it you need to enable it with:

```bash
safaridriver --enable
```

#### On your phone

On Safari you need to enable **Remote Automation** to be able to drive it with WebDriver. To do this, toggle the setting in *Settings → Safari → Advanced → Remote Automation*.

Plug in the phone into your machine and *trust the host* and make sure that your phone is unlocked when you run your tests.

Your phone needs to be unlocked (turn off *Auto-Lock*) and make sure to turn down the brightness, so that you save energy.

If you have any problems, make sure to read the [WebKit blog post about setting up your phone for Selenium](https://webkit.org/blog/9395/webdriver-is-coming-to-safari-in-ios-13/).

### Run

You are now ready to test using your phone:

```bash
sitespeed.io -b safari --safari.ios https://www.sitespeed.io
```

### Limitations
At the moment there are a couple of limitations running Safari:

* No HAR file
* No videos
* No way to set request headers
* No built in setting connectivity

You can help us [adding support in Browsertime](https://github.com/sitespeedio/browsertime)!

## Test on iOS simulator
You can use the iOS simulator to test run tests on different iOS devices. This works good if you use one of the new M1 Macs since it will then have the same CPU as an iPhone. You can read [Catchpoint blog post](https://blog.catchpoint.com/2021/01/28/with-m1-mac-minis-the-future-is-bright-for-mobile-device-testing/).

To get it running you should have a Mac Mini M1 and Xcode installed. Checkout the [install instructions for Mac](https://www.sitespeed.io/documentation/sitespeed.io/installation/#mac).

To run your test you need to sepcify the Safari deviceUDID = choosing what kind of device to use. You can list all your availible devices using `xcrun simctl list devices`.

Then run your test:
```bash
sitespeed.io https://www.sitespeed.io -b safari --safari.useSimulator --safari.device UDID YOUR_DEVICE_ID --video --visualMetrics -c 4g
```