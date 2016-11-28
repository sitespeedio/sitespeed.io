# sitespeed.io

[![Build status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]
[![Docker][docker-image]][docker-url]
[![Stars][stars-image]][stars-url]
[![Changelog #212][changelog-image]][changelog-url]


[Website](https://www.sitespeed.io/) | [Documentation](https://www.sitespeed.io/documentation/) | [Twitter](https://twitter.com/SiteSpeedio)

## Welcome to the wonderful world of web performance!

Using sitespeed.io you can:
* Test your web site against Web Performance best practices using the [Coach](https://github.com/sitespeedio/coach).
* Collect timing metrics like Navigation Timing API and User Timing API from Firefox/Chrome using [Browsertime](https://github.com/sitespeedio/browsertime).
* Run your custom-made JavaScript and collect whichever metric(s) you need.
* Test one or multiple pages, across one or many runs to get more-accurate metrics.
* Create HTML-result pages or store the metrics in Graphite.
* Write your own plugins that can do whatever tests you want/need.

And a lot of more things. But what does it look like?

A summary report in HTML:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/html-summary.png">

Individual page report:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/page.png">

Collected metrics from a URL in Graphite/Grafana:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/pagesummary-grafana.png">

## 4.0
Version 4.0 is a ground-up rewrite for node.js 6.9.1 and newer. It builds on all our experience since shipping 3.0 in December 2014,
the first version to use node.js.

Using Docker:

```bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io
```

Or install using npm:

```bash
$ npm i -g sitespeed.io
```

Or clone the repo and test the latest changes:

```bash
$ git clone https://github.com/sitespeedio/sitespeed.io.git
$ cd sitespeed.io
$ npm install
$ bin/sitespeed.js --help
$ bin/sitespeed.js http://www.sitespeed.io
```

## Running Sitespeed 4.0 with Docker + Proxy + Custom Login Script + Create Custom Folder (date/time stamped)
Here is an example that finally worked for me with lot of tweaks that runs using the Sitespeed 4.0 docker, behind corporate proxy, saving the HTML summary reports in customer folder marked with date/timestamp and avoiding the HAR trigger error by using the --browsertime.pageCompleteCheck option with custom javascript.

Below is a cron job definition that runs ever 45th minute of an hour

```bash
45 * * * * docker run --privileged -v /app/sitespeed.io:/sitespeed.io sitespeedio/sitespeed.io <url|text file with list of urls> --preScript prescript.js -n 1 -b firefox  --graphite.host <graphiteip-host> --graphite.namespace <graphite-namespace>  --browsertime.proxy.http=proxy.xxxx.xxxxxxxx.com:80 --browsertime.proxy.https=proxy.xxxx.xxxxxxxx.com:80 --outputFolder sitespeed-result/<customfoldername>/$(date +\%Y-\%m-\%d-\%H-\%M-\%S) --browsertime.pageCompleteCheck 'return (function() {try { return (Date.now() - window.performance.timing.loadEventEnd) > 10000;} catch(e) {} return true;})()'
```

## Why 4.0?
There's a lot of things that we wanted to improve since 3.0. Here's some of the most important changes:

* We support HTTP/2! In 3.X we used PhantomJS and a modified version of YSlow to analyze best practice rules. We also had BrowserMobProxy in front of our browsers that made it impossible to collect metrics using H2. We now use [the coach](https://github.com/sitespeedio/coach) and Firefox/Chrome without a proxy. That makes it easier for us to adapt to browser changes and changes in best practices.

* We now support the feature that people asked about the most: Measure a page as a logged in user. Use --browsertime.preScript to run a selenium task to before the page is analyzed. Documentation is coming soon.

* New HAR files rock! In the old version we use BrowserMobProxy as a proxy in front of the browser to collect the HAR. In the new version we collect the HAR directly from the browser. For Firefox we use the [HAR export trigger](https://github.com/firebug/har-export-trigger) and in Chrome we generates it from the performance log.

* Stability: We have a new completely rewritten version of [Browsertime](https://github.com/tobli/browsertime) that makes it easier for us to catch errors from the browser, drivers and environment problems.  

* Speed: Yep we dropped Java (it was needed for BrowserMobProxy) and most things are happening in parallel with the new version.

* Don't overload Graphite: One thing that was annoying with 3.x was that it by default sent a massive amount of metrics to Graphite. That's cool in a way but it was too much. We now send curated metrics by default and you can choose to send more.

* You can collect metrics from Chrome on an Android phone. In the current version you need to have it connected using USB to the server running sitespeed.io, lets see how we can make it better in the future.

* Using our Docker container you will get support getting SpeedIndex and startRender using [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics). This is highly experimental at this stage.

There are new things that will come also that isn't 100% implemented yet and you can help us.
* InfluxDB support. We have started with a POC but need to implement it properly, see [889](https://github.com/sitespeedio/sitespeed.io/issues/889).

## I want to help!
We have a [special page](HELP.md) for you!

[travis-image]: https://img.shields.io/travis/sitespeedio/sitespeed.io.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/sitespeed.io
[stars-url]: https://github.com/sitespeedio/sitespeed.io/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/sitespeed.io.svg?style=flat-square
[downloads-image]: http://img.shields.io/npm/dm/sitespeed.io.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/sitespeed.io
[docker-image]: https://img.shields.io/docker/pulls/sitespeedio/sitespeed.io.svg
[docker-url]: https://hub.docker.com/r/sitespeedio/sitespeed.io/
[changelog-image]: https://img.shields.io/badge/changelog-%23212-lightgrey.svg?style=flat-square
[changelog-url]: https://changelog.com/212
