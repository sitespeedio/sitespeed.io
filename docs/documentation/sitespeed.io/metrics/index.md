---
layout: default
title: Metrics collected by sitespeed.io
description: Here are the metrics we collect by sitespeed.io and how they are defined.
keywords: metrics
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Here are the metrics we collect by sitespeed.io and how they are defined.
---

[Documentation](/documentation/sitespeed.io/) / Metrics

# Metrics
{:.no_toc}

We collect a lot of metrics in sitespeed.io and all of them isn't super easy to understand what they are measuring.

* Lets place the TOC here
{:toc}

## Visual Metrics
Visual Metrics are metrics calculated from screenshots/video of the browsers screen. We use the library [Visual Metrics](https://github.com/WPO-Foundation/visualmetrics) to do that.

### Speed Index
The Speed Index is the average time at which visible parts of the page are displayed. It is expressed in milliseconds and dependent on size of the view port. It was created by Pat Meenan and you can checkout the [full documentation](https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index).

### Contentful Speed Index
This new metric is developed by Bas Schouten at Mozilla which uses edge detection to calculate the amount of "content" that is visible on each frame. It was primarily designed for two main purposes: Have a good metric to measure the amount of text that is visible. Design a metric that is not easily fooled by the pop up splash/login screens that commonly occur at the end of a page load. These can often disturb the speed index numbers since the last frame that is being used as reference is not accurate.

### First Visual Change
The time when something for the first time is painted within the viewport.

### Visual Complete 85%
When the page is visually complete to 85% (or more).

### Visual Complete 95%
When the page is visually complete to 95% (or more).

### Visual Complete 99%
When the page is visually complete to 99% (or more).

### Last Visual Change
The time when something for the last time changes within the viewport.

###  Largest Image
The time when the largest image within the viewport has finished painted at the final position on the screen.

### Heading
The time when the largest H1 heading within the viewport has finished painted at the final position on the screen.

### Logo
The time when the logo (configured with `--scriptInput.visualElements`) within the viewport has finished painted at the final position on the screen.

## CPU Metrics
If you use Chrome when you test you can [enable getting metrics](/documentation/sitespeed.io/cpu/) about what the CPU is doing when your page is loading.

### First Input Delay
First Input Delay measures the time from when a user first interacts with your site (when they click a link, tap on a button etc) to the time when the browser is actually able to respond to that interaction. You need to [use scripting](/documentation/sitespeed.io/scripting/#measuring-first-input-delay---fid) to actively do something with the page for this metric to be collected.

### Total Blocking Time
The blocking time of a given long task is its duration in excess of 50 ms (or the time you have configured with <code>--browsertime.minLongTaskLength</code>). And the total blocking time for a page is the sum of the blocking time for each long task that happens after first contentful paint.

### Max Potential First Input Delay
The worst-case First Input Delay that your users might experience during load. This is calculated using CPU long tasks that happens after first contentful paint.

### Total amount of Long Tasks
The total amount of CPU Long Tasks that happens on the page, from the start of the measurement until the end.

### Total time spent in Long Tasks
The total time spent in CPU Long Tasks that happens on the page, from the start of the measurement until the end.

## Coach scores
The [Coach](/documentation/coach/) helps you find issues with your web page.

### Overall score
The average combined performance, privacy, accessibility and best practices score from the Coach. If the score is 100 you are doing fantastic, there's no more you can do here.

### Performance score
The coach knows much about performance best practices and match your pages against them.

### Accessibility score
Make sure your site is accessible and usable for everyone. You should also look into the [AXE metrics]().

### Web Best Practice score
You want your page to follow web best practice and the coach helps you with that. Making sure your page is set up for search engines, have good URL structure and more.

## Browser metrics
Modern browser has many API that can deliver useful metrics to you.

### BackEndTime
The time it takes for the network and the server to generate and start sending the HTML. Collected using the Navigation Timing API with the definition: responseStart - navigationStart. This is TTFB (Time To First Byte).

### FrontEndTime
The time it takes for the browser to parse and create the page. Collected using the Navigation Timing API with the definition: loadEventStart - responseEnd

### DOMContentLoadedTime
The time the browser takes to parse the document and execute deferred and parser-inserted scripts including the network time from the users location to your server. Collected using the Navigation Timing API with the definition: domContentLoadedEventStart - navigationStart

### DOMInteractiveTime
The time the browser takes to parse the document, including the network time from the users location to your server. Collected using the Navigation Timing API with the definition: domInteractive - navigationStart

### DomainLookupTime
The time it takes to do the DNS lookup. Collected using the Navigation Timing API with the definition: domainLookupEnd - domainLookupStart

### PageDownloadTime
How long time does it take to download the page (the HTML). Collected using the Navigation Timing API with the definition: responseEnd - responseStart

### PageLoadTime
The time it takes for page to load, from initiation of the page view (e.g., click on a page link) to load completion in the browser. Important: this is only relevant to some pages, depending on how you page is built. Collected using the Navigation Timing API with the definition: loadEventStart - navigationStart

### RedirectionTime
Time spent on redirects. Collected using the Navigation Timing API with the definition: fetchStart - navigationStart

### ServerConnectionTime
How long time it takes to connect to the server. Collected using the Navigation Timing API with the definition: connectEnd - connectStart

### ServerResponseTime
The time it takes for the server to send the response. Collected using the Navigation Timing API with the definition: responseEnd - requestStart

### FirstPaint
This is when the first paint happens on the screen. In Firefox we use *timeToNonBlankPaint* (that is behind a Firefox preference).

### First Contentful Paint
First Contentful Paint (FCP) measures the time from navigation to the time when the browser renders the first bit of content from the DOM.

### Largest Contentful Paint
The Largest Contentful Paint (LCP) metric reports the render time of the largest content element visible in the viewport.

### Element timings
Measure when specfific elements occur on the screen. To get this metric you need to annotate your HTML element with the attribute **elementtiming**.

### Cumulative Layout Shift
Cumulative Layout Shift (CLS) measures the sum total of individual layout shift scores for the unexpected layout shift that occurs during maximum session window with 1 second gap, capped at 5 seconds. This is a Chrome only metric. [Read how the CLS metric changed last year](https://web.dev/evolving-cls/).

### Time To DOM Content Flushed
Internal Firefox metric activated by setting the preference  **dom.performance.time_to_dom_content_flushed.enabled** to true.

### Time To Contentful Paint
Firefox implementation of First Contentful Paint. Activated by setting the preference
**dom.performance.time_to_contentful_paint.enabled** to true.

### Time To First Interactive
Firefox implementation of Time to first interactive. Activated by setting the preference **dom.performance.time_to_first_interactive.enabled** to true.

### Load Event End
The time when the load event of the current document is completed.

### Fully Loaded
The time when all assets in the page is downloaded. The value comes from the latest response in the HAR file.

### RUM-SpeedIndex
A browser version also created by Pat Meenan that calculates the SpeedIndex measurements using Resource Timings. It is not as perfect as Speed Index but a good start.

## Page metrics
Your page is built by HTML, CSS, JavaScript, images, fonts and more. The page metrics lets you know how many requests you do and the size of them.

### Transfer size
The transfer size is the size of the response over the wire. That means if you compress you response, it will show up here.

### Content Size
The content size is the total uncompressed size of your response.

### Requests
You can also see the total number of requests and requests per type.

## Axe
Axe is a [accessibility engine for automated Web UI testing](/documentation/sitespeed.io/axe/).

### Critical Axe violations
The number of critical accessibility violations on your page found by Axe.  A critical violation means that you should fix it now.

### Serious Axe violations
The number of serious accessibility violations on your page found by Axe.  A serious violation means that you should fix it now.

### Minor Axe violations
The number of minor accessibility violations on your page found by Axe.

### Moderate Axe violations
The number of moderate accessibility violations on your page found by Axe.
