---
layout: default
title: sitespeed.io 20.0
description: New updates to sitespeed.io to make it easier to use.
authorimage: /img/aboutus/peter.jpg
intro: Make sure to upgrade your Graphite metrics (if you didn't do that already in April) before you upgrade to 20.0.0.
keywords: sitespeed.io, webperf
image: https://www.sitespeed.io/img/8bit.png
nav: blog
---

# sitespeed.io 20.0

Do you remember that we asked you to [upgrade your Graphite metrics](https://www.sitespeed.io/sitespeed.io-17.0-browsertime-12.0/#new-best-practices) in April earlier this year? If you didn't do it that time, you really should do it before you upgrade to sitespeed.io 20.0.0. Follow the [guide](https://www.sitespeed.io/documentation/sitespeed.io/graphite/#upgrade-to-use-the-test-slug-in-the-namespace) and after that upgrade to 20.0.0.

If you feel that you don't have time today, you can supress the change by adding `--graphite.addSlugToKey false` to your test. Please do that, else your metrics will be reported under a new key structure when you upgrade to 20.0.


We also took the chance in 20.0 and made a couple of other breaking changes to make it easier for you to run your tests:

* [Throttle](https://github.com/sitespeedio/throttle) is the default connectivity engine if you use Mac or Linux [#3433](https://github.com/sitespeedio/sitespeed.io/pull/3433). This makes it much easier to enable throttling. Our Docker container is not affected by this change.
* There's a new default mobile `--mobile` for Chrome. The new default is Moto G4 (instead of iPhone 6) [#3467](https://github.com/sitespeedio/sitespeed.io/pull/3467).
* When you run your tests on Safari on iOS the Coach is disabled by default [#3468](https://github.com/sitespeedio/sitespeed.io/pull/3468).


Happy performance testing!

/Peter