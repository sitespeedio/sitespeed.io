---
layout: default
title: Set the connectivity type before you start your tests.
description: You can throttle the connection to make the connectivity slower to make it easier to catch regressions. The best way to do that is to setup a network bridge in Docker or use our connectivity engine Throttle. If you use Kubernetes you should use TSProxy.
keywords: connectivity, throttle, emulate, users
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Connectivity

# Connectivity
{:.no_toc}

* Lets place the TOC here
{:toc}

## Change/set connectivity
You can and should throttle the connection to make the connectivity slower to make it easier to catch regressions. If you don’t do it, you can run your tests with different connectivity profiles and regressions/improvements that you see is caused by your servers flaky internet connection

The best way to do that is to use our connectivity engine [Throttle](https://github.com/sitespeedio/throttle), setup a network bridge in Docker, use [Humble](https://github.com/sitespeedio/humble) the Raspberry Pi WiFi network link conditionerif you test with mobile phones or if you use Kubernetes you can use [TSProxy](https://github.com/WPO-Foundation/tsproxy).

### Throttle
[Throttle](https://github.com/sitespeedio/throttle) uses *tc* on Linux and *pfctl* on Mac to change the connectivity. Throttle will need sudo rights for the user running sitespeed.io to work.

To use throttle, use set the connectivity engine by <code>--connectivity.engine throttle</code>.

~~~bash
browsertime --connectivity.engine throttle -c cable https://www.sitespeed.io/
~~~

or for sitespeed.io:

~~~bash
sitespeed.io --browsertime.connectivity.engine throttle -c cable https://www.sitespeed.io/
~~~

You can also use Throttle inside of Docker but then the host need to be the same OS as in Docker. In practice you can only use it on Linux. And then make sure to run *sudo modprobe ifb numifbs=1* first and give the container the right privileges *--cap-add=NET_ADMIN*.

First use modprobe:

~~~bash
sudo modprobe ifb numifbs=1
~~~

And then then make user you use the right privileges:
~~~bash
docker run --cap-add=NET_ADMIN --rm sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} -c 3g --browsertime.connectivity.engine=throttle https://www.sitespeed.io/
~~~

If you run Docker on OS X, you need to rottle outside of Docker. Install it and run like this:

~~~
# First install
$ npm install @sitespeed.io/throttle -g

# Then set the connectivity, run and stop
$ throttle cable
$ docker run --shm-size=1g --rm sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/
$ throttle stop
~~~

### Humble (for mobile phone testing)
To get Humble up and running you need a Raspberry Pi 4. The Pi will share a trottled WiFi network that you can use from your phone. Browsertime/sitespeed.io will connect to the Raspberry Pi and configure the connectivity on the WiFi before your test starts.

1. Follow [the instructions to setup the Raspberry Pi WiFi network](https://github.com/sitespeedio/humble#install-using-the-pre-made-image).
2. Make sure your phone uses the new WiFi (named `humble` by default).
3. Run the tests!

To make sure sitespeed.io sets the connectivity you need to set the engine to `humble` and set the URL to the Raspberry Pi:

~~~shell
sitespeed.io --browsertime.connectivity.engine=humble --browsertime.connectivity.humble.url=http://raspberrypi.local:3001 --android --browsertime.connectivity.profile 3g https://www.sitespeed.io  
~~~

### Docker networks
Here's an full example to setup up Docker network bridges on a server that has tc installed:

~~~shell
#!/bin/bash
echo 'Starting Docker networks'
docker network create --driver bridge --subnet=192.168.33.0/24 --gateway=192.168.33.10 --opt "com.docker.network.bridge.name"="docker1" 3g
tc qdisc add dev docker1 root handle 1: htb default 12
tc class add dev docker1 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker1 parent 1:12 netem delay 150ms

docker network create --driver bridge --subnet=192.168.34.0/24 --gateway=192.168.34.10 --opt "com.docker.network.bridge.name"="docker2" cable
tc qdisc add dev docker2 root handle 1: htb default 12
tc class add dev docker2 parent 1:1 classid 1:12 htb rate 5mbit ceil 5mbit
tc qdisc add dev docker2 parent 1:12 netem delay 14ms

docker network create --driver bridge --subnet=192.168.35.0/24 --gateway=192.168.35.10 --opt "com.docker.network.bridge.name"="docker3" 3gfast
tc qdisc add dev docker3 root handle 1: htb default 12
tc class add dev docker3 parent 1:1 classid 1:12 htb rate 1.6mbit ceil 1.6mbit
tc qdisc add dev docker3 parent 1:12 netem delay 75ms

docker network create --driver bridge --subnet=192.168.36.0/24 --gateway=192.168.36.10 --opt "com.docker.network.bridge.name"="docker4" 3gslow
tc qdisc add dev docker4 root handle 1: htb default 12
tc class add dev docker4 parent 1:1 classid 1:12 htb rate 0.4mbit ceil 0.4mbit
tc qdisc add dev docker4 parent 1:12 netem delay 200ms
~~~

When you run your container you add the network with <code>--network cable</code>. A full example running running with cable:

~~~bash
docker run --shm-size=1g --network=cable --rm sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} -c cable https://www.sitespeed.io/
~~~

And using the 3g network:

~~~bash
docker run --shm-size=1g --network=3g --rm sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} -c 3g https://www.sitespeed.io/
~~~

And if you want to remove the networks:

~~~shell
#!/bin/bash
echo 'Stopping Docker networks'
docker network rm 3g
docker network rm 3gfast
docker network rm 3gslow
docker network rm cable
~~~

### TSProxy
[TSProxy](https://github.com/WPO-Foundation/tsproxy) is a Traffic-shaping SOCKS5 proxy built by [Patrick Meenan](https://twitter.com/patmeenan). You need Python 2.7 for it to work. When you run it through Browsertime/sitespeed.io configures Firefox and Chrome to automatically use the proxy.

If use Kubernetes you can not use Docker networks or tc, but you can use TSProxy. However there has been [many issues](https://github.com/WPO-Foundation/tsproxy/issues?q=is%3Aissue+is%3Aclosed) with TSProxy through the years, so if you can avoid using it, please do.

~~~bash
sitespeed.io --browsertime.connectivity.engine tsproxy -c cable https://www.sitespeed.io/
~~~

