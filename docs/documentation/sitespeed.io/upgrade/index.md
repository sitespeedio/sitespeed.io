---
layout: default
title: Upgrade from sitespeed.io 39 to 40
description: This guide walks through the breaking changes between sitespeed.io 39 and 40 — Browsertime 27, coach-core 9, and the new HTML report.
keywords: upgrading, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Upgrade sitespeed.io 39 → 40
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Upgrade

# Upgrade
{:.no_toc}

{:toc}

# Upgrade from 39 to 40

Sitespeed.io 40 is a major release driven by two major dep bumps — Browsertime 27 and coach-core 9 — plus a complete refresh of the HTML report. The runtime API is unchanged, so existing CI configurations and dashboards keep working, but a few behaviours that come from the underlying tools have changed and are worth knowing about before you upgrade.

## tl;dr

* **Element interaction commands now auto-wait by default.** Browsertime 27 changed the default `--timeouts.elementWait` from 0 to 6000ms — `commands.click('#btn')` and friends will wait up to 6 seconds for the element to appear. Set `--timeouts.elementWait 0` if you want the old "fail immediately" behaviour.
* **Click commands use the Selenium Actions API.** Real OS-level mouse events instead of `element.click()`. Elements have to be visible and interactable; if you need to click a hidden element use `commands.js.run()` instead.
* **coach-core is now ESM-only and requires Node.js 20+.** That matches the rest of the sitespeed.io family — sitespeed.io itself has required Node 20+ for a while. If you embed coach-core directly from your own scripts, switch to `import`.
* **The third-party category typo `survelliance` is now spelled `surveillance`.** If you hard-coded the old key anywhere (Graphite/InfluxDB queries, dashboards, plugins), update the spelling.
* **The HTML report has been completely re-skinned.** Every tab and every top-level result page now uses a unified card-based design. CSS class names changed in many places — if you've been parsing the HTML output or styling on top of it, expect breakage.

## Node.js

Node.js 20 or later is required (same as 39).

## Browsertime 27

The headline changes in Browsertime 27 that affect sitespeed.io users:

### Element commands auto-wait

In 26, `commands.click('#btn')` failed immediately if the element wasn't yet in the DOM. In 27 it auto-waits for the element to appear, up to a configurable timeout that defaults to 6 seconds:

~~~bash
sitespeed.io --browsertime.timeouts.elementWait 6000 example.js
~~~

Set it to `0` to restore 26's behaviour.

### Selector syntax is unified across commands

Every interaction command — `click`, `addText`, `wait`, `select`, `set`, mouse commands — now accepts a selector string directly. CSS is the default; prefix with `id:`, `xpath:`, `text:`, `link:`, `name:` or `class:` to switch:

~~~javascript
await commands.click('#submit');
await commands.click('xpath://button[contains(., "Sign in")]');
await commands.click('text:Sign in');
await commands.addText('#email', 'me@example.com');
~~~

The old `byId` / `byClassName` / `byLinkText` / etc. variants still work; the unified syntax is the recommended way going forward.

### `AndWait` is deprecated

`commands.clickAndWait('#go')` becomes `commands.click('#go', { waitForNavigation: true })`. The old methods still work but the new option-bag style is what the documentation will use from here.

### Chrome soft navigations

Single-page-app route changes (React, Next.js, Vue, Turbo, …) now produce a HAR page and the standard FCP / LCP / CLS / INP metrics automatically, using Chrome's PerformanceObserver soft-navigation entry type. You can still drive scripted SPA tests the way you always did — see [the SPA page]({{site.baseurl}}/documentation/sitespeed.io/spa/) — but for many SPAs the route change is now visible without scripting.

### Safari on iOS over USB

`-b safari` against a real iOS device now collects HAR (via `ios_webkit_debug_proxy` — `brew install ios-webkit-debug-proxy`), video and visual metrics. macOS Safari is unaffected.

### TypeScript scripts

`.ts` / `.mts` / `.cts` files are now supported as navigation scripts on Node 22.18.0+ via native type stripping.

For the full Browsertime 27 release notes, see [browsertime/CHANGELOG.md](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md#2700---2026-05-01).

## coach-core 9

* **ESM-only**, **Node 20+**.
* **`survelliance` → `surveillance`** in the third-party category data — see the tl;dr.
* New **`severity` tier** on every rule result (`error` / `warn` / `info`), surfaced on the Coach tab as a colour-coded chip on every advice card and a category-level breakdown in the section header.
* New **INP rule** (`interactionToNextPaint`), and four new **modern-image rules** (`decodingAsync`, `lazyLoadingImages`, `modernImageFormats`, `lcpImageHints`).
* New **privacy/security header** rules (Permissions-Policy, X-Content-Type-Options, COOP/COEP/CORP, NEL, Reporting-Endpoints, plus DOM-side `iframeSandbox` / `referrerPolicy` / `sessionReplay`).
* **Refreshed thresholds** across the rule set — `pageSize`, `cssSize`, `javascriptSize`, `cacheHeadersLong`, `strictTransportSecurityHeader` and others all updated to match the modern web. Scores on existing pages will move slightly compared with 39.
* The `largestContentfulPaint` rule no longer scores `fetchpriority` and `loading` hints on the LCP image — those checks live in the new `lcpImageHints` rule. Aggregate scores can shift a couple of points if a page had wrong hints on its LCP image.

For the full list, see [coach-core/CHANGELOG.md](https://github.com/sitespeedio/coach-core/blob/main/CHANGELOG.md#900---2026-05-05).

## HTML report

The whole report is now built around a unified card-based design language. Every tab and every top-level result page has been refreshed:

* Per-URL tabs: Summary, Metrics (LCP / INP / CLS / LOAF / Element Timings / Visual Elements / First Input / Server timings / Visual progress filmstrip), Coach, CrUX, Sustainable, Axe, CPU, PageXray, Third-party, Compare, Rendering. The old Video, Filmstrip and Screenshots tabs are merged into the Rendering tab, which now tells the full render story: the video player, milestone timeline and the filmstrip stay in sync (clicking a frame or a milestone seeks the video), when a run has a filmstrip but no video the frames drive a large preview instead, the per-run screenshot gallery follows, and below them the why-was-rendering-delayed part — a note when the server was slow to deliver the first byte (TTFB over 800 ms, the Web Vitals threshold), the recalculate-style metrics (previously on the Metrics tab), the render-blocking requests card (previously on the PageXray tab), forced reflows that happened before the page painted (windowed to FCP and LCP), and a note when animations run on the main thread instead of the compositor (both from the Chrome trace, collected with `--cpu`). The tab shows up whenever any of that exists, even without video or filmstrip. Old `#video`, `#filmstrip`, `#screenshots` and `#requests-render-blocking` links keep opening the Rendering tab.
* Top-level pages: Pages, Toplist, Detailed, Domains, Assets, Errors, Budget, Help, Settings.
* The Detailed summary is no longer one long table: metrics are grouped into cards by concern (Coach scores, Web Vitals & load timings, visual metrics, CPU, page weight, requests, response codes, …), Web Vitals are marked against the good/needs improvement/poor thresholds, response-code anomalies (4xx/5xx, redirect-heavy pages) get badges, and a "What stands out" strip on top calls out the worst findings (worst Web Vital, failing responses, redirect share, critical accessibility violations when axe ran). When a test has a single run, the identical min/median/mean/p90/max columns collapse into one Value column — run more iterations to get the spread back.

Two practical knock-on effects:

* **CSS class names changed in many places.** If you've been styling on top of the report, parsing the HTML, or relying on specific class names (`.cmp-svg`, `.coach-section-header`, etc.), expect to need updates. The metric-tile / card / KPI band primitives (`.metric-tile`, `.x-card`, `.listing-card`) are stable going forward.
* **Charts no longer ship with Chartist.** The visual-progress chart is inline SVG; the compare scatter plots are absolutely-positioned DOM dots. If your custom HTML extras pulled in Chartist from the report assets, that dep is gone — bring your own.

## Compare plugin

The compare plugin's HTML output has been substantially rewritten:

* Per-metric scatter plots are now DOM-positioned dots over a relative wrapper (round at any width — they used to render as ellipses on wide cards).
* A real Y-axis gutter shows five labelled ticks plus grid lines.
* Setup is split into separate "Run setup" and "Content breakdown" cards.
* The wide stats table scrolls horizontally with paired baseline/current columns and a significance chip on each row.

The data shape is unchanged — only the HTML rendering is different.

## What didn't change

* Configuration file format (`config.json`).
* Plugin API.
* Graphite / InfluxDB metric paths.
* Sitespeed.io CLI flag names (the new Browsertime convenience commands are additions, not replacements).
* HAR output format.

## Older guides

Upgrading from much earlier? The 39 release notes (covering everything between 8 and 39) live in [the changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md).
