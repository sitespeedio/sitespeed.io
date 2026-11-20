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

{:toc}

# Install

You can run Browsertime in two ways: with our Docker image or as a Node.js install. Docker is the easiest path because the image already contains Chrome, Firefox, Xvfb and the dependencies needed for video recording and Visual Metrics.

## Docker

We publish [Docker images](https://hub.docker.com/r/sitespeedio/browsertime/) with Browsertime, Chrome, Firefox and Xvfb. Xvfb is started for you when the container boots, so you only need to install [Docker](https://docs.docker.com/install/) and run the image.

### Mac & Linux

~~~bash
docker run --rm -v "$(pwd)":/browsertime sitespeedio/browsertime:{% include version/browsertime.txt %} --video --visualMetrics https://www.sitespeed.io/
~~~

### Windows

~~~shell
C:\Users\Vicky> docker pull sitespeedio/browsertime
C:\Users\Vicky> docker run --rm -v "$(pwd)":/browsertime sitespeedio/browsertime:{% include version/browsertime.txt %} https://www.sitespeed.io -b firefox
~~~

The result of the run is written to the current directory.

## Standalone

### Mac & Linux

Prerequisites:

 - [Node.js](https://nodejs.org/en/download/) 20 or later (22.18+ if you want to use TypeScript navigation scripts). On Linux you can manage versions with [nvm](https://github.com/nvm-sh/nvm).
 - [npm](https://www.npmjs.com/) (bundled with Node.js) or [yarn](https://yarnpkg.com/).
 - Chrome and/or Firefox installed locally.

#### npm

~~~bash
npm install browsertime -g
~~~

#### yarn

~~~bash
yarn global add browsertime
~~~

### Windows

We support Windows through [Docker](https://docs.docker.com/engine/installation/windows/). Running Browsertime natively on Windows would need at least one [core contributor](/aboutus/) to focus on Windows — if that is you, please [get in touch](https://github.com/sitespeedio/browsertime/issues/new).
