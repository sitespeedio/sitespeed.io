---
layout: default
title:  Web performance testing in practice
description:
keywords: web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
category: sitespeed.io
twitterdescription: Web performance testing in practice
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Web performance testing in practice

# Web performance testing in practice
{:.no_toc}

* Lets place the TOC here
{:toc}

## Start
This is a guide for you if you are new into performance testing. It will focus on synthetic testing (automatically drive a web browser and collect performance metrics). The guide will focus on using sitespeed.io/browsertime but it mostly be generic so you can read this guide independent of the tool you use.

### Why do performance testing
Is performance important? There are a lot of people advocating that performance is money. That maybe true in some circumstances in some context for some sites and the only way for you to know is to try it out.

What we do know is that there's no [magic numbers](https://phabricator.wikimedia.org/phame/post/view/142/magic_numbers/) in performance testing and that you need to set your own goals depending on your site and your users.

What I do know is measuring the performance helps you beeing a better developer. Keeping track and making sure you do not introduce performance regressions is vital for you.


### Why do synthetic testing

There's a couple of good things that you get when running synthetic/lab testing:

* Collecting metrics that are more related to user experience than the technical metrics the browsers provide.

* In a controlled environment that typically provides consistent test results, it is easier to detect regressions. It’s easier to spot smaller regressions than with RUM.

* We can see changes very quickly when testing in a lab setting, because the only variable that is changing is the code. Being confident in RUM usually takes more time: you need to have more data to see the change.

* In a lab setting, we are also able to control when browser versions are updated to new versions, allowing us to detect when browser releases impact user experience. Our users’ browsers auto updates. A new browser version can affect the performance.

* Lab testing and RUM (real user measurements) are best friends: synthetic testing improves your confidence in RUM and vice versa. If you see a regression in both types of measurements, you know for sure that it's a real regression.

But everything isn’t perfect when testing in a lab: You are only testing a small usage group (a specific browser version, specific connection type, one operating system, a couple of URLs). You will miss out on a lot of users scenarios. That’s the disadvantage of testing in a lab.

## Setup

Lets go through some important things when you setup your synthetic tests. You want to deploy your performance measurements tool somewhere. You want to have stable metrics. You want to be able to trust your tool. You want to have an automatic way to find regressions.

### Stability is your friend
The most important thing when setting up synthetic testing is getting rid of as much variance as possible. You need to make sure that your server prestanda, the internet connection, the tool so that the metrics you collect will not be influenced by something else than things that the web page.

### Internet connection/connectivity

The internet connection to your test server is probably really fast. And it can be different throughout the day. That will influence your tests. 

If you throttle (making your connection slower) you can make sure you test under the same connection type all the time and making the connection slower, will make it easier fo you to spot regressions in your code.

 **PLEASE, YOU NEED TO ALWAYS THROTTLE YOUR CONNECTION!**!

If you use sitespeed.io/Browsertime you can check out our [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity/).

Remember: always make sure you run on a throttled connection!

### Servers

You need to run your tests somewhere and you want to make sure that nothing else in that server interfers with your tests.

### Choosing server
You can run on bare metal or using a cloud providor.

### Cloud providors
We have tested a couple of different cloud providors (AWS/GCS/DO) and I have also been testing different cloud solutions at my work at Wikimedia.

With our testing with Browsertime/sitespeed.io we have seen a big different in stability between different providors. Remember that one of the reasons to use synthetic testing is to have stable metrics. If your server is unstable over time, it will be hard for you to know if there's a problem with the pages you are testing or the server.

We have been testing providors running a couple of weeks, looking at metrics and deviaton between runs. For us AWS has been giving us the most stable metrics (some providors gives us so unstable metrics so they are unusable). We don't get any money to say that (and we actually wouldn't recommend anyone to use AWS since their policies against employes). However, they give us the most stable metrics.

#### Choosing instance type
Finding the right instance type is important: You don't want to pay too much, you want to have stable metrics but you also don't want a too fast instance (since that will make the difference in some metrics really small and maybe harder to see). And you also do not want to use a too slow instance since that will give you more unstable metrics.

Testing with WebPageTest we have seen that different browsers have bigger instances than other browsers, to make stable and usable tests. The instance type depends on what kind of page you are testing and how stable metric you want. 

At my work at Wikimedia we've been using *c5.xlarge* for both Chrome and Firefox and both WebPageTest and Browsertime/sitespeed.io. But that is for mostly testing Wikipedia. If your site has more JavaScript and third parties it's possible that you need to run on a larger instance. 

It's also possible that you can run on a smaller instance, I've seen testing governments sites (with less 3rd parties and JavaScript) makes it possible to get stable metrics on smaller instances.

And also remember that all metrics will be dependent on what kind of instance type you use (CPU/memory etc). It will affect CPU metrics (long tasks etc) and all other metrics. Here's an example of what First Visual Change looks like running on three different instance types.

![Running on three different server types]({{site.baseurl}}/img/server-instance-type.png)
{: .img-thumbnail}


##### Choosing an instance
One thing that is important to know that if you start an instance on AWS (and probably whatever cloud providor you use), they can have different perfomarnce than another instance of the exact same type! [Netflix has seens a difference in 30% in performance](https://youtu.be/pYbgcDfM2Ts?t=1575) and when they spin up a new instance, they actually spin up three, runs some measurements and then takes the fastest one.

We have also [seen difference in performance and stability at the Wikimedia Foundation](https://phabricator.wikimedia.org/T192138). Different instances can have different performance and stability. That's why we are not fans of spinning up many new instances and run the test on them and then destroy them. That will give you a bigger difference/stablility in metrics than keeping one instance up and running for a long time.

However keeping one instance (or multiple instances) isn't a bullet proof solution. We have seen performance shift over time on one instance (remember a cloud server is just someone elses computer). That's why you need to keep track of deviation of metrics over time to make sure that you can find when instances change.

Lets look at some graphs. Here's an example where we switched to a new instance, the exact same instance type, running the exact same code. You can see that the new instance is slower but much more stable metrics.

![Running on the same server instance type]({{site.baseurl}}/img/aws-same-server-update.png)
{: .img-thumbnail}

You can keep track if how "unstable" the metrics are by looking at the stddev. Here you can see the stddev when we redeplyed on a same size instance.
![Stddev]({{site.baseurl}}/img/aws-lower-stddev.png)
{: .img-thumbnail}

These metrics will be different depending on the URL you test (as long as you run different CSS/JavaScript). Here's another URL that we tested when we deployed on a new instance. Yeah, much more stable metrics.
![New server, new URL]({{site.baseurl}}/img/new-server-again.png)
{: .img-thumbnail}

But look at the stddev. You can see that the max difference is now higher, but in general it looks like the deviation is lower. 
![Higher stdeev]({{site.baseurl}}/img/higher-stddev.png)
{: .img-thumbnail}

Its important that you keep track of stddev for your metrics and look for changes!

#### Tuning your instance
Before you start to run your tests, there are a couple of things you can do to tune your instance before you start to run your tests. The first thing is to make sure you have some system running on the server that watches memory and CPU usage.

TODO

#### Running on bare metal
In theory running on bare metal servers should be the best. However it doesn't automaticlly fixes your problem. You still need to tune your OS to get stable metrics, and hopefully we can get help in the future to include those tunings.

### Number of runs
You want to have stable metrics so you can find regressions. One way to get more stable metrics is to make many runs and take the median (or fastest) run.

The number of runs you need depends on the servers you use, the browser (and browser configuration) and the URL that you test. That means you need to test yourself to find what works for you. For example at Wikimedia we get really stable metrics for our mobile site with just do one run using WebPageReplay as a replay proxy. But for the English desktop Wikipedia we need 5/7/11 runs for some URLs to get more stable metrics (becasue we run more JavaScript that executes differently). And for other languages on Wikipedia we need less runs.

You should start out by doing 5 runs. How big is the difference between your runs? Is it seconds? Well then you need to increase the number of runs. You will probably have some flakiness in your tests, but that is ok, as long as you can see regressions. The best way to find what works for you is to test over a period of time. Check your metric, check your min and max and the deviation over time.

*But vendor X of tool Y says that 3 runs is enough?*

We are pretty sure this is the same for all tools as long as you test with real browsers. It depends on your server, your browser and the page you test. **You need to test to know!**

TODO TWO DIFFEREENT SCENARIOS

### Browsers
Your page could renders differently in different browsers, since they are built in different ways. It's therefore important to test your page in multiple browsers. Using sitespeed.io you can use Chrome, Firefox, Safari and Edge. But it takes time to test in all browsers, then start to test in the ones that are the most important for you.

Browser change for each release so it is important to upgrade the browser you use in the tests, the same way your users browsers are updating. If you run the sitespeed.io Docker containers, we release a new tagged version per browser version. You can then update in a controlled way. 

It's really *important* to be able to rollback browser versions in a controlled way so that you know if a metric change is caused by the browser or the by your website or your environment.

### Choosing metrics
If you look at all metrics that are collected it's easy to feel confused and not know which metrics that is the most important.

You can either focus on performance timing metrics (like [First Visual Change](https://www.sitespeed.io/documentation/sitespeed.io/metrics/#first-visual-change), [Total Blocking Time](https://www.sitespeed.io/documentation/sitespeed.io/metrics/#total-blocking-time) etc) or you can use a score that is calculated with how performant you have created your webpage and server. Using timing metrics is good because they are usually more easy to understand and reason about, using a performance best practice score like the [Coach score](https://www.sitespeed.io/documentation/sitespeed.io/metrics/#performance-score) is good because it will not change depending of the performance of the server that runs your test (but watch out, there are some tools out there that combine both timing metrics and a best practice score meaning you will miss out of the good thing keeping them seperate).

Do your company/organisation have a way to study your users and finding out what metric is important? Start with that. If you can't do that, focus on a metric that are important for you as a developer and that you are responsible for.

I think it's important to choose a metric that you are responsbible for, something you can change and are not depending on other companies/organisation. One metric that should be independent of third parties is First Visual Change/First paint. If it is not that for you, that's your first mission: make sure your first paint are independent of others.

TODO READ!!

### When to run your tests
When should you run your tests? Well it depends, what do you want to do with the numbers you collect?

If you run tests against your competion comparing your web site against others, you could run the tests once a day or a couple of times a day. 

If you wanna find regressions you want to run your tests as often as possible or at least as often as you release or do content changes in production. You can follow our instructions on how to [continuously run your tests](https://www.sitespeed.io/documentation/sitespeed.io/continuously-run-your-tests/).


### Choosing URLs

What pages should you test? What user journeys are the most important ones? If you are new doing performance testing, I think its important to start small. Start with a couple of URLs to test (the most important one of your websites) and focus on one or two user journeys. Test them continously and watch the metrics.

If you have an active content team that can update HTML/CSS/JavaScript on your pages directly on production, you should also test [using crawling](https://www.sitespeed.io/documentation/sitespeed.io/configuration/#analyse-by-crawling). That way you can find problems on pages that you normally do not test.

### Getting stable metrics


)
[Performance Matters" by Emery Berger](https://www.youtube.com/watch?v=r-TLSBdHe1A

### Store metrics and run data

#### What data storage should I choose (Graphite vs InfluxDB)
By default sitespeed.io support both Graphite and InfluxDb and you can write your own plugin to store metrics elsewhere.

But what should you choose? We recommend that you use Graphite. We use Graphite in our setups so Graphite will always get mmost love. Keeping an Graphite instance up and running for years and years is really easy and the maintance work is really small.

But when should you use InfluxDB? Well, almost never :) The great thing with Grafana is that you can have different datasources so even if your company is already a hard core InfluxDB users, your Grafana instance can get data from both Graphite and Grafana.

### Dashboards
#### Grafana vs other dashboard tools
We love Grafana and think its the best monotoring/dashboard tool that is out there (and it is Open Source). If you haven't used it before you will be amazed. Sitespeed.io ships with a couple of default dashboards but with the power of Grafana its easy to create your own.

What extra great (for you) is that Grafana support multiple data sources, meaning you easily can create dashboards that gets data from your sitespeed.io runs, integrate it with your RUM data and with your business metrics like convertion rate. The potential with Grafana is endless.

## Testing on desktop

## Testing on mobile

## Testing the user journey






