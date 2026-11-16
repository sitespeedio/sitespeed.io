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

{:toc}

## Introduction

*Humble* is a Raspberry Pi WiFi network link conditioner. It creates a WiFi network for your devices and gives you a web page where you switch the connection speed (3G, 4G and so on) on the fly.

Humble is built on top of [Throttle](https://github.com/sitespeedio/throttle) and [Throttle frontend](https://github.com/sitespeedio/throttle-frontend), running on a configured Raspberry Pi 4. It is open source and free to use.

## What do you need?
To set up your own Humble you need:

1. A Raspberry Pi 4 with a wired connection to your router.
2. An SD card (at least 8 GB).
3. A computer with [Raspberry Pi Imager](https://www.raspberrypi.com/software/) installed.

That's it.

Your setup will look like this:
![Humble setup](/img/humble-setup.png)
{: .img-thumbnail}

You switch the connection speed from a web page served by the Raspberry Pi:
![Humble frontend](/img/throttling-frontend.png)
{: .img-thumbnail}

The full setup and usage guide lives on GitHub: [sitespeedio/humble](https://github.com/sitespeedio/humble).