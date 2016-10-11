---
layout: default
title: Sitespeed.io - Release notes 3.2
description: Here is 3.2 making it easier to test multiple sites and running your custom Javascript to collect metrics.
author: Peter Hedenskog
keywords: sitespeed.io, release, release-notes, 3.2
nav:
image:  https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: THere is 3.2 making it easier to test multiple sites and running your custom Javascript to collect metrics.
---

# Sitespeed.io 3.2
We've been releasing many small 3.1.x releases and now it's time for 3.2. Here are three important new things:

 * We have changed the way of fetching multiple sites. In the new version you can configure multiple sites by adding the parameter **sites** one time for each site. The main reason is that it simpler and also makes it easier to run in our Docker container. Check the full [documentation](/documentation/configuration/#analyze-sites-and-benchmark).
 * We have decreased the default size of the memory for the Java crawler. The old default (1024 mb) was good for crawling thousend of URL:s so if you are doing that today, add the parameter *--memory 1024* when you run the script. 1024 works bad on small machines so 256 is the new default.
 * We upgraded to Browsertime 0.9.0 with support for configuring a *waitScript* and run custom Javascripts in the browser. What does it mean? You can now choose [when to end a run](/documentation/browsers/#choose-when-to-end-your-test) when fetching timings from the browser (catching events happening after the loadEventEnd) and [collect custom metrics](/documentation/browsers/#custom-metrics). The custom metrics will automatically be presented in the result pages and sent to Graphite.

The new 3.2 helps us getting ready for the next cool feature, lets stay tuned the coming month :)

Interesting new stuff in the 3.1.x releases:

 * Cleanup of the perf budget handling. the script will return an error code if the budget fails and will log failing budget metrics and an HTML page showing the budget report.
 * Upgraded BrowserTime that works as it should on Windows.
 * Send domain timings to Graphite and timings per request.
 * No robot removed from the HTML pages.
 * Many small bug fixes, checkout the [complete list](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md).
