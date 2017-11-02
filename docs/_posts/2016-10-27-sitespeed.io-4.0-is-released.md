---
layout: default
title: Welcome sitespeed.io 4.0
description: Finally sitespeed.io 4.0 is here!
authorimage: /img/robot-head.png
intro: After more than a full year of hard work from us (Peter/Tobias/Jonathan and contributors) we finally released 4.0. We did a complete rewrite and also created two new performance tools during that year.
keywords: sitespeed.io, sitespeed, site, speed, webperf, performance, web, wpo
nav: blog
---

# Sitespeed.io 4.0

<img src="{{site.baseurl}}/img/celebrate.png" class="pull-right img-big" alt="It's time to celebrate 4.0 is here" width="200" height="200">

Yes we have finally released 4.0. We ([Peter](https://twitter.com/soulislove)/[Tobias](https://twitter.com/tobiaslidskog)/[Jonathan](https://twitter.com/beenanner) and [contributors](https://github.com/sitespeedio/sitespeed.io/blob/master/CONTRIBUTORS.md)) have been working extremely hard the last year to make it happen. Actually we started to think about the new version when we released 3.0 December 2014. So it's almost 2 years in the making. It has been a long ride.

Before reading, you should just try it out:

~~~bash
docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/
~~~

Or using npm:


~~~bash
npm install -g sitespeed.io
~~~

## Background

When we started 4.0 there was a couple of things that we wanted to fix:

 * We wanted to stop using [YSlow](http://yslow.org/). Yes we know that many people love and still use Yslow, but the problem is that the rules aren't relevant any more. They haven't been for the last +5 years at least (that's why we used our own modified version in 3.x). We wanted something new and modern that could stand the test of time.

 * We want to move to only test in real browsers which support HTTP/2. In 3.x we used [PhantomJS](http://phantomjs.org/) to run the YSlow tests. That made it a bit painful for us since we had the same limits as PhantomJS (no HTTP/2, incorrect assets sizes etc). To make one thing clear: We love PhantomJS and what [Ariya](https://twitter.com/AriyaHidayat) and contributors have done with it. With that said we still decided to move away from PhantomJS and use only real browsers.

 * We wanted to generate a better [HAR](http://www.softwareishard.com/blog/har-12-spec/) file. In 3.X we used to use [BrowserMobProxy](https://github.com/lightbody/browsermob-proxy) which does not support HTTP/2, it would modified the response headers, and you need Java to run it.

 * We want more contributors. 3.X was the first thing we built in NodeJS and we could have surely made the code more readable and easier to understand. We also wanted a better structure to make it easy for people to add their own plugins.

 * Testing a page as a logged in user. The number one feature requested by users in sitespeed.io was to be able to login a user and test the performance as that logged in user.

 * Don't overload Graphite with metrics. One of the things I (Peter) did wrong in 3.x was send all the metrics we collected to Graphite. Unfortunately Graphite got overloaded. Instead in 4.0 we decided to pick the most important one and make it possible for the user to add/remove the ones they want.

There was a lot of more that we wanted to fix, but those where the most important ones we wanted to share.

# What we have accomplished in the last year
We released four new Open Source performance tools. Yep four. Lets talk about them and then get into what we've done with sitespeed.io.

## The coach
<img src="{{site.baseurl}}/img/logos/coach.png" class="pull-right img-big" alt="I'm the coach" width="168" height="196">
YSlow is dead, long live the Coach! The coach helps you find performance problems on your page and gives you advice of what you can do better. We use the coach in sitespeed.io, but what's extra cool is that it can be used by any tool.

The coach gives you advice on how to make your page faster. The coach aims to NEVER give you bad advice. If the world changes, the coach changes. No more wrong rules, instead the right advice. :)

The coach knows about more than just performance: Accessibility and web best practice are other things that the coach can help you with. We need you to help us make that part better (we are performance nerds).

What's really cool with the coach is that you can integrate it into your own web performance tool. It's easy: your tool only need to be able to run JavaScript in the browser and produce a HAR file. If your tool doesn't handle that you can use the built-in functionality of the coach to run the browser.


## PageXray
<img src="{{site.baseurl}}/img/logos/pagexray.png" class="pull-right img-big" alt="PageXray" width="182" height="100">

Full respect for the HAR format, but it is not readable for a human eye. We wanted to take a HAR file and convert it to something that says something about a page, that's make it easier for tools and human to understand. We ended up with PageXray.

If you have a HAR, run it through the xray and you will get a simple JSON structure of the page where you can see things such as number of assets per content type, transfer/contentSizes, the redirect chain and much more. [Check it out](https://github.com/sitespeedio/pagexray)!


## Browsertime
<img src="{{site.baseurl}}/img/logos/browsertime.png" class="pull-right img-big" alt="Browsertime logo" width="180" height="158">

Browsertime has been around since sitespeed.io 2.0, but now it has been totally rewritten to get rid of the async hell. :) Browsertime uses Selenium to start a browser, go to a URL, executes Javascript to collect metrics, and  creates a HAR file.

The new version is still in 1.0 beta and soon we hope to release the final version.

# sitespeed.io 4.0
Lets talk about all the new and shiny things in 4.0. The new version uses the Coach, PageXray and Browsertime. Together we get:

## Plugins
Everything in the new version is a plugin! You can add/remove/create your own plugin. A plugin can run additional tests on a URL or handle the result, like storing it to a database. You can also publish your plugins to npm. Just let us know about your plugin, so we can tell the world.

## HTTP/2
YES we finally support HTTP/2! The coach will give different advice if your page is using http/1 or 2. We have nothing in the way (ready proxy) that messes with the connection between the browser and the server.

## HAR
We have a super great HAR files. For Firefox we use the [HAR Export Trigger](https://github.com/firebug/har-export-trigger) to generate the HAR file inside of Firefox.

To get the HAR from Chrome we parses the event log to generate it. Tobias spent some time to make that happen. :)

## Pre/post-scripts a.k.a login
Are you prepared? In the new version you can login your user using a Selenium script! Yes that is true. You customize your own script to run pre and post testing a URL. [Check out]({{site.baseurl}}/documentation/sitespeed.io/prepostscript/) the documentation.

## Mobile phone support
You can [drive your Android phone and test pages]({{site.baseurl}}/documentation/sitespeed.io/mobile-phones/) using Chrome. You will get an HAR file and it will run all the javascript and collect the metrics.

## Log the requests and values
We already got some really cool PRs for 4.0. [Moos](https://github.com/moos) added support in Browsertime to log number of requests and some timing metrics. When you sit down and go through the logs from sitespeed.io you will see log entries like:

~~~bash
[2016-10-24 15:43:11] 246 requests, 2068.02 kb, firstPaint: 5.57s (±0.34), DOMContentLoaded: 7.33s (±0.34), Load: 25.28s (±1.), rumSpeedIndex: 8.59s (±0.31) (5 runs)
~~~

If you are used to just browsing through the logs, this adds some real extra value.

## Graphite keys - generic dashboards
We have changed the key structure of the keys in Graphite. Yes that means you will need to redo your dashboards, BUT we did it because we wanted to support generic dashboards. You can share dashboards between project/sites. We also created a couple of default ones for you.

## Dashboard in 2 seconds
Well almost 2 seconds :) Using our new Docker compose script and ready made dashboards you can get it up and running as fast as the containers are downloaded. We also worked to get the Graphite key structure re-usable between web sites, so it's easy to share dashboards.

1. Download our new Docker compose file: curl -O https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/docker-compose.yml
2. Run: <code>docker-compose up</code>
3. Run sitespeed: <code> docker-compose run sitespeed.io https://www.sitespeed.io/ --graphite.host=graphite</code>
4. Access the dashboard: http://127.0.0.1:3000

That's all you need. In production you should do some tweaks, read more about that [here]({{site.baseurl}}/documentation/sitespeed.io/performance-dashboard/#production).

## Everything else
There are a lot of new things, just try out 4.0 and you will see. Or go to the [documentation]({{site.baseurl}}/documentation/).

# What's next (missing in 4.0)
We hoped we could solve everything but ... well it didn't work out. A couple of things that we would like to add in the near future:

* Video and SpeedIndex support. It's already implemented in Browsertime, but as an experimental feature. We need to spend time verify and test that the result work in different viewports.

* The server. The server you say? It's a simple server that help you browse and search through the result. Making it possible to link between the result HTML pages and runs within Grafana.

* A meaner and cleaner performance budget. One thing that didn't make it to 4.0 was defining a budget on the last run, having the ability to saying if we are 10% slower, or X % bigger than last run, and breaking the build. Coming Soon!

* More love for the waterfall graph. We use [PerfCascade](https://micmro.github.io/PerfCascade/) to view the HAR and that has worked out extremely well and on top of that we have some ideas to make it even better.

# That bumpy ride
What's been the hardest part doing 4.0? Things that we cannot control or do not plan to make a part of sitespeed.io.

* Finding a good way to shape the traffic between the browser and the server. We ended up using [TSProxy](https://github.com/WPO-Foundation/tsproxy) by Patrick Meenan as default one. You need Python 2.7 for that to work. It's used by the Chrome team and maybe needs some more love on some devices. We will be trying it out for a while :) We also support using tc (Linux traffic control) on supported OS. You can test that in our Docker container running Ubuntu. It "should" work out of the box.

* Firefox. We love Firefox. We love Chrome. And it is important that sitespeed.io works on at least two different browsers. The move from Firefoxdriver to Geckodriver hasn't been smooth and there's been a lot of problems getting things to work. Firefox versions not working with Selenium, some thing broken etc, but we hope that all those problems are over now :)

# sitespeed.io 5.0
Hehe that's going to take some time! We will continue to work on 4.0 for a while to implement the things we missed, fixing bugs, and we would love [your help](https://github.com/sitespeedio/sitespeed.io/blob/master/HELP.md)!

The next couple of days we will be doing cleanup and remove old issues, old projects, and try to get a fresh start.

See you soon in [the issues](https://github.com/sitespeedio/sitespeed.io/issues)!

/Peter, Tobias, and Jonathan
