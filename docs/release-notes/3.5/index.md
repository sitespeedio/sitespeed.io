---
layout: default
title: Sitespeed.io - Release notes 3.5
description: New key structure for the URL:s in Graphite.
author: Peter Hedenskog
keywords: sitespeed.io, release, release-notes, 3.5
nav:
image:  https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: New key structure for the URL:s in Graphite.
---

# Sitespeed.io 3.4 & 3.5
Two kind of big releases in the same week with two important new things:

 * The Graphite keys that represents the URL:s has been reworked (thanks [@JeroenVdb](https://github.com/JeroenVdb)) and changed from the pattern *http.www.my.host._my_path_* to instead be *http.www_my_host._my_path_* that now makes it much easier to summarize stats on domain level. The bad news is that you yourself need to change/add the new keys to your graph where you show individual page metrics.
 We are really sorry for that, but its a great win in the long run. And it is needed for one really cool and awesome thing that we will release sometimes next week :) If you need any help, just tweet [us](https://twitter.com/SiteSpeedio) and we will help you!

 * Custom wait scripts is now implemented for PhantomJS/SlimerJS and all the browsers. What? You can now configure when to end your test. If your browser supports the Navigation Timing API (PhantomJS 2 supports that), it will by default wait for the *window.performance.timing.loadEventEnd* event to happen + 2 seconds. The cool thing is that you now can change that and it will affect all different steps of the testing. This will help you if you have a ajax heavy site and there a specific event your are waiting on to happen and you really want to catch. The waitScript needs to return true when the wait is fulfilled, else just return false.

 We haven't updated to PhantomJS 2 yet (since it isn't fully available as binaries on Linux). If you want to use it today across all the tests, you can either use SlimerJS:

~~~bash
sitespeed.io -u http://www.example.com --headless slimerjs -b chrome
~~~

 or install PhantomJS 2 on the side and feed it to sitespeed like this:

~~~bash
sitespeed.io -u http://www.example.com --phantomjsPath /path/to/phantomjs -b chrome
~~~

Doing like that your test will automatically wait for *loadEventEnd* + 2 seconds, and you can choose to configure yourself when to end. You can [read more]({{site.baseurl}}/documentation/browsers/) on what you can configure when you run a test.
