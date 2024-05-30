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

This is probably the best way for small/medium/large sized companies and organizations to run performance tests if you need a GUI.

To get it up and running you need the sitespeed.io server, at least one sitespeed.io testrunner and the dependencies (Redis like message broker, PostgreSQL and somewhere to store the result pages). 

## Installation

If you are a small business and need to test a website or just a few, you can deploy everything on a single server. If you are a large company planning to run numerous tests, you can split and run everything on different servers. If you plan to run tests from various parts of the world, make sure to have the web GUI, database, and Redis/queue manager in the same location.

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

The testrunner can either use our [pre-made sitespeed.io Docker container](https://hub.docker.com/r/sitespeedio/sitespeed.io) (then you need to install Docker) or usa npm installed sitespeeed.io. If you choose not to use Docker, then you can follow [these instructions](https://www.sitespeed.io/documentation/sitespeed.io/installation/#using-node-js) to get sitespeed.io up and running.   


### Install the dependencies
You need to have Redis (like), PostgerSQL and somewhere to store the HTML result. If you don't want to handle the dependencies yourself you can use [our docker compose file](https://github.com/sitespeedio/onlinetest/blob/main/docker-compose.yml). You need to have Docker and Docker compose installed to run it.

You need the docker compose file, easiest for testing is to clone the repo.

```bash
git clone https://github.com/sitespeedio/onlinetest.git
cd onlinetest
docker compose up
```

In the repository you also have a *.env* file that sends up username/passwords for the different services.

## Configuration
If you start the applications, the default configuration is used. The configuration for the server is [here](https://github.com/sitespeedio/onlinetest/blob/main/server/config/default.yaml) and testrunner [here](https://github.com/sitespeedio/onlinetest/blob/main/testrunner/config/default.yaml). 

You can (and should) override that configuration by command line parameters or you can replace the configuration by using your own configuration file. Take a copy of the default ones and reconfigure it the way you need it.

### YAML / JSON
The configuration files can be YAML or JSON. Using a configuration file should be your first choice.

You can feed a configuration file use the command line: `--config`.

When configuring the testrunner, the configuration will be validated and if the configuration is broken, the testrunner will not start. Look at the log and hopeful you will get a helpful message to fix what's broken.

### Command line override

If you just need to change one or two configurations, you can use the command line override. If your configuration looks like this:

```json
    redis: {
        host: "127.0.0.1"
    }
```

You can override that with `--redis.host MY_HOST`.

### sitespeed.io configuration
You can also pre-configure how you will use sitespeed.io. For example checkout the [default configuration](https://github.com/sitespeedio/onlinetest/blob/main/server/config/sitespeed.json) where we setup S3 and how you access the result. 

The configuration for sitespeed.io uses inheritance. On the server you can configure a sitespeed.io configuration. That configuration will be passed on to the testrunner that will be merged together with the sitespeed.io configuration on the testrunner. And then as a final step that configuration will be merged with the config from the cli API or the GUI. It looks like this:

**server -> testrunner -> cli/gui configurations**

This way you can configure some parts globally (in the server config) and some things locally (per testrunner) and some parts for individual parts.

## The server

The server will host the HTML GUI and the API. There's a lot of things you can configure on the server.

### Start the server
If your server is installed globally, you start it by running `sitespeed.io-server`.

When you have your own configuration, you feed that like this:
`sitespeed.io-server --config path/to/file`.


### Database and Redis
The first thing you need to do is to configure the PostgreSQL and Redis connection to match your setup. The default setup is using localhost and default passwords, change those so they match your setup.

### HTTPS
If you want your server behind HTTPS, you can setup a reverse proxy or configure the path to keys and certicates.

```yaml
server:
  # Configure SSL. Add the path to the key and certificate file
  ssl:
    key: 
    cert:
```

### Limit who can run tests
You probably want to make sure that your instance isn't open for every one to add tests. There's a couple of ways you limit who can use your instance by just using configuration.

#### Adding Basic Auth
The server can be behind basic authentication. You do that with the follwing configuration.

```yaml
basicAuth:
  login:
  password:
```
The basic auth will be added to all URLs except calls to the API and the admin pages (the admin page has other basic auth configuration).

#### Key for running tests through the API

You can setup a secret key that needs to be used when you send tests to the API. You configure that under *api.key* or in YAML:

```yaml
api:
  key: MY_KEY
```

Then when you use sitespeed.io and the API make sure to add `--api.key MY_KEY` to your configuration.

#### Validate test domains
You probably want to limit which domains you can test through the GUI on the server. You do that with the configuration *validTestDomains*. That needs to be a regular expression that will be matched against the hostname of the URL that you want to test.

By default I've setup Wikipedia domains as what needs to be matched so you want to change that. 


#### Disable the GUI
You can fully disable the GUI. That way you can only add test through the API.
You do that by setting `disableGUI: true`.

#### Disable the search
You can choose to only disable the search functionality, You do that with 
`disableSearchGUI: true`.

### Style the pages
If you want to style the servers pages, you can do that by adding extra CSS and your own images. In the [default configuration](https://github.com/sitespeedio/onlinetest/blob/main/server/config/default.yaml) look for the *html* key.

That is straightforward and to get it to work, you should also configure where you (locally) host your CSS/images. You do that in:

```yaml
html:
 extras:
    path:
```

You set the path to where you host the files on the server. They will then we accessible through */extras/*.

### Waiting behavoir
You can choose what the user will see when she waits for the test to finish. By default the log from sitespeed.io will be streamed on the wait screen so you can follow along how far the test has gone.

If you are not interested in that, you can chose to show random AI generated images. You do that with:

```yaml
html
    showRandomAIImage: true
```

More well curated images will come later :)

### Change the locale
Do your users not have English as first language? You can then change the language! Use the [default one](https://github.com/sitespeedio/onlinetest/blob/main/server/locales/en.json) and create a new file for your language. 

```yaml
localization:
  defaultLocale: en
   directory: /path/to/your/directory
```

## The testrunner
If your testrunner is installed globally, you start it by running `sitespeed.io-testrunner`.

When you have your own configuration, you feed that like this:
`sitespeed.io-testrunner --config path/to/file`.

### Redis
Your testrunner need to be able to connect to your Redis-like queue, so make sure to configure your configuratoon

### Setup what type of tests to run

#### Desktop/emulated mobile

#### Android

### Using sitespeed.io Docker containers

## Dependencies

### Message broker

### Database

### Result storage

## Configuration for production
Here's a checklist of things that you should think about when you push to production:

1. Change all the default passwords. Do it for Redis/PostgreSQL/Admin/Basic Auth. :)
2. Limit your instance:
    * Basic Auth for adding tests through the web gui
    * A secret key for adding tests though the API
    * A regex that needs to match the domain that you want to test
    * Disable search
    * Disable adding test through the web gui.
* How long to keep the data

## Using the API

