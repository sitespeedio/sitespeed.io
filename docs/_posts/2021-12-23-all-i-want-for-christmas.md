---
layout: default
title: All I want for Christmas is ...
description: sitespeed.io wishlist for Christmas.
authorimage: /img/aboutus/peter.jpg
intro: Here's my wish list on how we all can make sitespeed.io better.
keywords: sitespeed.io, webperf
image: https://www.sitespeed.io/img/santa.png
nav: blog
---

# All I want for Christmas is ...

<img src="{{site.baseurl}}/img/santa.png" class="pull-right img-big" alt="sitespeed.io wish you a Merry Christmas!" width="200" height="236">

Here's a wish list what I want for Christmas for the sitespeed.io project. There's a couple of things that you or your company can do to make sitespeed.io better! And that's what I want for Christmas :)

## ... help from you!
What really helps out is that if you find a bug or a potential bug, please follow the instructions [on how to create a reproducible issue](https://www.sitespeed.io/documentation/sitespeed.io/bug-report/#explain-how-to-reproduce-your-issue). That helps so much! If I can easily reproduce the bug, I can spend time on fixing them instead of spending hours trying to reproduce them.

## ... help from your company!
If you work for a company that uses sitepeed.io, please make sure the company support sitespeed.io financially using [https://opencollective.com/sitespeedio/contribute](https://opencollective.com/sitespeedio/contribute)!

Let me explain why: Keeping sitespeed.io running cost money. To be able to catch bugs and regression before we do a new release we have two servers running to get the metrics for [dashboard.sitespeed.io](https://dashboard.sitespeed.io/d/9NDMzFfMk/page-metrics-desktop). At the moment the cost for that is $1700 per year.

Today we only have two monthly donors to the project: one secret contributor and [Jesse Heady](https://twitter.com/jheady). Many many thanks to both of them. But we need more.

In the long run we want to have more servers for testing and also have automatic tests for our mobile phone setup. A couple of years ago I asked one of the companies that host mobile phones what we need to pay for five hosted phones. The price at that time was $22500 per year. That is pretty much money for an Open Source project :( 

## ... help from the Chrome team!

There's a couple of open issues with Chrome that would make our work with sitespeed.io easier.

* Make a stand-alone library for consuming the Chrome trace log so tools that are not Lighthouse can use it. There where some work a couple of years ago in [Tracium](https://github.com/aslushnikov/tracium) that was promising but then the code [was moved back to Lighthouse](https://github.com/aslushnikov/tracium/issues/2). We actually use a modified version of Tracium but it would be great if we could use a Chrome team blessed version. I think no one is better to build that then the Chrome team, they have the best knowledge.

* Make it easier to automate to get a HAR file from Chrome. Today we use [https://github.com/sitespeedio/chrome-har](https://github.com/sitespeedio/chrome-har) that my friend Tobias built a couple of years ago but I strongly believe that is something the Chrome team should and could provide. There's [a open issue #1276896](https://bugs.chromium.org/p/chromium/issues/detail?id=1276896) for fixing that.

## ... help from the Firefox team!

Its been super helpful when Mozilla started to use Browsertime for internal testing and the Mozilla performance team have contributed with so many new functionalities to Browsertime. However I still have one thing in my wish list:

* Make it easier to get a HAR file from Firefox! Today you need to have an extension installed in Firefox and that do not work on mobile (since the extension needs to have devtools open). That means we can only get a HAR file on desktop. The current solution also adds some extra performance overhead. The tracking bug for fixing that is [#1744483](https://bugzilla.mozilla.org/show_bug.cgi?id=1744483).

## ... some love from the Safari team!

There's a couple of things I wish for Safari:

* Make it easy to automate to get a HAR file from Safari. I have an open Feedback Assistant issue with id FB8981653 for that.

* Make it easy to record a video of the screen of iOS from your Mac so we can automate recording a video. Today we use (or try to use) the [QuickTime video hack](https://github.com/danielpaulus/quicktime_video_hack), and it would be great if iOS/Mac OS natively supported it. It would make it so much easier to get visual metrics from iOS Safari.

* It would be great if the Apple/Safari team could do a blog post about how they do performance testing. I'm thinking maybe you have some tools that aren't know to the public? Or how do you currently run performance tests?

## ... and more love from GitLab
I love that GitLab has used sitespeed.io since 2017 as [their premium browser performance testing tool](https://docs.gitlab.com/ee/user/project/merge_requests/browser_performance_testing.html). I think though that the project lack some documentation since sometimes GitLab users ends up on the sitespeed.io Slack channel asking GitLab specific questions. As a user feel free to ask and I will answer as good as I can, but I think it would be beneficial for everyone with more documentation on the GitLab side.

Also since GitLab is a company valued over $11 billions I would really like to see you being one of the leaders of [contributing to sitespeed.io](https://opencollective.com/sitespeedio/contribute) :D Or maybe you are that secret contributor giving $20 each month? ;)

## ... that you all stay safe and have happy holidays!

/Peter