---
layout: default
title: Releasing with confidence
description: How we work to keep sitespeed.io releases as bug free as possible.
authorimage: /img/aboutus/peter.jpg
intro: We release often and try to have as few bugs as possible (surprised!) and we do that by ...
keywords: sitespeed.io, sitespeed, release, pipeline, test, slack
nav: blog
---

# Releasing with confidence

Some people say we release sitespeed.io too often. That is partly true. We release often, but we don't release too often :) We've been releasing new functions as they are completed for the last 4.5 years (sitespeed.io will turn 5 years in October!). We've had some bugs, but we have worked out a system where we usually discover them before we release.

If you have trouble keeping track on when we update and release, please follow [us on Twitter](https://twitter.com/sitespeedio). We always tweet about the new release and if there are a serious bug fix we will highlight that.

With all that said let us go back in time and see how we did things from the beginning.

## The first years
The first years I was doing the development by myself and getting very few PRs. Keeping the bug level low was simply a matter of how much time I spent testing most use cases before each release. It worked ok, I had a list of URLs in a shell script that I manually started before each release to check that they worked, some bugs were found before the release, and some later on. It worked fairly well for the code base at that time.

## Today
We are a [three member team]({{site.baseurl}}/aboutus/), with more PRs (but we want even more!), and a larger code base since we have five web performance tools that we built. We needed to have a more automated setup today to be able to release often.

### Workflow
Let us show exactly what happens when we push code:

 1. We commit our code (or merge your PR) to [Github](https://github.com/sitespeedio/sitespeed.io).
 2. [Travis-CI](https://travis-ci.org/sitespeedio/sitespeed.io) runs a couple of unit tests and a couple of full integration test where we run sitespeed.io from the command line, testing a couple of sites in Chrome/Firefox, and tests our WebPageTest integration. You can find our Travis configuration [here](https://github.com/sitespeedio/sitespeed.io/blob/master/.travis.yml).
 3. The commit also builds a new [Docker container at the Docker Hub](https://hub.docker.com/r/sitespeedio/sitespeed.io-autobuild/). Remember: This is not the same image as you use when you run sitespeed.io in production, this one contains the latest and greatest commits.
 4. We have a test server on Digital Ocean that runs the latest Docker container (it auto updates when there's a new version of the container). When the next test runs, it will use that latest version. When the test runs, it will upload the HTML to S3 and send the metrics to our Graphite instance.
 5. On the server we also watch the sitespeed.io log and notify via a Slack message when we get an error in the logs using curl as described ([here](http://blog.getpostman.com/2015/12/23/stream-any-log-file-to-slack-using-curl/)).


 ![Getting alerts from Slack when we get an error in the logs]({{site.baseurl}}/img/slack-alert-error.png)
 {: .img-thumbnail-center}
 <p class="image-info">
  <em class="small center">We still need to do some small tweaks in our WebPageTest integration before we do the next release!</em>
</p>

### Test server setup

 We use Digital Ocean to run [dashboard.sitespeed.io](https://dashboard.sitespeed.io) (Graphite/Grafana on one server and another server running sitespeed.io). From there we run sitespeed.io with the setup described [here](https://www.sitespeed.io/documentation/sitespeed.io/performance-dashboard/#get-the-metrics). We test 20+ URLs every hour:

   * Five URLs for [Wikipedia](https://www.wikipedia.org/) (both with Chrome and Firefox) at 5 runs each.
   * Two URLs as a logged in user on  [Wikipedia](https://www.wikipedia.org/) and 3 URLs for a second view (first access one page to fill the browser cache and then measure the next URL).
   * We test [https://www.sitespeed.io](https://www.sitespeed.io) with both Chrome & Firefox for five runs.
   * Three pages both for first and second view of the mobile version of Wikipedia.
   * We also test [https://www.ryanair.com/us/en/](https://www.ryanair.com/us/en/) and [https://www.nytimes.com/](https://www.nytimes.com/) to include websites with ads.

 You can checkout the result on [dashboard.sitespeed.io](https://dashboard.sitespeed.io) and by clicking the *runs* checkbox you can access the HTML result pages served by S3. The code that generates these metrics are always the latest commits. You can always check yourself how we are doing :)

 [![Go from Grafana to S3 HTML result]({{site.baseurl}}/img/grafana-runs-to-s3.png)](https://dashboard.sitespeed.io/dashboard/db/page-summary?orgId=1)
 {: .img-thumbnail-center}
 <p class="image-info">
  <em class="small center">Go from Grafana to the HTML result uploaded in S3.</em>
 </p>

Having a server continuously running the latest code, pushing the metrics to Graphite has worked out really well for us. It's easy to inspect the result pages at S3. And getting alerted when we have an error in the logs is just awesome. This really lowers the barrier for us to know if something fails.

### Release
When we release (= a new version to npm and a new tag to the Docker hub) we use [this](https://github.com/sitespeedio/sitespeed.io/blob/master/release.sh) super simple release script. Before we release we always let the latest code run for a while on our test server and wait for errors on our Slack channel. We also manually browse the logs before a release and verify the HTML result pages on S3.

### How you should upgrade sitespeed.io
If you use Docker (and you should) make sure that you run a tagged versions and by tag we don't mean latest. Pull by setting the version number just like this:

~~~bash
docker pull sitespeedio/sitespeed.io:4.7.0
~~~

When you upgrade, read the [changelog](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md) and Docker pull the new version and then change your run script/yml file (or whatever you use to start sitespeed.io) so that it matches the new version number.


## What can we do better
We constantly trying to improve our releases process and making it as safe as possible. What can we do?

* More unit tests, this would help us detect issues as early as possible. Realistically I don't think that will happen until we got more people joining the team. If you want to help out and improve sitespeed.io stability please open up a pull-request and submit a unit test!

* Tobias has [started to move Browsertime tests](https://github.com/sitespeedio/browsertime/pull/299) to run in a Docker container in Travis. We hope that will reduce the build time and make it easy for us to implement more full run tests.

* It would be cool if we could check the logs on Travis and if we get an error in the log, just break the build. Today we only break the build when sitespeed.io returns an error code.

If you have ideas on how we can test better, please [create an issue at Github](https://github.com/sitespeedio/sitespeed.io/issues/new) or send us a [tweet](https://twitter.com/sitespeedio)!

/Peter

P.S We will soon release Browsertime 1.0 and sitespeed.io 5.0, it will be a blast!
