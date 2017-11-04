---
layout: default
title: Use Cases for using sitespeed.io
description: Use Cases for running sitespeed.io.
keywords: use case, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Use Cases for running sitespeed.io.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Use Cases

# Use Cases
{:.no_toc}

* Lets place the TOC here
{:toc}

## Find performance problems in production
One common use case is to crawl a site and analyze and measure the URLs. Crawling a site is good practice as it will find new pages that are linked from the pages you crawl.

This is useful for sites where the content team creates new pages directly in a CMS and the developers don't have control over which pages will exist. Crawling will make sure we pick up new pages and measure them. Use this to discover pages that could/should be faster or have problems.

Crawling too deep can take a considerable amount of time, so be aware.
{: .note .note-warning}

~~~bash
docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io http://www.nytimes.com/pages/sports/ -d 2
~~~

Best practice is to not send crawl results to Graphite as it will create a lot of new URLS over time, making the size of the Graphite "database" grow indefinitely. Instead use it to verify deploys or that the content team following best practices. You can combine this with the [performance budget](../performance-budget/), making a test fail if any page crosses the limits.

## Performance monitoring important URLs

Testing the same URL over and over again is good practice, since this will allow you to benchmark it. This allows for continuous integration tool (to check the performance before changes are released) and when comparing sites to it's competitors (matching start pages, product pages, purchase flows, etc).

### How to choose which URLs to test?

If you use an analytical tool, check which pages are the most popular or talk to the shareholders to determine that you have the same understanding of which pages are the most important to the business.

If we going to test the URLs in our continuous integration, try to keep the list of URLs small, max of 10, so you can test each URL as many times as possible to get timings that are as consistent as possible between runs.

### What else do I need?
You should do this continuously every X minutes/hours (depending how often you release/your content change). We support Graphite and InfluxDB to store the data of a run and uses Grafana to make it look pretty. Here is an example setup using a text file, chrome with 5 runs and sending metrics to graphite.

### Setup

Create a text file named amazon.txt with all the URL:s

~~~
http://www.amazon.com/
http://www.amazon.com/gp/site-directory/
http://www.amazon.com/dp/B00I15SB16/ref=ods_gw_comb_xmas_kindle
~~~

And run it like this

~~~bash
docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io amazon.txt -b chrome -n 5 --graphite.host my.graphite.host
~~~

## Find it before it reaches production
You can find problems before your code reached production by integrating sitespeed.io in [your continuous integration](../continuous-integration/).
