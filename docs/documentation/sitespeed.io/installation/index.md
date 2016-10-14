---
layout: default
title: Installation - Documentation - sitespeed.io
description: How to to install sitespeed.io. Use npm or Docker.
keywords: installation, documentation, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: How to to install sitespeed.io. Use npm or Docker.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Installation

# Installation
{:.no_toc}

* Lets place the TOC here
{:toc}

# Download and installation

## Install on Mac, Linux & Windows

Prerequisites: Install [NodeJS](https://nodejs.org/en/download/) ([Linux](https://github.com/creationix/nvm)) and make sure you have [npm](https://github.com/npm/npm) installed.

~~~ bash
$ npm install sitespeed.io@4.0.0-beta.1 -g
~~~

Run

~~~ bash
sitespeed.io --help
~~~

on Windows you should use the Docker image.


## Docker

We have [Docker images](https://hub.docker.com/u/sitespeedio/) with sitespeed.io, Chrome, Firefox and Xvfb. They are super easy to use (Xvfb is started automatically when you start the container). Here's how to use the container with both Firefox & Chrome (install [Docker](https://docs.docker.com/engine/installation/) first.

~~~ bash
$ docker pull sitespeedio/sitespeed.io:4.0-beta
$ docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:4.0-beta https://www.sitespeed.io -b firefox
~~~

That will output the data from the run in the current directory. You can read more about running the containers [here]({{site.baseurl}}/documentation/docker/).
