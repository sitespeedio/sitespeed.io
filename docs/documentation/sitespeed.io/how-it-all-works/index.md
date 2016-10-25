---
layout: default
title: How it all works.
description: Have you ever wondered what exactly sitespeed.io do?
keywords: installation, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: How it all works.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / How it all works

# How it all works
{:.no_toc}

* Lets place the TOC here
{:toc}

## The big picture
The big picture looks something like this:

![How it all works]({{site.baseurl}}/img/sitespeed-how-it-works.png)
{: .img-thumbnail}

## Analyzing a URL step by step
The new sitespeed.io 4.0 is built upon plugins and messages. The flow is like this:

1. You start the application and feed it with a URL/URLs.
2. The app will go through the configured plugins and start them and the plugins will wait for messages.
3. The app will send the URLs as URL messages and the plugins that listens to that type of messages will act on that. When they are finished with what they do, they post other messages on with the findings they did.
4. When all URLs are finished, the plugins will get a "close" call to say prepare what you have.
5. Finish

The overall idea is pretty simple.

You should also look at the [plugin structure]({{site.baseurl}}/documentation/sitespeed.io/plugins/#create-your-own-plugin). With that you have the overall picture of how everything works :)

## Built upon Open Source
Sitespeed.io uses a lot of other Open Source tools massive love to those projects:

 * [Selenium](http://www.seleniumhq.org/)
 * [TSProxy](https://github.com/WPO-Foundation/tsproxy)
 * [HAR Export Trigger](https://github.com/firebug/har-export-trigger)
 * [PerfCascade](https://github.com/micmro/PerfCascade)
 * [Skeleton](http://getskeleton.com)
 * [Simple crawler](https://github.com/cgiffard/node-simplecrawler)
 * [Pug](https://www.npmjs.com/package/pug)
 * [WebPageTest](https://www.webpagetest.org)
 * [WebPageTest API](https://github.com/marcelduran/webpagetest-api)
 * [gpagespeed](https://www.npmjs.com/package/gpagespeed)
 * all other projects in the [package.json](https://github.com/sitespeedio/sitespeed.io/blob/master/package.json).
