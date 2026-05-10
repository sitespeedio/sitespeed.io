---
layout: default
title: Chrome HAR
description: Create Chrome HAR files bases on events from the Chrome Debugging Protocol.
keywords: Chrome HAR, documentation, web performance
author: Peter Hedenskog
nav: documentation
category: chrome-har
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

# Chrome-HAR
{:.no_toc}

Create [HAR](http://www.softwareishard.com/blog/har-12-spec/) files from [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) events.

Originally extracted from [Browsertime](https://github.com/sitespeedio/browsertime); the initial implementation was inspired by [Chromedriver_har](https://github.com/woodsaj/chromedriver_har).

## Introduction

Chrome-HAR is a library for tool makers. Capture the events from the Chrome DevTools Protocol yourself, hand them to Chrome-HAR, and get a HAR file back.

Since version 1.0.0 Chrome-HAR is a pure ESM package, so use `import` rather than `require`.

## Install

```bash
npm install chrome-har
```

## Example

Convert a stream of CDP messages into a HAR:

~~~javascript
import { harFromMessages } from 'chrome-har';

// `messages` is the array of Chrome DevTools Protocol events you have collected.
const har = harFromMessages(messages);

// Do whatever you want with the HAR file.
~~~

## Options

`harFromMessages(messages, options)` accepts a second argument:

 - `includeResourcesFromDiskCache` (default `false`) — include requests served from Chrome's disk cache.
 - `includeTextFromResponseBody` (default `false`) — include response bodies. The caller is responsible for setting `body` on the response object before passing the message in (see below).

~~~javascript
import { harFromMessages } from 'chrome-har';

const har = harFromMessages(messages, {
  includeResourcesFromDiskCache: true,
  includeTextFromResponseBody: true
});
~~~

## Response bodies

Response bodies are not part of the standard CDP `Network.responseReceived` payload. To get them into the HAR, intercept the request, fetch the body via `Network.getResponseBodyForInterception`, attach it to `params.response.body`, and pass `includeTextFromResponseBody: true` when you call `harFromMessages`.

~~~javascript
const harEvents = [];

client.on('Network.requestIntercepted', async params => {
  const response = await client.send('Network.getResponseBodyForInterception', {
    interceptionId: params.interceptionId
  });

  if (params.response != null) {
    params.response.body = response.body;
  } else {
    params.response = response;
  }

  await client.send('Network.continueInterceptedRequest', {
    interceptionId: params.interceptionId
  });

  harEvents.push({ method: 'Network.responseReceived', params });
});

const har = harFromMessages(harEvents, { includeTextFromResponseBody: true });
~~~

## Soft navigations

Single-page-app route changes can be captured as their own HAR pages. The caller emits a synthetic `SoftNavigation.detected` message with the new URL when Chrome's `PerformanceObserver` reports a soft navigation, and Chrome-HAR updates the current page accordingly. Browsertime does this automatically; if you use Chrome-HAR standalone you can emit the event yourself:

~~~javascript
messages.push({
  method: 'SoftNavigation.detected',
  params: { url: 'https://example.com/route' }
});
~~~

## Reporting bugs

To report a bug, please attach a CDP event trace so we can reproduce it. With Browsertime you can collect one with `--chrome.collectPerfLog`:

```bash
browsertime --chrome.collectPerfLog -n 1 https://www.sitespeed.io
```

With sitespeed.io:

```bash
sitespeed.io --browsertime.chrome.collectPerfLog -n 1 https://www.sitespeed.io
```

The file you want is `chromePerflog-1.json.gz` — attach it to your issue or share it via a gist.
