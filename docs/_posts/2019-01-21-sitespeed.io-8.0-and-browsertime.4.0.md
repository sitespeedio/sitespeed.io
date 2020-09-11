---
layout: default
title: Sitespeed.io 8.0 and Browsertime 4.0
description: Today we released new sitespeed.io and browsertime with support for testing multiple pages within the same browser session.
authorimage: /img/aboutus/peter.jpg
intro: Finally it is here, the most wanted feature by users ... test multiple pages within the same browser session, scripting the page and choosing yourself when to run your tests.
keywords: sitespeed.io, browsertime, webperf
nav: blog
---

# Sitespeed.io 8.0 and Browsertime 4.0

There are so many new and great thing in this release and we will focus on a couple of new things in this blog post. You can read about the rest of the changes in the [changelog](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md) for Browsertime and the [changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) for sitespeed.io.

Lets talk about:
- [Testing multiple pages within a browser session](#testing-multiple-pages-within-a-browser-session)
- [Testing a single page application](#testing-a-single-page-application)
- [New privacy advice in Coach 3.0](#new-privacy-advice-in-coach-30)
- [New and improved dashboards](#new-and-improved-dashboards)
- [New budget configuration](#new-budget-configuration)
- [Upgrading Browsertime](#upgrading-browsertime)
- [Upgrading sitespeed.io](#upgrading-sitespeedio)
- [What you can do](#what-you-can-do)

## Testing multiple pages within a browser session
<img src="{{site.baseurl}}/img/user-journey.png" class="pull-right img-big" alt="The user journey" width="250">

In versions prior 8.0 you could test one page with the browser cache cleared, you could use a ```--preURL``` to pre warm the browser cache or a script, but you could only test one page at a time. With the new version you can pass on multiple URLs and choose to access them one by one within the same browser session without clearing the cache.

Lets say tou want to test the following user journey: A user first visits the start page [https://www.sitespeed.io](https://www.sitespeed.io) then[https://www.sitespeed.io/documentation/ ](https://www.sitespeed.io/documentation/) and last goes to the [https://www.sitespeed.io/documentation/sitespeed.io](https://www.sitespeed.io/documentation/sitespeed.io/) page.

You can do that now by just adding the ```--multi``` parameter:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --multi https://www.sitespeed.io https://www.sitespeed.io/documentation/ https://www.sitespeed.io/documentation/sitespeed.io/
~~~

If you leave out ```--multi``` each and every URL will be tested by starting a new browser session with the cached cleared between each URL.

With the new scripting capabilities you can do the same with a script:

~~~javascript
module.exports = async function(context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    await commands.measure.start('https://www.sitespeed.io/documentation/');
    return commands.measure.start('https://www.sitespeed.io/documentation/sitespeed.io/');
};
~~~

And run it with 
~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --multi script.js
~~~

The new scripting capabilities adds a couple of commands to make scripting easier ([see the documentation](../documentation/sitespeed.io/scripting/)). And you can still also use raw Selenium if you prefer that.

Let us look at a little more complicated example. We want to measure the actual login page at Wikipedia and then measure the Barack Obama page as a logged in user.


~~~javascript
module.exports = async function(context, commands) {
  // We start by navigating to the login page. 
  await commands.navigate(
    'https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page'
  );
  
  // When we fill in a input field/click on a link we wanna
  // try/catch that if the HTML on the page changes in the feature
  // sitespeed.io will automatically log the error in a user friendly
  // way, and the error will be re-thrown so you can act on it.
  try {
  // Add text into an input field, finding the field by id
  await commands.addText.byId('login', 'wpName1');
  await commands.addText.byId('password', 'wpPassword1');
 
  // Start the measurement before we click on the 
  // submit button. Sitespeed.io will start the video recording
  // and prepare everything.
  await commands.measure.start('login');
  // Find the sumbit button and click it and then wait 
  // for the pageCompleteCheck to finish
  await commands.click.byIdAndWait('wpLoginAttempt');
  // Stop and collect the measurement before the next page we want to measure
  await commands.measure.stop();
  // Measure the Barack Obama page as a logged in user
  return commands.measure.start(
    'https://en.wikipedia.org/wiki/Barack_Obama'
  );
  } catch (e) {
    // We try/catch so we will catch if the the input fields can't be found
    // The error is automatically logged in Browsertime and re-thrown here
  }
};
~~~

You can check out [more examples](../documentation/sitespeed.io/scripting/#examples) in the documentation.

## Testing a single page application

Yeah, you can now test a SPA! When you test a single page application you should add the ```--spa``` parameter so that Browsertime/sitespeed.io knows. That will enable: 
* Automatically handle URLs with #.
* End testing your page load after X seconds of no activity in the Resource Timing API. This makes sure that when you navigate to different pages, the navigation ends when everything finished loading.

Here's an example where we navigate and measure the start page of our Grafana installation, and then measure clicking the link to see the data for the last thirty days. 

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
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} thirtydays.js --spa --multi
~~~

Read the full [documentation](../documentation/sitespeed.io/spa/) for testing your single page application.

## New privacy advice in Coach 3.0
Privacy is [important to us]({{site.baseurl}}/privacy-policy/) and we have had users complaining about the advice not to use Google Analytics: *"Our customer wants a Best Practice score 100 and they cannot get that since they use GA ...."*. 

Well ... by using Google Analytics your customer is revealing information about a your user's behavior to Google. That's not ok. But maybe the **Best Practice** category wasn't the best place for that advice. That's why we created the **Privacy** category with the following advice:

* Always use [HTTPS](https://https.cio.gov/everything/).
* Do not mix HTTPS with HTTP, since every unencrypted HTTP request reveals information about your user’s behavior.
* Use a [Referrer Policy header](https://scotthelme.co.uk/a-new-security-header-referrer-policy/) that allows your site to control how much information the browser includes with navigations away from your page. 
* Use the [HTTP Strict-Transport-Security response header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security) to let the web site tell browsers that it should only be accessed using HTTPS, instead of using HTTP. 
* Avoid including Facebook/Google/AMP/Youtube on your page since you [give away users privacy to large companies](https://2018.ar.al/notes/we-didnt-lose-control-it-was-stolen/).
* Avoid using third party requests since it reveals information about your user's behavior.


The new privacy category is super useful for everyone and specific all our users in the public sector: Please make sure that you do not leak your user's behavior.

## New and improved dashboards

We have updated our dashboards to include new metrics like Privacy score from the Coach and added more default graphs to make it easier to find regression. The [timing metrics dashboard](https://dashboard.sitespeed.io/d/000000044/page-timing-metrics?orgId=1) now includes "Compares to last week" graphs, inspired by [Timo Tijhof](https://twitter.com/timotijhof) work at Wikimedia.

![Compare to last week]({{site.baseurl}}/img/new-dashboard-8.0.jpg)
{: .img-thumbnail}

You can get the [updated dashboards from GitHub](https://github.com/sitespeedio/grafana-bootstrap-docker/tree/main/dashboards/graphite) and check them out at [dashboard.sitespeed.io](https://dashboard.sitespeed.io/d/000000044/page-timing-metrics?orgId=1).

## New budget configuration
One problem before 8.0 was that it was really hard to configure a performance budget: You needed to use the internal data structure and that sucks. Looking at other tools we could see that configuring a budget is usually hard. That's why we are introducing a new way in 8.0 (if you where using the old configuration pre 8.0, don't worry, that will continue to work).

You can configure default values and specific for a URL. In the budget file there are 5 couple of sections:

* timings - are Visual and technical metrics and are configured in milliseconds (ms)
* requests - the max number of requests per type or total
* transferSize - the max transfer size (over the wire) per type or total
* thirdParty - max number of requests or transferSize for third parties
* score - minimum score for Coach advice 


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

[Read the documentation](/documentation/sitespeed.io/performance-budget/) on how to setup your budget file.

## Upgrading Browsertime
There are a couple of breaking changes introduce in 4.0. This only matters if you run Browsertime as a standalone tool (without using sitespeed.io).

1. New structure of the result JSON. In 4.0 we introduce the ability to test multiple pages. That means that instead of returning one result object, we return an array. In 3.x the result looks like this:
~~~json
  {
  "info": {
      "browsertime": {
          "version": "3.0.0"
      }, ...
~~~
  And the new one returns a array, where each tested page is an result in that array.  
 ~~~json
  [{
  "info": {
      "browsertime": {
          "version": "4.0.0"
      }, ...
  }}]
~~~
2. New naming of result files. Before files was named by iteration: 1-video.mp4. In the latest version all extra files are stored in a folder structure and referenced in the JSON, starting with /pages/ (following the same pattern as sitespeed.io).
3. New layout of Selenium scripting. We simplified the layout of the script. The new version will be able to do the exact same thing as older versions but with a simpler layout:

~~~javascript
  module.exports = async function(context, commands) {
  // code
  }
~~~

Pre/post scripts also follows the new script format.

## Upgrading sitespeed.io

Upgrading should be pretty straight forward and work out of the box. If you used pre/post scripts, you need to upgrade them to the new signature:

~~~javascript
  module.exports = async function(context, commands) {
  // code
  }
~~~

And read the [new documentation about scripting](/documentation/sitespeed.io/scripting/).

## What you can do.
Sitespeed.io 8.0 and Browsertime 4.0 is a major major change. We need your help to try it out and please create [issues](https://github.com/sitespeedio/sitespeed.io/issues/new) when you find something that seems wrong.

/Peter