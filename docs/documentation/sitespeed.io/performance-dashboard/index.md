---
layout: default
title: Web Performance Dashboards with sitespeed.io
description: Setup your dashboard using Docker Compose to continuously monitor the performance of your web site.
keywords: dashboard, monitor, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Web performance dashboard using sitespeed.io.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Performance Dashboard

# Performance Dashboard
{:.no_toc}

Monitor the performance of your web site using the performance dashboard.

* Let's place the TOC here
{:toc}

# What you need
You need [Docker](https://docs.docker.com/engine/installation/) and [Docker Compose](https://docs.docker.com/compose/install/). If you haven't used Docker before, you can read [Getting started](https://docs.docker.com/engine/getstarted/). And you can also read/learn more about [Docker Compose](https://docs.docker.com/compose/gettingstarted/) to get a better start.

# Up and running in (almost) 5 minutes

1. Download our Docker compose file: <code>curl -O https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docker/docker-compose.yml</code>
2. Run: <code>docker-compose up -d</code> (make sure you run the latest [Docker compose](https://docs.docker.com/compose/install/) version)
3. Run sitespeed to get some metrics: <code> docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --graphite.host=host.docker.internal https://www.sitespeed.io/</code> (running on Linux? [Check how to access localhost]({{site.baseurl}}/documentation/sitespeed.io/docker/#access-localhost)).
4. Access the dashboard: http://127.0.0.1:3000
5. When you are done you can shut down and remove all the Docker containers by running <code>docker-compose stop && docker-compose rm</code>. Container data will be kept.
6. To start from scratch, also remove the Graphite and Grafana data volumes by running `docker volume rm performancedashboard_graphite performancedashboard_grafana`.


If you want to play with the dashboards, the default login is sitespeedio and password is ...well check out the [docker-compose.yml file](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docker/docker-compose.yml).

When you run this in production make sure to checkout [our production guidelines](#production-guidelines).

## Docker compose file
We have prepared a Docker Compose file that downloads and sets up Graphite/Grafana and sitespeed.io with a couple of example dashboards. It works perfectly when you want to try it out on localhost, but if you want to run it in production, you should modify it by making sure that the metrics are stored outside of your container/volumes. If you prefer InfluxDB over Graphite, you can use that too, but right now we only have [one ready-made dashboard](https://github.com/sitespeedio/grafana-bootstrap-docker/blob/main/dashboards/influxdb/pageSummary.json) for InfluxDB (thank you Olivier Jan for contributing to that dashboard!).

## Pre-made dashboards
We insert ready-made dashboards with a Docker container using curl, making it easy for you to get started. You can check out the container with the dashboards here: [https://github.com/sitespeedio/grafana-bootstrap-docker](https://github.com/sitespeedio/grafana-bootstrap-docker)

# Example dashboards

The [example dashboards](https://dashboard.sitespeed.io) are generic dashboards that will work with all data/metrics you collect using sitespeed.io. We worked hard to make them and the great thing is that you can use them as base dashboards to create additional dashboards if you like.

The dashboards have a couple of templates/variables (the dropdowns at the top of the page) that make the dashboards interactive and dynamic.
A dashboard that shows metrics for a specific page has the following templates:

![Page templates]({{site.baseurl}}/img/templates-page.png)
{: .img-thumbnail}

The *path* is the first path after the namespace. Using the default values, the namespace looks like this: *sitespeed_io.default*.

If you choose one of the values in a template, the rest will be populated. You can choose from checking metrics for a specific page, browser, and connectivity.

The default namespace is *sitespeed_io.default* and the example dashboards are built upon a constant template variable called $base that is the first part of the namespace (that default is *sitespeed_io* but feel free to change that, and then change the constant).

## Page summary
The [page summary](https://dashboard.sitespeed.io/dashboard/db/page-summary) shows metrics for a specific URL/page. The dashboard focuses on how your page was built.

![Page summary]({{site.baseurl}}/img/page-summary.png)
{: .img-thumbnail}

You can also see CPU performance, third party tools and more.

![Page summary and third party]({{site.baseurl}}/img/page-summary-dashboard-2.jpg)
{: .img-thumbnail}

And AXE, CO2 and errors (and a lot more).

![Page summary co2]({{site.baseurl}}/img/page-summary-dashboard-3.jpg)
{: .img-thumbnail}

## The page timings summary

The [page timings summary](https://dashboard.sitespeed.io/dashboard/db/page-timing-metrics) focuses on timing metrics and is the number one dashboard you should use when you look for visual regressions. It also shows all other timing metrics that are collected.

You can follow visual metrics.

![Page timing dashboard]({{site.baseurl}}/img/page-timings-dashboard.jpg)
{: .img-thumbnail}

And compare the metrics with last weeks metrics.

![Page timing dashboard compared with last week]({{site.baseurl}}/img/page-timings-dashboard-2.jpg)
{: .img-thumbnail}

You will also see navigation timing, element timing and user timings.

![Page timing with element timings]({{site.baseurl}}/img/page-timings-dashboard-3.jpg)
{: .img-thumbnail}


## Site summary
The [site summary dashboard](https://dashboard.sitespeed.io/dashboard/db/site-summary) shows metrics for a site (a summary of all URLs tested for that domain).

![Site summary]({{site.baseurl}}/img/site-summary-dashboard.jpg)
{: .img-thumbnail}


![Site summary with more metrics]({{site.baseurl}}/img/site-summary-dashboard-2.jpg)
{: .img-thumbnail}


## The leaderboard
We are so proud of our [leaderboard dashboard](https://dashboard.sitespeed.io/dashboard/db/leaderboard) that it got its own [documentation page](/documentation/sitespeed.io/leaderboard/). Use the dashboard if you want to compare different sites or URLs.

![Page summary]({{site.baseurl}}/img/leaderboard-dashboard.jpg)
{: .img-thumbnail}


## Chrome User Experience Report

Using our [Chrome User Experience Report plugin](/documentation/sitespeed.io/crux/) you can get the metrics Chrome collects from real users. We have a [ready made dashboard](https://dashboard.sitespeed.io/dashboard/db/chrome-user-experience-report) where you can look at the data on URL and origin level.

![CruX]({{site.baseurl}}/img/crux-dashboard.jpg)
{: .img-thumbnail}

## WebPageTest dashboards
We have four optional dashboards for WebPageTest that you can use if you drive WebPageTest using sitespeed.io. They follow the same pattern as the sitespeed.io dashboards with WebPageTest data.

### WebPageTest page summary
We have a dashboard to summarise the WebPageTest results per `path` and here is an example of a default [WebPageTest page summary](https://dashboard.sitespeed.io/dashboard/db/webpagetest-page-summary) where you can look at results for individual URLs.


![Page summary]({{site.baseurl}}/img/webpagetest-pagesummary-dashboard.jpg)
{: .img-thumbnail}


### WebPageTest timing metrics
There is also a dashboard for [the timing metrics](https://dashboard.sitespeed.io/dashboard/db/webpagetest-page-timing-metrics).

![Timing metrics WebPageTest]({{site.baseurl}}/img/webpagetest-metricsummary-dashboard.jpg)
{: .img-thumbnail}

### WebPageTest site summary
And then there is also a dashboard for [all tested pages of a site](https://dashboard.sitespeed.io/dashboard/db/webpagetest-site-summary).

![Site summary]({{site.baseurl}}/img/webpagetest-sitesummary-dashboard.jpg)
{: .img-thumbnail}


### WebPageTest leaderboard
Of course we also created a [leaderboard dashboard](https://dashboard.sitespeed.io/dashboard/db/webpagetest-leaderboard).

![Leaderboard for WebPageTest]({{site.baseurl}}/img/webpagetest-leaderboard-dashboard.jpg)
{: .img-thumbnail}


## Plus 1
We also have a dashboard for [showing GPSI/CrUx/Lighthouse metrics](https://dashboard.sitespeed.io/dashboard/db/plus1) if you use those products.

![Plus 1 dashboard]({{site.baseurl}}/img/plus-1-dashboard.jpg)
{: .img-thumbnail}

![Plus 1 dashboard part 2]({{site.baseurl}}/img/plus-1-dashboard-2.jpg)
{: .img-thumbnail}


## Whatever you want
Do you need anything else? Since we store all the data in Graphite and use Grafana you can create your own dashboards, which is super simple!

If you are new to [Grafana](https://grafana.com) you should checkout the [basic concepts](https://grafana.com/docs/guides/basic_concepts/) as a start. Grafana is used by Cern, NASA and many many tech companies like Paypal, Ebay and Digital Ocean and it will surely work for you too :)

You can configure all the thresholds (green/yellow/red) so that they match youre needs:

![Configure thresholds in Grafana]({{site.baseurl}}/img/configuring-thresholds-grafana.jpg)
{: .img-thumbnail}

# Configure running your tests
No that you have the dashboards you need to collect metrics. You can collect metrics on one or multiple servers. Do not do it on the same server as the dashboard setup since you want to have an as isolated environment as possible for your tests.

Go to the documentation on how to [continuously run your tests](/documentation/sitespeed.io/continuously-run-your-tests/) and learn how you can do that.

If you run the tests on a standalone server, you need to make sure your agents send the metrics to your Graphite server. Configure `--graphite.host` to the public IP address of your server. The default port when sending metrics to Graphite is 2003, so you don't have to include that.

# Configure Graphite
We provide an example Graphite Docker container for non-production purposes. If you want to put that into production, you need to change the configuration. Check out our own [Graphite documentation](/documentation/sitespeed.io/graphite/#configure-graphite).

# Using S3 for HTML and video
You can store the HTML result on your local agent that runs sitespeed.io, or you can dump the data to S3 or GCS and serve it from there. To use S3, you first need to [set up a S3 bucket](http://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html). For GCS follow the instructions to set up a [Google Cloud storage](https://cloud.google.com/storage/docs/creating-buckets) (GCS) bucket.

Then you configure sitespeed.io to send the data to S3 by configuring the bucket name (and AWS key/secret if that's not available on your server). For GCS you need to provide the name of the bucket, service account key and the project id.

Now, you have the result on S3 or GCS and you're almost done. You should also configure sending annotations to Graphite for each run.

# Annotations
You can send annotations to Graphite to mark when a run happens, that you can go from the dashboard to any HTML-results page.

You send annotations by configuring the URL that will serve the HTML with the CLI param *resultBaseURL* (the base URL for your S3 or GCS bucket) and configure the HTTP Basic auth username/password used by Graphite. You can do that by setting <code>--graphite.auth LOGIN:PASSWORD</code>.

You can also modify the annotation, append your own text/HTML and add your own tags.
Append a message to the annotation with <code>--graphite.annotationMessage</code>. That way you can add links to a specific branch or whatever you deem helpful to you. If needed, set a custom title with <code>--graphite.annotationTitle</code> instead of the default title that displays the number of runs of the test.

You can add extra tags with <code>--graphite.annotationTag</code>. For multiple tags, add the parameter multiple times. Just make sure that the tags don't collide with our internal tags.

# Production Guidelines

Here are a couple of things you should check out before you setup sitespeed.io for production.

## Setup (important!)
To run this in production (=not on your local dev machine) you should make some modifications:

1. Always run sitespeed.io on a stand-alone instance
    - This avoids causing discrepancies in results, due to things like competing resources or network traffic. Then you just run sitespeed.io with docker run ...
    - Run Grafana/Graphite on another server instance (only docker compose for Graphite/Grafana).
2. Change the default user and password for Grafana.
3. Change the default [user and password for Graphite](https://hub.docker.com/r/sitespeedio/graphite/).
4. Make sure you have [configured storage-aggregation.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docker/graphite/conf/storage-aggregation.conf) in Graphite to fit your needs.
5. Configure your [storage-schemas.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docker/graphite/conf/storage-schemas.conf) to set how long you want to store your metrics.
6. *MAX_CREATES_PER_MINUTE* is usually quite low by default in [carbon.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docker/graphite/conf/carbon.conf). That means you will not get all the metrics created for the first run, so you can increase it if you want to.
7. Map the Graphite volume to a physical directory outside of the Docker container to have better control (both Whisper and [graphite.db](https://github.com/sitespeedio/sitespeed.io/blob/main/docker/graphite/graphite.db)). Map them like this on your physical server (make sure to copy the empty [graphite.db]((https://github.com/sitespeedio/sitespeed.io/blob/main/docker/graphite/graphite.db) by browser or by CLI `wget https://github.com/sitespeedio/sitespeed.io/raw/main/docker/graphite/graphite.db`) file):
 - /path/on/server/whisper:/opt/graphite/storage/whisper
 - /path/on/server/graphite.db:/opt/graphite/storage/graphite.db
8. Remove the sitespeedio/grafana-bootstrap from the Docker compose file, you only need that for the first run.
9. Optional: Disable anonymous users access in Grafana.

## System Requirements / Memory & CPU
How large will your instances need to be to run the tests? You need to have enough memory for Chrome/Firefox (yep they can really use a lot of memory for some sites). Before, we used a $80 instance on Digital Ocean (8GB memory, 4 Core processors) but we switched to use AWS c5.large for dashboard.sitespeed.io. We have tried out most cloud providers and at the time AWS gave us the most stable metrics.

To summarize, your test should performe well on (physical or virtual) hardware greater than:
 - 8GB Memory
 - 4 CPUs

If you test a lot of pages (100+) in the same run, your NodeJS process may run out of memory (default memory for NodeJS is 1.76 GB). You can change and increase the NodeJS max memory per process by setting MAX_OLD_SPACE_SIZE:

```bash
docker run -e MAX_OLD_SPACE_SIZE=4096 --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/
```

## Cost
Sitespeed.io is Open Source and totally free. But what does it cost to have an instance of sitespeed.io up and running?

Setting up an [AWS instance](https://aws.amazon.com/) c5.large has an upfront price $515 for a year (it is much cheaper to pay up front). Or you can use an optimized Droplet for $40 a month at [Digital Ocean](https://www.digitalocean.com/) (they have served us well in our testing).

You also need to pay for S3 (to store the videos and HTML). For [https://dashboard.sitespeed.io](https://dashboard.sitespeed.io) we pay $10-15 per month (depending how long you want to store the data).

Does your organisation already use Graphite/InfluxDB and Grafana? Then use what you have. Otherwise you need to have a server hosting Graphite/Grafana. We pay $20 per month at Digital Ocean for that. Depending on how many metrics and for how long you want to store them, you may need an extra disk. As always, you should also backup your data.

How many runs can you do per month? Many of the paid services, you also pay per run or have a maximum amount of runs. With our one instance at AWS we do 11 runs for 9 different URLs then we run 5 runs for 4 other URLs. That is 119 runs per hour. 2856 per day and 85680 runs per month. We test Wikipedia on our instance so it is possible that your site is a little slower, then you will not be able to make the same amount of runs per month.

Total cost:

 * $515 per AWS agent or $480 on Digital Ocean (80000+ tests per month per agent) per year
 * S3 $10-15 with data
 * Server for Graphite/Grafana

You also need to think of the time it takes for you to set it up and upgrade new Docker containers when there are new browser versions and new versions of sitespeed.io. Updating to a new Docker container on one server usually takes less than 2 minutes :)

