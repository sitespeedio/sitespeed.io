---
layout: default
title: Performance Budget
description: Performance budget with sitespeed.io.
keywords: performance, budget, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Performance budget with sitespeed.io.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Performance Budget

# Performance Budget
{:.no_toc}

* Let's place the TOC here
{:toc}

## Performance budget
Have you heard of a performance budget? If not, please go read these excellent posts by Tim Kadlec. Don't worry, we'll be here when you get back. [Setting a performance budget](http://timkadlec.com/2013/01/setting-a-performance-budget/) and [Fast enough](http://timkadlec.com/2014/01/fast-enough/). You should also read Daniel Malls' [How to make a performance budget](http://danielmall.com/articles/how-to-make-a-performance-budget/). Welcome back - let's continue the setup of sitespeed.io performance budgets. :)


### How it works
When you run sitespeed.io configured with a budget, the script will exit with an exit status > 0 if the budget fails. It will log all budget items regardless if they pass or fail and generate a HTML report.

The log will look something like this:

~~~
[2016-10-24 10:53:01] Failing budget pagexray.pageSummary.transferSize for https://www.sitespeed.io/ with value 184.7 KB max limit 97.7 KB
[2016-10-24 10:53:01] Failing budget pagexray.pageSummary.contentTypes.image.transferSize for https://www.sitespeed.io/ with value 157.3 KB max limit 97.7 KB
[2016-10-24 10:53:01] Failing budget coach.pageSummary.advice.info.domElements for https://www.sitespeed.io/ with value 215 max limit 200
[2016-10-24 10:53:01] Failing budget coach.pageSummary.advice.info.domDepth.max for https://www.sitespeed.io/ with value 11 max limit 10
[2016-10-24 10:53:01] Budget: 8 working and 4 failing tests
~~~


The report looks like this.
![Example of the budget]({{site.baseurl}}/img/budget.png)
{: .img-thumbnail}

Now let's see how you configure budgets.


### The budget file
The current version can handle min/max values and works on the internal data structure.


You can read more about the metrics/data structure in the [metrics section]({{site.baseurl}}/documentation/sitespeed.io/metrics/).


~~~
{
  "browsertime.pageSummary": [{
    "metric": "statistics.timings.firstPaint.median",
    "max": 1000
    }, {
    "metric": "statistics.visualMetrics.FirstVisualChange.median",
    "max": 1000
  }],
  "coach.pageSummary": [{
    "metric": "advice.performance.score",
    "min": 75
  }, {
    "metric": "advice.info.domElements",
    "max": 200
  }, {
    "metric": "advice.info.domDepth.max",
    "max": 10
  }, {
    "metric": "advice.info.iframes",
    "max": 0
  }, {
    "metric": "advice.info.pageCookies.max",
    "max": 5
  }],
  "pagexray.pageSummary": [{
    "metric": "transferSize",
    "max": 100000
  }, {
    "metric": "requests",
    "max": 20
  }, {
    "metric": "missingCompression",
    "max": 0
  }, {
    "metric": "contentTypes.css.requests",
    "max": 1
  }, {
    "metric": "contentTypes.image.transferSize",
    "max": 100000
  },{
    "metric": "documentRedirects",
    "max":0
  }]
}

~~~
Then run it like this:

~~~bash
$ docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/ --budget.configPath myBudget.json -b chrome -n 11
~~~

And, if the budget fails, the exit status will be > 0. You can also choose to report the budget as JUnitXML (Jenkins) or TAP.

### JUnit XML
You can output a JUnit XML file from the budget result like this:

~~~bash
$ docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/ --budget.configPath myBudget.json --budget.output junit -b chrome -n 5
~~~

It will create a *junit.xml* in the outputFolder.

### TAP
If you would instead like to use TAP, you can do so like this:

~~~bash
$ docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/ --budget.configPath myBudget.json --budget.output tap -b chrome -n 5
~~~

It will create a *budget.tap* in the outputFolder.
