---
layout: startpage
title: Sitespeed.io - Analyze your website speed and performance
description: Sitespeed.io is an open source tool that helps you analyze and optimize your website speed and performance, based on performance best practices. Run it locally or use it in your continuous integration. Download or fork it on Github!
author: Peter Hedenskog
keywords: sitespeed.io, wpo, webperf, perfmatters, fast, site, speed, web performance optimization, analyze, best practices, continous integration
nav: start
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
---
<img src="{{site.baseurl}}/img/sitespeed.io-logo-large2.png" class="pull-left img-big" alt="Sitespeed.io logo" width="188" height="200" onLoad="window.performance.mark('logoTime');">

## Analyze your website speed and performance

Sitespeed.io is an open source tool ([Apache License Version 2.0](https://github.com/sitespeedio/sitespeed.io/blob/master/LICENSE)) that helps you analyze your website **speed** and **performance** based on **performance best practices** and **timing metrics**. It collects data from multiple pages on your website, analyze them using the [rules](/documentation/rules-and-best-practices/) and output the result as HTML or send the metrics to [Graphite](/documentation/graphs/).

You can analyze one site, analyze and compare multiple sites or let your continuous integration server break your build when your performance budget is exceeded.

Install using [npm](https://www.npmjs.org/) ([need help?](/documentation/installation/)):

~~~ bash
$ npm install -g sitespeed.io
$ sitespeed.io -h
~~~

You can clone or fork the project at [![Github]({{site.baseurl}}/img/GitHub-Mark-64px.png){: .middle}](https://github.com/sitespeedio/sitespeed.io/issues) and if you like sitespeed.io, please give us a [![Give us a star]({{site.baseurl}}/img/star3.png){: .middle}](https://github.com/sitespeedio/sitespeed.io/stargazers)!
