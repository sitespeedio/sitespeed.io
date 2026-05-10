---
layout: default
title: Coach for developers.
description: How to write or improve a Coach rule.
keywords: coach, documentation, developers, web performance, coach-core
author: Peter Hedenskog
nav: documentation
category: coach
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---
[Documentation]({{site.baseurl}}/documentation/coach/) / Developers

# The Coach — Developers
{:.no_toc}

{:toc}

## Where the code lives

All Coach rules and the analysis logic live in the [`coach-core`](https://github.com/sitespeedio/coach-core) repository. Fork it, clone your fork, install dependencies, and run the tests:

```bash
git clone git@github.com:<your-fork>/coach-core.git
cd coach-core
npm install
npm test
```

Requires Node.js 20 or later. You'll also need Chrome and Firefox installed to run the DOM tests.

## The advice schema

Every rule — DOM or HAR — produces an object with the same shape:

```javascript
{
  id: 'uniqueId',           // Unique rule id
  title: 'Short summary',
  description: 'Why the rule exists and what to do about it',
  advice: 'Specific, page-aware text written by the rule when it runs',
  score: 100,               // 0–100. 100 means nothing to flag.
  weight: 5,                // 0–10. How much this rule matters in its category.
  severity: 'warn',         // 'error' | 'warn' | 'info'
  offending: [],            // Array of asset URLs (or other identifiers) that caused the score
  tags: ['performance', 'css']
}
```

`severity` is the at-a-glance triage level. `weight` is how much the rule pulls down its category score when it fails. `score` is what the rule actually produced for the page being analysed.

## DOM advice vs HAR advice

The Coach analyses a page in two passes. Each rule lives in one of the two.

- **DOM advice** runs as JavaScript inside the browser and inspects the live page. Use it for things only the live DOM can answer: which scripts blocked the parser, whether `<img>` tags use `decoding="async"`, the size of the document, whether the LCP element has `fetchpriority="high"`.
- **HAR advice** runs in Node.js and inspects the HAR file produced for the run. Use it for things the network log answers best: cache headers, redirects, render-blocking timing, response counts, third-party usage.

A HAR rule can also see the DOM result for the same page (`processPage(page, domAdvice, options)`), so a HAR rule can combine network facts with what the DOM rule observed. Rules that share an `id` between the DOM and HAR side are merged — the HAR result wins.

### A DOM rule

DOM rules are bundled into a single JavaScript file that gets injected into the browser, so each one is an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) that returns the advice object. Utility helpers are available on the `util` parameter.

```javascript
(function (util) {
  'use strict';

  const offending = [];
  const links = document.getElementsByTagName('link');

  for (const link of links) {
    if (link.media === 'print') {
      offending.push(util.getAbsoluteURL(link.href));
    }
  }

  const score = Math.max(0, 100 - offending.length * 10);

  return {
    id: 'cssPrint',
    title: 'Do not load specific print stylesheets.',
    description:
      'A separate print stylesheet still costs a request and bytes even though screen readers ignore it. Inline the print rules in your main CSS with @media print instead.',
    advice:
      offending.length > 0
        ? `The page has ${util.plural(offending.length, 'print stylesheet')}. Move them into your main CSS with @media print.`
        : '',
    score,
    weight: 1,
    severity: 'info',
    offending,
    tags: ['performance', 'css']
  };
})(util);
```

### A HAR rule

HAR rules are ESM modules with a static schema and a `processPage` function that runs once per page in the HAR. The function returns the dynamic part of the result (`score`, `advice`, `offending`).

```javascript
import * as util from '../util.js';

export default {
  id: 'pageSize',
  title: "Total page size shouldn't be too big",
  description:
    'Large pages are slower on every connection. Keep transfer size under 2 MB on desktop and 1 MB on mobile.',
  weight: 3,
  severity: 'warn',
  tags: ['performance', 'mobile'],
  processPage(page, domAdvice, options) {
    const sizeLimit = options.mobile ? 1_000_000 : 2_000_000;
    if (page.transferSize > sizeLimit) {
      return {
        score: 0,
        offending: [],
        advice: `The page transfers ${util.formatBytes(page.transferSize)}, more than the ${util.formatBytes(sizeLimit)} limit.`
      };
    }
    return { score: 100, offending: [], advice: '' };
  }
};
```

The third argument (`options`) is what the caller passed to `analyseHar` — useful for branching on `mobile`, `browser`, or anything else specific to the run.

## HTTP/2 vs HTTP/1

Both DOM and HAR helpers expose an `isHTTP2` check so a single rule can give different advice per protocol:

```javascript
// DOM
if (util.isHTTP2()) {
  // Don't recommend domain sharding, etc.
}

// HAR
if (util.isHTTP2(page)) {
  // ...
}
```

## Testing

Every rule needs a test. Tests live next to the rule code in the [`test/`](https://github.com/sitespeedio/coach-core/tree/main/test) directory.

A DOM test runs the rule against a fixture HTML page from `test/http-server`:

```javascript
it('detects a print stylesheet', () =>
  runner.run('cssPrint.js').then(result => {
    assert.strictEqual(result.offending.length, 1);
  })
);
```

If you add a new DOM rule, add (or extend) an HTML fixture under `test/http-server` that triggers it. Run the tests with `npm test`.

## Adding a new category

The Coach has performance, privacy, best practice, accessibility and info categories. Adding a new one is a matter of creating a new folder under `lib/dom/<name>` (and/or `lib/har/<name>`) and dropping rule files into it. If you are unsure whether a new category fits, open an issue first and we can talk it through.

## Trying your changes against a real page

After editing rules, rebuild the bundled DOM script:

```bash
npm run combine
```

Then point a sitespeed.io install at your local checkout with `npm link` and run sitespeed.io against a URL — the Coach will use your modified rules.

```bash
# in coach-core
npm link

# in your sitespeed.io checkout
npm link coach-core
sitespeed.io https://www.sitespeed.io/
```
