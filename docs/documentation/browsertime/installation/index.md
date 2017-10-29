---
layout: default
title: Install browsertime using npm/yarn or Docker.
description: Install "npm install browsertime -g" or "yarn global add browsertime".
keywords: installation, documentation, web performance, browsertime, yarn, npm, docker
nav: documentation
category: browsertime
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Install browsertime using npm, yarn or Docker.
---
[Documentation](/documentation/browsertime/) / Installation

# Installation
{:.no_toc}

* Lets place the TOC here
{:toc}

# Install

## Docker

We have [Docker images](https://hub.docker.com/r/sitespeedio/browsertime/) with Browsertime, Chrome, Firefox and Xvfb. They are super easy to use (Xvfb is started automatically when you start the container). Here's how to use the container with both Firefox & Chrome (install [Docker](https://docs.docker.com/engine/installation/) first).

### Mac & Linux

~~~ bash
$ docker pull sitespeedio/browsertime
$ docker run --shm-size=1g --rm -v "$(pwd)":/browsertime sitespeedio/browsertime --video --speedIndex https://www.sitespeed.io/
~~~

### Windows

~~~ bash
C:\Users\Vicky> docker pull sitespeedio/browsertime
C:\Users\Vicky> docker run --rm -v "$(pwd)":/browsertime sitespeedio/browsertime https://www.sitespeed.io -b firefox
~~~

That will output the data from the run in the current directory. You can read more about running the containers [here](/documentation/sitespeed.io/docker/).

## Standalone

### Mac & Linux

Prerequisites: Install [latest NodeJS LTS](https://nodejs.org/en/download/) ([Linux](https://github.com/creationix/nvm)) and make sure you have [npm](https://github.com/npm/npm) or [yarn](https://yarnpkg.com/) installed. Install Chrome/Firefox.

#### npm
If you prefer npm, just run:

~~~ bash
$ npm install browsertime -g
$ browsertime --help
~~~

#### yarn
Or with [yarn](https://yarnpkg.com/):

~~~ bash
$ yarn global add browsertime
$ browsertime --help
~~~

### Windows

We support Windows using [Docker](https://docs.docker.com/engine/installation/windows/). To be able to support running on Windows with NodeJS we need at least one [core contributor](/aboutus/) that can focus on Windows. Are you that one? Please [get in touch](https://github.com/sitespeedio/browsertime/issues/new)!
