## Monitor your site 
* * *
<a href="{{site.baseurl}}/documentation/sitespeed.io/performance-dashboard/"><picture><source type="image/webp" srcset="{{site.baseurl}}/img/dashboard-front.webp"><img src="{{site.baseurl}}/img/dashboard-front.png" class="pull-left img-big" alt="Performance dashboard" width="500" height="227" loading="lazy" decoding="async"></picture></a>

Run sitespeed.io on a schedule, ship the metrics to Graphite or InfluxDB, and watch your site's performance in Grafana. We have a [Docker Compose setup](https://github.com/sitespeedio/sitespeed.io/blob/main/docker/docker-compose.yml) that gets you a full stack — sitespeed.io, Graphite, Grafana and a set of [ready-made dashboards](https://github.com/sitespeedio/sitespeed.io/tree/main/docker/grafana/provisioning/dashboards) — running in about five minutes.

There's a live version at [dashboard.sitespeed.io](https://dashboard.sitespeed.io/) if you want to try it before you set up your own. We've been running the dashboards for years and they really do work — read [the documentation]({{site.baseurl}}/documentation/sitespeed.io/performance-dashboard/) for the full guide.
