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


If you want to play with the dashboards, the default login is sitespeedio and password is ...well check out the [docker-compose.yml file](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/docker-compose.yml).

When you run this in production make sure to checkout [our production guidelines](#production-guidelines).

## Docker compose file
We have prepared a Docker Compose file that downloads and sets up Graphite/Grafana and sitespeed.io with a couple of example dashboards. It works perfectly when you want to try it out on localhost, but if you want to run it in production, you should modify it by making sure that the metrics are stored outside of your container/volumes. If you prefer InfluxDB over Graphite, you can use that too, but right now we only have [one ready-made dashboard](https://github.com/sitespeedio/grafana-bootstrap-docker/blob/master/dashboards/influxdb/pageSummary.json) for InfluxDB (thank you Olivier Jan for contributing to that dashboard!).

## Pre-made dashboards
We insert ready-made dashboards with a Docker container using curl, making it easy for you to get started. You can check out the container with the dashboards here: [https://github.com/sitespeedio/grafana-bootstrap-docker](https://github.com/sitespeedio/grafana-bootstrap-docker)

# Example dashboards

The [example dashboards](https://dashboard.sitespeed.io) are generic dashboards that will work with all data/metrics you collect using sitespeed.io. We worked hard to make them and the great thing is that you can use them as base dashboards, then create additional dashboards if you like.

The dashboards has a couple of templates (the dropdowns at the top of the page) that makes the dashboard interactive and dynamic.
A dashboard that show metrics for a specific page has the following templates:

![Page templates]({{site.baseurl}}/img/templates-page.png)
{: .img-thumbnail}

The *path* is the first path after the namespace. Using the default values, the namespace looks like this: *sitespeed_io.default*.

When you choose one of the values in a template, the rest will be populated. You can choose from checking metrics for a specific page, browser, and connectivity.

The default namespace is *sitespeed_io.default* and the example dashboards are built upon a constant template variable called $base that is the first part of the namespace (that default is *sitespeed_io* but feel free to change that, and then change the constant).

## Page summary
The [page summary](https://dashboard.sitespeed.io/dashboard/db/page-summary) shows metrics for a specific URL/page.


## The page timings summary

The [page timings summary](https://dashboard.sitespeed.io/dashboard/db/page-timing-metrics) focus on Visual Metrics and is the number one dashboard you should use when you look for visual regressions.


## Site summary
The [site summary](https://dashboard.sitespeed.io/dashboard/db/site-summary) show metrics for a site (a summary of all URLs tested for that domain).

## 3rd vs. 1st party
How much does 3rd party code impact your page? To get this up and running, you should only need to configure the <code>--firstParty</code> parameter/regex when you run.

You can see the [3rd vs. 1st party dashboard here](https://dashboard.sitespeed.io/dashboard/db/3rd-vs-1st-party).

## WebPageTest dashboards
We have two optional dashboards for WebPageTest to show how you can build them if you use WebPageTest through sitespeed.io.

### WebPageTest page summary
Have we told you that we love WebPageTest? Yes, we have and here is an example of a default [WebPageTest page summary](https://dashboard.sitespeed.io/dashboard/db/webpagetest-page-summary) where you can look at results for individual URLs.

### WebPageTest site summary
And then there is also a dashboard for [all tested pages of a site](https://dashboard.sitespeed.io/dashboard/db/webpagetest-site-summary).

## Whatever you want
Do you need anything else? Since we store all the data in Graphite and use Grafana you can create your own dashboards, which is super simple!

# Configuration setup
You have the dashboard and you need to collect metrics. Using the crontab works fine or or you can just run an infinite loop.

Using the crontab (on a standalone server) you do like this:
<code>crontab -e</code> to edit the crontab. Make sure your cron user can run Docker and change *my.graphite.host* to your Graphite host. When you run this on a standalone server *my.graphite.host* will be the public IP address of your server. The default port when sending metrics to Graphite is 2003, so you don't have to include that.

On [dashboard.sitespeed.io](https://dashboard.sitespeed.io) we have the following setup:

We have a small shell script that runs the tests. It is triggered from the cron and uses a configuration file (default.json) where we have the default configuration used for all tests (we then override some config values directly when we start the test). We also have a bash file that sets up the network.

Our *run.sh* file (we read which URLs we want to test from files):

## Shell script
~~~
#!/bin/bash
# Specify the exact version of sitespeed.io. When you upgrade to the next version, pull it down and the chage the tag
DOCKER_CONTAINER=sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}

# Setup the network and default ones we wanna use
sudo /home/ubuntu/startNetworks.sh
THREEG="--network 3g"
CABLE="--network cable"

# Simplify some configurations
CONFIG="--config /sitespeed.io/default.json"
DOCKER_SETUP="--shm-size=1g --rm -v /home/ubuntu/config:/sitespeed.io -v /result:/result -v /etc/localtime:/etc/localtime:ro --name sitespeed"

# Start running the tests
# We run more tests on our test server but this gives you an idea of how you can configure it
docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER -n 11 --browsertime.viewPort 1920x1080 --browsertime.cacheClearRaw --browsertime.chrome.collectTracingEvents /sitespeed.io/wikipedia.org.txt $CONFIG
docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER -n 11 --browsertime.viewPort 1920x1080 /sitespeed.io/wikipedia.org.txt -b firefox $CONFIG
docker run $THREEG $DOCKER_SETUP $DOCKER_CONTAINER --graphite.namespace sitespeed_io.emulatedMobile --browsertime.chrome.collectTracingEvents /sitespeed.io/m.wikipedia.org.txt -c 3g --mobile true $CONFIG

# We remove all docker stuff to get a clean next run
docker system prune --all --volumes -f

# Get the container so we have it the next time we wanna use it
docker pull $DOCKER_CONTAINER
~~~

## Crontab
We trigger the script from the crontab. We run the script every hour.

~~~
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
0 * * * * /root/runs.sh >> /tmp/sitespeed.io.log 2>&1
~~~

## Infinite loop
Another way is to just run the script in an infinite loop and then have a file that you remove (so the run stops) when you want to update your instance.

~~~
#!/bin/bash
LOGFILE=/tmp/s.log
exec > $LOGFILE 2>&1
CONTROL_FILE=/home/ubuntu/sitespeed.run

if [ -f "$CONTROL_FILE" ]
then
  echo "$CONTROL_FILE exist, do you have running tests?"
  exit 1;
else
  touch $CONTROL_FILE
fi

DOCKER_CONTAINER=sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}

function cleanup() {
  docker system prune --all --volumes -f
  docker pull $DOCKER_CONTAINER
}

function control() {
  if [ -f "$CONTROL_FILE" ]
  then
    echo "$CONTROL_FILE found. Make another run ..."
  else
    echo "$CONTROL_FILE not found - stopping after cleaning up ..."
    cleanup
    echo "Exit"
    exit 0;
  fi
}

while true
do

  DOCKER_SETUP="--shm-size=1g --rm -v /home/ubuntu/config:/sitespeed.io -v /result:/result -v /etc/localtime:/etc/localtime:ro "
  THREEG="--network 3g"
  THREEGEM="--network 3gem"
  CABLE="--network cable"
  CONFIG="--config /sitespeed.io/default.json"
  echo 'Start a new loop '
  echo "Start the networks ..."
  sudo /home/ubuntu/startNetworks.sh
  docker network ls

  docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER -n 7 --browsertime.viewPort 1920x1080 --browsertime.cacheClearRaw true /sitespeed.io/wikipedia.org.txt $CONFIG
  control
  docker run $CABLE $DOCKER_SETUP $DOCKER_CONTAINER -n 7 --browsertime.viewPort 1920x1080 /sitespeed.io/wikipedia.org.txt -b firefox $CONFIG
  cleanup
done
~~~

## default.json
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

## Docker networks
And we set up the following Docker networks (*startNetworks.sh*):

~~~
#!/bin/bash
echo 'Starting Docker networks'
docker network create --driver bridge --subnet=192.168.33.0/24 --gateway=192.168.33.10 --opt "com.docker.network.bridge.name"="docker1" 3g
tc qdisc add dev docker1 root handle 1: htb default 12
tc class add dev docker1 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker1 parent 1:12 netem delay 150ms

docker network create --driver bridge --subnet=192.168.34.0/24 --gateway=192.168.34.10 --opt "com.docker.network.bridge.name"="docker2" cable
tc qdisc add dev docker2 root handle 1: htb default 12
tc class add dev docker2 parent 1:1 classid 1:12 htb rate 5mbit ceil 5mbit
tc qdisc add dev docker2 parent 1:12 netem delay 14ms

docker network create --driver bridge --subnet=192.168.35.0/24 --gateway=192.168.35.10 --opt "com.docker.network.bridge.name"="docker3" 3gfast
tc qdisc add dev docker3 root handle 1: htb default 12
tc class add dev docker3 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker3 parent 1:12 netem delay 75ms

docker network create --driver bridge --subnet=192.168.36.0/24 --gateway=192.168.36.10 --opt "com.docker.network.bridge.name"="docker4" 3slow
tc qdisc add dev docker4 root handle 1: htb default 12
tc class add dev docker4 parent 1:1 classid 1:12 htb rate 0.4mbit ceil 0.4mbit
tc qdisc add dev docker4 parent 1:12 netem delay 200ms
~~~

# Configure Graphite
We provide an example Graphite Docker container and when you put that into production, you need to change the configuration.
The configuration depends on how often you want to run your tests. How long you want to keep the result, and how much disk space you want to use.

Starting with version 4 we tried to send a moderated number of metrics per URL but you can [change that yourself]({{site.baseurl}}/documentation/sitespeed.io/metrics/).

When you store metrics for a URL in Graphite, you decide from the beginning how long and how often you want to store the data, in [storage-schemas.conf](https://github.com/sitespeedio/docker-graphite-statsd/blob/master/conf/graphite/storage-schemas.conf). In our example Graphite setup, every key under sitespeed_io is caught by the configuration in storage-schemas.conf that looks like:

~~~
[sitespeed]
pattern = ^sitespeed_io\.
retentions = 10m:60d,30m:90d
~~~

Every metric that is sent to Graphite following the pattern (the namespace starting with sitespeed_io), Graphite prepares storage for it every ten minutes the first 60 days; after that Graphite uses the configuration in [storage-aggregation.conf](https://github.com/sitespeedio/docker-graphite-statsd/blob/master/conf/graphite/storage-aggregation.conf) to aggregate/downsize the metrics the next 90 days.

Depending on how often you run your analysis, you may want to change the storage-schemas.conf. With the current config, if you analyse the same URL within 10 minutes, one of the runs will be discarded. But if you know you only run once an hour, you could increase the setting. Etsy has some really [good documentation](https://github.com/etsy/statsd/blob/master/docs/graphite.md) on how to configure Graphite.

One thing to know if you change your Graphite configuration: ["Any existing metrics created will not automatically adopt the new schema. You must use whisper-resize.py to modify the metrics to the new schema. The other option is to delete existing whisper files (/opt/graphite/storage/whisper) and restart carbon-cache.py for the files to get recreated again."](http://mirabedini.com/blog/?p=517)
{: .note .note-warning}

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

Here are a couple of things you should check before you setup sitespeed.io for production.

## Setup (important!)
To run this in a production environment, you should consider/make some modifications:

1. Always run sitespeed.io on a stand-alone instance
    - This avoids causing discrepancies in results, due to things like competing resources or network traffic. Then you just run sitespeed.io with docker run ... (only docker compose for Graphite/Grafana).
    - Run Grafana/Graphite on another server instance.
2. Change the default user and password for Grafana.
3. Change the default [user and password for Graphite](https://hub.docker.com/r/sitespeedio/graphite/).
4. Make sure you have [configured storage-aggregation.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/graphite/conf/storage-aggregation.conf) in Graphite to fit your needs.
5. Configure your [storage-schemas.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/graphite/conf/storage-schemas.conf) how long you wanna store your metrics.
6. *MAX_CREATES_PER_MINUTE* is usually quite low in [carbon.conf](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/docker/graphite/conf/carbon.conf). That means you will not get all the metrics created for the first run, so you can increase it.
7. Map the Graphite volume to a physical directory outside of Docker to have better control (both Whisper and [graphite.db](https://github.com/sitespeedio/sitespeed.io/blob/master/docker/graphite/graphite.db)). Map them like this on your physical server (make sure to copy the empty [grahite.db]((https://github.com/sitespeedio/sitespeed.io/blob/master/docker/graphite/graphite.db)) file):
 - /path/on/server/whisper:/opt/graphite/storage/whisper
 - /path/on/server/graphite.db:/opt/graphite/storage/graphite.db
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

## Cost
Sitespeed.io is Open Source and totally free. But what does it cost to have an instance of sitespeed.io up and running?

Setting up an [AWS instance](https://aws.amazon.com/) C4.large has an upfront price $515 for a year (it is much cheaper to pay upfront). You also need to pay for S3 (to store the videos and HTML). For [https://dashboard.sitespeed.io](https://dashboard.sitespeed.io) we pay $10-15 per month (depending how long time you want to store the data).

Do your organisation already use Graphite/InfluxDB and Grafana? Then use what you have. Else you need to have a server hosting Graphite/Grafana. We pay $20 per month at Digital Ocean for that. Depending on how many metrics and for how long time you wanna store them, you maybe need and extra disk. And you should also always backup your data.

How many runs can you do per month? Many of the paid services you also pay per run or have a maximum amount of runs. With our one instance at AWS we do 11 runs for 9 different URLs then we run 5 runs for 4 other URLs. That is 119 runs per hour. 2856 per day and 85680. We test Wikipedia at our instance so it can be that your site is a little slower, then you will not be able to make the same amount of runs per month.

Total cost:

 * $515 per AWS agent (80000+  per month per agent) per year
 * S3 $10-15 with data
 * Server for Graphite/Grafana

You also need to think of the time it takes for you to set it up and upgrade new Docker containers when there are new browser versions and new versions of sitespeed.io. Updating to a new Docker container on one server usually takes less than 2 minutes :)

## Keeping your instance updated
We constantly do new Docker release: bug fixes, new functionality and new versions of the browser. To keep your instance updated, follow the following work flow.

Log into your instance and pull the latest version of sitespeed.io:

~~~bash
docker pull sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}
~~~

Then update your script so it uses the new version ({% include version/sitespeed.io.txt %} in this case). The next time sitespeed.io runs, it will use the new version.

Go into the Grafana dashboard and create a new annotation, telling your team mates that you updated to the new version. This is real important so you can keep track of browser updates and other changes that can affect your metrics.
