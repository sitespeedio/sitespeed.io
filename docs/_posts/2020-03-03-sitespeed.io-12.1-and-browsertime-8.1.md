---
layout: default
title: sitespeed.io 12.1 and Browsertime 8.1.  
description: A new sustainable web plugin created together with the Green Web Foundation and video/Visual Metrics support on OS X.
authorimage: /img/aboutus/peter.jpg
intro: A new sustainable web plugin created together with the Green Web Foundation and video/Visual Metrics support on OS X!
keywords: sitespeed.io, browsertime, webperf
image: https://www.sitespeed.io/img/sustainable-web.jpg
nav: blog
---

# sitespeed.io 12.1 and Browsertime 8.1 

In the new version of sitespeed.io, me (Peter) teamed up with [Chris Adams](https://twitter.com/mrchrisadams) of the [Green Web Foundation](https://www.thegreenwebfoundation.org) and we created a sustainable web plugin that makes it possible to calculate estimated carbon emission for a page.

This release also makes it easier to run different WebDriver versions, easier support for MS Edge and video and visual metrics support on OS X!

Read all about the new things here:
- [The sustainable web plugin](#the-sustainable-web-plugin)
    - [How to use it](#how-to-use-it)
    - [The result](#the-result)
    - [Extra configuration](#extra-configuration)
- [Video and Visual Metrics on OS X](#video-and-visual-metrics-on-os-x)
- [EdgeDriver automatically installed](#edgedriver-automatically-installed)
- [Choose driver version](#choose-driver-version)
- [And more](#and-more)

## The sustainable web plugin

<img src="{{site.baseurl}}/img/sustainable-web.jpg" class="pull-right img-big" alt="Sustainable web logo" width="176" height="269">

We know using the internet means using electricity to power servers. And because most of that electricity comes from burning fossil fuels, it means every byte sent has a cost in carbon as well as power. The sustainable web plugin combines the latest in peer reviewed science and open data from the [Green Web Foundation](https://www.thegreenwebfoundation.org) to help you build greener, more sustainable websites and applications!

We work out how much energy it takes to serve a site, then work out how much CO2 is emitted to generate the power needed that electricity, based on what information we have about where the power comes from. 

[Chris Adams](https://twitter.com/mrchrisadams) has written down [more details](/documentation/sitespeed.io/sustainable/#the-slightly-longer-version) how we do the calculations.

### How to use it

Enable the plugin by adding `--sustainable.enable`:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --sustainable.enable
~~~

### The result

All data is produced under the new tab called  *Sustainable Web*.

![Sustainable web tab]({{site.baseurl}}/img/sustainable-tab.png)
{: .img-thumbnail}

The plugin will use the transfer size of every asset and the domain (to know if the server run on green energy) and estimate the total amount of carbon emission for one page view.

First you will see the amount of estimated carbon emission for one page view.

![Estimated carbon emission per page view]({{site.baseurl}}/img/estimated-carbon.png)
{: .img-thumbnail}

But you can also add `--sustainable.pageViews` to your run and you will get the estimated carbon for that amount of page views. If you run it with  `--sustainable.pageViews 100000` you will get something like this:

![Total carbon emission]({{site.baseurl}}/img/total-page-views-carbon.png)
{: .img-thumbnail}

Both the amount per page view and the total among will be automatically sent to Graphite/InfluxDB.

We also categorise content per first/third party (with the `--firstParty` switch). You can see that for the site in this example the estimated carbon emission from third parties are over 79% of the total emission :(

The next cut is per domain.

![Carbon per domain]({{site.baseurl}}/img/carbon-per-domain.png)
{: .img-thumbnail}

<img src="{{site.baseurl}}/img/green-is-good.jpg" class="pull-right img-big" alt="Green is good" width="150" height="143">

The green sign that says *green* means that that domain is marked as running on green energy in the Green Web Foundation database.

We also produce a list of the top ten dirtiest assets on the page. The ones that produces most carbon emission.

![Carbon per asset]({{site.baseurl}}/img/carbon-per-asset.png)
{: .img-thumbnail}

Here we have one JavaScript bundle that produces 39% of the total emission for that page. I wonder what kind of cool  functionality they have on the page? :)

We also slice and dice the data per content type. This is interesting because it can help you take environment friendly decisions. For example for this website, having a specific font stands for over 50% of the estimated carbon emission for that page.

![Carbon per content type]({{site.baseurl}}/img/carbon-content-type.png)
{: .img-thumbnail}

### Extra configuration

By default the hosting data (knowing if a host is green) is collected from a local SQLite database included in sitespeed.io. You can use the Green Foundations API directly for the latest and fresh data using `--sustainable.useGreenWebHostingAPI`. That will generate a GET request to the API though.

You can also disable the hosting match (all hosts will be treated as grey hosting) with `--sustainable.disableHosting`.

## Video and Visual Metrics on OS X
An old friend is back, we again support video and Visual Metrics on OS X! You need to install FFMpeg and the rest of the dependencies, checkout the [Travis-CI setup](https://github.com/sitespeedio/browsertime/blob/main/.travis.yml).

We also a aim to make it possible to use video Visual Metrics on Windows and you can help us out in [Browsertime #1203](https://github.com/sitespeedio/browsertime/issues/1203)!

## EdgeDriver automatically installed
If you run on an OS that supports Edge, latest EdgeDriver will be automatically installed. If you want to skip installing, use *EDGEDRIVER_SKIP_DOWNLOAD=true* as an environment variable.

## Choose driver version
Since the ChromeDriver team decided that a ChromeDriver version needs to match a browser version, it has been more work to test other Chrome versions.

You can download the ChromeDriver yourself from the [Google repo](https://chromedriver.storage.googleapis.com/index.html) and use ```--chrome.chromedriverPath``` to help Browsertime find it or you can choose which version to install when you install sitespeed.io with a environment variable: ```CHROMEDRIVER_VERSION=81.0.4044.20 npm install ```

You can also choose versions for Edge and Firefox with `EDGEDRIVER_VERSION` and `GECKODRIVER_VERSION`.

## And more
We also done a couple of bug fixes. Checkout the  [Browsertime changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md) and the [sitespeed.io changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) for the full list. 

/Peter