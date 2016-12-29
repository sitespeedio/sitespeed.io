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

We spent a lot of time making it easier in 4.x to install and run your own performance dashboard with pre made dashboards and a Docker compose file to rule them all. You can see the beauty [here](https://dashboard.sitespeed.io).

# What you need
You need [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/). If you haven't used Docker before, you can read [Getting started](https://docs.docker.com/engine/getstarted/). And you can also read/learn more about [Docker Compose](https://docs.docker.com/compose/gettingstarted/) to get a better start.

# Up and running in 5 minutes

1. Download our new Docker compose file: <code>curl -O https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/docker-compose.yml</code>
2. Run: <code>docker-compose up</code> (make sure you run the latest [Docker compose](https://docs.docker.com/compose/install/) version)
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

[![Page summary in Grafana]({{site.baseurl}}/img/pagesummary-grafana.png)](https://dashboard.sitespeed.io/dashboard/db/page-summary)
{: .img-thumbnail}

## Site summary
The site summary show metrics for a site (a summary of all URLs tested for that domain).

[![Site summary in Grafana]({{site.baseurl}}/img/sitesummary-grafana.png)](https://dashboard.sitespeed.io/dashboard/db/site-summary)
{: .img-thumbnail}

## Timings
The Timings dashboard shows how you can look at timings for URL.

[![Timings in Grafana]({{site.baseurl}}/img/timings-grafana.png)](https://dashboard.sitespeed.io/dashboard/db/timings)
{: .img-thumbnail}

## Visual metrics
We are working on getting SpeedIndex and other VisualMetrics into sitespeed.io and you can try it out but it is still experimental.

[![Visual Metrics]({{site.baseurl}}/img/visualmetrics.png)](https://dashboard.sitespeed.io/dashboard/db/visual-metrics)
{: .img-thumbnail}

## 3rd vs. 1st party
How much impact to 3rd party code has on your page? To get this up and running you should need to configure the <code>--firstParty</code> parameter/regex when you run.

[![3rd vs 1st]({{site.baseurl}}/img/3rd.png)](https://dashboard.sitespeed.io/dashboard/db/3rd-vs-1st-party)
{: .img-thumbnail}

## WebPageTest page summary
Have we told you that we love WebPageTest? Yes we have and here are a default WebPagTest page summary where you can look at results for individual URLs.

[![WebPageTest page summary]({{site.baseurl}}/img/webpagetestPageSummary.png)](https://dashboard.sitespeed.io/dashboard/db/webpagetest-page-summary)
{: .img-thumbnail}


## WebPageTest site summary
And then also for all tested pages of a site.

[![WebPageTest site summary]({{site.baseurl}}/img/webpagetestSiteSummary.png)](https://dashboard.sitespeed.io/dashboard/db/webpagetest-site-summary)
{: .img-thumbnail}

## Whatever you want
Do you need anything else? Since we store all the data in Graphite and use Grafana you can create your own dashboards, it super simple!

# Get the metrics
You have the dashboard and you need to collect metrics. Using the crontab works fine or whatever kind of scheduler you are using (or Jenkins per build or ... whatever suits you the best).

Using the crontab (on a standalone server) you do like this:
<code>crontab -e</code> to edit the crontab. Make sure you users cron can run Docker and change *my.graphite.host* to your Graphite host.

~~~
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
0,30 * * * * docker run --privileged --rm sitespeedio/sitespeed.io:4.0 -n 5 --graphite.host my.graphite.host -c cable -b chrome https://en.wikipedia.org/wiki/Sweden >> /tmp/sitespeed-output.txt 2>&1
~~~

# Production
To run this in production you should do a couple of modifications.

1. Always run sitespeed.io on a standalone instance
    - This avoids causing discrepancies in results due to things like competing resources or network traffic.
2. Change the default user and password for Grafana.
3. Map the Graphite volume to a physical directory outside of Docker to have better control.
4. Remove the sitespeedio/grafana-bootstrap from the Docker compose file, you only need that for the first run.
5. Optional: Disable anonymous users access
