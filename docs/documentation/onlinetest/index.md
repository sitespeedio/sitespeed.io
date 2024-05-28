---
layout: default
title: Online test
description: Deploy your own version of sitespeed.io online.
keywords: test, documentation, web performance
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

# Online test
{:.no_toc}

* Lets place the TOC here
{:toc}

## Introduction
The online test is the easiest way to deploy your own version of sitespeed.io online. You can add tests through a web gui or using sitespeed.io command line that can pass on the test to your test server.

To get it up and running you need the sitespeed.io server, at least one sitespeed.io testrunner and the dependencies (Redis like message broker, PostgreSQL and somewhere to store the result pages).


## Installation

### Node version
To get the server and testrunner running you need to install [NodeJS](https://nodejs.org/). Please follow the instruction on [NodeJS](https://nodejs.org/) for your operating system. Install the LTS version (at the moment that is NodeJS 20).

#### Install the server

Get the latest release from npm:

```bash
npm install @sitespeed.io/server -g
```


#### Install the test runner

Get the latest release from npm:

```bash
npm install @sitespeed.io/testrunner -g
```


### Install/start the dependencies
If you don't want to handle the dependencies yourself you can use our docker compose file. You need to have Docker and Docker compose installed to run that.

You need the docker compose file, easiest for testing is to clone the repo.

```bash
git clone https://github.com/sitespeedio/onlinetest.git
cd onlinetest
docker compose up
```

### Docker version
At the moment we do not publish any pre-made Docker containers for the server and testrunner. 


## Configuration
If you start the applications, the default configuration is used. The configuration for the server is here and testrunner here. 

You can (and should) override that configuration by command line parameters or you can replace the configuration by using your own configuration file.

### Yaml / JSON
You can have your own configuration files using yaml or JSON.

You can feed a configuration file use `--config`.

### Command line override

If your configuration looks like this:

```json
    redis: {
        host: 127.0.0.1
    }
```

You can override that with `--redis.host MY_HOST`.

### sitespeed.io configuration
The configuration for sitespeed.io uses inheritance. On the server you can configure a sitespeed.io configuration. That configuration will be passed on to the testrunner that will be merged together with the sitespeed.io configuration on the testrunner. And then as a final step that configuration will be merged with the config from the cli API or the GUI.

`server -> testrunner -> cli/gui configurations`

This way you can configure some parts globally (in the server config) and some things locally (per testrunner).

## The server

### Validate test domains

### Configure your own look and feel

### Wait for test

### Adding Basic Auth

### 

## The testrunner

### Setting up Android phones

## Dependencies

### Message broker


### Database

### Result storage

## Configuration for production
* Change all the default passwords :)
* Choose how you want to handle your
* You can choose how you want to limit your instance:
    * Basic Auth for adding tests through the web gui
    * A secret key for adding tests though the API
    * A regex that needs to match the domain that you want to test
    * Disable search
    * Disable adding test through the web gui.

## Using the API

