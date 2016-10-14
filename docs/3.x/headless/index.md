---
layout: default
title: Headless - Documentation - sitespeed.io
description: Collect browser timings headless using sitespeed.io.
keywords: headless, documentation, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Collect browser timings headless using sitespeed.io.
---
[Documentation 3.x](/documentation/) / Headless

# Headless
{:.no_toc}

* Lets place the TOC here
{:toc}

## Headless using Xvfb

 If you run on Linux and want to emulate a screen (a.k.a running a browser without a screen), you need to do this before running:

* Install [Xvfb](http://www.x.org/releases/current/doc/man/man1/Xvfb.1.xhtml).
* Setup a start script, checkout how we do it in our   [Docker container](https://github.com/sitespeedio/sitespeed.io-docker/blob/master/all/scripts/start.sh).


## PhantomsJS 2
[PhantomJS](http://phantomjs.org/) is used by default when validating the web performance best practice rules. Soon (!) we will upgrade to the (almost) released 2.0 version. If you want to try out the 2.0 and use it when you run sitespeed.io, do like this:

* Follow [these](https://github.com/ariya/phantomjs/wiki/PhantomJS-2) instructions to build PhantomJS 2 or [download](https://bitbucket.org/ariya/phantomjs/downloads) the compiled versions.
* Run sitespeed.io and configure it to use your own version of PhantomJS

~~~bash
sitespeed.io -u https://www.sitespeed.io --phantomjsPath /the/path/to/your/bin
~~~

* If you also want to collect timings using PhantomJS, run it like this:

~~~bash
sitespeed.io -u https://www.sitespeed.io --phantomjsPath /the/path/to/your/bin -b headless
~~~

We have tested PhantomJS 2 on Mac OS X and it works really good when testing the site against the best practice rules. However, it seems to be a couple of timings that don't work as expected. If you have time to test and find things that don't work, please let us know and we will update the docs. We aim to give this more love when the stable 2.0 is released.
{: .note .note-warning}

## SlimerJS
SlimerJS is kind of headless, but you will need Xvfb to have it real headless. Run it like this to collect timing metrics:

~~~bash
sitespeed.io -u https://www.sitespeed.io --headless slimerjs -b headless
~~~
