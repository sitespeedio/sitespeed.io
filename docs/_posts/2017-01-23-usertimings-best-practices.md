---
layout: default
title: User timers Best Practices and New Whitelisting
description: User timings can now be filtered using a user defined whitelist
authorimage: /img/aboutus/jonathan.jpg
intro: Recently Google started to heavily use User Timings to track some of their ads implemented on various sites. While generally I would commend anyone that takes advantage of the performance API, sometimes that can also have repercussions and cause issues for other tools.
keywords: sitespeed.io, user timings,
nav: blog
---

# User timers Best Practices and New Whitelisting

Recently Google started to heavily use User Timings to track some of their ads implemented on various sites. While generally I would commend anyone that takes advantage of the performance API, sometimes that can also have repercussions and cause issues for other tools.

What issues you say? Well implementing user timings with a unique id per ad in combination with a site capturing those timings in a performance tracking tools for trending analysis can cause issues. The biggest impact we have seen is the integration with a TSDB (time series database). If every user timer has a unique id it means you no longer have control of the size of your TSDB and it falls to the mercy of these user timings, growing unbounded forever ... well at least until you run out of disk space. ;-)

![goog_ TSDB overview]({{site.baseurl}}/img/usertimings-goog_.png)
{: .img-thumbnail}


That's no good! :'( It even causes the following in the WebPageTest UI.

<div class="video-container">
<iframe width="853" height="480" src="https://www.youtube.com/embed/R7YHNMvBLSA" frameborder="0" allowfullscreen></iframe>
</div>


A few weeks ago after we noticed these rogue user timings filling up our poor servers we decided to blacklist Google's user timings until we could implement a more robust solution. Luckily for us one best practice that Google followed that I would love for sites to adopt was namespacing their user timings with `goog_`. That allows us to easily remove these timings, since they are not really relevant for our performance tracking needs.

With the latest release we probably will continue to blacklist `goog_`, but with that we will have a whitelist in which a user will be able to supply a regex that will restrict what user timings are reported on in the HTML output and sent to our currently supported TSDB of Graphite (and soon InfluxDB). You should be able to do this by passing `--userTimingWhitelist <some regex>`


With that all said and the whitelist implemented, I think the following are generally best practice for the use of User Timings that are supported in modern browsers

- namespace your timers with `<site>_`
- Don't use unique ids unless absolutely necessary.
- If you do need to use unique ids make sure to use namespaces to help out other tools. ;-)

With all this said Happy New year everyone!

/Jonathan
