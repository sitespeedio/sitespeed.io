---
layout: default
title: Sitespeed.io - Release notes 3.1
description: The new sitespeed.io has support for driving multiple WebPageTest locations/browsers/connectivity and choose to collect metrics using PhantomJS or SlimerJS.
author: Peter Hedenskog
keywords: sitespeed.io, release, release-notes, 3.1
nav:
image:  https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: The new sitespeed.io has support for driving multiple WebPageTest locations/browsers/connectivity and choose to collect metrics using PhantomJS or SlimerJS.
---

# Sitespeed.io 3.1
After releasing 3.0 we felt that there was one big thing that we missed. You could only run one location/browser or use one connectivity per run when fetching data from WebPageTest! We have fixed that in 3.1

## Run multiple locations of WebPageTest
You can now test multiple locations/browesers/connectivities for WebPageTest in one and the same run for sitespeed.io. You do that with the <code>wptConfig</code> parameter. If you want to run multiple instances, configure an array with different configurations:

~~~
[
  {
    "location": "Dulles:Firefox",
    "connectivity": "3G"
  },
  {
    "location": "Dulles:Chrome",
    "connectivity": "Cable"
  }
]
~~~

Running only one, you can do as before and only configure one configuration object:

~~~
{
  "location": "Dulles:Firefox",
  "connectivity": "3G"
}
~~~

Everything will work as before except that the keys in Graphite for WebPageTest will include location, browser and connectivity meaning after you installed the new version you need to go into your grafical interface (Grafana) and change the keys for WebPageTest.


## Hello SlimerJS!

We cannot tell you have much love we have for PhantomJS! To show it, we also include support for <a href="http://slimerjs.org/">SlimerJS</a> :)  Slimer is not headless but kind of/or headlessish. You can now choose with the flag <code>headless</code> which backend to use (PhantomJS is the default one). Another change is that collecting timing metrics using the headless alternative is made by configuring <code>-b headless</code> and will use the backend you configured with the headless flag.

  Remember: To collect timings using PhantomJS you need the soon coming <a href="https://www.sitespeed.io/documentation/#phantomjs">2.0 version</a>.
