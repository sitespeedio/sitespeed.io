---
layout: default
title: Test a single page application - SPA
description: Instructions on how to use scripting to test your Single Page Application.
keywords: selenium, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Test a single page application - SPA
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Single page applicatiom

# Test a single page application
{:.no_toc}

* Lets place the TOC here
{:toc}

# Test by scripting
To test a single page application you probably want to measure more pages than the first page (that loads the framework). Add you do that by using the Browsertime command/scripting. Either you use our commands or Selenium scri pts.

When you test a single page application you should add the ```--spa``` parameter to your test pages, so that Browsertime/sitespeed.io knows. That will enable: 
* Automatically handle URLs with #.
* End testing your page load after X seconds of no activity in the Resource Timing API. This makes sure that when you navigate to different pages, the navigation ends when everything finished loading.


## Metrics
Using a single page application make it harder to measure how fast a page load since since the navigation timing API will not work. Instead you can use the User Toming API and pick up visual metrics and metrics from the CPU.

### Navigation timing metrics
The navigation timing metrics are only useful for the first page that you test. The following pages in your SPA will not populate new navigation timing metrics.

### Visual Metrics
Visual Metrics will work fine but depending on how you navigate *First Visual Change* can be when you click your link, so focus on *Last Visual Change* instead.

### User Timing
You need to instrument your code yourself or use a framework that do that automatically. [Read how LinkedIn](https://engineering.linkedin.com/blog/2017/02/measuring-and-optimizing-performance-of-single-page-applications) use User Timings to measure their SPA.

### CPU metrics
If you run your tests with Chrome and enables  ```--chrome.timeline``` you will also get metrics where Chrome spends it times rendering and executing JavaScript.

## Example: Performance test Grafana
In this example we navigate and measure the start page of our Grafana installation, and then measure clicking the link to see the data for the last thirty days. 

Lets create a script file and call it *thirtydays.js*.

~~~javascript
module.exports = async function(context, commands) {
 await commands.measure.start('https://dashboard.sitespeed.io/d/000000044/page-timing-metrics?orgId=1');
 try {
 await commands.click.byClassName('gf-timepicker-nav-btn');
 await commands.wait.byTime(1000);
 // We give the paghe an alias that will be used if the metrics is sent to Graphite/InfluxDB 
 await commands.measure.start('pageTimingMetricsLast30Days');
 await commands.click.byLinkTextAndWait('Last 30 days');
 await commands.measure.stop();
 } catch (e) {
     // If the GUI change and a link is not there,
     // the click commands will throw an error. 
     // sitespeed.io will catch, log and rethrow 
     // and you can choose if you want to have a different
     // user flow
 }
};
~~~

And then you run it by passing on the script file, using  ```--spa``` to notify that you are testing a single page application and ```--multi``` that you test multiple pages withing one run. 

~~~bash
docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} thirtydays.js --spa --multi
~~~

