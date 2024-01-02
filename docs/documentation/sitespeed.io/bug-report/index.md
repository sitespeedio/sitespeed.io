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

<b>TL;DR - Please create a reproducible bug report!</b>

* Lets place the TOC here
{:toc}

## We love a new bug report
We love when you create a new issue for sitespeed.io! We really do. New issues helps us getting the project better and it will help other users. In other words, we love issues.

Sometimes we get a really detailed issue: You describe exactly how you do when you get the problem, you share the log, you write down what you have tested, share screenshots, share videos. You even tries to understand why you get this bug. When we get an issue like that, it always jump to my number one prioritization. If you put down all the time and effort to really describe the issue, we want to put all our effort to fix it.

It also happens (quite often) that we get issues that misses important information, so we need to ask you again and again about the problem (like how to reproduce the issue). Sometimes we need to do that two/three/four times within that issue. Issues that misses vital information takes longer time to fix/close and that makes us spend more time asking questions instead of fixing actual bugs or creating new functionality. 

We use a [issue template](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/.github/ISSUE_TEMPLATE.md) with a comment of what we need write but it seems that is not the best way so let us instead show you what we need!

Before you start creating a issue, you should make sure you have read through our [F.A.Q and Best Practice](https://www.sitespeed.io/documentation/sitespeed.io/best-practice/).

## Explain how to reproduce your issue
The best way to make sure we can fix your issue, is to make sure we can reproduce the problem you have. If we can reproduce the problem, we can verify that we actually have fixed it with our code change.

**Exactly** what do we mean by making it reproducible? We should be able to copy/paste your example CLI parameters and try on our local machine and then get the same problem that you have.

To help us reproduce your problem there are a couple of things we need:

* Show us exactly how you run your tests (all parameters, all configuration). Mask out any passwords. But please do not leave out things from the configuration!
* If you run [scripting to measure a user journey](https://www.sitespeed.io/documentation/sitespeed.io/scripting/) please please please include the script so we can run it the same way you run it! That will make it possible for us to reproduce your issue and help us a lot!
* Include the URL that causes the problem. If the URL isn't public, please try to reproduce the problem on another URL that we can test. If the URL is super secret, you can share that to us in an email (write it in the issue and you can get the address). But we prefer public URLs so others also can reproduce the problem.
* Include the log output from your run. Please do not take a screenshot of the log, instead share the log as text either in the issue or in a [gist](https://gist.github.com/). 
* Give us the exact version of sitespeed.io you are using (so we know we use the same version when we try to reproduce it).
* Tell us what OS you are using and if you are using Docker give us the base OS where you run your container. 
* If you don't use Docker: Include the browser version you are using.
* If you have problems with headers/cookie/auth you can use [https://httpbin.org](https://httpbin.org) to reproduce your issue.

If you make your issue reproducible, the issue is the cream of the crop and will get the tag <span class="reproducible">reproducible</span>! And if your bug report has that tag, it will get our attention.

## What else you can do

* Best case you can fix the issue and send us a PR with a fix. We love PR for bugs :) But of course that is only best case scenario.

* Search current [GitHub issues](https://github.com/sitespeedio/sitespeed.io/issues). Is this bug reported before? Does it lack info? Please add your own comment to that issue if it is open. If you aren't sure that your bug is the same as the other bug, please create another issue. Do not hijack issues. Do not comment on closed issue, please create a new issue instead and add a reference to the old issue.

* Is there a problem with the video or the metrics from the video? Then make sure to enable the full original video so you can share that with us, do that by adding <code>--videoParams.keepOriginalVideo</code> to your run. Look in the *video* folder for that URL and you will see a video named *1-original.mp4*. Please share that video with us, then we can more easily reproduce/understand the problem.

* Do you think this is somehow related to Docker (generic Docker issues etc)? Then please [search](https://duckduckgo.com/) for the that problem or head over to [forums.docker.com](https://forums.docker.com/) and have a look there first.

* Is your problem related to that you are behind a proxy? Then we kindly recommend that you run your tests without a proxy. Run the tests on a network where you don't need to use a proxy.

## How we prioritise bugs

If a issue is bug that breaks functionality for many users and you make a *reproducable* test case/show us exactly how you run, we will try to fix that bug.

If you do not agree with our prioritization you can:
* Explain the issue better and make sure we can reproduce your issue
* Do the PR yourself. We can help you test and verify it.
* Support us at [Open Collective](https://opencollective.com/sitespeedio). We can not promise we will fix your issue but it will increase the chance of getting it fixed.
s
## How to make sure we try fix the bug as soon as possible

Here's dos and don'ts if you want your bug fixed:

Please do:
* [Provide a reproducible test case](#explain-how-to-reproduce-your-issue).
* If you don't get a response in a couple of days, write a message in the [general channel in Slack](https://join.slack.com/t/sitespeedio/shared_invite/zt-296jzr7qs-d6DId2KpEnMPJSQ8_R~WFw).

Please don't:
* Contact us on direct messages on Slack about the bug.
* Contact us on Twitter about the bug.
* Contact us on email about the bug.

If we ask you to contact us, then it is perfectly fine to do so :)
