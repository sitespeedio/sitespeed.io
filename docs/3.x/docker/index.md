---
layout: default
title: Docker - Documentation - sitespeed.io
description: Use Docker to run sitespeed.io.
keywords: docker, documentation, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Use Docker to run sitespeed.io.
---
[Documentation 3.x](/documentation/) / Docker

# Docker
{:.no_toc}

* Lets place the TOC here
{:toc}


## Containers
We have a couple of Docker containers you can use to run sitespeed.io. We have separated them to try to keep the size as small as possible.

 * [The base box](https://hub.docker.com/r/sitespeedio/sitespeed.io-standalone/) - only including sitespeed.io. You can use this if you only want to check web performance best practice rules. And soon when PhantomJS 2 is released for Linux you will be able to fetch timing using Phantom.
 * [Firefox & Xvfb](https://hub.docker.com/r/sitespeedio/sitespeed.io-firefox/) - makes it possible to fetch timings using Firefox. This it the smallest container using a real browser.
 * [Chrome & Xvfb](https://hub.docker.com/r/sitespeedio/sitespeed.io-chrome/) - if you prefer Chrome this is the container to use.
 * [Chrome, Firefox & Xvfb](https://hub.docker.com/r/sitespeedio/sitespeed.io/) - here you get all the things you need, the box gets quite large precisely over 1 gb.


## Running in Docker
The simplest way to run is like this fetching the box with Chrome and Firefox:

~~~ bash
sudo docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io sitespeed.io -u https://www.sitespeed.io -b chrome
~~~

If you want to feed sitespeed with a list of URL:s in a file (here named *myurls.txt*), add the file to your current directory and do like this:

~~~ bash
sudo docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io sitespeed.io -f myurls.txt -b chrome --seleniumServer http://127.0.0.1:4444/wd/hub
~~~

In the real world you should always specify the exact version (tag) of the Docker container to make sure you use the same version all the time (else you will download the latest tag, meaning you can have old and new versions running on the server and you don't know it). Specify the tag after the container name(X.Y.Z) in this example. The tag/version number will be the same number as the sitespeed.io release:

~~~ bash
sudo docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:X.Y.Z sitespeed.io -u https://www.sitespeed.io -b chrome
~~~



## Setup the volume

If you want to feed sitespeed.io with a file with URL:s or if you want the HTML result, you should setup a volume. Sitespeed.io will do all the work inside the container in a directory located */sitespeed.io*. To setup your current working directory add the *-v "$(pwd)":/sitespeed.io* to your parameter list. Using "$(pwd)" will default to the root user directory. In order to specify the location, simply define an absolute path: *-v /Users/user/path:/sitespeed.io*

Note: running on Mac OS X and Windows Docker only has rights to write data in your */Users* or *C:\Users* directory. Read more [here](https://docs.docker.com/userguide/dockervolumes/#mount-a-host-directory-as-a-data-volume).
{: .note .note-warning}

## Update version (download newer sitespeed.io version)
Updating to a newer version is easy, change X.Y.Z to the version you want to use:

~~~ bash
docker pull sitespeedio/sitespeed.io:X.Y.Z
~~~

Or alternatively pull the latest version:

~~~ bash
docker pull sitespeedio/sitespeed.io
~~~

And then change your start script (or where you start your container) to use the new version number.

If you don't use version number (you should!) then just pull the container and you will run the latest version.
