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
[Documentation](/documentation/browsertime/) / Getting Started

# Getting Started
{:.no_toc}

* Let's place the TOC here
{:toc}

Browsertime is an Open Source tool that helps you getting metrics from your web page. You can [install](../installation/) it using [npm](https://www.npmjs.org/)/[yarn](https://yarnpkg.com/)/[Docker](https://www.docker.com/).

Browsertime uses the [WebDriver](https://www.w3.org/TR/webdriver/) (through [Selenium](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html)) to drive Firefox and Chrome. Browsertime loads a URL, executes JavaScript that collect [Navigation Timing](http://kaaes.github.io/timing/info.html), [User Timing](http://www.html5rocks.com/en/tutorials/webperformance/usertiming/),
[Resource Timing](http://www.w3.org/TR/resource-timing/), first paint and [RUM Speed Index](https://github.com/WPO-Foundation/RUM-SpeedIndex). It also collects a HAR file and can record a video of the browser screen and analyse the video to get metrics like First Visual Change and Speed Index.

Yep that's it. Now head over to the [configuration](../configuration/) or to the [details](../details/).
