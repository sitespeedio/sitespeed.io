---
layout: default
title: Use Docker to run sitespeed.io.
description: With Docket you get a prebuilt container with sitespeed.io, Firefox, Chrome and XVFB.
keywords: docker, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Use Docker to run sitespeed.io.
---
[Documentation](/documentation/sitespeed.io/) / Docker

# Docker
{:.no_toc}

* Lets place the TOC here
{:toc}

## Containers
With 4.0 we focus on one Docker container that you should use to run sitespeed.io.

 * [Chrome, Firefox & Xvfb](https://hub.docker.com/r/sitespeedio/sitespeed.io/)

It also contains FFMpeg, Imagemagick and some other things for the future to get SpeedIndex using [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics).

## Running in Docker
The simplest way to run is using Firefox:

~~~ bash
$ docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -b firefox https://www.sitespeed.io/
~~~

That will map the current directory inside Docker and output the result directory there.

If you wanna use Chrome you either need to use privileged or turn of the sandbox option:

~~~ bash
$ docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -b chrome https://www.sitespeed.io/
~~~

or

~~~ bash
$ docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -b chrome --browsertime.chrome.args no-sandbox https://www.sitespeed.io/
~~~

If you want to feed sitespeed with a list of URL:s in a file (here named *myurls.txt*), add the file to your current directory and do like this:

~~~ bash
sudo docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io myurls.txt -b chrome
~~~

In the real world you should always specify the exact version (tag) of the Docker container to make sure you use the same version all the time (else you will download the latest tag, meaning you can have old and new versions running on the server and you don't know it). Specify the tag after the container name(X.Y.Z) in this example. The tag/version number will be the same number as the sitespeed.io release:

~~~ bash
sudo docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:X.Y.Z https://www.sitespeed.io/ -b chrome
~~~


## More about volumes

If you want to feed sitespeed.io with a file with URL:s or if you want the HTML result, you should setup a volume. Sitespeed.io will do all the work inside the container in a directory located */sitespeed.io*. To setup your current working directory add the *-v "$(pwd)":/sitespeed.io* to your parameter list. Using "$(pwd)" will default to the root user directory. In order to specify the location, simply define an absolute path: *-v /Users/user/path:/sitespeed.io*


## Update (download a newer sitespeed.io)
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
