---
layout: default
title: sitespeed.io 5.1
description: We have had some problems for a while with the video from Firefox containing black borders as well as setting viewport in Firefox didn't work perfectly with the video. That is fixed in 5.1!
authorimage: /img/aboutus/peter.jpg
intro: We have had some problems for a while with the video from Firefox containing black borders as well as setting viewport in Firefox didn't work perfectly with the video. That is fixed in 5.1!
keywords: sitespeed.io, sitespeed, release, 5.1
nav: blog
---

# Video fixes for Firefox

One problem we have had since we introduced video is that Firefox videos contained black borders. Not perfect (but it wasn't affecting metrics). Setting the viewport larger than the default also made the video look broken. That is all fixed in 5.1, so we can have full quality videos from Firefox. "Skål och hurra!" as we say in Sweden.

# Basic Auth in Chrome

In the new release we support testing sites behind Basic Auth as long as you use Chrome (Firefox support will come in Firefox 54 as long as [Tobias fix in Selenium for running WebExtensions in Firefox](https://github.com/SeleniumHQ/selenium/pull/3846) gets released). Use <code>--basicAuth username@password</code>.

# Other notable changes

* Added a new script /tools/combineVideos.sh to combine two videos into one. If you haven't tried this yet you should really try this out!
* Show backEndTime in Summary Timings (to make it easy to find runs with same backEndTime).
* If WebPageTest fails we always log the WebPageTest id so you easily can backtrack the error.

Checkout the full [Changelog](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md) for all changes.
/Peter
