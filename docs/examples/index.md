---
layout: default
title: Example of a sitespeed.io run.
description: Here is examples of what the result looks like, when you run sitespeed.io.
keywords: sitespeed.io, examples, results, wpo, web performance optimization
nav: examples
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
---

# Examples sitespeed.io

Analyzing two pages using Chrome looks like this:

~~~ bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -c cable -b chrome --video --speedIndex https://en.wikipedia.org/wiki/Main_Page https://en.wikipedia.org/wiki/Barack_Obama
~~~

Gives the following [report](http://examples.sitespeed.io/4.2/2016-12-14-13-24-05/). Checkout our [example dashboard](https://dashboard.sitespeed.io) to see what it looks like to use sitespeed.io to continuously measure performance.
