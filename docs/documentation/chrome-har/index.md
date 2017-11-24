---
layout: default
title: Chrome HAR
description: Create Chrome HAR files bases on events from the Chrome Debugging Protocol.
keywords: Chrome HAR, documentation, web performance
author: Peter Hedenskog
nav: documentation
category: chrome-har
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

# Chrome-HAR
{:.no_toc}

Create [HAR](http://www.softwareishard.com/blog/har-12-spec/) files based on [Chrome Debugging Protocol](https://developer.chrome.com/devtools/docs/debugger-protocol) data.

Code originally extracted from [Browsertime](https://github.com/sitespeedio/browsertime), initial implementation inspired by [Chromedriver_har](https://github.com/woodsaj/chromedriver_har).


## Introduction

Chrome-HAR is for tool makers: Get the log from the Chrome Debugging Protocol and use Chrome-HAR to parse it to a HAR.

## Example

Convert your messages to a HAR file.

~~~
const parser = require('chrome-har');

// you already have the message from Chrome Debugging Protocol

parser.harFromMessages(messages))
 .then(har => {
   // do whatever you want with the HAR file
 })
~~~
