---
layout: default
title: CDP recipes
description: What to actually do with the Chrome DevTools Protocol — block domains, modify headers, override geolocation, throttle resources.
keywords: scripting, tutorial, sitespeed.io, browsertime, cdp, devtools, network
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / CDP recipes

# CDP recipes
{:.no_toc}

{:toc}

The [Chrome Devtools Protocol tutorial]({{site.baseurl}}/documentation/sitespeed.io/scripting/chrome-devtools-protocol/) covers the API: `cdp.send`, `cdp.sendAndGet`, `cdp.on`. This page is the companion — what to actually do with that API. Each recipe is short, copy-pasteable, and isolates one CDP capability so you can mix and match.

CDP is Chrome and Edge only. None of these work in Firefox or Safari — Firefox has [Bidi]({{site.baseurl}}/documentation/sitespeed.io/scripting/bidi/), Safari has neither.

## Recipe: block third-party domains

Block requests to specific domains before they go out. Useful for measuring "your site without the ad network" or for stripping a slow tag manager:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.cdp.send('Network.setBlockedURLs', {
    urls: [
      '*google-analytics.com*',
      '*doubleclick.net*',
      '*facebook.net*',
      '*hotjar.com*'
    ]
  });
  await commands.cdp.send('Network.enable');

  return commands.measure.start('https://www.example.org');
};
```

The patterns are URL globs (asterisk wildcards) — keep them broad enough to catch all the subdomains. Blocked requests fail with `net::ERR_BLOCKED_BY_CLIENT`; the page renders without them.

## Recipe: modify response headers

Add, change or remove headers on responses. This needs `Fetch.enable` and a `Fetch.requestPaused` listener that calls `Fetch.continueResponse` with the modified headers:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  const cdpClient = commands.cdp.getRawClient();
  await cdpClient.Fetch.enable({
    patterns: [{ urlPattern: '*', requestStage: 'Response' }]
  });

  cdpClient.Fetch.requestPaused(async event => {
    const headers = event.responseHeaders || [];

    // Strip Set-Cookie from third-party responses
    const filtered = headers.filter(h =>
      !(h.name.toLowerCase() === 'set-cookie' && !event.request.url.startsWith('https://www.example.org'))
    );

    return cdpClient.Fetch.continueResponse({
      requestId: event.requestId,
      responseCode: event.responseStatusCode,
      responseHeaders: filtered
    });
  });

  return commands.measure.start('https://www.example.org');
};
```

You can use the same shape to add headers (for example a `Server-Timing` you injected for testing), or to rewrite headers wholesale.

## Recipe: override geolocation

Test how a page renders for users in a different geography:

```javascript
await commands.cdp.send('Emulation.setGeolocationOverride', {
  latitude: 35.6762,
  longitude: 139.6503,
  accuracy: 100
});

return commands.measure.start('https://www.example.org/find-store');
```

Pair with [Pre and post scripts]({{site.baseurl}}/documentation/sitespeed.io/scripting/pre-and-post-scripts/) if you want this set once for a whole run rather than re-set on every iteration.

## Recipe: capture every network response

Listen for `Network.responseReceived` and stash what you need. This is how you'd build a "what third parties is this page loading" report:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  const responses = [];

  await commands.cdp.on('Network.responseReceived', params => {
    responses.push({
      url: params.response.url,
      status: params.response.status,
      mimeType: params.response.mimeType
    });
  });

  await commands.measure.start('https://www.example.org');

  // Count third-party requests as a custom metric
  const thirdParties = responses.filter(r => !r.url.startsWith('https://www.example.org')).length;
  commands.measure.add('thirdPartyRequestCount', thirdParties);
};
```

The HAR file already captures all this — reach for `cdp.on` only when you need data the HAR doesn't have, or when you want to compute a metric inline.

## Recipe: throttle a specific resource

Slow down requests to one URL pattern (typical: simulate a slow CDN serving the hero image). The HAR-side connectivity throttling slows everything; this is for slowing one resource without touching the rest.

```javascript
const cdpClient = commands.cdp.getRawClient();
await cdpClient.Fetch.enable({
  patterns: [{ urlPattern: '*hero-image*', requestStage: 'Request' }]
});

cdpClient.Fetch.requestPaused(async event => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return cdpClient.Fetch.continueRequest({ requestId: event.requestId });
});

return commands.measure.start('https://www.example.org');
```

The `setTimeout` in the request-pause listener delays continuation by 2000ms. The matching resource arrives 2 seconds late; the rest of the page loads at full speed.

## Recipe: simulate offline / no network

Useful for testing offline-first apps and service worker behaviour:

```javascript
await commands.cdp.send('Network.enable');
await commands.cdp.send('Network.emulateNetworkConditions', {
  offline: true,
  latency: 0,
  downloadThroughput: 0,
  uploadThroughput: 0
});

await commands.navigate('https://www.example.org');

// Verify your offline page actually rendered
await commands.wait('id:offline-page');
```

The same `Network.emulateNetworkConditions` is what `--connectivity custom` uses under the hood. Setting `offline: true` cuts all traffic; setting throughput / latency without `offline` lets you simulate a slow connection.

## Recipe: override the Accept-Language header

Test the localised version of a page without changing your machine's locale:

```javascript
await commands.cdp.send('Network.setExtraHTTPHeaders', {
  headers: { 'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.5' }
});

return commands.measure.start('https://www.example.org');
```

The same trick works for any header you want to send on every request — `Authorization` for an authenticated bot, `X-Test-Cell` for a test variant, etc.

## Recipe: inject JavaScript on every new document

Run a snippet in every page the browser loads, before the page's own JS gets to run. Useful for stubbing globals, setting up A/B variant locks, or installing a measurement hook:

```javascript
await commands.cdp.send('Page.addScriptToEvaluateOnNewDocument', {
  source: `
    window.__forceVariant = 'B';
    Object.defineProperty(window, 'navigator', {
      value: new Proxy(navigator, {
        get: (t, k) => k === 'language' ? 'sv-SE' : t[k]
      })
    });
  `
});

return commands.measure.start('https://www.example.org');
```

Combine recipes — `addScriptToEvaluateOnNewDocument` plus `setExtraHTTPHeaders` plus `setGeolocationOverride` is a complete "fake a Swedish user" setup.

## Things to remember

* **Enable the domain before subscribing.** `Network.enable`, `Fetch.enable`, etc. — most listeners need their domain enabled before they receive events.
* **Subscriptions are per-page.** Listeners installed before `measure.start` apply to that page. If you want them on the next page too, install them again or use `addScriptToEvaluateOnNewDocument` for things that travel.
* **Fetch.requestPaused must call continueRequest or continueResponse.** If you forget, the request hangs forever. Test your handlers.
* **Don't run heavy logic in the listener.** It runs on every request; a slow handler slows the page. Stash the data, do the work after.
