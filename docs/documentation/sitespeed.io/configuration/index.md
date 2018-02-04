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
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io
~~~

If you want to test multiple URLs, just feed them:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io https://www.sitespeed.io/documentation/
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
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} urls.txt
~~~

### Analyse by crawling

If you want to find pages that are not so performant it's a good idea to crawl. Sitespeed.io will start with the URL and fetch all links on that page and continue to dig deeper into the site structure. You can choose how deep to crawl (1=only one page, 2=include links from first page, etc.):

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io -d 2
~~~

### How many runs per URL?
When collecting timing metrics, it's good to test the URL more than one time (default is three times). You can configure how many runs like this (five runs):

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io -n 5
~~~

### Choose browser
Choose which browser to use (default is Chrome):

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io -b firefox
~~~

### Connectivity

You should throttle the connection when you are fetching metrics. We have a [special section]({{site.baseurl}}/documentation/sitespeed.io/connectivity) on how you emulate connectivity for real users.

### Viewport/user agent and mobile

You can set the viewport & user agent, so you can fake testing a site as a mobile device.

The simplest way is to just add <code>--mobile</code> as a parameter. The viewport will be set to 360x640 and the user agent will be Iphone6. If you use Chrome it will use the preset Apple iPhone 6 device.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --mobile
~~~

You can also set a specific viewport and user agent:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --browsertime.viewPort 400x400 --browsertime.userAgent "UCWEB/2.0 (MIDP-2.0; U; Adr 4.4.4; en-US; XT1022) U2/1.0.0 UCBrowser/10.6.0.706 U2/1.0.0 Mobile"
~~~

Mobile testing is always best on actual mobile devices. You can [test on Android phones](../mobile-phones/) using sitespeed.io.
{: .note .note-warning}

### Speed Index and video
In 4.1 we released support for recording a video of the browser screen and use that to calculate visual metrics like Speed Index. This is one of the main benefits for using our Docker images, as it makes for an easy setup. Without Docker, you would need to install all these [dependencies](https://github.com/WPO-Foundation/visualmetrics) first.

In 6.0 video and Speed Index is turned on by default, and if you want to turn them off you do like this:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --speedIndex false https://www.sitespeed.io/
~~~


~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --speedIndex false --video false https://www.sitespeed.io/
~~~


### First party vs third party
You can categorise requests as first or third parties by adding a regexp. You will then get the size & requests by type both in HTML and sent to Graphite.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --firstParty ".ryanair.com" https://www.ryanair.com/us/en/
~~~

### Output folder or where to store the result
You can change where you want the data to be stored by setting the <code>--outputFolder</code> parameter. That is good in scenarios where you want to change the default behaviour and put the output in a specific location:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --outputFolder /my/folder ".ryanair.com" https://www.sitespeed.io/
~~~

### Configuration as JSON

You can keep all your configuration in a JSON file and then pass it on to sitespeed.io, and override with CLI parameters.

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
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --config config.json https://www.sitespeed.io
~~~

If you want to override and run the same configuration but using Firefox, you just override with the CLI parameter:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --config config.json -b firefox https://www.sitespeed.io
~~~

The CLI will always override the JSON config.

## Advanced

### Slack
You can send the result of a run to Slack. First, set up a webhook in the Slack API (https://<your team>.slack.com/apps/manage/custom-integrations) and then configure it:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --slack.hookUrl https://hooks.slack.com/services/YOUR/HOOK/URL
~~~

You can choose to send just a summary (the summary for all runs), individual runs (with URL), only errors, or everything, by choosing the respective <code>slack.type</code>.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --slack.hookUrl https://hooks.slack.com/services/YOUR/HOOK/URL --slack.type summary
~~~

![Slack]({{site.baseurl}}/img/slack.png)
{: .img-thumbnail-center}

### Log in the user
We have added a [special section](../prepostscript) for that!
