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

* Let's place the TOC here
{:toc}


**Browsertime lets you *automate running JavaScript in your browser* primary used to collect performance metrics. What exactly does that mean?**

We think of a Browsertime as having four key capabilities:

 - It handles everything with the browser (Firefox/Chrome).
 - It executes a batch of default and configurable JavaScript when the URL has finished loading in the browser.
 - It records a video of the Browser screen used to calculate Visual Metrics.
 - It lets you run Selenium scripts before and after the browser access the URL (to login a user etc).

**What is Browsertime good for?**

It is usually used for two different things:

 - You run it as a standalone tool to collect performance timing metrics of your web site.
 - You integrate it in your tool as a JavaScript runner that collects whatever JavaScript metrics/information you want.

To understand how Browsertime does these things, let's talk about how it works. Here's an example of what happens when you give Browsertime a URL to test:

1. You give your configuration to Browsertime.
2. Browsertime uses the [WebDriver](https://www.w3.org/TR/webdriver/) (through [Selenium](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html)) to start Firefox and Chrome (the implementations for the Webdriver is [Chromedriver](https://sites.google.com/a/chromium.org/chromedriver/)/[Geckodriver](https://github.com/mozilla/geckodriver/)).
3. Browsertime starts FFMPEG to record a video of the browser screen
4. The browser access the URL.
5. When the page is finished loading (you can define yourself when that happens), Browsertime executes the default JavaScript timing metrics and collects:
   - [Navigation Timing metrics](http://kaaes.github.io/timing/info.html)
   - [User Timing metrics](http://www.html5rocks.com/en/tutorials/webperformance/usertiming/)
   - [Resource Timing data](http://www.w3.org/TR/resource-timing/)
   - First paint
   - [RUM Speed Index](https://github.com/WPO-Foundation/RUM-SpeedIndex).
6. It also collects a [HAR](http://www.softwareishard.com/blog/har-12-spec/) file that shows all requests/responses on the page.
7. FFMpeg is stopped and the video is analysed. Browsertime collect Visual Metrics like Speed Index.

The result of the run is a JSON file with all the JavaScript metrics collected, a HAR file, a video recording of the screen and a screenshot.

Now it's time for you to [install and run Browsertime](../installation/).
