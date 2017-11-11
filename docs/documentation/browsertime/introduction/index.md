---
layout: default
title: Getting Started with browsertime.
description: A short description of what you can do.
keywords: introduction, getting started, documentation, web performance, browsertime
nav: documentation
category:  browsertime
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Introduction for browsertime.
---
[Documentation](/documentation/browsertime/) / Introduction

# Introduction
{:.no_toc}

* Let's place the TOC here
{:toc}


**Browsertime lets you *automate running JavaScript in your browser* primary used to collect performance metrics. What exactly does that mean?**

We think of a Browsertime as having four key capabilities:

 - It starts/stop the browser (Firefox/Chrome).
 - It executes a batch of default and configurable JavaScript when the URL has finished loading in the browser.
 - It records a video of the Browser screen used to calculate Visual Metrics.
 - It lets you run Selenium scripts before and after the browser access the URL (to login a user etc).

**What is Browsertime good for?**

It is usually used in two different areas:

 - You run it as a standalone tool to collect performance timing metrics of your web site.
 - You integrate it in your tool as a JavaScript runner that collects whatever JavaScript metrics you want.

To understand how Browsertime does these things, let's talk about how it works.

Browsertime uses the [WebDriver](https://www.w3.org/TR/webdriver/) (through [Selenium](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html)) to drive Firefox and Chrome. Browsertime loads a URL, executes JavaScript that collect [Navigation Timing](http://kaaes.github.io/timing/info.html), [User Timing](http://www.html5rocks.com/en/tutorials/webperformance/usertiming/),
[Resource Timing](http://www.w3.org/TR/resource-timing/), first paint and [RUM Speed Index](https://github.com/WPO-Foundation/RUM-SpeedIndex). It also collects a [HAR](http://www.softwareishard.com/blog/har-12-spec/) file and can record a video of the browser screen and analyse the video to get metrics like First Visual Change and Speed Index.

Now it's time for you to [install and run Browsertime](../installation/).
