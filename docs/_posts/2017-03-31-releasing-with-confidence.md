---
layout: default
title: Releasing with confidence
description: How we work to keep sitespeed.io releases as bug free as possible.
authorimage: /img/aboutus/peter.jpg
intro: We release often and try to have as few bugs as possible (suprised) and we do that by running tests .
keywords: sitespeed.io, sitespeed, release, pipeline, test, slack
nav: blog
---

# Releasing with confidence

Some people say we release sitespeed.io too often. That is partly true. We release often. But we don't release too often :) We've been releasing new functions when they are done the last 4.5 years (sitespeed.io will turn 5 years in October!). We had some bugs but we have worked out a system where we usually find them before we release.

If you have problem updating and keeping track on when we release, follow [us on Twitter](https://twitter.com/sitespeedio). We always tweet about the new release and if there are a serious bug fix we will highlight that.

Let us go back in time and see how we did things in the beginning.

## The first years
The first years I was doing the development by myself and getting very few PRs. Keeping the bug level low was a matter of how much time I spent testing most use cases before each release. It worked ok, I had a list of URLs in a shell script I manually started before each release to check that they worked, some bugs was found before the release, and some later on. It worked ok for the code base at that time.

## Today
We are a three member team, more PRs (but we want more!) and a larger code base since we have five web performance tools that we built. We need to have a more automated setup today to be able to release often.

### Workflow
Let us check what happens when we push code:

 1. We commit our code (or merge your PR) to [Github](https://github.com/sitespeedio/sitespeed.io).
 2. [Travis-CI](https://travis-ci.org/sitespeedio/sitespeed.io) runs a couple of unit tests and a couple of full integration test where we run sitespeed.io from the command line, testing a couple of sites in Chrome/Firefox and test our WebPageTest integration. You can find our Travis configuration [here](https://github.com/sitespeedio/sitespeed.io/blob/master/.travis.yml).
 3. The commit also builds a new [Docker container at the Docker hub](https://hub.docker.com/r/sitespeedio/sitespeed.io-autobuild/). Remember: This is not the same as you use when you run sitespeed.io in production, this one contains the latest and greatest commits.
 4. We have a test server on Digital Ocean that runs the latest Docker container (it auto updates when there's a new version of the container). When the next test runs, it will use that latest version. When the test runs, it will upload the HTML to S3 and send the metrics to our Graphite instance.
 5. On the server we also watch the sitespeed.io log and curls a Slack message when we get an error in the logs (using [http://blog.getpostman.com/2015/12/23/stream-any-log-file-to-slack-using-curl/](http://blog.getpostman.com/2015/12/23/stream-any-log-file-to-slack-using-curl/)).


 ![Getting alerts from Slack when we get an error in the logs]({{site.baseurl}}/img/slack-alert-error.png)
 {: .img-thumbnail-center}
 <p class="image-info">
  <em class="small center">We need to do some tweaks in our WebPageTest integration before we do the next release!</em>
</p>

### Test server setup

 We use Digital Ocean to run [dashboard.sitespeed.io](https://dashboard.sitespeed.io) (Graphite/Grafana on one server and one server running sitespeed.io). There we run sitespeed.io with the setup described [here](https://www.sitespeed.io/documentation/sitespeed.io/performance-dashboard/#get-the-metrics). We test 20+ URLs every hour:

   * Five  URLs for Wikipedia (both with Chrome and Firefox) 5 runs each.
   * Two URLs as logged in and 3 URLs for a second view (first access one page to fill the browser cache and then measure the next URL).
   * We test [https://www.sitespeed.io](https://www.sitespeed.io)  with both Chrome & Firefox for five runs.
   * Three pages both for first and second view of the mobile version of Wikipedia.
   * We test [https://www.ryanair.com/us/en/](https://www.ryanair.com/us/en/) and [https://www.nytimes.com/](https://www.nytimes.com/) to include websites with ads.

 You can checkout the result on [dashboard.sitespeed.io](https://dashboard.sitespeed.io) and by clicking the *runs* checkbox you can access the HTML result pages served by S3. The code that generates these metrics are always the latest commits. You can check yourself how we are doing :)

 ![Go from Grafana to S3 HTML result]({{site.baseurl}}/img/grafana-runs-to-s3.png)
 {: .img-thumbnail-center}
 <p class="image-info">
  <em class="small center">Go from Grafana to the HTML result uploaded in S3.</em>
 </p>

### Release
When we release (= a new version to npm and a new tag to the Docker hub) we use [this](https://github.com/sitespeedio/sitespeed.io/blob/master/release.sh) super simple release script. But before we release we always let the latest code run for a while on our test server and wait for errors on our Slack channel. We always manually browse the logs before a release and verify the HTML result pages on S3.

### How you should upgrade sitespeed.io
If you use Docker (and you should do that) make sure that you run our tagged versions and by tag we don't mean latest. Use the version tag so you are sure you run the exact version. If you use the latest tag you can accidentally update sitespeed.io.

~~~bash
$ docker pull sitespeedio/sitespeed.io:4.7.0
~~~

When when you upgrade, read the [changelog](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md) and Docker pull the new version and then change your run script/yml file (or whatever you use to start sitespeed.io).


## What can we do better
We want to improve make our releases even safer. What can we do?

* More unit tests, that would help us find tests earlier. Realistically I don't think that will happen until we got more people joining the team.

* Tobias has [started to move Browsertime tests](https://github.com/sitespeedio/browsertime/pull/299) to run in a Docker container in Travis. We hope that will reduce the build time and make easy for us to make more full run tests.

* It would be cool if we could check the logs on Travis and if get an error in the log, just break the build. Today we only break the build when sitespeed.io returns an error code.

If you have any ideas how we can test better, please [create an issue at Github](https://github.com/sitespeedio/sitespeed.io/issues/new) or send us a [tweet](https://twitter.com/sitespeedio)!

/Peter

P.S We will soon release 5.0, it will be a blast!
