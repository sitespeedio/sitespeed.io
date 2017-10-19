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

* Let's place the TOC here
{:toc}

# Configuration
Sitespeed.io is highly configurable, let's check it out!

## The options
You have the following options when running sitespeed.io within docker (run <code>docker run sitespeedio/sitespeed.io --help</code> to get the list on your command line):

~~~help
bin/sitespeed.js [options] <url>/<file>

Browser
  --browsertime.browser, -b, --browser                         Choose which Browser to use when you test.                   [choices: "chrome", "firefox"] [default: "chrome"]
  --browsertime.iterations, -n                                 How many times you want to test each page                                                          [default: 3]
  --browsertime.connectivity.profile, -c, --connectivity       The connectivity profile.
                                                                            [choices: "3g", "3gfast", "3gslow", "3gem", "2g", "cable", "native", "custom"] [default: "native"]
  --browsertime.connectivity.downstreamKbps, --downstreamKbps  This option requires --connectivity be set to "custom".
  --browsertime.connectivity.upstreamKbps, --upstreamKbps      This option requires --connectivity be set to "custom".
  --browsertime.connectivity.latency, --latency                This option requires --connectivity be set to "custom".
  --browsertime.connectivity.tsproxy.port                      The port used for TSProxy                                                                       [default: 1080]
  --browsertime.connectivity.engine                            The engine for connectivity. TC (Linux Traffic Control) needs tc work but will only setup upload and latency.
                                                               Use external if you set the connectivity outside of Browsertime. The best way do to this is described in
                                                               https://github.com/sitespeedio/browsertime#connectivity
                                                                                                                  [choices: "tc", "tsproxy", "external"] [default: "external"]
  --browsertime.pageCompleteCheck                              Supply a Javascript that decides when the browser is finished loading the page and can start to collect
                                                               metrics. The Javascript snippet is repeatedly queried to see if page has completed loading (indicated by the
                                                               script returning true). Use it to fetch timings happening after the loadEventEnd.
  --browsertime.script, --script                               Add custom Javascript that collect metrics and run after the page has finished loading. Note that --script can
                                                               be passed multiple times if you want to collect multiple metrics. The metrics will automatically be pushed to
                                                               the summary/detailed summary and each individual page + sent to Graphite/InfluxDB.
  --browsertime.selenium.url                                   Configure the path to the Selenium server when fetching timings using browsers. If not configured the supplied
                                                               NodeJS/Selenium version is used.
  --browsertime.viewPort                                       The browser view port size WidthxHeight like 400x300                                      [default: "1366x708"]
  --browsertime.userAgent                                      The full User Agent string, defaults to the User Agent used by the browsertime.browser option.
  --browsertime.preScript, --preScript                         Selenium script(s) to run before you test your URL (use it for login, warm the cache, etc). Note that
                                                               --preScript can be passed multiple times.
  --browsertime.postScript, --postScript                       Selenium script(s) to run after you test your URL (use it for logout etc). Note that --postScript can be passed
                                                               multiple times.
  --browsertime.delay                                          Delay between runs, in milliseconds. Use it if your web server needs to rest between runs :)
  --browsertime.speedIndex, --speedIndex                       Calculate SpeedIndex. Requires FFMpeg and python dependencies                                         [boolean]
  --browsertime.video, --video                                 Record a video. Requires FFMpeg to be installed                                                       [boolean]
  --browsertime.preURL, --preURL                               A URL that will be accessed first by the browser before the URL that you wanna analyze. Use it to fill the
                                                               cache.
  --browsertime.userTimingWhitelist, --userTimingWhitelist     This option takes a regex that will whitelist which userTimings to capture in the results. All userTimings are
                                                               captured by default. T
  --browsertime.firefox.preference                             Extra command line arguments to pass Firefox preferences by the format key:value To add multiple preferences,
                                                               repeat --browsertime.firefox.preference once per argument.
  --browsertime.firefox.includeResponseBodies                  Include response bodies in HAR when using Firefox.                                                    [boolean]
  --browsertime.chrome.args                                    Extra command line arguments to pass to the Chrome process (e.g. --no-sandbox). To add multiple arguments to
                                                               Chrome, repeat --browsertime.chrome.args once per argument.
  --browsertime.chrome.collectTracingEvents                    Collect Chromes traceCategories                                                                       [boolean]
  --browsertime.chrome.android.package                         Run Chrome on your Android device. Set to com.android.chrome for default Chrome version. You need to run adb
                                                               start-server before you start.
  --browsertime.chrome.android.deviceSerial                    Choose which device to use. If you do not set it, the first found device will be used.
  --browsertime.chrome.collectNetLog                           Collect network log from Chrome and save to disk.                                                     [boolean]
  --browsertime.chrome.traceCategories                         Set the trace categories.                                                                              [string]
  --browsertime.requestheader, -r                              Request header that will be added to the request. Add multiple instances to add multiple request headers. Only
                                                               Chrome support for now.
  --browsertime.block                                          Domain to block. Add multiple instances to add multiple domains that will be blocked. Only Chrome support for
                                                               now.
  --browsertime.basicAuth, --basicAuth                         Use it if your server is behind Basic Auth. Format: username@password (Only Chrome at the moment).

proxy
  --browsertime.proxy.http   Http proxy (host:port)                                                                                                                   [string]
  --browsertime.proxy.https  Https proxy (host:port)                                                                                                                  [string]

Crawler
  --crawler.depth, -d     How deep to crawl (1=only one page, 2=include links from first page, etc.)
  --crawler.maxPages, -m  The max number of pages to test. Default is no limit.

Graphite
  --graphite.host                The Graphite host used to store captured metrics.
  --graphite.port                The Graphite port used to store captured metrics.                                                                             [default: 2003]
  --graphite.auth                The Graphite user and password used for authentication. Format: user:password
  --graphite.httpPort            The Graphite port used to access the user interface and send annotations event                                                [default: 8080]
  --graphite.webHost             The graphite-web host. If not specified graphite.host will be used.
  --graphite.namespace           The namespace key added to all captured metrics.                                                            [default: "sitespeed_io.default"]
  --graphite.includeQueryParams  Whether to include query parameters from the URL in the Graphite keys or not                                       [boolean] [default: false]
  --graphite.arrayTags           Send the tags as array or a string. In Graphite 1.0 the tags is a array.                                           [boolean] [default: false]

Plugins
  --plugins.list     List all configured plugins in the log.                                                                                                         [boolean]
  --plugins.disable  Disable a plugin. Use it to disable generating html or screenshots.                                                                               [array]
  --plugins.load     Extra plugins that you want to run. Relative or absolute path to the plugin.                                                                      [array]

Budget
  --budget.configPath  Path to the JSON budget file.
  --budget.config      The JSON budget config as a string.
  --budget.output      The output format of the budget.                                                                                              [choices: "junit", "tap"]

InfluxDB
  --influxdb.protocol            The protocol used to store connect to the InfluxDB host.                                                                    [default: "http"]
  --influxdb.host                The InfluxDB host used to store captured metrics.
  --influxdb.port                The InfluxDB port used to store captured metrics.                                                                             [default: 8086]
  --influxdb.username            The InfluxDB username for your InfluxDB instance.
  --influxdb.password            The InfluxDB password for your InfluxDB instance.
  --influxdb.database            The database name used to store captured metrics.                                                                      [default: "sitespeed"]
  --influxdb.tags                A comma separated list of tags and values added to each metric                                                  [default: "category=default"]
  --influxdb.includeQueryParams  Whether to include query parameters from the URL in the InfluxDB keys or not                                       [boolean] [default: false]

Metrics
  --metrics.list        List all possible metrics in the data folder (metrics.txt).                                                                 [boolean] [default: false]
  --metrics.filterList  List all configured filters for metrics in the data folder (configuredMetrics.txt)                                          [boolean] [default: false]
  --metrics.filter      Add/change/remove filters for metrics. If you want to send all metrics, use: *+ . If you want to remove all current metrics and send only the coach
                        score: *- coach.summary.score.*                                                                                                                [array]

WebPageTest
  --webpagetest.host               The domain of your WebPageTest instance.                                                           [default: "https://www.webpagetest.org"]
  --webpagetest.key                The API key for you WebPageTest instance.
  --webpagetest.location           The location for the test                                                                                        [default: "Dulles:Chrome"]
  --webpagetest.connectivity       The connectivity for the test.                                                                                           [default: "Cable"]
  --webpagetest.runs               The number of runs per URL.                                                                                                    [default: 3]
  --webpagetest.custom             Execute arbitrary Javascript at the end of a test to collect custom metrics.
  --webpagetest.file               Path to a script file
  --webpagetest.script             The WebPageTest script as a string.
  --webpagetest.includeRepeatView  Do repeat or single views                                                                                        [boolean] [default: false]
  --webpagetest.private            Wanna keep the runs private or not                                                                                [boolean] [default: true]

gpsi
  --gpsi.key  The key to use Google Page Speed Insight

Slack
  --slack.hookUrl       WebHook url for the Slack team (check https://<your team>.slack.com/apps/manage/custom-integrations).
  --slack.userName      User name to use when posting status to Slack.                                                                               [default: "Sitespeed.io"]
  --slack.channel       The slack channel without the # (if something else than the default channel for your hook).
  --slack.type          Send summary for a run, metrics from all URLs, only on errors or all to Slack.            [choices: "summary", "url", "error", "all"] [default: "all"]
  --slack.limitWarning  The limit to get a warning in Slack using the limitMetric                                                                                [default: 90]
  --slack.limitError    The limit to get a error in Slack using the limitMetric                                                                                  [default: 80]
  --slack.limitMetric   The metric that will be used to set warning/error                   [choices: "coachScore", "speedIndex", "firstVisualChange"] [default: "coachScore"]

s3
  --s3.key                The S3 key
  --s3.secret             The S3 secret
  --s3.bucketname         Name of the S3 bucket
  --s3.path               Override the default folder path in the bucket where the results are uploaded. By default it's "DOMAIN_OR_FILENAME/TIMESTAMP", or the name of the
                          folder if --outputFolder is specified.
  --s3.region             The S3 region. Optional depending on your settings.
  --s3.clientSettings     Extra settings to pass to the s3 client, see: https://github.com/andrewrk/node-s3-client#create-a-client                                             [string] [default: "{}"]
  --s3.uploadSettings     Extra settings to pass when uploading files to s3, see: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property            [string] [default: "{}"]
  --s3.removeLocalResult  Remove all the local result files after they have been uploaded to S3                                                                                                                      [boolean] [default: false]

HTML
  --html.showAllWaterfallSummary  Set to true to show all waterfalls on page summary HTML report                                                    [boolean] [default: false]
  --html.fetchHARFiles            Set to true to load HAR files using fetch instead of including them in the HTML. Turn this on if serve your pages using a server.
                                                                                                                                                    [boolean] [default: false]
  --html.logDownloadLink          Adds a link in the HTML so you easily can download the logs from the sitespeed.io run. If your server is public, be careful so you don't log
                                  passwords etc                                                                                                     [boolean] [default: false]
  --html.topListSize              Maximum number of assets to include in each toplist in the toplist tab                                                         [default: 10]

text
  --summary         Show brief text summary to stdout                                                                                               [boolean] [default: false]
  --summary-detail  Show longer text summary to stdout                                                                                              [boolean] [default: false]

Options:
  --version, -V    Show version number                                                                                                                               [boolean]
  --debug          Debug mode logs all internal messages to the console.                                                                            [boolean] [default: false]
  --verbose, -v    Verbose mode prints progress messages to the console. Enter up to three times (-vvv) to increase the level of detail.                               [count]
  --mobile         Access pages as mobile a fake mobile device. Set UA and width/height. For Chrome it will use device Apple iPhone 6.              [boolean] [default: false]
  --resultBaseURL  The base URL to the server serving the HTML result. In the format of https://result.sitespeed.io
  --gzipHAR        Compress the HAR files with GZIP.                                                                                                [boolean] [default: false]
  --outputFolder   The folder where the result will be stored.
  --firstParty     A regex running against each request and categorize it as first vs third party URL. (ex: ".*sitespeed.*")
  --utc            Use Coordinated Universal Time for timestamps                                                                                    [boolean] [default: false]
  --config         Path to JSON config file
  --help, -h       Show help                                                                                                                                         [boolean]

Read the docs at https://www.sitespeed.io/documentation/sitespeed.io/
~~~


## The basics
If you installed with the global option, run the command *sitespeed.io* else run the script *bin/sitespeed.js*.  In the examples, we will use the globally installed version.

You can analyze a site either by crawling or by feeding sitespeed.io with a list of URLs you want to analyze.

### Analyze by URLs
The simplest way to run sitespeed.io is to give it a URL:

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io
~~~

If you want to test multiple URLs, just feed them:

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io https://www.sitespeed.io/documentation/
~~~

You can also use a plain text file with one URL on each line. Create a file called urls.txt:

~~~
http://www.yoursite.com/path/
http://www.yoursite.com/my/really/important/page/
http://www.yoursite.com/where/we/are/
~~~

Another feature of the plain text file is you can add aliases to the urls.txt file after each URL. To do this, add a non-spaced string after each URL that you would like to alias:

~~~
http://www.yoursite.com/path/
http://www.yoursite.com/my/really/important/page/ Important_Page
http://www.yoursite.com/where/we/are/ Page2
~~~
*Note: Spaces are used to delimit between the URL and the alias, which is why the alias cannot contain one.*

Aliases are great in combination with sending metrics to a TSDB (such as Graphite) for shortening the key sent, to make them more user friendly and readable.

And run it:

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io urls.txt
~~~

### Analyze by crawling

If you want to find pages that are not so performant it's a good idea to crawl. Sitespeed.io will start with the URL and fetch all links on that page and continue to dig deeper into the site structure. You can choose how deep to crawl (1=only one page, 2=include links from first page, etc.):

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io -d 2
~~~

### How many runs per URL?
When collecting timing metrics, it's good to test the URL more than one time (default is three times). You can configure how many runs like this (five runs):

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io -n 5
~~~

### Choose browser
Choose which browser to use (default is Chrome):

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io -b firefox
~~~

### Connectivity

You should throttle the connection when you are fetching metrics. The best way to do that is to use Docker and add a network to your Docker container:

~~~bash
docker network create --driver bridge --subnet=192.168.34.0/24 --gateway=192.168.34.10 --opt "com.docker.network.bridge.name"="docker2" cable
tc qdisc add dev docker2 root handle 1: htb default 12
tc class add dev docker2 parent 1:1 classid 1:12 htb rate 5mbit ceil 5mbit
tc qdisc add dev docker2 parent 1:12 netem delay 28ms
~~~

And then when you run your Docker container, add <code>--network cable</code> to your Docker setup to use that network. You can also set the connectivity engine to external <code>--browsertime.connectivity.engine external</code>. A full example:

~~~bash
$ docker run --privileged --shm-size=1g --network cable --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --browsertime.connectivity.engine external -c cable https://www.sitespeed.io/
~~~

Then you will use the network setup in your Docker network bridge; call it "cable" so that key will be used in HTML/Graphite, and set the engine to external so that no connectivity is set inside the Docker container.

Read more [here]({{site.baseurl}}/documentation/sitespeed.io/browsers/#change-connectivity) about how to set different connectivities.

### Viewport/user agent and mobile

You can set the viewport & user agent, so you can fake testing a site as a mobile device.

The simplest way is to just add <code>--mobile</code> as a parameter. The viewport will be set to 360x640 and the user agent will be Iphone6. If you use Chrome it will use the preset Apple iPhone 6 device.

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io --mobile
~~~

You can also set a specific viewport and user agent:

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io --browsertime.viewPort 400x400 --browsertime.userAgent "UCWEB/2.0 (MIDP-2.0; U; Adr 4.4.4; en-US; XT1022) U2/1.0.0 UCBrowser/10.6.0.706 U2/1.0.0 Mobile"
~~~

Mobile testing is always best on actual mobile devices. You can [test on Android phones](../mobile-phones/) using sitespeed.io.
{: .note .note-warning}

### Connectivity

You can fake the connectivity for the browser. By default, we expect an external tool to handle the connectivity, but you can also set the connectivity engine to [tc](http://lartc.org/manpages/tc.txt) or [TSProxy](https://github.com/WPO-Foundation/tsproxy). However, you need Python 2.7 for that to work, if either of those works better for you.

Setting the connectivity to cable:

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -c cable https://www.sitespeed.io/
~~~

Changing the engine type to tc:

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -c cable --browsertime.connectivity.engine tc https://www.sitespeed.io/
~~~

### Speed Index and video
In 4.1 we released support for recording a video of the browser screen and use that to calculate visual metrics like Speed Index. This is one of the main benefits for using our Docker images, as it makes for an easy setup. Without Docker, you would need to install all these [dependencies](https://github.com/WPO-Foundation/visualmetrics) first.

If you only care about Speed Index and related metrics (first visual change etc.,) you can run it like this:

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --speedIndex https://www.sitespeed.io/
~~~

Sitespeed.io will then analyze the video and then remove it. If you want to keep the video, add the video flag (and you can see it in the Browsertime tab):

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --speedIndex --video https://www.sitespeed.io/
~~~


### First party vs third party
You can categorize requests as first or third parties by adding a regexp. You will then get the size & requests by type both in HTML and sent to Graphite.

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --firstParty ".ryanair.com" https://www.ryanair.com/us/en/
~~~

### Output folder or where to store the result
You can change where you want the data to be stored by setting the <code>--outputFolder</code> parameter. That is good in scenarios where you want to change the default behavior and put the output in a specific location:

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --outputFolder /my/folder ".ryanair.com" https://www.sitespeed.io/
~~~

### Configuration as JSON

You can keep all your configuration in a JSON file and then pass it on to sitespeed, and override with CLI parameters.

Create a config file and call it config.json:

~~~
{
  "browsertime": {
    "iterations": 5,
    "browser": "chrome"
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

Then, run it like this:

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --config config.json https://www.sitespeed.io
~~~

If you want to override and run the same configuration but using Firefox, you just override with the CLI parameter:

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --config config.json -b firefox https://www.sitespeed.io
~~~

The CLI will always override a JSON config.

## Advanced

### Slack
You can send the result of a run to Slack. First, set up a webhook in the Slack API (https://<your team>.slack.com/apps/manage/custom-integrations) and then configure it:

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/ --slack.hookUrl https://hooks.slack.com/services/YOUR/HOOK/URL
~~~

You can choose to send just a summary (the summary for all runs), individual runs (with URL), only errors, or everything, by choosing the respective <code>slack.type</code>.

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/ --slack.hookUrl https://hooks.slack.com/services/YOUR/HOOK/URL --slack.type summary
~~~

![Slack]({{site.baseurl}}/img/slack.png)
{: .img-thumbnail}

### Log in the user
We have added a [special section](../prepostscript) for that!
