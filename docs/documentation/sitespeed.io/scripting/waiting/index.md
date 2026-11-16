---
layout: default
title: Waiting recipes
description: When to wait, what to wait for, and which of the wait commands to reach for.
keywords: scripting, tutorial, sitespeed.io, browsertime, wait, waitForUrl, byCondition
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Waiting recipes

# Waiting recipes
{:.no_toc}

{:toc}

Most flaky scripts come down to the same problem: the script does something before the page is ready, the click misses, and the run dies. Browsertime gives you several wait primitives and the right one depends on what you're waiting for.

This page is the cheat sheet — what each wait does, when to reach for it, and what to use instead.

## TL;DR — pick by what you're waiting for

| You're waiting for | Use |
|---|---|
| An element to be in the DOM | `commands.wait('selector')` |
| An element to be visible (not just in DOM) | `commands.wait('selector', { visible: true })` |
| A specific JavaScript condition | `commands.wait.byCondition('expr')` |
| The browser URL to contain a string | `commands.waitForUrl('substring')` |
| The page navigation to finish | `commands.wait.byPageToComplete()` |
| A specific number of milliseconds | `commands.wait.byTime(ms)` (last resort) |

## `commands.wait('selector')` — element-based, the default

Wait until an element matching the selector exists. Uses the same unified selector syntax as `click` and the rest:

```javascript
// CSS selector (default)
await commands.wait('#search-results');

// By id
await commands.wait('id:cart-total');

// By link text
await commands.wait('link:Continue');

// By xpath
await commands.wait('xpath://button[@aria-label="Submit"]');

// Wait for visible, not just present in DOM
await commands.wait('#modal', { visible: true });
```

This is what you want most of the time. It's element-driven (so it doesn't fail if the page is slow), it uses the global `--timeouts.elementWait` budget by default, and the unified selector syntax means it composes cleanly with `click`, `find` and `type`.

## `commands.wait.byCondition` — when no element marks the moment

When the thing you're waiting for isn't an element (a JavaScript flag, a global variable, a library being ready), use `byCondition`. The expression is run in the page and polled until truthy:

```javascript
// Wait until a global is set
await commands.wait.byCondition('window.app && window.app.ready === true');

// Wait until a specific number of items have rendered
await commands.wait.byCondition('document.querySelectorAll(".result").length >= 10');

// Wait until a fetch has populated some state
await commands.wait.byCondition('window.__TEMPLATE__ != null');
```

`byCondition` returns the truthy value, so you can also use it to read state out of the page:

```javascript
const itemCount = await commands.wait.byCondition('document.querySelectorAll(".result").length');
context.log.info('Got %d results', itemCount);
```

## `commands.waitForUrl` — for redirects and SPA navigations

After a login, OAuth round-trip, SPA route change, or any other URL transition, you often need to wait until the URL has actually changed. `waitForUrl` watches `window.location` for a substring:

```javascript
// Wait until /dashboard appears in the URL
await commands.waitForUrl('/dashboard');

// Or with a prefix path
await commands.waitForUrl('/account/');
```

Use this in preference to `wait.byTime` after a redirect — much more robust to slow networks.

## `commands.wait.byPageToComplete` — wait for the current page to finish loading

This is the page-complete signal Browsertime uses internally — it watches `performance.timing.loadEventEnd` and confirms the load event has fired plus a settling period has passed. It does *not* watch the URL — if you need to wait for a URL change after a click or redirect, use `commands.waitForUrl` (above), not `byPageToComplete`.

```javascript
await commands.click('link:Documentation');
await commands.wait.byPageToComplete();
```

Two things to be aware of when you use it directly:

* It runs a hardcoded ~5-second pre-delay before the check (controlled by `--browsertime.beforePageCompleteWaitTime`). That means even on a page that's already done loading, this call takes ~5 seconds minimum.
* It checks load-event timing on whatever page is currently in the browser. If the click hasn't triggered a navigation yet when this runs, you'll just confirm the *previous* page is done — not the new one.

In practice you rarely call this directly. `commands.click('selector', { waitForNavigation: true })` already runs the check for you, and `commands.measure.start/stop` runs it implicitly between pages. Reach for `byPageToComplete` only when a navigation happens through a path the driver doesn't see (a `window.location` assignment from a setTimeout, a meta refresh) and you need to block until the load completes.

## `commands.wait.byTime` — the last resort

A fixed millisecond delay. Use sparingly:

```javascript
await commands.wait.byTime(2000);
```

This is what you write when you can't think of an element to wait for and a 2-second sleep happens to be long enough on your machine. It's fragile (slow CI? failure), it's slow (always waits the full duration), and it doesn't communicate intent. Prefer one of the other waits.

The legitimate uses are:
* Animation settling time (a CSS transition that has no DOM marker for "done").
* Throttling your own script — pacing actions to look more human-like.
* Waiting for analytics beacons after a measurement to flush before the browser tears down.

## One global timeout, not per-call

Every wait above accepts a `{ timeout: ms }` option, but the right way to configure waits across a whole run is the CLI flag `--timeouts.elementWait`. This makes one number govern `wait`, `click`, `find`, `exists` and the rest:

```bash
# Raise the budget to 10 seconds for the whole run
sitespeed.io --timeouts.elementWait 10000 myScript.mjs

# Disable auto-wait entirely (commands fail immediately)
sitespeed.io --timeouts.elementWait 0 myScript.mjs
```

Reach for per-call `{ timeout: ... }` only when one specific page in your script legitimately needs more time than the rest — e.g. one slow report-generation page that takes 20 seconds while everything else is sub-5. The [Tips and tricks tutorial]({{site.baseurl}}/documentation/sitespeed.io/scripting/tips-and-tricks/) shows that pattern.

## Things you should not wait for

* **Don't wait for `setTimeout` to resolve.** If your code uses `setTimeout`, wait on the side-effect (the element it adds, the state it sets) instead of on the timer.
* **Don't wait for a fixed time and then check.** That's the pattern that times out on slow CI and runs slowly on fast machines. Wait on the condition itself.
* **Don't replace `commands.measure.start/stop` with manual waits.** The measure flow already runs the right page-complete check; you just confuse it.
