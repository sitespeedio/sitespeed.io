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
One common use case is to crawl a site and analyze and measure the URL:s. Crawling a site is good because it will find new pages that are linked for the pages you crawl.

I use this for sites where the content team creates new pages directly in the CMS and I as developer are out of control of which pages that exist. Crawling will make sure we pick up new pages and measure them. I usually use this in production to pick up pages that could/should be faster or have problems.

Crawling too deep can take long time, so be aware.

~~~bash
$ sitespeed.io http://www.nytimes.com/pages/sports/ -d 2
~~~

It's smart to not send crawl results to Graphite because it will probably create a lot of new URLS over time, making the size of the Graphite "database" grow. Instead use it to verify deploys or that the content team doing there job. You can combine this with the [performance budget](../performance-budget/), making a test fail if one page cross the limits.

## Test specific URL:s for one site (performance monitoring)

Testing the same URL over and over again is good so you can benchmark it. I use it in my continuous integration tool (to check the performance before changes is released) and when I compare sites to its competitors (matching start pages, product pages, purchase flows etc).

### How do I choose which URL:s to test?

If you use use Google Analytics (you shouldn't but your company probably do that) use that to check which are the most pages or talk to the business to check that we have the same understanding of which pages are the most important of our site.

If we going to test the URL:s in our continuous integration, I try to keep the list of URL:s small, max 10, so we can test each URL many times to get timings that consistent between runs.

### What else do I need?
You should do this continuously every X minutes/hours (depending how often you release/your content change). By default we support Graphite to store the data of a run and uses Grafana to make 

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



In the setup for dashboard.sitespeed.io we do like this:
