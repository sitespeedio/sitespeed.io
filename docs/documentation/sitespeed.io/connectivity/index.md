---
layout: default
title: Set the connectivity type before you start your tests.
description: You can throttle the connection to make the connectivity slower to make it easier to catch regressions. The best way to do that is to setup a network bridge in Docker or use our connectivity engine Throttle.
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
docker run --shm-size=1g --network=cable --rm sitespeedio/sitespeed.io -c cable https://www.sitespeed.io/
~~~

And using the 3g network:

~~~bash
docker run --shm-size=1g --network=3g --rm sitespeedio/sitespeed.io -c 3g https://www.sitespeed.io/
~~~

And if you want to remove the networks:

~~~bash
#!/bin/bash
echo 'Stopping Docker networks'
docker network rm 3g
docker network rm 3gfast
docker network rm 3slow
docker network rm cable
~~~

### Throttle
Throttle uses *tc* on Linux and *pfctl* on Mac to change the connectivity. Throttle will need sudo rights for the user running sitespeed.io to work.

To use throttle, use set the connectivity engine by *--connectivity.engine throttle*.

~~~bash
browsertime --connectivity.engine throttle -c cable https://www.sitespeed.io/
~~~

or for sitespeed.io:

~~~bash
sitespeed.io --browsertime.connectivity.engine throttle -c cable https://www.sitespeed.io/
~~~

You can also use Throttle inside of Docker but then the host need to be the same OS as in Docker. In practice you can only use it on Linux. And then make sure to run *sudo modprobe ifb numifbs=1* first and give the container the right privileges *--cap-add=NET_ADMIN*.

If you run Docker on OS X, you need to run throttle outside of Docker. Install it and run like this:

~~~
# First install
$ npm install @sitespeed.io/throttle -g

# Then set the connectivity, run and stop
$ throttle --up 330 --down 780 --rtt 200
$ docker run --shm-size=1g --rm sitespeedio/sitespeed.io https://www.sitespeed.io/
$ throttle --stop
~~~
