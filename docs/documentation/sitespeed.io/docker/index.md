---
layout: default
title: Use Docker to run sitespeed.io.
description: With Docket you get a prebuilt container with sitespeed.io, Firefox, Chrome and XVFB.
keywords: docker, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Use Docker to run sitespeed.io.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Docker

# Docker
{:.no_toc}

* Lets place the TOC here
{:toc}

## Containers
Docker is the preferred installation method because almost every dependency is handled for you for all the features in sitespeed.io!

 * [Chrome, Firefox & Xvfb](https://hub.docker.com/r/sitespeedio/sitespeed.io/)

It also contains FFMpeg and Imagemagick, so we can record a video and get metrics like SpeedIndex using [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics).

### Structure
The structure looks like this:

[NodeJS with Ubuntu 16](https://github.com/sitespeedio/docker-node) -> [VisualMetrics dependencies](https://github.com/sitespeedio/docker-visualmetrics-deps) ->
[Firefox/Chrome/xvfb](https://github.com/sitespeedio/docker-browsers) -> [sitespeed.io](https://github.com/sitespeedio/sitespeed.io/blob/master/Dockerfile)

The first container installs NodeJS (latest LTS) on Ubuntu 16. The next one adds the dependencies (FFMpeg, ImageMagick and some Python libraries) needed to run [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics). We then install specific version of Firefox, Chrome and lastly xvfb. Then in last step, we add sitespeed and tag it to the sitespeed.io version number.

We lock down the browsers to specific versions for maximum compatibility and stability with sitespeed.io's current feature set; upgrading once we verify browser compatibiilty.
{: .note .note-info}

## Running in Docker

The simplest way to run using Chrome:

~~~ bash
$ docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -b chrome https://www.sitespeed.io/
~~~

Note: The shm-size increases the memory for the GPU (default is 64mb and that is too small) see [https://github.com/elgalu/docker-selenium/issues/20](https://github.com/elgalu/docker-selenium/issues/20).

In the real world you should always specify the exact version (tag) of the Docker container to make sure you use the same version for every run. If you use the latest tag you will download newer version of sitespeed.io as they become available, meaning you can have major changes between test runs (version upgrades, dependencies updates, browser versions, etc). So you should always specify a tag after the container name(X.Y.Z). Know that the tag/version number will be the same number as the sitespeed.io release:

~~~ bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:X.Y.Z -b chrome https://www.sitespeed.io/
~~~

If you want to use Firefox:

~~~ bash
$ docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:X.Y.Z -b firefox https://www.sitespeed.io/
~~~

Using `-v "$(pwd)":/sitespeed.io` will map the current directory inside Docker and output the result directory there.
{: .note .note-info}



## More about volumes

If you want to feed sitespeed.io with a file with URLs or if you want to store the HTML result, you should setup a volume. Sitespeed.io will do all the work inside the container in a directory located at */sitespeed.io*. To setup your current working directory add the *-v "$(pwd)":/sitespeed.io* to your parameter list. Using "$(pwd)" will default to the current directory. In order to specify a statci location, simply define an absolute path: *-v /Users/sitespeedio/html:/sitespeed.io*

If you run on Windows, it could be that you need to map a absolute path. If you have problems on Windows please check [https://docs.docker.com/docker-for-windows/](https://docs.docker.com/docker-for-windows/).

## Update (download a newer sitespeed.io)
When using Docker upgrading to a newer version is super easy, change X.Y.Z to the version you want to use:

~~~ bash
docker pull sitespeedio/sitespeed.io:X.Y.Z
~~~

Then change your start script (or where you start your container) to use the new version number.

## Synchronize docker machines time with host

If you want to make sure your containers have the same time as the host, you can do that by adding <code>-v /etc/localtime:/etc/localtime:ro</code> (Note: This is specific to Linux).

Full example:

~~~ bash
$ docker run --rm -v "$(pwd)":/sitespeed.io -v /etc/localtime:/etc/localtime:ro sitespeedio/sitespeed.io -b firefox https://www.sitespeed.io/
~~~

## Change connectivity

To change connectivity you should use Docker networks, read all about it [here]({{site.baseurl}}/documentation/sitespeed.io/browsers/#change-connectivity).

## Access localhost

If you run a server local on your machine and want to access it with sitespeed.io you can do that on your Mac by using the Docker fixed ip 192.168.65.1:

~~~ bash
$ docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -b firefox http://192.168.65.1:4000/
~~~

## Troubleshooting

### Inspect the container
In 4.0 we autostart sitespeed.io. If you want to check what's in the container, you can do that by changing the entry point.

~~~ bash
docker run -it --entrypoint bash sitespeedio/sitespeed.io:4.0.0
~~~

### Visualize your test in XVFB
The docker containers have `x11vnc` installed which enables visualization of the test running inside `Xvfb`. To view the tests, follow these steps:

- You will need to run the sitespeed.io image by exposing a PORT for vnc server. By default this port is 5900. If you plan to change your port for VNC server, then you need to expose that port.

~~~bash
docker run --shm-size=512m --privileged --rm -v "$(pwd)":/sitespeed.io -p 5900:5900 sitespeedio/sitespeed.io https://www.sitespeed.io/ -b chrome
~~~

- Find the container id of the docker container for sitespeed by running:

~~~bash
docker ps
~~~

- Now enter into your running docker container for sitespeed.io by executing:

~~~bash
docker exec -it <container-id> bash
~~~

- Find the `Xvfb` process using `ps -ef`. It should be using `DISPLAY=:99`.
- Run

~~~bash
x11vnc -display :99 -storepasswd
~~~

Enter any password. This will start your VNC server which you can use by any VNC client to view:

- Download VNC client like RealVNC
- Enter VNC server : `0.0.0.0:5900`
- When prompted for password, enter the password you entered while creating the vnc server.
- You should be able to view the contents of `Xvfb`.
