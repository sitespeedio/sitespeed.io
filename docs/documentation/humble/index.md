---
layout: default
title: Humble - Raspberry Pi WiFi network link conditioner
description: Simulate slow network connections on your WiFi network.
keywords: throttle, documentation, web performance
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Simulate slow network connections on your WiFi network.
---

# Humble
{:.no_toc}

* Lets place the TOC here
{:toc}

## Introduction

We are super happy to introduce *Humble* the Raspberry Pi WiFi network link conditioner! It creates a new WiFi network that you use for your device. You then access a web page where you set the network speed (3G/4G etc) for your WiFi.

Humble uses [Throttle](https://github.com/sitespeedio/throttle) and [Throttle frontend](https://github.com/sitespeedio/throttle-frontend) and a configured Raspberry Pi 4. And it's all Open Source and you can use it for free.

## What do you need?
To setup your own instance of Humble you need:
1. A Raspberry Pi 4 with a wired connection to your router.
2. A SD card (at least 8 GB)
3. A computer with Raspberry Pi Imager (that you can download from [https://www.raspberrypi.com/software/](https://www.raspberrypi.com/software/)).

Yes that is all!

Your setup will look like this:
![Humble setup](/img/humble-setup.png)
{: .img-thumbnail}

And you switch connection speed on the WiFi using a web page on the Raspberry Pi:
![Humble frontend](/img/throttling-frontend.png)
{: .img-thumbnail}

Read all about how to use Humble at GitHub: [https://github.com/sitespeedio/humble](https://github.com/sitespeedio/humble)