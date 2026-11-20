---
layout: default
title: User journeys
description: Build a multi-step user journey — login, browse, checkout — and measure each step end-to-end.
keywords: scripting, tutorial, sitespeed.io, browsertime, user journey, checkout, signup
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / User journeys

# User journeys
{:.no_toc}

{:toc}

A user journey is a sequence of pages your real users go through to do something — log in then read a page, browse products then check out, search then click a result then read the article. The headline metric (LCP on the home page) doesn't capture the experience; the ten-step checkout does.

This tutorial pulls together the patterns from the earlier tutorials into one shape: how to build, measure, and run a multi-step journey end-to-end.

## The skeleton

A journey is a single `.mjs` file that calls `commands.measure.start` once per "page" in the journey. Each `start` opens a measurement; `stop` closes it (or starting another `measure.start` implicitly closes the previous one). Browsertime collects metrics per step.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // Step 1: home page (full navigation)
  await commands.measure.start('https://shop.example.org/');

  // Step 2: product page (full navigation)
  await commands.measure.start('https://shop.example.org/products/widget');

  // Step 3: add to cart, then go to /cart (full navigation)
  await commands.click('.add-to-cart');
  await commands.measure.start('https://shop.example.org/cart');

  // Step 4: click "Checkout", give the step an alias since the URL is dynamic
  await commands.measure.start('checkout');
  await commands.click('a.checkout-link', { waitForNavigation: true });
  await commands.measure.stop();
};
```

Run it with `--multi`:

```bash
sitespeed.io --multi shop-journey.mjs
```

The HTML report shows four pages, one per step, each with its own metrics.

## Picking aliases for steps

When a step has a stable URL, use the URL — Browsertime uses it as the page identifier and the path lands in dashboards. When the URL is dynamic (cart contents in querystring, session id in path) or when the same URL appears twice, use an alias:

```javascript
// URL-based — preferred
await commands.measure.start('https://shop.example.org/cart');

// Alias-based — for dynamic URLs or repeats
await commands.measure.start('checkout-step-1');
await commands.click('button.next', { waitForNavigation: true });
await commands.measure.stop();

await commands.measure.start('checkout-step-2');
await commands.click('button.next', { waitForNavigation: true });
await commands.measure.stop();
```

Aliases stay stable in your dashboard over time even if the URLs change. Aliases also mean you can compare runs of the same alias against each other in Grafana — picking a good alias name pays off later.

## Pattern: a real signup flow

The shape: navigate to the signup page (without measuring — the inputs and validation aren't what we're testing), fill the form, then *measure* the submit-and-redirect.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // Setup: get to the signup form. We don't measure this — the metrics
  // we care about are the post-submit page-load.
  await commands.navigate('https://example.org/signup');

  // Fill the form
  await commands.fill({
    'id:email': context.options.my.email,
    'id:password': context.options.my.password,
    'id:name': 'Test User'
  });

  // Now measure: click submit, wait for the redirect, collect metrics
  await commands.measure.start('signup-success');
  await commands.click('id:submit', { waitForNavigation: true });
  return commands.measure.stop();
};
```

Run it: `sitespeed.io --multi signup.mjs --browsertime.my.email me@example.org --browsertime.my.password secret`. See [Tips and tricks]({{site.baseurl}}/documentation/sitespeed.io/scripting/tips-and-tricks/#pass-your-own-options-to-your-script) for more on passing parameters in.

## Pattern: a checkout flow

Checkout is the canonical multi-step journey — five or six pages, dynamic URLs, conditional steps, error branches. The principle: measure each page that the *user* would notice as a separate page-load, navigate without measuring for setup steps, and use aliases everywhere.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // Step 1: home
  await commands.measure.start('https://shop.example.org/');

  // Step 2: product detail
  await commands.measure.start('https://shop.example.org/products/widget');

  // Step 3: add to cart, then measure the cart page
  await commands.click('.add-to-cart');
  await commands.measure.start('https://shop.example.org/cart');

  // Step 4: shipping (alias because /checkout/<sessionid> is dynamic)
  await commands.measure.start('shipping');
  await commands.click('a.checkout', { waitForNavigation: true });
  await commands.measure.stop();

  // Step 5: payment
  await commands.fill({
    'id:address': '1 Test Street',
    'id:postcode': 'AB1 2CD',
    'id:city': 'Townsville'
  });
  await commands.measure.start('payment');
  await commands.click('id:continue-to-payment', { waitForNavigation: true });
  await commands.measure.stop();

  // Step 6: confirmation
  await commands.fill({
    'id:card-number': '4242424242424242',
    'id:card-expiry': '12/30',
    'id:card-cvv': '123'
  });
  await commands.measure.start('confirmation');
  await commands.click('id:place-order', { waitForNavigation: true });
  return commands.measure.stop();
};
```

Six steps, six measurements, six rows in your dashboard. Each step is independently chartable and you can spot which of them regressed when the deploy goes out.

## Pattern: branching journeys

A user journey isn't always linear. Sometimes you want to go down path A if the cart is empty, path B if it has items. `commands.exists` lets you branch without throwing:

```javascript
await commands.navigate('https://shop.example.org/');

if (await commands.exists('.cart-badge')) {
  // User has items in their cart
  await commands.measure.start('https://shop.example.org/cart');
} else {
  // Empty cart — go shopping
  await commands.measure.start('https://shop.example.org/products');
  await commands.click('.product-card:first-child');
  await commands.measure.start('product-detail');
  await commands.click('.add-to-cart', { waitForNavigation: true });
  await commands.measure.stop();
}
```

The dashboards then show metrics for whichever branch ran. If you want to compare branches against each other, run them as separate scripts (`empty-cart.mjs` and `full-cart.mjs`) so each step has a stable identity.

## When a step fails: stop the measurement, continue the journey

If a step legitimately fails (the link is gone, the API returned an error, the element didn't render), you have two options:

```javascript
try {
  await commands.measure.start('checkout');
  await commands.click('id:checkout', { waitForNavigation: true });
  await commands.measure.stop();
} catch (e) {
  // Drop the metrics for this step rather than reporting bad data,
  // and continue the journey if there's something useful left to measure.
  await commands.measure.stopAsError('checkout link missing');
}
```

`stopAsError` closes the current measurement without recording metrics — the run is still useful (you got the earlier steps, you logged the error) but the broken step doesn't pollute the data. See [Error handling]({{site.baseurl}}/documentation/sitespeed.io/scripting/error-handling/) for the full pattern.

## Setup that runs before every iteration

When you run a journey with `-n 5`, the journey runs five times, each in a fresh browser. Anything inside `export default async function` runs five times, and so does anything you put in a preScript. There is no hook that runs only once before all iterations.

That is exactly why a [preScript]({{site.baseurl}}/documentation/sitespeed.io/scripting/pre-and-post-scripts/) is the right home for login or dropping a consent cookie: each iteration starts with a clean browser, so the preScript re-establishes that state at the start of every iteration before your journey is measured. Keep the login out of the journey itself so it isn't counted in the metrics; the preScript does the setup fresh each time.

```bash
sitespeed.io --multi --preScript login.mjs -n 5 shop-journey.mjs
```

## Things to watch out for

* **The browser keeps the previous page's layout until First Visual Change of the next page.** That can make multi-step videos look weird (you see step 2 starting from step 1's pixels) and can skew Last Visual Change. The "start with white" workaround is in [Tips and tricks]({{site.baseurl}}/documentation/sitespeed.io/scripting/tips-and-tricks/#getting-correct-visual-metrics).
* **Measuring the same URL twice in one run breaks** because Browsertime uses the URL as the result file name. If you genuinely need to measure the same URL twice, alias each one or add a `?dummy` querystring. Tips and tricks has the trick.
* **Iterations don't share state.** Each iteration (`-n`) runs in a fresh browser, so cookies, cache and login state from one iteration never leak into the next. If your journey needs to start logged in or with a cookie set, re-establish it in a [preScript]({{site.baseurl}}/documentation/sitespeed.io/scripting/pre-and-post-scripts/), which runs at the start of every iteration.
