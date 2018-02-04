---
layout: default
title: Introduction to sitespeed.io and web performance testing
description: Start here if you are new to sitespeed.io or web performance testing.
keywords: introduction, getting started, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Introduction for sitespeed.io.
---
[Documentation](/documentation/sitespeed.io/) / Introduction

# Introduction
{:.no_toc}

* Let's place the TOC here
{:toc}

**Sitespeed.io is a *complete web performance tool* that helps you measure the performance of your website. What exactly does that mean?**

We think of a complete web performance tool as having three key capabilities:

 - It should test web sites using real browsers, simulating real users connectivity and collect important user centric metrics like Speed Index and First Visual Render.
 - It should analyse how your page is built and give feedback how you can make it faster for the end user.
 - It should collect and keep data on how your pages are built so you can easily track changes.

**What is sitespeed.io good for?**

It is usually used in two different areas:

 - Running in your continuous integration to find web performance regressions early: on commits or when you move code to your test environment
 - Monitoring your performance in production, alerting on regressions.

To understand how sitespeed.io does these things, let's talk about how it works.

First a few key concepts:

 - Sitespeed.io is built upon a couple of other Open Source tools in the sitespeed.io suite.
 - [Browsertime](../../browsertime/) is the tool that drives the browser and collect metrics.
 - [The Coach](../../coach/) knows how to build fast websites and analyse your page and give you feedback what you should change.
 - Visual Metrics is metrics collected from a video recording of the browser screen.
 - Everything in sitespeed.io is a [plugin](../plugins/) and they communicate by passing messages on a queue.

When you as user choose to test a URL, this is what happens on a high level:

 1. sitespeed.io starts and initialise all configured plugins.
 2. The URL is passed around the plugins through the queue.
    1. Browsertime gets the URL and opens the browser.
    2. It starts to record a video of the browser screen.
    3. The browser access the URL.
    4. When the page is finished, Browsertime takes a screenshot of the page.
    5. Then run some JavaScripts to analyse the page (using Coach and Browsertime scripts).
    6. Stop the video and close the browser.
    7. Analyse the video to get Visual Metrics like First Visual Change and Speed Index.
    8. Browsertime passes all metrics and data on the queue so other plugins can use it.
 3. The HTML/Graphite/InfluxDB plugin collects the metrics in queue.
 4. When all URLs are tested, sitespeed sends a message telling plugins to summarise the metrics and then render it.
 5. Plugins pickup the render message and the HTML plugin writes the HTML to disk.

Now it's time for you to [install and run sitespeed.io](../installation/).
