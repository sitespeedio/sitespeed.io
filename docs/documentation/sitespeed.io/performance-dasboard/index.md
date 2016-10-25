---
layout: default
title: Web Performance Dashboards with sitespeed.io
description: Setup you dashboard using Docker Compose, it cannot be simpler.
keywords: dashboard, docker, documentation, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Web performance dashboard using sitespeed.io.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Performance Dashboard

# Performance Dashboard
{:.no_toc}
We spent a lot of time making it easier in 4.x to install and run your own performance dashboard with pre made dashboards and a Docker compose file to rule them all.

* Lets place the TOC here
{:toc}

# What you needed
You need [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/).

# Up and running in 5 minutes

1. Download our new Docker compose file: curl -O https://FULL_PATH
2. Run: <code>docker-compose up</code>
3. Run sitespeed: <code> docker-compose run sitespeed.io https://www.sitespeed.io/ --graphite.host=graphite</code>
4. Access the dashboard: http://127.0.0.1:3000


If you want to play with the dashboards the default login is sitespeedio and password is YYY.

# How it works
We have prepared a Docker Compose file that downloads and setup Graphite/Grafana and sitespeed.io + a couple of example dashboards. It works perfect when you wanna try it out locally, but if you wanna run it in production you should modify it a bit.

## Docker compose file

## Pre made dashboards
We insert the pre made dashboards using a Docker container using curl. You can check it out: https://github.com/sitespeedio/grafana-bootstrap-docker

# Example dashboards

The dashboards has a couple of templates (the dropdowns at the top of the page). A dashboard that show metrics for a specific page has the following templates:

![Page templates]({{site.baseurl}}/img/templates-page.png)
{: .img-thumbnail}

The *path* is the first path after the first part of the namespace. Using default values the namespace looks like *sitespeed_io.default*. Adding your own metrics you should keep the first part (sitespeed_io) but can change the second. The rest of the templates are self explanatory.


## Page summary
Here you metrics specific to a page.
![Page summary in Grafana]({{site.baseurl}}/img/pagesummary-grafana.png)
{: .img-thumbnail}

## Site summary
![Site summary in Grafana]({{site.baseurl}}/img/sitesummary-grafana.png)
{: .img-thumbnail}

## Timings
![Site summary in Grafana]({{site.baseurl}}/img/timings-grafana.png)
{: .img-thumbnail}

## Visual metrics
We are working on getting SpeedIndex and other VisualMetrics into sitespeed.io.

## 3rd vs. 1st party
To get this up and running you should

## WebPageTest page summary
Have we told you that we love WebPageTest? Yes we have and here are a default WebPagTest page summary.

## WebPageTest site summary


# Production
To run this in production you should do a couple of modifications.

1. Always run sitespeed.io on a standalone instance
    - This avoids causing discrepancies in results due to things like competing resources or network traffic.
2. Change the default user and password for Grafana.
3. Map the Graphite volume to a physical directory outside of Docker to have better control.
4. Remove the sitespeedio/grafana-bootstrap from the Docker compose file, you only need that for the first run.
5. Optional: Disable anonymous users access
