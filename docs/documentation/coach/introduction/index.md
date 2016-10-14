---
layout: default
title: Coach
description:
keywords: coach, documentation, web performance
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---
[Documentation]({{site.baseurl}}/documentation/coach/) / Introduction

# The Coach - Introduction
{:.no_toc}

* Lets place the TOC here
{:toc}


## Do my page need coaching?

You know, it's hard to get everything right! The world is complex: HTTP/1 vs HTTP/2. Some of the previous performance best practices are now worst practices. The coach will detect that the page is accessed using HTTP/2, and adjust its advice accordingly.


## Why we love the coach
Ten reasons why we love the coach:

 - The coach gives you advice on how to make your page faster. The coach aims to NEVER give you bad advice. Follow the advice and you will WIN!
 - HTTP/1 or HTTP/2? That's no problem, the coach adjust the advice accordingly.
 - The coach uses real browsers to see your page exactly like your users do.
 - Every advice has one or more unit-tests to make sure it's easy to change advice in the future.
 - The coach knows about more than just performance: Accessibility and web best practice are other things that the coach can help you with.
 - You can integrate the coach with your own web performance tool. It's easy: your tool only need to be able to run JavaScript in the browser and produce a HAR file. Or you can use the built-in functionality of the coach to run the browser.
 - The coach is open-source. The advice is public, you can check it and change it yourself. Help us make the coach even better!
 - The coach can combine knowledge from the DOM with HAR to give you super powerful advice.
 - The CLI output is pretty nice. You can configure how much you want to see. Use it as fast way to check the performance of your page.
 - The coach is a part of sitespeed.io 4.0 and it will be awesome!

## Work in progress!
We know you want the coach to help you but right now YOU need to help the coach! The coach is new and need more advice. Send a PR with a new advice, so the coach gets more knowledge! Check out the [issues](https://github.com/sitespeedio/coach/issues), try the project and give us feedback! In a couple of months we will release 1.0.
