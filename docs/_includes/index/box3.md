## What tool should I use?
* * *

<a href="https://dashboard.sitespeed.io"><picture><source type="image/webp" srcset="{{site.baseurl}}/img/pippi.webp"><img src="{{site.baseurl}}/img/pippi.png" class="pull-left img-big" alt="The power of sitespeed.io - Pippi Longstocking logo" width="180" height="151" loading="lazy" decoding="async"></picture></a>

If you're testing a single page or a user journey and you want a full report, use [sitespeed.io]({{site.baseurl}}/documentation/sitespeed.io/). It's the main tool — it pulls in everything else, supports scripting, and ships metrics to Graphite or InfluxDB so you can monitor your site over time.

If you only need timing metrics from a browser, [Browsertime]({{site.baseurl}}/documentation/browsertime/) is the lower-level tool that powers sitespeed.io's measurement.

If you're building your own performance tooling, [the Coach]({{site.baseurl}}/documentation/coach/), [PageXray]({{site.baseurl}}/documentation/pagexray/), [Chrome-HAR](https://github.com/sitespeedio/chrome-har) and [Throttle]({{site.baseurl}}/documentation/throttle/) are all standalone packages you can pull in directly.
