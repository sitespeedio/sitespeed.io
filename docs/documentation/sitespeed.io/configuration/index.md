---
layout: default
title: How to configure sitespeed.io
description: In the cli just run "sitespeed.io --help" to get the configuration options.
keywords: configuration, documentation, web performance, sitespeed.io
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
You have the following options when running sitespeed.io (run <code>sitespeed.io --help</code> to get the list on your command line):

~~~help
sitespeed.io [options] <url>/<file>

Browser
  --browsertime.browser, -b, --browser                         Choose which Browser to use when you test.                       [choices: "chrome", "firefox"] [default: "chrome"]
  --browsertime.iterations, -n                                 How many times you want to test each page                                                              [default: 3]
  --browsertime.delay                                          Delay between runs, in milliseconds                                                           [number] [default: 0]
  --browsertime.connectivity.profile, -c, --connectivity       The connectivity profile. Default connectivity engine is tsproxy
                                                                                        [choices: "3g", "3gfast", "3gslow", "2g", "cable", "native", "custom"] [default: "native"]
  --browsertime.connectivity.downstreamKbps, --downstreamKbps  This option requires --connectivity.profile be set to "custom".
  --browsertime.connectivity.upstreamKbps, --upstreamKbps      This option requires --connectivity.profile be set to "custom".
  --browsertime.connectivity.latency, --latency                This option requires --connectivity.profile be set to "custom".
  --browsertime.connectivity.tsproxy.port                      The port used for ts proxy                                                                          [default: 1080]
  --browsertime.connectivity.engine                            The engine for connectivity. Tsproxy needs Python 2.7. TC needs tc, modprobe and ip installed to work. Running tc
                                                               inside Docker needs modprobe to run outside the container.          [choices: "tc", "tsproxy"] [default: "tsproxy"]
  --browsertime.pageCompleteCheck                              Javascript snippet is repeatedly queried to see if page has completed loading (indicated by the script returning
                                                               true)
  --browsertime.script, --script                               Add custom Javascript to run on page (that returns a number). Note that --script can be passed multiple times if
                                                               you want to collect multiple metrics. The metrics will automatically be pushed to the summary/detailed summary and
                                                               each individual page + sent to Graphite/InfluxDB.
  --browsertime.selenium.url                                   Configure the path to the Selenium server when fetching timings using browsers. If not configured the supplied
                                                               NodeJS/Selenium version is used.
  --browsertime.viewPort                                       The view port, the page viewport size WidthxHeight like 400x300                               [default: "1366x708"]
  --browsertime.userAgent                                      The full User Agent string, defaults to the user agent used by the browsertime.browser option.
  --browsertime.preScript, --preScript                         Task(s) to run before you test your URL (use it for login etc). Note that --preScript can be passed multiple times.
  --browsertime.postScript, --postScript                       Path to JS file for any postTasks that need to be executed.

Crawler
  --crawler.depth, -d     How deep to crawl (1=only one page, 2=include links from first page, etc.)
  --crawler.maxPages, -m  The max number of pages to test. Default is no limit.

Graphite
  --graphite.host                The Graphite host used to store captured metrics.
  --graphite.port                The Graphite port used to store captured metrics.                                                                                 [default: 2003]
  --graphite.namespace           The namespace key added to all captured metrics.                                                                [default: "sitespeed_io.default"]
  --graphite.includeQueryParams  Whether to include query paramaters from the URL in the Graphite keys or not                                           [boolean] [default: false]

Plugins
  --plugins.list     List all configured plugins in the log.                                                                                            [boolean] [default: false]
  --plugins.disable  Disable a plugin. Use it to disable generating html or screenshots.                                                                                   [array]
  --plugins.load     Extra plugins that you want to run. Relative or absolute path to the plugin.                                                                          [array]

Budget
  --budget         Path to the JSON budget file.
  --budget.output  The output format of the budget                                                                                                       [choices: "junit", "tap"]

Metrics
  --metrics.list        List all possible metrics in the data folder (metrics.txt).                                                                     [boolean] [default: false]
  --metrics.filterList  List all configured filters for metrics in the data folder (configuredMetrics.txt)                                              [boolean] [default: false]
  --metrics.filter      Add/change/remove filters for metrics. If you want to send all metrics, use: *+ . If you want to remove all current metrics and send only the coach score:
                        *- coach.summary.score.*                                                                                                                           [array]

WebPageTest
  --webpagetest.host          The domain of your WebPageTest instance.                                                                    [default: "https://www.webpagetest.org"]
  --webpagetest.key           The API key for you WebPageTest instance.
  --webpagetest.location      The location for the test                                                                                                 [default: "Dulles:Chrome"]
  --webpagetest.connectivity  The connectivity for the test.                                                                                                    [default: "Cable"]
  --webpagetest.runs          The number of runs per URL.                                                                                                             [default: 3]
  --webpagetest.custom        Execute arbitrary Javascript at the end of a test to collect custom metrics.
  --webpagetest.script        Path to a script file

gpsi
  --gpsi.key  The key to use Google Page Speed Insight

Slack
  --slack.hookUrl   WebHook url for the Slack team (check https://<your team>.slack.com/apps/manage/custom-integrations).
  --slack.userName  User name to use when posting status to Slack.                                                                                       [default: "Sitespeed.io"]
  --slack.channel   The slack channel without the # (if something else than the default channel for your hook).
  --slack.type      Send summary for a run, metrics from all URLs, only on errors or all to Slack.                    [choices: "summary", "url", "error", "all"] [default: "all"]

HTML
  --html.showAllWaterfallSummary  Set to true to show all waterfalls on page summary HTML report                                                        [boolean] [default: false]

text
  --summary         Show brief text summary to stdout                                                                                                   [boolean] [default: false]
  --summary-detail  Show longer text summary to stdout                                                                                                  [boolean] [default: false]

Options:
  --version, -V   Show version number                                                                                                                                    [boolean]
  --debug         Debug mode logs all internal messages to the console.                                                                                 [boolean] [default: false]
  --verbose, -v   Verbose mode prints progress messages to the console. Enter up to three times (-vvv) to increase the level of detail.                                    [count]
  --mobile        Access pages as mobile a fake mobile device. Set UA and width/height. For Chrome it will use device Apple iPhone 6.                   [boolean] [default: false]
  --outputFolder  The folder where the result will be stored.
  --firstParty    A regex running against each request and categorize it as first vs third party URL. (ex: ".*sitespeed.*")
  --utc           Use Coordinated Universal Time for timestamps                                                                                         [boolean] [default: false]
  --config        Path to JSON config file
  --help, -h      Show help                                                                                                                                              [boolean]

Read the docs at https://www.sitespeed.io/documentation/sitespeed.io/
~~~


## The basics
If you installed with the global option run the command *sitespeed.io* else run the script *bin/sitespeed.js*.  In the examples we will use the globally installed version.

You can analyze a site either by crawling or by feeding sitespeed.io with a list URL:s you want to analyze.

### Analyze by URLs
The simplest way to run sitespeed.io is to give it a URL.

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

And run it:

~~~bash
$ sitespeed.io urls.txt
~~~

### Analyze by crawling

If you wanna find pages that are not so performant it's a good idea to crawl. Sitespeed.io will start with the URL and fetch all links on that pages and continue to dig deeper into the site structure. You can choose how deep to crawl (1=only one page, 2=include links from first page, etc.):

~~~bash
$ sitespeed.io https://www.sitespeed.io -d 2
~~~

### How many runs per URL?
When collecting timing metrics it's good to test the URL more than one time (default is three times). You can configure how many runs like this (five runs):

~~~bash
$ sitespeed.io https://www.sitespeed.io -n 5
~~~

### Choose browser
Choose which browser to use (default is Chrome):

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
* cable - 5000/1000 28 RTT
* native - your current connection

We use [TSProxy](https://github.com/WPO-Foundation/tsproxy) by default, so you need Python 2.7 to be able to throttle the connection.

~~~bash
$ sitespeed.io https://www.sitespeed.io -c cable
~~~

### Viewport/user agent and mobile

You can set the viewport & user agent, so that you can fake testing a site as a mobile device.

Simplest way is to just add <code>--mobile</code> as a parameter. The viewport will be set to 360x640 and the User Agent will be Iphone6. If you use Chrome it will use the pre-set device Apple iPhone 6.

~~~bash
$ sitespeed.io https://www.sitespeed.io --mobile
~~~

You can also set specific viewport and User Agent:

~~~bash
$ sitespeed.io https://www.sitespeed.io --browsertime.viewPort 400x400 --browsertime.userAgent "UCWEB/2.0 (MIDP-2.0; U; Adr 4.4.4; en-US; XT1022) U2/1.0.0 UCBrowser/10.6.0.706 U2/1.0.0 Mobile"
~~~

Mobile testing is always best on an actual mobile devices. You can [test on Android phones](../mobile-phones/) using sitespeed.io.
{: .note .note-warning}

### Connectivity

You can fake the connectivity for the browser. By default we use [TSProxy](https://github.com/WPO-Foundation/tsproxy) so you need Python 2.7 to work but you can also set the connectivity engine to [tc](http://lartc.org/manpages/tc.txt) if that works better for you.

Setting the connectivity to cable:

~~~bash
$ sitespeed.io -c cable https://www.sitespeed.io/
~~~

Changing the engine type to tc (use tc when you run in Docker):

~~~bash
$ sitespeed.io -c cable --browsertime.connectivity.engine tc https://www.sitespeed.io/
~~~

### First party vs third party
You can categorize requests as first or third parties by adding a regexp. You will then get the size & requests by type both in HTML and sent to Graphite.

~~~bash
$ sitespeed.io --firstParty ".ryanair.com" https://www.ryanair.com/us/en/
~~~

### Output folder or where to store the result
You can change where you want the data to be stored by setting the <code>--outputFolder</code> parameter. That is good in scenarios where you wanna change the default behavior and put the output in specific place.

~~~bash
$ sitespeed.io --outputFolder /my/folder ".ryanair.com" https://www.sitespeed.io/
~~~

### Configuration as JSON

You can keep all your configuration in a JSON file and then pass it on to sitespeed, and override with CLI parameters.

Create a config file and call it config.json:

~~~
{
  "browsertime": {
    "connectivity": {
      "engine": "tc",
      "profile": "cable"
    },
    "iterations": 5,
    "browser": "chrome",
    "experimental": {
      "video": true
    }
  },
  "graphite": {
    "host": "my.graphite.host",
    "namespace": "sitespeed_io.desktopFirstView"
  },
"plugins": {
	"disable": ["html"]
	},
  "utc": true
}
~~~

The run it like this:

~~~bash
$ sitespeed.io --config config.json https://www.sitespeed.io
~~~

If you wanna override and run the same configuration but using Firefox, you just override with the CLI paramater:

~~~bash
$ sitespeed.io --config config.json -b firefox https://www.sitespeed.io
~~~

## Advanced

### Slack
You can send the result of a run to Slack. First setup a webhook in the slack API (https://<your team>.slack.com/apps/manage/custom-integrations) and then configure it:

~~~bash
$ sitespeed.io https://www.sitespeed.io/ --slack.hookUrl https://hooks.slack.com/services/YOUR/HOOK/URL
~~~

You can choose to send just a summary (the summary for all runs), individual runs (with url), only errors or all by choosing the <code>slack.type</code>.

~~~bash
$ sitespeed.io https://www.sitespeed.io/ --slack.hookUrl https://hooks.slack.com/services/YOUR/HOOK/URL --slack.type summary
~~~

![Slack]({{site.baseurl}}/img/slack.png)
{: .img-thumbnail}

### Login the user
We have added a [special section](../prepostscript) for that!
