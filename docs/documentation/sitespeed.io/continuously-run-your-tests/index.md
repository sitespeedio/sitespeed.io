---
layout: default
title: Continuously run your tests
description: Example of how you can set up your tests to continuously run and monitor your websites.
keywords: dashboard, monitor, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Continuously run your tests.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Continuously run your tests

# Continuously run your tests
{:.no_toc}

To monitor your web site you run the same tests again and again and send the metrics to a time series database, so you can follow them over time in Grafana. You need four things: a server that runs the tests, a list of URLs, a configuration file and something that starts the tests on a schedule. This page starts with the smallest setup that works. When you have that running, you can look at [our own setup](#a-bigger-example-the-setup-behind-dashboard-sitespeed-io) for ideas on how to grow it.

{:toc}

## Before you start

* **A server for your tests.** Use a Linux server with Docker installed, and only run sitespeed.io on it. Other processes on the same server make your metrics unstable. Do not use the server where you run Graphite and Grafana.
* **Graphite and Grafana.** If you do not have them yet, follow the [performance dashboard documentation](/documentation/sitespeed.io/performance-dashboard/). It sets up Graphite, Grafana and our pre-made dashboards with Docker Compose.
* **A fixed version of sitespeed.io.** Always use a version tag of the Docker container (for example `sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}`) and not `latest`. Then you know when your metrics change because you upgraded. Read more in [keep your setup updated](#keep-your-setup-updated).

## The minimal setup

Create a folder on your test server, for example */home/ubuntu/sitespeed*, with three files:

```
/home/ubuntu/sitespeed
├── config.json
├── run.sh
└── urls.txt
```

### The URLs to test
Put the URLs that you want to test in **urls.txt**, one URL per line:

```
https://www.example.com/
https://www.example.com/about/
```

If you want a friendly name for a URL in Graphite, add an alias after the URL: `https://www.example.com/ start_page`. You can also test a [user journey with a script](/documentation/sitespeed.io/scripting/) instead of a list of URLs.

### The configuration file
Put your configuration in **config.json**. This is the minimum that you need to send the metrics to Graphite:

```json
{
  "browsertime": {
    "iterations": 5
  },
  "slug": "myTest",
  "graphite": {
    "host": "GRAPHITE_HOST",
    "namespace": "sitespeed_io.desktop"
  }
}
```

* `browsertime.iterations` - how many times each URL is tested. The metrics are the median of all runs. More runs give more stable metrics but take more time.
* `slug` - the name of your test. The pre-made dashboards use it to find your test, so give each group of tests a unique slug.
* `graphite.host` - the IP address or host name of your Graphite server. Make sure that the test server can reach Graphite on port 2003.
* `graphite.namespace` - the first part of the metric keys. Use one namespace for each type of test (for example one for desktop and one for emulated mobile), then you can choose between them in Grafana.

Add the options that you need when the minimal setup works:

* To make links from the dashboards to the HTML result of each run, store the result where a browser can get it (for example on [S3](/documentation/sitespeed.io/s3/) or [GCS](/documentation/sitespeed.io/gcs/)) and set `resultBaseURL`. Read more about [annotations](/documentation/sitespeed.io/graphite/#annotations).
* To show the latest screenshot and video in Grafana, add `"copyLatestFilesToBase": true`. Grafana gets the files from the same place as the HTML result, so you need the step above first. Read more about [the latest screenshot and video in Grafana](/documentation/sitespeed.io/performance-dashboard/#how-to-get-the-latest-video-screenshot-visible-in-grafana).
* To test like a mobile phone, add `"mobile": true`. To make the connection slower, read about [connectivity](/documentation/sitespeed.io/connectivity/). In Docker, the throttle engine needs `sudo modprobe ifb numifbs=1` on the server and `--cap-add=NET_ADMIN` on the container.

All options are in the [configuration documentation](/documentation/sitespeed.io/configuration/).

### The script
Put the command that runs the tests in **run.sh**:

```bash
#!/bin/bash
cd /home/ubuntu/sitespeed
DOCKER_CONTAINER=sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}

docker run --rm --shm-size=2g -v "$(pwd):/sitespeed.io" $DOCKER_CONTAINER --config config.json urls.txt

# Remove local results that are older than seven days, so the disk does not become full
find sitespeed-result -mindepth 1 -maxdepth 1 -mtime +7 -exec rm -rf {} +
```

Make the script executable with `chmod +x run.sh` and run it one time by hand: `./run.sh`. When the script is finished, open Grafana and look for your slug in the page metrics dashboard. If you do not see your metrics, look at the log at the end of the run. Usually the cause is that the test server cannot reach the Graphite host.

If you want to test in more browsers, add one more `docker run` line for each browser, for example with `-b firefox` at the end.

### Run the script on a schedule
Use the crontab to start your tests. Edit the crontab with `crontab -e` and add a line. Make sure that the user can run Docker. This example starts the tests every hour:

```bash
0 * * * * flock -n /tmp/sitespeed.lock /home/ubuntu/sitespeed/run.sh >> /tmp/sitespeed.io.log 2>&1
```

`flock` makes sure that a new run does not start while the previous run continues. Choose a schedule that gives the tests enough time: number of URLs × iterations × browsers × about 30 seconds is a good start.

Look at the log with `tail -f /tmp/sitespeed.io.log`.

### Keep your setup updated
We release new versions of sitespeed.io with bug fixes, new functionality and new browser versions. To upgrade, change the version in `DOCKER_CONTAINER` in run.sh. The next run uses the new version.

Then add an annotation in Grafana that tells your team that you upgraded. A new browser version can change your metrics, and the annotation tells you why.

## A bigger example: the setup behind dashboard.sitespeed.io
The metrics for [dashboard.sitespeed.io](https://dashboard.sitespeed.io) come from the setup in [https://github.com/sitespeedio/dashboard.sitespeed.io](https://github.com/sitespeedio/dashboard.sitespeed.io). It has more parts than you need to start, but you can use it for ideas when your tests grow: many groups of tests, more browsers, configuration in Git and a loop instead of the crontab.

### How it works
* All the tests and configuration files are in Git. On each iteration, the loop does `git pull`. To change what is tested, you push a change to Git. You do not need to log in to the server.
* The tests are in the [tests](https://github.com/sitespeedio/dashboard.sitespeed.io/tree/main/tests) folder: a *.txt* file is a list of URLs and a *.js* file is a user journey script. Each test file needs a configuration file with the same name in the [config](https://github.com/sitespeedio/dashboard.sitespeed.io/tree/main/config) folder. For example, *tests/docker/desktop/desktop.txt* uses *config/desktop.json*.
* [**loop.sh**](https://github.com/sitespeedio/dashboard.sitespeed.io/blob/main/loop.sh) starts the loop and pulls from Git. Then it runs [**run.sh**](https://github.com/sitespeedio/dashboard.sitespeed.io/blob/main/run.sh), which runs all the tests in each folder in a set of browsers.
* We use the autobuild container to find bugs before we release them. Do not do that: change `DOCKER_CONTAINER` in run.sh to a version tag.

### Secrets
Our repository is public, so the passwords and keys are not in Git. Each configuration file extends a file that is only on the server:

```json
{
  "extends": "/config/secrets.json",
  ...
}
```

**/config/secrets.json** on the server looks something like this:

```json
{
  "graphite": {
    "host": "OUR_HOST",
    "auth": "THE_AUTH",
    "annotationScreenshot": true
  },
  "slack": {
    "hookUrl": "https://hooks.slack.com/services/THE/SECRET/S"
  },
  "resultBaseURL": "https://s3.amazonaws.com/results.sitespeed.io",
  "s3": {
    "key": "S3_KEY",
    "secret": "S3_SECRET",
    "bucketname": "BUCKET_NAME",
    "removeLocalResult": true
  }
}
```

run.sh gives the container access to that folder with `-v /config:/config`. If your repository is private, you can put everything in the configuration files and do not need this step.

### Start and stop the tests
Go into the folder where you cloned the repository and start the loop: `nohup ./loop.sh &`. On a Mac, use `screen` instead of `nohup`: open a screen with `screen`, start `./loop.sh` and detach with `ctrl+A` and then `D`. Use `screen -x` to go back to it.

Look at the log with `tail -f /var/log/sitespeed.io/sitespeed.io.log`.

### Stop your tests
When the loop starts, it creates the file **sitespeed.run** in the current folder. To stop the tests, remove the file: `rm sitespeed.run`. The loop stops when the current test is finished.

### Start on reboot
To start the tests again when the server reboots, add this to the crontab with `crontab -e` (change the path to where you cloned the repository):

```bash
@reboot rm /root/dashboard.sitespeed.io/sitespeed.run;cd /root/dashboard.sitespeed.io/ && ./loop.sh
```
