---
layout: default
title: How to Write a Good Bug Report
description: When you create a bug report for a sitespeed.io project, there are a couple of things that you can do to help us.
keywords: issues, bug, sitespeed.io, sitespeed, browsertime
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: When you create a bug report for a sitespeed.io project, there are a couple of things that you can do to help us.
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / How to Write a Good Bug Report

# How to Write a Good Bug Report
{:.no_toc}

<b>TL;DR — file a reproducible bug report. The more we can copy-paste and run, the faster we can fix it.</b>

{:toc}

## Before you file

1. Read the [F.A.Q and Best Practice](https://www.sitespeed.io/documentation/sitespeed.io/best-practice/).
2. Search the [existing GitHub issues](https://github.com/sitespeedio/sitespeed.io/issues?q=is%3Aissue) (open and closed) — your bug may already be reported or fixed. If you find an open issue that matches, comment on it. Don't comment on closed issues; open a new one and link the old one.
3. Open a new [bug report](https://github.com/sitespeedio/sitespeed.io/issues/new?template=BUG_REPORT.yml). The form will guide you through the required fields.

## What we need to reproduce your bug

A bug we can reproduce is a bug we can fix. "Reproducible" means we can copy your command and your URL onto a fresh machine and see the same problem.

Every bug report should include:

- **The exact command you ran**, including every flag and config file. Mask passwords, but keep everything else.
- **A public URL** that triggers the bug. If your URL is private, build a minimal reproduction on a public host (for example [glitch.com](https://glitch.com/), [jsbin.com](http://jsbin.com/), or [httpbin.org](https://httpbin.org) for header / cookie / auth issues).
- **The full log output** as text — not a screenshot. Run with `-vv` (or `-vvv`) to capture more detail. Paste short logs into the issue, put long logs in a [gist](https://gist.github.com/).
- **The version of sitespeed.io** (`sitespeed.io --version`).
- **The operating system** you run on. If you use Docker, also tell us the host OS.
- **The browser and version** if you don't use Docker (Docker images pin known versions).
- **What you expected to happen and what actually happened**.

If you use [scripting to measure a user journey](https://www.sitespeed.io/documentation/sitespeed.io/scripting/), include the full script. We cannot reproduce a script bug without the script.

We can reproduce desktop bugs on macOS, Ubuntu and Debian. If you hit a bug on a different OS, tell us — and ideally give us access to a machine where we can reproduce it.

A bug report with everything above gets the <span class="reproducible">reproducible</span> tag and goes to the front of the queue.

## Capture the right artifacts for the bug type

Different bugs need different evidence. Run with the matching flag and attach the file it produces.

| Bug type | Add this flag | What to attach |
|---|---|---|
| Visual Metrics or video looks wrong | `--videoParams.keepOriginalVideo` | `1-original.mp4` from the `video/` folder |
| HAR is missing entries or looks wrong (Chrome) | `--chrome.collectPerfLog` | `chromePerflog-1.json.gz` |
| Crash, hang or unexpected output | `-vv` (or `-vvv`) | The full console log |
| Scripting bug | `-vv` | The full log **and** the script file |

## What not to do

- **Do not** open the issue on a different repo than the one with the bug. If you don't know which repo, file it on [sitespeed.io](https://github.com/sitespeedio/sitespeed.io/issues/new) and we will move it.
- **Do not** paste a screenshot of the log. We can't grep an image.
- **Do not** hijack an unrelated issue, even if the symptom looks similar — open a new one and link the old.
- **Do not** DM us on Slack or email us about the bug. Filing it on GitHub means anyone can find the answer.

If your problem is generic Docker or proxy-related, search the web first or ask on [forums.docker.com](https://forums.docker.com/). If you can, reproduce the bug on a network without a proxy before filing it.

## How we prioritise

Bugs that break functionality for many users and come with a reproducible test case are fixed first. If you disagree with how we prioritise, you can:

- Improve the report so we can reproduce it.
- Send a pull request — we'll help you test and verify it.
- [Sponsor the project on Open Collective](https://opencollective.com/sitespeedio). We can't promise a fix, but it helps us spend more time on bugs.

If you don't get a response within a few days, ping us in the [general channel on Slack](https://join.slack.com/t/sitespeedio/shared_invite/zt-296jzr7qs-d6DId2KpEnMPJSQ8_R~WFw) — but only after the issue exists.

## Bug report template

Copy this template into the issue body and fill it in. The fields match what we need to reproduce the bug.

~~~markdown
### What I'm trying to do
<one or two sentences>

### What happened instead
<what you saw — error, wrong metric, missing file, crash, etc.>

### Reproduction
URL: <public URL that triggers the bug>

Command:
```
sitespeed.io <full command, secrets redacted>
```

Script (if scripting): attach the .js / .mjs / .ts file or paste it here.

### Environment
- sitespeed.io version: <`sitespeed.io --version`>
- Install method: <Docker image tag | npm global | npm local>
- OS: <macOS 14.5 | Ubuntu 24.04 | …>
- Browser + version: <Chrome 143 | Firefox 149 | …> (skip if using the Docker image)

### Logs and artifacts
- Full log (`-vv`): <pasted below or gist link>
- Original video (`--videoParams.keepOriginalVideo`): <attached / link> — only for video / Visual Metrics bugs
- Chrome perflog (`--chrome.collectPerfLog`): <attached / link> — only for HAR bugs

<paste log here, or link to a gist>
~~~

When everything in the template is filled in, the bug is reproducible — and reproducible bugs get fixed.
