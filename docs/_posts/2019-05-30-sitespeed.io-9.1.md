---
layout: default
title: sitespeed.io 9.1 - performance leaderboard
description: 
authorimage: /img/aboutus/peter.jpg
intro: Do you want to compare your performance against other web sites? Use the new performance leaderboard! 
keywords: sitespeed.io, browsertime, webperf
nav: blog
---

# sitespeed.io 9.1 - Performance leaderboard

Grafana is the Open Source tool that just continues to give! In 6.2 there's a new panel type that we used to create the new [performance leaderboard](https://dashboard.sitespeed.io/d/000000060/leaderboard). I'm pretty sure this is the best and most appealing way to compare performance between different pages.

Within the 9.1 release we have re-worked the dashboards and added the new leaderboard dashboard. It looks like this:
![Leaderboard example]({{site.baseurl}}/img/leaderboard-example.png)
{: .img-thumbnail}
 
It helps communicate performance within you organisation. You can (and should) of course edit/change your own version of the dashboard:
* You can configure the red/yellow/green limits for each dashboard
* You can remove/add your own dashboards
* You can make each dashboard larger/smaller depending on how many URLs you wanna test

If you use Chrome to test you URLs you can see things like how many and how long CPU long tasks each page uses:

![CPU Long tasks leaderboard]({{site.baseurl}}/img/long-task-leaderboard.png)
{: .img-thumbnail}


Or you can compare Coach performance and privacy score:

![Score leaderboard]({{site.baseurl}}/img/score-leaderboard.png)
{: .img-thumbnail}

You can read more about the new leaderboard in the [documentation](/documentation/sitespeed.io/leaderboard/).

We have some more changes and some bug fixes that you can read about in the [changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md).

/Peter
