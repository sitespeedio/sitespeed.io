---
layout: default
title: Cookies and consent banners
description: Set, read and clear cookies in your script — and stop GDPR cookie banners from skewing your metrics.
keywords: scripting, tutorial, sitespeed.io, browsertime, cookies, consent, gdpr
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Cookies and consent banners

# Cookies and consent banners
{:.no_toc}

{:toc}

Cookies are useful in scripting for two very different reasons. The boring one is that some pages need a cookie to show the variant you actually want to measure (a logged-in view, an A/B test cell, a feature flag). The much more annoying one is that almost every site in Europe now ships a GDPR consent banner that fires First Visual Change, blocks the page until clicked, and adds tens or hundreds of milliseconds of variance to every run unless you do something about it.

This tutorial covers both.

## The cookie API

The full reference is on the [Cookie command page]({{site.baseurl}}/documentation/sitespeed.io/scripting/Cookie.html). The shape is:

```javascript
// Set a cookie before measuring
await commands.cookie.set('consent', 'true');
await commands.cookie.set('ab_variant', 'B', { path: '/', secure: true });

// Read a cookie
const value = await commands.cookie.get('consent');

// Read everything
const all = await commands.cookie.getAll();

// Delete one or all
await commands.cookie.delete('session');
await commands.cookie.deleteAll();
```

Cookies are scoped to the current domain — you have to navigate to the site at least once before setting a cookie for it (the browser needs to know whose origin the cookie belongs to).

## Pattern 1: dismiss the banner before measuring

If your site shows the consent banner and you want metrics that reflect "user already consented", set the consent cookie before the measure starts. Most banners read a cookie like `cookieConsent=true` or `OptanonAlertBoxClosed=...` and skip rendering if it's set.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // Land on the origin so we can set the cookie for it
  await commands.navigate('https://www.example.org');

  // Inject the consent cookie — the exact name depends on your banner
  await commands.cookie.set('cookieConsent', 'true', {
    path: '/',
    secure: true
  });

  // Now measure — the banner is gone, no First Visual Change penalty
  return commands.measure.start('https://www.example.org/');
};
```

The exact cookie name varies by vendor: `OptanonAlertBoxClosed` for OneTrust, `CookieConsent` for Cookiebot, `__hs_opt_out` for HubSpot, `cookielaw_accepted` for some homemade banners. Look in DevTools → Application → Cookies after you click "Accept" once and copy the name and value into your script.

## Pattern 2: click the banner away

If you don't know the cookie name, or the banner only shows for some users, click it away in the script. The cost is one click before measure.start; the benefit is you don't need to know the cookie shape.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.navigate('https://www.example.org');

  // Skip the click cleanly if the banner already isn't showing
  // (e.g. the consent cookie is already set from a previous run)
  if (await commands.exists('#accept-cookies')) {
    await commands.click('#accept-cookies');
  }

  return commands.measure.start('https://www.example.org/');
};
```

The `commands.exists` check is important. If the banner has already been dismissed (e.g. you reused the browser session, or it only renders once per origin), a direct `click` would fail — `exists` lets you skip the click cleanly.

## Pattern 3: drop the consent cookie once, reuse for many pages

If you measure many pages on the same site, do the consent dance once in a `--preScript` and skip it from the per-page script. This is much faster than repeating the click on every page.

```javascript
// preScript-consent.mjs
export default async function (context, commands) {
  await commands.navigate('https://www.example.org');
  await commands.cookie.set('cookieConsent', 'true', { path: '/', secure: true });
};
```

Run it like this:

```bash
sitespeed.io --preScript preScript-consent.mjs https://www.example.org/page1 https://www.example.org/page2
```

See the [Pre and post scripts]({{site.baseurl}}/documentation/sitespeed.io/scripting/pre-and-post-scripts/) tutorial for the full pattern.

