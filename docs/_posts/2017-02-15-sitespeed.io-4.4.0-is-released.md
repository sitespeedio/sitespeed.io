---
layout: default
title: Welcome sitespeed.io 4.4.0
description: Release of sitespeed.io 4.4.0
authorimage: /img/robot-head.png
intro: Whitelisting usertimings, s3 storage support, and annotation linking for grafana to results oh my!
keywords: sitespeed.io, sitespeed, site, speed, webperf, performance, web, wpo
nav: blog
---

# Sitespeed.io 4.4.0

With 4.4.0 we added support for some of what we think are really nice features. Let's talk about these really quick.


## User defined whitelisting of  user usertimings

In a previous post on best practices for user timings we talked about concerns and how to manage your user timings by namespacing them. This feature 
allows you to now define that namespace to filter out all other that do not match. Yay! The following will whitelist and capture only user timings that are prefixed with `sitespeedio_`. 

~~~ bash
$ docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --userTimingWhitelist "^sitespeedio_" https://www.sitespeed.io/
~~~


The next two features will finally allow a viewer of the TSDB within Grafana to click through and view the generated HTML report of any speciic run.

[insert image here]()



## S3 support for HTML storage

This feature will allow for capturing resulting HTML reports and uploading them to an s3 bucket for storage and if setup to serve HTML can be a server.


~~~ bash
$  docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -b firefox -n 1 --graphite.host <location to your graphite instance> --resultBaseURL https://example.yoursite.com --s3.key <insert key here> --s3.secret <insert secret here> --s3.bucketname <insert your bucket name here> https://www.sitespeed.io/
~~~


[insert image here]()



## Graphite annotations for Grafana linking to HTML results

This feature allows for annotations to be sent to Graphite. These annotations can be configure along side of s3. This adds a must requested feature to sitespeed.io. Finally the gap between Grafana and the HTML generated results by sitespeedio is here.

~~~ bash
$ docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -b firefox -n 1 --resultBaseURL https://example.yoursite.com https://www.sitespeed.io/

~~~

[insert image here]()


With all that said the s3 integration 
isn't required to link out to an HTML report as you can run your own server if you so choose and serve the resulting HTML however best works for you or your company.

