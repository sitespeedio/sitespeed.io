---
layout: default
title: sitespeed.io 7.0
description: The next generation of performance testing in your browser is here!
authorimage: /img/aboutus/peter.jpg
intro: A couple of weeks ago we released [Browsertime 3.0](/browsertime-3.0/) completely rewritten and now we are ready to push sitespeed.io 7.0 using the latest version of Browsertime.
keywords: sitespeed.io, sitespeed, 7.0, browsertime
nav: blog
---

# sitespeed.io 7.0
A couple of weeks ago we released [Browsertime 3.0](/browsertime-3.0/) completely rewritten and now we are ready to push sitespeed.io 7.0 using the latest version of Browsertime.


- [New in 7.0](#new-in-70)
    - [Most important things first: Breaking changes](#most-important-things-first-breaking-changes)
    - [Browsertime 3](#browsertime-3)
    - [New Chrome and latest Firefox 61](#new-chrome-and-latest-firefox-61)
    - [WebPageReplay support using Docker](#webpagereplay-support-using-docker)
    - [A lot of love for WebPageTest](#a-lot-of-love-for-webpagetest)
    - [Statsd support](#statsd-support)
    - [New S3 plugin](#new-s3-plugin)
    - [Console messages from Chrome](#console-messages-from-chrome)
    - [Use the same parameters Browsertime/sitespeed.io](#use-the-same-parameters-browsertimesitespeedio)
    - [CPU data from Chrome](#cpu-data-from-chrome)
    - [Fixes](#fixes)
    - [Breaking changes for plugin makers](#breaking-changes-for-plugin-makers)
- [What's next](#whats-next)

## New in 7.0
Let me walk you through what's new. The most important thing is the new version of Browsertime.

### Most important things first: Breaking changes
As a Docker user of sitespeed.io there shouldn't be any breaking changes upgrading from latest 6 version. <strike>If you are using a preScript to login the user, you need to wait/verify that the page has actually loaded before you try to manipulate the page, since Browsertime 3.0 change pageLoadStrategy from *normal* to *none* meaning you will be in control direct after the navigation.</strike> - The page load strategy change was reverted in 7.0.2.

If you don't use our Docker container (you should!) you need to use Firefox 61 (beta) to get the HAR from Firefox, since the new [HAR Export trigger](https://github.com/devtools-html/har-export-trigger) needs that version (the Docker container already contains 61).

One important thing: The upgrade to Firefox 61 in the Docker container and that we made Browsertime so much leaner and cleaner will probably make your timing metrics decrease when you switch to 7.0.

If you use custom made plugins that uses screenshots or the trace log from Chrome you should read [this](#breaking-changes-for-plugin-makers) since the behavior how those are handled have changed.



### Browsertime 3
In the new version we store metrics and data to disk between runs. That means screenshots/ tracelogs and other metrics are stored to disk immediately. This makes Browsertime use less memory when you do many runs. See [#308](https://github.com/sitespeedio/browsertime/issues/308) for a use case where that helps.

The CPU usage has also decreased, mainly since we switched to the new version of Firefox. Here's an example of when we deployed an early version of 3.0 on AWS.

![CPU usage]({{site.baseurl}}/img/bt-3.0/cpu-usage.png)
{: .img-thumbnail-center}

<p class="image-info">
 <em class="small center">The red arrow shows when we installed the first alpha version of Browsertime</em>
</p>

The decreased memory and CPU usage makes your metrics more stable.


Read more about the all changes in [Browsertime 3.0](/browsertime-3.0/).

### New Chrome and latest Firefox 61
The Docker container uses the latest release of Chrome stable and a beta release of Firefox 61. We use Firefox 61 so that the new [HAR Export trigger](https://github.com/devtools-html/har-export-trigger) works.

### WebPageReplay support using Docker
We had it in alpha/beta for a while and now it's there in our default container: [WebPageReplay](https://github.com/catapult-project/catapult/blob/main/web_page_replay_go/README.md).

WebPageReplay is proxy that first records your web site and then replay it locally. That can help you find performance regression in the front-end code easier: Latency/server timings are constant.

You can run like this:
<code>
docker run --cap-add=NET_ADMIN --shm-size=1g --rm -v "$(pwd):/sitespeed.io" -e REPLAY=true -e LATENCY=100 sitespeedio/sitespeed.io https://en.wikipedia.org/wiki/Barack_Obama
</code>

Here are a couple of examples from our real world tests. We test on Digital Ocean Optimized Droplets 4 gb memory with 2 vCPUs. We test both with connectivity set to cable (to try to minimize the impact of flaky internet) and one tests using WebPageReplay. We tests with the same amount of runs on the same machine.

Here's an example from one of the sites we test. Here we test with connectivity set to cable.
![Connectivity example 1]({{site.baseurl}}/img/bt-3.0/connectivity-example-1.png)
{: .img-thumbnail}

<p class="image-info">
 <em class="small center">The variation is normally whopping 500 ms and max is over 1400 ms.</em>
</p>

The same site using WebPageReplay, the same amount of runs:

![Replay example 1]({{site.baseurl}}/img/bt-3.0/replay-example-1.png)
{: .img-thumbnail}

<p class="image-info">
 <em class="small center">The difference is now less than 100 ms. </em>
</p>

Here's another site, setting connectivity:

![Connectivity example 2]({{site.baseurl}}/img/bt-3.0/connectivity-example-2.png)
{: .img-thumbnail}

<p class="image-info">
 <em class="small center">The First Visual Change variation is 150 ms</em>
</p>

And then with WebPageReplay:

![Replay example 2]({{site.baseurl}}/img/bt-3.0/replay-example-2.png)
{: .img-thumbnail}

<p class="image-info">
 <em class="small center">Using WebPageReplay the variation is 67 ms.</em>
</p>

Using WebPageReplay we get more stable metrics. This is super useful if you want to make sure you find front end performance regressions. However testing **without** a proxy is good since you will then get the same variations as your user will get.


### A lot of love for WebPageTest
We fixed a couple of bugs using WebPageTest and added some extras.

We now display Chrome timing metrics per run [#2046](https://github.com/sitespeedio/sitespeed.io/pull/2046), show the WebPageTests id and tester name in the HTML [#2047](https://github.com/sitespeedio/sitespeed.io/pull/2047), use WebPageTest screenshot if you don't run Browsertime [#2048](https://github.com/sitespeedio/sitespeed.io/pull/2048), show some Lighthouse summary metrics you use Lighthouse [#2049](https://github.com/sitespeedio/sitespeed.io/pull/2049) and show some of those interactive metrics if they exists [#2050](https://github.com/sitespeedio/sitespeed.io/pull/2050). We also link directly to each individual run if you use WebPageTest [#2045](https://github.com/sitespeedio/sitespeed.io/pull/2045).

Small changes but it makes the WebPageTest HTML report page more usable.

### Statsd support 
[Omri](https://github.com/omrilotan) made a PR ([#1994](https://github.com/sitespeedio/sitespeed.io/pull/1994)) that adds StatsD support (with bulking)! Thank you [Omri](https://github.com/omrilotan) for the nice PR!

### New S3 plugin
We upgraded/rewrote the S3 plugin that fixes (all) the problems we have seen with large files failing to upload [#2013](https://github.com/sitespeedio/sitespeed.io/pull/2013). Since we upgraded on our test servers we haven't seen any S3 problems at all.

### Console messages from Chrome
In the new version of Browsertime you can collect console messages from Chrome. Add <code>--chrome.collectConsoleLog</code> to your run and you can see that extra info on the PageXray tab for each individual run. We also send the number of errors to Graphite/InfluxDB by default, making it easy to create alerts on console errors.

### Use the same parameters Browsertime/sitespeed.io
We tried to make CLI parameters the same as with Browsertime, so that you can use the same for both tools (meaning most of the parameters you don't need to prepend with *browsertime*. Check <code>sitespeed.io --help</code>

### CPU data from Chrome
We have a new project called [Chrome trace](https://github.com/sitespeedio/chrome-trace) built by [Tobias](https://github.com/tobli) that parses the Chrome trace log and check the time spent. Use it by add <code>--chrome.timeline</code> to your run. For a brief period we did use the [Trace parser](https://github.com/WPO-Foundation/trace-parser) project but moving to our own will open up for us to add more metrics and do bug fixes faster.

If you turn it on, the metrics will automatically be sent to Graphite. Just update your dashboards so you can see it!

### Fixes

* InfluxDB event annotations overwrite within test session. Thanks [Michael J. Mitchell](https://github.com/mitchtech) for the PR [#1966](https://github.com/sitespeedio/sitespeed.io/issues/1966).

* Sanitize path segments when creating folder (taking care of bad characters when creating new folders) - Thank you [Ryan Siddle](https://github.com/rsiddle) for the PR! [#1961](https://github.com/sitespeedio/sitespeed.io/pull/1961).

* If you are a InfluxDB user, your tags now will hold more info (not only category tags). Thank you [Icecold777](https://github.com/Icecold777) for the PR [#2031](https://github.com/sitespeedio/sitespeed.io/pull/2031).

* You can now change safe char for groups/domain in InfluxDB with ```--influxdb.groupSeparator```. Thank you [amic87](https://github.com/amic81) for your PR!

* To collect the Chrome timeline you should now use ```--browsertime.chrome.timeline``` instead of the old deprecated ```--browsertime.chrome.collectTracingEvents```

* To collect Visual Metrics add ```--visualMetrics``` (instead of the old ```--speedIndex```)

* You can now choose for what kind of content you want to include the response bodies when you use Firefox: ```--browsertime.firefox.includeResponseBodies``` with the value *none*, *all*, *html*. 

* We finetuned the tabs in the result pages and followed Browsertime and make all output files 1 based instead of 0. The first run will now have files named with 1. Yep as it should :)

## Breaking changes for plugin makers
For plugin makers or plugin users that uses screenshots or Chrome trace logs there are a couple of changes:

* The screenshot is not passed as messages anymore to decrease the memory impact. If you need them, you need to get them from disk instead of the queue.
* The Chrome trace log is not passed as messages anymore to decrease the memory impact by default. Add ```--postChromeTrace``` to pass around the Chrome trace to other plugins.

## What's next
The coming weeks/month we going to take care of bugs, concentrate on making a better guide to deploy sitespeed.io and then it's time for summer vacation :)

Checkout the full [Changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) for all changes.

/Peter