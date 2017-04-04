---
layout: startpage
title: Sitespeed.io - Welcome to the wonderful world of Web Performance
description: Sitespeed.io is an open source tool that helps you analyze and optimize your website speed and performance, based on performance best practices. Run it locally or use it in your continuous integration. Download or fork it on Github!
keywords: sitespeed.io, wpo, webperf, perfmatters, fast, site, speed, web performance optimization, analyze, best practices, continous integration
nav: start
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
---
<img src="{{site.baseurl}}/img/sitespeed.io-logo-large2.png" class="pull-left img-big" alt="Sitespeed.io logo" width="188" height="200" onLoad="window.performance.mark('logoTime');">

## Welcome to the wonderful world of Web Performance

Sitespeed.io is a set of Open Source tools that helps make your web pages faster. [The coach]({{site.baseurl}}/documentation/coach/) gives you performance advice based on best practices for your site. [Browsertime]({{site.baseurl}}/documentation/browsertime/) collects metrics and HAR files from your browser. [PageXray]({{site.baseurl}}/documentation/pagexray/) converts a HAR file to a usable JSON structure that tells you more about your page. [Chome-HAR](https://github.com/sitespeedio/chrome-har) creates a HAR file Chrome Debugging Protocol data. And finally [sitespeed.io]({{site.baseurl}}/documentation/sitespeed.io/) is the main tool that uses all the previously mentioned tools and add supports for testing multiple pages as well as adds the ability to report the metrics to a TSDB (currently Graphite and soon also InfluxDB).

Try out sitespeed.io by installing using [npm](https://www.npmjs.org/)/[yarn](https://yarnpkg.com/)/[Docker](https://hub.docker.com/r/sitespeedio/sitespeed.io/) ([need help?]({{site.baseurl}}documentation/sitespeed.io/installation/)):

**Docker**

~~~ bash
$ docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/
~~~

**npm**

~~~ bash
$ npm install -g sitespeed.io
$ sitespeed.io -h
~~~
