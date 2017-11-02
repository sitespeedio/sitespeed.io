---
layout: default
title: 4.4.0 - sitespeed.io has never been better!
description: Release of sitespeed.io 4.4.0
authorimage: /img/aboutus/jonathan.jpg
intro: Whitelisting usertimings, S3 storage support, and annotation linking for Grafana to results oh my!
keywords: sitespeed.io, sitespeed, site, speed, webperf, performance, Grafana, S3
nav: blog
---

# Sitespeed.io 4.4.0

With 4.4.0 we added support for some of what we think are really nice features: Store the HTML result at S3, link between Grafana dashboards and the HTML result pages and whitelisting of user timings. Let's talk about these really quick.

![We got some amazing features in 4.4.0]({{site.baseurl}}/img/happy.gif)
{: .img-thumbnail}

## User defined whitelisting of  user usertimings

In a [previous post]({{site.baseurl}}/usertimings-best-practices) on best practices for user timings we talked about concerns and how to manage your user timings by namespacing them. This feature
allows you to now define that namespace to filter out all other that do not match. Yay! The following will whitelist and capture only user timings that are prefixed with `sitespeedio_`.

~~~bash
docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --userTimingWhitelist "^sitespeedio_" https://www.sitespeed.io/
~~~


This is great since it now easy to filter out only the user timings that you need and you can get rid of those 3rd party User Timings that are polluting your metrics.


## Graphite annotations for Grafana linking to HTML results

This feature allows for annotations automatically to be sent to Graphite and picked up Grafana, so we can link between metrics in Grafana and HTML result pages. These annotations can be configure along side of S3, so it's super easy to keep the result and have everything you need to keep track of your sites performance. Finally the gap between Grafana and the HTML generated results by sitespeedio is here :)

~~~bash
docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -b firefox -n 1 --graphite.host <your graphite host>  --resultBaseURL https://example.yoursite.com https://www.sitespeed.io/
~~~

![Send annotations and link to the result pages]({{site.baseurl}}/img/annotations-example.png)
{: .img-thumbnail}


Note: if you have authentication setup you will need to pass `--graphite.auth <username:password>` and `--graphite.httpPort <your graphite port>` if modified as an additional options

## S3 support for HTML storage

This feature will allow for capturing resulting HTML reports/videos and HAR files and uploading them to an S3 bucket for storage. And then you can setup S3 to serve HTML as a server.


~~~bash
docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -b firefox -n 1 --graphite.host <location to your graphite instance> --resultBaseURL https://example.yoursite.com --s3.key <insert key here> --s3.secret <insert secret here> --s3.bucketname <insert your bucket name here> https://www.sitespeed.io/
~~~

This is nice because you can setup S3 to keep the result for your runs for X days and have the same configuration for Graphite, so that you go back and forth from the graphs to the result pages (see next feature!).


With all that said the S3 integration
isn't required to link out to an HTML report as you can run your own server if you so choose and serve the resulting HTML however best works for you or your company.

You can check out this feature in action on [https://dashboard.sitespeed.io](https://dashboard.sitespeed.io/dashboard/db/page-timing-metrics). Click on *runs* so you get the green lines, and hover over them. Each green line is a run and hovering will show a link to the HTML result. Click that link and you will end up on the result for that run on S3.

/Jonathan

P.S Read the full [changelog](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md) for 4.4.0.
