---
layout: default
title: Browsers - Documentation - sitespeed.io
description: How to configure sitespeed.io
keywords: configuration, documentation, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Configuration for sitespeed.io.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Configuration

# Configuration
{:.no_toc}

* Lets place the TOC here
{:toc}

# Configuration
Sitespeed.io is highly configurable, let's check it out!

## The options
You have the following options running sitespeed.io (we will add more as we are coming to the stable 4.0 release):

~~~help
bin/sitespeed.js [options] <url>/<file>

Browser
  --browsertime.browser, -b, --browser                    Choose which Browser to use when you test.                           [choices: "chrome", "firefox"] [default: "chrome"]
  --browsertime.iterations, -n                            How many times you want to test each page                                                                  [default: 3]
  --browsertime.delay                                     Delay between runs, in milliseconds                                                               [number] [default: 0]
  --browsertime.connectivity.profile, -c, --connectivity  The connectivity profile. Default connectivity engine is tsproxy
                                                                                       [choices: "3g", "3gfast", "3gslow", "2g", "cable", "native", "custom"] [default: "native"]
  --browsertime.connectivity.config                       This option requires --connectivity.profile be set to "custom". Takes a JSON object with the keys downstreamKbps,
                                                          upstreamKbps and latency. "{\"downstreamKbps\":6000, \"upstreamKbps\": 6000, \"latency\": 200}"
  --browsertime.connectivity.tsproxy.port                 The port used for ts proxy                                                                              [default: 1080]
  --browsertime.connectivity.engine                       The engine for connectivity. Tsproxy needs Python 2.7. TC needs tc, modprobe and ip installed to work. Running tc
                                                          inside Docker needs modprobe to run outside the container.              [choices: "tc", "tsproxy"] [default: "tsproxy"]
  --browsertime.pageCompleteCheck                         Javascript snippet is repeatedly queried to see if page has completed loading (indicated by the script returning true)
  --browsertime.script, --script                          Add custom Javascript to run on page (that returns a number). Note that --script can be passed multiple times if you
                                                          want to collect multiple metrics. The metrics will automatically be pushed to the summary/detailed summary and each
                                                          individual page + sent to Graphite/InfluxDB.
  --browsertime.selenium.url                              Configure the path to the Selenium server when fetching timings using browsers. If not configured the supplied
                                                          NodeJS/Selenium version is used.
  --browsertime.viewPort                                  The view port, the page viewport size WidthxHeight like 400x300                                   [default: "1366x708"]
  --browsertime.userAgent                                 The full User Agent string, defaults to the user agent used by the browsertime.browser option.
  --browsertime.preScript, --preScript                    Task(s) to run before you test your URL (use it for login etc). Note that --preScript can be passed multiple times.
  --browsertime.postScript, --postScript                  Path to JS file for any postTasks that need to be executed.

Crawler
  --crawler.depth, -d     How deep to crawl (1=only one page, 2=include links from first page, etc.)
  --crawler.maxPages, -m  The max number of pages to test. Default is no limit.

Graphite
  --graphite.host                The Graphite host used to store captured metrics.
  --graphite.port                The Graphite port used to store captured metrics.                                                                                [default: 2003]
  --graphite.namespace           The namespace key added to all captured metrics.                                                               [default: "sitespeed_io.default"]
  --graphite.includeQueryParams  Whether to include query paramaters from the URL in the Graphite keys or not                                          [boolean] [default: false]

Plugins
  --plugins.list     List all configured plugins in the log.                                                                                           [boolean] [default: false]
  --plugins.disable  Disable a plugin. Use it to disable generating html or screenshots.                                                                                  [array]
  --plugins.load     Extra plugins as an installed npm module that you want to run                                                                                        [array]

Metrics
  --metrics.list        List all possible metrics in the data folder (metrics.txt).                                                                    [boolean] [default: false]
  --metrics.filterList  List all configured filters for metrics in the data folder (configuredMetrics.txt)                                             [boolean] [default: false]
  --metrics.filter      Add/change/remove filters for metrics. If you want to send all metrics, use: *+ . If you want to remove all current metrics and send only the coach
                        score: *- coach.summary.score.*                                                                                                                   [array]

WebPageTest
  --webpagetest.host          The domain of your WebPageTest instance.                                                                   [default: "https://www.webpagetest.org"]
  --webpagetest.key           The API key for you WebPageTest instance.
  --webpagetest.location      The location for the test                                                                                                [default: "Dulles:Chrome"]
  --webpagetest.connectivity  The connectivity for the test.                                                                                                   [default: "Cable"]
  --webpagetest.runs          The number of runs per URL.                                                                                                            [default: 3]
  --webpagetest.custom        Execute arbitrary Javascript at the end of a test to collect custom metrics.
  --webpagetest.script        Path to a script file

gpsi
  --gpsi.key  The key to use Google Page Speed Insight

Slack
  --slack.hookUrl   WebHook url for the Slack team (check https://<your team>.slack.com/apps/manage/custom-integrations).
  --slack.userName  User name to use when posting status to Slack.                                                                                      [default: "Sitespeed.io"]

HTML
  --html.showWaterfallSummary  Set to true to show waterfalls on summary HTML report                                                                   [boolean] [default: false]

Options:
  --version, -V   Show version number                                                                                                                                   [boolean]
  --debug         Debug mode logs all internal messages to the console.                                                                                [boolean] [default: false]
  --verbose, -v   Verbose mode prints progress messages to the console. Enter up to three times (-vvv) to increase the level of detail.                                   [count]
  --mobile        Access pages as mobile a fake mobile device. Set UA and width/height. For Chrome it will use device Apple iPhone 6.                  [boolean] [default: false]
  --outputFolder  The folder name where the result will be stored. By default the name is generated using current_date/domain/filename              [default: "sitespeed-result"]
  --firstParty    A regex running against each request and categorize it as first vs third party URL. (ex: ".*sitespeed.*")
  --utc           Use Coordinated Universal Time for timestamps                                                                                        [boolean] [default: false]
  --config        Path to JSON config file
  --help, -h      Show help                                                                                                                                             [boolean]

Read the docs at https://www.sitespeed.io/documentation/

urlOrFile
~~~


## The basics
If you installed with the global option (-g), run the command *sitespeed.io* else run the script *bin/sitespeed.js*.  In the examples we will use the installed version.

You can analyze a site either by crawling or feed sitespeed.io with the URL:s you want to analyze.

### Analyze by URLs
You can choose

~~~bash
$ sitespeed.io https://www.sitespeed.io
~~~

If you wanna test multiple URLs just feed them:

~~~bash
$ sitespeed.io https://www.sitespeed.io https://www.sitespeed.io/documentation/
~~~

You can also use a plain text file with one URL on each line. Create a file called urls.txt:

~~~
http://www.yoursite.com/path/
http://www.yoursite.com/my/really/important/page/
http://www.yoursite.com/where/we/are/
~~~

And feed it:

~~~bash
$ sitespeed.io urls.txt
~~~

### Analyze by crawling

You can choose how deep to crawl (1=only one page, 2=include links from first page, etc.):

~~~bash
$ sitespeed.io https://www.sitespeed.io -d 2
~~~

### How many runs per URL?
Collecting timing metrics it's good to test the URL more than one time. You can configure how many runs doing like this (five runs):

~~~bash
$ sitespeed.io https://www.sitespeed.io -n 5
~~~

### Choose browser
Choose which browser to use:

~~~bash
$ sitespeed.io https://www.sitespeed.io -b firefox
~~~

~~~bash
$ sitespeed.io https://www.sitespeed.io -b chrome
~~~

### Connectivity

You can throttle the connection when you are fetching metrics using the browser. Choose between:

* 3g - 1600/768 300 RTT
* 3gfast - 1600/768 150 RTT
* 3gslow - 780/330 200 RTT
* 2g - 35/328 1300 RTT
* cable - 5000/1000 280 RTT
* native - your current connection

We use [TSProxy](https://github.com/WPO-Foundation/tsproxy) by default so you need Python 2.7 to be able to throttle the connection.

~~~bash
$ sitespeed.io https://www.sitespeed.io -c cable
~~~
