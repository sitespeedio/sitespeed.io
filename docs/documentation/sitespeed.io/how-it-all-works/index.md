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

## What happens when sitespeed.io analyzes a page (the 10 step version)
This is the super simple version, leaving out all other tools that are used:

1. sitespeed.io gets a URL from the user
2. Open the browser
3. Start record a video of the screen
4. Access the URL in the browser
5. When the page is finished, take a screenshot of the page
6. Run some JavaScripts to analyze the page
7. Stop the video and close the browser
8. Analyze the video to get metrics like FirstVisualChange and SpeedIndex
9. Generate a HTML report and/or send the metrics to Graphite or store the metrics however you want, building your own plugin.
10. Enjoy!

## The big picture (with all the tools)
The big picture looks something like this:

![How it all works]({{site.baseurl}}/img/sitespeed-universe-5.png)
{: .img-thumbnail}

### Built upon Open Source
Sitespeed.io uses a lot of other Open Source tools so massive love to those projects and maintainers:

 * [Selenium](http://www.seleniumhq.org/)
 * [Visual Metrics](https://github.com/WPO-Foundation/visualmetrics)
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


## The details
For the details you should read the [developers guide]({{site.baseurl}}/documentation/sitespeed.io/developers/).
