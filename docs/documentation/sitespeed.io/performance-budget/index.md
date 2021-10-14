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
When you run sitespeed.io configured with a budget, the script will exit with an **exit status > 0** if the budget fails. Else the exit code is 0. It will log all budget items regardless if they pass or fail and generate a HTML report.

The log will look something like this:

~~~shell
[2019-01-20 19:58:18] ERROR: Failing budget timings.firstPaint for https://www.sitespeed.io/documentation/ with value 462 ms max limit 100 ms
[2019-01-20 19:58:18] ERROR: Failing budget size.total for https://www.sitespeed.io/documentation/ with value 23.6 KB max limit 1000 B
[2019-01-20 19:58:18] INFO: Budget: 3 working and 2 failing tests
~~~


The report looks like this.
![Example of the budget]({{site.baseurl}}/img/budget.png)
{: .img-thumbnail}

Timing metrics (like first visual change) uses the median metric of all runs. So if you wanna have more stable metrics, increase the number of iterations/runs that you test one URL.

### The budget file
In 8.0 we introduced a new way of configuring budget. You can configure default values and specific for a URL. In the budget file there are 5 couple of sections:

* timings - are Visual and technical metrics and are configured in milliseconds (ms)
* requests - the max number of requests per type or total
* transferSize - the max transfer size (over the wire) per type or total
* thirdParty - max number of requests or transferSize for third parties
* score - minimum score for Coach advice


#### Simple budget file
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

#### Override per URL or alias
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

If you use alias for URLs, you can use that instead:

~~~json
{
 "budget": {
   "myAlias": {
      "timings": {
        "SpeedIndex": 3000
      }
    },
    "timings": {
      "SpeedIndex":1000
    }
 }

#### User Timing API metrics
You can use User Timing API metrics in your budget. Both marks and measurements will be picked up under the name *usertimings*. Sitespeed.io will first look for a mark with that name, and if that do not exist it will look for a measurement.

~~~json
{
    "budget": {
       "usertimings": {
         "headerLogo":1000
       }
    }
}
~~~

#### Metrics from scripting
You can use [metrics from your scripts](https://www.sitespeed.io/documentation/sitespeed.io/scripting/#measureaddname-value) in your budget.

~~~json
{
    "budget": {
       "scriptingmetrics": {
         "myOwnMetric": 20
       }
    }
}
~~~

#### Full example

Here is an example of a fully configured budget file.

~~~json
{
"budget": {
    "timings": {
      "firstPaint": 1000,
      "pageLoadTime": 2000,
      "fullyLoaded": 2000,
      "FirstVisualChange": 1000,
      "LastVisualChange": 1200,
      "SpeedIndex": 1200,
      "PerceptualSpeedIndex":1200,
      "VisualReadiness": 200,
      "VisualComplete95": 1190
    },
    "requests": {
      "total": 89,
      "html": 1,
      "javascript": 0,
      "css": 1,
      "image": 50,
      "font": 0,
      "httpErrors" : 0
    },
    "transferSize": {
      "total": 400000,
      "html": 20000,
      "javascript": 0,
      "css": 10000,
      "image": 200000,
      "font": 0
    },
    "thirdParty": {
      "transferSize": 0,
      "requests": 0
    },
    "score": {
      "bestpractice": 100,
      "privacy": 100,
      "performance": 100
    }
  }
}
~~~

If you use WebPageTest you can configure:

~~~json
{
"budget": {
  "webpagetest": {
      "SpeedIndex": 1000,
      "lastVisualChange": 2000,
      "render": 800,
      "visualComplete": 2000,
      "visualComplete95": 2000,
      "TTFB": 150,
      "fullyLoaded": 3000
    }
  }
}
~~~

If you use Lighthouse you can configure:

~~~json
{
"budget": {
  "lighthouse": {
      "performance": 90,
      "accessibility": 90,
      "best-practices": 90,
      "seo": 90,
      "pwa": 90
    }
  }
}
~~~

If you use GPSI you can configure:

~~~json
{
"budget": {
  "gpsi": {
      "speedscore": 90
    }
  }
}
~~~

And then you can always combine them all.

If you need more metrics for your budget, either [create an issue](https://github.com/sitespeedio/sitespeed.io/issues/new) or look below for using the full internal data structure.

#### All possible metrics you can configure

Here's a list of all static metrics you can configure. Remember that you can also use your own metric, either from the [User Timing API (marks/measures)](https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API) or [metrics from scripting](https://www.sitespeed.io/documentation/sitespeed.io/scripting/#measureaddname-value).

~~~json
{% include_relative friendlynames.md %}
~~~

#### Budget configuration using the internal data structure
There's also an old version of setting a budget where you can do it for all metrics collected by sitespeed.io and works on the internal data structure.


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
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --budget.configPath myBudget.json -b chrome -n 11
~~~

And, if the budget fails, the exit status will be > 0. You can also choose to report the budget as JUnitXML (Jenkins) or TAP.

### JUnit XML
You can output a JUnit XML file from the budget result like this:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --budget.configPath myBudget.json --budget.output junit -b chrome -n 5
~~~

It will create a *junit.xml* in the outputFolder.

### TAP
If you would instead like to use TAP, you can do so like this:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --budget.configPath myBudget.json --budget.output tap -b chrome -n 5
~~~

It will create a *budget.tap* in the outputFolder.

### JSON
You can output the result of the budget as JSON:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --budget.configPath myBudget.json --budget.output json -b chrome -n 5
~~~

It will create a *budgetResult.json* in the outputFolder.

### Remove working/passing result
There's a feature where you can configure sitespeed.io to remove data (the result HTML/videos/screenshots) for all pages that passes your budget. This is useful if you crawl your site and only want to keep the result of the pages that fails, to save space. Use ```--budget.removeWorkingResult``` to remove data for pages that works.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --budget.configPath myBudget.json --budget.removeWorkingResult -b chrome -n 5
~~~
