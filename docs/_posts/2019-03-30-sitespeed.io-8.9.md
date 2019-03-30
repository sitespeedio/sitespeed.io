---
layout: default
title: Sitespeed.io 8.9 - more info for 3rd party scripts
description: Now with better third party request categorisation.
authorimage: /img/aboutus/peter.jpg
intro: 8.9.0 uses the Third party web project to categorise third party requests. 
keywords: sitespeed.io, browsertime, webperf
nav: blog
---

# Sitespeed.io 8.9 - more info for 3rd party scripts

With the new release we integrated [Patrick Hulce](https://github.com/patrickhulce) project [Third party web](https://github.com/patrickhulce/third-party-web). Thanks a lot Patrick for Open Sourcing your project! At the moment we added a new third party tab where you can see the content.

The [Third party web](https://github.com/patrickhulce/third-party-web) project let us categorise requests so you as user can ke now what kind of tools the web page is using.

One thing to remember is that a tool can have multiple categories. For example, it can be both a analytics tool AND a [surveillance](https://en.wikipedia.org/wiki/Surveillance_capitalism) tool.

By default the third party information will be sent to Graphite/InfluxDb and if you are a Graphite user you can upgrade the page summary dashboard to [the latest version](https://github.com/sitespeedio/grafana-bootstrap-docker/blob/master/dashboards/graphite/PageSummary.json) you will get two new graphs.

The first graph shows you third party requests by category. Here can you see how many requests each category generates.

![Third party requests by category]({{site.baseurl}}/img/8.9/thirdparty-requests-grafana.png)
{: .img-thumbnail-center}

The next graph shows how many tools you use by category. This graph will show you things like the your content team adds a new analytics tool to the site. What's really cool is that you can then add alerts in these kind of things.

![Third party tools by category]({{site.baseurl}}/img/8.9/thirdparty-tools-grafana.png)
{: .img-thumbnail-center}

If you then look at the HTML result pages, you can also see the same information per URL.

![Third party in the HTML]({{site.baseurl}}/img/8.9/thirdparty-html.png)
{: .img-thumbnail}

And then also see the exact tools that are used.
![Third party tools]({{site.baseurl}}/img/8.9/thirdparty-tools-html.png)
{: .img-thumbnail}

At the moment we are very liberate on categorising tools as surveillance and need your help to get it right. Do a PR to help us help by changing [https://github.com/sitespeedio/sitespeed.io/blob/master/lib/plugins/thirdparty/index.js#L34-L38](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/plugins/thirdparty/index.js#L34-L38).

The new categorisation happens automatically. But you should still use the `--firstParty` regex to categorise requests since it gives you the flexibility to choose what requests are first/third party.

We also moved the 3rd part information from PageXray to the new tab and hopefully we can add more data there in the future, like download time spent per tool and CPU time. Would love your help there if you are a user and your web site have a lot of third parties.

8.9.0 also contains a couple of bug fixes that you can read about in the [changelog](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md).

/Peter
