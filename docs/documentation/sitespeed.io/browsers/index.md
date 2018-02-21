---
layout: default
title: Use Firefox, Chrome or Chrome on Android to collect metrics.
description: You can use Firefox, Chrome and Chrome on Android to collect metrics. You need make sure you have a set connectivity when you test, and you do that with Docker networks or throttle.
keywords: browsers, documentation, web performance, sitespeed.io, Firefox, Chrome
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: You can use Firefox, Chrome and Chrome on Android to collect metrics.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Browsers

# Browsers
{:.no_toc}

* Lets place the TOC here
{:toc}

You can fetch timings and execute your own JavaScript. The following browsers are supported: Firefox, Chrome and Chrome on Android. If you run our Docker containers, we always update them when we tested the latest stable release of the browsers.

## Firefox
You will need Firefox 54. In Firefox 55 the HAR export trigger was broken, and people at Mozilla say it will be a working version again sometimes Q4. You can run Firefox 57 (or later) but then you need to add *--browsertime.skipHar* to make it work (but you will miss a HAR until Mozilla release a new way to get the HAR).

## Chrome
The latest version of Chrome should work out of the box.

## Choose when to end your test
By default the browser will collect data until  [window.performance.timing.loadEventEnd happens + aprox 2 seconds more](https://github.com/sitespeedio/browsertime/blob/d68261e554470f7b9df28797502f5edac3ace2e3/lib/core/seleniumRunner.js#L15). That is perfectly fine for most sites, but if you do Ajax loading and you mark them with user timings, you probably want to include them in your test. Do that by changing the script that will end the test (--browsertime.pageCompleteCheck). When the scripts returns true the browser will close or if the timeout time is reached.

In this example we wait 10 seconds until the loadEventEnd happens, but you can also choose to trigger it at a specific event.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --browsertime.pageCompleteCheck 'return (function() {try { return (Date.now() - window.performance.timing.loadEventEnd) > 10000;} catch(e) {} return true;})()'
~~~

We use Selenium in the backend to drive the browsers and right now Selenium/drivers doesn't support the *pageLoadStrategies* where you can change when Selenium will give control to the user. Right now we always wait on the pageLoadEvent, meaning pages that do not fire that event will fail. Track the progress to fix that [here](https://github.com/sitespeedio/browsertime/issues/186).
{: .note .note-warning}

## Custom metrics

You can collect your own metrics in the browser by supplying Javascript file(s). By default we collect all metrics inside [these folders](https://github.com/sitespeedio/browsertime/tree/master/browserscripts), but you might have something else you want to collect.

Each javascript file need to return a metric/value which will be picked up and returned in the JSON. If you return a number, statistics will automatically be generated for the value (like median/percentiles etc).

For example say we have one file called scripts.js that checks how many scripts tags exist on a page. The script would look like this:

~~~
(function() {
  return document.getElementsByTagName("script").length;
})();
~~~

Then to pick up the script, you would run it like this:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --browsertime.script scripts.js -b firefox
~~~

You will get a custom script section in the Browsertime tab.
![Custom scripts individual page]({{site.baseurl}}/img/customscripts.png)
{: .img-thumbnail}

And in the summary and detailed summary section.
![Summary page]({{site.baseurl}}/img/summary.png)
{: .img-thumbnail}

Bonus: All custom scripts values will be sent to Graphite, no extra configuration needed!

## Visual Metrics

Visual metrics (Speed Index, Perceptual Speed Index, First and Last Visual Complete, and 85-95-99% Visual Complete) can be collected if you also record a video of the screen. If you use our Docker container you automagically get all what you need. Video and Visual Metrics is turned on by default.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/
~~~

On Android you need to follow [these instructions]({{site.baseurl}}/documentation/sitespeed.io/mobile-phones/#video-and-speedindex).

## Using Browsertime
Everything you can do in Browsertime, you can also do in sitespeed.io. Prefixing *browsertime* to a CLI parameter will pass that parameter on to Browsertime.

You can [check what Browsertime can do]({{site.baseurl}}/documentation/browsertime/configuration/).

For example if you want to pass on an extra native arguments to Chrome. In standalone Browsertime you do that with <code>--chrome.args</code>. If you want to do that through sitespeed.io you just prefix browsertime to the param: <code>--browsertime.chrome.args</code>. Yes we know, pretty sweet! :)

## How can I disable HTTP/2 (I only want to test HTTP/1.x)?
In Chrome, you just add the switches <code>--browsertime.chrome.args disable-http2</code>.

For Firefox, you need to turn off HTTP/2 and SPDY, and you do that by setting the Firefox preferences:
<code>--browsertime.firefox.preference network.http.spdy.enabled:false --browsertime.firefox.preference network.http.spdy.enabled.http2:false --browsertime.firefox.preference network.http.spdy.enabled.v3-1:false</code>

## Collect trace logs
Today only Chrome supports getting the trace log (like the devtools.timeline) but there are work in Firefox to make the same availible through the WebDriver. You can turn that on in Chrome with <code>--browsertime.chrome.collectTracingEvent</code> and choose which categories by <code>--browsertime.chrome.traceCategories</code>.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}  --browsertime.chrome.collectTracingEvent --browsertime.chrome.traceCategories='-*,disabled-by-default-devtools.timeline' https://www.sitespeed.io/
~~~
