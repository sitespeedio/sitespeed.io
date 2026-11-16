---
layout: default
title: How to configure sitespeed.io
description: In the cli just run "sitespeed.io --help" to get the configuration options.
keywords: configuration, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Configuration for sitespeed.io.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Configuration

# Configuration
{:.no_toc}

{:toc}

Sitespeed.io is highly configurable, let's check it out!

## Good options to get started

Sitespeed.io has hundreds of options, but in everyday use only a handful come up again and again. Here are good ones to know when you start out, with the reason you would reach for each. Everything else is in the [full options list](#the-options) further down.

| Option | What it does |
| --- | --- |
| `-n`, `--iterations` | How many times to load the page. Metrics are reported as the median, so more runs give a more stable number. The default is 3, bump it to 5 or more when a page is noisy. |
| `-b`, `--browser` | Which browser to drive: `chrome` (default), `firefox`, `edge` or `safari`. |
| `-c`, `--connectivity.profile` | Throttle the connection to a realistic network (`4g`, `3g`, `3gfast`, `cable` and more). Always throttle when you compare numbers over time, otherwise your metrics track your test machine's bandwidth instead of your users'. See the [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity/). |
| `--cpu` | Turn on the CPU main-thread timeline and long tasks in Chrome. This is what fills the CPU and Rendering tabs of the HTML report. |
| `--video`, `--visualMetrics` | Record a video of the load and calculate visual metrics like Speed Index, First Visual Change and Last Visual Change. Both are on by default in the Docker image. |
| `--enableProfileRun` | Add one extra run dedicated to the trace and profile so the tracing overhead never lands in your measured metrics. Reach for it whenever you turn on `--cpu`, and it is especially useful when you run sitespeed.io as a monitoring tool, where clean, comparable metrics matter most. |
| `--axe.enable` | Run an [axe]({{site.baseurl}}/documentation/sitespeed.io/axe/) accessibility audit on every page and add the findings to the report. It adds a little time to each test. |
| `--crux.key` | Add a [CrUX]({{site.baseurl}}/documentation/sitespeed.io/crux/) API key to pull real-user field data from the Chrome User Experience Report alongside your own lab metrics. |
| `--mobile` | Emulate a phone (Chrome uses a Moto G4 profile). Pair it with `-c 3g` for a slow-phone test. |
| `-d`, `--depth` | Crawl depth. `1` tests only the URL you give it, `2` also follows the links it finds, and so on. |
| `--multi` | Walk a user journey: test several URLs in one browser session with the cache kept warm between them. For real interactions like logging in or clicking through a flow, write a [script]({{site.baseurl}}/documentation/sitespeed.io/scripting/) instead. |
| `--outputFolder` | Where to write the result. Handy when you want each run in its own directory. |
| `-o`, `--open` | Open the HTML report in your default browser as soon as the run finishes (local runs, not Docker). |
| `--config` | Read all your options from a [JSON config file](#configuration-as-json) instead of a long command line. The CLI still overrides the file. |

When you are debugging a single slow page and want the fullest report, this combination is a good default:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --cpu --enableProfileRun --video --visualMetrics -c 4g
~~~

## The options
You have the following options when running sitespeed.io within Docker (run <code>docker run sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --help-all</code> to get the full list on your command line):

~~~help
{% include_relative "config.md" %}
~~~

### Browsing the help by topic

Sitespeed.io has hundreds of options across many areas (browsers, video, Graphite, S3, scripting, ...). To make the CLI easier to navigate, <code>--help</code> is split into topics:

* <code>sitespeed.io --help</code> shows a short, curated set of the most common options together with the list of available topics.
* <code>sitespeed.io --help &lt;topic&gt;</code> shows only the options belonging to that topic. For example <code>--help chrome</code>, <code>--help firefox</code>, <code>--help graphite</code> or <code>--help video</code>.
* <code>sitespeed.io --help-all</code> prints the complete reference (the same content as in the box above) and is what scripts and CI jobs should use if they want every option.

The available topics are: <code>browser</code>, <code>video</code>, <code>firefox</code>, <code>chrome</code>, <code>edge</code>, <code>safari</code>, <code>android</code>, <code>screenshot</code>, <code>graphite</code>, <code>grafana</code>, <code>html</code>, <code>slack</code>, <code>s3</code>, <code>gcs</code>, <code>scp</code>, <code>rsync</code>, <code>matrix</code>, <code>budget</code>, <code>crux</code>, <code>sustainable</code>, <code>crawler</code>, <code>metrics</code>, <code>compare</code>, <code>api</code>, <code>plugins</code> and <code>text</code>.

To see only the Chrome options, for example:

~~~bash
docker run --rm sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --help chrome
~~~


## The basics

You can analyse a site either by crawling or by feeding sitespeed.io a list of URLs you want to analyse.

### Analyse by URLs
The simplest way to run sitespeed.io is to give it a URL:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io
~~~

If you want to test multiple URLs, just add them. Each page will be tested with a new browser session, with the browser cache cleared between URLs.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io https://www.sitespeed.io/documentation/
~~~


You can also use a plain text file with one URL on each line. Create a file called urls.txt:

~~~
http://www.yoursite.com/path/
http://www.yoursite.com/my/really/important/page/
http://www.yoursite.com/where/we/are/
~~~

Another feature of the plain text file is that you can add aliases after each URL. To do this, add a non-spaced string after each URL that you would like to alias:

~~~
http://www.yoursite.com/ Start_page
http://www.yoursite.com/my/really/important/page/ Important_Page
http://www.yoursite.com/where/we/are/ We_are
~~~
*Note: Spaces are used to delimit between the URL and the alias, which is why the alias cannot contain one.*

Aliases are great in combination with sending metrics to a TSDB (such as Graphite) for shortening the key sent, to make them more user friendly and readable.

And run it:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} urls.txt
~~~

You can also add aliases directly from the command line. Make sure you pass the same number of aliases and URLs.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --urlAlias doc https://www.sitespeed.io/documentation/
~~~

Pass multiple --urlAlias for multiple alias/URL pairs.

If you want to test multiple URLs in a sequence (where the browser cache is not cleared) use --multi:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --multi https://www.sitespeed.io https://www.sitespeed.io/documentation/
~~~

You can also add a group alias to the plain text file that replaces the domain part of the URL in the time series database. To do this, add a non-spaced string after each URL alias (this only works if you already have an alias for the URL):

~~~
http://www.yoursite.com/ Start_page Group1
http://www.yoursite.com/my/really/important/page/ Important_Page Group1
http://www.test.com/where/we/are/ We_are Group2
~~~

If you want to do more complicated things like logging in the user or adding items to a cart, check out [scripting](../scripting/).


### Analyse by crawling

If you want to find pages that are not so performant, it's a good idea to crawl. Sitespeed.io will start with the URL, fetch all links on that page, and continue to dig deeper into the site structure. You can choose how deep to crawl (1=only one page, 2=include links from the first page, etc.):

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io -d 2
~~~

### How many runs per URL?
When collecting timing metrics, it's good to test the URL more than once (default is three times). You can configure how many runs like this (five runs):

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io -n 5
~~~

### Choose browser
Choose which browser to use (default is Chrome):

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io -b firefox
~~~

### Connectivity

You should throttle the connection when you are fetching metrics. We have a [special section]({{site.baseurl}}/documentation/sitespeed.io/connectivity) on how to emulate connectivity for real users. Make sure you read that part of the documentation!

### Viewport/user agent and mobile

You can set the viewport & user agent, so you can fake testing a site as a mobile device.

The simplest way is to just add <code>--mobile</code> as a parameter. If you use Chrome it will use the preset Moto G4 device.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --mobile
~~~

You can also set a specific viewport and user agent:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --browsertime.viewPort 400x400 --browsertime.userAgent "UCWEB/2.0 (MIDP-2.0; U; Adr 4.4.4; en-US; XT1022) U2/1.0.0 UCBrowser/10.6.0.706 U2/1.0.0 Mobile"
~~~

Mobile testing is always best on actual mobile devices. You can [test on Android phones](../mobile-phones/) using sitespeed.io.
{: .note .note-warning}

### Visual metrics and video
Sitespeed.io records a video of the browser screen and uses that to calculate visual metrics like Speed Index. This is one of the main benefits of using our Docker images, since it makes for an easy setup. Without Docker, you would need to install all the [dependencies](https://github.com/WPO-Foundation/visualmetrics).

Video and Visual Metrics are on by default. To turn them off:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --visualMetrics false https://www.sitespeed.io/
~~~


~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --visualMetrics false --video false https://www.sitespeed.io/
~~~


### First party vs third party
By default we categorise the current main domain as first party and everything else as third party. You probably want to categorise requests yourself as first or third party by adding a regex.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --firstParty ".ryanair.com" https://www.ryanair.com/us/en/
~~~

This is a JavaScript regex and if you need help you should test it out at [https://regexr.com](https://regexr.com) to see that it will match.

### Output folder or where to store the result
You can change where the data is stored by setting the <code>--outputFolder</code> parameter. That is useful when you want to put the output in a specific location:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --outputFolder /my/folder https://www.sitespeed.io/
~~~

### Configuration as JSON

You can keep all your configuration in a JSON file and then pass it on to sitespeed.io, and override with CLI parameters. We use [yargs](https://github.com/yargs/yargs) for the CLI and configuration.

The CLI parameters can easily be converted to JSON using the full name of the CLI option. A simple example is when you configure which browser to use. The shorthand name is `-b` but if you check the help (`--help`) you can see that the full name is `browsertime.browser`. That means `-b` and `--browsertime.browser` are the same. In your JSON configuration that looks like this:

~~~json
{
  "browsertime": {
    "browser": "chrome"
  }
}
~~~


A more complex example: Create a config file and call it config.json:

~~~json
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
    "remove": ["html"]
  },
  "utc": true
}
~~~

Then, run it like this:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --config config.json https://www.sitespeed.io
~~~

If you want to override and run the same configuration but using Firefox, you just override with the CLI parameter:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --config config.json -b firefox https://www.sitespeed.io
~~~

The CLI will always override the JSON config.

You can also extend another JSON config file. The path needs to be absolute. We recommend that you use a configuration file because that makes things easier.

~~~json
{
  "extends":"/path/to/config.json",
  "browsertime": {
    "iterations": 5,
    "browser": "chrome"
  },
  "graphite": {
    "host": "my.graphite.host",
    "namespace": "sitespeed_io.desktopFirstView"
  },
  "plugins": {
    "remove": ["html"]
  },
  "utc": true
}
~~~

If you have a parameter that you want to repeat, for example setting multiple request headers, the field needs to be a JSON array.

~~~json
{
  "browsertime": {
    "requestheader": "key:value"
  }
}
~~~

~~~json
{
  "browsertime": {
    "requestheader": ["key:value", "key2:value2"]
  }
}
~~~


You can check out [our example configuration](https://github.com/sitespeedio/dashboard.sitespeed.io/tree/main/config) for [dashboard.sitespeed.io](https://dashboard.sitespeed.io). 


## Advanced

### Slack
You can send the result of a run to Slack. First, set up a webhook in the Slack API (https://<your team>.slack.com/apps/manage/custom-integrations) and then configure it:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --slack.hookUrl https://hooks.slack.com/services/YOUR/HOOK/URL
~~~

You can choose to send just a summary (the summary for all runs), individual runs (with URL), only errors, or everything, by choosing the respective <code>slack.type</code>.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --slack.hookUrl https://hooks.slack.com/services/YOUR/HOOK/URL --slack.type summary
~~~

![Slack]({{site.baseurl}}/img/slack.png)
{: .img-thumbnail-center}

### Log in the user
We have added a [special section](../scripting) for that!
