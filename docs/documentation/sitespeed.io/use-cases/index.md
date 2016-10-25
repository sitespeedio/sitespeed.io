---
layout: default
title: Use Cases for using sitespeed.io
description: Use Cases for running sitespeed.io.
keywords: use case, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Use Cases for running sitespeed.io.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Use Cases

# Use Cases
{:.no_toc}

* Lets place the TOC here
{:toc}

## Crawl and test one site
One common use case is to crawl a site and analyze and measure the URLs. Crawling a site is good practice as it will find new pages that are linked from the pages you crawl.

This is useful for sites where the content team creates new pages directly in a CMS and the developers don't have control over which pages exist. Crawling will make sure we pick up new pages and measure them. Use this to discover pages that could/should be faster or have problems.

Crawling too deep can take a considerable amount of time, so be aware.
{: .note .note-warning}

~~~bash
$ sitespeed.io http://www.nytimes.com/pages/sports/ -d 2
~~~

Best practice is to not send crawl results to Graphite as it will probably create a lot of new URLS over time, making the size of the Graphite "database" grow indefinitely. Instead use it to verify deploys or that the content team following best practices. You can combine this with the [performance budget](../performance-budget/), making a test fail if any page crosses the limits.

## Test specific URLs for a site (performance monitoring)

Testing the same URL over and over again is good practice, since this will allow you to benchmark it. This allows for continuous integration tool (to check the performance before changes is released) and when comparing sites to it's competitors (matching start pages, product pages, purchase flows, etc).

### How to choose which URLs to test?

If you use an Analytical tool check which pages are the most popular or talk to the business to check that you have the same understanding of which pages are the most important of the site.

If we going to test the URLss in our continuous integration, try to keep the list of URLs small, max of 10, so you can test each URL as many times as possible to get timings that are consistent between runs.

### What else do I need?
You should do this continuously every X minutes/hours (depending how often you release/your content change). By default we support Graphite to store the data of a run and uses Grafana to make it look pretty. 

### Setup

Create a text file named amazon.txt with all the URL:s

~~~
http://www.amazon.com/
http://www.amazon.com/gp/site-directory/
http://www.amazon.com/dp/B00I15SB16/ref=ods_gw_comb_xmas_kindle
~~~

And run it like this

~~~bash
sitespeed.io amazon.txt -b chrome -n 5
~~~
