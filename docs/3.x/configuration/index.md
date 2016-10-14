---
layout: default
title: Configuration - Documentation - sitespeed.io
description: How to configure sitespeed.io
keywords: configuration, documentation, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Configuration for the sitespeed.io.
---
[Documentation 3.x](/documentation/) / Configuration

# Configuration
{:.no_toc}

* Lets place the TOC here
{:toc}

# Configuration
Sitespeed.io is highly configurable, let's check it out!

## The options
You have the following options running sitespeed.io:

~~~help
Usage: node sitespeed.js [options]

Options:
   -u <URL>, --url <URL>                                  The start url that will be used when crawling.
   -f <FILE>, --file <FILE>                               The path to a plain text file with one URL on each row. Each URL will be analyzed.
   --sites <FILE>                                         The path to a plain text file with one URL on each row. You can use the parameter multiple times to point out many files
   -V, --version                                          Display the sitespeed.io version.
   --silent                                               Only output info in the logs, not to the console.
   -v, --verbose                                          Enable verbose logging.
   --noColor                                              Don't use colors in console output.  [false]
   -d <INTEGER>, --deep <INTEGER>                         How deep to crawl.  [1]
   -c <KEYWORD>, --containInPath <KEYWORD>                Only crawl URLs that contains this in the path.
   -s <KEYWORD>, --skip <KEYWORD>                         Do not crawl pages that contains this in the path.
   -t <NOOFTHREADS>, --threads <NOOFTHREADS>              The number of threads/processes that will analyze pages.  [5]
   --name <NAME>                                          Give your test a name, it will be added to all HTML pages.
   --memory <INTEGER>                                     How much memory the Java processed will have (in mb).  [256]
   -r <DIR>, --resultBaseDir <DIR>                        The result base directory, the base dir where the result ends up.  [sitespeed-result]
   --outputFolderName                                     Default the folder name is a date of format yyyy-mm-dd-HH-MM-ss
   --suppressDomainFolder                                 Do not use the domain folder in the output directory
   --userAgent <USER-AGENT>                               The full User Agent string, default is Chrome for MacOSX. [userAgent|ipad|iphone].  [Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36]
   --viewPort <WidthxHeight>                              The view port, the page viewport size WidthxHeight like 400x300.  [1280x800]
   -y <FILE>, --yslow <FILE>                              The compiled YSlow file. Use this if you have your own rules.
   --headless                                             Choose which backend to use for headless [phantomjs|slimerjs]  [phantomjs]
   --ruleSet <RULE-SET>                                   Which ruleset to use.  [sitespeed.io-desktop]
   --limitFile <PATH>                                     The path to the limit configuration file.
   --basicAuth <USERNAME:PASSWORD>                        Basic auth user & password.
   -b <BROWSER>, --browser <BROWSER>                      Choose which browser to use to collect timing data. Use multiple browsers in a comma separated list (firefox|chrome|headless)
   --connection                                           Limit the speed by simulating connection types. Choose between mobile3g,mobile3gfast,cable,native  [cable]
   --waitScript                                           Supply a javascript that decides when a browser run is finished. Use it to fetch timings happening after the loadEventEnd.  [ if (window.performance && window.performance.timing){ return ((window.performance.timing.loadEventEnd > 0) && ((new Date).getTime() - window.performance.timing.loadEventEnd > 2000 ));} else { return true;}]
   --customScripts                                        The path to an extra script folder with scripts that will be executed in the browser. See https://www.sitespeed.io/documentation/browsers/#custom-metrics
   --seleniumServer URL                                   Configure the path to the Selenium server when fetching timings using browsers. If not configured the supplied NodeJS/Selenium version is used.
   --btConfig <FILE>                                      Additional BrowserTime JSON configuration as a file
   --profile <desktop|mobile>                             Choose between testing for desktop or mobile. Testing for desktop will use desktop rules & user agents and vice verca.  [desktop]
   -n <NUMBEROFTIMES>, --no <NUMBEROFTIMES>               The number of times you should test each URL when fetching timing metrics. Default is 3 times.  [3]
   --screenshot                                           Take screenshots for each page (using the configured view port).
   --junit                                                Create JUnit output to the console.
   --tap                                                  Create TAP output to the console.
   --skipTest <ruleid1,ruleid2,...>                       A comma separated list of rules to skip when generating JUnit/TAP/budget output.
   --testData                                             Choose which data to send test when generating TAP/JUnit output or testing a budget. Default is all available [rules,page,timings,wpt,gpsi]  [all]
   --budget <FILE>                                        A file containing the web perf budget rules. See https://www.sitespeed.io/documentation/performance-budget/
   -m <NUMBEROFPAGES>, --maxPagesToTest <NUMBEROFPAGES>   The max number of pages to test. Default is no limit.
   --storeJson                                            Store all collected data as JSON.
   -p <PROXY>, --proxy <PROXY>                            http://proxy.soulgalore.com:80
   --cdns <cdn1.com,cdn.cdn2.net>                         A comma separated list of additional CDNs.
   --postTasksDir <DIR>                                   The directory where you have your extra post tasks.
   --boxes <box1,box2>                                    The boxes showed on site summary page, see https://www.sitespeed.io/documentation/configuration/#configure-boxes-on-summary-page
   -c <column1,column2>, --columns <column1,column2>      The columns showed on detailed page summary table, see https://www.sitespeed.io/documentation/configuration/#configure-columns-on-pages-page
   --configFile <PATH>                                    The path to a sitespeed.io config.json file, if it exists all other input parameters will be overridden.
   --aggregators <PATH>                                   The path to a directory with extra aggregators.
   --collectors <PATH>                                    The path to a directory with extra collectors.
   --graphiteHost <HOST>                                  The Graphite host.
   --graphitePort <INTEGER>                               The Graphite port.  [2003]
   --graphiteNamespace <NAMESPACE>                        The namespace of the data sent to Graphite.  [sitespeed.io]
   --graphiteData                                         Choose which data to send to Graphite by a comma separated list. Default all data is sent. [summary,rules,pagemetrics,timings,requests,domains]  [all]
   --graphiteUseQueryParameters                           Choose if you want to use query paramaters from the URL in the Graphite keys or not
   --graphiteUseNewDomainKeyStructure                     Use the updated domain section when sending data to Graphite "http.www.sitespeed.io" to "http.www_sitespeed_io" (issue #651)
   --gpsiKey                                              Your Google API Key, configure it to also fetch data from Google Page Speed Insights.
   --noYslow                                              Set to true to turn off collecting metrics using YSlow.
   --html                                                 Create HTML reports. Default to true. Set no-html to disable HTML reports.  [true]
   --wptConfig <FILE>                                     WebPageTest configuration, see https://github.com/marcelduran/webpagetest-api runTest method
   --wptScript <FILE>                                     WebPageTest scripting. Every occurance of \{\{\{URL\}\}\} will be replaced with the real URL.
   --wptCustomMetrics <FILE>                              Fetch metrics from your page using Javascript
   --wptHost <domain>                                     The domain of your WebPageTest instance.
   --wptKey <KEY>                                         The API key if running on webpagetest on the public instances.
   --requestHeaders <FILE>|<HEADER>                       Any request headers to use, a file or a header string with JSON form of {"name":"value","name2":"value"}. Not supported for WPT & GPSI.
   --postURL <URL>                                        The full URL where the result JSON will be sent by POST. Warning: Testing many pages can make the result JSON massive.
   --phantomjsPath <PATH>                                 The full path to the phantomjs binary, to override the supplied version
~~~

Yep, that was a lot, we know. Lets go into some standard use cases.

## The basics
If you installed with the global option (-g), run the command *sitespeed.io* else run the script *lib/sitespeed.js*.  In the examples we will use the script but you know what to do if you have it installed.

You can analyze a site either by crawling or feed sitespeed.io with the URL:s you want to analyze.

### Analyze by crawling
The crawler needs a start URL (the parameter **u**, from where it will start the crawl). It will fetch all links within the same domain as the URL that you provide. You can then choose how deep you want to crawl with the **d** parameter. Zero will fetch only the
  URL that you provide. One will fetch all links on that page and analyze these, two will go one level deeper and so on. If you want to analyze a site and the links with a depth of two, you do like this:

~~~ bash
$ sitespeed.io -u http://www.yoursite.com -d 2
~~~

Remember that you can start your crawl deep into your path structure like http://yoursite.com/my/path
{: .note .note-info}

### Analyze by URL:s
Instead of giving a start URL for the crawl, you can supply a plain text file with one URL on each row. Then each of these URL will be analyzed, no more or no less. A file like this will do:

~~~
http://www.yoursite.com/path/
http://www.yoursite.com/my/really/important/page/
http://www.yoursite.com/where/we/are/
~~~

Then you feed the file to the script:

~~~ bash
$ sitespeed.io -f myurls.txt
~~~

This is good for testing and keep tracks of your site in production and you have a LARGE site with many pages and a couple of them are more important than the rest.
{: .note .note-info}

### Analyze sites and benchmark
If you want to test and benchmark sites you can do like this:

~~~
http://www.yoursite.com/path/
http://www.mycompetition.com/
http://www.mycompetition2.com/
~~~

Then you feed the file to the script and each URL will be crawled. You can run the crawl the exact same way as usual, by feeding parameters.

~~~ bash
$ sitespeed.io --sites mysitesurls.txt
~~~

If you instead want to compare a couple specific URL:s between sites (pre defined URL:s instead of crawling), do like this: Create multiple plain text files with URL:s on each line:


Here's theguardian.txt:

~~~
http://www.theguardian.com/uk
http://www.theguardian.com/uk/sport
http://www.theguardian.com/uk/culture
~~~

And nytimes.txt:

~~~
http://www.nytimes.com/
http://www.nytimes.com/pages/sports/index.html
http://www.nytimes.com/pages/fashion/index.html
~~~

You can of course add how many URL:s and sites you want. Then you run the whole thing like this:

~~~ bash
$ sitespeed.io --sites theguardian.txt --sites nytimes.txt -d 0
~~~

Notice the -d 0 will tell sitespeed that we want to test the exact URL:s.


### Include/exclude URL:s when crawling
You want to make sure that parts of your site isn't included in your analyze, then you can add the parameter **s** and a keyword. Every URL with that keyword will not be included.

~~~ bash
$./bin/sitespeed.io -u http://yoursite.com  -s /monkey/
~~~
You can also do it the other way around, with the **c** and a keyword. In this case, the analyze will only include URL:s with the keyword.

~~~ bash
$  ./bin/sitespeed.io -u http://yoursite.com  -c /the/path/
~~~

### Screenshots
You can get screenshots of every page that you analyze. These will end up on a screenshot page where you can check them all. The screenshots will be taken for the chosen viewport.

~~~ bash
$ sitespeed.io -u http://yoursite.com  --screenshot
~~~

### Shortcut: test as desktop or mobile
By default you test as desktop, if you turn on mobile by just setting the profile. If you do that, you will automatically test with
mobile rules, an IOS user agent, view port of 320x444 and on a throttled connection simulating a mobile 3g connection.

~~~ bash
$ sitespeed.io -u http://yoursite.com  --profile desktop
~~~

~~~ bash
$ sitespeed.io -u http://yoursite.com  --profile mobile
~~~

### Viewport/user agent and mobile
You can set the viewport & user agent, so that you can fake testing a site as a mobile device.

By default the viewport is 1280x800 with the following user agent for Chrome on MacOSX.

~~~ bash
$ sitespeed.io -u http://yoursite.com  --viewPort 400x300 --userAgent "My SUPER BROWSER"
~~~


Mobile testing is always best on mobile devices. For tips on how to best do that, read Andy Davies [blog](http://andydavies.me/).
{: .note .note-warning}

### Limit pages to test
Sometimes you want to limit the amount to test (I do that when I compare sites). That will test maximum the amount of pages you supply.

~~~ bash
$ sitespeed.io -u http://yoursite.com  -m 10
~~~

### Set a name of your test
You can give your test run a name that will be showed on all the pages

~~~ bash
$ sitespeed.io -u http://yoursite.com/ --name "Swedens top 100 sites"
~~~

### Collect timing metrics
Sitespeed.io collect timing metrics using the Navigation Timing API and the User Timing API. Today you can use Chrome, Firefox, PhantomJS 2.0 and SlimerJS. We also have exprimental support for Internet Explorer (ie) and Safari.

Add the parameter **b** followed by the browser name.

~~~ bash
$ sitespeed.io -u http://yoursite.com  -b firefox
~~~

Each page is tested 3 times by default. You can change that with the **n** parameter.  Test using Chrome and test each page 9 times, looks like this:

~~~ bash
$ sitespeed.io -u http://yoursite.com  -b chrome -n 9
~~~

If you want to test in multiple browsers, you add them in a comma separated list

~~~ bash
$ sitespeed.io -u http://yoursite.com  -b firefox,chrome -n 7
~~~

### Throttle the connection
You can throttle the connection when you are fetching metrics using the browser. Choose between:

* **mobile3g** - 1.6 Mbps/768 Kbps - 300 RTT
* **mobile3gfast** - 1.6 Mbps/768 Kbps - 150 RTT
* **cable** - 5 Mbps/1 Mbps - 28 RTT
* **native** - the current connection

And do like this:

~~~ bash
$ sitespeed.io -u http://yoursite.com -b chrome --connection mobile3g
~~~

## A little more nerdy

### Fetch data Google Page Speed Insights
To test each page using GPSI, you need to have a a Google API Key. You can get one [here](https://console.developers.google.com/project). Testing using GPSI will
  include the GPSI score in the summary page and all individual data on the detailed page.


~~~ bash
$ sitespeed.io -u http://yoursite.com  --gpsiKey MY_SECRET_KEY
~~~

### Fetch data from WebPageTest

Yep, it is true! You can drive WebPageTest from sitespeed.io. You need to either have your own private instance or an API key.

~~~ bash
$ sitespeed.io -u http://yoursite.com  --wptHost www.webpagetest.org --wptKey MY_SECRET_API_KEY
~~~

In the background Marcel Durans WPT API is used, specific the [runTest](https://github.com/marcelduran/webpagetest-api#user-content-test-works-for-test-command-only) method.
  You can pass all the parameters in the runTest through sitespeed.io by the **--wptConfig** parameter and supply a JSON file.


By default, the following values are passed to WPT:

~~~
pollResults: 10,
timeout: 600,
firstViewOnly: false,
runs: // the number of runs you configure by the n parameter
private: true,
aftRenderingTime: true,
location: 'Dulles:Chrome',
video: true
~~~

And if you configured basic auth, the login/password is also passed to WPT.

If you pass your own **--wptConfig**, a fields matching will override the default configuration.


### Send your data to Graphite

You can choose to send your data to Graphite, to keep track of your performance over time.
You configure four things: the host, port, the namespace and which data to send. Default value for the port is 2003, namespace (the start of the key) is sitespeed and send all collected data.

~~~ bash
$ sitespeed.io -u https://www.sitespeed.io --graphiteHost localhost
~~~

### Set request headers
The headers can be set if you collect rules and timings. It will not work for WPT and GPSI. Supply a JSON file like this:

~~~
{
  "mysupercoolheader":"value",
  "coolheader2":"value2"
}
~~~

And the run like this:

~~~ bash
$ sitespeed.io -u https://www.sitespeed.io --requestHeaders myheaders.txt
~~~

### Configure boxes on summary page
You can choose which boxes you want to show on the summary page by configure them by their name. You can choose to show to configure them exactly as you want. Then you need to pass every name to the script:

~~~ bash
$ sitespeed.io -u https://www.sitespeed.io --boxes thirdpartyversions,ycdn
~~~

Or if you want to add boxes to the already pre-configured ones, you can add a plus sign before the name(it is perfect
  if you have your own User Timings that you want to show):

~~~ bash
$ sitespeed.io -u https://www.sitespeed.io -b chrome --boxes +logoTime,headerTime
~~~

These boxes will then end up in the end of the list.

### Configure columns on pages page
You can choose what kind of data you want to show in the column pages. The naming is far from perfect today or you could say it's broken, lets change that in coming major releases.

If you want to show data that are collected from YSlow, like number of javascripts, you do that like this:

~~~ bash
$ sitespeed.io -u https://www.sitespeed.io -c yslow.assets.js,yslow.assets.css,yslow.requests,yslow.pageWeight
~~~

If you want to fetch timings from your browser, they are following this pattern (headerTime is a User Timing):

~~~ bash
$ sitespeed.io -u https://www.sitespeed.io -c timings.serverResponseTime.median,timings.domContentLoadedTime.median,timings.headerTime.median -b chrome
~~~

If you want to show metric collected from WebPageTest they are published under the following structure: <i>wpt[location][browser][connectivity][view][timing]</i> and the metrics names are the exact same they have in the WebPageTest API (we collect 'SpeedIndex', 'firstPaint', 'render', 'TTFB', 'visualComplete', 'domContentLoadedEventEnd' and 'loadTime').

So if you want to display speed index for first and repeated view tested from Dulles using Chrome and Cable, you need to configure the columns like this:

~~~ bash
-c wpt.dulles.chrome.cable.firstView.SpeedIndex,wpt.dulles.chrome.cable.repeatView.SpeedIndex
~~~

If you have problem, [create an issue](https://github.com/sitespeedio/sitespeed.io/issues/new) and we will help you.
