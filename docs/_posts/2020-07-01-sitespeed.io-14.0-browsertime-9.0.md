---
layout: default
title: sitespeed.io 14.0 and Browsertime 9.0  
description: New fresh dashboards, support for multiple screenshots, the easiest way to get Chrome User Experience data and documentation for how to do synthetic testing.
authorimage: /img/aboutus/peter.jpg
intro: New fresh dashboards, support for multiple screenshots, the easiest way to get Chrome User Experience data and documentation for how to do synthetic testing.
keywords: sitespeed.io, browsertime, webperf
image: https://www.sitespeed.io/img/8bit.png
nav: blog
---

# sitespeed.io 14.0 and Browsertime 9.0 

<img src="{{site.baseurl}}/img/8bit.png" class="pull-right img-big" alt="sitespeed.io the only Web Performance tool that run on a Commodore 64" width="250" height="213">

Let us celebrate over [10 million downloads](https://hub.docker.com/v2/repositories/sitespeedio/sitespeed.io/) of the sitespeed.io Docker container and release sitespeed.io 14 and Browsertime 9!

There are five important new things in the new release:
* New updated Grafana dashboards with all the goodies from [Grafana 7.0](https://grafana.com/docs/grafana/latest/guides/whats-new-in-v7-0/). All Graphite dashboards is updated: sitespeed.io dashboards, WebPageTest and our plus-1 dashboard.
* You can now see **all** screenshots for a run in sitespeed.io! This is super useful when you use scripting to test a user journey. You can take screenshots whenever you need and see the result on the result page, making it even easier then before to know what's going on.
* We have a new section in the documentation: [web performance testing in practice focusing in synthetic testing]({{site.baseurl}}/documentation/sitespeed.io/web-performance-testing-in-practice/)! I've think this is the most comprehensive guide to synthetic testing that's out there.
* You can [support us at Open Collective](https://opencollective.com/sitespeedio)! We need money to be able to run our test servers, run tests on mobile devices and use a dedicated bare metal server. Helping us with that will make sure we continue to release a bug free, feature rich Open Source tool!
* You can get CrUx data direct from sitespeed.io (avoid using the +1 container) with the new crux-plugin.

## New dashboards

All the Graphite dashboards have been updated. There are four focused dashboards for sitespeed.io data:
* [The page timings summary](https://dashboard.sitespeed.io/dashboard/db/page-timing-metrics) -  the dashboard focus on timing metrics for a tested page.
* [The page summary dashboard](https://dashboard.sitespeed.io/dashboard/db/page-summary) shows metrics for a specific page. The dashboard focus on how your page was built and here you can see Coach score, AXE and other data.
* [The site summary dashboard](https://dashboard.sitespeed.io/dashboard/db/site-summary) show metrics for a site (a summary of all URLs tested for that domain). 
* [The leaderboard dashboard](https://dashboard.sitespeed.io/dashboard/db/leaderboard) helps you compare different pages and web sites.

We also have a new and fresh version of the plus 1 dashboard [showing GPSI/CrUx/Lighthouse metrics](https://dashboard.sitespeed.io/dashboard/db/plus1). And the WebPageTest dashboards also got updated!

Lets look at some of the dashboards. 

The [page timings summary](https://dashboard.sitespeed.io/dashboard/db/page-timing-metrics) focus on timing metrics and is the number one dashboard you should use when you look for visual regressions. It also show all other timing metrics that is collected.

![Page timing dashboard]({{site.baseurl}}/img/page-timings-dashboard.jpg)
{: .img-thumbnail}

And compare the metrics with last weeks metrics.

![Page timing dashboard compared with last week]({{site.baseurl}}/img/page-timings-dashboard-2.jpg)
{: .img-thumbnail}

You will also see navigation timing, element timing and user timings.

![Page timing with element timings]({{site.baseurl}}/img/page-timings-dashboard-3.jpg)
{: .img-thumbnail}


The [page summary](https://dashboard.sitespeed.io/dashboard/db/page-summary) shows metrics for a specific URL/page. The dashboard focus on how your page was built. The red/yellow/green limits are configurable in Grafana.

![Page summary]({{site.baseurl}}/img/page-summary.png)
{: .img-thumbnail}

You can also see CPU performance, third party tools and more.

![Page summary and third party]({{site.baseurl}}/img/page-summary-dashboard-2.jpg)
{: .img-thumbnail}

And AXE, CO2 and errors (and a lot more).

![Page summary co2]({{site.baseurl}}/img/page-summary-dashboard-3.jpg)
{: .img-thumbnail}

We also added a new dashboard for your sites data from the [Chrome User Experience Report plugin](/documentation/sitespeed.io/crux/).

![CruX]({{site.baseurl}}/img/crux-dashboard.jpg)
{: .img-thumbnail}

And if you use the +1 container running Google stuff you can graph Google Page Speed Insights data including CrUx out of the box and it looks like this:

![Plus 1 dashboard]({{site.baseurl}}/img/plus-1-dashboard.jpg)
{: .img-thumbnail}

![Plus 1 dashboard part 2]({{site.baseurl}}/img/plus-1-dashboard-2.jpg)
{: .img-thumbnail}

You can [read more about the dashboards in the documentation]({{site.baseurl}}/documentation/sitespeed.io/performance-dashboard/#example-dashboards). 

## Screenshots

Using [scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) you can take screenshots whenever you need. That's super useful if your script fails because a content change. Take a screenshot when it fails and you can see that in the result. Choose the run and the tab **Screenshots**.

![Screenshots]({{site.baseurl}}/img/multiple-screenshots.jpg)
{: .img-thumbnail}

## Documentation for synthetic testing

There's a lot of things you need to know when you start run performance test your web page. I've been working on documenting what I've learned through the years and finally it's ready! Read all about [web performance in practice]({{site.baseurl}}/documentation/sitespeed.io/web-performance-testing-in-practice/). 

## Support sitespeed.io

We've been running sitespeed.io for eight years without financial support. Instead we used host companies to sponsor our test servers and paid for the rest our selves. It worked OK but we want to move away of being dependent of hosting companies and instead being able to choose hosts.

Keeping a performance monitoring tools like sitespeed.io up and running cost money. At the moment we use four cloud instances to run [dashboard.sitespeed.io](https://dashboard.sitespeed.io), run continuous test for sitespeed.io and browsertime. The cost for that is $200 per month.

The next step for us is to add monitoring on real mobile phones. We support both Android and iOS but at the moment the tests we do happens manually per release. We want to continuously run the tests and will use the money to find a company to host our phones.

We also want to have a comprehensive guide on how to run your tests on bare metal and to be able to do that, we need to have a bare metal server.

You can help us by [supporting us at Open Collective](https://opencollective.com/sitespeedio)!

## CrUx data
We have built a new [Chrome User Experience Report plugin](/documentation/sitespeed.io/crux/) that comes bundled with sitespeed.io. The only thing you need to get CrUX data is a [CrUx API key](https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/getting-started#APIKey). We collect data for the specific URL and for the origin. 

You can get the data per form factor, or for all of them. Read [the documentation on how to best setup CrUx](/documentation/sitespeed.io/crux/)!

## Other changes done earlier in 2020
We have done a lot of things earlier this year, we added support for Visual Metrics on Safari on OS X, use Safari Technology Preview on desktop and some tuning in using Safari on iOS.

![Run Browsertime Safari]({{site.baseurl}}/img/safari.png)
{: .img-thumbnail-center}

We also added support for Microsoft Edge ([Linux coming soon?](https://www.microsoftedgeinsider.com/en-us/download?platform=linux)).

![Run Browsertime Edge]({{site.baseurl}}/img/edge.png)
{: .img-thumbnail-center}

We made sure sitespeed.io works on OS X, Windows and Linux without using Docker. If you want to run sitespeed.io without Docker, you can check [our GitHub Actions](https://github.com/sitespeedio/browsertime/tree/main/.github/workflows) as inspiration.

And we moved to use **main** as default branch for all projects.

## And more in the latest release
We also done a couple of bug fixes. Checkout the [Browsertime changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md) and the [sitespeed.io changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) for the full list. 

/Peter