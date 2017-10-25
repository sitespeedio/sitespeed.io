---
layout: default
title:  Record a video of the browser screen and analyze it to get Visual Metrics.
description: You can configure frames per second (fps), the quality of the video and a couple of more things.
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
We use FFMpeg to record a video with 30 fps of the screen (but you can configure the number of frames per second). The easiest way is to use our Docker container with pre-installed FFMpeg but if you for some reason want to use the npm version, you can record a video too. As long as you install FFMpeg yourself.

When we got the video we use [Visual Metrics](https://github.com/WPO-Foundation/visualmetrics) (built by Pat Meenan) to analyze the video and get SpeedIndex and other visual metrics from the video. If you use our Docker container you get that for free, else you need to install all the [Visual Metrics dependencies](https://github.com/sitespeedio/docker-visualmetrics-deps/blob/master/Dockerfile) yourself.

We record the video in two steps: First we turn the background orange (that is used by VisualMetrics to know when
 the navigation starts), sets the background to white and let the browser go to the URL. The video is recorded
 lossless and then when the video has been analyzed, we remove the orange frames and convert the video to a compressed mp4.

The video will look something like this:

<div class="youtube-player" data-id="djFy0YeQkCM"></div>

## Video related parameters
There are a couple of things that you can do to configure the video and the metrics.

### SpeedIndex and other Visual Metrics
To collect Visual Metrics like firstVisualChange, SpeedIndex, visualComplete85%, visualComplete95% visualComplete99% and lastVisualChange you add the parameter <code>--speedIndex</code>. The video will then be recorded, analyzed and then removed.

### Keep or remove the video
If you want to keep the video when you collect metrics or only want the video, just add <code>--video</code> to the list of parameters.

### Video quality
You can change the number of frames per second (default is 30) by using <code>--browsertime.videoParams.framerate</code>. If you have a large server with a lot of extra CPU you can increase the amount. You should probably not decrease it lower than 30 since it will affect the precision of Visual Metrics.

You can also change the constant rate factor (see [https://trac.ffmpeg.org/wiki/Encode/H.264#crf](https://trac.ffmpeg.org/wiki/Encode/H.264#crf)) to change the quality of the video. CRF is added in the second step (we first record the video as lossless as possible).

### Remove timer and metrics from the video
The video will by default include a timer and show when visual metrics happens. If you want the video without any text/timer you just add <code>--browsertime.videoParams.addTimer false</code>.

### Filmstrip parameters
When the video is analyzed with [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics) screenshots for
a filmstrip is also created.

If you don't use those images you can turn them off with <code>--videoParams.createFilmstrip false</code>.

If you use them and want them the same size as the video (they are 200x200 by default) you can turn on the
full size by <code>--videoParams.filmstripFullSize</code>.

If you want to change the quality (compression level 0-100) of the images you do that with <code>--videoParams.filmstripQuality</code>.

### XVFB
If you run the Docker container we will automatically setup XVFB as a virtual frame buffer. If you run without Docker but still want to use XVFB, you add <code>--xvfb</code> and sitespeed.io will then start XVFB automatically, you only need to make sure it is installed.

## Compare two video runs (combine two videos)
One of the things we love with [WebPageTest](https://www.webpagetest.org/) is the video where you can compare two different runs. Since sitespeed.io is serverless, it is nothing you can do on the fly. Instead we created a simple tool you can use. Only thing you need is Docker!

1. <code>curl -O https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/tools/combineVideos.sh<code>
2. <code>chmod +x combineVideos.sh<code>
3. Download the videos you want to compare, let us call them file1.mp4 and file2.mp4
4. <code>./combineVideos.sh file1.mp4 file2.mp4 </code>
5. You are done!

You will then have the two videos side by side, slightly slowed down that makes it easier to compare them:
<div class="youtube-player" data-id="xH0jRpM2nK8"></div>
