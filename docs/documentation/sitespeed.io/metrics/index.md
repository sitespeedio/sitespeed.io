---
layout: default
title: Configuring metrics to use
description:
keywords: configure, metrics, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Configuring metrics to use
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Metrics

# Metrics
{:.no_toc}

* Lets place the TOC here
{:toc}

# Collected metrics
Sitepeed.io collects a lot of metrics and they are filtered before they are sent to Graphite. You can remove filters and/or add your own filters. We have tried to setup sensible defaults, if you have suggestions to change them create an [issue at Github](https://github.com/sitespeedio/sitespeed.io/issues/new).

## Summary vs pageSummary
We group the metrics in two different groups: pageSummary are the metrics for one specific page. For example if we test that page 10 times, you will have the min/median/max here for values that change like different timing metrics.

The summary holds information per group, or specific per domain. If you test ten different pages on a site (same domain), the summary of those metrics will end up here.

## List configured metrics
You can list the metrics that are configured by **\-\-metrics.filterList**. The list is dependent on which plugin that you are using, so you need to do an actual run to generate the list. The list is stored in the data folder in a file named **configuredMetrics.txt**.

~~~ bash
$ sitespeed.io https://www.sitespeed.io --metrics.filterList
~~~

The file will look something like this:

~~~
browsertime.pageSummary.statistics.timings.timings
browsertime.pageSummary.statistics.timings.rumSpeedIndex
browsertime.pageSummary.statistics.timings.fullyLoaded
browsertime.pageSummary.statistics.timings.firstPaint
browsertime.pageSummary.statistics.timings.userTimings
browsertime.pageSummary.statistics.visualMetrics.SpeedIndex
browsertime.pageSummary.statistics.visualMetrics.FirstVisualChange
browsertime.pageSummary.statistics.visualMetrics.LastVisualChange
browsertime.pageSummary.statistics.custom.*
...
~~~

## List metrics
You can also list all possible metrics that you can send. Do that by **\-\-metrics.list**. It will generate a text file named **metrics.txt** in the data folder.

~~~ bash
$ sitespeed.io https://www.sitespeed.io --metrics.list
~~~


## Configure/filter metrics
You add/change/remove filters with **\-\-metrics.filter**.

### Add a metric
If you want to add metrics, start by looking at the generated metrics file, so you can see what you can send.

Say you want to send all performance advice to Graphite for a page. Checking the file you can see them something like this:

~~~
...
coach.pageSummary.advice.performance.adviceList.avoidScalingImages.score
coach.pageSummary.advice.performance.adviceList.avoidScalingImages.weight
coach.pageSummary.advice.performance.adviceList.cssPrint.score
coach.pageSummary.advice.performance.adviceList.cssPrint.weight
coach.pageSummary.advice.performance.adviceList.fastRender.score
coach.pageSummary.advice.performance.adviceList.fastRender.weight
coach.pageSummary.advice.performance.adviceList.inlineCss.score
coach.pageSummary.advice.performance.adviceList.inlineCss.weight
coach.pageSummary.advice.performance.adviceList.jquery.score
coach.pageSummary.advice.performance.adviceList.jquery.weight
coach.pageSummary.advice.performance.adviceList.spof.score
coach.pageSummary.advice.performance.adviceList.spof.weight
coach.pageSummary.advice.performance.adviceList.thirdPartyAsyncJs.score
coach.pageSummary.advice.performance.adviceList.thirdPartyAsyncJs.weight
...
~~~

The score is .. yes the score and the weight is how important it is. You probably only need the score, so setting a filter like this **coach.pageSummary.advice.performance.adviceList.\*.score** will send them all (setting a wildcard for the name).

~~~ bash
$ sitespeed.io https://www.sitespeed.io --metrics.filter coach.pageSummary.advice.performance.adviceList.*.score -n 1
~~~

The best way to test and verify on your local, is to checkout the sitespeed.io project and then start a TCP server that logs everything:

~~~ bash
$ tools/tcp-server.js
$ Server listening on :::52860
~~~

It will output the port, so use it when you run sitespeed.io:

~~~ bash
$ sitespeed.io --metrics.list https://www.sitespeed.io -n 1 --metrics.filter coach.pageSummary.advice.performance.adviceList.*.score --graphite.host 127.0.0.1 --graphite.port 52860
~~~

It will log all metrics you will send to Graphite.

### Remove metrics
We don't have support to remove single metrics, but you can
remove all configured metrics with the parameter value *\*-*

~~~ bash
$ sitespeed.io --metrics.list https://www.sitespeed.io -n 1 --metrics.filter *- coach.pageSummary.advice.performance.adviceList.*.score --graphite.host 127.0.0.1 --graphite.port 52860
~~~

will send only the **coach.pageSummary.advice.performance.adviceList.\*.score** metrics.
