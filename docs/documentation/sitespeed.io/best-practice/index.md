---
layout: default
title: F.A.Q. and best practice using sitespeed.io
description: Here we keep questions that gets asked on our Slack channel or frequently on Github.
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

Here we keep questions that are frequently asked at [Slack](https://sitespeedio.herokuapp.com/) or at [Github](https://github.com/sitespeedio/sitespeed.io/issues/new).

## Running tests
Read this before you start to collect metrics.

### How do I test cached pages?
How do I test cached pages? The easiest way to do that is to use the **--preURL** parameter:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --preURL https://www.sitespeed.io/documentation/ https://www.sitespeed.io/
~~~

In the example the browser will first go to https://www.sitespeed.io/documentation/ and then with a primed cache navigate to https://www.sitespeed.io/.

### How do I set a cookie?
The current way to set cookies is to add a request header using **-r**. We may want to add specific cookie functionality in the future!

### How do I test multiple pages in the same run?

If you want to test multiple URLs, you can used line them up in the cli:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io https://www.sitespeed.io/documentation/
~~~

You can also use a plain text file with one URL on each line. Create a file called urls.txt (but you can call it whatever uoy want):

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
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} urls.txt
~~~

### How many runs should I do on the same page to get stable metrics?
How many runs depends on your site, and what you want to collect. Pat told us about how he is doing five runs when testing for Chrome. Hitting a URL 3-5 times is often ok when you want to fetch timing metrics, but increasing to 7-11 can give better values. Start low and if you see a lot of variations between runs, increase until you get some solid values.

Getting timing metrics is one thing, but it’s also important to collect how your page is built. You need to keep track of the size of pages, how many synchronously loaded javascript you have and so on. For that kind of information you only need one run per URL.

You should also try out our new setup with WebPageReplay.

### I want to test a user journey (multiple pages) how do I do that?
We currently don't support that but feel free to do a PR in Browsertime.

### I want to test on different CPUs how do I do that?
We currently don't built in support for changing the CPU. What we do know is that you should not use the built in support in Chrome or try to simulate slow CPUs by running on slow AWS instance. What should do is what WPTAgent do. You can check the code at [https://github.com/WPO-Foundation/wptagent/blob/master/wptagent.py](https://github.com/WPO-Foundation/wptagent/blob/master/wptagent.py) and do the same before you start a run and then remove it after the run.

### Throttle or not throttle your connection?
**PLEASE, YOU NEED TO ALWAYS THROTTLE YOUR CONNECTION!** You should always throttle/limit the connectivity because it will make it easier for you to find regressions. If you don't do it, you can run your tests with different connectivity profiles and regresseions/improvements that you see is caused by your servers flakey internet connection. Check out our [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity/).

### Clear browser cache between runs
By default Browsertime creates a new profile for each run you do and if you really want to be sure sure everything is cleared between runs you can use our WebExtension to clear the browser cache by adding  <code>--browsertime.cacheClearRaw</code>.

## Servers
What you should know before you choose where to run sitespeed.io.

### Cloud providers
We've been testing out different cloud providers (AWS, Google Cloud, Digital Ocean, Linode etc) and the winner for us has been AWS. We've been using c4.large and testing the same size (or bigger) instances on other providers doesn't give the same stable metric overtime.

One important learning is that you can run on <60% usage on your server, and everything looks fine but the metrics will not be stable since your instance is not isolated from other things that runs on your servers.

### Bare metal
We haven't tested on bare metal so if you have, please let us know how it worked out.

### Kubernetes
On Kubernetes you cannot use tc or Docker networks to set the connectivity but there has been tries with [TSProxy](https://github.com/WPO-Foundation/tsproxy), check out [#1829](https://github.com/sitespeedio/sitespeed.io/issues/1819).

### Running tests from multiple locations
Can I test the same URLs from different locations and how do I make sure they don't override each others data in Graphite?

You should set different namespaces depending on location (**--graphite.namespace**). If you run one test from London, set the namespace to <code>--graphite.namespace sitespeed_io.london</code>. Then you can choose individual locations in the dropdown in the pre-made dashboards.

## Store the data
By default you can choose to store your metrics in a time series database (Graphite or InfluxDB).

### Should I choose Graphite or InfluxDB?
If your organisation is running Graphite, use that. If your used to InfluxDB, use that. If you don't use any of them then use Graphite since we have more ready made dashboards for Graphite.

### Handling big amount of data
sitespeed.io will generate lots of metrics and data, how do I handle that?

#### Configuring features
If you you want to store less data from sitespeed.io one way is to configure and compress data more.

The heaviest data that sitespeed.io generates is the video, screenshot and video filmstrip screenshots. You can disable those features but it will make it harder for you to verify that everything works ok and to pinpoint regressions.

If you have limited space (and do not store the data on S3 and configure it to automatically remove old data) you can use the following configurations.

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

#### S3
When you create your buckets at S3, you can configure how long time it will keep your data (HTML/screenshots/videos). Make it match how long time you keep your metrics in Graphite or how long back in time you think you need it. Usually that is shorter than you think :) When you find an regression (hopefully within an hour or at least day) you want to compare that data with what it looked like before. Storing things at S3 for 2 weeks should be ok, but you choose yourself.

## Alerting

We've been trying out alerts in Grafana for a while and it works really good for us. Checkout the [alert section]({{site.baseurl}}/documentation/sitespeed.io/alerts/) in the docs.

## Difference in metrics between WebPageTest and sitespeed.io
Now and then it pops up an issue on Github where users ask why some metrics differs between WebPageTest and sitespeed.io.

There's a couple of things to know that differs between WebPageTest and Browsertime/sitespeed.io but first I wanna say that it is wrong to compare between tools, it is right to continuously compare within the same tool to find regressions :)

WPT and sitespeed.io differs by default when they end the tests. WPT ends when there hasn't been any networks traffic for 2 seconds (if I remember correctly). sitespeed.io ends 2 seconds after loadEventEnd. Both tools are configurable.

WebPageTest on Windows (old version) records the video with 10 fps. 5.x of sitespeed.io uses 60 fps, coming sitespeed.io 6.0 will have 30 fps per default. New WebPageTest on Linux will have 30 fps per default. Running 60 fps will give you more correct numbers but then you need to have a server that can record a video of that pace.

And a couple of generic things that will make your metrics differ:

 * **Connectivity matters** -  You need to set the connectivity.
 * **CPU matters** -  Running the same tests with the same tool on different machines will give different results.
 * **Your page matters** - It could happen that your page has different sweat spots on connectivity (that makes the page render faster) so even a small change, will make the page much slower (we have that scenario on Wikipedia).
