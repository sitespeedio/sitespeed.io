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

~~~shell
[2019-01-20 19:58:18] ERROR: Failing budget timings.firstPaint for https://www.sitespeed.io/documentation/ with value 462 ms max limit 100 ms
[2019-01-20 19:58:18] ERROR: Failing budget size.total for https://www.sitespeed.io/documentation/ with value 23.6 KB max limit 1000 B
[2019-01-20 19:58:18] INFO: Budget: 3 working and 2 failing tests
~~~


The report looks like this.
![Example of the budget]({{site.baseurl}}/img/budget.png)
{: .img-thumbnail}

### The budget file
In 8.0 we introduced a new way of configuring budget. You can configure default values and specific for a URL.


#### Simple budget file"
The simplest version of a budget file that will check for SpeedIndex higher than 1000 ms looks like this:

~~~json
{
 "budget": {
    "timings": {
      "SpeedIndex":1000
    }
 }
}
~~~

#### Override per URL
All URLs that you test then needs to have a SpeedIndex faster than 1000. But if you have one URL that you know are slower? You can override budget per URL. 

~~~json
{
 "budget": {
   "https://www.sitespeed.io/documentation/": {
      "timings": {
        "SpeedIndex": 3000
      }
    },
    "timings": {
      "SpeedIndex":1000
    }
 }
}
~~~

#### Full budget file
~~~json
{
 "budget": {
    "timings": {
      "firstPaint": 1000,
      "fullyLoaded": 5500,
      "FirstVisualChange": 1000,
      "LastVisualChange": 1200,
      "SpeedIndex": 1500,
      "PerceptualSpeedIndex":
        1500
    },
    "size": {
      "total": 1000000
    },
    "requests": {
      "total": 125
    },
     "thirdParty": {
      "size": 10000,
      "requests": 1
    },
    "score": {
      "privacy": 100,
      "performance": 100
    }
 }
}
~~~

#### The old budget file
The current version can handle min/max values and works on the internal data structure.


You can read more about the metrics/data structure in the [metrics section]({{site.baseurl}}/documentation/sitespeed.io/metrics/).


~~~json
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
docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --budget.configPath myBudget.json -b chrome -n 11
~~~

And, if the budget fails, the exit status will be > 0. You can also choose to report the budget as JUnitXML (Jenkins) or TAP.

### JUnit XML
You can output a JUnit XML file from the budget result like this:

~~~bash
docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --budget.configPath myBudget.json --budget.output junit -b chrome -n 5
~~~

It will create a *junit.xml* in the outputFolder.

### TAP
If you would instead like to use TAP, you can do so like this:

~~~bash
docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --budget.configPath myBudget.json --budget.output tap -b chrome -n 5
~~~

It will create a *budget.tap* in the outputFolder.
