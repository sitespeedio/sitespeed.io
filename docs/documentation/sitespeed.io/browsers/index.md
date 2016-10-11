---
layout: default
title: Browsers - Documentation - sitespeed.io
description: How to get browser timings using sitespeed.io for Firefox and Chrome.
keywords: browsers, documentation, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Browser timings for sitespeed.io.
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
By default the browser will collect data until  [window.performance.timing.loadEventEnd happens + aprox 2 seconds more](https://github.com/sitespeedio/browsertime/blob/d68261e554470f7b9df28797502f5edac3ace2e3/lib/core/seleniumRunner.js#L15). That is perfectly fine for most sites, but if you do Ajax loading and you mark them with user timings, you probably want to include them in your test. Do that by changing the script that will end the test (–waitScript). When the scripts returns true the browser will close or if the timeout time (default 60 seconds) will be reached.

In this we wait 10 seconds until loadEventEnd happens but you can also choose to trigger it at a specific event.

~~~bash
$ sitespeed.io https://www.sitespeed.io --browsertime.pageCompleteCheck 'return (function() {try { return (Date.now() - window.performance.timing.loadEventEnd) > 10000;} catch(e) {} return true;})()'
~~~

## Custom metrics

You can collect your own metrics in the browser by supplying Javascript file(s). Each file need to return a metric/value and it will be picked up and returned in the JSON. If you return a number, statistics will automatically be generated for the value (like median/percentiles etc).

Say we have a folder called scripts and in there we have one file called scripts.js that checks how many javascript that is loaded. The script looks like this:

~~~bash
return document.getElementsByTagName("script").length;
~~~

Then to pick up the script, run like this:

~~~bash
sitespeed.io https://www.sitespeed.io --browsertime.script scripts.js -b firefox
~~~

## More browser goodness
Everything you can do in Browsertime, you can also do in sitespeed.io. Add browsertime to the CLI parameter and it will be passed on to Browsertime.

You can check what Browsertime can do [here](https://github.com/sitespeedio/browsertime/blob/master/lib/support/cli.js).

Say for example that you wanna pass on extra Chrome arguments to Chrome. In standalone Browsertime you do that with <i>--chrome.args</i>. If you wanna do that in sitespeed.io you add browsertime to the param: <i>--browsertime.chrome.args</i>. Yes we know, it is sweat :)
