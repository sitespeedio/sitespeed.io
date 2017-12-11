---
layout: default
title: Just in time for Christmas!
description: We got some big news - sitespeed.io 6.0, Browsertime 2.0, The Coach 1.0 and PageXray 2.0 is here!
authorimage: /img/aboutus/jonathan.jpg
intro: We got some big news - sitespeed.io 6.0, Browsertime 2.0, The Coach 1.0 and PageXray 2.0 is here. We moved to NodeJS 8, made a lot of small improvements and focused on making plugins more powerful.
keywords: sitespeed.io, sitespeed, 6.0
nav: blog
---

# Just in time for Christmas - sitespeed.io 6.0 (and more!)

The last few weeks we've been working to release sitespeed.io 6.0, Browsertime 2.0, PageXray 2.0 and the Coach 1.0. Let's talk about the changes we have done, but before we start: Every tool now has a hard requirement for the latest NodeJS LTS (moving from 6 to 8). That means if you don't use our Docker containers, you need to upgrade NodeJS. The move to latest NodeJS will make it easer for us to clean up the code and start using some of the latest features such as await/async.

One of the biggest things we done for all these releases is updating the documentation. It was good before but missed out on capturing so many smaller things. You really should check out [the new version](https://www.sitespeed.io/documentation/) of the documentation.

![Our feelings about 6.0]({{site.baseurl}}/img/6.0-finally.gif)
{: .img-thumbnail-center}

## Sitespeed.io 6.0
The main focus for 6.0 has been to update the plugin structure so it's easier to write more powerful plugins. The new version, allows plugins  to communicate with each other using the queue. This means there is a new queue phase called *sitespeedio.setup* where plugins can talk with the others! For example a plugin can register a PUG file to the HTML plugin, so that the metrics the plugin produces can be [showed in the HTML output](https://www.sitespeed.io/documentation/sitespeed.io/plugins/#create-html-for-your-plugin). Another cool thing is that the Browsertime plugin [listens to JavaScript setup messages](https://www.sitespeed.io/documentation/sitespeed.io/plugins/#let-your-plugin-collect-metrics-using-browsertime), so other plugins can run JavaScript on the tested page (through Browsertime), and use that data.

We've moved out the [GPSI plugin](https://github.com/sitespeedio/plugin-gpsi) to be it's own standalone plugin, which makes it a great reference example for new plugins. Removing it from the core does means if you want to use GPSI, you need to follow the [instructions](https://www.sitespeed.io/documentation/sitespeed.io/plugins/#add-a-plugin) on how to add a plugin.

These changes will make the plugins more powerful than ever before. We have a new repo where we will keep track of 3rd party plugins [https://github.com/sitespeedio/plugins](https://github.com/sitespeedio/plugins). Go there and checkout [Lorenzo Urbini](https://github.com/siteriaitaliana) work in progress to implement a Lighthouse plugin and help out if you can!


When you upgrade, please read our [upgrade notes](https://www.sitespeed.io/documentation/sitespeed.io/upgrade/) and check out the full [changelog](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md).

### What did not reach 6.0?
One of the most asked functionalities has been to be able to test multiple pages in one run. We created a meta issue for that, join the discussion at [#1827](https://github.com/sitespeedio/sitespeed.io/issues/1827).

## Browsertime 2.0

We've been focusing on video for 2.0:

 * We changed the default frame rate of the video to 30 (before it was 60) to work better on smaller cloud services (you can configure it with ```--videoParams.framerate```).
 * We record the video in two steps: first we record the video in a lossless format and then convert it to a more usable format. This makes the ffmpeg use less CPU and gives us more stable metrics.
 * More configurations for the video: you can now turn on/off the filmstrip screenshots (```--videoParams.createFilmstrip```), set the quality (```--videoParams.filmstripQuality```), and choose if you want them in full video size (```--videoParams.filmstripFullSize```).
 * You can create a video that includes what is run in preScript and postScript with ```--videoParams.combine```. This makes it much easier to debug any pre/post scripts.

Other things in 2.0 is that it's now easier to test with  Firefox Nightly, Beta and Developer edition on Mac OS X. Just add ```--firefox.nightly```, ```--firefox.beta``` or ```--firefox.developer``` to the cli (for Linux you need point out the location with ```--firefox.binaryPath``` as before).

We removed TSProxy and tc (sltc) as connectivity engines since none of them worked 100%. Instead use Docker networks or the new Throttle engine. The default engine when you run in Docker is now "external", instead of tc.

Important: This change means you need to actively choose to use Throttle or Docker networks.
{: .note .note-warning}

Read the [full changelog](https://github.com/sitespeedio/browsertime/blob/master/CHANGELOG.md#version-200-2017-11-23).

## PageXray 2.0
Only bug fixes and upgrading to NodeJS 8 in 2.0, but did you know that in the Autumn we also released a [standalone JavaScript version of PageXray](https://github.com/sitespeedio/pagexray/releases) that you can use in the browser?

## Coach 1.0
We finally released 1.0 with some tweaks of the advices. The coach now give advices about Google Analytics and Google Tag Manager, giving you the full power of an independent tool! :)

/Jonathan
