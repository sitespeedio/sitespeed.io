---
layout: default
title: Speed Index, video and more goodies
description: The new 4.1 release brings us Speed Index and video.
authorimage: /img/robot-head.png
intro: In 4.1 we have some really great news. SpeedIndex, video and preURL measuring that second view. And we also fixed that bug that Chrome sometimes doesn't start in Docker.
keywords: sitespeed.io, speed, index, speed, webperf, performance, web, wpo
nav: blog
---

# Speed Index, video and more goodies in 4.1

One month ago we released 4.0 and we have now been able to concentrate on the one thing that we wanted to include in 4.0 but didn't have time finish.

## Speed Index and video
In the new version you can record a video of the screen and we will calculate the SpeedIndex and start render from the video. We are able to do that thanks to [Patrick Meenan](https://twitter.com/patmeenan) that open sourced that part of WebPageTest as a standalone tool called [Visual Metrics](https://github.com/WPO-Foundation/visualmetrics). Without that we couldn't have done it.

Recording a video and slicing and dicing the result needs a lot of extra software (FFMpeg, ImageMagick, Pillow and pyssim), so use our Docker containers to get all those dependencies out of the box.

If you wanna collect SpeedIndex (and First Visual Change, Last Visual Change and Perceptual Speed Index) you run like this:

~~~bash
docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --video --speedIndex -c cable https://www.sitespeed.io/
~~~

All metrics will automatically be shown in the result report and sent to Graphite if you run is configured to do that. You will also get a video on your Browsertime result tab that looks like this:

<video width="800" height="auto" controls>
  <source src="/video/0.mp4" type="video/mp4">
Your browser does not support the video tag.
</video>

Using only <code>--video</code> you will record the screen but not collect metrics. If you only use <code>--speedIndex</code> we will collect the metrics and delete the video.

With 4.1 you have a Docker container that you can run anywhere (on your local machine, in the cloud, on your servers etc) and collect Speed Index from Chrome and Firefox. That makes us really happy. :)

Also a very special thanks to [Walter Ebert](https://github.com/walterebert) that helped us with FFMPeg so that we could convert the video to a mp4 that works in all modern browsers!

## Introducing pre URL and second view
The other big thing in 4.1 is that we made it easy to test second view. Ehh, second view you say? Well many tools have the repeat view (they access the same URL twice), to make it easy to see how the cache works. In real user scenarios it's better to first access one URL and then go to another that you want to measure (exactly as a user would do). In 4.0 we had support for that, but you needed to supply your own preScript. In 4.1 we made it super easy, just add the URL in the cli:

~~~bash
docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -c cable --preURL https://www.sitespeed.io/ https://www.sitespeed.io/documentation/
~~~

The browser will first access the preURL and then the URL you want to measure. If you have assets that are cached between requests, you can see that now. With this update you will now have a more realistic way of measuring when your user first go to your sites start page and then accesses the next.

## Page cost dashboard
We have a new dashboard that you can use to calculate the end user cost for your pages:  [https://dashboard.sitespeed.io/dashboard/db/page-cost-estimator](https://dashboard.sitespeed.io/dashboard/db/page-cost-estimator). We hope this help people focus on page weight.

## Other changes
We also have some other changes:

* tc (Linux Traffic Control) is now default connectivity engine in Docker. We have some problems currently with TSProxy and Selenium. You can help us with that [issue](https://github.com/sitespeedio/browsertime/issues/229).

*  You can now add an alias to your connectivity profile (<code>--browsertime.connectivity.alias</code>), that will be used as part of the key when we send metrics to Graphite. Thank you [@jpvincent](https://github.com/jpvincent) for the idea.

* We increased the resource timing buffer size to 600 to make sure the Fully loaded metric is more realistic for heavier request sites.

* We finally fixed that last (known) problem with Chrome in Docker, that made Chrome fail to start (sometimes). Thanks to the Selenium Docker team [that fixed it first](https://github.com/SeleniumHQ/docker-selenium/issues/87#issuecomment-250475864
).

## What's next
Christmas is coming soon and we will be taking it easy and mostly focusing on bug fixes, fine tuning the video, clean up the code, and finalizing Browsertime 1.0, but there's a couple of other things coming.

You will soon be able to [add an alias](https://github.com/sitespeedio/sitespeed.io/issues/1326) to your URLs when you send them to Graphite.

we also want to focus on [supporting InfluxDB](https://github.com/sitespeedio/sitespeed.io/issues/889). We have a base setup already and we would love help/feedback.

It would be super cool to have a custom video player, maybe you can [help us out](https://github.com/sitespeedio/sitespeed.io/issues/1356).

/Peter, Tobias, and Jonathan
