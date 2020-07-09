---
layout: default
title: Sitespeed.io 8.6
description: Last seven days we pushed a lot of small fixes and features. 
authorimage: /img/aboutus/peter.jpg
intro: Last seven days we pushed a lot of small fixes and features!
keywords: sitespeed.io, browsertime, webperf
nav: blog
---

# Sitespeed.io 8.6

You should look at the full [changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md), the last 7 days we released a couple of releases with bug fixes and some new (smallish) features.

## Features

* Support Lighthouse, WebPageTest and GPSI in the new budget format. See [https://www.sitespeed.io/documentation/sitespeed.io/performance-budget/#full-example](https://www.sitespeed.io/documentation/sitespeed.io/performance-budget/#full-example).

* Send console warnings by default to Graphite/InfluxDB per page (we used to only send errors by default) [#2315](https://github.com/sitespeedio/sitespeed.io/pull/2315).

* Support for crawler exclude pattern, use ```--crawler.exclude```. Thank you [Ferdinand Holzer](https://github.com/fholzer) for the PR [#2319](https://github.com/sitespeedio/sitespeed.io/pull/2319).

* Give your test a name with ```--name``` [#2302](https://github.com/sitespeedio/sitespeed.io/pull/2302). At the moment only used in the HTML.

* Use alias from the script when displaying URLs in the HTML, reported by [banuady](https://github.com/banuady) in [#2296](https://github.com/sitespeedio/sitespeed.io/issues/2296) and fixed in [#2297](https://github.com/sitespeedio/sitespeed.io/pull/2297).

* You can include the script your using in the HTML output with ```--html.showScript``` [#2298](https://github.com/sitespeedio/sitespeed.io/pull/2298). Be careful though with passwords or other secrets.

* Added json as output type for the budget. Set ```--budget.output json ``` and it will store *budgetResult.json* in your result directory [#2299](https://github.com/sitespeedio/sitespeed.io/pull/2299).

* Added endpoint to s3 configurations to allow for pushing HTML reports to Digital Ocean's Spaces as it is S3 compatible. [#2072](https://github.com/sitespeedio/sitespeed.io/issues/2072) 

* We upgraded a couple of Browsertime versions, now running 4.4.4 with some new features:
  * There are two new cache clear commands: cache.clearKeepCookies() and cache.clear() (only working on Desktop) [#769](https://github.com/sitespeedio/browsertime/pull/769).

  * New addText.bySelector(text, selector) command + fixed so click.byJs and click.byJsAndWait works on elements that is hidden.

## Bug fixes

* Show larger screenshots in filmstrip for mobile, fixing colliding metrics HTML and last screenshot showing twice [#2314](https://github.com/sitespeedio/sitespeed.io/pull/2314).

* Fix wrong count for errors/warnings for console log send to Graphite/InfluxDB. Before we sent 1 instead of the actual number of logs per page [#2316](https://github.com/sitespeedio/sitespeed.io/pull/2316).

* Fix coach table colouring. Thank you [Ferdinand Holzer](https://github.com/fholzer) for the PR [#2317](https://github.com/sitespeedio/sitespeed.io/pull/2317)!
* Removed [faulty guard](https://github.com/sitespeedio/sitespeed.io/commit/df3313540671406e570dbea30b909b8f0f22e75f) in budget  that made sure only internal metrics worked for Lighthouse/GPSI/WebPageTest.

* The produced budget JUnit file had an error reported [here](https://github.com/sitespeedio/sitespeed.io/issues/2307#issuecomment-463147211) and fixed in [#2311](https://github.com/sitespeedio/sitespeed.io/pull/2311)

* Added extra guard when chrome.timeline data is missing, so that the HTML will not break issue [#2310](https://github.com/sitespeedio/sitespeed.io/issues/2310) and [fixed](https://github.com/sitespeedio/sitespeed.io/commit/427d28f7119327cdbc06bc51700d2b8488e472f8). 

* Catch errors when creating the filmstrip, so that not the full test fails.

* Analysisstorer gives error when using script as reported in [#2305](https://github.com/sitespeedio/sitespeed.io/issues/2305)    and fixed in [#2306](https://github.com/sitespeedio/sitespeed.io/pull/2306).

*  New Browsertime version with fixes:
   * The timer in the video correctly match what happens on the screen (or rather what Visual Metrics measure).

   * If a Visual Element wasn't found, we used to log that as an error, instead log as info [#775](https://github.com/sitespeedio/browsertime/pull/775).

   * When trying to find the last visual change, a 0.01 % difference in pixels are now OK. We had problems finding too small difference that was picked up by Visual Metrics [#774](https://github.com/sitespeedio/browsertime/pull/774).

   * Command set value by id was broken, it used to set the value to the id [#761](https://github.com/sitespeedio/browsertime/pull/761).

   * I've missed that for some URLs (as in this [login](https://github.com/sitespeedio/sitespeed.io/issues/2290#issuecomment-461601990) you could have an alias for an URL but the URL was actually slightly different. For example, you login to a site and the login step redirect to a URL and for that URL one value of a GET parameter differs. So with this fix we lock the alias tyo one specific URL. If your URL change and you use an alias, the first variation of the URL will be used [#763](https://github.com/sitespeedio/browsertime/pull/763).
   
   * Updated RUM Speed Index to include upstream fix [#766](https://github.com/sitespeedio/browsertime/pull/766).

   * Make sure the body of the page is shown when setting the fullscreen to orange (when recording the video) [#767](https://github.com/sitespeedio/browsertime/pull/767).

   * Testing redirect URLs was broken since 8.0. If you test a URL, use that URL and if you click on a link, use the URL from the browser [#768](https://github.com/sitespeedio/browsertime/pull/768). If you where testing a URL that redirected and did't give it an alias, your key in Graphite/InfluxDB will change (back to as it was pre 8.0).

/Peter