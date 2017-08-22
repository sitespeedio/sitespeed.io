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
* Collect Navigation Timing API, User Timing API and Visual Metrics from Firefox/Chrome using [Browsertime](https://github.com/sitespeedio/browsertime).
* Run your custom-made JavaScript and collect whichever metric(s) you need.
* Test one or multiple pages, across one or many runs to get more-accurate metrics.
* Create HTML-result pages or store the metrics in Graphite.
* Write your own plugins that can do whatever tests you want/need.

See all the latest changes in the [Changelog](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md).

## Examples of what you can do

Checkout our example [dashboard.sitespeed.io](https://dashboard.sitespeed.io/dashboard/db/page-summary)

A summary report in HTML:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/html-summary.png">

Individual page report:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/page.png">

Collected metrics from a URL in Graphite/Grafana:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/grafana-page-summary.png">

Video - easiest using Docker. This gif is optimized, the quality is much better IRL:

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docs/img/barack.gif">

## Lets try it out

Using Docker (requires 1.10+):

```bash
$ docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --video --speedIndex https://www.sitespeed.io/
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

## I want to help!
We have a [special page](HELP.md) for you!

[travis-image]: https://img.shields.io/travis/sitespeedio/sitespeed.io.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/sitespeed.io
[stars-url]: https://github.com/sitespeedio/sitespeed.io/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/sitespeed.io.svg?style=flat-square
[downloads-image]: https://img.shields.io/npm/dt/sitespeed.io.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/sitespeed.io
[docker-image]: https://img.shields.io/docker/pulls/sitespeedio/sitespeed.io.svg
[docker-url]: https://hub.docker.com/r/sitespeedio/sitespeed.io/
[changelog-image]: https://img.shields.io/badge/changelog-%23212-lightgrey.svg?style=flat-square
[changelog-url]: https://changelog.com/212
