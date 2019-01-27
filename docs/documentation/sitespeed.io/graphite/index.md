---
layout: default
title: Store your metrics in Graphite.
description: How to configure Graphite, best practices and how to use StatsD or DataDog.
keywords: graphite, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Store your metrics in Graphite.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Graphite

# Graphite
{:.no_toc}

* Let's place the TOC here
{:toc}


## What is Graphite
[Graphite](https://graphiteapp.org/) store numeric time-series data and you can use that to store the metrics sitespeed.io collects. We provide an easy integration and you can use [our pre-made Docker container](https://hub.docker.com/r/sitespeedio/graphite/) and our [dashboard setup]({{site.baseurl}}/documentation/sitespeed.io/performance-dashboard/#up-and-running-in-almost-5-minutes) or use your current Graphite setup.

## Before you start
If you are a new user of Graphite you need to read Etsys writeup about [Graphite](https://github.com/etsy/statsd/blob/master/docs/graphite.md) so you have an understanding of how the data is stored and how to configure the metrics. Also read [Graphite docs how to get metrics into graphite](https://graphite.readthedocs.io/en/latest/feeding-carbon.html#getting-your-data-into-graphite) for a better understanding of the metrics structure.

In Graphite you configure for how long time you want to store metrics and at what precision, so it's good to check our default configuration ([this](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/graphite/conf/storage-aggregation.conf) and [this](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/graphite/conf/storage-schemas.conf)) before you start so you see that it matches your needs.


## Configure Graphite
We provide an example Graphite Docker container and when you put that into production, you need to change the configuration.
The configuration depends on how often you want to run your tests. How long you want to keep the result, and how much disk space you want to use.

Starting from sitespeed.io version 4 we send a moderated number of metrics per URL but you can [change that yourself]({{site.baseurl}}/documentation/sitespeed.io/metrics/).

When you store metrics for a URL in Graphite, you decide from the beginning how long and how often you want to store the data, in [storage-schemas.conf](https://github.com/sitespeedio/docker-graphite-statsd/blob/master/conf/graphite/storage-schemas.conf). In our example Graphite setup, every key under sitespeed_io is caught by the configuration in storage-schemas.conf that looks like:

~~~shell
[sitespeed]
pattern = ^sitespeed_io\.
retentions = 10m:60d,30m:90d
~~~

Every metric that is sent to Graphite following the pattern (the namespace starting with sitespeed_io), Graphite prepares storage for it every ten minutes the first 60 days; after that Graphite uses the configuration in [storage-aggregation.conf](https://github.com/sitespeedio/docker-graphite-statsd/blob/master/conf/graphite/storage-aggregation.conf) to aggregate/downsize the metrics the next 90 days.

Depending on how often you run your analysis, you may want to change the storage-schemas.conf. With the current config, if you analyse the same URL within 10 minutes, one of the runs will be discarded. But if you know you only run once an hour, you could increase the setting. Etsy has some really [good documentation](https://github.com/etsy/statsd/blob/master/docs/graphite.md) on how to configure Graphite.

One thing to know if you change your Graphite configuration: ["Any existing metrics created will not automatically adopt the new schema. You must use whisper-resize.py to modify the metrics to the new schema. The other option is to delete existing whisper files (/opt/graphite/storage/whisper) and restart carbon-cache.py for the files to get recreated again."](http://mirabedini.com/blog/?p=517)
{: .note .note-warning}

## Send metrics to Graphite
To send metrics to Graphite you need to at least configure the Graphite host:
<code>--graphite.host</code>.

If you don't run Graphite on default port you can change that to by <code>--graphite.port</code>.

If your instance is behind authentication yoy can use <code>--graphite.auth</code> with the format **user:password**.

If you use a specifc port for the user inteface (and where we send the annotations) you can change that with <code>--graphite.httpPort</code>.

If you use a different web host for Graphite than your default host, you can change that with <code>--graphite.webHost</code>. If you don't use a specific web host, the default domain will be used.

You can choose the namespace under where sitespeed.io will publish the metrics. Default is **sitespeed_io.default**. Change it with <code>--graphite.namespace</code>. If you want all default dashboards to work, it need to be 2 steps.

Each URL is by default split into domain and the URL when we send it to Graphite. By default sitespeed.io remove query parameters from the URL bit if you need them you can change that by adding <code>--graphite.includeQueryParams</code>.

If you use Graphite < 1.0 you need to make sure the tags in the annotations follow the old format, you do that by adding <code>--graphite.arrayTags</code>.

### Debug
If you want to test and verify what the metrics looks like that you send to Graphite you can use *tools/tcp-server.js* to verify what it looks like.

1. Start the server (you need to clone the sitespeed.io repo first): <code>tools/tcp-server.js</code>
2. You will then get back the port for the server (60447 in this example): <code>Server listening on :::60447</code>
3. Open another terminal and run sitespeed.io and send the metrics to the tcp-server ([read how to reach localhost from Docker](/documentation/sitespeed.io/docker/#access-localhost)):
<code>docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --graphite.host 192.168.65.2 --graphite.port 60447  -n 1</code>
4. Check the terminal where you have the TCP server running and you will see something like:

~~~
sitespeed_io.default.pageSummary.www_sitespeed_io._.chrome.native.browsertime.statistics.timings.pageTimings.backEndTime.median 231 1532591185
sitespeed_io.default.pageSummary.www_sitespeed_io._.chrome.native.browsertime.statistics.timings.pageTimings.backEndTime.mean 231 1532591185
sitespeed_io.default.pageSummary.www_sitespeed_io._.chrome.native.browsertime.statistics.timings.pageTimings.backEndTime.mdev 0 1532591185
sitespeed_io.default.pageSummary.www_sitespeed_io._.chrome.native.browsertime.statistics.timings.pageTimings.backEndTime.min 231 1532591185
sitespeed_io.default.pageSummary.www_sitespeed_io._.chrome.native.browsertime.statistics.timings.pageTimings.backEndTime.p10 231 1532591185
sitespeed_io.default.pageSummary.www_sitespeed_io._.chrome.native.browsertime.statistics.timings.pageTimings.backEndTime.p90 231 1532591185
sitespeed_io.default.pageSummary.www_sitespeed_io._.chrome.native.browsertime.statistics.timings.pageTimings.backEndTime.p99 231 1532591185
sitespeed_io.default.pageSummary.www_sitespeed_io._.chrome.native.browsertime.statistics.timings.pageTimings.backEndTime.max 231 1532591185
...
~~~

### Keys and metrics in Graphite

You can read about the keys and the metrics that we send to Graphite in the [metrics documentation](/documentation/sitespeed.io/metrics/).


### Annotations
You can send annotations to Graphite to mark when a run happens so you can go from the dashboard to any HTML-results page.

You do that by configuring the URL that will serve the HTML with the CLI param *resultBaseURL* (the base URL for your S3 bucket) and configure the HTTP Basic auth username/password used by Graphite. You can do that by setting <code>--graphite.auth LOGIN:PASSWORD</code>.

You can also modify the annotation and append our own text/HTML and add your own tags.
Append a message to the annotation with <code>--graphite.annotationMessage</code>. That way you can add links to a specific branch or whatever you feel that can help you.

You can add extra tags with <code>--graphite.annotationTag</code>. For multiple tags, add the parameter multiple times. Just make sure that the tags doesn't collide with our internal tags.

![Annotations]({{site.baseurl}}/img/graphite-annotations.png)
{: .img-thumbnail-center}

You can also include a screenshot from the run in the annotation by adding <code>--graphite.annotationScreenshot</code> to your configuration.

![Annotation with screenshots]({{site.baseurl}}/img/annotation-with-screenshot.png)
{: .img-thumbnail-center}

### Use Grafana annotations
Instead of using Graphite annotations you can use Grafana built in annotations since sitespeed.io 7.5 and Grafana 5.3.0.

To use Grafana annotations, make sure you setup a *resultBaseURL* and add the host and port to Grafana: <code>--grafana.host</code> and <code>--grafana.port</code>.

Then setup your Grafana API token, follow the instructions at [http://docs.grafana.org/http_api/auth/#authentication-api](http://docs.grafana.org/http_api/auth/#authentication-api) and use the **bearer** code you get with <code>--grafana.auth</code>. Then your annotations will be sent to Grafana instead of Graphite.

## Warning: Crawling and Graphite
If you crawl a site that is not static, you will pick up new pages each run or each day, which will make the Graphite database grow daily. When you add metrics to Graphite, it prepares space for those metrics ahead of time, depending on your storage configuration (in Graphite). If you configured Graphite to store individual metrics every 15 minutes for 60 days, Graphite will allocate storage for that URL: 4 (per hour) * 24 (hours per day) * 60 (days), even though you might only test that URL once.

You either need to make sure you have a massive amount of storage, or you should change the storage-schemas.conf so that you don't keep the metrics for so long. You could do that by setting up another namespace (start of the key) and catch metrics that you only want to store for a shorter time.

The Graphite DB size is determined by the number of unique data points and the frequency of them within configured time periods, meaning you can easily optimize how much space you need. If the majority of the URLs you need to test are static and are tested often, you should find there's a maximum DB size depending on your storage-schemas.conf settings.

## Statsd
If you are using statsd you can use it by adding <code>--graphite.statsd</code> (and send the metrics to statsd instead of directly to Graphite). You can also choose how many metrics you wanna send per request by configuring <code>--graphite.bulkSize</code>.

If you are a DataDog user you can use [DogStatsD](https://docs.datadoghq.com/developers/dogstatsd/).

## Graphite for production (important!)

1. Make sure you have [configured storage-aggregation.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/graphite/conf/storage-aggregation.conf) in Graphite to fit your needs.
2. Configure your [storage-schemas.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/graphite/conf/storage-schemas.conf) how long you wanna store your metrics.
3. *MAX_CREATES_PER_MINUTE* is usually quite low in [carbon.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/graphite/conf/carbon.conf). That means you will not get all the metrics created for the first run, so you can increase it.
4. Map the Graphite volume to a physical directory outside of Docker to have better control (both Whisper and [graphite.db](https://github.com/sitespeedio/sitespeed.io/blob/master/docker/graphite/graphite.db)). Map them like this on your physical server (make sure to copy the empty [grahite.db]((https://github.com/sitespeedio/sitespeed.io/blob/master/docker/graphite/graphite.db)) file):
 - /path/on/server/whisper:/opt/graphite/storage/whisper
 - /path/on/server/graphite.db:/opt/graphite/storage/graphite.db
 If you use Grafana annotations, you should make sure grafana.db is outside of the container. Follow the documentation at [grafana.org](http://docs.grafana.org/installation/docker/#grafana-container-using-bind-mounts).