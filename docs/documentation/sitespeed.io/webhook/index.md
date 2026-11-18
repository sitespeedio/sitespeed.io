---
layout: default
title: Send the result to a webhook.
description: POST a JSON summary of each run to any URL, to post it to a chat, trigger a CI job or store it.
keywords: webhook, json, teams, jenkins, notification
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Webhook

# Webhook
{:.no_toc}

{:toc}

When the run is finished, sitespeed.io can POST a JSON summary of the run to a URL. Use it to post the result to a chat (for example a Microsoft Teams workflow), trigger a job in Jenkins or another CI server, or store the result in your own system.

sitespeed.io sends the same JSON to every receiver. The receiver decides how to format it, so there are no chat-specific options.

## Configuration

Set the URL with `--webhook.url`:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ --webhook.url "https://example.com/hook?token=SECRET"
~~~

The full URL is used, query string included, so you can keep a token in the URL if your receiver needs one.

## When the message is sent

sitespeed.io sends one message per run, after all tests are done and after the result has been uploaded (S3, GCS, scp or rsync). The result URLs in the message work when it arrives.

If the receiver answers 408, 429 or a 5xx status, or cannot be reached, sitespeed.io tries again three times. If the message still cannot be sent, sitespeed.io logs an error. The exit code of the run does not change.

## The JSON

~~~json
{
  "name": "My test",
  "resultUrl": "https://results.example.com/2026-11-16-07-34-10/index.html",
  "browser": { "name": "Chrome", "version": "157.0.8103.51" },
  "pages": [
    {
      "url": "https://www.sitespeed.io/",
      "resultUrl": "https://results.example.com/2026-11-16-07-34-10/pages/www_sitespeed_io/index.html",
      "googleWebVitals": {
        "ttfb": 211,
        "firstContentfulPaint": 346,
        "largestContentfulPaint": 521,
        "cumulativeLayoutShift": 0,
        "totalBlockingTime": 0
      }
    }
  ],
  "budget": { "working": {}, "failing": {}, "error": {} },
  "errors": []
}
~~~

* **name** - the value of `--name`. Not set if you do not use `--name`.
* **resultUrl** and **pages[].resultUrl** - links to the HTML result. They are only set when you use `--resultBaseURL`.
* **browser** - the browser name and version.
* **pages** - one entry for each tested page. **googleWebVitals** holds the median of each Google Web Vital over all runs, timings in milliseconds. A page tested with an alias also has **alias**.
* **budget** - the [performance budget](/documentation/sitespeed.io/performance-budget/) result, in the same format as `--budget.output json`. Only set when you use a budget.
* **errors** - the errors of the run, as text. An empty list means that the run had no errors.
