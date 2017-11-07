## What tool should I use?
* * *

[<img src="{{site.baseurl}}/img/pippi.png" class="pull-left img-big" alt="The power of sitespeed.io" width="180" height="151">](https://dashboard.sitespeed.io)

If you want to measure the performance and are only interested in timing metrics, you should focus on using [Browsertime]({{site.baseurl}}/documentation/browsertime/). If you want it all: use [sitespeed.io]({{site.baseurl}}/documentation/sitespeed.io/). It is the main tool that uses all sitespeed.io tools and add supports for testing multiple pages as well as adds the ability to report the metrics to a TSDB (Graphite and InfluxDB).

If you are a performance tool maker you should look at  [The coach]({{site.baseurl}}/documentation/coach/), [Browsertime]({{site.baseurl}}/documentation/browsertime/), [Chrome-HAR](https://github.com/sitespeedio/chrome-har), [PageXray]({{site.baseurl}}/documentation/pagexray/) and [Throttle]({{site.baseurl}}/documentation/throttle/). They can all help you depending on what you are building.
