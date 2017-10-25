---
layout: default
title:  sitespeed.io
description: What you can do with the video in sitespeed.io
keywords: video, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
category: sitespeed.io
twitterdescription: Use the video in sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Video

# Video
{:.no_toc}

* Lets place the TOC here
{:toc}

## The stack (easy with Docker)
We use FFMpeg to record a video with 60 fps of the screen. The easiest way is to use our Docker container with pre-installed FFMpeg but if you for some reason want to use the npm version, you can record a video too. As long as you install FFMpeg yourself.

When we got the video we use [Visual Metrics](https://github.com/WPO-Foundation/visualmetrics) (built by Pat Meenan) to analyze the video and get SpeedIndex and other visual metrics from the video. If you use our Docker container you get that for free, else you need to install all the [Visual Metrics dependencies](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/master/Dockerfile) yourself.

The video will look something like this:

<div class="youtube-player" data-id="djFy0YeQkCM"></div>

## Video related parameters
There are a couple of things that you can do to configure the video and the metrics.

### SpeedIndex
To collect Visual Metrics like firstVisualChange, SpeedIndex, visualComplete85% and lastVisualChange you add the parameter <code>--speedIndex</code>. The video will then be recorded, analyzed and then removed.

### Video
If you want to keep the video when you collect metrics or only want the video, just add <code>--video</code> to the list of parameters.

### VideoRaw
The video will by default include a timer and show when visual metrics happens. If you want the video without any text/timer you just add <code>--videoRaw</code>.

### XVFB
If you run the Docker container we will automatically setup XVFB as a virtual frame buffer. If you run without Docker but still want to use XVFB, you add <code>--xvfb</code> and sitespeed.io will then start XVFB automatically, you only need to make sure it is installed.

## Compare two runs (combine two videos)
One of the things we love with [WebPageTest](https://www.webpagetest.org/) is the video where you can compare two different runs. Since sitespeed.io is serverless, it is nothing you can do on the fly. Instead we created a simple tool you can use. Only thing you need is Docker!

1. <code>curl -O https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/tools/combineVideos.sh<code>
2. <code>chmod +x combineVideos.sh<code>
3. Download the videos you want to compare, let us call them file1.mp4 and file2.mp4
4. <code>./combineVideos.sh file1.mp4 file2.mp4 </code>
5. You are done!

You will then have the two videos side by side, slightly slowed down that makes it easier to compare them:
<div class="youtube-player" data-id="xH0jRpM2nK8"></div>
