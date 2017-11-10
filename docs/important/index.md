---
layout: default
title: Important information on how we work in sitespeed.io and related projects.
description: Start here if you are new to sitespeed.io or web performance testing.
keywords: introduction, getting started, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Introduction for sitespeed.io.
---

# Important
{:.no_toc}

* Let's place the TOC here
{:toc}

## How we work
A couple of important things to know about our projects:

 - We always keep a CHANGELOG in the root of directory of the project. [Here's](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md) the one we have for sitespeed.io. We always write down the changes we do in the project.
 - We always use [semantic versioning](http://semver.org/) when we do a release.
 - We try to release things as soon as the functionality is tested and ready (we release often). For sitespeed.io we try to do one major release each year.
 - We highly rely on testing on Travic-ci and our [own automatic testing](https://www.sitespeed.io/releasing-with-confidence/).

## Privacy

We take your privacy really serious: Our [documentation site](https://www.sitespeed.io/), our [dashboard](https://dashboard.sitespeed.io) and our [compare tool](https://dashboard.sitespeed.io) do not use any tracking software at all (no Google Analytics or any other tracking software). None of the sitespeed.io tools call home.

But beware: Chrome and Firefox can call home (we know for fact that Chrome do). We would love PRs and tips how to make sure browsers don't call home when you run your tests.

## Code of Conduct
Please follow our [Code Of Conduct](https://github.com/sitespeedio/sitespeed.io/blob/master/CODE_OF_CONDUCT.md).

## Open Source
We release our software under the [MIT License](https://github.com/sitespeedio/sitespeed.io/blob/master/LICENSE).

## Sustainability
We've been releasing sitespeed.io since 2012 and we plan to continue do it. We have't

## We wants to help you
We really (yes I mean really) focus on helping you as a user. If you have a problem please [create an issue](https://github.com/sitespeedio/sitespeed.io/issues/new) or talk to us on our [Slack channel](https://sitespeedio.herokuapp.com/).

If there's a common problem or a bug and we talk about it on Slack we will kindly ask you to create an issue. Issues are great because it helps people that has the same problem.

It sometimes happens that we get get contacted about issues privately via email or DM on Twitter. Please don't do that, we want to keep everything as open as possible. Only contact us if we ask you to or if you have an important security issue.

## Who uses sitespeed.io

We had plus one million downloads so far and still counting. We know that mul

With 3.X we got the following feedback in the [Toolsday](http://www.toolsday.io/) podcast:

<blockquote cite="http://www.toolsday.io/episodes/performance.html">
SpeedCurve has a really low barrier of entry ... it's a bit of a evolution maybe ... if you need something more advanced look into sitespeed.io"
 <span>By Taylor Jones (IBM) on the podcast Toolsday http://www.toolsday.io/episodes/performance.html</span>
</blockquote>

Note: SpeedCurve is a paid service built on top on the Open Source tool  [WebPageTest](http://www.webpagetest.org/). If you love WebPageTest (we do!) you can [drive it](/documentation/sitespeedio/webpagetest/) using sitespeed.io and collect the metrics and use it side by side with all the sitespeed.io metrics.
