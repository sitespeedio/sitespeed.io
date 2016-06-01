# sitespeed.io

[![Build status][travis-image-4]][travis-url]
[![Downloads][downloads-image]][downloads-url]
[![Docker][docker-image]][docker-url]
[![Stars][stars-image]][stars-url]


[Website](https://www.sitespeed.io) | [Documentation](https://www.sitespeed.io/documentation/) | [Twitter](https://twitter.com/SiteSpeedio)

## Welcome to the wonderful world of web performance!

*This branch tracks the development of the upcoming version 4.0 of sitespeed.io.
The current production version is developed in the [3.x](https://github.com/sitespeedio/sitespeed.io/tree/3.x).*

Version 4.0 is a ground up rewrite for node.js 4.3 and newer. It builds on all our experience since shipping 3.0 in December 2014,
the first version to use node.js. It's currently under active development, you can check the release schedule [here](https://github.com/sitespeedio/sitespeed.io/milestones).  We're determined to make it the best version of sitespeed.io to date.

Documentation and tests for the upcoming version aren't in place yet. Rest assured, it will be before 4.0 is released.
If you would like to give the new version a spin, try the following (you'll need node.js and Firefox/Chrome installed):

```bash
> git clone https://github.com/sitespeedio/sitespeed.io.git
> cd sitespeed.io
> npm install
> bin/sitespeed.js --help
> bin/sitespeed.js http://www.sitespeed.io
```

## Why 4.0?
There's a lot of things that we want to improve since 3.0. Here's some of the most important changes:

* We support HTTP/2! In 3.X we used PhantomJS and a modified version of YSlow to analyze best practice rules. We also had BrowserMobProxy in front of our browsers that made it impossible to collect metrics using H2. We now use [the coach](https://github.com/sitespeedio/coach) and Firefox/Chrome without a proxy. That makes it easier for us to adapt to browser changes and changes in best practices.

* We now support the feature that people asked about the most: Measure a page as a logged in user. Use --browsertime.preTask to run a selenium task to before the page is analyzed. Documentation is coming soon.

* New HAR files rock! In the old version we use BrowserMobProxy as a proxy in front of the browser to collect the HAR. In the new version we collect the HAR directly from the browser. For Firefox we use the [HAR export trigger](https://github.com/firebug/har-export-trigger) and in Chrome we generates it from the performance log.

* Stability: We have a new completely rewritten version of [Browsertime](https://github.com/tobli/browsertime) that makes it easier for us to catch errors from the browser, drivers and environment problems.  

* Speed: Yep we dropped Java (it was needed for BrowserMobProxy) and most things are happening in parallel with the new version.

* Don't overload Graphite: One thing that was annoying with 3.x was that it by default sent a massive amount of metrics to Graphite. That's cool in a way but it was too much. We now send curated metrics by default and you can choose to send more.

* You can collect metrics from Chrome on an Android phone. In the current version you need to have it connected using USB to the server running sitespeed.io, lets see how we can make it better in the future.

* Using our Docker container you will get support getting SpeedIndex and startRender using [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics). This is highly experimental at this stage.

There are new things that will come also that isn't 100% implemented yet and you can help us.
* We want to use [PerfCascade](https://github.com/micmro/PerfCascade) to view the HAR files. Help us with [876]( https://github.com/sitespeedio/sitespeed.io/issues/876)
* InfluxDB support. We have started with a POC but need to implement it properly, see [889](https://github.com/sitespeedio/sitespeed.io/issues/889).
* We need to have a good way to throttle the connection, checkout [895](https://github.com/sitespeedio/sitespeed.io/issues/895).

## I want to help!
We have a [special page](HELP.md) for you!

[travis-image-4]: https://img.shields.io/travis/sitespeedio/sitespeed.io/4.0.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/sitespeed.io/branches
[stars-url]: https://github.com/sitespeedio/sitespeed.io/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/sitespeed.io.svg?style=flat-square
[downloads-image]: http://img.shields.io/npm/dm/sitespeed.io.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/sitespeed.io
[docker-image]: https://img.shields.io/docker/pulls/sitespeedio/sitespeed.io.svg
[docker-url]: https://hub.docker.com/r/sitespeedio/sitespeed.io/
