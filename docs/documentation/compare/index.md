---
layout: default
title: Compare HAR files.
description: Compare your HAR files to easier find regressions.
keywords: compare, documentation, web performance, HAR
author: Peter Hedenskog
nav: documentation
category: compare
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

# Compare HAR files
{:.no_toc}

<img src="{{site.baseurl}}/img/logos/compare.png" class="pull-right img-big" alt="Compare logo" width="200" height="204">

* Lets place the TOC here
{:toc}


## Introduction
Make it easier to find regressions by comparing your [HAR](http://www.softwareishard.com/blog/har-12-spec/) files. Test it out [https://compare.sitespeed.io](https://compare.sitespeed.io) or look at the video: [https://youtu.be/dCThwpglIeE](https://youtu.be/dCThwpglIeE)

## First: Shout out!
We couldn't built compare without the support or inspiration from the following people:
 * Thank you [Michael Mrowetz](https://twitter.com/MicMro) for creating [PerfCascade](https://github.com/micmro/PerfCascade) (the SVG HAR waterfall viewer).
 * Thank you [Patrick Meenan](https://twitter.com/patmeenan). Pat has built the HAR compare viewer in [WebPageTest](https://www.webpagetest.org/) that inspired us to the idea with the slider.

If you like our project, please give them also some extra love :)

## Comparing

![Compare two different HAR files]({{site.baseurl}}/img/compare-full.png)
{: .img-thumbnail}

## How it works
As long as your HAR files follow the [HAR specification](http://www.softwareishard.com/blog/har-12-spec/) you can use them in Compare. Standard HARs will give you some basic functionality and HARs from WebPageTest and sitespeed.io will give you more.

### HARs from Firefox/Chrome/Safari (and other browsers).
For all HARs we will show the waterfall (using [PerfCascade](https://github.com/micmro/PerfCascade)) and statistics for the page (using [PageXray](https://github.com/sitespeedio/pagexray)).

### WebPageTest
If you add a [WebPageTest](https://www.webpagetest.org) HAR we will show SpeedIndex and FirstVisualChange and if you used Chrome to collect CPU stats, we will show that too. You will get some extra sugar if your HAR is from WebPageTest! Do you have something else that we should add? Create an issue or send a PR!

### sitespeed.io/Browsertime
If you want even more sugar, you should use HAR files from [sitespeed.io](https://github.com/sitespeedio/sitespeed.io) or [Browsertime](https://github.com/sitespeedio/browsertime): SpeedIndex, FirstVisualChange, LastVisualChange and a graph for VisualProgress.

If you deploy your result from your sitespeed.io run to a server and use **--resultBaseURL** when you run sitespeed.io, we will also pickup the screenshot, video and a link to the result page.

If you also run with **--firstParty** (adding a regex that show which assets that are first/third parties) we will will show data grouped by party.

![First Party vs Third Party!]({{site.baseurl}}/img/compare-firstparty.png)
{: .img-thumbnail-center}

## How to use it
You can either upload two HAR files (drag/drop) or give the URL to two URLs hosted online. If your HAR got multiple pages/runs, you can use just one HAR file.

Or you can just copy/paste your HAR file into the start page of [compare.sitespeed.io](https://compare.sitespeed.io/).

If you host your sitespeed.io result pages, you can copy/paste the URL to a page or to a specific run and Compare will automagically find the URL to the HAR file.

### Configuration
You can use a configuration JSON to choose which HAR files that will be tested. The minimal configuration needed:

```json
{
  "har1": {
    "url": "https://www.url.com/page1.har"
  },
  "har2": {
    "url": "https://www.url.com/page2.har"
  }
}
```

But you can also add some extra sugar. All the extras are optional:
```json
{
  "har1": {
    "url": "https://www.url.com/page1.har",
    "label": "Before change",
    "run": 1
  },
  "har2": {
    "url": "https://www.url.com/page2.har",
    "label": "After change",
    "run": 2
  },
  "title": "The page title used in the title bar",
  "firstParty" : " (.*wikipedia.*||.*wikimedia.*)", // RegEx that defines first party requests
  "comments": {
    "intro": "Extra information put at the top of the page",
    "waterfall": "Text displayed at top of the waterfall",
    "visualProgress": "Text displayed at the top of visual progress",
    "domains": "Text displayed at the top of domains",
    "requestDiff": "Text displayed at the top of request/response diff",
    "firstParty": "Text displayed at the top of first/third party"
  }
}
```


And then you can use your configuration file in different ways. You can copy/paste the configuration into the start page of [compare.sitespeed.io](https://compare.sitespeed.io).

Or you can use it like this: https://compare.sitespeed.io/?config=https://URL_TO_THE_CONFIG_FILE

Make sure that your server has correct [CORS settings](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) so that compare.sitespeed.io can get the HAR file.
{: .note .note-warning}

### GitHub gist
You can also use host your configuration file on a [GitHub gist](https://gist.github.com/) and use the gist id https://compare.sitespeed.io?gist=GIST_ID to get the configuration file.

You can checkout out our example:
[https://gist.github.com/soulgalore/94e4d997a78e03b32b939fcea63eae8e](https://gist.github.com/soulgalore/94e4d997a78e03b32b939fcea63eae8e)

You can also copy/paste gist id (or the full URL to the gist) into [compare.sitespeed.io](https://compare.sitespeed.io).

Thank you [Matt Hobbs](https://github.com/Nooshu) for sharing the gist idea!

### Compare on the fly
You can also compare two HAR files on the fly without using a configuration file.

Add the parameters **?har1=FULL_URL1&har2=FULL_URL2&compare=1** and the two HAR files will be compared.

## Developers

To run the project locally start a server with:
```bash
npm run develop
```

Send us a PR/create an issue. If you have big change coming up, please discuss it with us in an issue first!

## Deploy your own version
Deploying your own version is easy:
1. Clone the repo: `git clone git@github.com:sitespeedio/compare.git`
2. Build: `cd compare && npm run build`
3. Copy everything in *build/* to your server

## Privacy
We take your privacy really serious: We do not use any tracking software at all (no Google Analytics or any other tracking software) in [compare.sitespeed.io](https://compare.sitespeed.io). The page do no call home.

And you can deploy your own version of [compare.sitespeed.io](https://compare.sitespeed.io) if you want to be 100% in control.

### Be kind
If you deploy your own version: please keep the original logo and the link to the project. We have spent a lot of our free time to work on this!

## The logo
The compare logo (and the rest of the sitespeed.io logos) are made by [Mochamad Arief](https://twitter.com/mochawalk),
you can find his stuff at [http://www.mochawalk.com/](http://www.mochawalk.com/).

