---
layout: default
title: Frequently asked questions for sitespeed.io
description: Questions and answers for sitespeed.io.
keywords: sitespeed.io, faq, questions, frequently, asked
nav: faq

---

# FAQ
{:.no_toc}

If you don't find the answer here or in the [documentation]({{site.baseurl}}/documentation/), please ping us on [Twitter](https://twitter.com/SiteSpeedio) or add an issue on [Github](https://github.com/sitespeedio/sitespeed.io/issues?state=open).

* Lets place the TOC here
{:toc}

## Should I use TSProxy or tc as connectivity engine?
If you run our Docker containers (and you really should do that) it seems that you get more stable values using the tc. We use that on the [dashboard](https://dashboard.sitespeed.io). However the Chrome team uses TSProxy in some of their test tools, so it should be good. But testing on Linux/MacOS X it seems like the [numbers differs](https://github.com/WPO-Foundation/tsproxy/issues/10). Help us if you see the same!

## Chrome doesn't work on RHEL7 (or some other *nix flavor)
Make Chrome run without the sandbox and it will work. Pass the following argument to sitespeed.io:

~~~ bash
--browsertime.chrome.args no-sandbox
~~~

## Running Sitespeed 4.0 with Docker + Proxy + Custom Login Script + Create Custom Folder (date/time stamped)?

Thank you [Keyur Shah](https://github.com/softwareklinic) for sharing your setup:

"Here is an example that finally worked for me with lot of tweaks that runs using the Sitespeed 4.0 docker, behind corporate proxy, saving the HTML summary reports in customer folder marked with date/timestamp and avoiding the HAR trigger error by using the --browsertime.pageCompleteCheck option with custom javascript

 Below is a cron job definition that runs ever 45th minute of an hour:
"

~~~ bash
 45 * * * * docker run --privileged -v /app/sitespeed.io:/sitespeed.io sitespeedio/sitespeed.io <url|text file with list of urls> --preScript prescript.js -n 1 -b firefox  --graphite.host <graphiteip-host> --graphite.namespace <graphite-namespace>  --browsertime.proxy.http=proxy.xxxx.xxxxxxxx.com:80 --browsertime.proxy.https=proxy.xxxx.xxxxxxxx.com:80 --outputFolder sitespeed-result/<customfoldername>/$(date +\%Y-\%m-\%d-\%H-\%M-\%S) --browsertime.pageCompleteCheck 'return (function() {try { return (Date.now() - window.performance.timing.loadEventEnd) > 10000;} catch(e) {} return true;})()'
~~~


## I can't get Firefox to work in Docker on Digital Ocean what's wrong?
Do you get a lot of "Browser failed to start in time, trying one more time." in your log? There's some kind of problem with the "One click app" for Docker 1.12.3 and Ubuntu, it makes Firefox crash. However if you install Ubuntu 16 standalone and then manually installs Docker, it works fine.
