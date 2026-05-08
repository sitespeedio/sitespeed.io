---
layout: default
title: Coach Introduction
description: Why do you need the coach.
keywords: coach, documentation, web performance, core web vitals
author: Peter Hedenskog
nav: documentation
category: coach
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---
[Documentation]({{site.baseurl}}/documentation/coach/) / Introduction

# The Coach - Introduction
{:.no_toc}

{:toc}


## Do my page need coaching?

You know, it's hard to get everything right! The world is complex: HTTP/1 vs HTTP/2. Some of the previous performance best practices are now considered bad practice. Luckily for you the coach will detect that the page is accessed using HTTP/2, and adjust its advice accordingly.


## Why we love the coach
Reasons why we love the coach and you will too:

 - The coach gives you advice on how to make your page faster. The coach aims to NEVER give you bad advice. Follow the advice and you will WIN!
 - The coach uses real browsers to see your page exactly like your users do.
 - Every rule carries a **severity tier** (`error` / `warn` / `info`) alongside its score and weight, so you can tell "fix this now" from "good to know" at a glance.
 - The coach has rules for every Core Web Vital (LCP, CLS, INP, FCP), modern image best practices (`decoding="async"`, lazy loading, AVIF/WebP, LCP `fetchpriority`), and the modern privacy / security headers (CSP, COOP/COEP/CORP, Permissions-Policy, X-Content-Type-Options, NEL, Reporting-Endpoints, Referrer-Policy).
 - Every advice has one or more unit-tests to make sure it's easy to change advice in the future.
 - The coach knows about more than just performance: privacy and web best practice are other things that the coach can help you with.
 - You can integrate the coach with your own web performance tool. It's easy: your tool only need to be able to run JavaScript in the browser and produce a HAR file. Or you can use the built-in functionality of the coach to run the browser.
 - The coach is open-source. The advice is public, you can check it, change it, or add to it yourself. Help us make the coach even better!
 - The coach can combine knowledge from the DOM with HAR to give you super powerful advice.
 - The CLI output is pretty nice. You can configure how much you want to see. Use it as a fast way to check the performance of your page.

## Help us improve the coach
Have an idea for new advice, or spotted something the coach should catch? Open an issue or send a PR — check out the [issues](https://github.com/sitespeedio/coach/issues), try the project and give us feedback.
