---
layout: default
title: F.A.Q. and best practice using sitespeed.io
description: Here we keep questions that gets asked on our Slack channel or frequently on GitHub.
keywords: best practice, faq
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / F.A.Q. and Best Practice

# F.A.Q and Best Practice
{:.no_toc}

* Lets place the TOC here
{:toc}

Here we keep questions that are frequently asked at [Slack](https://sitespeedio.herokuapp.com/) or at [GitHub](https://github.com/sitespeedio/sitespeed.io/issues/new).

## Running tests
Read this before you start to collect metrics.

### How do I test cached pages?
How do I test cached pages? The easiest way to do that is to use the `--preURL` parameter:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --preURL https://www.sitespeed.io/documentation/ https://www.sitespeed.io/
~~~

In the example the browser will first go to https://www.sitespeed.io/documentation/ and then with a primed cache navigate to https://www.sitespeed.io/. You can also use [scripting](../scripting/) if you don't mind writing code.

### How do I set a cookie?
You can add a cookie is by using <code>--cookie name=value</code> where the name is the name of the cookie and the value ... the value :) The cookie will be set on the domain that you test. You can also use  <code>--requestheader</code>  to set the cookie in the request header. If you use Chrome you can also us the [Chrome Devtools Protocol in scripting](/documentation/sitespeed.io/scripting/#chrome-devtools-protocol) for more complicated use cases.

### How do I test multiple pages in the same run?

If you want to test multiple URLs, you can used line them up in the cli:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io https://www.sitespeed.io/documentation/
~~~

You can also use a plain text file with one URL on each line. Create a file called urls.txt (but you can call it whatever you want):

~~~
http://www.yoursite.com/path/
http://www.yoursite.com/my/really/important/page/
http://www.yoursite.com/where/we/are/
~~~

Another feature of the plain text file is you can add aliases to the urls.txt file after each URL. To do this, add a non-spaced string after each URL that you would like to alias:

~~~
http://www.yoursite.com/ Start_page
http://www.yoursite.com/my/really/important/page/ Important_Page
http://www.yoursite.com/where/we/are/ We_are
~~~

And then you give feed the file to sitespeed.io:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} urls.txt
~~~

### How many runs should I do on the same page to get stable metrics?
How many runs depends on your site, and what you want to collect. Pat told us about how he is doing five runs when testing for Chrome. Hitting a URL 3-5 times is often ok when you want to fetch timing metrics, but increasing to 7-11 can give better values. Start low and if you see a lot of variations between runs, increase until you get some solid values.

Getting timing metrics is one thing, but it’s also important to collect how your page is built. You need to keep track of the size of pages, how many synchronously loaded JavaScript you have and so on. For that kind of information you only need one run per URL.

You should also try out our new setup with [WebPageReplay](../webpagereplay/).

### I want to test a user journey (multiple pages) how do I do that?
Checkout the [scripting capabilities](../scripting/) that makes it easy to test multiple pages.

### I want to test on different CPU speeds how do I do that?
If you use Chrome you can use <code>--chrome.CPUThrottlingRate</code>. However there's a bug in Chromedriver so this only works if you run with the `--headless` parameter.

### Throttle or not throttle your connection?
**PLEASE, YOU NEED TO ALWAYS THROTTLE YOUR CONNECTION!** You should always throttle/limit the connectivity because it will make it easier for you to find regressions. If you don't do it, you can run your tests with different connectivity profiles and regressions/improvements that you see is caused by your servers flaky internet connection. Check out our [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity/).

### Clear browser cache between runs
By default Browsertime creates a new profile for each iteration you do, meaning the cache is cleared through the webdriver. If you really want to be sure sure everything is cleared between runs you can use our WebExtension to clear the browser cache by adding  <code>--browsertime.cacheClearRaw</code>.

That means if you test *https://www.sitespeed.io* with 5 runs/iterations, the browser cache is cleared between each run, so the browser has no cached assets between the runs.

When you run <code>--preURL</code> the browser starts, then access the preURL and then the URL you want to test within the same session and not clearing the cache. Use this if you want to measure more realistic metrics if your user first hit your start page and then another page (with responses in the cache if the URL has the correct cache headers).

If you use the <code>--preScript</code> or <code>--multi</code> feature, it is the same behavior, we don't clear the cache between the URL you want to test.

### My pre/post/scripting script doesn't work?
We use Selenium pre/post script navigation. You can [read more](/documentation/sitespeed.io/prepostscript/) about of our pre/post script setup and focus on the [debug section](/documentation/sitespeed.io/prepostscript/#debuglog-from-your-script) if you have any problem.

If you have problem with Selenium (getting the right element etc), PLEASE do not create issues in sitespeed.io. Head over to the [Selenium community](https://docs.seleniumhq.org/) and they can help you.

### How do you pass HTML/JavaScript as a CLI parameter?
The easiest way to pass HTML to the CLI is to pass on the whole message as a String (use a quotation mark to start and end the String) and then do not use quotation marks inside the HTML.

Say that you want to pass on your own link as an annotation message, then do like this:

~~~
--graphite.annotationMessage "TEXT <a href='https://github.com/***' target='blank'>link-text</a>"
~~~

If you need to debug CLI parameters the best way is to turn on verbose logging. Do that by adding **-vv** to your run and check the log for the message that starts with **Config options**. Then you will see all parameters that gets from the CLI to sitespeed.io and that they are interpreted the right way.


### I want a JSON from Browsertime/Coach other tools, how do I get that?
There's a plugin bundled with sitespeed.io called *analysisstorer* plugin that isn't enabled by default. It stores the original JSON data from all analyzers (from Browsertime, Coach data, WebPageTest etc) to disk. You can enable this plugin:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --plugins.add analysisstorer
~~~

The JSON files for the whole run (summary files) will end up in *$RESULT/data/*. JSON for each individual page is stored in *$RESULT/data/pages/$PAGE/data/*.

### How do I test pages with #-URLS?
By default the # part of a URL is stripped off from your page. Yep we know, it isn't the best but in the old days the # rarely added any value and crawling a site linking to the same page with different sections made you test the same page over and over again.

If you have pages that are generated differently depending of what's after you #-sign, you can use the <code>--useHash</code> switch. Then all pages will be tested as a unique page.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --useHash https://www.sitespeed.io/#/super
~~~

You can also use the <code>--urlAlias</code> if you want to give the page a friendly name. Use it multiple times if you have multiple URLs.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --useHash --urlAlias super --urlAlias duper https://www.sitespeed.io/#/super https://www.sitespeed.io/#/duper
~~~


### Running tests from multiple locations
Can I test the same URLs from different locations and how do I make sure they don't override each others data in Graphite?

You should set different namespaces depending on location (`--graphite.namespace`). If you run one test from London, set the namespace to <code>--graphite.namespace sitespeed_io.london</code>. Then you can choose individual locations in the dropdown in the pre-made dashboards.

### Google Web Vitals
To get Googles Web Vitals in your tests you need to use Chrome. sitespeed.io collects: First Contentful paint, Largest contentful paint, Cumulative Layout Shift, First Input Delay/Total Blocking time. 

A good thing is to calibrate your test with the Chrome User Experience report data. Do that by run the [CrUx plugin](/documentation/sitespeed.io/crux/) and then try to tune what kind of connectivity setting you use and compare First and Largest contentful paint.

To calibrate the Cumulative layout shift its good to [use scripting](/documentation/sitespeed.io/scripting/) and go to the page and [scroll the page](/documentation/sitespeed.io/scripting/#scroll-the-page-to-measure-cumulative-layout-shift).

First Input Delay/Total Blocking time is harder. The best way is to test on a real mobile phone, preferable an older Android phone like Moto G5.

### Google Page Speed Insights vs Lighthouse vs Chrome User Experience Report plugins

It's a little bit confusing, what tool should you use and how do they work? [*Google Page Speed Insight plugin*](/documentation/sitespeed.io/google-page-speed-insights/) runs Lighthouse on Google servers and also collect Chrome User Experience data. If you run the [*Lighthouse plugin*](/documentation/sitespeed.io/lighthouse/) Lighthouse will run on your own machine. The [*Chrome User Experience Report plugin*](/documentation/sitespeed.io/crux/) collects data from the CrUx API that is collected from real Chrome users that access the website AND have the sync feature turned on in Chrome (=accepting Google collect the metrics).

## Store the data
By default you can choose to store your metrics in a time series database (Graphite or InfluxDB).

### Should I choose Graphite or InfluxDB?
If your organisation is running Graphite, use that. If you're used to InfluxDB, use that. If you don't use any of them then use Graphite since we have more ready made dashboards for Graphite.

### Handling big amount of data
sitespeed.io will generate lots of metrics and data, how do I handle that?

#### Configuring features
If you you want to store less data from sitespeed.io one way is to configure and compress data more.

The heaviest data that sitespeed.io generates is the video, screenshot and video filmstrip screenshots. You can disable those features but it will make it harder for you to verify that everything works ok and to pinpoint regressions.

If you have limited space (and do not store the data on S3 or in GCS and configure it to automatically remove old data) you can use the following configurations.

##### Video
You can change the [Constant rate factor](https://trac.ffmpeg.org/wiki/Encode/H.264#crf). Default is 23. If you change that you can have videos with lower quality but it will take less space. Use <code>--browsertime.videoParams.crf</code>.

You can also change the quality of the video filmstrip screenshots. Default it is set to 75 but you can set a value between 0 - 100. Use <code>--browsertime.videoParams.filmstripQuality</code>.

If you dont use the filmstrip (at the moment the filmstrip screenshots isn't used within the sitespeed.io result pages) you can disable it. <code>--browsertime.videoParams.createFilmstrip false</code> will disable the filmstrip.

##### Screenshot
If you want to decrease the size of the screenshots, you should first enable screenshots with jpg instead of png. <code>--screenshot.type jpg</code> will do that.

You can then also set the jpg quality. Default is 80 but you can set the value between 0-100. Use <code>--screenshot.jpg.quality</code>.

As a last thing: You can set the max size of the screenshot (in pixels, max in both width and height). Default is 2000 meaning you the screenshot will probably be full sized (depending on how you configured your viewport). Change it with <code>--screenshot.maxSize</code>.

#### Disabling features/plugins
Another alternative to minimize the amount of data is to disable plugins. You should be really careful doing that since it will make it harder for you to verify that everything works ok and to pinpoint regressions.

You can list which plugins that are running by adding the flag <code>--plugins.list</code> and in the log you will see something like.

~~~
INFO: The following plugins are enabled: assets, browsertime, budget, coach, domains, harstorer, html, metrics, pagexray, screenshot, text, tracestorer
~~~

If you want to disable the screenshot plugin (that stores screenshots to disk) you do that by adding <code>--plugins.remove screenshot</code>.

#### Graphite
Make sure to edit your *storage-schemas.conf* to match your metrics and how long time you want to keep them. See [Graphite setup in production]({{site.baseurl}}/documentation/sitespeed.io/performance-dashboard/#setup-important).

#### S3 and GCS
When you create your buckets at S3 or GCS, you can configure how long time it will keep your data (HTML/screenshots/videos). Make it match how long time you keep your metrics in Graphite or how long back in time you think you need it. Usually that is shorter than you think :) When you find an regression (hopefully within an hour or at least day) you want to compare that data with what it looked like before. Storing things in the bucket for 2 weeks should be ok, but you choose yourself.

## Alerting

We've been trying out alerts in Grafana for a while and it works really good for us. Checkout the [alert section]({{site.baseurl}}/documentation/sitespeed.io/alerts/) in the docs.

## Difference in metrics between WebPageTest and sitespeed.io
Now and then it pops up an issue on GitHub where users ask why some metrics differs between WebPageTest and sitespeed.io.

There's a couple of things to know that differs between WebPageTest and Browsertime/sitespeed.io but first I wanna say that it is wrong to compare between tools, it is right to continuously compare within the same tool to find regressions :)

WPT and sitespeed.io differs by default when they end the tests. WPT ends when there hasn't been any networks traffic for 2 seconds (if I remember correctly). sitespeed.io ends 2 seconds after loadEventEnd. Both tools are configurable.

WebPageTest on Windows (old version) records the video with 10 fps. 5.x of sitespeed.io uses 60 fps, coming sitespeed.io 6.0 will have 30 fps per default. New WebPageTest on Linux will have 30 fps per default. Running 60 fps will give you more correct numbers but then you need to have a server that can record a video of that pace.

And a couple of generic things that will make your metrics differ:

 * **Connectivity matters** -  You need to set the connectivity.
 * **CPU matters** -  Running the same tests with the same tool on different machines will give different results.
 * **Your page matters** - It could happen that your page has different sweat spots on connectivity (that makes the page render faster) so even a small change, will make the page much slower (we have that scenario on Wikipedia).
