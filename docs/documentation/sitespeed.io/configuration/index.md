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

* Let's place the TOC here
{:toc}

# Configuration
Sitespeed.io is highly configurable, let's check it out!

## The options
You have the following options when running sitespeed.io within docker (run <code>docker run sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --help</code> to get the list on your command line):

~~~help
{% include_relative config.md %}
~~~


## The basics

You can analyse a site either by crawling or by feeding sitespeed.io with a list of URLs you want to analyse.

### Analyse by URLs
The simplest way to run sitespeed.io is to give it a URL:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io
~~~

If you want to test multiple URLs, then just add them. Each page will be tested with a new browser session, browser cache cleared between each URL.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io https://www.sitespeed.io/documentation/
~~~


You can also use a plain text file with one URL on each line. Create a file called urls.txt:

~~~
http://www.yoursite.com/path/
http://www.yoursite.com/my/really/important/page/
http://www.yoursite.com/where/we/are/
~~~

Another feature of the plain text file is you can add aliases to the urls.txt file after each URL. To do this, add a non-spaced string after each URL that you would like to alias:

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

You can also add alias directly from the command line. Make yore that you pass on the same amount of alias and URLs.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --urlAlias doc https://www.sitespeed.io/documumentation/
~~~

Pass on multiple --urlAlias for multiple alias/URLs.

If you want to test multiple URLs in a sequence (where the browser cache is not cleared) use --multi:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --multi https://www.sitespeed.io https://www.sitespeed.io/documentation/
~~~

You can also add an group alias to the plain text file that replaces the domain part of the URL in the time series database. To do this, add a non-spaced string after each URL alias (this only works if you already have an alias for the URL):

~~~
http://www.yoursite.com/ Start_page Group1
http://www.yoursite.com/my/really/important/page/ Important_Page Group1
http://www.test.com/where/we/are/ We_are Group2
~~~

If you wanna do more complicated things like log in the user, add items to a cart etc, checkout [scripting](../scripting/).


### Analyse by crawling

If you want to find pages that are not so performant it's a good idea to crawl. Sitespeed.io will start with the URL and fetch all links on that page and continue to dig deeper into the site structure. You can choose how deep to crawl (1=only one page, 2=include links from first page, etc.):

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io -d 2
~~~

### How many runs per URL?
When collecting timing metrics, it's good to test the URL more than one time (default is three times). You can configure how many runs like this (five runs):

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io -n 5
~~~

### Choose browser
Choose which browser to use (default is Chrome):

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io -b firefox
~~~

### Connectivity

You should throttle the connection when you are fetching metrics. We have a [special section]({{site.baseurl}}/documentation/sitespeed.io/connectivity) on how you emulate connectivity for real users. Make sure you read that parts of the documentation!

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
In 4.1 we released support for recording a video of the browser screen and use that to calculate visual metrics like Speed Index. This is one of the main benefits for using our Docker images, as it makes for an easy setup. Without Docker, you would need to install all the [dependencies](https://github.com/WPO-Foundation/visualmetrics).

In 6.0 video and Visual Metrics is turned on by default, and if you want to turn them off you do like this:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --visualMetrics false https://www.sitespeed.io/
~~~


~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --visualMetrics false --video false https://www.sitespeed.io/
~~~


### First party vs third party
By default we will categorise the current main domain as first party and the rest as a third party. And you probably wanna categorise requests yourself as first or third parties by adding a regex.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --firstParty ".ryanair.com" https://www.ryanair.com/us/en/
~~~

This is a JavaScript regex and if you need help you should test it out at [https://regexr.com](https://regexr.com) or [cyrilex](https://extendsclass.com/regex-tester.html) to see that it will match.

### Output folder or where to store the result
You can change where you want the data to be stored by setting the <code>--outputFolder</code> parameter. That is good in scenarios where you want to change the default behaviour and put the output in a specific location:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --outputFolder /my/folder https://www.sitespeed.io/
~~~

### Configuration as JSON

You can keep all your configuration in a JSON file and then pass it on to sitespeed.io, and override with CLI parameters. We use [yargs](https://github.com/yargs/yargs) for the CLI and configuration.

The CLI parameters can easily be converted to a JSON, using the full name of the cli name. A simple example is when you configure which browser to use. The shorthand name is `-b` but if you check the help (`--help`) you can see that the full name is `browsertime.browser`. That means that `-b` and `--browsertime.browser` is the same. And in your JSON configuration that looks like this:

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

If you have a parameter that you want to repeat, for example setting multiple request headers, the field needs to be an JSON array. 

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
