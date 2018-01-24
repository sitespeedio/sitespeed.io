---
layout: default
title: sitespeed.io 6.3 with WebPageTest focus
description: In the new release we focused to make the WebPageTest experience better.
 Many thanks to Jean-Pierre Vincent who contributed a lot to this release!
authorimage: /img/aboutus/peter.jpg
intro: In the new release we focused to make the WebPageTest experience better. 
 Many thanks to Jean-Pierre Vincent who contributed a lot to this release!
keywords: sitespeed.io, sitespeed, 6.3, webpagetest
nav: blog
---

# sitespeed.io 6.3
In this release we focused on doing the WebPageTest experience better, especially if you use WebPageTest standalone.

First: Many thanks to [Jean-Pierre Vincent](https://github.com/jpvincent) who contributed his default setup for which metrics to collect for WebPageTest and a new setup of default dashboards for WebPageTest.

## More default values for WebPageTest to time series databases
By default we sent a very limited number of metrics for WebPageTest (to make sure we don't overload the storage). But we probably limited it too much and [Jean-Pierre](https://github.com/jpvincent) shared his setup that we now made default. This mean you will get more metrics in Graphite/InfluxDb. You can checkout the changes in [#1871](https://github.com/sitespeedio/sitespeed.io/pull/1871).

## PageXray as a standalone plugin (and what it means to WebPageTest)
We made some internal changes to make it possible for the PageXray plugin to run on WebPageTest generated HAR files that will generate more data/metrics for you if you run WebPageTest standalone without Browsertime.

First off: Browsertime and WebPageTest plugin now sends browsertime.setup or webpagetest.setup messages when they are in the setup phase, so other plugins know that they will run [#1875](https://github.com/sitespeedio/sitespeed.io/pull/1875). This makes it possible for other plugins to act differently depending on which metric sources that are configured.

We moved PageXray to a standalone plugin (before it was bundled with the coach). This makes it easier to use PageXray on HAR files from other tools (WebPageTest at the moment) [#1877](https://github.com/sitespeedio/sitespeed.io/pull/1877).

![PageXray and WebPageTest]({{site.baseurl}}/img/6.3/pagexray-webpagetest.png)
{: .img-thumbnail-center}

PageXray is now xraying WebPageTest HAR files (if you run WebPageTest standalone). This will add the PageXray tab per URL/run + the toplist, the assets tab [#1880](https://github.com/sitespeedio/sitespeed.io/pull/1880) and you will also get the domains section using data from WebPageTest [#1876](https://github.com/sitespeedio/sitespeed.io/pull/1876)!

![Domain info for WebPageTest]({{site.baseurl}}/img/6.3/domains.png)
{: .img-thumbnail-center}

![Asset info for WebPageTest]({{site.baseurl}}/img/6.3/assets.png)
{: .img-thumbnail-center}

![Toplist info for WebPageTest]({{site.baseurl}}/img/6.3/toplist.png)
{: .img-thumbnail-center}


## New example dashbooards for WebPageTest
[Jean-Pierre Vincent](https://github.com/jpvincent) contributed with new WebPageTest dashboards. You can get them from [https://github.com/sitespeedio/grafana-bootstrap-docker](https://github.com/sitespeedio/grafana-bootstrap-docker) and checkout [#14](https://github.com/sitespeedio/grafana-bootstrap-docker/pull/14) for the full history of additions.

![Example dashboard]({{site.baseurl}}/img/6.3/dashboard.png)
{: .img-thumbnail-center}

## Video news
We have upgraded to latest video.js 6.6 with smoother progress bar [#1864](https://github.com/sitespeedio/sitespeed.io/pull/1864).

And we added filenames to the video when you combine two videos in combineVideos.sh. By naming your video wisely, you can now make it easier understand what you actually compare.

## Fixes
We upgraded to latest Browsertime 2.1.4 with [new bug fixes](https://github.com/sitespeedio/browsertime/blob/master/CHANGELOG.md).

We also fixed the start script so that you on Ubuntu can run WebPageReplay in the Docker container for your Android phone.

Checkout the full [Changelog](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md) for all changes.

/Peter
