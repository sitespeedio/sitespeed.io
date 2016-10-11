---
layout: default
title: Browsers - Documentation - sitespeed.io
description: How to get browser timings using sitespeed.io for Firefox, Chrome, Safari and Internet Explorer.
keywords: browsers, documentation, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Browser timings for the sitespeed.io.
---
[Documentation 3.x](/documentation/) / Browsers

# Browsers
{:.no_toc}

* Lets place the TOC here
{:toc}

You can fetch timings and execute your own Javascript. The following browsers are supported:
Firefox, Chrome, Internet Explorer and Safari.

## Firefox
Firefox will work out of the box, as long as you have Firefox installed on your machine.

## Chrome
You need to install Chrome and the [Chromedriver](https://sites.google.com/a/chromium.org/chromedriver/) to be able to collect metrics from Chrome.

## Internet Explorer
Windows only. To get Internet Explorer to work, follow the [instructions](https://code.google.com/p/selenium/wiki/InternetExplorerDriver#Required_Configuration).

## Safari
You need Safari 8 to get timings from your browser (Mac only). To get it to work, you need to install the [SafariDriver extension - SafariDriver.safariextz](http://selenium-release.storage.googleapis.com/index.html?path=2.45/) in your browser. With the current version no HAR-file is created.

# Fetching timings
You can fetch timings ([Navigation Timing](http://www.w3.org/TR/navigation-timing/) and [User Timings](http://www.w3.org/TR/user-timing/)) using using the **-b** flag. We use [Browsertime](https://github.com/tobli/browsertime) to collect the data.

~~~ bash
$ sitespeed.io -u http://yoursite.com  -b firefox
~~~

What we do is run a couple of [Javascripts](https://github.com/tobli/browsertime/tree/master/lib/scripts) that collects metrics from the browser. The browser stops collecting metrics when the *window.performance.timing.loadEventEnd* happens (but you can configure that yourself).

## Simulate the connection speed
You can throttle the connection when you are fetching metrics using the browser. Choose between:

* **mobile3g** - 1.6 Mbps/768 Kbps - 300 RTT
* **mobile3gfast** - 1.6 Mbps/768 Kbps - 150 RTT
* **cable** - 5 Mbps/1 Mbps - 28 RTT
* **native** - the current connection

And run it like this:

~~~ bash
$ sitespeed.io -u http://yoursite.com -b chrome --connection mobile3g
~~~

## Choose when to end your test
By default the browser will collect data until the *window.performance.timing.loadEventEnd* happens + aprox 2 seconds more. That is perfectly fine for most sites, but if you do ajax loading and you mark them with user timings, you probably want to include them in your test. Do that by changing the script that will end the test (*--waitScript*). When the scripts returns true the browser will close or if the timeout time (default 60 seconds) will be reached:

~~~ bash
sitespeed.io -u https://www.sitespeed.io -b chrome --waitScript 'return window.performance.timing.loadEventEnd>0'
~~~


## Custom metrics
You can collect your own metrics in the browser by supplying a directory with Javascript files. Each file need to return a metric/value and it will be picked up and returned in the JSON. If you return a number, statistics will automatically be generated for the value (like median/percentiles etc). Check out the [scripts](https://github.com/tobli/browsertime/tree/master/scripts) we use.

Say we have a folder called *scripts* and in there we have one file called *scripts.js* that checks how many javascript that is loaded. The script looks like this:

~~~
return document.getElementsByTagName("script").length;
~~~

Then to pick up the script, run like this:

~~~ bash
sitespeed.io -u https://www.sitespeed.io --customScripts scripts -b firefox
~~~

The basename of the file *script* will be used as the metric name. If the script return a number, the value will be sent to Graphite and will be summarized on the summary page. Other values will be shown on the specific result page.

# Collected timing metrics
All the metrics are collected using an empty cache.

* *backEndTime* - The time it takes for the network and the server to generate and start sending the HTML. Definition: responseStart - navigationStart
* *domContentLoadedTime* - The time the browser takes to parse the document and execute deferred and parser-inserted scripts including the network time from the users location to your server. Definition: domContentLoadedEventStart - navigationStart
* *domInteractiveTime* - The time the browser takes to parse the document, including the network time from the users location to your server. Definition: domInteractive - navigationStart
* *domainLookupTime* - The time it takes to do the DNS lookup. Definition: domainLookupEnd - domainLookupStart
* *frontEndTime* - The time it takes for the browser to parse and create the page. Definition: loadEventStart - responseEnd
* *pageDownloadTime* - How long time does it take to download the page (the HTML). Definition: responseEnd - responseStart
* *pageLoadTime* - The time it takes for page to load, from initiation of the page view (e.g., click on a page link) to load completion in the browser. Important: this is only relevant to some pages, depending on how you page is built. Definition: loadEventStart - navigationStart
* *redirectionTime* - Time spent on redirects. Definition: fetchStart - navigationStart
* *serverConnectionTime* - How long time it takes to connect to the server. Definition: connectEnd - connectStart
* *firstPaint* - This is when the first paint happens on the screen. If the browser support this metric, we use that. Else we use the time of the last non-async script or css from the head. You can easily verify if the first paint metrics is valid for you, by record a video using WebPageTest, and then check exactly when the first paint happens and compare that with the timing from the browser.
* [RUM-SpeedIndex](https://github.com/WPO-Foundation/RUM-SpeedIndex) - created by Pat Meenan
and calculate SpeedIndex measurements using Resource Timings. It iss not as perfect as Speed Index in WPT but a good start.
