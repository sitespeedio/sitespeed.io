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
With 4.0 we focused on single Docker container that you should use to run sitespeed.io. This is the preferred installation method.

 * [Chrome, Firefox & Xvfb](https://hub.docker.com/r/sitespeedio/sitespeed.io/)

It also contains FFMpeg, Imagemagick and some other things for the future to get SpeedIndex using [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics).

### Structure
The new structure looks like this:

[NodeJS with Ubuntu 16](https://github.com/sitespeedio/docker-node) -> [VisualMetrics dependencies](https://github.com/sitespeedio/docker-visualmetrics-deps) ->
[Firefox/Chrome/xvfb](https://github.com/sitespeedio/docker-browsers) -> [sitespeed.io](https://github.com/sitespeedio/sitespeed.io/blob/master/Dockerfile)

The first container installs NodeJS (latest LTS) on Ubuntu 16. The next one adds the dependencies (FFMpeg, ImageMagick and some Python libraries) needed to run [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics). Then we install specific version of Firefox, Chrome and then xvfb. It's important to lock down the browsers to specific versions because it has been a real mess using Firefox the last half year (to be fair Chrome/Selenium have also had issues in the past). Then in last step, we add sitespeed and tag it to the sitespeed.io version number.

## Running in Docker
The simplest way to run using Firefox:

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

If you want to feed sitespeed with a list of URLs in a file (here named *myurls.txt*), add the file to your current directory and do like this:

~~~ bash
sudo docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io myurls.txt -b chrome
~~~

In the real world you should always specify the exact version (tag) of the Docker container to make sure you use the same version everytime (else you will download the latest tag, meaning you can have major changes between test runs without you even knowing). Specify the tag after the container name(X.Y.Z) in this example. The tag/version number will be the same number as the sitespeed.io release:

~~~ bash
sudo docker run --privileged --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:X.Y.Z https://www.sitespeed.io/ -b chrome
~~~


## More about volumes

If you want to feed sitespeed.io with a file with URLs or if you want the HTML result, you should setup a volume. Sitespeed.io will do all the work inside the container in a directory located */sitespeed.io*. To setup your current working directory add the *-v "$(pwd)":/sitespeed.io* to your parameter list. Using "$(pwd)" will default to the root user directory. In order to specify the location, simply define an absolute path: *-v /Users/user/path:/sitespeed.io*


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

If you don't use version number (you should!) then just pull the container and your next run will use the latest version.

## Inspect the container
In 4.0 we autostart sitespeed.io. If you wanna check what's in the container, you can do that by changing the entry point.

~~~ bash
docker run -it --entrypoint bash sitespeedio/sitespeed.io:4.0.0
~~~
