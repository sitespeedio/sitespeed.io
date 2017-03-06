---
layout: default
title: Upgrading from 3.x -> 4 sitespeed.io
description:
keywords: upgrading documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Upgrade 3 -> 4
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Upgrade

# Upgrade
{:.no_toc}

* Lets place the TOC here
{:toc}

Upgrading is just updating to the new version. There's a couple of important thing that has changed.

## Graphite keys
The keys in Graphite has a new structure. The reason is that we wants to have a generic solution where we can use the same dashboards for whatever site and we want to follow the new data structure. If old data is important to you, you need to run multiple instances for a while, one with 3.x and one with 4 and have multiple dashboards, and then when you have the history, make the switch to the 4.0 dashboards.

## CLI mapping
A lot changed in the CLI and the easiest way for you is just to run sitespeed.io with <code>--help</code> to see what you can use. You can also check this mapping.

<div id="upgradeTable" markdown="1">

| 3.x      | 4.0         | Description |
|:------------|:-------------------|:-------------|
| `-u <URL>, --url <URL>` | N/A     | The start url that will be used when crawling. |
| `-f <FILE>, --file <FILE>` | N/A | The path to a plain text file with one URL on each row. Each URL will be analyzed. |
| `--sites <FILE>` | N/A | The path to a plain text file with one URL on each row. You can use the parameter multiple times to point out many files |
| `-V, --version` | `-V, --version` | Display the sitespeed.io version. |
| `--silent` | N/A | Only output info in the logs, not to the console. |
| `-v, --verbose` | `-v, --verbose` | Enable verbose logging. |
| `--noColor` | N/A | Don't use colors in console output.  [false] |
| `-d <INTEGER>, --deep <INTEGER>` | `--crawler.depth, -d` | How deep to crawl.  [1] |
| `-c <KEYWORD>, --containInPath <KEYWORD>` | N/A | Only crawl URLs that contains this in the path. |
| `-s <KEYWORD>, --skip <KEYWORD>` | N/A | Do not crawl pages that contains this in the path. |
| `-t <NOOFTHREADS>, --threads <NOOFTHREADS>` | N/A | The number of threads/processes that will analyze pages.  [5] |
| `--name <NAME>` | N/A | Give your test a name, it will be added to all HTML pages. |
| `--memory <INTEGER>` | N/A | How much memory the Java processed will have (in mb).  [256] |
| `-r <DIR>, --resultBaseDir <DIR>` | `--outputFolder <DIR>` | The result base directory, the base dir where the result ends up.  [sitespeed-result] |
| `--outputFolderName` | `--outputFolder` | Default the folder name is a date of format yyyy-mm-dd-HH-MM-ss |
| `--suppressDomainFolder` | N/A | Do not use the domain folder in the output directory |
| `--userAgent <USER-AGENT>` | `--browsertime.userAgent <USER-AGENT>` | The full User Agent string, default is Chrome for MacOSX. [userAgent\|ipad\|iphone].  [Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36] |
| `--viewPort <WidthxHeight>` | `--browsertime.viewPort <WidthxHeight>` | The view port, the page viewport size WidthxHeight like 400x300.  [1280x800] |
| `-y <FILE>, --yslow <FILE>` | N/A | The compiled YSlow file. Use this if you have your own rules. |
| `--headless` | N/A | Choose which backend to use for headless [phantomjs\|slimerjs]  [phantomjs] |
| `--ruleSet <RULE-SET>` | `--plugins.load, --pluglins.disable` | Which ruleset to use.  [sitespeed.io-desktop] |
| `--limitFile <PATH>` | `--config` | The path to the limit configuration file. |
| `--basicAuth <USERNAME:PASSWORD>` | `--browsertime.preScript, --preScript` | Basic auth user & password. |
| `-b <BROWSER>, --browser <BROWSER>` | `--browsertime.browser, -b, --browser`| Choose which browser to use to collect timing data. Use multiple browsers in a comma separated list (firefox\|chrome\|headless) |
| `--connection` | `--browsertime.connectivity.profile, -c, --connectivity` | Limit the speed by simulating connection types. Choose between mobile3g,mobile3gfast,cable,native  [cable] |
| `--waitScript` | `--browsertime.pageCompleteCheck` | Supply a javascript that decides when a browser run is finished. Use it to fetch timings happening after the loadEventEnd.  [ if (window.performance && window.performance.timing){ return ((window.performance.timing.loadEventEnd > 0) && ((new Date).getTime() - window.performance.timing.loadEventEnd > 2000 ));} else { return true;}] |
| `--customScripts` | `--browsertime.postScript, --postScript` | The path to an extra script folder with scripts that will be executed in the browser. See https://www.sitespeed.io/documentation/browsers/#custom-metrics |
| `--seleniumServer <URL>` | `--browsertime.selenium.url  <URL>` | Configure the path to the Selenium server when fetching timings using browsers. If not configured the supplied NodeJS/Selenium version is used. |
| `--btConfig <FILE>` | N/A | Additional BrowserTime JSON configuration as a file |
| `--profile <desktop|mobile>` | `--browsertime.connectivity.profile, -c, --connectivity` | Choose between testing for desktop or mobile. Testing for desktop will use desktop rules & user agents and vice verca.  [desktop] |
| `-n <NUMBEROFTIMES>, --no <NUMBEROFTIMES>` | `--browsertime.iterations <NUMBEROFTIMES>, -n <NUMBEROFTIMES>` | The number of times you should test each URL when fetching timing metrics. Default is 3 times.  [3] |
| `--screenshot` | N/A | Take screenshots for each page (using the configured view port). |
| `--junit` | `--budget.output` | Create JUnit output to the console. |
| `--tap` | `--budget.output` | Create TAP output to the console. |
| `--skipTest <ruleid1,ruleid2,...>` | N/A | A comma separated list of rules to skip when generating JUnit/TAP/budget output. |
| `--testData` | N/A | Choose which data to send test when generating TAP/JUnit output or testing a budget. Default is all available [rules,page,timings,wpt,gpsi]  [all] |
| `--budget <FILE>` | `--budget <FILE>` | A file containing the web perf budget rules. See https://www.sitespeed.io/documentation/performance-budget/ |
| `-m <NUMBEROFPAGES>, --maxPagesToTest <NUMBEROFPAGES>` | `--crawler.maxPages <NUMBEROFPAGES>, -m <NUMBEROFPAGES>` | The max number of pages to test. Default is no limit. |
| `--storeJson` | N/A | Store all collected data as JSON. |
| `-p <PROXY>, --proxy <PROXY>` | N/A | http://proxy.soulgalore.com:80 |
| `--cdns <cdn1.com,cdn.cdn2.net>` | N/A | A comma separated list of additional CDNs. |
| `--postTasksDir <DIR>` | `--browsertime.postScript <DIR>, --postScript <DIR>` | The directory where you have your extra post tasks. |
| `--boxes <box1,box2>` | N/A | The boxes showed on site summary page, see https://www.sitespeed.io/documentation/configuration/#configure-boxes-on-summary-page |
| `-c <column1,column2>, --columns <column1,column2>` | N/A | The columns showed on detailed page summary table, see https://www.sitespeed.io/documentation/configuration/#configure-columns-on-pages-page |
| `--configFile <PATH>` | `--config <PATH>` | The path to a sitespeed.io config.json file, if it exists all other input parameters will be overridden. |
| `--aggregators <PATH>` | N/A | The path to a directory with extra aggregators. |
| `--collectors <PATH>` | N/A | The path to a directory with extra collectors. |
| `--graphiteHost <HOST>` | `--graphite.host <HOST>` | The Graphite host. |
| `--graphitePort <INTEGER>` | `--graphite.port <INTEGER>` | The Graphite port.  [2003] |
| `--graphiteNamespace <NAMESPACE>` | `--graphite.namespace <NAMESPACE>` | The namespace of the data sent to Graphite.  [sitespeed.io] |
| `--graphiteData` | `--metrics.filter` | Choose which data to send to Graphite by a comma separated list. Default all data is sent. [summary,rules,pagemetrics,timings,requests,domains]  [all] |
| `--graphiteUseQueryParameters` | `--graphite.includeQueryParams` | Choose if you want to use query parameters from the URL in the Graphite keys or not |
| `--graphiteUseNewDomainKeyStructure` | N/A | Use the updated domain section when sending data to Graphite "http.www.sitespeed.io" to "http.www_sitespeed_io" (issue #651) |
| `--gpsiKey` | `--gpsi.key` | Your Google API Key, configure it to also fetch data from Google Page Speed Insights. |
| `--noYslow` | N/A | Set to true to turn off collecting metrics using YSlow. |
| `--html` | `--plugins.disable html` | Create HTML reports. Default to true. Set no-html to disable HTML reports.  [true] |
| `--wptConfig <FILE>` | `--webpagetest.location, --webpagetest.connectivity, --webpagetest.runs` | WebPageTest configuration, see https://github.com/marcelduran/webpagetest-api runTest method
| `--wptScript <FILE>` | `--webpagetest.script <FILE>` | WebPageTest scripting. Every occurance of \{\{\{URL\}\}\} will be replaced with the real URL. |
| `--wptCustomMetrics <FILE>` | `--webpagetest.custom <FILE>` | Fetch metrics from your page using Javascript |
| `--wptHost <DOMAIN>` | `--webpagetest.host <DOMAIN>` | The domain of your WebPageTest instance. |
| `--wptKey <KEY>` | `--webpagetest.key  <KEY>` | The API key if running on webpagetest on the public instances. |
| `--requestHeaders <FILE>|<HEADER>` | N/A | Any request headers to use, a file or a header string with JSON form of {"name":"value","name2":"value"}. Not supported for WPT & GPSI. |
| `--postURL <URL>` | N/A | The full URL where the result JSON will be sent by POST. Warning: Testing many pages can make the result JSON massive. |
| `--phantomjsPath <PATH>` | N/A | The full path to the phantomjs binary, to override the supplied version |

</div>

## Docker

With the new container you don't need to tell it to start sitespeed.io, just do:

~~~ bash
$ docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/
~~~
