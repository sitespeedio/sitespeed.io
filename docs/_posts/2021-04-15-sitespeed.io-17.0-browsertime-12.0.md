---
layout: default
title: sitespeed.io 17.0 and Browsertime 12.0 
description: New updates to sitespeed.io, Coach and Browsertime.
authorimage: /img/aboutus/peter.jpg
intro: New dashboards, new best practices, new privacy advice, new metrics and you can now block third party content when running WebPageReplay and Chrome.
keywords: sitespeed.io, browsertime, webperf
image: https://www.sitespeed.io/img/8bit.png
nav: blog
---

# sitespeed.io 17.0 and Browsertime 12.0 

Woohoo we shipped 17.0.0! There are many changes and you should read through [the full changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md#1700---2021-0415) and focus on the [new best practices](#new-best-practices), [breaking changes](#breaking-changes), [updated dashboards](#updated-dashboards), [block third parties when using WebPageReplay](#block-third-parties-when-using-webpagereplay), [new privacy advice](#new-privacy-advice) and [new delta TTFB metrics](#new-metrics-delta-ttfb).

## New best practices
One of the new things in 17 is the support for one extra key in Graphite: the name of the test. Set a computer friendly name of your test by using `--slug`. Then use the slug in the graphite key by adding `--graphite.addSlugToKey` to your run. When you do that change, should also convert your graphite data and your dashboards. The plan is like this:
* In April 2021 you can convert your data and use the slug. You need to add `--graphite.addSlugToKey true` else you will get a log warning that you miss the slug for your test. All default dashboards in sitespeed.io will use the slug, so to use them you should add that new key and convert your data.
* In September 2021 `--graphite.addSlugToKey true` will be set to default, meaning if you haven't upgraded your Graphite data yet, you need to set `--graphite.addSlugToKey false` to be able to run as before.
* In November 2021 the CLI functionality will disappear and you need upgrade your Graphite metrics when you upgrade sitespeed.io. 

You can read how to upgrade in the [documentation](https://www.sitespeed.io/documentation/sitespeed.io/graphite/#upgrade-to-use-the-test-slug-in-the-namespace).

When you have updated you will add one extra parameter to your test: `--copyLatestFilesToBase`. When you have done all these step you are ready for ... using the new dashboards in Grafana with screenshot and video from last run. This is SUPER useful to be able to fast see what's going on. Checkout what it looks like [here](https://dashboard.sitespeed.io/d/000000064/page-metrics-mobile?orgId=1) and [here](https://dashboard.sitespeed.io/d/d-pdqGBGdse/wikipedia-login?orgId=1). And [read the documentation](https://www.sitespeed.io/documentation/sitespeed.io/performance-dashboard/#how-to-get-the-latest-videoscreenshot-visible-in-grafana) how to make sure you see them in Grafana.

We ship [all new dashboards](https://github.com/sitespeedio/grafana-bootstrap-docker/tree/main/dashboards/graphite) with some extra focus on Google Web Vitals (for sitespeed.io, WebPageTest, Google Page Speed Insights, Lighthouse and CRUX). We understand that these metrics is important for some users so lets focus on them. We also ship a couple new example dashboards for how to setup user journeys. Documentation for those will come soon.

## What to think about when upgrading
You need to do a plan on when you want to upgrade Graphite to be able to use those new dashboards. You can upgrade to 17.0.0 and continue as before but to be able to use the new things in the dashboards you need to [upgrade your Graphite data](https://www.sitespeed.io/documentation/sitespeed.io/graphite/#upgrade-to-use-the-test-slug-in-the-namespace).

## Breaking changes
* We have changed some of the connectivity profiles, you can see the changes [here](https://github.com/sitespeedio/browsertime/pull/1160/files). This means that if you use 3g connectivity using Throttle, your tests will have a faster TTFB than before. If you wanna hold on to the old settings you can do that by adding `--browsertime.legacyConnectivityProfiles true` to your tests.
* If you have a budget using layoutShift that metric has now been renamed to cumulativeLayoutShift.
* Read [the full list](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#changed) of other changes in Browsertime.

## Updated dashboards

We have upgraded all dashboards! To use them you need to follow our new best practices. When that is done, you can upgrade the dashboards.

We have one dashboard for all metrics you collect from a page. Use that dashboard as an example of what you can do with your own dashboards. It looks like this and checkout that the dashboard now show a screenshot and a video from the latest run.

![Page metrics]({{site.baseurl}}/img/pagesummary-example.jpg)
{: .img-thumbnail}

Scroll down [on the dashboard](https://dashboard.sitespeed.io/d/9NDMzFfMk/page-metrics-desktop?orgId=1) and you will a lot of rows that you can expand. Expand them to see what metrics that is collected.

![Page metrics example 2]({{site.baseurl}}/img/pagesummary-example-2.jpg)
{: .img-thumbnail}

We have also shipped a couple of example user journey dashboards. Here's what it looks like for [a user journey where you login to Wikipedia](https://dashboard.sitespeed.io/d/d-pdqGBGdse/wikipedia-login?orgId=1).

![Login User Journey]({{site.baseurl}}/img/user-journey-example.jpg)
{: .img-thumbnail}

To setup your own dashboards for your user journeys you should follow [this guide](https://www.sitespeed.io/documentation/sitespeed.io/performance-dashboard/#setup-your-own-user-journey-dashboard).

We also updated the leaderboard dashboard to follow the setup, the CruX, WebPageTest and Google Page Speed Insights/Lighthouse. All dashboards include the ever popular Google Web Vitals.

![Leaderboard]({{site.baseurl}}/img/leaderboard-dashboard.jpg)
{: .img-thumbnail}

![CruX]({{site.baseurl}}/img/crux-example.jpg)
{: .img-thumbnail}

![WebPageTest]({{site.baseurl}}/img/webpagetest-dashboard.jpg)
{: .img-thumbnail}

![Plus 1 dashboard]({{site.baseurl}}/img/gpsi-lighthouse-example.jpg)
{: .img-thumbnail}

## Block third parties when using WebPageReplay

Many thanks to [Inderpartap Singh Cheema](https://github.com/inderpartap) that fixed so that you can use `--chrome.blockDomainsExcept` together with WebPageReplay in the Docker container, so you more easily can focus on the performance disregarding 3rd party marketing scripts.

## New metrics: Delta TTFB

We have a couple of new metrics that is the delta between TTFB and First Contentful Paint, Largest Contentful paint and First visual change [#1528](https://github.com/sitespeedio/browsertime/pull/1528). You can use this if you have unstable TTFB and want to alert on front end metrics. The metrics are automatically sent to Graphite.

## New privacy advice
There's a new version of the Coach with a new super important privacy advice: Make sure you disable Chrome's new FLoC for your site. [Read more about FLoC](https://www.eff.org/deeplinks/2021/03/googles-floc-terrible-idea).

![Privacy advice from the coach]({{site.baseurl}}/img/privacy-example.jpg)
{: .img-thumbnail}


/Peter