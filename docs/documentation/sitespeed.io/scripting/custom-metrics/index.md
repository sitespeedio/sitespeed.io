---
layout: default
title: Custom metrics
description: Add your own metrics from a script — battery temperature, comment counts, anything you can read from the browser or device.
keywords: scripting, tutorial, sitespeed.io, browsertime, custom metrics, measure.add
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Custom metrics

# Custom metrics
{:.no_toc}

{:toc}

Browsertime ships with a long list of built-in metrics — Largest Contentful Paint, Cumulative Layout Shift, Total Blocking Time and so on. Sometimes that's not enough. You want to track the temperature of the phone running the test, the number of items in the cart, the time it takes for your app's loading spinner to disappear, the size of a custom log payload. Anything you can read from the browser or the device, you can attach to your measurement.

The mechanism is `commands.measure.add()`.

## The API

```javascript
// One metric at a time
commands.measure.add(name, value);

// Several at once
commands.measure.addObject({ name1: value1, name2: value2 });
```

Both calls attach the metric to the current measurement — the one you most recently started with `commands.measure.start`. The metric:

* shows up in the metrics tab of the HTML report
* is automatically forwarded to Graphite or InfluxDB if you have those wired up
* counts as part of the run for diff/compare purposes

You can call `add` either before or after `measure.stop` — as long as the measurement is still the latest one started.

## Pattern 1: read a value from the page

The most common case: run a snippet of JavaScript on the page, get a number back, attach it as a metric. `commands.js.run` is your friend.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.measure.start('https://blog.example.org/post/123');

  // Pull the comment count out of the DOM
  const commentsText = await commands.js.run(
    `return document.querySelector('.comment-count')?.innerText ?? '0'`
  );
  const comments = parseInt(commentsText.match(/\d+/)?.[0] ?? '0', 10);

  await commands.measure.stop();

  // Attach as a metric — appears as commentCount in the HTML and Graphite
  commands.measure.add('commentCount', comments);
};
```

Two things to notice. First, the parsing happens *outside* the `js.run` call — keep your in-page JavaScript small and well-scoped, do the regex/maths in Node where it's easier to read. Second, `add` is called after `measure.stop`, which is fine: the measurement is still the most recent one and the metric attaches to it.

## Pattern 2: combine multiple page values

You can read several things and attach them as a group:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.measure.start('https://shop.example.org/');

  const dom = await commands.js.run(`
    return {
      products: document.querySelectorAll('.product-card').length,
      bannersShown: document.querySelectorAll('.promo-banner:not(.hidden)').length,
      hasSearchBox: !!document.getElementById('search')
    };
  `);

  await commands.measure.stop();

  commands.measure.addObject({
    productCount: dom.products,
    bannerCount: dom.bannersShown,
    hasSearchBox: dom.hasSearchBox ? 1 : 0
  });
};
```

`addObject` takes a flat object of `{ name: value }` pairs. Booleans get sent as numbers (`true` → 1, `false` → 0) so they're chartable in Grafana.

## Pattern 3: time something the browser doesn't time for you

If you want to know how long a non-navigation activity took (a search dropdown opening, a modal animation, an XHR response), use `commands.stopWatch.get(name)`. The watch attaches its time to the current measurement automatically when you call `stop()`.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.measure.start('https://www.example.org/dashboard');

  const watch = commands.stopWatch.get('searchDropdownOpen');
  await commands.click('#search-input');
  await commands.wait('.search-dropdown.visible');
  const elapsedMs = watch.stop();

  // Attach the timing to the current page measurement
  commands.measure.add(watch.getName(), elapsedMs);

  return commands.measure.stop();
};
```

For navigation timings, prefer `commands.measure.start` / `stop` — those get the full set of browser metrics (paint, LCP, layout shift). Use the stop watch for arbitrary activity that the browser doesn't natively time.

## Pattern 4: device-side metrics (Android)

If you run on Android via adb, the shell is right there. The classic example is battery temperature — useful for spotting tests that ran while the phone was thermal-throttling.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // Check temperature before the test even starts so you can correlate
  const startTemp = await commands.android.shell(
    `dumpsys battery | grep temperature | grep -Eo '[0-9]{1,3}'`
  );

  await commands.measure.start('https://www.example.org/');

  // Measure again after the test
  const endTemp = await commands.android.shell(
    `dumpsys battery | grep temperature | grep -Eo '[0-9]{1,3}'`
  );

  commands.measure.addObject({
    batteryTempStart: parseInt(startTemp, 10) / 10, // dumpsys returns tenths of a degree
    batteryTempEnd: parseInt(endTemp, 10) / 10
  });
};
```

iOS doesn't expose the same shell access — see the [Mobile devices tutorial]({{site.baseurl}}/documentation/sitespeed.io/scripting/mobile-devices/#what-you-cannot-do-on-ios) for what is and isn't available there.

## Pattern 5: derive a metric from existing metrics

`commands.measure.add` doesn't have to read from the page. You can compute a derived value and attach it. Example: a "metrics ratio" — what proportion of total blocking time happens before the largest contentful paint.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.measure.start('https://www.example.org/');
  await commands.measure.stop();

  // Pull the metrics that just got collected, compute a derived value
  const metrics = await commands.js.run(`
    const lcp = performance.getEntriesByType('largest-contentful-paint').slice(-1)[0]?.startTime;
    return { lcp: lcp ?? null };
  `);

  if (metrics.lcp != null) {
    commands.measure.add('lcpRoundedToHundred', Math.round(metrics.lcp / 100) * 100);
  }
};
```

## Naming conventions

Metric names show up directly in dashboards and in the HTML report, so name them so they read sensibly when sorted alphabetically next to the built-in metrics. Some habits that pay off later:

* lowerCamelCase, like `commentCount`, `batteryTempStart`, not `comment_count` or `Battery temp`. The built-in Browsertime metrics use camelCase and your custom ones will look out of place if they don't.
* prefix related metrics so they group in the dashboard — `cart_*` for cart-related custom metrics, `temp_*` for temperature, etc.
* keep the names stable — once you start charting them in Grafana, renaming costs you historical data.

## What not to do

* **Do not call `commands.measure.add` before `commands.measure.start`** — there's no current measurement for the metric to attach to and the call is silently dropped.
* **Do not pass non-numeric values as metrics** — strings won't chart and may break dashboards. If you want to track a string (e.g. "which CDN edge served the response"), log it via `context.log.info(...)` instead and pull it from logs.
* **Do not use `add` for high-cardinality values** like timestamps or unique IDs. Each unique metric name takes a Graphite/InfluxDB series; thousands of them will balloon storage. Aggregate first, then attach.
