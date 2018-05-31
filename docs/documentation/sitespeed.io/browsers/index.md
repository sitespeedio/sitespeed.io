---
layout: default
title: Use Firefox, Chrome or Chrome on Android to collect metrics.
description: You can use Firefox, Chrome and Chrome on Android to collect metrics. You need make sure you have a set connectivity when you test, and you do that with Docker networks or throttle.
keywords: browsers, documentation, sitespeed.io, Firefox, Chrome
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

You can fetch timings, run your own JavaScript and record a video of the screen. The following browsers are supported: Firefox, Chrome and Chrome on Android. If you run our Docker containers, we always update them when we tested the latest stable release of the browsers (at the moment we run a beta of Firefox :)).

## Firefox
You will need Firefox 61 or later (current beta). In Firefox 55 the HAR export trigger was broken, and there's [a new version](https://github.com/devtools-html/har-export-trigger) that works in Firefox 61. You can use older Firefoxes but you will then miss out on the HAR file.

### Firefox profile setup
At the moment we setup a new profile for each run the browser do. We set up the profiles preferences like [this](https://github.com/sitespeedio/browsertime/blob/master/lib/firefox/webdriver/firefoxPreferences.js). We use Mozillas [own configuration](https://searchfox.org/mozilla-central/source/testing/talos/talos/config.py) as default with some changes + some extra configuration for performance and privacy. 

We try to disable all Firefox ping home: 
 * We disables [heartbeat](https://wiki.mozilla.org/Firefox/Shield/Heartbeat).
 * We disables the call to detectportal.firefox.com.
 * We turn off [telemetry](https://wiki.mozilla.org/Telemetry/Testing).
 * We turn on the call home for [safebrowsing](https://support.mozilla.org/en-US/kb/how-stop-firefox-making-automatic-connections).

For performance and deterministic reasons we disable the [Tracking protection](https://wiki.mozilla.org/Security/Tracking_protection). The problem with the current implementation of the Tracking protection is that it calls home (during a page load) to download the latest blacklist for scripts that should be disabled.

You can also [configure your own preferences](#set-your-own-firefox-preferences) for the profile.

Starting with a total blank profile isn't supported at the moment but if you need it, please [create an issue](https://github.com/sitespeedio/browsertime/issues/new) and let us know!  

### Collecting the HAR
To collect the HAR from Firefox we use [HAR Export trigger](https://github.com/devtools-html/har-export-trigger). It needs Firefox 61 to work (if you run a earlier version you will automatically not get the HAR). The trigger is in OMHO a superior version of getting the HAR than parsing the MOZ HTTP log since it adds less overhead to metrics. 

If you for some reason don't need the HAR you can disable it by ```--browsertime.skipHar```.

#### What to include in the HAR
If you use Firefox you can choose to include response bodies in the HAR file. The HAR file will be larger but it can make things easier to debug on your site.

You can choose what do include by 
```--firefox.includeResponseBodies``` and choose between  **none** (default) , **all** (all response bodies for the type text/JS/CSS or **html** (only save the body of the HTML response).

### Choosing Firefox version

Running Firefox on Mac OS X you can easilty what version to run with sitespeed.io:

```--firefox``` will use stable,  ```--firefox.nightly```, ```--firefox.beta``` or ```--firefox.developer``` will choose between the others. Remember that you need to install them first before you use them :) 

If you run on Linux you need to set the full path to the binary:
```--firefox.binaryPath``` 

The current default Docker container only contains one version of Firefox. If you want to test on more versions, [let us know](https://github.com/sitespeedio/browsertime/issues/new) so we can fix that.


### Set your own Firefox preferences
Firefox preferences are all the preferences that you can set on your Firefox instance using **about:config**. Since we start with a fresh profile (except some [defaults](#firefox-profile-setup)) of Firefox for each page load, we are not reusing the setup you have in your Firefox instance.

You set a preference by adding  ```--firefox.preference``` with the format **key:value**. If you want to add multiple preferences, repeat ```--firefox.preference``` once per argument.


### Collect the MOZ HTTP log
You can turn on [Firefox HTTP log](https://developer.mozilla.org/en-US/docs/Mozilla/Debugging/HTTP_logging) by adding ```--firefox.collectMozLog``` to your run. That can be useful if you want to file upstream issues to Mozilla.

It is setup with ```timestamp,nsHttp:5,cache2:5,nsSocketTransport:5,nsHostResolver:5``` and will create one HTTP log file per run.

### Accept insecure certificates
If you want to accept insecure certificates add ```--firefox.acceptInsecureCerts``` to your run. 

### Collect trace logs
We have no way to get trace data from Firefox today (by trace data we mean time spent in JavaScript/paint etc). You can follow the [upstream request](https://bugzilla.mozilla.org/show_bug.cgi?id=1250290) to make that happen.

## Chrome
The latest version of Chrome should work out of the box.

### Chrome setup
When we start Chrome it is setup with [these](https://github.com/sitespeedio/browsertime/blob/master/lib/chrome/webdriver/chromeOptions.js) command line switches.

### Add your own Chrome args
Chrome has a [long list](https://peter.sh/experiments/chromium-command-line-switches/) of command line switches that you can use to make Chrome act differently than the default setup. You can add those switched to Chrome with ```--chrome.args``` (repeat the argument if you have multiple arguments). 

When you add your command line switched you should skip the minus. For example: You want to use ```--deterministic-fetch``` then add it like ```--chrome.args deterministic-fetch```.

### Collect trace logs
 You can get the trace log from Chrome by adding ```--chrome.timeline```. Doing that you will see how much time the CPU spend in different categories and a trace log file that you can drag and drop into your devtools timeline.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --chrome.timeline https://www.sitespeed.io/
~~~

You can also choose which Chrome trace categories you want to collect by adding ```--chrome.traceCategories```  to your parameters.

### Collect the console log
If you use Chrome you can collect everything that is logged to the console. You will see the result in the PageXray tab for each run and if you have errors, the numbers are errors are sent to Graphite/InfluxDB. Collect the console log by adding ```--chrome.collectConsoleLog```.

### Collect the net log
Collect Chromes net log with ```--chrome.collectNetLog```. This is useful if you want to debug exact what happens with Chrome and your web page. You will get one log file per run.

### Choosing Chrome version
You can choose which version of Chrome you want to run by using the ```--chrome.binaryPath``` and the full path to the Chrome binary.

Our Docker container only contains one version of Chrome and [let us know](https://github.com/sitespeedio/sitespeed.io/issues/new) if you need help to add more versions.

## Choose when to end your test
By default the browser will collect data until  [window.performance.timing.loadEventEnd happens + aprox 2 seconds more](https://github.com/sitespeedio/browsertime/blob/d68261e554470f7b9df28797502f5edac3ace2e3/lib/core/seleniumRunner.js#L15). That is perfectly fine for most sites, but if you do Ajax loading and you mark them with user timings, you probably want to include them in your test. Do that by changing the script that will end the test (--browsertime.pageCompleteCheck). When the scripts returns true the browser will close or if the timeout time is reached.

In this example we wait 10 seconds until the loadEventEnd happens, but you can also choose to trigger it at a specific event.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --browsertime.pageCompleteCheck 'return (function() {try { return (Date.now() - window.performance.timing.loadEventEnd) > 10000;} catch(e) {} return true;})()'
~~~

Yoy can also choose to end the test after 5 seconds of inactivity that happens after loadEventEnd. Do that by adding 
```--browsertime.pageCompleteCheckInactivity``` to your run. The test will then wait for loadEventEnd to happen and no requests in the Resource Timing API the last 5 seconds. Be-aware though that the script will empty the resource timing API data for every check so if you have your own script collecting data using the Resource Timing API it will fail. 

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
