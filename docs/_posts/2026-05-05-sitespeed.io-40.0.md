---
layout: default
title: sitespeed.io 40.0
description: A new look and feel for the report, INP and modern-image rules in the Coach, a much improved scripting API and iOS-device testing in Browsertime.
authorimage: /img/aboutus/peter.jpg
intro: A big release with a new look for the HTML report, a brand-new HAR waterfall, updated Coach rules for 2026, a much improved scripting API in Browsertime and Safari on iOS with HAR and video.
keywords: sitespeed.io, webperf, release, browsertime, coach
image: https://www.sitespeed.io/img/8bit.png
nav: blog
---

# sitespeed.io 40.0

It's been a while! 40.0 is a big release: a complete refresh of the HTML report, two major dep bumps (Browsertime 27 and coach-core 9) and a bunch of new things in the Coach that didn't exist before. Your existing CI configurations and dashboards keep working — the runtime API and metric paths are unchanged — but if you write Browsertime scripts or have built anything on top of the report HTML, please read the [upgrade guide]({{site.baseurl}}/documentation/sitespeed.io/upgrade/) before you upgrade.

There are five big things in this release: a new look for the HTML report, a brand-new HAR waterfall powered by waterfall-tools, updated Coach rules for 2026, a much improved scripting API in Browsertime, and Safari on iOS with HAR and video. The full list of changes is in the [changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md).

## A new look and feel for the report

The HTML report has been refreshed across every tab and every top-level result page. It's the first big visual update in years — cleaner, more consistent, and easier to scan at a glance.

<picture><source type="image/webp" srcset="{{site.baseurl}}/img/report-summary.webp"><img src="{{site.baseurl}}/img/report-summary.png" alt="The redesigned summary tab — Where the time went card, hero KPIs, tab navigation" width="1400" height="746" loading="lazy" decoding="async"></picture>
{: .img-thumbnail-center}

A few things that are visibly new:

* The **Compare plugin** has been rewritten. Per-metric scatter plots, a paired baseline/current stats table, and a significance chip on each row.
* The **visual-progress card** on the metrics tab now shows filmstrip thumbnails along the timeline at their real capture times, with FCP / LCP / VC85 markers drawn over the curve.
* **Visual Elements** now render the actual matched image when the hero is an image — useful when "LargestImage" turns out to be a tiny copyright wordmark and not your hero photo.

<picture><source type="image/webp" srcset="{{site.baseurl}}/img/report-metrics.webp"><img src="{{site.baseurl}}/img/report-metrics.png" alt="The redesigned metrics tab — Visual milestones, Visual progress with long-task lane, Web Vitals hero" width="1400" height="802" loading="lazy" decoding="async"></picture>
{: .img-thumbnail-center}

Just upgrade and you have the new look. No flag, no migration.

## A new HAR waterfall

The waterfall is the page tab most of you stare at when something looks slow, and it has had a big upgrade. We've replaced the old PerfCascade renderer with [waterfall-tools](https://github.com/pmeenan/waterfall-tools) by [Patrick Meenan](https://github.com/pmeenan)!

A few things you can do now:

* **Toggle overlays** for page metrics, user timing marks, long tasks and the connection view, with a coloured legend so you can see what every line on the chart means.
* **Hover any request** for a tooltip with the full URL.
* **Save image** — export the rendered waterfall as a high-DPI PNG with one click, retina-sharp.
* **Visual metrics on the timeline** — first/last visual change and VisualComplete85 render as coloured vertical lines (with matching legend chips) when you run with `--video --visualMetrics`.

You also get a chronological list of user timings underneath the canvas, so every line on the timeline is named.

## Updated Coach rules for 2026

The Coach has had a big update. There's a new severity on every rule, a real INP rule, four new modern image rules and a refresh of the thresholds and privacy/security header rules. The full list is in the [coach-core 9 release notes](https://github.com/sitespeedio/coach-core/blob/main/CHANGELOG.md#900---2026-05-05).

**Severity on every rule.** Every Coach rule result now carries a `severity` — `error`, `warn` or `info` — like Lighthouse and axe. The severity tells you how urgent a finding is, independent of its score: a low-weight info finding can score 80 while a high-weight error finding can score 50. The chips on the Coach tab make this clear at a glance.

Each advice card leads with a colour-coded chip, and each section header gives you a quick breakdown (`1 error · 8 warnings · 1 info`) so you can scan a category before you dig in.

**Four new image rules** that match what people actually get wrong on hero images today:

* `decodingAsync` — flag `<img>` without `decoding="async"`.
* `lazyLoadingImages` — flag below-the-fold images that aren't `loading="lazy"` (the threshold deliberately overshoots — more than two viewport heights below the current scroll position — so images just out of view aren't penalised).
* `modernImageFormats` — flag `<img>` that ships a JPEG/PNG/GIF without an AVIF or WebP alternative through `<picture>` or `srcset`.
* `lcpImageHints` — score the priority hints on the LCP image (`fetchpriority="high"` recommended, `loading="lazy"` forbidden). Split out from the main `largestContentfulPaint` rule so you can tell "the hero image is slow" apart from "the hero image's hints are wrong" — different remediations.

**Refreshed thresholds and privacy headers.** A refresh of the privacy/security header rule set: Permissions-Policy, X-Content-Type-Options, the cross-origin isolation trio (COOP/COEP/CORP), NEL, Reporting-Endpoints, and DOM-side `iframeSandbox`, `referrerPolicy`, `sessionReplay`. CSP is now scored on its directives instead of its byte length. Existing thresholds on `pageSize`, `cssSize`, `javascriptSize`, `cacheHeadersLong`, `strictTransportSecurityHeader` and a handful of others have all been refreshed to match the modern web — scores on existing pages will move slightly compared with sitespeed.io 39.

## Browsertime 27: a much improved scripting API

If you write Browsertime scripts there's a lot to like in 27.

**Unified selector syntax** for every interaction command. CSS is the default, prefix with `id:`, `xpath:`, `text:`, `link:`, `name:` or `class:` to switch:

~~~javascript
module.exports = async function (context, commands) {
  await commands.measure.start('https://www.example.com');
  await commands.click('#submit');
  await commands.click('text:Sign in');
  await commands.click('xpath://button[contains(., "Continue")]');
  await commands.addText('#email', 'me@example.com');
  await commands.measure.stop();
};
~~~

The old `byId` / `byClassName` / `byLinkText` / ... variants still work, but the new syntax is what the documentation uses from here on.

**A lot more convenience commands** — `type`, `find`, `fill`, `cookie`, `clickAndMeasure`, `getText`, `isVisible`, `exists`, `waitForUrl` and many more. Filling a multi-field form in one call:

~~~javascript
await commands.fill({
  '#email': 'me@example.com',
  '#password': 'hunter2'
});
await commands.click('#submit', { waitForNavigation: true });
await commands.measure.stop();
~~~

`clickAndMeasure` is a shortcut for the very common pattern of measuring a click that triggers a navigation or SPA route change — start measure, click, wait for the page complete check, stop measure, all in one line:

~~~javascript
module.exports = async function (context, commands) {
  await commands.measure.start('https://www.example.com');
  await commands.clickAndMeasure('CheckoutPage', '#go-to-checkout');
};
~~~

Setting a cookie before you measure is now a one-liner too — useful for skipping a login or pre-seeding a feature flag:

~~~javascript
module.exports = async function (context, commands) {
  await commands.navigate('https://www.example.com');
  await commands.cookie.set('session', 'abc123');
  await commands.measure.start('https://www.example.com/dashboard');
  await commands.measure.stop();
};
~~~

**No more `AndWait`.** Pass `{ waitForNavigation: true }` to the regular command instead — the same option works on `click`, `type`, `addText` and the navigation commands (`back`, `forward`, `refresh`):

~~~javascript
await commands.click('#login', { waitForNavigation: true });
~~~

The old `clickAndWait` / `addTextAndWait` variants still work but are deprecated.

**Click commands now auto-wait** for the element to appear, up to 6 seconds by default. If you want the old "fail immediately" behaviour, set `--browsertime.timeouts.elementWait 0`.

**Chrome soft navigations.** Single-page-app route changes (React, Next.js, Vue, Turbo) now produce a HAR page and the standard Web Vitals automatically — Chrome tells Browsertime when the user interaction, URL change and visible paint line up. For many SPAs the route change is now visible without any scripting at all. See the [SPA page]({{site.baseurl}}/documentation/sitespeed.io/spa/).

## Safari on iOS over USB

You can now run sitespeed.io against Safari on a real iPhone connected by USB and get HAR (via `ios_webkit_debug_proxy`) plus video and visual metrics (via a small CoreMediaIO screen-capture helper). Two extra `brew install` commands and you're testing on real iPhone hardware:

~~~bash
brew install ios-webkit-debug-proxy
brew install ffmpeg
sitespeed.io -b safari --safari.ios https://www.example.com
~~~

This is **experimental**. The HAR side is pretty solid, but the video pipeline is brand new and not 100% bug-free yet — we've tested it on 60 Hz iPhones and it works, but you may run into issues on other devices or in edge cases. Please report anything that looks wrong on the [issue tracker](https://github.com/sitespeedio/browsertime/issues) so we can sort it out.

See the [mobile-phones page]({{site.baseurl}}/documentation/sitespeed.io/mobile-phones/#test-on-ios) for the full setup.

## Try it

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:40.0.0 https://www.example.com
~~~

or with npm:

~~~bash
npm install -g sitespeed.io
sitespeed.io https://www.example.com
~~~

If something looks wrong, please open an [issue](https://github.com/sitespeedio/sitespeed.io/issues) — that's how things get fixed.

/Peter
