---
layout: default
title: How to configure Browsertime
description: In the cli just run "browsertime --help" to get the configuration options.
keywords: configuration, documentation, web performance, browsertime
nav: documentation
category: browsertime
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Configuration for bBrowsertime.
---
[Documentation]({{site.baseurl}}/documentation/browsertime/) / Configuration

# Configuration
{:.no_toc}

* Let's place the TOC here
{:toc}

# Configuration
Browsertime is highly configurable, let's check it out!

## The options
You have the following options when running sitespeed.io within docker (run <code>docker run sitespeedio/browsertime --help</code> to get the list on your command line):

~~~help
{% include_relative config.md %}
~~~


## The basics
If you installed with the global option, run the command *sitespeed.io* else run the script *bin/sitespeed.js*.  In the examples, we will use the globally installed version.

You can analyze a site either by crawling or by feeding sitespeed.io with a list of URLs you want to analyze.
