---
layout: default
title:  Record a video of the browser screen and analyse it to get Visual Metrics.
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
We use FFMpeg to record a video with 30 fps of the screen (but you can configure the number of frames per second). The easiest way is to use our Docker container with pre-installed FFMpeg and if you use the npm version, you can record a video too. Video works on Linux and OS X at the moment.

When we got the video we use [Visual Metrics](https://github.com/WPO-Foundation/visualmetrics) (built by Pat Meenan) to analyse the video and get SpeedIndex and other visual metrics from the video. If you use our Docker container you get that for free, else you need to install all the [Visual Metrics dependencies](https://github.com/sitespeedio/browsertime/blob/main/.travis.yml) yourself. You need FFMPeg, ImageMagick and a couple Pythin libraries. Checkout Browsertimes [Travis-CI configuration](https://github.com/sitespeedio/browsertime/blob/main/.travis.yml) to see what's needed.

We record the video in two steps: First we turn the background orange (that is used by VisualMetrics to know when the navigation starts), sets the background to white and let the browser go to the URL. The video is recorded lossless and then when the video has been analysed, we remove the orange frames and convert the video to a compressed mp4.

The video will look something like this:

<div class="youtube-player" data-id="djFy0YeQkCM"></div>

## Video related parameters
There are a couple of things that you can do to configure the video and the metrics.

### SpeedIndex and other Visual Metrics
To collect Visual Metrics like firstVisualChange, SpeedIndex, visualComplete85%, visualComplete95% visualComplete99% and lastVisualChange you add the parameter <code>--visualMetrics</code>. The video will then be recorded, analysed and then removed.

### Keep or remove the video
If you want to keep the video when you collect metrics or only want the video, just add <code>--video</code> to the list of parameters.

### Firefox window recorder
If you use Firefox you can use the built in window recorder (instead of using FFMPEG) to record the video. The Mozilla team uses it to make sure recording the video doesn't add any overhead. Turn it on with  <code>--firefox.windowRecorder</code>.

### Video quality
You can change the number of frames per second (default is 30) by using <code>--browsertime.videoParams.framerate</code>. If you have a large server with a lot of extra CPU you can increase the amount. You should probably not decrease it lower than 30 since it will affect the precision of Visual Metrics.

You can also change the constant rate factor (see [https://trac.ffmpeg.org/wiki/Encode/H.264#crf](https://trac.ffmpeg.org/wiki/Encode/H.264#crf)) to change the quality of the video. CRF is added in the second step (we first record the video as lossless as possible).

### Skip converting the video
When you record a video, the video is first recorded with settings to make the video recording as fast as possible and with low overhead. Then the video is converted to a format that better works in most video players. If you want to speed up your tests, you may want to remove the video convertion, you can do that with <code>--browsertime.videoParams.convert false</code>. 

### Remove timer and metrics from the video
The video will by default include a timer and show when visual metrics happens. If you want the video without any text/timer you just add <code>--browsertime.videoParams.addTimer false</code>.

### Filmstrip parameters
When the video is analysed with [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics) screenshots for
a filmstrip is also created. With sitespeed.io 8.1 you can see them in the HTML.

![Page to page]({{site.baseurl}}/img/filmstrip-multiple-pages.jpg)
{: .img-thumbnail}

By default we only show screenshots that differs or have a metric that gets collected at the same time. If you want to see all the screenshots you can do that with <code>--filmstrip.showAll</code>.

If you don't use those images you can turn them off with <code>--videoParams.createFilmstrip false</code>.

If you use them and want them the same size as the video (they are 200x200 by default) you can turn on the
full size by <code>--videoParams.filmstripFullSize</code>.

If you want to change the quality (compression level 0-100) of the images you do that with <code>--videoParams.filmstripQuality</code>.

### XVFB
If you run the Docker container we will automatically setup XVFB as a virtual frame buffer. If you run without Docker but still want to use XVFB, you add <code>--xvfb</code> and sitespeed.io will then start XVFB automatically, you only need to make sure it is installed.

### Collect visual elements metrics
You can choose to collect when visual elements are visible (and on their final position) on the screen. Turn on with <code>--visualElements</code> and collect Visual Metrics from elements. Works only with <code>--visualMetrics</code> turned on (default in Docker). By default you will get visual metrics from the largest image within the view port and the largest H1. 

You can also configure to pickup your own defined elements with <code>--scriptInput.visualElements</code>. Give the element a name and select it with <code>document.body.querySelector</code>. Use it like this: <code>--scriptInput.visualElements name:domSelector</code> . Add multiple instances to measure multiple elements. Visual Metrics will use these elements and calculate when they are visible and fully rendered. These metrics will also be included in HAR file so you can look at the waterfall and see when elements are visual within the viewport.

 
**Example**: Lets say that we want to measure when the logo of sitespeed.io is painted on screen.

![Logo sitespeed.io]({{site.baseurl}}/img/logo-example.jpg)
{: .img-thumbnail}

Open up devtools/web inspector and select the image:

![Web Inspector seleting the logo]({{site.baseurl}}/img/web-inspector.png)
{: .img-thumbnail}

Next step is to find that element using `document.body.querySelector`. Do that in your web console. The logo has a unique class, so lets use that:  `document.body.querySelector(".navbar-brand")`.

Then try it out in sitespeed.io. Lets name the element ... logo :)

```bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} -b chrome https://www.sitespeed.io/ --scriptInput.visualElements "logo:.navbar-brand"  --visualElements
```

And you can see the result in the Visual Metrics section:

![The logo in the result]({{site.baseurl}}/img/logo-result.jpg)
{: .img-thumbnail}

## Compare two video runs (combine two videos)
One of the things we love with [WebPageTest](https://www.webpagetest.org/) is the video where you can compare two different runs. Since sitespeed.io is serverless, it is nothing you can do on the fly. Instead we created a simple tool you can use. Only thing you need is Docker!

1. <code>curl -O https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/tools/combineVideos.sh<code>
2. <code>chmod +x combineVideos.sh<code>
3. Download the videos you want to compare, let us call them file1.mp4 and file2.mp4
4. <code>./combineVideos.sh file1.mp4 file2.mp4 </code>
5. You are done!

You will then have the two videos side by side, slightly slowed down that makes it easier to compare them:
<div class="youtube-player" data-id="xH0jRpM2nK8"></div>
