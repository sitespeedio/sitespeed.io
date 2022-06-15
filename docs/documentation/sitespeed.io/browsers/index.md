---
layout: default
title: Use Firefox, Chrome, Edge, Safari or Chrome/Firefox on Android to collect metrics.
description: You can use Firefox, Chrome, Ende, Safari and Chrome/Firefox on Android to collect metrics. You need make sure you have a set connectivity when you test, and you do that with Docker networks or throttle.
keywords: browsers, documentation, sitespeed.io, Firefox, Chrome, Safari
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: You can use Firefox, Safari, Chrome, Edge and Chrome/Firefox on Android to collect metrics.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Browsers

# Browsers
{:.no_toc}

* Lets place the TOC here
{:toc}

You can fetch timings, run your own JavaScript and record a video of the screen. The following browsers are supported: Firefox, Safari, Edge, Chrome, Chrome and Firefox on Android and Safari on iOS. If you run our Docker containers, we always update them when we tested the latest stable release of Chrome and Firefox. Safari and Safari on iOS needs Mac OS X Catalina. Edge need the corresponding MSEdgeDriver.

## Firefox
The latest version of Firefox should work out of the box.

### Firefox profile setup
At the moment we setup a new profile for each run the browser do. We set up the profiles preferences like [this](https://github.com/sitespeedio/browsertime/blob/main/lib/firefox/webdriver/firefoxPreferences.js). We use Mozillas [own configuration](https://searchfox.org/mozilla-central/source/testing/talos/talos/config.py) as default with some changes + some extra configuration for performance and privacy.

We try to disable all Firefox ping home:
 * We disable [heartbeat](https://wiki.mozilla.org/Firefox/Shield/Heartbeat).
 * We disable the call to detectportal.firefox.com.
 * We turn off [telemetry](https://wiki.mozilla.org/Telemetry/Testing).
 * We turn on the call home for [safebrowsing](https://support.mozilla.org/en-US/kb/how-stop-firefox-making-automatic-connections).

For performance and deterministic reasons we disable the [Tracking protection](https://wiki.mozilla.org/Security/Tracking_protection). The problem with the current implementation of the Tracking protection is that it calls home (during a page load) to download the latest blacklist for scripts that should be disabled.

You can also [configure your own preferences](#set-your-own-firefox-preferences) for the profile.


You can setup your own profile with `--firefox.profileTemplate` with a profile template directory that will be cloned and used as the base of each profile each instance of Firefox is launched against.

### Collecting the HAR
To collect the HAR from Firefox we use [HAR Export trigger](https://github.com/devtools-html/har-export-trigger).

If you for some reason don't need the HAR you can disable it by ```--browsertime.skipHar```.

#### What to include in the HAR
If you use Firefox you can choose to include response bodies in the HAR file. The HAR file will be larger but it can make things easier to debug on your site.

You can choose what do include by
```--firefox.includeResponseBodies``` and choose between  **none** (default) , **all** (all response bodies for the type text/JS/CSS or **html** (only save the body of the HTML response).

### Choosing Firefox version

Running Firefox on Mac OS X you can choose what version to run with sitespeed.io:

```--firefox``` will use stable,  ```--firefox.nightly```, ```--firefox.beta``` or ```--firefox.developer``` will choose between the others. Remember that you need to install them first before you use them :)

If you run on Linux you need to set the full path to the binary:
```--firefox.binaryPath```

### Set your own Firefox preferences
Firefox preferences are all the preferences that you can set on your Firefox instance using **about:config**. Since we start with a fresh profile (except some [defaults](#firefox-profile-setup)) of Firefox for each page load, we are not reusing the setup you have in your Firefox instance.

You set a preference by adding  ```--firefox.preference``` with the format **key:value**. If you want to add multiple preferences, repeat ```--firefox.preference``` once per argument.


### Collect the MOZ HTTP log
You can turn on [Firefox HTTP log](https://developer.mozilla.org/en-US/docs/Mozilla/Debugging/HTTP_logging) by adding ```--firefox.collectMozLog``` to your run. That can be useful if you want to file upstream issues to Mozilla.

It is setup with ```timestamp,nsHttp:5,cache2:5,nsSocketTransport:5,nsHostResolver:5``` and will create one HTTP log file per run.

### Accept insecure certificates
If you want to accept insecure certificates add ```--firefox.acceptInsecureCerts``` to your run.

### Collect CPU profile 
You can collect all the good stuff from Firefox using the new Geckoprofiler. Enable it with ```--firefox.geckoProfiler``` and view the profile on [https://profiler.firefox.com](https://profiler.firefox.com). You can configure what to profile with ```--firefox.geckoProfilerParams.features``` and ```--firefox.geckoProfilerParams.threads```. 

### Record video
Firefox has a built in way to record a video of the screen. That way you don't need to use FFMPEG. Enable it with:

```--firefox.windowRecorder --video``` 

### Run Firefox on Android
You can run Firefox on Android. If you use stable Firefox on your phone you can add ```-b firefox --android``` and it will be used.


### Add extra command line arguments to Firefox
If you need to pass on extra command line arguments to the Firefox binary you can do that with ```--firefox.args ```. 

### More memory
When you run Firefox in Docker you should use `--shm-size 2g` to make sure Firefox get enough shared memory (for Chrome we disabled the use of shm with --disable-dev-shm-usage).

~~~bash
docker run --shm-size 2g --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io -b firefox
~~~

## Chrome
The latest version of Chrome should work out of the box. Latest version of stable [ChromeDriver](http://chromedriver.chromium.org) is bundled in sitespeed.io.

### Chrome setup
When we start Chrome it is setup with [these](https://github.com/sitespeedio/browsertime/blob/main/lib/chrome/webdriver/chromeOptions.js) command line switches.

### Add your own Chrome args
Chrome has a [long list](https://peter.sh/experiments/chromium-command-line-switches/) of command line switches that you can use to make Chrome act differently than the default setup. You can add those switched to Chrome with ```--chrome.args``` (repeat the argument if you have multiple arguments).

When you add your command line switched you should skip the minus. For example: You want to use ```--deterministic-fetch``` then add it like ```--chrome.args deterministic-fetch```.

If you want to use it in the configuration file, you can just add each arg in array. Here's an example for adding Chrome args from sitespeed.io:

~~~json
{
    "browsertime": {
        "chrome": {
            "args" : [
                "crash-test",
                "deterministic-fetch"
            ]
        }
    }
}
~~~

### Collect trace logs
 You can get the trace log from Chrome by adding ```--chrome.timeline```. Doing that you will see how much time the CPU spend in different categories and a trace log file that you can drag and drop into your devtools timeline.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --chrome.timeline https://www.sitespeed.io/
~~~

You can also choose which Chrome trace categories you want to collect by adding ```--chrome.traceCategories```  to your parameters.

### Collect the console log
If you use Chrome you can collect everything that is logged to the console. You will see the result in the PageXray tab for each run and if you have errors, the numbers are errors are sent to Graphite/InfluxDB. Collect the console log by adding ```--chrome.collectConsoleLog```.

### Collect the net log
Collect Chromes net log with ```--chrome.collectNetLog```. This is useful if you want to debug exact what happens with Chrome and your web page. You will get one log file per run.

### Render blocking information
If you use Chrome/Chromium you can get render blocking information (which requests blocks rendering). To get that from sitespeed.io  you need to get the Chrome timeline (and we get that by default). But if you wanna make sure to configure it you turn it on with the flag ```--chrome.timeline ``` or  ```--cpu```.

You can see the blocking information in the waterfall. Requests that blocks has different coloring.
![Blocking information in the waterfall]({{site.baseurl}}/img/potentially-blocking.jpg){:loading="lazy"}
{: .img-thumbnail}

You can also click on the request and see the exact blocking info from Chrome.
![See more blocking info in the waterfall]({{site.baseurl}}/img/see-more-blocking.jpg){:loading="lazy"}
{: .img-thumbnail}

You can also see a summary on the Page Xray tab and see what kind of blocking information Chrome provides.
![Page Xray information about render blocking]({{site.baseurl}}/img/page-xray-blocking.jpg){:loading="lazy"}
{: .img-thumbnail}

### Choosing Chrome version
You can choose which version of Chrome you want to run by using the ```--chrome.binaryPath``` and the full path to the Chrome binary.

Our Docker container only contains one version of Chrome and [let us know](https://github.com/sitespeedio/sitespeed.io/issues/new) if you need help to add more versions.

### Use a newer version of ChromeDriver
ChromeDriver is the driver that handles the communication with Chrome. By default sitespeed.io and Browsertime comes with the ChromeDriver version that matches the Chrome version in the Docker container. If you want to run tests on other Chromedriver versions, you need to download that version of ChromeDriver.

You download ChromeDriver from [http://chromedriver.chromium.org](http://chromedriver.chromium.org) and then use ```--chrome.chromedriverPath``` to set the path to the new version of the ChromeDriver.

## Safari

You can run Safari on Mac OS X. To run on iOS you need Catalina and iOS 13. To see more what you can do with the SafariDriver you can run `man safaridriver` in your terminal.

### Limitations
We do not support HAR, cookies/request headers in Safari at the moment.

### Configuration
There are a couple of different specific Safari configurations.

#### Run on iOS
To run on iOS you need to add:

~~~bash
sitespeed.io --safari.ios -b safari
~~~

#### Choose which device
There are a couple of different ways to choose which device to use:

* `--safari.deviceName` set the device name. Device names for connected devices are shown in iTunes.
* `--safari.deviceUDID` set the device UDID. If Xcode is installed, UDIDs for connected devices are available via the output of instruments(1) and in the Device and Simulators window accessed in Xcode via "Window > Devices and Simulators")
* `--safari.deviceType` set the device type. If the value of *safari:deviceType* is `iPhone`, SafariDriver will only create a session using an iPhone device or iPhone simulator. If the value of *safari:deviceType* is `iPad`, SafariDriver will only create a session using an iPad device or iPad simulator.
* `--safari.useSimulator` if the value of useSimulator is true, SafariDriver will only use iOS Simulator hosts. If the value of safari:useSimulator is false, SafariDriver will not use iOS Simulator hosts. NOTE: An Xcode installation is required in order to run WebDriver tests on iOS

#### Use Safari Technology Preview
If you have Safari Technology Preview installed you can use it to run your test. Add `--safari.useTechnologyPreview` to your test.

### Diagnose problems
If you need to file a bug with SafariDriver, you also want to include diagnostics generated by SafariDriver. You do that by adding `--safari.diagnose` to your run.

~~~bash
sitespeed.io --safari.ios -b safari --safari.diagnose https://www.sitespeed.io
~~~

The log file will be stored in **~/Library/Logs/com.apple.WebDriver/**.

## Edge
You can use Chromium based MS Edge on the OS that supports it. At the moment this is experimental and we cannot guarantee that it works 100%.

~~~bash
sitespeed.io -b edge https://www.sitespeed.io
~~~

Edge use the exact same setup as Chrome (except the driver), so you use `--chrome.*` to configure Edge :) 

## Brave
You can use [Brave browser](https://brave.com) by setting Brave as Chrome binary. Download Brave and run like this on OS X (make sure to adjust the path to the path to your Brave binary):

~~~bash
sitespeed.io --chrome.binaryPath "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" https://www.sitespeed.io
~~~

## Choose when to end your test
By default the browser will collect data until  [window.performance.timing.loadEventEnd happens + 2 seconds more](https://github.com/sitespeedio/browsertime/blob/d68261e554470f7b9df28797502f5edac3ace2e3/lib/core/seleniumRunner.js#L15). That is perfectly fine for most sites, but if you do Ajax loading and you mark them with user timings, you probably want to include them in your test. Do that by changing the script that will end the test (```--browsertime.pageCompleteCheck```). When the scripts returns true the browser will close or if the timeout time is reached.

In this example we wait 10 seconds until the loadEventEnd happens, but you can also choose to trigger it at a specific event.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --browsertime.pageCompleteCheck 'return (function() {try { return (Date.now() - window.performance.timing.loadEventEnd) > 10000;} catch(e) {} return true;})()'
~~~

If loadEventEnd never happens for the page, the test will wait for `--maxLoadTime` until the test stops. By default that time is two minutes (yes that is long).

You can also configure how long time your current check will wait until completing with ```--pageCompleteWaitTime```. By default the pageCompleteCheck waits for 5000 ms after the onLoad event to happen. If you want to increase that to 10 seconds use ```--pageCompleteWaitTime 10000```. This is also useful if you test with *pageCompleteCheckInactivity* and it takes long time for the server to respond, you can use the *pageCompleteWaitTime* to wait longer than the default value.

![Navigation timeline]({{site.baseurl}}/img/navigation-timeline.jpg)
{: .img-thumbnail}

You can also choose to end the test after 5 seconds of inactivity that happens after loadEventEnd. Do that by adding
```--browsertime.pageCompleteCheckInactivity``` to your run. The test will then wait for loadEventEnd to happen and no requests in the Resource Timing API the last 5 seconds. Be-aware though that the script will empty the resource timing API data for every check so if you have your own script collecting data using the Resource Timing API it will fail.

There's is also another alternative: use ```--spa``` to automatically wait for 5 seconds of inactivity in the Resource Timing API (independently if the load event end has fired or not). If you need to wait longer, use ```--pageCompleteWaitTime```.

If you add your own complete check you can also choose when your check is run. By default we wait until onLoad happens (by using pageLoadStrategy normal). If you want control direct after the navigation, you can get that by adding ```--pageLoadStrategy none``` to your run.

## Custom metrics

You can collect your own metrics in the browser by supplying JavaScript file(s). By default we collect all metrics inside [these folders](https://github.com/sitespeedio/browsertime/tree/main/browserscripts), but you might have something else you want to collect.

Each JavaScript file need to return a metric/value which will be picked up and returned in the JSON. If you return a number, statistics will automatically be generated for the value (like median/percentiles etc).

For example say we have one file called scripts.js that checks how many scripts tags exist on a page. The script would look like this:

~~~javascript
(function() {
  return document.getElementsByTagName("script").length;
})();
~~~

Then to pick up the script, you would run it like this:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --browsertime.script scripts.js -b firefox
~~~

You will get a custom script section in the Browsertime tab.
![Custom scripts individual page]({{site.baseurl}}/img/customscripts.png){:loading="lazy"}
{: .img-thumbnail}

And in the summary and detailed summary section.
![Summary page]({{site.baseurl}}/img/summary.png){:loading="lazy"}
{: .img-thumbnail}

Bonus: All custom scripts values will be sent to Graphite, no extra configuration needed!

## Visual Metrics

Visual metrics (Speed Index, Perceptual Speed Index, First and Last Visual Complete, and 85-95-99% Visual Complete) can be collected if you also record a video of the screen. If you use our Docker container you automagically get all what you need. Video and Visual Metrics is turned on by default.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/
~~~

On Android you need to follow [these instructions]({{site.baseurl}}/documentation/sitespeed.io/mobile-phones/#video-and-speedindex).


## Using Browsertime
Everything you can do in Browsertime, you can also do in sitespeed.io. Prefixing *browsertime* to a CLI parameter will pass that parameter on to Browsertime.

You can [check what Browsertime can do]({{site.baseurl}}/documentation/browsertime/configuration/).

For example if you want to pass on an extra native arguments to Chrome. In standalone Browsertime you do that with <code>--chrome.args</code>. If you want to do that through sitespeed.io you just prefix browsertime to the param: <code>--browsertime.chrome.args</code>. Yes we know, pretty sweet! :)

## TCPDump
You can generate a TCP dump with `--tcpdump`.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --tcpdump
~~~

You can then download the TCP dump for each iteration and the SSL key log file from the result page.

Packets will be written when the buffer is flushed. If you want to force packets to be written to the file when they arrive you can do that with `--tcpdumpPacketBuffered`.

## WebDriver
We use the WebDriver to drive the browser. We use [Chromedriver](https://chromedriver.chromium.org) for Chrome, [Geckodriver](https://github.com/mozilla/geckodriver/releases) for Firefox, [Edgedriver](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/) for Edge and [Safaridriver](https://developer.apple.com/documentation/webkit/testing_with_webdriver_in_safari) for Safari.

When you install sitespeed.io/Browsertime we also install the latest released driver for Chrome, Edge and Firefox. Safari comes bundled with Safari driver. For Chrome the Chromedriver version needs to match the Chrome version. That can be annoying if you want to test on old browsers, coming developer versions or on Android where that version hasn't been released yet.

You can download the ChromeDriver yourself from the [Google repo](https://chromedriver.storage.googleapis.com/index.html) and use ```--chrome.chromedriverPath``` to help Browsertime find it or you can choose which version to install when you install sitespeed.io with a environment variable: ```CHROMEDRIVER_VERSION=81.0.4044.20 npm install ```

You can also choose versions for Edge and Firefox with `EDGEDRIVER_VERSION` and `GECKODRIVER_VERSION`.

If you don't want to install the drivers you can skip them with `CHROMEDRIVER_SKIP_DOWNLOAD=true`, `GECKODRIVER_SKIP_DOWNLOAD=true` and `EDGEDRIVER_SKIP_DOWNLOAD=true`.

## Navigation and how we run the test

By default a navigation to a new page happens when Selenium (WebDriver) runs a JavaScript that sets `window.location` to the new URL. You can also choose to use WebDriver navigation (*driver.get*) by adding `--browsertime.webdriverPageload true` to your test.

By default the page load strategy is set to "none" meaning sitespeed.io gets control directly after the page started to navigate from WebDriver. You can choose page load strategy with `--browsertime.pageLoadStrategy`.

Then the JavaScript configured by `--browsertime.pageCompleteCheck` is run to determine when the page is finished loading. By default that script waits for the on load event to happen.  That JavaScript that tries to determine if the page is finished runs after X seconds the first time, that is configured using `--browsertime.pageCompleteCheckStartWait`. The default is to wait 5 seconds before the first check. 

During those seconds the browser needs to navigate (on a slow computer it can take time) and we also want to make sure we do not run that pageCompleteCheck too often because that can infer with metrics. After the first time the complete check has run you can choose how often it runs with `--browsertime.pageCompleteCheckPollTimeout`. Default is 1.5 seconds. When the page complete check tells us that the test is finished, we stop the video and start collect metrics for that page.

## How can I disable HTTP/2 (I only want to test HTTP/1.x)?
In Chrome, you just add the switches <code>--browsertime.chrome.args disable-http2</code>.

For Firefox, you need to turn off HTTP/2 and SPDY, and you do that by setting the Firefox preferences:
<code>--browsertime.firefox.preference network.http.spdy.enabled:false --browsertime.firefox.preference network.http.spdy.enabled.http2:false --browsertime.firefox.preference network.http.spdy.enabled.v3-1:false</code>

## How does it work behind the scene?
We use [Browsertime](https://github.com/sitespeedio/browsertime) to drive the browser. This is the flow per URL you test:

1. We setup connectivity for the browser using different engines depending on [your configuration](/documentation/sitespeed.io/connectivity/).
2. Open the browser with a new user session (cleared cache etc).
3. If you add a request header, a cookie, use Basic Auth, block domains or clear the cache browser side the browser will open the [Browsertime extension](https://github.com/sitespeedio/browsertime-extension) and do what you asked.
4. If you configured a <code>--preScript</code> it runs next.
5. If you configured a <code>--preURL</code> the browser navigates to that URL (you should only do that if you don't use a **preScript**).
6. If you configured the video, the video starts to record the screen.
7. We ask the browser to navigate to the URL (using JavaScript).
8. Check if the URL in the browser has changed to configured URL (check every 500 ms, time out after 50 s).
9. Loop to 2. until the URL in the browser has changed.
10. Check if the page has finished loading using the pre configured **pageCompleteCheck** or <code>--pageCompleteCheck</code> or <code>--pageCompleteCheckInactivity</code>.
11. Loop to 4 until the check is done (return true).
12. Stop the video.
13. Collect all the default metrics using JavaScript and your own configured scripts <code>--script</code>.
14. If you configured a <code>--postScript</code> it runs next.
15. The browser is closed.
16. Start over in step 2 for the next run for that URL.
