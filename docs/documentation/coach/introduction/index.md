---
layout: default
title: Coach Introduction
description: What the Coach checks and how it scores your page.
keywords: coach, documentation, web performance, core web vitals
author: Peter Hedenskog
nav: documentation
category: coach
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---
[Documentation]({{site.baseurl}}/documentation/coach/) / Introduction

# The Coach — Introduction
{:.no_toc}

{:toc}

## What is the Coach?

The Coach is a set of rules that look at a real page in a real browser, plus the HAR file generated for the same run, and tell you what to fix. It runs by default inside [sitespeed.io](/documentation/sitespeed.io/) and [Browsertime](/documentation/browsertime/), and the analysis logic lives in the open-source [`coach-core`](https://github.com/sitespeedio/coach-core) library.

Each Coach rule combines two sources of truth:

- **DOM advice** — JavaScript that runs inside the browser and inspects the live page (which scripts blocked rendering, whether images are scaled in HTML, whether `decoding="async"` is set, and so on).
- **HAR advice** — analysis of the HAR file produced for the run (request count per content type, cache headers, third-party usage, render-blocking timing).

The two are merged into one result so each rule can use information from both sides.

## What the Coach checks

- **Core Web Vitals** — LCP, CLS, INP and FCP, with rule-specific guidance per metric.
- **Modern image practices** — `decoding="async"`, native lazy loading, AVIF/WebP usage, `fetchpriority` on the LCP image.
- **Critical rendering path** — render-blocking JavaScript and CSS, inlined CSS, head content.
- **HTTP and caching** — cache headers, redirects, compression, HTTP/2 and HTTP/3 usage.
- **Privacy and security headers** — CSP, COOP/COEP/CORP, Permissions-Policy, X-Content-Type-Options, NEL, Reporting-Endpoints, Referrer-Policy.
- **Third parties** — what third-party scripts the page pulls in and what it costs.
- **Accessibility and best practice** — basic checks you can act on without extra tooling.
- **Info** — facts about the page (DOM size, depth, iframes, localStorage size) without an opinion attached. Use them to draw your own conclusions.

## How scoring works

Every rule produces a result with three numbers:

- **score** (0–100) — 100 means the rule has nothing to flag, 0 means there is plenty to do.
- **weight** (0–10) — how much this rule matters in its category. A failing weight-10 rule pulls the category score down a lot more than a failing weight-1 rule.
- **severity** (`error` / `warn` / `info`) — at-a-glance triage. `error` means fix it now, `warn` means address it soon, `info` is good to know.

Scores are aggregated into category scores (performance, privacy, best practice, accessibility) and an overall page score, all on the same 0–100 scale.

## Why open source

Every rule is open. You can read the exact check, change it, or add a new one. If a rule misses a case or feels wrong for your site, file an issue or a PR against [`coach-core`](https://github.com/sitespeedio/coach-core/issues). Each rule has unit tests so it stays easy to change.
