---
layout: default
title: Measure
description: Measure — sitespeed.io scripting tutorial.
keywords: scripting, tutorial, sitespeed.io, browsertime
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Measure

# Measure
{:.no_toc}

{:toc}

In sitespeed.io, measurements can be made using the `measure` command for page navigation performance, which gathers various metrics during page load. Alternatively, the `stopWatch` command measures arbitrary durations, such as the time taken for certain actions to complete. When you create your script you need to know what you want to measure.


## The `measure` Command

In web performance, *"navigation"* means switching from one webpage to another. This switch triggers several steps in your browser, like closing the current page, loading new content, and showing the new page fully loaded. In sitespeed.io, the commands.measure function is used to analyze this process. It tracks various performance details from the moment you start moving to a new page until it's completely loaded. This includes how long the page takes to load, how fast resources (like images and scripts) are loaded, and more, giving you a full picture of the navigation's performance.

Use the `measure` command for measuring page navigation performance. It captures metrics from the start to the end of a page load.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  return commands.measure.start('https://www.sitespeed.io');
}
```

If you use the measure command without a URL, it sets everything up and starts recording a video, but it doesn't navigate to a new page automatically. You need to manually navigate to a page, click a link, or submit a form. Remember to stop the measurement when you're done, so Browsertime/sitespeed.io can gather and report the performance data.

For example, to measure how long it takes to go from the sitespeed.io homepage to its documentation page, you would start by navigating to the sitespeed.io homepage. Then, you manually click on the link to the documentation page. Once you're on the documentation page, you stop the measurement to capture the performance metrics of this navigation.


```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  
  await commands.navigate('https://www.sitespeed.io');

  await commands.measure.start('Documentation');
  await commands.click('link:Documentation', { waitForNavigation: true });
  return commands.measure.stop();
}
```

### Click and measure shortcut

For the common pattern of start/click/stop, you can use `clickAndMeasure`:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.navigate('https://www.sitespeed.io');
  // This is equivalent to measure.start + click(selector, { waitForNavigation: true }) + measure.stop
  return commands.measure.clickAndMeasure('Documentation', 'a[href="/documentation/"]');
}
```

The [measure command]({{site.baseurl}}/documentation/sitespeed.io/scripting/Measure.html).

## The `stopWatch` Command

The `Stop Watch` command in sitespeed.io is used for measuring the time of activities other than web page navigation, like specific processes or user actions. You manually start and stop this watch to track the duration of these actions. When you use the Stop Watch, its timing data gets automatically linked to the web page you were analyzing right before you started the watch. This way, the time recorded by the Stop Watch becomes part of the performance data for that particular page.


```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  const stopWatch = commands.stopWatch.get('Before_navigating_page');
  // Do the thing you want to measure ...
  // Then stop the watch 
  const time = stopWatch.stop();
  // Measure navigation to a page
  await commands.measure.start('https://www.sitespeed.io');
  // Then attach that timing to that page.
  commands.measure.add(stopWatch.getName(), time);
}

```

The [stop watch command]({{site.baseurl}}/documentation/sitespeed.io/scripting/StopWatch.html).

## Using user timings and element timings API

When testing a webpage you manage, it's a good idea to use the [User Timing](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/User_timing) and [Element Timing](https://wicg.github.io/element-timing/) APIs built into browsers. Most browsers support the User Timing API, and Chrome-based browsers support the Element Timing API. Browsertime and sitespeed.io automatically collect metrics from these APIs when you execute the measure command. If you need these metrics after navigating to a different page, you can also retrieve them using the JavaScript command within your script. This approach is helpful for gathering detailed timing information related to specific elements or user-defined timings on your page.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.navigate('https://www.sitespeed.io');

  // The sitespeed.io start page has a user timing mark named userTimingHeader
  const userTimingHeader = await commands.js.run(
    `return performance.getEntriesByName('userTimingHeader')[0].startTime;`
  );

  // The sitespeed.io start page has an element timing API for the logo
  const logoRenderTime = await commands.js.run(`
  const observer = new PerformanceObserver(list => {});
  observer.observe({ type: 'element', buffered: true });
  const entries = observer.takeRecords();
  for (let entry of entries) {
    if (entry.identifier === 'logo') {
      return Number(entry.renderTime.toFixed(0));
    }
  }
  `);

  context.log.info(
    `User Timing header: ${userTimingHeader} ms  and Logo Element render time ${logoRenderTime} ms`
  );
}
```

## Measure a single page application (SPA)

Single Page Applications (SPAs) are web applications that load a single HTML page and dynamically update that page as the user interacts with the app. Unlike traditional web applications that reload the entire page or load new pages to display different content, SPAs rewrite the current page in response to user actions (a soft navigation), in the best case leading to a more fluid user experience.

At the moment browser based metrics like first paint, largest contentful paint and others aren't updated for soft navigations. The Chrome team is [working on that](https://developer.chrome.com/docs/web-platform/soft-navigations-experiment) and we will try to implement support for that when it's more mature. You can follow that work in [Browsertime issue #2000](https://github.com/sitespeedio/browsertime/issues/2000).

The best way to measure a SPA today is with the visual metrics that Browsertime collects by analysing the video recording. That way you can get metrics like first visual change and last visual change.

Here's an example of how to do that:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.measure.start('https://react.dev');
  await commands.measure.start('Learn');
  await commands.click('link:Learn', { waitForNavigation: true });
  return commands.measure.stop();
}
```

And run it like this:
`sitespeed.io react.mjs --multi --spa --video --visualMetrics`

If you are testing a SPA it's important to add the `--spa` switch. That helps Browsertime to setup some extra functionality to test that page (like instead of waiting for the onloadEvent to stop the measurement, it waits for silence in the network log).

The Chrome team has the following definition of a Soft navigation:
1. The navigation is initiated by a user action.
2. The navigation results in a visible URL change to the user, and a history change.
3. The navigation results in a DOM change.

For Browsertime it's important that the URL changes — that's how we know we are measuring a new page.

If your page does not change the URL or load any resources (JSON/JavaScript/CSS or images) when you do the "soft" navigation, then you need to use the stop watch to measure that kind of navigation.