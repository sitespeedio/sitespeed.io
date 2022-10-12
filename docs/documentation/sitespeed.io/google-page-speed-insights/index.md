---
layout: default
title: Run Google Page Speed Insights from sitespeed.io
description: Since 7.5 you can also run Google Page Speed Insights from sitespeed.io
keywords: lighthouse, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Run Google PageSpeed Insights from sitespeed.io.
---
[Documentation](/documentation/sitespeed.io/) / Google Page Speed Insights

# Google Page Speed Insights

There's a Google Page Speed Insights plugin at [https://github.com/sitespeedio/plugin-gpsi](https://github.com/sitespeedio/plugin-gpsi) and since sitespeed.io 12.2.0 it runs the *new* Lighthouse backend.

You can run it with: 

```bash
docker run --shm-size=1g --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}-plus1 https://www.sitespeed.io/ --plugins.remove /lighthouse
``` 

The container also includes Lighthouse. We automatically release a new version of the container per release by adding *-plus1* to the tag. If you use Graphite/InfluxDb the score from Lighthouse and GPSI will be automatically stored.

The plugin will send a request to the Google Page Speed Servers and parse the result. The result will look something like this:

![GPSI]({{site.baseurl}}/img/gpsi-lighthouse.png)
{: .img-thumbnail}

The plugin also collect metrics for the specific page and the domain from the Chrome User Experience report:
![GPSI distribution]({{site.baseurl}}/img/gpsi-distribution.png)
{: .img-thumbnail}

All scores and distributions is automatically sent to Graphite/InfluxDB.

## Disable Lighthouse
If you only want to run GPSI and not Lighthouse you can disable it with `--plugins.remove /lighthouse`.