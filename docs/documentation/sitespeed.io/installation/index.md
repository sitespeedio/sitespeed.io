---
layout: default
title: Install sitespeed.io using npm/yarn or Docker.
description: Install "npm install sitespeed.io -g" or "yarn global add sitespeed.io".
keywords: installation, documentation, web performance, sitespeed.io, yarn, npm, docker
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Install sitespeed.io using npm, yarn or Docker.
---
[Documentation](/documentation/sitespeed.io/) / Installation

# Installation
{:.no_toc}

* Lets place the TOC here
{:toc}

# Install
You can run sitespeed.io using our Docker containers or using NodeJS.

## Docker

We have [Docker images](https://hub.docker.com/r/sitespeedio/sitespeed.io/) with sitespeed.io, Chrome, Firefox and Xvfb. It is super easy to use (Xvfb is started automatically when you start the container). Here's how to use the container with both Firefox & Chrome (install [Docker](https://docs.docker.com/engine/installation/) first).

### Mac & Linux

~~~bash
docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io -b firefox
~~~

### Windows

~~~
C:\Users\Vicky> docker pull sitespeedio/sitespeed.io
C:\Users\Vicky> docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io -b firefox
~~~

That will output the data from the run in the current directory. You can read more about running the containers [here](/documentation/sitespeed.io/docker/).

## Node JS

### Mac & Linux

Prerequisites: Install [latest NodeJS LTS](https://nodejs.org/en/download/) ([Linux](https://github.com/creationix/nvm)) and make sure you have [npm](https://github.com/npm/npm) or [yarn](https://yarnpkg.com/) installed. Also install Chrome/Firefox (you need them to collect metrics).

#### npm
If you prefer npm, just run:

~~~bash
npm install sitespeed.io -g
~~~

#### yarn
Or with [yarn](https://yarnpkg.com/):

~~~bash
yarn global add sitespeed.io
~~~

### Windows

We support Windows using [Docker](https://docs.docker.com/engine/installation/windows/). To be able to support running on Windows with NodeJS we need at least one [core contributor](/aboutus/) that can focus on Windows. Are you that one? Please [get in touch](https://github.com/sitespeedio/sitespeed.io/issues/new)!
