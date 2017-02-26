---
layout: default
title: Web Performance Dashboards with sitespeed.io
description: Setup you dashboard using Docker Compose, it cannot be simpler.
keywords: dashboard, docker, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Web performance dashboard using sitespeed.io.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Performance Dashboard

# Performance Dashboard
{:.no_toc}

* Lets place the TOC here
{:toc}

We spent a lot of time making it easier in 4.x to install and run your own performance dashboard with pre made dashboards and a Docker compose file to rule them all. You can see the beauty [here](https://dashboard.sitespeed.io). In 4.4 and later you can also send the result (HTML/video) to S3 and add links in Grafana to go from you dashboard to the result pages.

# What you need
You need [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/). If you haven't used Docker before, you can read [Getting started](https://docs.docker.com/engine/getstarted/). And you can also read/learn more about [Docker Compose](https://docs.docker.com/compose/gettingstarted/) to get a better start.

# Up and running in 5 minutes

1. Download our new Docker compose file: <code>curl -O https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/docker-compose.yml</code>
2. Run: <code>docker-compose up -d</code> (make sure you run the latest [Docker compose](https://docs.docker.com/compose/install/) version)
3. Run sitespeed to get some metrics: <code> docker-compose run sitespeed.io https://www.sitespeed.io/ --graphite.host=graphite</code>
4. Access the dashboard: http://127.0.0.1:3000
5. When you are done you can shutdown and remove all the docker containers by running <code>docker-compose stop && docker-compose rm</code>


If you want to play with the dashboards the default login is sitespeedio and password is ...well checkout the docker-compose.yml file.

## Docker compose file
We have prepared a Docker Compose file that downloads and setup Graphite/Grafana and sitespeed.io + a couple of example dashboards. It works perfect when you wanna try it out locally, but if you wanna run it in production you should modify it by making sure that the metrics are stored outside of your container/volumes.

## Pre made dashboards
We insert pre made dashboards with a Docker container using curl, that makes it easy for you to get started. You can check out the container with the dashboards here: [https://github.com/sitespeedio/grafana-bootstrap-docker](https://github.com/sitespeedio/grafana-bootstrap-docker)

# Example dashboards

The example dashboards are generic dashboards that will work with all data/metrics you collect using sitespeed.io. We worked hard to make them as good as possible and the great thing about them is that you can use them as base dashboards and then create the extra dashboards you like.

The dashboards has a couple of templates (the drop downs at the top of the page) that makes the dashboard interactive and dynamic.
A dashboard that show metrics for a specific page has the following templates:

![Page templates]({{site.baseurl}}/img/templates-page.png)
{: .img-thumbnail}

The *path* is the first path after the namespace. Using default values the namespace looks is *sitespeed_io.default*.

When you choose one of the values in a template, the rest will be populated. You can choose checking metrics for a specific page, browser and connectivity.

## The namespace
The default namespace is *sitespeed_io.default* and the example dashboards are built upon a constant template variable called $base that is the first part of the namespace (that default is *sitespeed_io* but feel free to change that, and then change the constant).

## Page summary
The page summary shows metrics for a specific URL/page.

[![Page summary in Grafana]({{site.baseurl}}/img/pagesummary-grafana2.png)](https://dashboard.sitespeed.io/dashboard/db/page-summary)
{: .img-thumbnail}

## Site summary
The site summary show metrics for a site (a summary of all URLs tested for that domain).

[![Site summary in Grafana]({{site.baseurl}}/img/sitesummary-grafana2.png)](https://dashboard.sitespeed.io/dashboard/db/site-summary)
{: .img-thumbnail}

## 3rd vs. 1st party
How much impact to 3rd party code has on your page? To get this up and running you should need to configure the <code>--firstParty</code> parameter/regex when you run.

[![3rd vs 1st]({{site.baseurl}}/img/3rd.png)](https://dashboard.sitespeed.io/dashboard/db/3rd-vs-1st-party)
{: .img-thumbnail}

## WebPageTest page summary
Have we told you that we love WebPageTest? Yes we have and here are a default WebPagTest page summary where you can look at results for individual URLs.

[![WebPageTest page summary]({{site.baseurl}}/img/webpagetestPageSummary2.png)](https://dashboard.sitespeed.io/dashboard/db/webpagetest-page-summary)
{: .img-thumbnail}


## WebPageTest site summary
And then also for all tested pages of a site.

[![WebPageTest site summary]({{site.baseurl}}/img/webpagetestSiteSummary2.png)](https://dashboard.sitespeed.io/dashboard/db/webpagetest-site-summary)
{: .img-thumbnail}

## Whatever you want
Do you need anything else? Since we store all the data in Graphite and use Grafana you can create your own dashboards, it super simple!

# Get the metrics
You have the dashboard and you need to collect metrics. Using the crontab works fine or whatever kind of scheduler you are using (or Jenkins per build or ... whatever suits you the best).

Using the crontab (on a standalone server) you do like this:
<code>crontab -e</code> to edit the crontab. Make sure your cron user can run Docker and change *my.graphite.host* to your Graphite host. When you run this on a standalone server *my.graphite.host* will be the public ip address of your server. The default port when sending metrics to graphite is 2003, so you don't have to include that.

If you run the container and the cronjob locally you cannot use localhost since each docker container has it's own localhost. On a mac or linux machine you can use <code>$ ifconfig</code> to retrieve your ip address. This will output a list of all connected interfaces and let you see which one is currently being used. The one listed with an "inet" address that is not "127.0.0.1" is usually the interface that you're connected through.

On [dashboard.sitespeed.io](https://dashboard.sitespeed.io) we have the following setup:

We have a small shell script that runs the test that we run. It is triggered from the cron and used a configuration file (default.json) where we have the default configuration that we use for all tests we run (and then we override some config values direct when we start the test).

Our *run.sh* file (we read which URLs we wanna test from files):

~~~
#!/bin/bash
DOCKER_CONTAINER=sitespeedio/sitespeed.io:4.4.0
DOCKER_SETUP="--privileged --shm-size=1g --rm -v /root/config:/sitespeed.io"
CONFIG="--config /sitespeed.io/default.json"
docker run $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/wikipedia.org.txt $CONFIG >> /tmp/s.log 2>&1
docker run $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/wikipedia.org.txt -b firefox $CONFIG >> /tmp/s.log 2>&1
docker run $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/ryanair.com.txt --firstParty ".ryanair.com" $CONFIG >> /tmp/s.log 2>&1
docker run $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/m.wikipedia.org.txt --graphite.namespace sitespeed_io.emulatedMobile -c 3g --mobile true $CONFIG >> /tmp/s.log 2>&1
docker run $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/nytimes.com.txt --webpagetest.key SECRET_KEY $CONFIG >> /tmp/s.log 2>&1
docker run $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/sitespeed.io.txt -b firefox $CONFIG >> /tmp/s.log 2>&1
docker run $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/sitespeed.io.txt $CONFIG >> /tmp/s.log 2>&1
docker run $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/wikipedia.org-second.txt $CONFIG --graphite.namespace sitespeed_io.desktopSecond --preURL https://en.wikipedia.org/wiki/Main_Page >> /tmp/s.log 2>&1
docker run $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/wikipedia.org-second.txt $CONFIG --graphite.namespace sitespeed_io.desktopSecond -b firefox --preURL https://en.wikipedia.org/wiki/Main_Page >> /tmp/s.log 2>&1
docker run $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/m.wikipedia.org-second.txt $CONFIG --graphite.namespace sitespeed_io.emulatedMobileSecond -c 3g --mobile true --preURL https://en.m.wikipedia.org/wiki/Main_Page >> /tmp/s.log 2>&1
docker run $DOCKER_SETUP $DOCKER_CONTAINER /sitespeed.io/wikipedia.org-login-urls.txt --preScript /sitespeed.io/wikpedia.org-login.txt $CONFIG --graphite.namespace sitespeed_io.desktopLoggedIn >> /tmp/s.log 2>&1
~~~

It is then triggered from the crontab:

~~~
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
0 * * * * /root/runs.sh
~~~

And our default configuration is in *default.json*.

~~~
{
  "browsertime": {
    "connectivity": {
      "engine": "tc",
      "profile": "cable"
    },
    "iterations": 5,
    "browser": "chrome",
    "speedIndex": true
  },
  "graphite": {
    "host": "my.graphite.host",
    "namespace": "sitespeed_io.desktop",
    "auth": "LOGIN:PASSWORD"
  },
  "slack": {
    "hookUrl": "https://hooks.slack.com/services/MY_SERVICE"
  },
  "resultBaseURL": "https://results.sitespeed.io",
  "video": true,
  "s3": {
     "key": "AWS_KEY",
     "secret": "AWS_SECRET",
     "bucketname": "results.sitespeed.io",
     "removeLocalResult": true
  }
}
~~~


# Configure Graphite
We provide an example Graphite Docker container and you should probably change the configuration depending on how often you want to run your tests, how long you want to keep the result and how much disk space you want to use.

With 4.x we try to send a moderated number of metrics per URL but you can [change that yourself]({{site.baseurl}}/documentation/sitespeed.io/metrics/).

When you store metrics for a URL in Graphite you decide from the beginning how long time you want to store the data and how often in [storage-schemas.conf](https://github.com/sitespeedio/docker-graphite-statsd/blob/master/conf/graphite/storage-schemas.conf). In our example Graphite setup every key under sitespeed_io is caught by the configuration in storage-schemas.conf that looks like:
<pre>
[sitespeed]
pattern = ^sitespeed_io\.
retentions = 10m:60d,30m:90d
</pre>

Every metric that is sent to Graphite following the pattern (the namespace starting with sitespeed_io), Graphite prepares storage for it every ten minutes the first 60 days, after that Graphite uses the configuration in [storage-aggregation.conf](https://github.com/sitespeedio/docker-graphite-statsd/blob/master/conf/graphite/storage-aggregation.conf) to aggregate/downsize the metrics the next 90 days.

Depending on how often you run your analyze you wanna change the storage-schemas.conf. With the current config, if you analyze the same URL within 10 minutes, one of the runs will be discarded. But if you know you only run once an hour, you could increase the setting. Etsy has [good documentation](https://github.com/etsy/statsd/blob/master/docs/graphite.md) on how to configure Graphite.

One thing to know if you change your Graphite configuration: ["Any existing metrics created will not automatically adopt the new schema. You must use whisper-resize.py to modify the metrics to the new schema. The other option is to delete existing whisper files (/opt/graphite/storage/whisper) and restart carbon-cache.py for the files to get recreated again."](http://mirabedini.com/blog/?p=517)

## Crawling and Graphite
If you crawl a site that is not static you will pick up new pages each run or each day and that will make the Graphite database grow each day. Either you make sure you have a massive amount of storage or you change the storage-schemas.conf so that you don't keep the metrics for so long. You could do that by setting up another namespace (start of the key) and catch metrics that you only store for a short time.

The Graphite DB size is determined by the number of unique data points and the frequency of them within configured time periods, meaning you can optimise how much space you need. If the majority of the URLs you need to test are static and are tested often, you should find there's a maximum DB size depending on your storage-schemas.conf settings.

# Using S3 for HTML and video
You can store the HTML result on your local agent that runs sitespeed.io or you can dump the data to S3 and serve it from there. To use S3, you need to first [setup a S3 bucket](http://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html).

Then you just configure sitespeed.io to send the data to S3 by configuring the bucket name (and key/secret if that's not available on your server).

You have the result on S3 and you are almost done. You should also configure to send annotations to Graphite for each run.

# Annotations
You can send annotations to Graphite to mark when a run happens so that you can go from the dashboard to a result HTML page.

You do that by configuring the URL that will serve the HTML with the CLI param *resultBaseURL* (the base URL for your S3 bucket) and configure the HTTP Basic auth username/password used by Graphite. Do that by setting *--graphite.auth LOGIN:PASSWORD*.

# Production
To run this in a production environment you should consider/make some modifications.

1. Always run sitespeed.io on a standalone instance
    - This avoids causing discrepancies in results due to things like competing resources or network traffic.
2. Change the default user and password for Grafana.
3. Change the default [user and password for Graphite](https://hub.docker.com/r/sitespeedio/graphite/).
4. Make sure you have configured storage-aggregation.conf in Graphite to fit your needs.
5. Map the Graphite volume to a physical directory outside of Docker to have better control (both Whisper and graphite.db)
6. Remove the sitespeedio/grafana-bootstrap from the Docker compose file, you only need that for the first run.
7. Optional: Disable anonymous users access

## Memory & CPU
How large instance should have? dashboard.sitespeed.io we use a $80 instance on Digital Ocean (8gb memory, 4 Core processors) we use that large instance because Chrome and Firefox needs a lot memory and CPU. It also depends on how complex site is, if you have a lot
Javascript/CSS the browser will need more memory.

If you test a lot a pages (100+) in the same run, your NodeJS process can run out of memory (default memory for NodeJS is 1.76 GB). You can change and increase by setting MAX_OLD_SPACE_SIZE like this in your compose file:

```yaml
services:
    sitespeed.io:
      environment:
        - MAX_OLD_SPACE_SIZE=3072

```
