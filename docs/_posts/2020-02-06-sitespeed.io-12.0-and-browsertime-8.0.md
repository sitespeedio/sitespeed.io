---
layout: default
title: sitespeed.io 12.0 and Browsertime 8.0.  
description: Massive love for Firefox, experimental support for Edge and an incredible amount of fixes.
authorimage: /img/aboutus/peter.jpg
intro:  Massive love for Firefox, experimental support for Edge and an incredible amount of fixes.
keywords: sitespeed.io, browsertime, webperf
nav: blog
---

# sitespeed.io 12.0 and Browsertime 8.0 

The [changelog for the new Browsertime 8.0](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#800-2020-02-05) is massive because we have many new contributions, mainly from the Mozilla performance team! Extra special thank you to all new contributors:

* [Nick Alexander](https://github.com/ncalexan)
* [Denis Palmeiro](https://github.com/dpalmeiro)
* [Sean Feng](https://github.com/sefeng211)
* [Chris Liu](https://github.com/cliu55)
* [Will Hawkins](https://github.com/hawkinsw)
* [Barret Rennie](https://github.com/brennie)
* [Tarek Ziade](https://github.com/tarekziade)
* [Gregory Mierzwinski](https://github.com/gmierz)

My main focus has been to minimize the impact from browsertime (and other tools) on the actual measurements and implementing more retry functionality if the navigation fails. With sitespeed.io we just adopted the new changes in Firefox and updated some dependencies.

## Firefox
Lets talk about the new things in Firefox.

### CPU profiles
You can collect CPU profiles from Firefox with `--firefox.geckoProfiler` and view them at [https://profiler.firefox.com](https://profiler.firefox.com)!

 You can now collect a CPU profile using `--firefox.geckoProfiler`. You can also use: `--firefox.geckoProfilerParams.features`, `--firefox.geckoProfilerParams.threads`, `--firefox.geckoProfilerParams.interval` and `--firefox.geckoProfilerParams.bufferSize` to fine tune what to get.

 ![Gecko profile]({{site.baseurl}}/img/gecko-profiler.png)
{: .img-thumbnail}

### Firefox on Android
Collect metrics using Firefox on Android! Enable using `-b firefox --android` and tune using: `--firefox.android.package`, `--firefox.android.activity`, `--firefox.android.deviceSerial` and `--firefox.android.intentArgument`.

 ![Firefox on Android]({{site.baseurl}}/img/firefox-android.jpg)
{: .img-thumbnail-center}

### Native video on Firefox
Now the window recorder for Firefox works great. That means you can record a video of the loading of your page without using FFMPEG. Add `--firefox.windowRecorder` and `-video` to your run.

### New default configuration
We have adopted the Firefox performance teams default configurations to get as stable metrics as possible with Firefox. This removes `--mozillaProPreferences` since those configurations are used by default [#1045](https://github.com/sitespeedio/browsertime/pull/1045).

## Edge
Support for running Edge for OS that supports it. Use `-b edge` and `--edge.edgedriverPath` with the path to the matching MSEdgeDriver. Edge use the same setup as Chrome, so you `--chrome.*` to configure Edge :) [#1140](https://github.com/sitespeedio/browsertime/pull/1140).

![Microsoft Edge]({{site.baseurl}}/img/msedge.jpg)
{: .img-thumbnail}

## TCPDump support
If your OS support, you can get TCPdumps (desktop only). A very special thanks to [Martino Trevisan](https://github.com/marty90) that started to add the support long time ago.

If you run sitespeed.io you can get the TCP dump and the SSL key log file by just running:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --tcpdump
~~~

If you use Browsertime you can choose where you want the key log file: `SSLKEYLOGFILE=/path/to/file browsertime --tcpdump https://www.sitespeed.io` or in Docker `docker run --rm -v "$(pwd)":/browsertime -e SSLKEYLOGFILE=/browsertime/keylog.txt sitespeedio/browsertime:{% include version/browsertime.txt %} https://www.sitespeed.io/ -n 1 --tcpdump`. Implemented in [#1159](https://github.com/sitespeedio/browsertime/pull/1159).


![TCP dump]({{site.baseurl}}/img/tcpdump.png)
{: .img-thumbnail}

## Other changes worth mentioning
Use pageLoadStrategy *none* as default [#1151](https://github.com/sitespeedio/browsertime/pull/1151).

Increase wait time before next try when navigation fails. First 10s, then 20s then 30s [#1086](https://github.com/sitespeedio/browsertime/pull/1086)

You can now choose the Activity hosting the Chrome WebView on Android using `--chrome.android.activity`. You 
can also name the process of the Activity hosting the WebView using `--chrome.android.process`.  

Make it easy to add trace categories on top of the default ones for Chrome. Use `--chrome.traceCategory` to add an category. Use it multiple times to add multiple categories [#1090](https://github.com/sitespeedio/browsertime/pull/1090).

Convert the video from Android to 60 FPS and use a monospace font on OS X [#1134](https://github.com/sitespeedio/browsertime/pull/1134) and [#1136](https://github.com/sitespeedio/browsertime/pull/1136).

Fix the bug where a frame is missed after FFMPEG transformation [#1122](https://github.com/sitespeedio/browsertime/pull/1122) - thank you [Sean Feng](https://github.com/sefeng211) for the PR

Fix for Contentful Speed Index that sometimes failed [#1121](https://github.com/sitespeedio/browsertime/pull/1121) - thank you [Tarek Ziade](https://github.com/tarekziade)!

Take screenshots before we run the JS to collect the metrics [#1071](https://github.com/sitespeedio/browsertime/pull/1071).

The Docker container now contains Firefox 72 and Chrome 80.

## Tech 
Making Sharp an optional requirement as proposed by [Nick Alexander](https://github.com/ncalexan). If you don't install Sharp, screenshots will be stored as PNG as the current viewport size [#1084](https://github.com/sitespeedio/browsertime/pull/1084). 

Move visualmetrics.py to a python package [#1148](https://github.com/sitespeedio/browsertime/pull/1148) - thank you [Tarek Ziade](https://github.com/tarekziade)!

Checkout the [Browsertime changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#800-2020-02-05) for the massive list of all things that have been fixed in latest 8.0 release.

/Peter