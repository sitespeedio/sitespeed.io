---
layout: default
title: Run Lighthouse and Google PageSpeed Insights from sitespeed.io
description: Since 7.5 you can also run Lighthouse from sitespeed.io
keywords: lighthouse, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Run Lighthouse and Google PageSpeed Insights from sitespeed.io.
---
[Documentation](/documentation/sitespeed.io/) / Lighthouse

# Lighthouse

We've been missing an plugin for [Lighthouse](https://github.com/GoogleChrome/lighthouse) for a long time. But now it's time (thank you [Lorenzo Urbini](https://github.com/siteriaitaliana) for sharing your version a long time ago).

You can find the plugin at [https://github.com/sitespeedio/plugin-lighthouse](https://github.com/sitespeedio/plugin-lighthouse) and it will work with sitespeed.io 7.5 and later.

We also made it easy to use Lighthouse and the Google PageSpeed Insights plugin by releasing the +1 Docker container [#2175](https://github.com/sitespeedio/sitespeed.io/pull/2175)! 

You can run it with: 

```bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}-plus1 https://www.sitespeed.io/
``` 

And you will also automatically run Lighthouse and GPSI. We will automatically release a new version of the container per release by adding *-plus1* to the tag. If you use Graphite/InfluxDb the score from Lighthouse and GPSI will be automatically stored. If you want to add functionality please send PRs to [https://github.com/sitespeedio/plugin-lighthouse](https://github.com/sitespeedio/plugin-lighthouse) and [https://github.com/sitespeedio/plugin-gpsi](https://github.com/sitespeedio/plugin-gpsi).

## Warning
One thing that is important to know is that Lighthouse starts another Chrome process at the same time as you run tests with Browsertime. This is not optimal since they can intefer with the stable metrics you can get out of Browsertime. At the moment it's recommended to run Lighthouse on your own machine where the timing metrics isn't so important. And then on your test server that runs sitespeed.io you just runs Browsertime. 

Let us see how we can best fix this in the future.