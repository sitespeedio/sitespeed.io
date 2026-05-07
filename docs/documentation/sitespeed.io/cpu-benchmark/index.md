---
layout: default
title: CPU Benchmark
description: Simple CPU benchmark!
keywords: cpu, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: CPU benchmark
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / CPU Benchmark

# CPU Benchmark
{:.no_toc}

* Let's place the TOC here
{:toc}

## How it works

We use a CPU benchmark inspired by Wikipedia's CPU benchmark included in the [Autonomous Systems performance report](https://performance.wikimedia.org/asreport/). It's super simple: it's a loop that we run in the browser after the page has finished loading and our other tests have finished. It produces a metric in milliseconds of how long it takes to run.

## How can you use it?
There are a couple of different use cases:
* Compare the benchmark on a real phone versus emulated mobile phone tests. Run the test on a phone and run it on your computer and compare the value to get a feeling for how much faster (or slower) the tests are on the computer.
* Keep track of the benchmark over time on the server that runs your tests. If the benchmark is unstable, your other metrics will also be unstable.
* If you collect performance metrics from real users, you can also collect the CPU metric from your users (make sure to do it off the main thread, like Wikipedia does). That way you can compare your synthetic tests with your RUM data.

Here's an example of what the variation looks like running on a Moto G4 running the tests in Chrome. We run eleven runs and in the graph you see the min, median and max value.
![CPU benchmark variation running on a Moto G4]({{site.baseurl}}/img/cpu-benchmark-motog4.png)
{: .img-thumbnail}


## Test page
We also have a special test page you can use to see the benchmark on your own browser/computer/device without running sitespeed.io. Access the page
[https://www.sitespeed.io/cpu.html](https://www.sitespeed.io/cpu.html) and look at the benchmark metric.

You can also use the page to calibrate your CPU throttling rate when you use Chrome. Access the page, look at the result and fine-tune your throttling rate.

~~~shell
sitespeed.io --chrome.CPUThrottlingRate 5 -b chrome https://www.sitespeed.io/cpu.html
~~~