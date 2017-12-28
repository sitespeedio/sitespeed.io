---
layout: default
title: How to use the coach.
description: Run the coach in Docker or use npm nodejs.
keywords: coach, documentation, web performance
author: Peter Hedenskog
nav: documentation
category: coach
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---
[Documentation]({{site.baseurl}}/documentation/coach/) / How to

# The Coach - How to use the coach
{:.no_toc}

* Lets place the TOC here
{:toc}

You can use the coach in a couple of different ways.

### Standalone

You need Node.js latest LTS. And you need Chrome and/or Firefox installed.

If you want to use Chrome (Chrome is default):

```bash
webcoach https://www.sitespeed.io
```

Try it with Firefox:

```bash
npm install webcoach -g && webcoach https://www.sitespeed.io --browser firefox
```

Or if you prefer Docker:

```bash
docker run sitespeedio/coach:{% include version/coach.txt %} https://www.sitespeed.io
```

If you also want to show the offending assets/details and the description of the advice:

```bash
webcoach https://www.sitespeed.io --details --description
```

By default, the coach only tells you about advice where you don't get the score 100. You can change that. If you want to see all advice, you can do that too:

```bash
webcoach https://www.sitespeed.io --limit 101
```

If you want to test as a mobile device, that's possible too, by faking the user-agent.

```bash
webcoach https://www.sitespeed.io --mobile -b chrome
```


> ... but hey, I want to see the full JSON?

Yes, you can do that!

```bash
webcoach https://www.sitespeed.io -f json
```
This will get you the full JSON, the same as if you integrate the coach into your tool.

### Bookmarklet

We also produce a bookmarklet. The bookmarklet only uses advice that you can run inside the browser (it doesn't have HAR file to analyze even though maybe possible in the future with the Resource Timing API).

The bookmarklet is really rough right now and logs the info to the browser console. Help us make a cool front-end :)

You can generate the bookmarklet by running

```bash
grunt bookmarklet
```

and then you will find it in the dist folder.

### Include in your own tool
The coach uses Browsertime to start the browser, execute the Javascript and fetch the HAR file. You can use that functionality too inside your tool or you can use the raw scripts if you have your own browser implementation.

#### Use built in browser support

In the simplest version you use the default configuration (default DOM and HAR advice and using Firefox):

```javascript
const api = require('webcoach');
const result = api.run('https://www.sitespeed.io');
```

The full API method:

```javascript
// get the API
const api = require('webcoach');
const result = api.run(url, domScript, harScript, options);
```

#### Use the scripts
Say that your tool run on Windows, you start the browsers yourself and you generate your own HAR file. Create your own wrapper to get the coach to help you.

First you need the Javascript advice, you can get the raw script either by generating it yourself or through the API.

Generate the script

```bash
grunt combine
```
and it will be in the dist folder.

Or you just get it from the API:

```javascript
// get the API
const api = require('webcoach');
// get the DOM scripts, it's a promise
const domScriptPromise = api.getDomAdvice();
```

Take the <em>domScript</em> and run it in your browser and take care of the result.

To test the HAR you need to generate the HAR yourself and then run it against the advice.

```javascript
const api = require('webcoach');
// You read your HAR file from disk or however you get hold of it
const harJson = //
// if your har contains multiple pages (multiple runs etc) you can use the API
// to get the page that you want
const firstPageHar = api.pickAPage(harJson, 0);
// the result is a promise
const myHarAdviceResultPromise = api.runHarAdvice(firstPageHar, api.getHarAdvice());

```

When you got the result from both the DOM and the HAR you need to merge the result to get the full coach result:

```javascript
// Say that you got the result from the browser in domAdviceResult
// and the HAR result in harAdviceResult
const coachResult = api.merge(domAdviceResult, harAdviceResult);
```

Now you have the full result (as JSON) as a coachResult.

## What do the coach do
The coach will give you advice on how to make your page better. You will also get a score between 0-100. If you get 100 the page is great, if you get 0 you have some work to do!

## How does it all work?

The coach tests your site in two steps:

 * Executes Javascript in your browser and check for performance, accessibility, best practice and collect general info about your page.
 * Analyze the [HAR file](http://www.softwareishard.com/blog/har-12-spec/) for your page together with relevant info from the DOM process.

You can run the different steps standalone but for the best result run them together.

![What the coach do]({{site.baseurl}}/img/coach-explained.png)

## Bonus
The coach knows more than just performance. She also knows about accessibility and web best practice.

### Accessibility
Make sure your site is accessible and useable for every one. You can read more about making the web accessible [here](https://www.marcozehe.de/2015/12/14/the-web-accessibility-basics/).

### Best practice
You want your page to follow best practices, right? Making sure your page is set up for search engines, have good URL structure and so on.

### General information
The world is complex. Some things are great to know but hard for the coach to give advice about.

The coach will then just tell you how the page is built and you can draw your own conclusions if something should be changed.

### Timings
The coach has a clock and knows how to use it! You will get timing metrics and know if you are doing better or worse than the last run.

# Developers guide
Checkout the [developers guide](../developers/) to get a better feeling of how the coach works.

# Browser support
The coach is automatically tested in latest Chrome and Firefox. To get best results you need Chrome or Firefox 48 (or later) to be able to know if the server is using HTTP/2.

We hope that the coach works in other browsers, but we cannot guarantee it right now.
