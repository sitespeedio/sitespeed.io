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

{:toc}

## Get CrUx data
sitespeed.io has a CrUx plugin that can collect data from the [Chrome User Experience Report API](https://web.dev/chrome-ux-report-api/). To do that you need a CrUx API key that you can get [from Google](https://developers.google.com/web/tools/chrome-user-experience-report/api/guides/getting-started#APIKey) (click on the **Get a Key** button). Once you have the key, you can get CrUx data using sitespeed.io.

~~~bash
sitespeed.io --crux.key $CRUX_API_KEY https://www.sitespeed.io
~~~

If you send the data to Graphite you want to push the data to its own namespace ```--graphite.namespace sitespeedio.crux```, and you probably want to separate the data from your sitespeed.io data, so you can disable Browsertime and do one run just to get the CrUx data. CrUx data doesn't change that often, so you can just run it once per day.

The plugin collects data for the specific URL that you test AND for the origin (domain).

Here's a full example of getting CrUx data, disabling Browsertime for that run, and sending the data to the namespace sitespeedio.crux:

~~~bash
sitespeed.io --crux.key $CRUX_API_KEY --plugins.remove browsertime --graphite.namespace sitespeedio.crux https://www.sitespeed.io
~~~

You will get a new tab in your result HTML with the CrUx data.

## Compare your lab data with the field
When you collect CrUx data, the **Google Web Vitals** card on each URL's metrics tab also shows the CrUx field p75 underneath your own lab median for TTFB, FCP, LCP, CLS and INP. Both lines are graded against the same Good / Needs improvement / Poor thresholds, so you can see at a glance whether your test setup matches what real users experience. When the lab grade is better than the field grade, the card flags the metric as *"Lab is more optimistic than real users"* — a hint that your test conditions (network, device, location, cached state) are rosier than the field, and the lab number is hiding a regression real users already feel.

The field line is matched to the device you tested with: a mobile run (```--mobile```, a real Android device, or iOS) is compared against the CrUx **PHONE** form factor, and a desktop run against **DESKTOP**. To get that match you need to collect the matching form factor (see [Form factor](#form-factor) below) — e.g. ```--crux.formFactor PHONE``` for a mobile run. If the matching form factor wasn't collected, the comparison falls back to **ALL**. The field line always shows which form factor it used (for example *"Field p75 · phone"* or *"Field p75 · all devices"*) so the two lines are never silently mismatched.

The comparison only appears for metrics that exist in both your run and the CrUx response; if CrUx has no data for a Vital, only the lab line is shown.

## Form factor
The CrUx data has four different buckets depending on device: DESKTOP, PHONE, TABLET and ALL. You can choose which data to get with ```--crux.formFactor```. Getting only phone data: ```--crux.formFactor PHONE```. If you want to collect data for multiple form factors, add ```--crux.formFactor``` multiple times.

~~~bash
sitespeed.io --crux.key $CRUX_API_KEY --crux.formFactor PHONE --crux.formFactor ALL https://www.sitespeed.io
~~~


## Collect URL or origin data or both
You can choose to collect data only for a specific URL, for the origin (domain), or for both (using **ALL**). Use the switch ```--crux.collect```. By default both URL and origin data are collected.

Let's collect only origin data:
~~~bash
sitespeed.io --crux.key $CRUX_API_KEY --crux.collect ORIGIN https://www.sitespeed.io
~~~

## Limitations
You can not get CrUx data if you use [scripting](/documentation/sitespeed.io/scripting/).