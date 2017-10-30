---
layout: default
title: Announcing sitespeed.io 6.0
description: Announcing sitespeed.io 6.0!
authorimage: /img/aboutus/jonathan.jpg
intro: After the release of 5.0 back in April we've (Peter/Tobias/Jonathan) decided to take things to the next level and introduce 6.0.
keywords: sitespeed.io, sitespeed, site, speed, webperf, performance, web, wpo
nav: blog
---

# 6.0.0

It's been a while since we've posted but, trust me it not from a lack of new implemented features in sitespeed.io. While adding new features and fixing bugs here and there we've been brainstorming on how to make sitespeed.io even better.

Let's list out a few of the upcoming improvements:

* Use Chartist to display visual progress and size/requests to make it easier for users #1659.

* The HTML pages now works better on larger screens #1740.

* We upgraded to use the official Graphite Docker container and using Graphite 1.X as default #1735.

* Log the full URL to your result, makes it easy to map logs vs result #1744.

* Make it easier to do build plugins: Expose messageMaker in the context to plugins (so plugins easily can send messages in the queue) #1760. Expose filterRegistry in the context so plugins can register which metrics should be picked up by Graphite/InfluxDb etc #1761. Move core functionality to core folder #1762.

* More to come ...

One other thing around plugins is since we are working on a complete rewrite of the plugin system we also want to allow easier integration with sitespeed and the HTML rendered results for external community plugins! 

If you have any thoughts on what could be improved from 5.x to 6.0 join the discussion and let us know via [#1719](https://github.com/sitespeedio/sitespeed.io/issues/1719)

/Jonathan