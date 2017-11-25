---
layout: default
title: Just in time for Christmas!
description: We got some big news - sitespeed.io 6.0, Browsertime 2.0, The Coach 1.0 and PageXray 2.0 is here!
authorimage: /img/aboutus/jonathan.jpg
intro: We got some big news - sitespeed.io 6.0, Browsertime 2.0, The Coach 1.0 and PageXray 2.0 is here. We moved to NodeJS 8, made a lot of small improvements and focused a lot on making plugins more powerful.
keywords: sitespeed.io, sitespeed, 6.0
nav: blog
---

# 6.0 and more

The last weeks we've been releasing sitespeed.io 6.0, Browsertime 2.0, PageXray 2.0 and the Coach 1.0. And lets talk about the changes we have done. But before we start: Every tool now have latest LTS of NodeJS as requirement (moving from 6 to 8). That means if you don't use our Docker containers, you need to upgrade NodeJS. The move to latest NodeJS will make it easer for us to clean the code and start using await/async.

One of the biggest things we done for all these releases is updating the documentation. It was ok before but missing out on so many things. You really should check out [the new version](https://www.sitespeed.io/documentation/) of the documentation.

## Sitespeed.io 6.0
The main focus for 6.0 has been to update the plugin structure so it's easier to write more powerful plugins. With the new version, plugins communicate with each other using the queue. There's a new queue phase called *sitespeedio.setup* where plugins can talk with the others. For example a plugin can register a PUG file to the HTML plugin, so that the metrics the plugin produces can be [showed in the HTML](https://www.sitespeed.io/documentation/sitespeed.io/plugins/#create-html-for-your-plugin). Another cool thing is that the Browsertime plugin [listens to JavaScript setup messages](https://www.sitespeed.io/documentation/sitespeed.io/plugins/#let-your-plugin-collect-metrics-using-browsertime), so other plugins can run JavaScript on the tested page (through Browsertime), and use the data.

We also moved out the [GPSI plugin](https://github.com/sitespeedio/plugin-gpsi) to be a standalone (example) plugin. That means if you want to use GPSI, you need to follow the [instructions](https://www.sitespeed.io/documentation/sitespeed.io/plugins/#add-a-plugin) in how to add a plugin.

We think these changes will make the plugins more powerful. We have new repo where we will keep track of 3rd party plugins [https://github.com/sitespeedio/plugins](https://github.com/sitespeedio/plugins). Go there and checkout [Lorenzo Urbini](https://github.com/siteriaitaliana) work in progress to implement a Lighthouse plugin.



When you upgrade, please read or [upgrade notes](https://www.sitespeed.io/documentation/sitespeed.io/upgrade/) and check the full [changelog](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md).

## Browsertime 2.0

We've been focusing on the video for 2.0:

 * We changed the default frame rate of the video to 30 (before it was 60) to work better on smaller cloud services (you can configure it with ```--videoParams.framerate```).
 * We record the video in two steps: first record lossless and then convert the video to more usable format. That makes the ffmpeg use less CPU and that gives us more stable metrics.
 * More configurable stuff from the video: you can now turn on/off the filmstrip screenshots (```--videoParams.createFilmstrip```), set the quality (```--videoParams.filmstripQuality```), and choose if you want them in full video size (```--videoParams.filmstripFullSize```).
 * Create a video that includes what you run in preScript and postScript with ```--videoParams.combine```. This makes it much easier to debug you pre/post scripts.

We removed TSProxy and tc (sltc) as connectivity engines since none of them worked 100%. Instead user Docker networks or the new Throttle engine. The default engine when you run in Docker is now external, before it was tc. That means you need to actively choose to use Throttle or Docker networks.

The default engine when you run in Docker is now "external" instead of tc, that means if you want to change the connectivity you need to do that with Docker networks or use the bundled Throttle engine. We also removed TSProxy and tc. Please use Docker networks or Throttle as engine.

Read the [full changelog](https://github.com/sitespeedio/browsertime/blob/master/CHANGELOG.md#version-200-2017-11-23).

## PageXray 2.0
Only bug fixes and upgrading to NodeJS 8 in 2.0, but did you know that in the autumn we also released a [standalone JavaScript version of PageXray](https://github.com/sitespeedio/pagexray/releases) that you can use in the browser?

## Coach 1.0
We finally released 1.0 with some tweaks of the advices. The coach now give advices about Google Analytics and Google Tag Manager, giving you the full power of an independent tool :)


## What did not reach 6.0?
One of the most asked functionalities has been do be able to test multiple pages in one run. We created a meta issue for that, help us dig into it [#1827](https://github.com/sitespeedio/sitespeed.io/issues/1827)


/Jonathan
