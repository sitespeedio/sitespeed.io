---
layout: default
title: Collect CPU metrics
description: Using Chrome you can see where the CPU time is spent for your page.
keywords: cpu, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Collect CPU metrics
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / CPU

# CPU
{:.no_toc}

* Lets place the TOC here
{:toc}

## CPU metrics [Chrome only]

Chrome has a lot of features you can use to get more information of where the CPU time is spent. At the moment Firefox lacks support for it but we will add it ASAP when Mozilla implements the features.

### Chrome event trace log
We use [Tracium](https://github.com/aslushnikov/tracium) to get more useful information out of Chrome. The library has been broken out of Lighthouse by [Andrey Lushnikov](https://twitter.com/aslushnikov) of the Chrome DevTools team. Much love :)

You can enable it with `--chrome.timeline` or `--cpu`. You will then get a trace log stored on your disk. Unpack the file and you can drag/drop it into the performance panel in Chrome.

And you will also get a summary in the HTML result file that shows you time spent in:
* parseHTML 
* styleLayout 
* paintCompositeRender
* scriptParseCompile 
* scriptEvaluation
* garbageCollection

This gives you a more insights of CPU time spent. And all the metrics is also sent to Graphite/InfluxDB.

### Long Tasks

Collect CPU long tasks in Chrome using `--chrome.collectLongTasks` (or just use `--cpu`) using the [Long Task API](https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API). A long task is a CPU task that takes longer than 50 ms (but you can configure the length, more about that later).
 
For the long tasks to work, we inject JS using the *Page.addScriptToEvaluateOnNewDocument* devtools command. We collect all long tasks and related data (not so much at the moment but will get better/more useful information when browsers supports it).
 
![Long Tasks data]({{site.baseurl}}/img/long-tasks-html.png)
{: .img-thumbnail}

 
We count the total number of long tasks, long tasks that happens before first paint and first contentful paint. And the amount that happens after load event end. In Grafana the graphs will look like this:

![CPU long tasks]({{site.baseurl}}/img/cpu-longtasks-grafana.png)
{: .img-thumbnail}

One neat feature is that we show when the long task happen in the filmstrip view. That makes it easier for you as a developer to show the impact of the long task to your boss.

![CPU long tasks in the film strip]({{site.baseurl}}/img/filmstrip-cpu.png)
{: .img-thumbnail}


But what about that [magic number of 50 ms](https://calendar.perfplanet.com/2018/magic-numbers/)? Well it is possible that 50 ms isn't the right number for you.  By default a long task is >50ms. Wanna change that? Use `--minLongTaskLength` to set that yourselves (it needs to be larger than 50 ms though).

### Throttle the CPU

Throttle the CPU using Chrome with `--chrome.CPUThrottlingRate`. Enables CPU throttling to emulate slow CPUs. Throttling rate as a slowdown factor (1 is no throttle, 2 is 2x slowdown, etc).

