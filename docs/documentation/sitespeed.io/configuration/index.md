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
{% include_relative config.md %}
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
