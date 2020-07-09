---
layout: default
title: sitespeed.io 11.0  
description: Better configurable HTML output, the new Contentful Speed Index metric, Firefox Window recorder and finally no root in Docker.
authorimage: /img/aboutus/peter.jpg
intro:  Better configurable HTML output, the new Contentful Speed Index metric, Firefox Window recorder and finally no root in Docker.
keywords: sitespeed.io, browsertime, webperf
nav: blog
---

# sitespeed.io 11.0 

We have just shipped Browsertime 7.0 and sitespeed.io 11.0 with some great contributions from outside of the core team!

A lot of love and extra thanks to:
* [Mason Malone](https://github.com/MasonM) - Mason fixed the long annoying problem of when you are running your test on Linux, the result files are stored as the user root. Masons fix instead pick up the owner of the result directory, and uses that owner. Clever!
* [Thapasya Murali](https://github.com/thapasya-m) - Thapasya have made it possible to configure the summary boxes (on the start result HTML page) and the columns of the pages page. This makes it possible for you to choose which metrics you want to see on those pages!
* [Denis Palmeiro](https://github.com/dpalmeiro) - Denis added the new metric Contentful Speed Index and the new Firefox window recorder! 

Let us go through the most important changes in the new release:

- [No root in Docker](#no-root-in-docker)
- [Configurable result HTML](#configurable-result-html)
- [Contentful Speed Index](#contentful-speed-index)
- [Firefox Window recorder](#firefox-window-recorder)
- [Small variance in connectivity](#small-variance-in-connectivity)
- [Other fixes](#other-fixes)
- [Sponsor sitespeed.io](#sponsor-sitespeedio)

## No root in Docker
Nothing more to say about this, we should have fixed it long time ago. Thank you again Mason for the fix!

## Configurable result HTML

You can now configure which metrics to see in the columns for all pages:


![Page columns]({{site.baseurl}}/img/pagecolumns.png)
{: .img-thumbnail}


And you can also choose which metrics to see in the summary boxes:

![Summary boxes]({{site.baseurl}}/img/summary-boxes.png)
{: .img-thumbnail}


aWe have [a new documentation page](/documentation/sitespeed.io/configure-html/) to show you how to do it!

## Contentful Speed Index
Contentful Speed Index is a new SI metric developed by Bas Schouten at Mozilla which uses edge detection to calculate the amount of "content" that is visible on each frame. It was primarily designed for two main purposes: 
* Have a good metric to measure the amount of text that is visible. 
* Design a metric that is not easily fooled by the pop up splash/login screens that commonly occur at the end of a page load. These can often disturb the speed index numbers since the last frame that is being used as reference is not accurate. 

## Firefox Window recorder

Denis also added the new Firefox built-in window recorder ([bug 1536174](https://bugzilla.mozilla.org/show_bug.cgi?id=1536174)) that is able to dump PNG images of each frame that is painted to the window. The PR introduces a new privileged API that is able to execute JS in the chrome context, as well as support for generating a variable rate MP4 using the output images from the window recorder. The motivation for this work was to introduce a low-overhead video recorder that will not introduce performance disturbances during page loads. The idea is that using it will add smaller overhead than using FFMPeg for the video.

You use this with  `--video --firefox.windowRecorder`.

## Small variance in connectivity 
There's a new way to set variance on your connectivity. At the moment you can only do that when you are using Throttle as engine. You can try it out with `--connectivity.variance 2` - that means the latency will have a variance of 2% between runs. The original idea comes from Emery Berger.

We haven't studied this yet. The idea is that by introducing a small variance, you will be able to spot if you hit a thresholds that have a big impact on the performance on your page. We will get back later with more information when we had it running for a while.


## Other fixes
We done two important bug fixes:

* Fixed so that you can disable video/visual metrics in your configuration JSON in Docker as reported in [#2692](https://github.com/sitespeedio/sitespeed.io/issues/2692) fixed by PR [#2715](https://github.com/sitespeedio/sitespeed.io/pull/2715).
* Fixed so that running AXE when testing multiple URLs works in scripting (reported in [#2754](https://github.com/sitespeedio/sitespeed.io/issues/2754)). Fixed in [#2755](https://github.com/sitespeedio/sitespeed.io/pull/2755).

Read about all the changes in [the changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md)!

## Sponsor sitespeed.io
We are also launching [GitHub sponsorship](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) with this release! [Read more about sponsoring sitespeed.io](/sponsor/).


/Peter