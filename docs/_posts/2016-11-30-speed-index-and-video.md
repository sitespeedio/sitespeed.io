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

One month ago we released 4.0 and we have been able concentrate on one thing that we wanted to include in 4.0 bit didn't have time.

## Speed Index and video
In the new version you can record a video of the screen and we calculate the SpeedIndex and start render from the video. We are able to do that thanks to [Patrick Meenan](https://twitter.com/patmeenan) thats open sourced that part of WebPageTest as a standalone tool called [Visual Metrics](https://github.com/WPO-Foundation/visualmetrics). Without that we couldn't have done it.

Recording a video and slicing and dicing the result needs a lot if extra software (FFMpeg, ImageMagick, Pillow and pyssim) so use your Docker containers to get that out of the box.

If you wanna collect SpeedIndex (and first visual change, last visual change and Perceptual Speed Index) you run like this:

~~~ bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --video --speedIndex -c cable https://www.sitespeed.io/
~~~

All metrics will automatically be shown in the result report and sent to Graphite if you have setup. You will also get a video on your Browsertime result tab that looks like this:

<video width="800" height="auto" controls>
  <source src="/video/0.mp4" type="video/mp4">
Your browser does not support the video tag.
</video>

Using only <code>--video</code> you will record the screen but not collect metrics.

With 4.1 you have Docker container that you can run anywhere (on your local machine, in the cloud, on your servers etc) and collect Speed Index from Chrome and Firefox. And that makes us really happy :)

Also a very special thanks to [Walter Ebert](https://github.com/walterebert) that helped us with FFMPeg so we convert the video to a mp4 that works in all modern browsers.

## Introducing pre URL and second view
The other big thing in 4.1 is that we made it easy test second view. Ehh, second view you say? Well many tools have the repeat view (access the same URL twice), to make it easy to see how the cache works. However in real user scenarios it's better to first access one URL and then go to the one that you want to measure (exact as the user do). In 4.0 we had support for that but you need supply your own preScript. In 4.1 we made it super easy, just add the URL with parameter:

~~~ bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -c cable --preURL https://www.sitespeed.io/ https://www.sitespeed.io/documentation/
~~~

The browser will first access the preURL, if responses have cache headers set, they are cached to the next second view, where the browser access the URL you want to measure. Now you have a more realistic way of measuring when your user first go to your sites start page and then access the next.

## Page cost dashboard
We have a new dashboard that you can use to calculate the end user cost for your pages  [https://dashboard.sitespeed.io/dashboard/db/page-cost-estimator](https://dashboard.sitespeed.io/dashboard/db/page-cost-estimator).

## Other changes
We also have some other changes:

* tc (Linux Traffic Control) is now default connectivity engine in Docker. We have some problems with TSProxy and Selenium. You can help us with that [issue](https://github.com/sitespeedio/browsertime/issues/229).

*  You can now add an alias to your connectivity profile (<code>--browsertime.connectivity.alias</code>), that will be used as part of the key when we send metrics to Graphite.  Than you
custom alias for connectivity thank you [@jpvincent](https://github.com/jpvincent) for the idea.

* We increased the resource timing buffer size to 600 to make sure the Fully loaded metric works better.

* We finally fixed that last (known) problem with Chrome in Docker, that made Chrome fail to start sometimes. Thanks to the Selenium Docker team [that fixed it first](https://github.com/SeleniumHQ/docker-selenium/issues/87#issuecomment-250475864
)

## What's next
Christmas is coming soon and we will take it easy and mostly focus on bug fixes, clean up the code and finalizing Browsertime 1.0 but there's a couple of other things coming.

Soon you will be able to [add an alias](https://github.com/sitespeedio/sitespeed.io/issues/1326) to your URLs when you send them to Graphite.

Then we want to focus on [supporting InfluxDB](https://github.com/sitespeedio/sitespeed.io/issues/889). We have a base setup already and we would love help/feedback.

## How can you help out?
It would be super cool if could have custom video player, maybe you can [help us out](https://github.com/sitespeedio/sitespeed.io/issues/1356)

/Peter, Tobias, and Jonathan
