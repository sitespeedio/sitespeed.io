---
layout: default
title: Scripting part 2
description: Now with better third party request categorisation.
authorimage: /img/aboutus/peter.jpg
intro: 8.9.0 uses the Third party web project to categorise third party requests. 
keywords: sitespeed.io, browsertime, webperf
nav: blog
---

# Scripting part 2
When we released 8.0 we pushed the most wanted feature: scripting that makes it possible to test multiple pages in a user journey. Since the release we pushed many small additions and I wanted to go through a couple of them.

## Better error handling

The first release didn't have any fancy error handling, but now it works better.

Let me go through a couple of scenarios: You test three URLs and one of them fails.

~~~javascript
module.exports = async function(context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  // The coming URL will fails!
  await commands.measure.start('https://failing.url/');
  // And the documentation URL will not be tested
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
~~~



You can try/catch failing navigations. The script will continue and the failing URL will be a failure in the HTML.

~~~javascript
module.exports = async function(context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  try {
    await commands.measure.start('https://apa/');
  } catch (e) {}
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
~~~

You can also create your own errors. The error will be added to the error array and will be reported in the HTML and sent to Graphite/InfluxDB.

~~~javascript
module.exports = async function(context, commands) {
  // something fails
  commands.error('The login form is removed from the login page!');
};
~~~


## Cache

There's an experimental command for clearing the cache. The command works both for Chrome and Firefox on desktop but not on Chrome on Android since we are using a [WebExtension](https://github.com/sitespeedio/browsertime-extension).

#### cache.clear()
Clear the browser cache. Remove cache and cookies.

#### cache.clearKeepCookies()
Clear the browser cache but keep cookies.

## Meta data

Add meta data to your script. The extra data will be visibile in the HTML result page.

Setting meta data like this:

~~~javascript
module.exports = async function(context, commands) {
  commands.meta.setTitle('Test Grafana SPA');
  commands.meta.setDescription('Test the first page, click the timepicker and then choose <b>Last 30 days</b> and measure that page.');	
  await commands.measure.start(
    'https://dashboard.sitespeed.io/d/000000044/page-timing-metrics?orgId=1','pageTimingMetricsDefault'
  );
  await commands.click.byClassName('gf-timepicker-nav-btn');
  await commands.wait.byTime(1000);
  await commands.measure.start('pageTimingMetrics30Days');
  await commands.click.byLinkTextAndWait('Last 30 days');
  await commands.measure.stop();
};
~~~

Will result in:

![Title and description for a script]({{site.baseurl}}/img/titleanddesc.png)
{: .img-thumbnail}


## Chrome DevTools Protocol 

Send messages to Chrome using the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/). This only works in Chrome. You can send and send and get the result.

#### cdp.send(command, args)
Send a command to Chrome and don't expect something back.

Here's an example of injecting JavaScript that runs on every new document.

~~~javascript
module.exports = async function(context, commands) {
  await commands.cdp.send('Page.addScriptToEvaluateOnNewDocument',{source: 'console.log("hello");'});
  await commands.measure.start('https://www.sitespeed.io');
}
~~~

#### cdp.sendAndGet(command, args)
Send a command to Chrome and get the result back. 

~~~javascript
module.exports = async function(context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  const domCounters = await commands.cdp.sendAndGet('Memory.getDOMCounters');
  context.log.info('Memory.getDOMCounters %j', domCounters);
 }
~~~

/Peter
