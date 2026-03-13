---
layout: default
title: Build a sustainable web
description: Use the sustainable plugin to measure and keep track of your carbon cost.
keywords: sustainable, web, carbon, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sustainable-web.jpg
twitterdescription: Build a sustainable web using the sustainable plugin.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Sustainable web plugin

# Sustainable web plugin
{:.no_toc}

<img src="{{site.baseurl}}/img/sustainable-web.jpg" class="pull-right img-big" alt="Sustainable web logo" width="176" height="269">

We know using the internet means using electricity to power servers. And because most of that electricity comes from burning fossil fuels, it means every byte sent has a cost in carbon as well as power. The sustainable web plugin combines the latest in peer reviewed science and open data from the [Green Web Foundation](https://www.thegreenwebfoundation.org) to help you build greener, more sustainable websites and applications!

We work out how much energy it takes to serve a site, then work out how much CO2 is emitted to generate the power needed that electricity, based on what information we have about where the power comes from. 

[Chris Adams](https://twitter.com/mrchrisadams) has written down [more details](/documentation/sitespeed.io/sustainable/#the-slightly-longer-version) how we do the calculations.

* Lets place the TOC here
{:toc}

### How to use it

Enable the plugin by adding `--sustainable.enable`:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --sustainable.enable
~~~

### The result

All data is produced under the new tab called  *Sustainable Web*.

![Sustainable web tab]({{site.baseurl}}/img/sustainable-tab.png){:loading="lazy"}
{: .img-thumbnail}

The plugin will use the transfer size of every asset and the domain (to know if the server run on green energy) and estimate the total amount of carbon emission for one page view.

First you will see the amount of estimated carbon emission for one page view.

![Estimated carbon emission per page view]({{site.baseurl}}/img/estimated-carbon.png){:loading="lazy"}
{: .img-thumbnail}

But you can also add `--sustainable.pageViews` to your run and you will get the estimated carbon for that amount of page views. If you run it with  `--sustainable.pageViews 100000` you will get something like this:

![Total carbon emission]({{site.baseurl}}/img/total-page-views-carbon.png){:loading="lazy"}
{: .img-thumbnail}

Both the amount per page view and the total among will be automatically sent to Graphite/InfluxDB.

We also categorise content per first/third party (with the `--firstParty` switch). You can see that for the site in this example the estimated carbon emission from third parties are over 79% of the total emission :(

The next cut is per domain.

![Carbon per domain]({{site.baseurl}}/img/carbon-per-domain.png){:loading="lazy"}
{: .img-thumbnail}

The green sign that says *green* means that that domain is marked as running on green energy in the Green Web Foundation database.

We also produce a list of the top ten dirtiest assets on the page. The ones that produces most carbon emission.

![Carbon per asset]({{site.baseurl}}/img/carbon-per-asset.png){:loading="lazy"}
{: .img-thumbnail}

Here we have one JavaScript bundle that produces 39% of the total emission for that page. I wonder what kind of cool  functionality they have on the page? :)

We also slice and dice the data per content type. This is interesting because it can help you take environment friendly decisions. For example for this website, having a specific font stands for over 50% of the estimated carbon emission for that page.

![Carbon per content type]({{site.baseurl}}/img/carbon-content-type.png){:loading="lazy"}
{: .img-thumbnail}

### Extra configuration

By default the hosting data (knowing if a host is green) is collected from a local SQLite database included in sitespeed.io. You can use the Green Foundations API directly for the latest and fresh data using `--sustainable.useGreenWebHostingAPI`. That will generate a GET request to the API though.

You can also disable the hosting match (all hosts will be treated as grey hosting) with `--sustainable.disableHosting`.

### Country-based electricity data

You can optionally specify a country code to calculate carbon emissions using a specific electricity grid mix (via electricitymaps):
example:-
```bash
sitespeed.io https://example.com \
  --plugins.add sustainable \
  --sustainable.countryCode IN
```

## How it works

### Short version 

We work out how much energy it takes to serve a site, then work out how much CO2 is emitted to generate the power needed that electricity, based on what information we have about where the power comes from.

### The slightly longer version

#### First, work out the energy needed
We work out how much energy it takes to serve a site, based on the 1byte model published by The Shift project in their report [Lean ICT: for a sober digital](https://theshiftproject.org/en/lean-ict-2/).

This in turn draws numbers from the paper [Projecting the chiaroscuro of the electricity use of communication and computing from 2018 to 2030](https://www.researchgate.net/publication/331047520_Projecting_the_chiaroscuro_of_the_electricity_use_of_communication_and_computing_from_2018_to_2030). This is the most recent peer reviewed number we could find providing in format offering a breakdown of energy use broken down by data centre, data transfer and device usage. When we find a more recent up-to-date model, offering a similar breakdown we will update the plugin to use it.

While the 1byte model also includes the energy usage for the production and use of devices, device we do not include this in our calculations. We do this for a number of reasons:

The first is that devices use power differently viewing a website or application compared when continuously downloading video for viewing. This is acknowledged in The Shift Project's own report.

The second is that the sitespeed.io plugin is intended to help people realise that performance budgets can also be carbon budgets, and they can make measurable steps to improve the climate impact of digital services, through changes in how they are made.

Third, the majority of the carbon emissions from a device come from the actual production of a smartphone or laptop, not the use. While thoughtful design choices can make it possible to run applications and websites on older hardware, it's much more difficult to measure how these changes in design affect the climate impact without collecting further information about the end user's devices. This is possible with analytics tools like Matomo, but this goes beyond the scope of this plugin.

#### Estimating carbon for this energy

Once we have the estimated energy usage needed to serve a site, we then need to work out the emissions from this energy one for conventional, 'grey' power, and one for renewable green power.

Larger data centres have historically been cited close to sources of cheap power, available around the clock, which would usually come from fossil fuels previously. This often results in an [energy mix tends to be dirtier than average](https://the-beam.com/energy/how-weve-made-the-web-dirty/), so we use the Shift Project's figure of 519 grams of CO2 per kilowatt hour.

For the rest of the internet, we use the [International Energy Agency's](https://hyp.is/MPRiUlTMEeq13bM-WjChjQ/www.iea.org/reports/global-energy-co2-status-report-2019/emissions) figure from of 475g of CO2 per kilowatt hour for for 2018, as an average across the globe.

Where we know power is generated using renewables we use the figure from the UK's regulator Ofgem, for renewables including solar, wind and hydroelectricity, of 33.4 grammes of CO2 per kilowatt hour. To tell how a site is powered, we look up the domain with the Green Web Foundation's - either via the their API, or when available, using their publicly available [url2green](https://www.thegreenwebfoundation.org/green-web-datasets/) dataset.