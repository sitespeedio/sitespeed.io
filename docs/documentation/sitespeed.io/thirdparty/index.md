---
layout: default
title: Track third party scripts
description: Measure those third party scripts!
keywords: third party, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Measure those third party scripts!
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Third party

# Third parties
{:.no_toc}

* Lets place the TOC here
{:toc}


## Categorise third parties
There are two ways two categorise first/third parties. If you use  `--firstParty ` all requests will be categorised as either first/third party and you can see % of them. This is the old implementation and we also have a newer one where we use the [Third party web](https://github.com/patrickhulce/third-party-web) project to categorise requests so you as user know what kind of tools the web page is using.


One thing to remember is that a tool can have multiple categories. For example, it can be both a analytics tool AND a [surveillance](https://en.wikipedia.org/wiki/Surveillance_capitalism) tool.

By default the third party information will be sent to Graphite/InfluxDb and if you are a Graphite user you can upgrade the page summary dashboard to [the latest version](https://github.com/sitespeedio/grafana-bootstrap-docker/blob/master/dashboards/graphite/PageSummary.json). You will then get two new graphs.

The first graph shows you third party requests by category. Here can you see how many requests each category generates.

![Third party requests by category]({{site.baseurl}}/img/8.9/thirdparty-requests-grafana.png)
{: .img-thumbnail-center}

The next graph shows how many tools the page use by category. This graph will will help you see when your content team adds a new analytics tool to the site (but they promised they wouldn't!). What's really cool is that you can add alerts to these metrics too, as to all metrics from sitespeed.io.

![Third party tools by category]({{site.baseurl}}/img/8.9/thirdparty-tools-grafana.png)
{: .img-thumbnail-center}

If you look at the HTML result pages, you can also see the same information per URL.

![Third party in the HTML]({{site.baseurl}}/img/8.9/thirdparty-html.png)
{: .img-thumbnail}

And then also see the exact tools that are used.
![Third party tools]({{site.baseurl}}/img/8.9/thirdparty-tools-html.png)
{: .img-thumbnail}

At the moment we are very liberate on categorising tools as surveillance and need your help to get it right. Do a PR to help us help by changing [https://github.com/sitespeedio/sitespeed.io/blob/master/lib/plugins/thirdparty/index.js#L34-L38](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/plugins/thirdparty/index.js#L34-L38).

The new categorisation happens automatically.


## Requests per page
There's a lot of discussion blaming 3rd parties for performance and it's now easier for you track them. However you need to remember that third parties is also used to share private data of what your user is doing to other companies. Remember that **privacy** is important for your users. That's why made it easy to see how many third party request each page do:

![Third party requests per page]({{site.baseurl}}/img/thirdpartyrequests-pages.png)
{: .img-thumbnail}
<p class="image-info">
 <em class="small center">It's easy to see the amount of third party requests.</em>
</p>

## CPU spent per tool/third party
You can also track CPU spent per tool/third party. It's turned off by default and enable it with `--thirdParty.cpu` when you use Chrome. Then you can have a graph like this:

![CPU spent per tool]({{site.baseurl}}/img/cpu-per-tool.png)
{: .img-thumbnail}

## Block all 3rd parties

We have support to block specific third parties with `--block` but that isn't the most user friendly way if you wanna test you site without third parties. We added support for blocking every domain except the one you configure (inspired by [WebPageTest](https://www.webpagetest.org)). 
Use `--chrome.blockDomainsExcept` to block all domains except. Use it multiple times to keep multiple domains. You can also use wildcard like *.sitespeed.io!