---
layout: default
title: Collect Chrome User Experience Report - CrUx using sitespeed.io
description: Get data for the URL and domain that you test.
keywords: cpu, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Collect Chrome User Experience Report - CrUx using sitespeed.io
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Collect Chrome User Experience Report (CrUx)

# Collect Chrome User Experience Report
{:.no_toc}

* Lets place the TOC here
{:toc}

## Get CrUx data
sitespeed.io has a CrUx plugin that can collect data from the [Chrome User Experience Report API](https://web.dev/chrome-ux-report-api/). To do that you need a CrUx API key that you can get [from Google](https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/getting-started#APIKey) (click on the button **Get a Key**). When you have the key you can get CrUx data using sitespeed.io.

~~~bash
sitespeed.io --crux.key $CRUX_API_KEY https://www.sitespeed.io
~~~

If you send the data to Graphite you want to push the data to its own namespace ```--graphite.namespace sitespeedio.crux``` and you probably want to separate the data from your sitespeed.io data, so you can disable Browsertime and do one run just to get the CrUx data. CrUx data changes doesn't change so often so you can just run it once per day.

The plugin collect data for the specific URL that you test AND the origin (domain). 

Here's a full example of getting CrUx data, disable browsertime for that run and send the data to the namespace sitespeedio.crux.

~~~bash
sitespeed.io --crux.key $CRUX_API_KEY --plugins.remove browsertime --graphite.namespace sitespeedio.crux https://www.sitespeed.io
~~~

You will get a new tab in your result HTML with the CrUx data.

## Form factor
The CrUx data has four different buckets depending on device: DESKTOP, PHONE, TABLET and ALL. You can choose which data to get with ```--crux.formFactor```. Getting only phone data: ```--crux.formFactor PHONE```. If you want to collect data for multiple form factors, add ```--crux.formFactor``` multiple times.

~~~bash
sitespeed.io --crux.key $CRUX_API_KEY --crux.formFactor PHONE --crux.formFactor ALL https://www.sitespeed.io
~~~


## Collect URL or origin data or both
You can choose to collect data specific only for a URL, for the origin (domain) or for both of them (using **ALL**). Use the switch ```--crux.collect```. By default both URL and origin data is collected.

Lets collect only origin data:
~~~bash
sitespeed.io --crux.key $CRUX_API_KEY --crux.collect ORIGIN https://www.sitespeed.io
~~~

## Limitations
You can not get CrUx data if you use [scripting](/documentation/sitespeed.io/scripting/).