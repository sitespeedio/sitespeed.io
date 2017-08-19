---
layout: default
title: Frequently asked questions for sitespeed.io
description: Questions and answers for sitespeed.io.
keywords: sitespeed.io, faq, questions, frequently, asked
nav: faq

---

# FAQ
{:.no_toc}

If you don't find the answer here or in the [documentation]({{site.baseurl}}/documentation/), please ping us on [Twitter](https://twitter.com/SiteSpeedio) or add an issue on [GitHub](https://github.com/sitespeedio/sitespeed.io/issues?state=open).

* Let's place the TOC here
{:toc}

## Should I use TSProxy or tc as the connectivity engine?
No, you should always use the Docker network setup described [here]({{site.baseurl}}/documentation/sitespeed.io/browsers/#change-connectivity).

## Chrome doesn't work on RHEL7 (or some other \*nix flavor)
Make Chrome run without the sandbox and it will work. Pass the following argument to sitespeed.io:

~~~ bash
--browsertime.chrome.args no-sandbox
~~~

When you use our Docker container, that argument is set by default.

## How can I disable HTTP/2 (I only want to test HTTP/1.x)?
On Chrome, you just add the switches <code>--browsertime.chrome.args no-sandbox --browsertime.chrome.args disable-http2</code>.

For Firefox, you need to turn off HTTP/2 and SPDY, and you do that by setting the Firefox preferences:
<code>--browsertime.firefox.preference network.http.spdy.enabled:false --browsertime.firefox.preference network.http.spdy.enabled.http2:false --browsertime.firefox.preference network.http.spdy.enabled.v3-1:false</code>

## Running Sitespeed 4.0 with Docker + Proxy + Custom Login Script + Create Custom Folder (date/time stamped)?

Thank you [Keyur Shah](https://github.com/softwareklinic) for sharing your setup:

"Here is an example that finally worked for me with lot of tweaks that runs using the Sitespeed 4.0 docker, behind corporate proxy, saving the HTML-summary reports in customer folder marked with date/timestamp, and avoiding the HAR trigger error by using the --browsertime.pageCompleteCheck option with custom javascript

 Below is a cron-job definition that runs every 45th minute of an hour:
"

~~~ bash
 45 * * * * docker run --privileged -v /app/sitespeed.io:/sitespeed.io sitespeedio/sitespeed.io <url|text file with list of urls> --preScript prescript.js -n 1 -b firefox  --graphite.host <graphiteip-host> --graphite.namespace <graphite-namespace>  --browsertime.proxy.http=proxy.xxxx.xxxxxxxx.com:80 --browsertime.proxy.https=proxy.xxxx.xxxxxxxx.com:80 --outputFolder sitespeed-result/<customfoldername>/$(date +\%Y-\%m-\%d-\%H-\%M-\%S) --browsertime.pageCompleteCheck 'return (function() {try { return (Date.now() - window.performance.timing.loadEventEnd) > 10000;} catch(e) {} return true;})()'
~~~
