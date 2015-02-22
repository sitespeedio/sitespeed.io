# sitespeed.io

[![Build status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]
[![Stars][stars-image]][stars-url]

[Website](http://www.sitespeed.io) | [Documentation](http://www.sitespeed.io/documentation/) | [Help us](https://github.com/sitespeedio/sitespeed.io/blob/master/HELP.md) | [Twitter](https://twitter.com/SiteSpeedio)

Welcome to the wonderful world of web performance!

sitespeed.io can:
* analyze your site against web performance best practice rules, crawl your site or test specific URL:s
* measure how fast your site/pages is using the [Navigation Timing API](http://www.w3.org/TR/navigation-timing/) and [User Timing API](http://www.w3.org/TR/user-timing/)
* send all your metrics to [Graphite](http://graphite.wikidot.com)
* benchmark your site against your competitors (comparing specific pages, creating reports, dump the data to Graphite)
* drive [WebPageTest](http://www.webpagetest.org) (WPT), meaning collect metrics from WPT, create reports and or
send the data to Graphite
* test your site against your performance budget
* output TAP or JUnit XML to run in your Continuous Integration tool
* create configurable HTML reports
* test your site against [Google Page Speed Insights](https://developers.google.com/speed/pagespeed/insights/) and include the result in the reports
* create your own post task that will get the result from the analyze and do whatever you want with it (store to a database, create new reports etc)

Check the [changelog](CHANGELOG.md) for the latest changes.

Install
=============
```bash
$ npm install -g sitespeed.io
```

Help us!
=============
Do you want to make sitespeed.io even better? Check out the [help us](HELP.md) page.

Example reports
=============
Summary:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/doc/3.0-summary2.png">
Pages summary:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/doc/3.0-pages.png">
Metrics in Graphite:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/doc/3.0-grafana-timing-metrics.png">

[travis-image]: https://img.shields.io/travis/sitespeedio/sitespeed.io.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/sitespeed.io
[stars-url]: https://github.com/sitespeedio/sitespeed.io/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/sitespeed.io.svg?style=flat-square
[downloads-image]: http://img.shields.io/npm/dm/sitespeed.io.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/sitespeed.io
