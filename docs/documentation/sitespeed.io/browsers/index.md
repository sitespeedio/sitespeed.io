---
layout: default
title: Browsers sitespeed.io
description: You can use Firefox, Chrome and Chrome on Android to collect metrics.
keywords: browsers, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: You can use Firefox, Chrome and Chrome on Android to collect metrics.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Browsers

# Browsers
{:.no_toc}

* Lets place the TOC here
{:toc}

You can fetch timings and execute your own Javascript. The following browsers are supported: Firefox, Chrome and Chrome on Android.

## Firefox
You will need Firefox 48+. We use the new [Geckodriver](https://github.com/mozilla/geckodriver) and it works only version 48 or later.

## Chrome
Chrome should work out of the box.

## Change connectivity
You can throttle the connection when you are fetching metrics using the browser. Choose between:

* 3g - 1600/768 300 RTT
* 3gfast - 1600/768 150 RTT
* 3gslow - 780/330 200 RTT
* 2g - 35/328 1300 RTT
* cable - 5000/1000 280 RTT
* native - your current connection

We use [TSProxy](https://github.com/WPO-Foundation/tsproxy) by default so you need Python 2.7 to be able tho throttle the connection.

~~~bash
$ sitespeed.io https://www.sitespeed.io -c cable
~~~

We plan to implement support for other connectivity engines in the future. You can try out our tc implementation by setting <code>--connectivity.engine tc</code>

## Choose when to end your test
By default the browser will collect data until  [window.performance.timing.loadEventEnd happens + aprox 2 seconds more](https://github.com/sitespeedio/browsertime/blob/d68261e554470f7b9df28797502f5edac3ace2e3/lib/core/seleniumRunner.js#L15). That is perfectly fine for most sites, but if you do Ajax loading and you mark them with user timings, you probably want to include them in your test. Do that by changing the script that will end the test (--browsertime.pageCompleteCheck). When the scripts returns true the browser will close or if the timeout time will be reached.

In this we wait 10 seconds until loadEventEnd happens but you can also choose to trigger it at a specific event.

~~~bash
$ sitespeed.io https://www.sitespeed.io --browsertime.pageCompleteCheck 'return (function() {try { return (Date.now() - window.performance.timing.loadEventEnd) > 10000;} catch(e) {} return true;})()'
~~~

We use Selenium in the backend to drive the browsers and right now Selenium/drivers doesn't support the *pageLoadStrategies* where you can change when Selenium will give control to the user. Right now we always wait on the pageLoadEvent, meaning pages that doesn't fire that event will fail. Track the progress to fix that [here](https://github.com/sitespeedio/browsertime/issues/186).
{: .note .note-warning}

## Custom metrics

You can collect your own metrics in the browser by supplying Javascript file(s). By default we collect all metrics inside [these folders](https://github.com/sitespeedio/browsertime/tree/master/browserscripts) but you maybe have something else you wanna collect.

Each javascript file need to return a metric/value and it will be picked up and returned in the JSON. If you return a number, statistics will automatically be generated for the value (like median/percentiles etc).

Say we have one file called scripts.js that checks how many javascript that is loaded. The script looks like this:

~~~bash
(function() {
  return document.getElementsByTagName("script").length;
})();
~~~

Then to pick up the script, run like this:

~~~bash
sitespeed.io https://www.sitespeed.io --browsertime.script scripts.js -b firefox
~~~

You will get a custom script section in the Browsertime tab.
![Custom scripts individual page]({{site.baseurl}}/img/customscripts.png)
{: .img-thumbnail}

And in the summary and detailed summary section.
![Summary page]({{site.baseurl}}/img/summary.png)
{: .img-thumbnail}

One more thing: All custom scripts values will be sent to Graphite, no extra configuration needed!

## Using Browsertime
Everything you can do in Browsertime, you can also do in sitespeed.io. Add browsertime to the CLI parameter and it will be passed on to Browsertime.

You can check what Browsertime can do [here](https://github.com/sitespeedio/browsertime/blob/master/lib/support/cli.js).

Say for example that you wanna pass on extra Chrome arguments to Chrome. In standalone Browsertime you do that with <code>--chrome.args</code>. If you wanna do that in sitespeed.io you add browsertime to the param: <code>--browsertime.chrome.args</code>. Yes we know, it is sweat :)
