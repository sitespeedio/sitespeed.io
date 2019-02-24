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
This is a guide for you if you are new into performance testing. It will focus on synthetic testing (automatically drive a web browser and collect metrics). The guide will focus on using sitespeed.io/browsertime but it mostly be generic so you can read this guide independent of the tool you use.

### Why do performance testing
Is performance important? There are a lot of people advocating that performance is money. That maybe true in some circumstances in some context for some sites and the only way for you to know is to try it out. 

What we do know is that there's no [magic numbers](https://phabricator.wikimedia.org/phame/post/view/142/magic_numbers/) in performance testing and that you need to set your own goals depending on your site and your users. 

But why should you test? XXX.

### Why do real user measurements

Getting metrics from real users is good because they are close to what people really experience. The problem is that:

* Today's browsers have limited ways of giving us metrics that tell us what the user is experiencing. A couple of browsers have a metric called First Paint (when something is first painted on the screen). But the rest of the metrics are more technical. They tell us how the browser is doing, not what the user is experiencing. Browser vendors are working on this but, at the moment, most performance APIs are focused on technical metrics. And we’re more interested in what our users are experiencing.

* Metrics from real users have a lot of variation because the users have different conditions: network latency, operating system, browser version, CPU and more. If something changes, how do we know the main reason? Is it our code? Is it something else?

* There is a lot of noise in the data we collect from real users. To catch a performance regression, it needs to be big enough and affect many users to be visible.

That’s why we also test use synthetic measurement.


### Why do synthetic testing

There's a couple of good things that you get when running synthetic/lab testing:

* Collecting metrics that are more related to user experience than the technical metrics the browsers provide. 

* In a controlled environment that typically provides consistent test results, it is easier to detect regressions. It’s easier to spot smaller regressions than with RUM.

* We can see changes very quickly when testing in a lab setting, because the only variable that is changing is the code. Being confident in RUM usually takes more time: you need to have more data to see the change.

* In a lab setting, we are also able to control when browser versions are updated to new versions, allowing us to detect when browser releases impact user experience. Our users’ browsers auto updates. A new browser version can affect the performance.

* Lab testing and RUM are best friends: our synthetic testing improves our confidence in RUM and vice versa. If we see a regression in both types of measurements, we know for sure that it's a real regression.

But everything isn’t perfect when testing in a lab: We are only testing a small usage group (a specific browser version, specific connection type, one operating system, a couple of URLs). We will miss out on a lot of users scenarios. That’s the big disadvantage of testing in a lab. That’s why it is also important to collect metrics from real users.

## Setup

Lets go through some important things when you setup your synthetic tests. You want to deploy your performance masuremnents tool somewhere. You want to have stable metrics. Wou want to be able to trust your tool. You want to have an automatic way to find regressions.

### Connectivity
When you run your tests you need to always thrittle your connection. **PLEASE, YOU NEED TO ALWAYS THROTTLE YOUR CONNECTION!** You should always throttle/limit the connectivity because it will make it easier for you to find regressions. If you don't do it, you can run your tests with different connectivity profiles and regressions/improvements that you see is caused by your servers flakey internet connection. Check out our [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity/) how to do it.

So remember, always make sure you run on a throttled connection.

### Number of runs
When you test your web page you want to do multiple runs to get a chanche to get more stable values. Different pages behaves different in different browsers, so you need to test how many runs you need to do. You should always do an uneven number of runs (3/5/7 etc) to make sure that the median number matches an exact run. Else the median will be an average of two runs.

Start out by doing 3 runs. How big is the difference between your runs? Is it seconds? Well then you need to increase the number of runs. You will probably have some flakiness in your tests, but that is ok, as long as you can see regressions.

### Browsers
Your page could renders differently in different browsers, since they are built in different ways. It's therefore important to test your page in multiple browsers. Using sitespeed.io you can use Chrome and Firefox. 

Browser change for each release so it is important to upgrade the browser you use in the tests, the same way your users browsers are updating. If you run the sitespeed.io Docker containers, we release a new tagged version per browser version. You can then update in a controlled way.


### Choosing metrics

### When to run your tests

### Where to run your tests

### Choosing URLs

### Getting stable metrics


### Server
#### Cloud providers
We've been testing out different cloud providers (AWS, Google Cloud, Digital Ocean, Linode etc) and the winner for us has been AWS. We've been using c5.large and testing the same size (or bigger) instances on other providers doesn't give the same stable metric overtime.

One important learning is that you can run on <60% usage on your server, and everything looks fine but the metrics will not be stable since your instance is not isolated from other things that runs on your servers.

#### Bare metal
We haven't tested on bare metal so if you have, please let us know how it worked out.

#### Kubernetes
On Kubernetes you cannot use tc or Docker networks to set the connectivity but there has been tries with [TSProxy](https://github.com/WPO-Foundation/tsproxy), check out [#1829](https://github.com/sitespeedio/sitespeed.io/issues/1819).

## Testing on desktop

## Testing on mobile

## Testing the user journey






