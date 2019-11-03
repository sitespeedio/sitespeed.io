---
layout: default
title: sitespeed.io 11.0  
description: Better configurable HTML output, the new Contentful Speed Index, Firefox Window recoirder and finally no root in Docker.
authorimage: /img/aboutus/peter.jpg
intro:  Better configurable HTML output, the new Contentful Speed Index, Firefox Window recoirder and finally no root in Docker.
keywords: sitespeed.io, browsertime, webperf
nav: blog
---

# sitespeed.io 11.0 

We have just shipped Browsertime 7.0 and sitespeed.io 11.0 with some great contributions from outside of the core team!

A lot of love and extra thanks to:
* [Mason Malone](https://github.com/MasonM) - Mason fixed the long annoying problem of when you are running your test on Linux, the result files are stored as the user root. Masons fix instead pick up the owner of the result directory, and uses that owner. Clever!
* [Thapasya Murali](https://github.com/thapasya-m) - Thapasya have made it possible to configure the summary boxes (on the start result HTML page) and the columns of the pages page. 
* [Denis Palmeiro](https://github.com/dpalmeiro) - Denis added the new metric Contentful speed index and the new Firefox window recorder! 



## Contentful Speed Index
That's a new SI metric developed by Bas Schouten at Mozilla which uses edge detection to calculate the amount of "content" that is visible on each frame. It was primarily designed for two main purposes: 
* Have a good metric to measure the amount of text that is visible. 
* Design a metric that is not easily fooled by the pop up splash/login screens that commonly occur at the end of a page load. These can often disturb the speed index numbers since the last frame that is being used as reference is not accurate. 

## Firefox Window recorder

Denis also added the new Firefox built-in window recorder ([bug 1536174](https://bugzilla.mozilla.org/show_bug.cgi?id=1536174)) that is able to dump PNG images of each frame that is painted to the window. This can be enabled and disabled in the browser console, or through the chrome context with selenium webdriver. This PR introduces a new privileged API that is able to execute JS in the chrome context, as well as support for generating a variable rate MP4 using the output images from the window recorder. The motivation for this work was to introduce a low-overhead video recorder that will not introduce performance disturbances during page loads.

## Configurable result HTML


## Other fixes
Fixed so that you can disable video/visual metrics in your configuration json in Docker as reported in #2692 fixed by PR #2715.