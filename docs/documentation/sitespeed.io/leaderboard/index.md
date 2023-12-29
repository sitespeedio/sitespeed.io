---
layout: default
title: Performance Leaderboard
description: Setup up your own web performance leaderboard.
keywords: dashboard, leaderboard, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: The web performance leaderboard.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Performance Leaderboard

# Performance Leaderboard
{:.no_toc}

* Let's place the TOC here
{:toc}

The [leaderboard dashboard](https://dashboard.sitespeed.io/d/000000060/leaderboard) is the easiest way to compare how you are doing against your competition. To get it going you need [Grafana](https://grafana.com) (6.2 or later) and Graphite. If you don't have that already, you can follow the instructions in [performance dashboard documentation](/documentation/sitespeed.io/performance-dashboard/#up-and-running-in-almost-5-minutes). And to run your tests, you should follow [our example](https://github.com/sitespeedio/dashboard.sitespeed.io).

The dashboard list the pages that you test. With fastest/best URL first (yes it is a leaderboard!). It looks like this:
![Leaderboard example]({{site.baseurl}}/img/leaderboard-example.png)
{: .img-thumbnail}

But you really should try out our demo at [dashboard.sitespeed.io](https://dashboard.sitespeed.io/d/000000060/leaderboard)  to really get a feel for it. The dashboard is generic and will work out of the box. But you can also modify it!

The current version compares visual metrics, how the page is built, CPU time spent metrics and how many 3rd parties that is used.

You can (and should) of course edit/change your own version of the dashboard:
* You can configure the red/yellow/green limits for each dashboard
* You can remove/add your own dashboards
* You can make each dashboard larger/smaller depending on how many URLs you wanna test

If you use Chrome to test you URLs you can see things like how many and how long CPU long tasks each page uses:

![CPU Long tasks leaderboard]({{site.baseurl}}/img/long-task-leaderboard.png)
{: .img-thumbnail}


Or you can compare Coach performance and privacy score:

![Score leaderboard]({{site.baseurl}}/img/score-leaderboard.png)
{: .img-thumbnail}


The easiest way is to setup is to create a text file with the URLs you wanna compare and then push the tests under the same Graphite namespace (`--graphite.namespace`). Then you automatically compare all the URLs.  Here's what it looks like for one of our tests:

```
https://www.google.com/
https://www.youtube.com/
https://www.facebook.com/
https://www.baidu.com/
https://en.wikipedia.org/wiki/Main_Page
https://en.wikipedia.org/wiki/Barack_Obama
http://xw.qq.com/
https://world.taobao.com/
https://www.tmall.com/
https://us.yahoo.com/
https://www.amazon.com/
```

And then we just use the namespace **alexaDesktop**. 

And one more thing: you can also combine namespaces and compare multiple tests by using the namespace path: 

![Score leaderboard]({{site.baseurl}}/img/combine-namespaces.png)
{: .img-thumbnail-center}

If you have any problem with dashboard, let us know in a [GitHub issue](https://github.com/sitespeedio/sitespeed.io/issues/new)!
