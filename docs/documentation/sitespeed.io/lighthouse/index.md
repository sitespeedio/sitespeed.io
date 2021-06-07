---
layout: default
title: Run Lighthouse from sitespeed.io
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

We also made it easy to use Lighthouse and the Google PageSpeed Insights plugin by releasing the +1 Docker container.

You can run it with: 

```bash
docker run --shm-size=1g --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}-plus1 https://www.sitespeed.io/
``` 

And you will also automatically run Lighthouse and GPSI. We automatically release a new version of the container per release by adding *-plus1* to the tag. If you use Graphite/InfluxDb the score from Lighthouse and GPSI will be automatically stored. If you want to add functionality please send PRs to [https://github.com/sitespeedio/plugin-lighthouse](https://github.com/sitespeedio/plugin-lighthouse) and [https://github.com/sitespeedio/plugin-gpsi](https://github.com/sitespeedio/plugin-gpsi).

The Lighthouse tests will run after Browsertime finished and run Chrome headless.

*Note:* If you want to run more plugins with <code>--plugins.add</code> that will override the default settings so you will need to add the Lighthouse plugin again like this:

```bash
docker run --shm-size=1g --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}-plus1 https://www.sitespeed.io/ --plugins.add analysisstorer --plugins.add /lighthouse
``` 

The Lighthouse result is iframed into sitespeed.io:
![Lighthouse]({{site.baseurl}}/img/lighthouse-frame.png)
{: .img-thumbnail}

#### Disable GPSI
If you only want to run Lighthouse and not GPSI you can disable it with `--plugins.remove /gpsi`.