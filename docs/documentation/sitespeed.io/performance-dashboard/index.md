---
layout: default
title: Web Performance Dashboards with sitespeed.io
description: Setup your dashboard using Docker Compose, and continuously test the performance of your web site.
keywords: dashboard, docker, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Web performance dashboard using sitespeed.io.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Performance Dashboard

# Performance Dashboard
{:.no_toc}

* Let's place the TOC here
{:toc}

# What you need
You need [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/). If you haven't used Docker before, you can read [Getting started](https://docs.docker.com/engine/getstarted/). And you can also read/learn more about [Docker Compose](https://docs.docker.com/compose/gettingstarted/) to get a better start.

# Up and running in (almost) 5 minutes

1. Download our Docker compose file: <code>curl -O https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/docker-compose.yml</code>
2. Run: <code>docker-compose up -d</code> (make sure you run the latest [Docker compose](https://docs.docker.com/compose/install/) version)
3. Run sitespeed to get some metrics: <code> docker-compose run sitespeed.io https://www.sitespeed.io/ --graphite.host=graphite</code>
4. Access the dashboard: http://127.0.0.1:3000
5. When you are done you can shut down and remove all the Docker containers by running <code>docker-compose stop && docker-compose rm</code>. Container data will be kept.
6. To start from scratch, also remove the Graphite and Grafana data volumes by running `docker volume rm performancedashboard_graphite performancedashboard_grafana`.


If you want to play with the dashboards, the default login is sitespeedio and password is ...well check out the docker-compose.yml file.

When you run this in production make sure to checkout [our production guidelines](#production-guidelines).

## Docker compose file
We have prepared a Docker Compose file that downloads and sets up Graphite/Grafana and sitespeed.io with a couple of example dashboards. It works perfectly when you want to try it out on localhost, but if you want to run it in production, you should modify it by making sure that the metrics are stored outside of your container/volumes. If you prefer InfluxDB over Graphite, you can use that too, but right now we only have one ready-made dashboard for InfluxDB.

## Pre-made dashboards
We insert ready-made dashboards with a Docker container using curl, making it easy for you to get started. You can check out the container with the dashboards here: [https://github.com/sitespeedio/grafana-bootstrap-docker](https://github.com/sitespeedio/grafana-bootstrap-docker)

# Example dashboards

The example dashboards are generic dashboards that will work with all data/metrics you collect using sitespeed.io. We worked hard to make them and the great thing is that you can use them as base dashboards, then create additional dashboards if you like.

The dashboards has a couple of templates (the dropdowns at the top of the page) that makes the dashboard interactive and dynamic.
A dashboard that show metrics for a specific page has the following templates:

![Page templates]({{site.baseurl}}/img/templates-page.png)
{: .img-thumbnail}

The *path* is the first path after the namespace. Using the default values, the namespace looks like this: *sitespeed_io.default*.

When you choose one of the values in a template, the rest will be populated. You can choose from checking metrics for a specific page, browser, and connectivity.

The default namespace is *sitespeed_io.default* and the example dashboards are built upon a constant template variable called $base that is the first part of the namespace (that default is *sitespeed_io* but feel free to change that, and then change the constant).

## Page summary
The page summary shows metrics for a specific URL/page.

[![Page summary in Grafana]({{site.baseurl}}/img/pagesummary-grafana2.png)](https://dashboard.sitespeed.io/dashboard/db/page-summary)
{: .img-thumbnail}

# The page timings summary

The page timings summary focus on Visual Metrics and is the number one dashboard you should use when you look for visual regressions.

[![Page timing summary in Grafana]({{site.baseurl}}/img/dashboards/page-timing-metrics.png)](https://dashboard.sitespeed.io/dashboard/db/page-timing-metrics?orgId=1)
{: .img-thumbnail}

## Site summary
The site summary show metrics for a site (a summary of all URLs tested for that domain).

[![Site summary in Grafana]({{site.baseurl}}/img/sitesummary-grafana2.png)](https://dashboard.sitespeed.io/dashboard/db/site-summary)
{: .img-thumbnail}

## 3rd vs. 1st party
How much does 3rd party code impact your page? To get this up and running, you should only need to configure the <code>--firstParty</code> parameter/regex when you run.

[![3rd vs 1st]({{site.baseurl}}/img/3rd.png)](https://dashboard.sitespeed.io/dashboard/db/3rd-vs-1st-party)
{: .img-thumbnail}

## WebPageTest dashboards
We have two optional dashboards for WebPageTest to show how you can build them if you use WebPageTest through sitespeed.io.

### WebPageTest page summary
Have we told you that we love WebPageTest? Yes, we have and here is an example of a default WebPageTest page summary where you can look at results for individual URLs.

[![WebPageTest page summary]({{site.baseurl}}/img/webpagetestPageSummary2.png)](https://dashboard.sitespeed.io/dashboard/db/webpagetest-page-summary)
{: .img-thumbnail}


### WebPageTest site summary
And then also for all tested pages of a site.

[![WebPageTest site summary]({{site.baseurl}}/img/webpagetestSiteSummary2.png)](https://dashboard.sitespeed.io/dashboard/db/webpagetest-site-summary)
{: .img-thumbnail}

## Whatever you want
Do you need anything else? Since we store all the data in Graphite and use Grafana you can create your own dashboards, which is super simple!

# Get the metrics
You have the dashboard and you need to collect metrics. Using the crontab works fine or whatever kind of scheduler you are using (or Jenkins per build or ... whatever suits you best).

Using the crontab (on a standalone server) you do like this:
<code>crontab -e</code> to edit the crontab. Make sure your cron user can run Docker and change *my.graphite.host* to your Graphite host. When you run this on a standalone server *my.graphite.host* will be the public IP address of your server. The default port when sending metrics to Graphite is 2003, so you don't have to include that.

If you run the container and the cronjob locally you cannot use localhost since each docker container has it's own localhost. On a Mac or Linux machine you can use <code>$ ifconfig</code> to retrieve your IP address. This will output a list of all connected interfaces and let you see which one is currently being used. The one listed with an "inet" address that is *not* "127.0.0.1" is usually the interface that you're connected through.

On [dashboard.sitespeed.io](https://dashboard.sitespeed.io) we have the following setup:

We have a small shell script that runs the test that we run. It is triggered from the cron and uses a configuration file (default.json) where we have the default configuration used for all tests we run (we then override some config values directly when we start the test).

Our *run.sh* file (we read which URLs we want to test from files):

~~~
#!/bin/bash
DOCKER_CONTAINER=sitespeedio/sitespeed.io:5.2.0
DOCKER_SETUP="--privileged --shm-size=1g --rm -v /root/config:/sitespeed.io -v /result:/result -v /etc/localtime:/etc/localtime:ro --name sitespeed"
THREEG="--network 3g"
CABLE="--network cable"
CONFIG="--config /sitespeed.io/default.json"
echo 'Start run ' >> /tmp/s.log 2>&1
docker network ls >> /tmp/s.log 2>&1
docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER --browsertime.cacheClearRaw --browsertime.chrome.collectTracingEvents /sitespeed.io/wiki
pedia.org.txt $CONFIG >> /tmp/s.log 2>&1
docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/wikipedia.org.txt -b firefox $CONFIG >> /tmp/s.log 2>&1
docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER --influxdb.host INFLUX_HOST --influxdb.database sitespeedio --influxdb.username INFLUX_USER --influxdb.password INFLUX_PW --gzipHAR false /sitespeed.io/ryanair.com.txt -n 3 --firstParty ".ryanair.com" $
CONFIG >> /tmp/s.log 2>&1
docker run $THREEG $DOCKER_SETUP $DOCKER_CONTAINER --browsertime.chrome.collectTracingEvents /sitespeed.io/m.wikipedia.org.txt --graphite.
namespace sitespeed_io.emulatedMobile -c 3g --mobile true $CONFIG >> /tmp/s.log 2>&1
docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER --influxdb.host INFLUX_HOST --influxdb.database sitespeedio --influxdb.username INFLUX_USER --influxdb.password INFLUX_PW /sitespeed.io/nytimes.com.txt -n 3 --webpagetest.key WPT_KEY
38524 $CONFIG >> /tmp/s.log 2>&1
docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/sitespeed.io.txt -b firefox $CONFIG >> /tmp/s.log 2>&1
docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/sitespeed.io.txt $CONFIG >> /tmp/s.log 2>&1
docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/wikipedia.org-second.txt $CONFIG --graphite.namespace sitespeed_io.desktop
Second --preURL https://en.wikipedia.org/wiki/Main_Page >> /tmp/s.log 2>&1
docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/wikipedia.org-second.txt $CONFIG --graphite.namespace sitespeed_io.desktop
Second -b firefox --preURL https://en.wikipedia.org/wiki/Main_Page >> /tmp/s.log 2>&1
echo 'Finished desktop second runs' >> /tmp/s.log 2>&1
#docker run $THREEG $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/m.wikipedia.org-second.txt $CONFIG --graphite.namespace sitespeed_io.emu
latedMobileSecond -c 3g --mobile true --preURL https://en.m.wikipedia.org/wiki/Main_Page >> /tmp/s.log 2>&1
echo 'Finished mobile second runs' >> /tmp/s.log 2>&1
docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/wikipedia.org-login-urls.txt --preScript /sitespeed.io/wikpedia.org-login.
txt $CONFIG --graphite.namespace sitespeed_io.desktopLoggedIn >> /tmp/s.log 2>&1
echo 'Finished all the runs' >> /tmp/s.log 2>&1
~~~

It is then triggered from the crontab:

~~~
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
0 * * * * /root/runs.sh
~~~

And our default configuration is in *default.json*:

~~~
{
  "browsertime": {
    "connectivity": {
      "engine": "external",
      "profile": "cable"
    },
    "iterations": 5,
    "browser": "chrome",
    "speedIndex": true
  },
  "graphite": {
    "host": "GRAPHITE_HOST",
    "namespace": "sitespeed_io.desktop",
    "auth": "GRAPHITE_AUTH"
  },
  "slack": {
    "hookUrl": "https://hooks.slack.com/services/MY_SERVICE"
  },
  "resultBaseURL": "https://results.sitespeed.io",
  "video": true,
  "gzipHAR": true,
  "html": {
    "fetchHARFiles": true
  },
  "s3": {
     "key": "AWS_KEY",
     "secret": "AWS_SECRET",
     "bucketname": "results.sitespeed.io",
     "removeLocalResult": true
  }
}

~~~

And we set up the following Docker networks:

~~~
#!/bin/bash
echo 'Starting Docker networks'
docker network create --driver bridge --subnet=192.168.33.0/24 --gateway=192.168.33.10 --opt "com.docker.network.bridge.name"="docker1" 3g
tc qdisc del dev docker1 root
tc qdisc add dev docker1 root handle 1: htb default 12
tc class add dev docker1 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker1 parent 1:12 netem delay 150ms

docker network create --driver bridge --subnet=192.168.34.0/24 --gateway=192.168.34.10 --opt "com.docker.network.bridge.name"="docker2" cable
tc qdisc del dev docker2 root
tc qdisc add dev docker2 root handle 1: htb default 12
tc class add dev docker2 parent 1:1 classid 1:12 htb rate 5mbit ceil 5mbit
tc qdisc add dev docker2 parent 1:12 netem delay 14ms

docker network create --driver bridge --subnet=192.168.35.0/24 --gateway=192.168.35.10 --opt "com.docker.network.bridge.name"="docker3" 3gfast
tc qdisc del dev docker3 root
tc qdisc add dev docker3 root handle 1: htb default 12
tc class add dev docker3 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker3 parent 1:12 netem delay 75ms

docker network create --driver bridge --subnet=192.168.36.0/24 --gateway=192.168.36.10 --opt "com.docker.network.bridge.name"="docker4" 3gem
tc qdisc del dev docker4 root
tc qdisc add dev docker4 root handle 1: htb default 12
tc class add dev docker4 parent 1:1 classid 1:12 htb rate 0.4mbit ceil 0.4mbit
tc qdisc add dev docker4 parent 1:12 netem delay 200ms
~~~

# Configure Graphite
We provide an example Graphite Docker container which you should probably change the configuration of, depending on how often you want to run your tests. How long you want to keep the result, and how much disk space you want to use, will depend on your use case.

Starting with version 4 we tried to send a moderated number of metrics per URL but you can [change that yourself]({{site.baseurl}}/documentation/sitespeed.io/metrics/).

When you store metrics for a URL in Graphite, you decide from the beginning how long and how often you want to store the data, in [storage-schemas.conf](https://github.com/sitespeedio/docker-graphite-statsd/blob/master/conf/graphite/storage-schemas.conf). In our example Graphite setup, every key under sitespeed_io is caught by the configuration in storage-schemas.conf that looks like:
<pre>
[sitespeed]
pattern = ^sitespeed_io\.
retentions = 10m:60d,30m:90d
</pre>

Every metric that is sent to Graphite following the pattern (the namespace starting with sitespeed_io), Graphite prepares storage for it every ten minutes the first 60 days; after that Graphite uses the configuration in [storage-aggregation.conf](https://github.com/sitespeedio/docker-graphite-statsd/blob/master/conf/graphite/storage-aggregation.conf) to aggregate/downsize the metrics the next 90 days.

Depending on how often you run your analysis, you may want to change the storage-schemas.conf. With the current config, if you analyze the same URL within 10 minutes, one of the runs will be discarded. But if you know you only run once an hour, you could increase the setting. Etsy has some really [good documentation](https://github.com/etsy/statsd/blob/master/docs/graphite.md) on how to configure Graphite.

One thing to know if you change your Graphite configuration: ["Any existing metrics created will not automatically adopt the new schema. You must use whisper-resize.py to modify the metrics to the new schema. The other option is to delete existing whisper files (/opt/graphite/storage/whisper) and restart carbon-cache.py for the files to get recreated again."](http://mirabedini.com/blog/?p=517)

## Crawling and Graphite
If you crawl a site that is not static, you will pick up new pages each run or each day, which will make the Graphite database grow daily. When you add metrics to Graphite, it prepares space for those metrics ahead of time, depending on your storage configuration (in Graphite). If you configured Graphite to store individual metrics every 15 minutes for 60 days, Graphite will allocate storage for that URL: 4 (per hour) * 24 (hours per day) * 60 (days), even though you might only test that URL once.

You either need to make sure you have a massive amount of storage, or you should change the storage-schemas.conf so that you don't keep the metrics for so long. You could do that by setting up another namespace (start of the key) and catch metrics that you only want to store for a shorter time.

The Graphite DB size is determined by the number of unique data points and the frequency of them within configured time periods, meaning you can easily optimize how much space you need. If the majority of the URLs you need to test are static and are tested often, you should find there's a maximum DB size depending on your storage-schemas.conf settings.

# Using S3 for HTML and video
You can store the HTML result on your local agent that runs sitespeed.io, or you can dump the data to S3 and serve it from there. To use S3, you first need to [set up an S3 bucket](http://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html).

Then you configure sitespeed.io to send the data to S3 by configuring the bucket name (and AWS key/secret if that's not available on your server).

You now have the result on S3 and you're almost done. You should also configure to send annotations to Graphite for each run.

# Annotations
You can send annotations to Graphite to mark when a run happens so you can go from the dashboard to any HTML-results page.

You do that by configuring the URL that will serve the HTML with the CLI param *resultBaseURL* (the base URL for your S3 bucket) and configure the HTTP Basic auth username/password used by Graphite. You can do that by setting *--graphite.auth LOGIN:PASSWORD*.

# Production Guidelines
To run this in a production environment, you should consider/make some modifications:

1. Always run sitespeed.io on a stand-alone instance
    - This avoids causing discrepancies in results, due to things like competing resources or network traffic.
    - Run Grafana/Graphite on another server instance.
2. Change the default user and password for Grafana.
3. Change the default [user and password for Graphite](https://hub.docker.com/r/sitespeedio/graphite/).
4. Make sure you have [configured storage-aggregation.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/graphite/conf/storage-aggregation.conf) in Graphite to fit your needs.
5. Configure your [storage-schemas.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/graphite/conf/storage-schemas.conf) how long you wanna store your metrics.
6. *MAX_CREATES_PER_MINUTE* is usually quite low in [carbon.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/graphite/conf/carbon.conf). That means you will not get all the metrics created for the first run, so you can increase it.
7. Map the Graphite volume to a physical directory outside of Docker to have better control (both Whisper and [graphite.db](https://github.com/sitespeedio/sitespeed.io/blob/master/docker/graphite/graphite.db))
8. Remove the sitespeedio/grafana-bootstrap from the Docker compose file, you only need that for the first run.
9. Optional: Disable anonymous users access

## Memory & CPU
How large will your instances need to be? You need to have enough memory for Chrome/Firefox (yep they can really use a lot of memory for some sites). Before we used a $80 instance on Digital Ocean (8GB memory, 4 Core processors) but we switched to use AWS c4.large for dashboard.sitespeed.io. The reason is that the metrics are so more stable on AWS than Digital Ocean. We have tried out most cloud providers and AWS gave us the most stable metrics.

If you test a lot a pages (100+) in the same run, your NodeJS process can run out of memory (default memory for NodeJS is 1.76 GB). You can change and increase by setting MAX_OLD_SPACE_SIZE like this in your compose file:

```yaml
services:
    sitespeed.io:
      environment:
        - MAX_OLD_SPACE_SIZE=3072

```
