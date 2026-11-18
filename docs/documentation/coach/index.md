---
layout: default
title: The Coach - performance, privacy and best-practice advice
description: Use the Coach to find performance, privacy and best-practice problems on your page.
keywords: tools, documentation, web performance, core web vitals, coach
author: Peter Hedenskog
nav: documentation
category: coach
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---
# The Coach

<img src="{{site.baseurl}}/img/logos/coach.png" class="pull-right img-big" alt="The Coach" width="188" height="219">

The Coach analyses your web page and tells you what to fix. It covers Core Web Vitals (LCP, CLS, INP, FCP), modern image best practices (`decoding="async"`, lazy loading, AVIF/WebP, LCP `fetchpriority`) and the privacy and security headers that matter today (CSP, COOP/COEP/CORP, Permissions-Policy, X-Content-Type-Options, NEL, Reporting-Endpoints, Referrer-Policy).

The Coach is built into [sitespeed.io](/documentation/sitespeed.io/) — when you run sitespeed.io, the Coach runs with it. You can also use the analysis library, [`coach-core`](https://github.com/sitespeedio/coach-core), directly from your own code.

* [Introduction](introduction/) — what the Coach checks and how scoring works.
* [How to use the Coach](how-to/) — get advice from sitespeed.io or `coach-core`.
* [Developers](developers/) — write or improve a Coach rule.
