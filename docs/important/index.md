---
layout: default
title: How we work.
description: Learn more on how we work with privacy, COC and sustainability.
keywords: privacy, code of conduct, open source, sustainability, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Learn more on how we work with privacy, COC and sustainability.
---

# Important
{:.no_toc}

* Let's place the TOC here
{:toc}

## How we work
A couple of important things to know about our projects.

### Changelog and versioning
We always keep a CHANGELOG in the root of directory of the project. [Here's](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md) the one we have for sitespeed.io. We always write down the changes we do in the project.

We always use [semantic versioning](http://semver.org/) when we do a release.

### Privacy
We take your online privacy really serious: Our [documentation site](https://www.sitespeed.io/), our [dashboard](https://dashboard.sitespeed.io) and our [compare tool](https://compare.sitespeed.io) do not use any tracking software at all (no Google Analytics or any other tracking software). We never use tracking software. None of the sitespeed.io tools call home.

But beware: Chrome and Firefox call home. We would love PRs and tips how to make sure browsers don't call home when you run your tests!

### Code of Conduct
When you create issues, do PRs, use our Slack channel or contact us on email, please follow our [Code Of Conduct](https://github.com/sitespeedio/sitespeed.io/blob/master/CODE_OF_CONDUCT.md).

### Open Source
We release our software under the [MIT License](https://github.com/sitespeedio/sitespeed.io/blob/master/LICENSE) or [Apache License 2.0](https://github.com/sitespeedio/browsertime/blob/master/LICENSE). Please respect it and respect our work: We ask you not to change the logo or the contribution to the project. Please do this to pay the respect to the many hours we put down into the project.

### Code and releases
We try to have issues for everything we do (sometimes when there are small technical changes we miss that), we do PRs. Big PRs we always review them within the team.

We try to release things as soon as the functionality is tested and ready (we release often, sometimes a couple of times a week). For sitespeed.io we try to do at least one major release each year.

We highly rely on testing on [Travic-CI](https://travis-ci.org/) and our [own automatic testing](https://www.sitespeed.io/releasing-with-confidence/).

### Planning a new major
Usually we have one big function that we wanna release (for 6.0 that is HTML support for plugins). We then focus on finishing that functionality and try to squeeze in as many other good things as possbile.

## Sustainability
We've been releasing sitespeed.io since 2012 and we plan to continue do it for a long time. At the moment we are a [three member team](../aboutus/) and we love to get more people involved!

We work on the project after hours/weekends and usually that is enough to keep it going. Peter has been taking a couple of weeks off work each year to prepare for larger releases.

We have stayed away from taking money contributions so far (except an award from the [The Swedish Internet Infrastructure Foundation](https://www.iis.se/english/about-iis/)). That helps us to be independent (and that is important for us), but we aren't totally closing the door for money. But we prefer people helping out with PRs instead.

We are pretty confident that how we work and how we keep sitespeed.io going, will make our project outlive many commercial web performance tools (we've been going strong the last 5 years). It's pretty simple: We do this because we love it and we have a mission to make web performance tools free and available for everyone. Commercial products always needs paying customers to keep going.

## We want to help you
We really (yes I mean really) focus on helping you as a user. If you have a problem please [create an issue](https://github.com/sitespeedio/sitespeed.io/issues/new) or talk to us on our [Slack channel](https://sitespeedio.herokuapp.com/).

If there's a common problem or a bug and we talk about it on Slack we will kindly ask you to create an issue. Issues are great because it helps people that has the same problem.

It sometimes happens that we get get contacted about issues privately via email or DM on Twitter. Please don't do that, we want to keep everything as open as possible. Only contact us if we ask you to or if you have an important security issue.

## Who uses sitespeed.io

We had over one million downloads so far and still counting. We have companies in the Alexa top 10 that uses sitespeed.io. We have students at universities that uses our tools for their publications. We have retailers that use it. Even our moms and dads uses it. We are pretty sure sitespeed.io will work out good for you too.

With the old 3.X we got the following feedback in the [Toolsday](http://www.toolsday.io/) podcast:

<blockquote cite="http://www.toolsday.io/episodes/performance.html">
SpeedCurve has a really low barrier of entry ... it's a bit of a evolution maybe ... if you need something more advanced look into sitespeed.io"
 <span>By Taylor Jones (IBM) on the podcast Toolsday http://www.toolsday.io/episodes/performance.html</span>
</blockquote>

Note: SpeedCurve is a paid service built on top on the Open Source tool  [WebPageTest](http://www.webpagetest.org/). If you love WebPageTest (we do!) you can [drive it](../documentation/sitespeed.io/webpagetest/) using sitespeed.io and collect the metrics and use it side by side with all the sitespeed.io metrics.
