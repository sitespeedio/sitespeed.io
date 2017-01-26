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

## I can't get Firefox to work in Docker on Digital Ocean what's wrong?
Do you get a lot of "Browser failed to start in time, trying one more time." in your log? There's some kind of problem with the "One click app" for Docker 1.12.3 and Ubuntu, it makes Firefox crash. However if you install Ubuntu 16 standalone and then manually installs Docker, it works fine.
