---
layout: default
title: Introduction to Browsertime.
description: Start here if you are new to Browsertime.
keywords: introduction, getting started, documentation, web performance, browsertime
nav: documentation
category:  browsertime
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Introduction to Browsertime.
---
[Documentation](/documentation/browsertime/) / Introduction

# Introduction
{:.no_toc}

{:toc}


**Browsertime drives a real browser, runs your URL (or your script), and collects performance data. It is the engine that powers sitespeed.io, but you can also use it on its own.**

There are four things Browsertime does:

 - Drives the browser (Chrome, Firefox, Edge and Safari on desktop, Chrome and Firefox on Android, Safari on iOS).
 - Runs a set of built-in JavaScript probes once the page is ready, plus any extra JavaScript you ask for.
 - Records a video of the browser viewport so we can calculate Visual Metrics like Speed Index, First Visual Change and Last Visual Change.
 - Lets you run a Selenium-style script before, during and after the navigation — log a user in, click through a flow, measure single-page-app route changes, and so on.

**What is Browsertime good for?**

There are two common ways to use it:

 - As a standalone command line tool to collect performance metrics for a page or a user journey.
 - As a JavaScript runner inside your own tool, where it boots a browser, runs your code and hands you the result.

To get a feel for what happens under the hood, here is what a single run looks like:

1. You give Browsertime a URL (or a script) and your configuration.
2. Browsertime starts the browser through [WebDriver](https://www.w3.org/TR/webdriver/) using [Selenium](https://www.selenium.dev/selenium/docs/api/javascript/) and the matching driver ([ChromeDriver](https://developer.chrome.com/docs/chromedriver) / [GeckoDriver](https://github.com/mozilla/geckodriver/) / [MSEdgeDriver](https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/) / SafariDriver).
3. FFmpeg starts recording the browser viewport (when video is enabled).
4. The browser navigates to the URL.
5. When the page is ready (you decide what "ready" means), Browsertime runs the built-in JavaScript probes and collects:
   - [Navigation Timing](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Navigation_timing) and [User Timing](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/User_timing) entries.
   - Paint timings (First Paint, First Contentful Paint).
   - Core Web Vitals: Largest Contentful Paint, Cumulative Layout Shift and Interaction to Next Paint.
   - Long tasks and CPU activity from the Chrome trace (`--cpu`).
6. Browsertime records a [HAR](http://www.softwareishard.com/blog/har-12-spec/) file with every request and response on the page. Single-page-app route changes are captured too, using Chrome's soft-navigation entry type.
7. FFmpeg stops and the video is analysed to produce Visual Metrics like Speed Index.

The result of a run is a JSON file with every metric that was collected, a HAR file, a video and a screenshot.

Now it is time to [install and run Browsertime](../installation/).
