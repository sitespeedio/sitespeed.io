---
layout: default
title: Tutorial - Monitor your pages with Grafana.
description: Start Graphite and Grafana with Docker Compose, send your tests there, read the dashboards and get an alert when a page gets slower.
keywords: tutorial, grafana, graphite, dashboard, monitoring, alert, docker compose, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Monitor your pages with sitespeed.io, Graphite and Grafana.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Tutorials]({{site.baseurl}}/documentation/sitespeed.io/tutorials/) / Monitor your pages with Grafana

# Monitor your pages with Grafana
{:.no_toc}

{:toc}

In this tutorial you start Graphite and Grafana on your computer, send your tests there and read the dashboards. Then you make a page slower and see it on the start page of Grafana, with an alert. At the end you know how to test your pages every 30 minutes and follow them over time.

**You need:**
* [Docker](https://www.docker.com/get-started/) installed and running, with Docker Compose (Docker Desktop has it).
* [Git](https://git-scm.com/downloads).
* A terminal.
* About 30 minutes. Most of it is waiting for the tests.

If you have not used sitespeed.io before, do [Test your first page and read the report](../first-test/) first. The last part of this tutorial uses the compare plugin, which [Find out if a change made your page slower](../find-a-regression/) explains.

## How it works

sitespeed.io sends the metrics of each test to [Graphite](https://graphiteapp.org/), a database for numbers over time. [Grafana](https://grafana.com/) reads them from Graphite and shows them in dashboards. We have a Docker Compose file that starts both, with our dashboards and an alert already set up. The same dashboards run on [dashboard.sitespeed.io](https://dashboard.sitespeed.io/).

## Step 1: Start Graphite and Grafana

Get the Docker Compose file and the dashboards from the sitespeed.io repository, and start them:

~~~bash
git clone --depth 1 https://github.com/sitespeedio/sitespeed.io.git
cd sitespeed.io/docker
docker compose up -d
~~~

The first time, Docker downloads Grafana, Graphite and OpenSearch. When the command is done, open [http://localhost:3000](http://localhost:3000). You see the **Welcome to sitespeed.io** dashboard. It is empty, because you have not sent any tests yet.

You can look at all dashboards without logging in. To change a dashboard, log in with the user `sitespeedio` and the password in the [docker-compose.yml](https://github.com/sitespeedio/sitespeed.io/blob/main/docker/docker-compose.yml) file.

## Step 2: Send a test to Graphite

Open a second terminal and go to an empty folder. The tests write their HTML reports there. Run:

~~~bash
docker run --rm --network docker_default -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ https://www.sitespeed.io/documentation/ -n 3 --slug myTest --graphite.host graphite --graphite.addSlugToKey true
~~~

On Windows in PowerShell, use `${pwd}` without quotes instead of `"$(pwd)"`.

* `--network docker_default` starts the test in the same Docker network as Graphite and Grafana. Docker Compose names the network after the folder (`docker`). If you started Docker Compose in another folder, run `docker network ls` to see the name.
* `--graphite.host graphite` sends the metrics to Graphite. In the Docker network, `graphite` is the name of the Graphite container.
* `--slug myTest --graphite.addSlugToKey true` gives the test a name. The dashboards need it to find your test.

The test takes about a minute and tests two pages, three runs each.

## Step 3: Read the dashboards

Go back to Grafana and open the dashboard **Page metrics** (click **Dashboards** in the menu). Choose **testname** `myTest`, **domain** `www_sitespeed_io` and **page** `_`. Graphite cannot have `/` in a name, so sitespeed.io writes the path of the page with `_`: `_` is the start page and `_documentation_` is `/documentation/`.

![The Page metrics dashboard]({{site.baseurl}}/img/tutorial-grafana-page-metrics.jpg){:loading="lazy"}
{: .img-thumbnail}

Page metrics shows one page. The tabs (Google Web Vitals, Visual metrics, Timings, Size and requests, CPU and more) show the metrics over time. The tiles show the last value and the change since the value before. Hover the **(i)** next to a panel title to see what it shows.

The boxes **Meta data for the test**, **Screenshot from last run** and **Video** are empty. They read the latest result from a web server. When you [publish your results](/documentation/sitespeed.io/performance-dashboard/#how-to-get-the-latest-video-screenshot-visible-in-grafana), for example to S3, they show the latest screenshot, video and the settings of the test.

Now open the dashboard **Leaderboard**. It shows all pages of a test side by side, so you can see which page is the slowest. Click a page to open it in Page metrics.

![The Leaderboard dashboard]({{site.baseurl}}/img/tutorial-grafana-leaderboard.jpg){:loading="lazy"}
{: .img-thumbnail}

## Step 4: Test every 30 minutes

One test gives you one dot in each graph. To see lines, test again and again. In our Docker Compose setup, Graphite keeps one value for each page every 30 minutes, for 40 days. If you test a page more often, the last test in each 30 minutes overwrites the tests before it. So test every 30 minutes:

~~~bash
while true; do
  docker run --rm --network docker_default -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ https://www.sitespeed.io/documentation/ -n 3 --slug myTest --graphite.host graphite --graphite.addSlugToKey true
  sleep 1800
done
~~~

On Windows in PowerShell:

~~~bash
while ($true) { docker run --rm --network docker_default -v ${pwd}:/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ https://www.sitespeed.io/documentation/ -n 3 --slug myTest --graphite.host graphite --graphite.addSlugToKey true; Start-Sleep -Seconds 1800 }
~~~

Leave it running and come back in a few hours. Stop the loop with `Ctrl+C`. To store more values or keep them longer, change the [Graphite configuration](/documentation/sitespeed.io/graphite/).

## Step 5: See when a page gets slower

Grafana can tell you when a page gets slower. For that, the test must compare itself with a baseline, like in [Find out if a change made your page slower](../find-a-regression/). If the loop from step 4 runs, stop it first with `Ctrl+C`.

Save a baseline of the start page:

~~~bash
docker run --rm --network docker_default -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ -n 21 --slug myTest --graphite.host graphite --graphite.addSlugToKey true --compare.id start_page --compare.saveBaseline
~~~

Then test again with a script that keeps the browser busy for 300 ms, the same as a new script on the page that blocks the browser:

~~~bash
docker run --rm --network docker_default -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ -n 21 --slug myTest --graphite.host graphite --graphite.addSlugToKey true --compare.id start_page --injectJs "const end = Date.now() + 300; while (Date.now() < end) {}"
~~~

Each test takes about 5 minutes. When the second test is done, open the **Welcome to sitespeed.io** dashboard again.

![The Welcome dashboard with a page that got slower and a firing alert]({{site.baseurl}}/img/tutorial-grafana-welcome.jpg){:loading="lazy"}
{: .img-thumbnail}

* **Pages that got slower** lists the start page (`_`). When we made this tutorial, 13 metrics were significantly slower than the baseline. Click the page to open the **Regressions** tab of Page metrics, which tells you which metrics got slower.
* **Alerts** shows the alert **Page got slower**. Grafana checks it every 5 minutes, so it can take up to 5 minutes after the test before it fires. The alert stops by itself when the last comparison of the page, in the last 2 hours, has no slower metrics.

The alert only shows in Grafana. To get a message, add a [contact point](https://grafana.com/docs/grafana/latest/alerting/configure-notifications/manage-contact-points/) in Grafana, for example Slack or email, and use it in the default notification policy. See [Alert on data in Graphite](/documentation/sitespeed.io/compare/#alert-on-data-in-graphite).

## Step 6: Stop Graphite and Grafana

In the terminal where you started Docker Compose (the `sitespeed.io/docker` folder), run:

~~~bash
docker compose down
~~~

Your metrics are kept in Docker volumes, so they are there the next time you run `docker compose up -d`. To delete them, run `docker compose down -v`.

## Run it on a server

This setup is for your own computer. Do not start it like this on a server that other people can reach:
* Grafana uses the user and password from the Docker Compose file, which everyone can read on GitHub.
* Anyone who can reach Graphite (ports 2003 and 8080) can send and read metrics, and anyone who can reach OpenSearch (port 9200) can read and delete data. None of them asks for a password.
* Docker opens these ports also when you have a firewall like ufw, so you must block them in the Docker firewall rules.

On a server, also run the tests on another machine than Graphite and Grafana, so that they do not slow down each other. Read [Setup (important!)](/documentation/sitespeed.io/performance-dashboard/#setup-important) before you start.

## Summary

You have:
* Started Graphite and Grafana with our dashboards.
* Sent tests to Graphite and read Page metrics and the Leaderboard.
* Learned that Graphite keeps one value for each page every 30 minutes, and how to test every 30 minutes.
* Made a page slower and seen it on the Welcome dashboard, with an alert.

## Learn more

* [Performance dashboard](/documentation/sitespeed.io/performance-dashboard/): all dashboards, and how to set up Graphite and Grafana for production.
* [Graphite](/documentation/sitespeed.io/graphite/): how long and how often Graphite stores your metrics.
* [Continuously run your tests](/documentation/sitespeed.io/continuously-run-your-tests/): how we run the tests for dashboard.sitespeed.io on a server.
* [Find regressions over time](/documentation/sitespeed.io/compare/#find-regressions-over-time): the trend plugin finds pages that got slower over days, also for tests with few runs.
* [dashboard.sitespeed.io](https://dashboard.sitespeed.io/): the same dashboards with months of data.
