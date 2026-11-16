---
layout: default
title: Alias for URLs and that Firefox bug
description: The new 4.2 release brings alias for URLs.
authorimage: /img/robot-head.png
intro: In 4.2 we have some really great news again. Alias for URLs that makes it so much better in Grafana, new video and waterfall looks and finally fixed the bug that made Firefox slowish in Docker running on OS X.

keywords: sitespeed.io, speed, index, speed, webperf, performance, web, wpo
nav: blog
---

# Friendly URLs and finally Firefox works 100% in Docker

We got some nice things in 4.2. First a long time bug finally fixed: Firefox added X seconds download time when running in Docker on OS X making the timings not so good. The problem was a combination of ipv6 setting in Firefox and Docker.

## Alias for URLs
Pushing data to Graphite and using our ready made dashboards for pages is nice but if you have long URLs the template look kind of bad in Grafana. With the latest release you can fix that by giving your URL a friendly alias. You do that by adding the alias after the URL in your text file.

~~~
https://www.sitespeed.io/ start_page
https://www.sitespeed.io/documentation docs
~~~

## New video and updated waterfall
Michael Mrowetz has updated [PerfCascade](https://github.com/micmro/PerfCascade) that we use to display waterfall graph. The latest version (with some extra fixes) shows first/last visual changes, timelines every 200 ms, number on requests and some color fixed.

The video now uses video.js making it easier to slow the video down.

## Important bug fixes
* Running multiple URLs in WebPageTest failed because of a "feature" in the WebPageTest NodeJS API where options in s are change to ms.

* Disable ipv6 for Firefox in Docker to make the tests run at normal speed on OS X.

* The entries in the HAR using Chrome for sites using HTTP/2 could sometimes be in slightly wrong order.

* The keys for assets in PageXray was broken when we sent them to Graphite, because we couldn't identify which asset we sent, instead of the URL we used the position in the array. We fixed that now, BUT: Please don't send all the assets to Graphite, it will fill your disk!

* The key summary structure for metrics for WebPageTest just worked because of luck. It is now divided in pageSummary and summary making it easier to configure and understand.

* Fixed encoding problems when storing URLs to disk #1346

## Other fixes
* The Docker container now uses Chrome 55.0
* We have a trap to catch when you wanna exit a Docker run. Now you can just exit instead of waiting for the test to finish.
* Latest coach 0.30.0 with a new advice "Avoid using incorrect mime types" thank you [@lbod](https://github.com/lbod)

/Peter, Tobias, and Jonathan
