---
layout: default
title: Use Firefox, Chrome or Chrome on Android to collect metrics.
description: You can use Firefox, Chrome and Chrome on Android to collect metrics. You need make sure you have a set connectivity when you test, and you do that with Docker networks or throttle.
keywords: browsers, documentation, web performance, sitespeed.io, connectivity, throttle, Firefox, Chrome
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: You can use Firefox, Chrome and Chrome on Android to collect metrics.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Browsers

# Browsers
{:.no_toc}

* Lets place the TOC here
{:toc}

You can fetch timings and execute your own Javascript. The following browsers are supported: Firefox, Chrome and Chrome on Android.

## Firefox
You will need Firefox 48+. We use the new [Geckodriver](https://github.com/mozilla/geckodriver) and it works only version 48 or later.

## Chrome
Chrome should work out of the box.

## Change connectivity
You can throttle the connection to make the connectivity slower to make it easier to catch regressions. The best way to do that is to setup a network bridge in Docker or use our connectivity engine Throttle.


### Docker networks
Here's an full example to setup up Docker network bridges on a server that has tc installed:

~~~bash
#!/bin/bash
echo 'Starting Docker networks'
docker network create --driver bridge --subnet=192.168.33.0/24 --gateway=192.168.33.10 --opt "com.docker.network.bridge.name"="docker1" 3g
tc qdisc add dev docker1 root handle 1: htb default 12
tc class add dev docker1 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker1 parent 1:12 netem delay 300ms

docker network create --driver bridge --subnet=192.168.34.0/24 --gateway=192.168.34.10 --opt "com.docker.network.bridge.name"="docker2" cable
tc qdisc add dev docker2 root handle 1: htb default 12
tc class add dev docker2 parent 1:1 classid 1:12 htb rate 5mbit ceil 5mbit
tc qdisc add dev docker2 parent 1:12 netem delay 28ms

docker network create --driver bridge --subnet=192.168.35.0/24 --gateway=192.168.35.10 --opt "com.docker.network.bridge.name"="docker3" 3gfast
tc qdisc add dev docker3 root handle 1: htb default 12
tc class add dev docker3 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker3 parent 1:12 netem delay 150ms

docker network create --driver bridge --subnet=192.168.36.0/24 --gateway=192.168.36.10 --opt "com.docker.network.bridge.name"="docker4" 3gem
tc qdisc add dev docker4 root handle 1: htb default 12
tc class add dev docker4 parent 1:1 classid 1:12 htb rate 0.4mbit ceil 0.4mbit
tc qdisc add dev docker4 parent 1:12 netem delay 400ms
~~~

When you run your container you add the network with <code>--network cable</code>. A full example running running with cable:

~~~bash
$ docker run --privileged --shm-size=1g --network=cable --rm sitespeedio/sitespeed.io -c cable https://www.sitespeed.io/
~~~

And using the 3g network:

~~~bash
$ docker run --privileged --shm-size=1g --network=3g --rm sitespeedio/sitespeed.io -c 3g https://www.sitespeed.io/
~~~

And if you want to remove the networks:

~~~bash
#!/bin/bash
echo 'Stopping Docker networks'
docker network rm 3g
docker network rm 3gfast
docker network rm 3gem
docker network rm cable
~~~

### Throttle
Throttle uses *tc* on Linux and *pfctl* on Mac to change the connectivity. Throttle will need sudo rights for the user running sitespeed.io to work.

To use throttle, use set the connectivity engine by *--connectivity.engine throttle*.

~~~bash
$ browsertime --connectivity.engine throttle -c cable https://www.sitespeed.io/
~~~

You can also use Throttle inside of Docker but then the host need to be the same OS as in Docker. In practice you can only use it on Linux. And then make sure to run *sudo modprobe ifb numifbs=1* first and give the container the right privileges *--cap-add=NET_ADMIN*.

If you run Docker on OS X, you need to run throttle outside of Docker. Install it and run like this:

~~~bash
# First install
$ npm install @sitespeed.io/throttle -g

# Then set the connectivity, run and stop
$ throttle --up 330 --down 780 --rtt 200
$ docker run --shm-size=1g --rm sitespeedio/sitespeed.io https://www.sitespeed.io/
$ throttle --stop
~~~

## Choose when to end your test
By default the browser will collect data until  [window.performance.timing.loadEventEnd happens + aprox 2 seconds more](https://github.com/sitespeedio/browsertime/blob/d68261e554470f7b9df28797502f5edac3ace2e3/lib/core/seleniumRunner.js#L15). That is perfectly fine for most sites, but if you do Ajax loading and you mark them with user timings, you probably want to include them in your test. Do that by changing the script that will end the test (--browsertime.pageCompleteCheck). When the scripts returns true the browser will close or if the timeout time is reached.

In this example we wait 10 seconds until the loadEventEnd happens, but you can also choose to trigger it at a specific event.

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io --browsertime.pageCompleteCheck 'return (function() {try { return (Date.now() - window.performance.timing.loadEventEnd) > 10000;} catch(e) {} return true;})()'
~~~

We use Selenium in the backend to drive the browsers and right now Selenium/drivers doesn't support the *pageLoadStrategies* where you can change when Selenium will give control to the user. Right now we always wait on the pageLoadEvent, meaning pages that do not fire that event will fail. Track the progress to fix that [here](https://github.com/sitespeedio/browsertime/issues/186).
{: .note .note-warning}

## Custom metrics

You can collect your own metrics in the browser by supplying Javascript file(s). By default we collect all metrics inside [these folders](https://github.com/sitespeedio/browsertime/tree/master/browserscripts), but you might have something else you want to collect.

Each javascript file need to return a metric/value which will be picked up and returned in the JSON. If you return a number, statistics will automatically be generated for the value (like median/percentiles etc).

For example say we have one file called scripts.js that checks how many scripts tags exist on a page. The script would look like this:

~~~bash
(function() {
  return document.getElementsByTagName("script").length;
})();
~~~

Then to pick up the script, you would run it like this:

~~~bash
docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io --browsertime.script scripts.js -b firefox
~~~

You will get a custom script section in the Browsertime tab.
![Custom scripts individual page]({{site.baseurl}}/img/customscripts.png)
{: .img-thumbnail}

And in the summary and detailed summary section.
![Summary page]({{site.baseurl}}/img/summary.png)
{: .img-thumbnail}

Bonus: All custom scripts values will be sent to Graphite, no extra configuration needed!

## Visual Metrics

Visual metrics (Speed Index, Perceptual Speed Index, first and last visual change) can be collected if you also record a video of the screen. This will work on desktop for Firefox & Chrome. If you use our Docker container you automagically get all the extra software needed!

~~~bash
$ docker run --privileged --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --speedIndex --video https://www.sitespeed.io/
~~~

## Using Browsertime
Everything you can do in Browsertime, you can also do in sitespeed.io. Prefixing browsertime to a CLI parameter will pass that parameter on to Browsertime.

You can check what Browsertime can do [here](https://github.com/sitespeedio/browsertime/blob/master/lib/support/cli.js).

For example if you want to pass on an extra native arguments to Chrome. In standalone Browsertime you do that with <code>--chrome.args</code>. If you want to do that through sitespeed.io you just prefix browsertime to the param: <code>--browsertime.chrome.args</code>. Yes we know, pretty sweet! :)

## How can I disable HTTP/2 (I only want to test HTTP/1.x)?
On Chrome, you just add the switches <code>--browsertime.chrome.args no-sandbox --browsertime.chrome.args disable-http2</code>.

For Firefox, you need to turn off HTTP/2 and SPDY, and you do that by setting the Firefox preferences:
<code>--browsertime.firefox.preference network.http.spdy.enabled:false --browsertime.firefox.preference network.http.spdy.enabled.http2:false --browsertime.firefox.preference network.http.spdy.enabled.v3-1:false</code>
