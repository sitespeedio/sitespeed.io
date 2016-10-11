---
layout: default
title: Use Cases - Documentation - sitespeed.io
description: Use Cases for running sitespeed.io.
keywords: use case, documentation, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Use Cases for running sitespeed.io.
---
[Documentation 3.x](/documentation/) / Use Cases

# Use Cases
{:.no_toc}

* Lets place the TOC here
{:toc}

## Crawl and test one site
One of the most common use case is to crawl a site and analyze and measure the URL:s. Crawling a site is good because it will find new pages that are linked for the pages you crawl.

I use this for sites where the content team creates new pages directly in the CMS and I as developer are out of control of which pages that exist. Crawling will make sure we pick up new pages and measure them. I usually use this in production to pick up pages that could/should be faster.

Crawling too deep can take long time. One way to handle that is to test specific sections one at a time. Say we want to test sport pages for New York Times:

~~~bash
sitespeed.io -u http://www.nytimes.com/pages/sports/ -c /sports/ -d 2
~~~

Will make sure we only pick up pages under /sports/.

## Test specific URL:s for one site
Testing the same URL over and over again is good so you can benchmark it. I use it in my continuous integration tool (to check the performance before changes is released) and when I compare sites to its competitors (matching start pages, product pages, purchase flows etc).


### How do I choose which URL:s to test?
I usually use Google Analytics to check which are the most pages or talk to the business to check that we have the same understanding of which pages are the most important of our site. If we going to test the URL:s in our continuous integration, I try to keep the list of URL:s small, max 10, so we can test each URL many times to get timings that consistent between runs.

### Setup
I create a text file named amazon.txt with all the URL:s

~~~
http://www.amazon.com/
http://www.amazon.com/gp/site-directory/
http://www.amazon.com/dp/B00I15SB16/ref=ods_gw_comb_xmas_kindle
~~~

And run it like this

~~~bash
sitespeed.io -f amazon.txt -b chrome -n 11
~~~

## Compare and benchmark your site against other sites
Comparing your site against competitors is often very interesting. I usually use it to compare how fast pages are loaded and also how the pages are built (how many requests, how much javascript etc).

### Setup the files
I create one file containing the urls for each site that I want to test. Testing apple.com I create file named **apple.txt** with the URL:s I want to test:

~~~
http://www.apple.com/
http://www.apple.com/iphone/
http://www.apple.com/iphone-6/
~~~

and I compare it to Sony Mobile. I create a new text file named **sony.txt** with the following content:

~~~
http://www.sonymobile.com/se/
http://www.sonymobile.com/se/products/phones/
http://www.sonymobile.com/se/products/phones/xperia-z3-compact/
~~~

### Run the test
Then I run it like this:

~~~bash
sitespeed.io --sites apple.txt --sites sony.txt -d 0
~~~

Of course you can add all the parameters as usual to sitespeed, testing your site using Chrome, test 11 times and also test with WebPageTest and Google Page Speed Insights and sending the data to Graphite looks like this:

~~~bash
sitespeed.io --sites apple.txt --sites sony.txt -d 0 -b chrome -n 11 --wptHost your.webpagetest.com --gpsiKey YOUR_GOOGLE_KEY --graphiteHost mygraphitehost.com
~~~
