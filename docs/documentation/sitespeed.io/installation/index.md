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

We have [Docker images](https://hub.docker.com/r/sitespeedio/sitespeed.io/) with sitespeed.io, Chrome, Firefox, Xvfb and all the software needed for recording a video of the browser screen and analyse it to get Visual Metrics. It is super easy to use). Here's how to use the container with both Firefox & Chrome (install [Docker](https://docs.docker.com/install/) first).

### Mac & Linux

~~~bash
docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io -b firefox
~~~

### Windows

~~~
C:\Users\Vicky> docker pull sitespeedio/sitespeed.io
C:\Users\Vicky> docker run --rm -v ${pwd}:/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io -b firefox
~~~

That will output the data from the run in the current directory. You can read more about running the containers [here](/documentation/sitespeed.io/docker/).

## Node JS

### Mac & Linux

Prerequisites: Install [latest NodeJS LTS](https://nodejs.org/en/download/) ([Linux](https://github.com/creationix/nvm)) and make sure you have [npm](https://github.com/npm/npm) or [yarn](https://yarnpkg.com/) installed. Also install Chrome/Firefox/Edge (you need them to collect metrics).

Make sure you install without sudo using sudo. Checkout [Sindre Sorhus guide](https://github.com/sindresorhus/guides/blob/main/npm-global-without-sudo.md).

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

Checkout [our GitHub action running in Windows](https://github.com/sitespeedio/browsertime/blob/main/.github/workflows/windows.yml) to see how to install the dependencies needed.

If you run on Windows you can run tests on Firefox, Chrome and Edge.

### Skip installing ChromeDriver/GeckoDriver/EdgeDriver
If you don't want to install ChromeDriver, EdgeDriver or GeckoDriver when you install through npm you can skip them with an environment variable.

Skip installing ChromeDriver:

~~~bash
CHROMEDRIVER_SKIP_DOWNLOAD=true npm install sitespeed.io -g
~~~

Skip installing GeckoDriver:

~~~bash
GECKODRIVER_SKIP_DOWNLOAD=true npm install sitespeed.io -g
~~~

Skip installing EdgeDriver:

~~~bash
EDGEDRIVER_SKIP_DOWNLOAD=true npm install sitespeed.io -g
~~~

### Updating ChromeDriver/GeckoDriver/EdgeDriver

Using Docker the browser and driver is bundled with the correct versions. If you install everything yourself you may need to update driver versions.

Since the ChromeDriver team decided that a ChromeDriver version needs to match a browser version, it has been more work to test other Chrome versions.

You can download the ChromeDriver yourself from the [Google repo](https://chromedriver.storage.googleapis.com/index.html) and use ```--chrome.chromedriverPath``` to help Browsertime find it or you can choose which version to install when you install sitespeed.io with a environment variable: 
```CHROMEDRIVER_VERSION=81.0.4044.20 npm install ```

You can also choose versions for Edge and Firefox with `EDGEDRIVER_VERSION` and `GECKODRIVER_VERSION`.