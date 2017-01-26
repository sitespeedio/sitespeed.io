---
layout: default
title: Content type icons in the waterfall graph!
description: 4.3 gives us icons in the waterfall graph and a bug fix for getting firstVisualChange on mobile
authorimage: /img/robot-head.png
intro: It is soon Christmas so we need to release 4.3 with two cool things! A new updated version of PerfCascade that adds content type icons to the waterfall graph and a bug fix for getting correct firstVisualChange when testing as an emulated mobile device.
keywords: sitespeed.io, speed, index, speed, webperf, performance, web, wpo
nav: blog
---

# Icons in the waterfall graph

It doesn't sound like much but it actually helps you a lot: The new version of [PerfCascade](https://github.com/micmro/PerfCascade) has updated content type icons, that make it easy to identify the content type for each response.

![Content type icons in the graph]({{site.baseurl}}/img/waterfallicons.png)
{: .img-thumbnail}

PerfCascade is an SVG HAR viewer built by [Michael Mrowetz](https://twitter.com/micmro) that we use in sitespeed.io. You can try it out standalone with your own HAR at [https://micmro.github.io/PerfCascade/](https://micmro.github.io/PerfCascade/). It is Open Source and we would love if you try it out standalone and give us suggestion [how we can make it even better](https://github.com/micmro/PerfCascade/issues)!

# Correct firstVisualChange
If you run our Docker container (you should!) you can get SpeedIndex, first and last visual change. If you used it in the past and configured to emulate a mobile device, it happened that the firstVisualChange was wrong (it was too early). That is fixed now in the new version.

# Christmas and holidays
Christmas is coming and we will probably not do any new releases before new year (maybe a bug fix release or two). See you next year!


/Peter, Tobias, and Jonathan
