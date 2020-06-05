---
layout: default
title:  Web performance testing in practice
description: The definitive guide to run synthetic performance testing.
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
This is a guide for you if you are new into performance testing. It will focus on synthetic testing (automatically drive a web browser and collect performance metrics). The guide will focus on using sitespeed.io/Browsertime but it mostly be generic so you can read this guide independent of the tool you use.

My name is Peter Hedenskog, I created sitespeed.io in 2012. I been a performance consultant evaluating different performance tools and I now I work in the performance team of the Wikimedia Foundation. I've spent many many 1000 hours testing/thinking/evaluating/creating synthetic tools and I want to share what I learned so far. 

### Why do performance testing
Is performance important? There are a lot of people advocating that performance is money. That maybe true in some circumstances in some context for some sites and the only way for you to know is to try it out.

What we do know is that there's no [magic numbers](https://phabricator.wikimedia.org/phame/post/view/142/magic_numbers/) in performance testing and that you need to set your own goals depending on your site and your users.

What I know is measuring the performance helps you being a better developer. Keeping track and making sure you do not introduce performance regressions is vital for you. Continously measuring performance is the key. You can do that with realu useer measuremeent and synthetic testing. I'm gonna focus on synthetic testing since that's my main area and where I'm got most my knowledgable.

### Why do synthetic testing

There's a couple of good things that you get when running synthetic/lab testing:

* Collecting metrics that are more related to user experience than the technical metrics the browsers provide.

* In a controlled environment that typically provides consistent test results, it is easier to detect regressions. It’s easier to spot smaller regressions than with RUM.

* We can see changes very quickly when testing in a lab setting, because the only variable that is changing is the code. Being confident in RUM usually takes more time: you need to have more data to see the change.

* In a lab setting, we are also able to control when browser versions are updated to new versions, allowing us to detect when browser releases impact user experience. Our users’ browsers auto updates. A new browser version can affect the performance.

* Lab testing and RUM (real user measurements) are best friends: synthetic testing improves your confidence in RUM and vice versa. If you see a regression in both types of measurements, you know for sure that it's a real regression.

But everything isn’t perfect when testing in a lab: You are only testing a small usage group (a specific browser version, specific connection type, one operating system, a couple of URLs). You will miss out on a lot of users scenarios. That’s why its also goot to combine your tests with real user measuerents.

## Setup

Lets go through some important things when you setup your synthetic tests. You want to deploy your performance measurements tool somewhere. You want to have stable metrics. You want to be able to trust your tool. You want to have an automatic way to find regressions.

### Stability is your friend
The most important thing when setting up synthetic testing is getting rid of as much variance as possible. You need to make sure that your server performance, the internet connection, the tool so that the metrics you collect will not be influenced by something else than things that the web page.

https://phabricator.wikimedia.org/T162515 TODO

### Internet connection/connectivity

The internet connection to your test server is probably really fast. And it can be different throughout the day. That will influence your tests. 

If you throttle (making your connection slower) you can make sure you test under the same connection type all the time and making the connection slower, will make it easier for you to spot regressions in your code.

 **PLEASE, YOU NEED TO ALWAYS THROTTLE YOUR CONNECTION!**!

If you use sitespeed.io/Browsertime you can check out our [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity/).

Remember: always make sure you run on a throttled connection!

### Servers

You need to run your tests somewhere and you want to make sure that nothing else in that server interfere with your tests.

### Choosing server
You can run on bare metal or using a cloud provider.

### Cloud providers
We have tested a couple of different cloud providers and I have also been testing different cloud solutions at my work at Wikimedia.

With our testing with Browsertime/sitespeed.io we have seen a big different in stability between different providers. Remember that one of the reasons to use synthetic testing is to have stable metrics. If your server is unstable over time, it will be hard for you to know if there's a problem with the pages you are testing or the server.

We have been testing providers running a couple of weeks, looking at metrics and deviation between runs. You can try the cloud provider that you feel 

#### Choosing instance type
Finding the right instance type is important: You don't want to pay too much, you want to have stable metrics but you also don't want a too fast instance (since that will make the difference in some metrics really small and maybe harder to see). And you also do not want to use a too slow instance since that will give you more unstable metrics.

Testing with WebPageTest we have seen that different browsers have bigger instances than other browsers, to make stable and usable tests. The instance type depends on what kind of page you are testing and how stable metric you want. 

At my work at Wikimedia we've been using *c5.xlarge* for both Chrome and Firefox and both WebPageTest and Browsertime/sitespeed.io. But that is for mostly testing Wikipedia. If your site has more JavaScript and third parties it's possible that you need to run on a larger instance. 

It's also possible that you can run on a smaller instance, I've seen testing governments sites (with less 3rd parties and JavaScript) makes it possible to get stable metrics on smaller instances.

And also remember that all metrics will be dependent on what kind of instance type you use (CPU/memory etc). It will affect CPU metrics (long tasks etc) and all other metrics. Here's an example of what First Visual Change looks like running on three different instance types.

![Running on three different server types]({{site.baseurl}}/img/server-instance-type.png)
{: .img-thumbnail}


##### Choosing an instance
One thing that is important to know that if you start an instance on AWS (and probably whatever cloud provider you use), they can have different performance than another instance of the exact same type! [Netflix has seen a difference in 30% in performance](https://youtu.be/pYbgcDfM2Ts?t=1575) and when they spin up a new instance, they actually spin up three, runs some measurements and then takes the fastest one.

We have also [seen difference in performance and stability at the Wikimedia Foundation](https://phabricator.wikimedia.org/T192138). Different instances can have different performance and stability. That's why we are not fans of spinning up many new instances and run the test on them and then destroy them. That will give you a bigger difference/stability in metrics than keeping one instance up and running for a long time.

However keeping one instance (or multiple instances) isn't a bullet proof solution. We have seen performance shift over time on one instance (remember a cloud server is just someone else computer and others use that computer too so you can get the noisy neighbour effect). That's why you need to keep track of deviation of metrics over time to make sure that you can find when instances change.

Lets look at some graphs. Here's an example where we switched to a new instance, the exact same instance type, running the exact same code. You can see that the new instance is slower but much more stable metrics.

![Running on the same server instance type]({{site.baseurl}}/img/aws-same-server-update.png)
{: .img-thumbnail}

You can keep track if how "unstable" the metrics are by looking at the standard deviation. Here you can see the standard deviation when we replayed on a same size instance.
![Standard deviation]({{site.baseurl}}/img/aws-lower-stddev.png)
{: .img-thumbnail}

These metrics will be different depending on the URL you test (as long as you run different CSS/JavaScript). Here's another URL that we tested when we deployed on a new instance. Yeah, much more stable metrics.
![New server, new URL]({{site.baseurl}}/img/new-server-again.png)
{: .img-thumbnail}

But look at the standard deviation. You can see that the max difference is now higher, but in general it looks like the deviation is lower. 
![Higher stdeev]({{site.baseurl}}/img/higher-stddev.png)
{: .img-thumbnail}

Its important that you keep track of standard deviation for your metrics and look for changes!

#### Tuning your instance
Before you start to run your tests, there are a couple of things you can do to tune your instance before you start to run your tests. The first thing is to make sure you have some system running on the server that watches memory and CPU usage.

TODO

#### Running on bare metal
Running on bare metal servers helps you to avoid the noisy neighbour effect. However it doesn't automatically fixes your problem. You still need to configure/tune your OS to get stable metrics. We hope to include some examples to help you when we get our hands on a bare metal server :)

#### Running on Kubernetes
On Kubernetes you cannot use tc or Docker networks to set the connectivity but you can use [TSProxy](https://github.com/WPO-Foundation/tsproxy). It's bundled in Browsertime and enable it with <code>--browsertime.connectivity.engine tsproxy</code>.

### Chosing mobile phone host
The most important thing when monitoring performance using real mobile phones is that you test on the exact same mobile all the time. The same **model** is not the same as the same phone. Even though that you run tests on the same model, running the same OS you can get very different result. The Facebook mobile performance team [wrote about it](https://developers.facebook.com/videos/f8-2016/mobile-performance-tools-at-facebook/) and we have seen the same at Wikipedia. That's why solutions where you cannot pin your tests to an exact phone is useless for monitoring. You can still use those tests to get a feeling for the performance but its too unreliable for monitoring.

To run your test you can either jhost your own mobile phones and drive them through a Mac Mini or find a hosting solution that can do the same. At the moment we do not have any recommendations for hosting, except for hosting the solution yourself.


### Number of runs
You want to have stable metrics so you can find regressions. One way to get more stable metrics is to make many runs and take the median (or fastest) run.

The number of runs you need depends on the servers you use, the browser (and browser configuration) and the URL that you test. That means you need to test yourself to find what works for you. For example at Wikimedia we get really stable metrics for our mobile site with just do one run using WebPageReplay as a replay proxy. But for the English desktop Wikipedia we need 5/7/11 runs for some URLs to get more stable metrics (because we run more JavaScript that executes differently). And for other languages on Wikipedia we need less runs.

You should start out by doing 5 runs. How big is the difference between your runs? Is it seconds? Well then you need to increase the number of runs. You will probably have some flakiness in your tests, but that is OK, as long as you can see regressions. The best way to find what works for you is to test over a period of time. Check your the, check your min and max and the deviation over time.

*But vendor X of tool Y says that 3 runs is enough?*

We are pretty sure this is the same for all tools as long as you test with real browsers. It depends on your server, your browser and the page you test. **You need to test to know!**

TODO TWO DIFFEREENT SCENARIOS

### Browsers
Your page could renders differently in different browsers, since they are built in different ways. It's therefore important to test your page in multiple browsers. Using sitespeed.io you can use Chrome, Firefox, Safari and Edge. But it takes time to test in all browsers, then start to test in the ones that are the most important for you.

Browser change for each release so it is important to upgrade the browser you use in the tests, the same way your users browsers are updating. If you run the sitespeed.io Docker containers, we release a new tagged version per browser version. You can then update in a controlled way. 

It's really *important* to be able to rollback browser versions in a controlled way so that you know if a metric change is caused by the browser or the by your website or your environment.

### Choosing metrics
Through the years of performance testing different metrics has been the golden child: loadEvenEnd, first paint, Speed Index, RAIL, Googles Web Vitals and more.

Is your page fast? W

What we do know looking at the history of performance testing is that the "best" metric will change over time. Which one should you choose? If you look at all metrics that are collected it's easy to feel confused and not know which metrics that is the most important. Since metrics changes over time, I think its important to collect as many as possible (so you have the history) and then focus on one or a couple of them.


You can either focus on performance timing metrics (like [First Visual Change](https://www.sitespeed.io/documentation/sitespeed.io/metrics/#first-visual-change), [Total Blocking Time](https://www.sitespeed.io/documentation/sitespeed.io/metrics/#total-blocking-time) etc) or you can use a score that is calculated with how performant you have created your webpage and server. Using timing metrics is good because they are usually more easy to understand and reason about, using a performance best practice score like the [Coach score](https://www.sitespeed.io/documentation/sitespeed.io/metrics/#performance-score) is good because it will not change depending of the performance of the server that runs your test (but watch out, there are some tools out there that combine both timing metrics and a best practice score meaning you will miss out of the good thing keeping them separate).

Do your company/organization have a way to study your users and finding out what metric is important? Start with that. If you can't do that, focus on a metric that are important for you as a developer and that you are responsible for.

I think it's important to choose a metric that you are responsible for, something you can change and are not depending on other companies/organization. One metric that should be independent of third parties is First Visual Change/First paint. If it is not that for you, that's your first mission: make sure your first paint are independent of others.

TODO READ!!

### When to run your tests
When should you run your tests? Well it depends, what do you want to do with the numbers you collect?

If you run tests against your competition comparing your web site against others, you could run the tests once a day or a couple of times a day. 

If you wanna find regressions you want to run your tests as often as possible or at least as often as you release or do content changes in production. You can follow our instructions on how to [continuously run your tests](https://www.sitespeed.io/documentation/sitespeed.io/continuously-run-your-tests/).


### Choosing URLs

What pages should you test? What user journeys are the most important ones? If you are new doing performance testing, I think its important to start small. Start with a couple of URLs to test (the most important one of your websites) and focus on one or two user journeys. Test them continuously and watch the metrics.

If you have an active content team that can update HTML/CSS/JavaScript on your pages directly on production, you should also test [using crawling](https://www.sitespeed.io/documentation/sitespeed.io/configuration/#analyse-by-crawling). That way you can find problems on pages that you normally do not test.

### Getting useful metrics

Getting stable metrics is hard. If you are in any doubt, look at [Performance Matters" by Emery Berger](https://www.youtube.com/watch?v=r-TLSBdHe1A).

If you have throttled the internet connection, deployed on a stable server there are still some things you can do.

You can also use a replay server to try to minimize the noise. The sitespeed.io Docker container includes [WebPageReplay](https://www.sitespeed.io/documentation/sitespeed.io/webpagereplay/), Mozilla uses [mitmproxy](https://mitmproxy.org).

Another way is to look at metrics trends and compare metrics with one week back in time to find regressions. This is a technique that [Timo Tijhof](https://twitter.com/TimoTijhof) been using for a long time and we adopted it in sitespeed.io years ago.

![Compare one week back]({{site.baseurl}}/img/compare-one-week-back.png)
{: .img-thumbnail}

### Store metrics and run data

#### What data storage should I choose (Graphite vs InfluxDB)
By default sitespeed.io support both Graphite and InfluxDB and you can write your own plugin to store metrics elsewhere.

But what should you choose? We recommend that you use Graphite. We use Graphite in our setups so Graphite will get a little more love. Keeping an Graphite instance up and running for years and years is really easy and the maintenance work is really small.

But when should you use InfluxDB? Well, almost never :) The great thing with Grafana is that you can have different data sources so even if your company is already a hard core InfluxDB users, your Grafana instance can get data from both Graphite and Grafana.

### Dashboards
#### Grafana vs other dashboard tools
We love [Grafana](https://grafana.com) and think its the best monitoring/dashboard tool that is out there (and it is Open Source). If you haven't used it before you will be amazed. Sitespeed.io ships with a couple of default dashboards but with the power of Grafana its easy to create your own.

What extra great (for you) is that Grafana support multiple data sources, meaning you easily can create dashboards that gets data from your sitespeed.io runs, integrate it with your RUM data and with your business metrics like conversion rate. The potential with Grafana is endless.

### Choosing tools

If you for some reason don't want to use Browsertime or sitespeed.io I'm gonna help you with some questions you should ask your potential symthetic monitor solution providor!


#### Speed Index and other metrics

It's important that the tool you choose can measure metrics that are important to the user. <a href="https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/metrics/speed-index">Speed Index</a> (invented by <a href="https://twitter.com/patmeenan">Patrick Meenan</a>) and other visual metrics is the thing you want. The only correct way to get Speed Index is to record a video of the screen and then analyze the video. Last year there's been <a href="https://github.com/paulirish/speedline">another solution for Chrome</a> that uses Chromes internal screenshots and analyze them to get SpeedIndex. But there are problems with that solutions since Chrome has a limit of number of screenshots in the trace log and there has been reports of that the metrics is not correct. The only way to get correct Speed Index and being able to verfy that your visual metrics is correct is to record a video of the screen.


##### Questions to ask

* <b>Can your tool get us Speed Index and other visual metrics?</b> -  If you get a **no** the tool is not for you.
* <b>Can you get Speed Index for more browsers than Chrome?</b> -  This is a control question to know if they record a video or use other ways to calculate SpeedIndex (using Chrome screenshots). I prefer getting it from multiple browsers.
* <b>How many runs per URL do you recommend? Can you choose between min/median/max values?</b> - Can you increase the number of runs to get more stable values? Can you choose which run to pick? You wanna be able to change this to try out what works best for your web site.
* <b>If they use a video how many frames per second?</b> - Higher FPS needs better hardware and traditionally WebPageTest is using 10 fps for video and that may be ok for you, depending on how exact metrics you think you need. Ask to get the raw video and check the quality.
* <b>Can you run on different connectivity types?</b> - when you collect SpeedIndex and other metrics you wanna make sure that you can choose different connectivity types for your tests to be able to test as different users.</li>
* <b>Can you add your own metrics?</b> - You want to be able to collect metrics from the User Timing API or run your arbitary JavaScript to get your own metrics.

#### Locations and servers

Before you sign the contract you want to know from where you can run your tests. Run them where you typically have your users and from locations that are important for you.

##### Questions to ask

* <b>Where can I deploy the test agent?</b> - are they using their own cloud, or can you choose locations yourself from different cloud providors?
* <b>How stable is the metrics using your tool?</b> - you want to test and calibrate the tool. Do they run the tool on a separate server or do they run multiple tests at the same time that can have a negative impact on your metrics.
* <b>Can I use your tool inside our own network?</b> - do you wanna test on stage or your own machines with the same tool, make sure you can use the tool from wherever you want.
* <b>Can I upgrade/downgrade the test agent servers (number of CPUs/memory)?</b> -  if they run in the cloud for example using AWS you wanna make sure you can choose instance size because I've seen so much problems running WebPageTest on too small instances on AWS.
* <b>Can you choose brower versions for your tests? When is browser versions upgraded?</b>

#### Real mobile devices
Testing on desktop is fine, emulating mobile is good but to have really good mobile testing you want to test on real mobile devices.

![Mobile deevice lab]({{site.baseurl}}/img/mobile-device-lab.jpg)
{: .img-thumbnail}


##### Questions to ask

* <b>Can I use real devices (both Android and iPhones)?</b> - you really want to be able to test on real devices!
* <b>What browsers can I use on your device</b> -  can you choose browsers so you can test on the most important browsers for you?
* <b>Do you support different connectivity types?</b> - can you run on real 2g/3g vs setting connectivity types?
* <b>When is browser versions upgraded?</b>

#### Data and metrics
How do the company store you metrics. Do you own the data and what can you do with with? Can you export it to your own data warehouse?

##### Questions to ask
* <b>Do I own my own data/metrics?</b> - who owns the data they collect? Can you access the raw data or only through their tool? Can you export the data to your own data center? Will they sell you metrics to other companies?
* <b>If I stop using your product how do I migrate the metrics to our new system?</b> - are you locked into the platform or can you move the metrics?

#### Visualization and alerts

* <b>Can you create your own graphs with your own set of metrics?</b>
* <b>Can you add alerts to your metrics</b>

#### Price per run
Some companies has the craziest price models. Make sure to check how you would pay before you sign the contract.

##### Questions to ask
* <b>Can I see exactly how much it will cost (in dimes and dollars)?</b> - some vendors work with <i>points</i> or things like that. You wanna avoid that because you wanna see exact in dollars how much it will cost.
* <b>If a run fails, what happens then?</b> - there's a vendor out there where you pay extra for a retry. Avvoid it. If the tool doesn't work, the vendor should pay, not you as a customer.
* <b>Does it cost extra to change the User Agent?</b> - some things costs extra, because it is an extra cost for the company providing the services: adding a real device etc. But other things like changing the user agent.

#### Using or abusing Open Source?
This is one of the questions closest to my heart: Is the tool the use built upon Open Source software? If it is that's great because the best performance tools are Open Source, but you need to make sure that they are doing it the right way.

##### Questions to ask
  
* <b>Are your synthetic testing tool using any Open Source projects?</b> - If not and they still use Speed Index etc you need to ask how they do it and how you can confirm they do everything right.
* <b>Are you following the license of the tool you use?</b> - You need to ask this question! Are any of the Open Source tools they use under the GPL license (for example <a href="https://github.com/WPO-Foundation/webpagetest/blob/master/LICENSE">WebPageTest uses software under GPL</a>), so they contribute back changes.
* <b>Do you contribute back to the tool?</b> - If you as a vendor build things on top Open Source tools I think it's good karma to contribute back your changes independent on license. You can see it like this: If the company uses Open Source tools but don't contribute back, the company are more willing to trick you.

#### Data privacy

I think its's pretty easy to check if the tool you wanna use care about privacy of your data by checking how many third party tools the tools web site use. Here's what the number of third parties requests looks like for a couple of tools: 

![Running on the same server instance type]({{site.baseurl}}/img/thirdparty-performance-tools.png)
{: .img-thumbnail}

Best is to check yourself when you are evaluating a tool.

#### The agenda of your web performance tool

What the agenda of the ? If the company was very profitable/very quickly

![Very profitabkle very quickly]({{site.baseurl}}/img/very-profitable-very-quickly.png)
{: .img-thumbnail-center}

## Running tests using sitespeed.io

Lets talk about running tests on sitespeed.io.

### Testing on desktop
Run your tests on Desktop is the easiest tests to run. You can choose to run your tests in a ready made Docker container or you can invoke the NodeJS package directly.

The Docker container comes with preinstalled Chrome and Firefox (latest stable versions) and all dependencies that is needed to record and analyze a video if your test to get visual metrics. We release a new Docker container for each stable Chrome/Firefox, that way you can rollback versions easily. What's also good with the Docker container is that you start a new container per test, so everything is cleaned between tests. The drawbacks with running in a container could be slower metrics and only support for running Chrome and Firefox. If you are new to using Docker you should read our [Docker documentation](/documentation/sitespeed.io/docker/).

If you use the NodeJS version directly you can run tests on Safari and MS Edge as long as your OS support it. To a record a video and analyze it and get visual metrics, you need to install those dependencies yourself. You can checkout our GitHub actions how you do that:
* [Linux](https://github.com/sitespeedio/browsertime/blob/master/.github/workflows/linux.yml)
* [OS X](https://github.com/sitespeedio/browsertime/blob/master/.github/workflows/safari.yml)
* [Windows](https://github.com/sitespeedio/browsertime/blob/master/.github/workflows/windows.yml)

You also need to manage the browsers by manually update them when there's a new version. There's more work to keep your tests running but you are also in control and can test on more browsers.


### Testing on mobile

You can try to emulate mobile phone testing by running your tests on desktop and emulate the browser by setting another view port, user agent and slow down the CPU. But its hard to emulate the performance of a real device.

Using sitespeed.io you can test on Android and iOS devices. Android more support for performancee metrics (video/visual metrics). When you test on mobile phones you need prepare your phone for testing (enabling access/turning off services) and we have all that documented in the [documentation for mobile phones](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/).


### Testing the user journey

By default sitespeed.io test your page with a cold cache test. That means a new browser session is started per run with the browser cache cleaned between runs. However you probably have users that visits multiple pages on your web site. To measure the performance of multiple pages (during the same session) you should use [scripting](https://www.sitespeed.io/documentation/sitespeed.io/scripting).

With scripting you can test the performance of visiting multiple pages, clicking on links, log in, adding items to the cart and almost everything what the user can do.


## Summary

If you wanna use sitespeed.io for your synthetic monitoring testing you can dig deeper into the [documentation](/documentation/sitespeed.io/). If you have problems/issues the best way is to create an [issue at GitHub](https://github.com/sitespeedio/sitespeed.io/issues/new). That way others also can help out and can find the solution. If you have a bug, it super useful if you help us [creating a reproducible issue](/documentation/sitespeed.io/bug-report/).


If you want to chat about setups you can do that in [our Slack channel](https://sitespeedio.herokuapp.com). 

/[Peter]()

