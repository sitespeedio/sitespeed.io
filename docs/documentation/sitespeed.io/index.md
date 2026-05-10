---
layout: default
title: Documentation sitespeed.io 40.x
description: Read about all you can do with sitespeed.io.
keywords: tools, documentation, web performance
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Documentation for sitespeed.io.
---

# Documentation v40

<img src="{{site.baseurl}}/img/logos/sitespeed.io.png" class="pull-right img-big" alt="sitespeed.io logo" width="200" height="214">

Sitespeed.io is the complete toolbox for testing the web performance of your website. Use it to monitor your own performance or to check out how your competition is doing. You can see all the latest changes in the [Changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) for the project.

## Get started
 * [Introduction](introduction/) - start here if you are new to the project or web performance testing.
 * [Installation](installation/) - install using npm, yarn or run our Docker containers.
 * [Web performance testing in practice](web-performance-testing-in-practice/) - start here if you are new to synthetic testing.
 * [F.A.Q and Best Practice](best-practice/) - here we keep track of questions we get in Slack.

## Run your tests
 * [Configuration](configuration/) - there's a lot you can do with sitespeed.io, let's check out how!
 * [Browsers](browsers/) - collect timings using real browsers. We support Firefox, Chrome, Edge, Chrome on Android, Safari on iOS over USB (HAR + video + visual metrics), and limited support for Safari on macOS.
 * [Mobile phones](mobile-phones/) - test using your mobile phone. Chrome on Android and Safari on iOS.
 * [Docker](docker/) - how to use our Docker containers.
 * [Connectivity](connectivity/) - set the connectivity to emulate real users' network conditions.
 * [Scripting](scripting/) - script a user journey, test multiple URLs, test login, or test adding items to the cart.
 * [Single Page Application](spa/) - how to test your single page application.
 * [WebPageReplay](webpagereplay/) - WebPageReplay is a proxy that first records your website and then replays it locally. That makes it easier to find front-end performance regressions: latency and server timings stay constant.
 * [Continuously run your tests](continuously-run-your-tests/) - how to set up your tests to run continuously.
 * [Continuous Integration](continuous-integration/) - generate JUnit XML/TAP and use Jenkins, Circle CI, Gitlab CI, GitHub Actions, Grunt or the Gulp plugin.

## Metrics & analysis
 * [Metrics](metrics/) - definitions of all the metrics that are collected.
 * [Google Web Vitals](google-web-vitals/) - get Google Web Vitals using sitespeed.io and other tools.
 * [CPU](cpu/) - measure CPU metrics to see where your page spends the time.
 * [CPU Benchmark](cpu-benchmark/) - benchmark the CPU that runs your browser and tests.
 * [Video](video/) - all that you can do with the video and filmstrip.
 * [Axe](axe/) - run accessibility tests.
 * [Sustainable web plugin](sustainable/) - the sustainable web plugin helps you build greener, more sustainable websites and applications.
 * [Third party requests](thirdparty/) - keep track of those 3rd party scripts.
 * [Compare plugin](compare/) - use Mann Whitney U or Wilcox statistical methods to know if you have a regression.
 * [Performance Budget](performance-budget/) - make sure you are within your performance budget.

## External tools
 * [Lighthouse](lighthouse/) - run Lighthouse from sitespeed.io.
 * [Google Page Speed Insights](google-page-speed-insights/) - run Google Page Speed Insights (GPSI) from sitespeed.io.
 * [Chrome User Experience Report](crux/) - collect Chrome User Experience Report data in sitespeed.io.

## Store & visualise
 * [Performance Dashboard](performance-dashboard/) - monitor your website and keep track of your metrics and performance.
 * [Performance Leaderboard](leaderboard/) - compare your pages with your competition.
 * [Graphite](graphite/) - how to configure and store your metrics in Graphite (and using StatsD).
 * [Configure Metrics](configure-metrics/) - configure which metrics you want to send to Graphite/InfluxDB.
 * [Set up S3](s3/) - how to set up S3 for your HTML results, videos and screenshots.
 * [Set up GCS](gcs/) - how to set up Google Cloud Storage (GCS) for your HTML results, videos and screenshots.

## Reporting & alerts
 * [Alerts](alerts/) - send alerts (email/Slack/PagerDuty etc) when you get a performance regression.
 * [Matrix](matrix/) - send messages to your Matrix client.
 * [Configure HTML output](configure-html/) - change the default HTML output.

## For contributors
 * [Developers](developers/) - start here when you want to do PRs or create a plugin.
 * [Plugins](plugins/) - list/disable/enable or create your own plugin.
 * [How to Write a Good Bug Report](bug-report/) - if you write a good bug report, we can spend more time helping you fix the problem instead of asking you questions.

