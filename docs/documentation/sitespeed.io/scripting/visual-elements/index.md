---
layout: default
title: Visual elements and element timing
description: Measure when specific elements paint on screen — annotate them in HTML, point at them from your script, or let Browsertime auto-detect.
keywords: scripting, tutorial, sitespeed.io, browsertime, visual elements, element timing
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Visual elements and element timing

# Visual elements and element timing
{:.no_toc}

{:toc}

LCP tells you when the largest contentful paint happened. Sometimes you want to know when *a specific element* is visible — your hero image, the search results list, the price box on a product page. Browsertime collects this from two sources, and you can hook into both from a script.

## The three ways

There are three ways to ask "when did this element appear":

* **Add an `elementtiming` attribute to the HTML.** The browser's [Element Timing API](https://wicg.github.io/element-timing/) reports it back. Best when you control the page.
* **Pass `--scriptInput.visualElements` from the CLI.** You name elements with CSS selectors at run time without touching the HTML. Best when you don't control the page.
* **Let `--visualElements` auto-detect.** Browsertime picks the largest in-viewport image and the largest H1 for you. Cheap and useful.

The first two need `--visualElements` to be on as well, because the visual-metrics analysis runs against the recorded video.

## Pattern 1: annotate the HTML you control

If you own the page, the cleanest approach is to add `elementtiming` to the elements you care about. The browser reports their paint time and Browsertime picks it up automatically:

```html
<img src="/img/team.png" alt="..." elementtiming="logo">
<h1 elementtiming="hero-headline">How fast is your site?</h1>
<div class="results" elementtiming="search-results">…</div>
```

Run the test with `--visualElements` and the timings show up in the HTML report and in Graphite/InfluxDB next to the other metrics. No script changes needed.

## Pattern 2: name elements at run time

When you don't control the page (testing competitor sites, third-party widgets, anything you can't edit), use `--scriptInput.visualElements name:cssSelector` to point Browsertime at elements via CSS selector:

```bash
sitespeed.io https://www.sitespeed.io/ \
  --visualElements \
  --scriptInput.visualElements "logo:.navbar-brand" \
  --scriptInput.visualElements "hero:.hero-image"
```

Each `name:selector` pair is a separate `--scriptInput.visualElements` flag — pass as many as you need. The names show up in the HTML report exactly as you typed them.

## Pattern 3: read element timings in your script

Sometimes you want the timing inside your script — to log it, gate a step on it, or attach it as a [custom metric]({{site.baseurl}}/documentation/sitespeed.io/scripting/custom-metrics/). The Element Timing API is exposed via PerformanceObserver, so:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');

  // Pull element timing entries via PerformanceObserver
  const logoTime = await commands.js.run(`
    const observer = new PerformanceObserver(list => {});
    observer.observe({ type: 'element', buffered: true });
    const entries = observer.takeRecords();
    const logo = entries.find(e => e.identifier === 'logo');
    return logo ? Math.round(logo.renderTime) : null;
  `);

  if (logoTime != null) {
    context.log.info('Logo painted at %d ms', logoTime);
    commands.measure.add('logoElementTiming', logoTime);
  }
};
```

The custom metric will show up alongside Browsertime's own metrics — see the [Custom metrics tutorial]({{site.baseurl}}/documentation/sitespeed.io/scripting/custom-metrics/) for the full pattern.

## Pattern 4: auto-detect the obvious things

If you just want the basics — largest image and largest H1 in the viewport — turn on `--visualElements` and let Browsertime do the work:

```bash
sitespeed.io https://www.sitespeed.io/ --visualElements
```

You'll get visual timings for whichever image and headline Browsertime picked, named generically (`heroImage`, `heroHeadline`). It's the right starting point — turn on annotations or `--scriptInput.visualElements` later when you have specific elements you want to track.

## Browser support

Element Timing is a Chrome / Edge feature today. Safari and Firefox don't fire `element` PerformanceObserver entries, so:

* Patterns 1 and 3 (annotation, in-script reading) only work on Chrome-family browsers.
* Pattern 2 (`--scriptInput.visualElements`) works everywhere — it's analysed from the video, not from the browser API.
* Pattern 4 (`--visualElements` auto) also works everywhere — same video-based analysis.

If you measure on Safari or Firefox and want element timings, stick to patterns 2 and 4.

## When the metric isn't reported

Two common reasons an annotated element gets no timing:

* **The element rendered outside the viewport.** Element Timing only reports for elements that paint on screen. If you scroll-measure a deep page, an annotation high in the document might never fire.
* **The element was already painted when you started measuring.** With `commands.measure.start` followed by no navigation (just stopping later), the page is already there — element timings are bound to a navigation.

If you need timings for things that paint after the navigation completes (e.g. lazy-loaded content), use `commands.measure.start` without a URL and trigger the load explicitly.
