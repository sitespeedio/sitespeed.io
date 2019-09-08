---
layout: default
title: sitespeed.io 10.0
description: 
authorimage: /img/aboutus/peter.jpg
intro: Do you want to compare your performance against other web sites? Use the new performance leaderboard! 
keywords: sitespeed.io, browsertime, webperf
nav: blog
---

# sitespeed.io 10.0 - Better than ever

I'm really proud to announce that I today shipped Browsertime 6.0 and sitespeed.io 10. The 12th of October 2012 (almost seven years ago) since we shopped the first version of sitespeed.io.


## Test using AXE

## Test using Safari (OS X/iOS)

## New metrics in Chrome

* LCP 
* Element Timings for text and images
* Layout instability monitoring

## WebPageTest plugin

## Dashboards updated

## Run your tests on Kubernetes

 
## Bugfixes for the Slack plugin

* Multiple bug fixes for the Slack plugin: Show the correct connectivity, always have a red color when we have an error and fixed bug when comparing metrics (we compare with median) [#2610](https://github.com/sitespeedio/sitespeed.io/pull/2610).
* Upgraded to alpha-8 of Browsertime.
* Only using number as an alias for connectivity should be ok [#2612](https://github.com/sitespeedio/sitespeed.io/pull/2612).

### Added
* Added new metrics for slacking errors/warnings: firstPaint, visualComplete85, lastVisualChange, fullyLoaded (and fixed broken fullyLoaded) [#2611](https://github.com/sitespeedio/sitespeed.io/pull/2611). 


## 10.0.0-alpha.2 - 2019-08-29

### Changed
* To store the log to file you need to now add `--logToFile` to your run. This makes sense that you need to make an active choice to store the log file[#2606](https://github.com/sitespeedio/sitespeed.io/pull/2606).
* Using `--debug`now set the log level to verbose instead of just logging the message queue. To log the message queue use `--debugMessages` [#2607](https://github.com/sitespeedio/sitespeed.io/pull/2607).

### Added
* Show the top 20 largest assets on the PageXray tab [#2583](https://github.com/sitespeedio/sitespeed.io/pull/2583)
* Show the transfer size of assets (not only content size) in the toplists in the HTML [#2560](https://github.com/sitespeedio/sitespeed.io/pull/2560)

### Fixed
* Unified how to log the options object, so that Browsertime and sitespeed.io follow the same standard. You can now log your options/configuration with `--verbose` that is super helpful when you need to debug configuration issues [#2588](https://github.com/sitespeedio/sitespeed.io/pull/2588).
* Sending metrics to InfluxDB was broken because of a bug in how we get the connectivity name. Fixed in [#2587](https://github.com/sitespeedio/sitespeed.io/pull/2587).
* HTML fix for showing the script in the result HTML [#2597](https://github.com/sitespeedio/sitespeed.io/pull/2597).
* Running a script, testing multiple different domains, having aliases made data in Graphite sent under the wrong group/domain. Fixed in [#25###92](https://github.com/sitespeedio/sitespeed.io/pull/2592)
* Fixed annotations tag when using WebPageTest. Before the correct values was not sent. With the fix you can use the annotations on you WebPageTest dashboard [2602](https://github.com/sitespeedio/sitespeed.io/pull/2602).
* Add WebPageTest screenshot in annotation if you use WebPageTest without Browsertime [#2603](https://github.com/sitespeedio/sitespeed.io/pull/2603) and [#2605](https://github.com/sitespeedio/sitespeed.io/pull/2605)
* Link to WebPageTest HAR in the annotation if you run WebPageTest standalone [#2609](https://github.com/sitespeedio/sitespeed.io/pull/2609).

### Tech
* Updated dev dependencies and yargs, @google-cloud/storage, aws-sdk, dayjs, findup, fs-extra, influx, juni-report-builder, p-limit, pug, simplecrawler and tape.
* Updated to the 6th alpha of Browsertime 6.0.0

## 10.0.0-alpha.1 - 2019-08-19
### Added
* Upgraded to [fourth alpha of Browsertime 6.0.0](https://github.com/sitespeedio/browsertime/blob/master/CHANGELOG.md#600-alpha4---2019-08-16). Chromedriver is updated to 77 so you should probably update Chrome to use Chrome 77 beta.
  * Upgraded to Ubuntu Disco in the Docker container [#908](https://github.com/sitespeedio/browsertime/pull/908).
  * Use Chrome 77 Beta in the Docker container [#913](https://github.com/sitespeedio/browsertime/pull/913).
  * Use [TSProxy](https://github.com/WPO-Foundation/tsproxy) to throttle the connection. You should use TSProxy when you run on Kubernetes. Use it by `--connectivity.engine tsproxy`. We used to have support years ago but it never worked good on Mac/Linux so we dropped it. But it works now so we added it back [#891](https://github.com/sitespeedio/browsertime/pull/891).
  * You can now add your own metrics directly from your script (or post script) using *context.result.extras*. More info coming [#917](https://github.com/sitespeedio/browsertime/pull/917)
  And some new things coming in Chrome:
  * Using Chrome 77 (or later) you will now get a layout shift score (in percentage), see https://web.dev/layout-instability-api. [#905](https://github.com/sitespeedio/browsertime/pull/905).
  * Get LargestContentfulPaint in Chrome 77 (or later) [#906](https://github.com/sitespeedio/browsertime/pull/906).
  * Get ElementTimings in Chrome 77 (or later) [#921](https://github.com/sitespeedio/browsertime/pull/921). All elements needs to have a unique identifier for this to work correctly.
  * There's an alternative to collect Visual Metrics using the Chrome trace log, using [SpeedLine](https://github.com/paulirish/speedline) implemented in [#876](https://github.com/sitespeedio/browsertime/pull/876). Using video give more accurate metrics (at least in our testing) but maybe it could help running on Chrome on Android and add less overhead than recording a video. You can enable it with:  `--cpu --chrome.visualMetricsUsingTrace --chrome.enableTraceScreenshots`

* You can now test your pages using Axe: `--axe.enable` - The test will run after all other metrics are collected and will add some extra time to your total run test time [#2571](https://github.com/sitespeedio/sitespeed.io/pull/2571). You can see all axe information in the new tab.

* Limited support for using Safari. Documentation coming when we release the stable version. You need Catalina + iOS 13 to run Safari on your phone/tablet.

* Send FirstMeaningfulPaint by default to Graphite/Influx [#2559](https://github.com/sitespeedio/sitespeed.io/pull/2559)

* Upgraded to the first alpha of the Coach 4.0.0-alpha.1.


/Peter
