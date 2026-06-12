---
layout: default
title: Pre and post scripts
description: Run setup before your measured pages and cleanup after — the standard log-in-once / measure-many pattern, repeated for every iteration.
keywords: scripting, tutorial, sitespeed.io, browsertime, prescript, postscript, login
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Pre and post scripts

# Pre and post scripts
{:.no_toc}

{:toc}

The most common scripting question after "how do I measure a single page?" is "how do I log in *once* and then measure several pages as a logged-in user?". Re-doing the login on every page is slow, fragile, and pollutes the metrics.

The answer is `--preScript` and `--postScript` — scripts that run before / after the URLs you measure, sharing the same browser session.

## What pre and post scripts do

* **`--preScript`** runs before the URLs are tested, in the same browser instance, so anything it does (logging in, dismissing a banner, setting cookies, throttling the network) carries into the measurement run.
* **`--postScript`** runs after the URLs are tested, while the browser is still around — useful for logout, screenshot capture on failure, or pushing custom data somewhere.

Each iteration (`-n`) starts a fresh browser, so the preScript runs at the start of *every* iteration and the postScript at the end of *every* iteration. See [They run once per iteration](#what-pre-and-post-scripts-can-not-do) below for why.

Both are completely separate `.mjs` files. They get the same `(context, commands)` signature as a regular script. Pre and post scripts do not run as part of a measurement and produce no metrics themselves; they exist to set up state.

## The login-once pattern

This is the bread-and-butter use case. Step one: a preScript that logs in.

```javascript
// login.mjs
export default async function (context, commands) {
  await commands.navigate(
    'https://en.wikipedia.org/w/index.php?title=Special:UserLogin'
  );

  await commands.type('id:wpName1', context.options.my.username);
  await commands.type('id:wpPassword1', context.options.my.password);

  // Click submit and wait for the post-login redirect
  await commands.click('id:wpLoginAttempt', { waitForNavigation: true });

  // Sanity check: if the logged-in marker isn't there, the login failed
  await commands.wait('id:pt-userpage');
};
```

Step two: run sitespeed.io with `--preScript` and any URLs you want to measure as a logged-in user.

```bash
sitespeed.io \
  --preScript login.mjs \
  --browsertime.my.username myuser \
  --browsertime.my.password 'sup3r-s3cret' \
  https://en.wikipedia.org/wiki/User:myuser \
  https://en.wikipedia.org/wiki/Special:Watchlist
```

Both URLs are measured with the post-login session, but the login itself only happens once. Username and password are passed via `--browsertime.my.*` so they don't end up hard-coded in the script — the same trick described in the [Tips and tricks tutorial]({{site.baseurl}}/documentation/sitespeed.io/scripting/tips-and-tricks/#pass-your-own-options-to-your-script).

## Useful preScript jobs that aren't login

PreScripts are good for anything that should happen once and persist into the measurement:

* **Cookie consent.** Set the consent cookie or click the banner away once, then measure many pages without re-doing it. See the [Cookies and consent tutorial]({{site.baseurl}}/documentation/sitespeed.io/scripting/cookies-and-consent/).
* **A/B test variant pinning.** Drop a cookie that pins the browser to test cell B; measure the marketing-funnel pages; compare against a separate run with cell A.
* **Cache warming.** Hit the home page in preScript so the next measurement runs against a CDN that's been primed.
* **Geolocation override.** Use CDP to set a geolocation, then measure region-gated pages.
* **Hostname mapping.** If you're testing a staging environment that requires a Host header trick or a custom DNS entry, do the navigate in preScript.

## What postScript is for

PostScripts run after every URL has been measured. The browser is still alive. Common uses:

* **Logout** — terminate the session cleanly so a re-run on the same machine doesn't hit cached state.
* **Screenshot or HAR snapshot of final state** — `commands.screenshot.take('after')` to capture what the page looked like at the end of the run.
* **Push custom data somewhere** — call out to an HTTP endpoint with run metadata, the index of the run, etc.

```javascript
// logout.mjs
export default async function (context, commands) {
  await commands.click('id:logout-link', { waitForNavigation: true });
};
```

```bash
sitespeed.io \
  --preScript login.mjs \
  --postScript logout.mjs \
  https://example.org/page1 \
  https://example.org/page2
```

## Multiple pre and post scripts

You can pass `--preScript` and `--postScript` more than once and they will run in order. Useful when you want to compose: one script for consent, one for login, one for navigation override.

```bash
sitespeed.io \
  --preScript consent.mjs \
  --preScript login.mjs \
  --preScript geo.mjs \
  https://example.org/page1
```

## What pre and post scripts can not do

* **They run once per iteration, not once for the whole test.** Each iteration (`-n 5` means five) starts a *fresh* browser, so the preScript runs at the start of every iteration and the postScript at the end of every iteration. That is required, not a quirk — otherwise iterations after the first would measure in a clean browser with none of your login / cookie / geolocation setup applied. Within a single iteration the setup still happens only once before the URLs are measured, so the log-in-once / measure-many pattern across several URLs works exactly as described above; it just repeats per iteration. There is no hook that runs only once before all iterations.
* **They do not produce metrics.** Calls to `commands.measure.start` inside a preScript or postScript are ignored — these scripts are for state, not measurement. Put your `measure.start` calls in your test script.
* **They share state through the browser, not through JavaScript.** Cookies, localStorage, the DOM you've navigated to — those carry over. Variables in the preScript do not — each script is its own module.

## When to use setUp/tearDown inside one script instead

A single test script can also declare `setUp` and `tearDown` functions in `module.exports` (CommonJS only). That's a different style — everything in one file, useful for very small tests. The Tips and tricks tutorial covers it briefly, but for anything non-trivial the `--preScript` / `--postScript` separation is cleaner: each script is its own concern, you can compose them, and you can mix and match across runs.
