---
layout: default
title: Collect Google Web Vitals
description: Get Google Web Vitals using sitespeed.io, crux and other tools.
keywords: google, web, vitals
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Get Google Web Vital metrics.
---
[Documentation](/documentation/sitespeed.io/) / Google Web Vitals

# Google Web Vitals
{:.no_toc}

* Lets place the TOC here
{:toc}

## Using sitespeed.io
If you use Chrome/Edge Google Web Vital metrics is collected automatically.

### First Contentful Paint (FCP)

To see when the first contentful paint happens you should record a video and use visual metrics ```--video --visualMetrics```. Then you can go to the filmstrip or video view to see when the first content is painted on the screen.

![First contentful paint]({{site.baseurl}}/img/filmstrip-ls.jpg)
{: .img-thumbnail}

To collect the metric first contentful paint we use the [Paint Timing API](https://w3c.github.io/paint-timing/).

### Largest Contentful Paint (LCP)

Go the the metrics tab and scroll down to the Largest Contentful Paint metrics and you will see a screenshot where the element that is the largest is highlighted in red. 

![Largest contentful paint]({{site.baseurl}}/img/lcp-result.png)
{: .img-thumbnail}

The screenshot is generated after the page finished loading. If the largest contentful element has been removed from the screen at that time, you will not see any highlight in the screenshot. You can then instead use the information in the table to the left to identify the element.

If you have a hard time identify the element on the screenshot you can change the color of the highlighting by `--browsertime.screenshotLCPColor blue`.
### Cumulative Layout Shift (CLS)

The [layout shift API](https://wicg.github.io/layout-instability/) helps you find the DOM elements that shifts on the screen that degrades the user experience. 

If those elements are still in the viewport after the page finished loading we try to highlight them in a screenshot. By default all elements that has a shift value of 0.01 or higher is highlighted. You can change that with `--browsertime.screenshotLSLimit`. That can help you if you have a lot of elements that shifts. Say that you want to highlight only elements with a value higher than 0.1 then add `--browsertime.screenshotLSLimit 0.1` to your run settings.

![Layout Shift]({{site.baseurl}}/img/ls-result.png)
{: .img-thumbnail}

You can also change the color of the highlight: `--browsertime.screenshotLSColor blue`

Remember that the  API points out the element that is shifted, not the element that actually pushed the the other element.

### Total Blocking Time (TBT) / First input delay
Total blocking time is harder: It really depends on what CPU you use when you run your tests (test on real mobile phones!). Total blocking time use the [Long Tasks API](https://w3c.github.io/longtasks/) to get long running tasks. The API have very limited support to show what causes the long tasks. 

The best way to get valuable information is to use `--cpu` to get the Chrome trace log to download and drag and drop into your performance tab of devtools in Chrome. If you need a deeper trace log (with more information) you can add extra trace categories to the tracelog. The CPU profiler do that:  `--browsertime.chrome.traceCategory disabled-by-default-v8.cpu_profiler`.

### Calibrating metrics against CrUX 75 percentile
Using the [Chrome User Experience plugin](/documentation/sitespeed.io/crux/) you can get the metrics of what your user is experience and you can use those values to try to calibrate the metrics you get out of sitespeed.io. 

It can be hard though since: In the real world people use a lot of different devices with different CPU, many many different connectivities and so on. The easiest thing to calibrate is to have the same first contentful paint in your sitespeed.io test as in your Chrome user experience data. Do that by increasing/decreasing the connectivity until you have something like the same values.
### Bug reports
If you don't get the correct metrics it could either be a bug in the browser API or in sitespeed.io. Try to access your page using Chrome and get the metrics from the API, if there's a bug you can file that for Chrome. If you suspect the bug to be in sitespeed.io please [file a issue in sitespeed.io](https://github.com/sitespeedio/sitespeed.io/issues).
## Using CruX
Sitespeed.io comes with a [Chrome User Experience plugin](/documentation/sitespeed.io/crux/). That makes it easy to get the metrics that Google collects from your user. You can compare them with the ones you get from  sitespeed.io. Go to the [CrUX documentation](/documentation/sitespeed.io/crux/) on how to set it up.

## Using Lighthouse
Use the [Lighthouse plugin](/documentation/sitespeed.io/lighthouse/) to run Lighthouse from sitespeed.io and collect Google Web Vitals.