---
layout: default
title: Getting Started
description: Introduction for sitespeed.io.
keywords: introduction, getting started, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Introduction for sitespeed.io.
---
[Documentation](/documentation/sitespeed.io/) / Getting Started

# Getting Started
{:.no_toc}

* Let's place the TOC here
{:toc}

Sitespeed.io is an Open Source tool that helps you measuring the performance of your website. You can [install](../installation/) it using [npm](https://www.npmjs.org/)/[yarn](https://yarnpkg.com/)/[Docker](https://www.docker.com/).

You can test your site against web-performance best-practice rules (using the [Coach]({{site.baseurl}}/documentation/coach/)) or collect timing metrics from Chrome/Firefox (using [Browsertime]({{site.baseurl}}/documentation/browsertime/)) and get a report on how your site is performing. You can generate a HTML report (check out the [examples](/examples/) section to see what it looks like). You can even use the Graphite plugin and build graphs with Grafana; check out our example site [https://dashboard.sitespeed.io](https://dashboard.sitespeed.io). If that isn't enough, you can build your own plugin that handles all the metrics that are collected in any way you can imagine.

In October 2016 we released 4.0 (sitespeed.io is 4 years old). One of the main goals with 4.0 was to make it easier for people to contribute and use. We have already had more contributions than ever before. With 3.X we got the following feedback in the [Toolsday](http://www.toolsday.io/) podcast:

<blockquote cite="http://www.toolsday.io/episodes/performance.html">
SpeedCurve has a really low barrier of entry ... it's a bit of a evolution maybe ... if you need something more advanced look into sitespeed.io"
 <span>By Taylor Jones (IBM) on the podcast Toolsday http://www.toolsday.io/episodes/performance.html</span>
</blockquote>

Note: SpeedCurve is a paid service built on top on the Open Source tool  [WebPageTest](http://www.webpagetest.org/). If you love WebPageTest (we do!) you can [drive it](../webpagetest/) using sitespeed.io and collect the metrics and use it side by side with all the sitespeed.io metrics.

To get started you need either [NodeJS](https://nodejs.org/en/download/) ([Linux](https://github.com/creationix/nvm)) and  [npm](https://github.com/npm/npm)/[yarn](https://yarnpkg.com/)) or [Docker](https://docs.docker.com/engine/installation/).

You also need [Firefox](https://www.mozilla.org/en-US/firefox/new/) and/or [Chrome](https://www.google.com/chrome/).

We prefer and highly recommend Docker, since all the above requirements are handled for you, plus more!

If you've installed the prerequisites, head over to the [installation](../installation/) section and get going!
