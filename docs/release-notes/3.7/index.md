---
layout: default
title: Sitespeed.io - Release notes 3.7
description: More data and metrics to Graphite please!
author: Peter Hedenskog
keywords: sitespeed.io, release, release-notes, 3.7
nav:
image:  https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: More data and metrics to Graphite please!
---

# Sitespeed.io 3.7
Well here is 3.7, released from Mexico City :) There has already been a couple of patch releases fixing some new and old bugs.

We will now follow the [keep a changelog](http://keepachangelog.com/) standard.

### Added

* We now use total amount for each collected metric. What does it mean? If we test ten pages, we will now send the summary of all metrics for these pages to Graphite. Meaning you can easily keep track of page size for all tested pages over time (yep, you can do it with a summary also but we also use this in the HTML output). Maybe this isn't super cool right now but in the future when we have implemented a user journey, it will be simple to keep track of all metrics for that journey.

* Send all individual navigation timings to Graphite (before we only sent calculated timings). This is cool because it makes it easier for us to find performance problems in different layers over time. The keys will have *navigationtiming* in the name  [#580](https://github.com/sitespeedio/sitespeed.io/issues/508)

* Send sitespeed and browser version to Graphite. The keys in Graphite: [namespace].meta.chrome.version, [namespace].meta.firefox.version and [namespace].meta.sitespeed.version Why you ask? It is good when you step back in time to track things to know which version you where using at that time. [#703](https://github.com/sitespeedio/sitespeed.io/issues/703)

### Changed
* We have upgraded many of the dependencies to latest versions: async, cross-spawn-async, fast-stats, fs-extra, handlebars, html-minifier, moment, phantomjs, request, winston, browsertime & xmlbuilder.

* One optimization is that if you choose to test only one page, we don't actually start the crawler (yep we did before). This is good for [https://run.sitespeed.io](https://run.sitespeed.io) because it makes running a test for one URL faster. [#706](https://github.com/sitespeedio/sitespeed.io/issues/706)

### Fixed
* Text fixes, thanks [Ori](@https://github.com/atdt). [#690](https://github.com/sitespeedio/sitespeed.io/issues/690)

* New Browsertime version fixes Browser name and browser version in the HAR file. Before the HAR file has the browser name and version from the supplied User Agent. [#704](https://github.com/sitespeedio/sitespeed.io/issues/704)

* New Browsertime also fixes a HAR defect when you tested a page multiple times (and you should do that), that made the HAR incorrect (showing too many requests). Thanks you [@joychester](https://github.com/joychester) for reporting!
