---
layout: default
title: Browsertime
description:
keywords: tools, documentation, web performance
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---
# Browsertime

<img src="{{site.baseurl}}/img/logos/browsertime.png" class="pull-right img-big" alt="Browsertime logo" width="200" height="175">

Access the Web Performance Timeline, from your browser, in your terminal!

Browsertime allows you to:

  * Query timing data directly from the browser, to access [Navigation Timing](http://kaaes.github.io/timing/info.html), [User Timing](http://www.html5rocks.com/en/tutorials/webperformance/usertiming/),
[Resource Timing](http://www.w3.org/TR/resource-timing/), first paint and [RUM Speed Index](https://github.com/WPO-Foundation/RUM-SpeedIndex).
  * Generate [HAR](http://www.softwareishard.com/blog/har-12-spec/) files
  * Run custom Javascript scripts in the browser and get statistics for each run.

## A simple example

~~~
$ bin/browsertime.js https://www.sitespeed.io
~~~

Load https://www.sitespeed.io in Chrome three times. Results are stored in a json file (browsertime.json) with the timing data, and a har file (browsertime.har) in browsertime-results/www.sitespeed.io/$date/

## I want more examples
Checkout the [examples](https://github.com/sitespeedio/browsertime/tree/master/docs/examples).

## Browsers
Browsertime supports Firefox and Chrome on desktop. On Android we support Chrome. Yep that's it for now.

But we want to support Opera (on Android) https://github.com/sitespeedio/browsertime/issues/150 and when Safari 10 is availible, we will add it too. And when(?!) it iOS Safari supports WebDriver we will add that too.

## How does it work
Browsertime uses Selenium NodeJS to drive the browser. It starts the browser, load a URL, executes configurable Javacsripts to collect metrics, collect a HAR file.

To get the HAR from Firefox we use the [HAR Export Trigger](https://github.com/firebug/har-export-trigger) and Chrome we parse the timeline log and generates the HAR file.

Oh and you can run your own Selenium script before (<code>--preScript</code>) and after (<code>--postScript</code>) a URL is accessed so you can login/logout or do whatever you want.


## The rewrite to 1.0
The master is to a large degree a re-write of the internal implementation, the cli interface, and the node API. It's
based on learnings from the previous releases of Browsertime, and their use in Sitespeed.io. It's still lacking some features
from the 0.x releases, and the API is not final. However it should be a better foundation for future development, using
more modern Javascript features and a much more extensive test suite.

With 1.0 we dropped BrowsermobProxy so you don't need Java :smile: to run anymore and each run will be 1000% faster. Also we now support HTTP/2 and pre and post selenium scripts, if you want to do things before the URL is tested.

If you would would like to get started there are a few examples that can be found in the [docs folder](https://github.com/sitespeedio/browsertime/tree/master/docs/examples). If you run into any issues getting started using Browsertime visit our [issues page](https://github.com/sitespeedio/browsertime/issues) for some common issues/solutions. If you still cannot resolve the problem and feel the issue is within browsertime feel free to open an issue.
