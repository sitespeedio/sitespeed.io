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
The online test is the simplest way to deploy your own version of sitespeed.io. You can add tests through a web GUI or by using the sitespeed.io command line, which can pass the tests to your test server.

This method is ideal for small, medium, and large companies and organizations that need a GUI for running performance tests.

To get started, you will need the sitespeed.io server, at least one sitespeed.io test runner, and the necessary dependencies (a message broker like Redis, PostgreSQL, and a place to store the result pages).

## Installation

For small businesses needing to test one or a few websites, you can deploy everything on a single server. For large companies planning to run numerous tests, you can distribute the components across multiple servers. If you plan to run tests from various locations worldwide, ensure the web GUI, database, and Redis are located together in the same region.

### Node version

To get the server and test runner running, you need to install [NodeJS](https://nodejs.org/). Please follow the instructions on [NodeJS](https://nodejs.org/) for your operating system. Install the LTS version (currently, that is NodeJS 20).


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

The test runner can either use our [pre-made sitespeed.io Docker container](https://hub.docker.com/r/sitespeedio/sitespeed.io) (in which case you need to install Docker) or use the npm-installed sitespeed.io. If you choose not to use Docker, follow [these instructions](https://www.sitespeed.io/documentation/sitespeed.io/installation/#using-node-js) to get sitespeed.io up and running.


### Install the dependencies
You need to have KeyDB (or a similar message broker that follow the Redis APIs), PostgreSQL and somewhere to store the HTML result. If you don't want to handle the dependencies yourself you can use [our docker compose file](https://github.com/sitespeedio/onlinetest/blob/main/docker-compose.yml). You need to have Docker and Docker compose installed to run it.

To get the Docker Compose file, the easiest way for testing is to clone the repository:

```bash
git clone https://github.com/sitespeedio/onlinetest.git
cd onlinetest
docker compose up
```

In the repository you also have a *.env* file that sets up username/passwords for the different services.

## Configuration
If you start the applications, the default configuration is used. The configuration for the server is [here](https://github.com/sitespeedio/onlinetest/blob/main/server/config/default.yaml) and for the test runner [here](https://github.com/sitespeedio/onlinetest/blob/main/testrunner/config/default.yaml).

You can (and should) override that configuration with command line parameters, or you can replace the configuration by using your own configuration file. Take a copy of the default ones and reconfigure them the way you need.

### YAML / JSON
The configuration files can be YAML or JSON. Using a configuration file should be your first choice.

You can provide a configuration file using the command line: `--config`.

When configuring the test runner, the configuration will be validated. If the configuration is broken, the test runner will not start. Check the log for a helpful message to fix what's broken.

### Command line override

If you just need to change one or two configurations, you can use the command line override. If your configuration looks like this:

```json
    redis: {
        host: "127.0.0.1"
    }
```

You can override that with `--redis.host MY_HOST`.

### sitespeed.io configuration

You can also pre-configure how you will use sitespeed.io. For example, check out the [default configuration](https://github.com/sitespeedio/onlinetest/blob/main/server/config/sitespeed.json) where we set up S3 and how you access the results.

The configuration for sitespeed.io uses inheritance. On the server, you can configure a sitespeed.io configuration. That configuration will be passed on to the test runner and merged with the sitespeed.io configuration on the test runner. Finally, this configuration will be merged with the configuration from the CLI API or the GUI. It looks like this:

**server -> test runner -> CLI/GUI configurations**

This way, you can configure some parts globally (in the server config), some things locally (per test runner), and some parts individually per test.


## The server

The server will host the HTML GUI and the API. There's a lot of things you can configure on the server.

### Start the server

If your server is installed globally, you start it by running `sitespeed.io-server`.

When you have your own configuration, you provide it like this:
```bash
sitespeed.io-server --config path/to/file
```

### Database and message broker

The first thing you need to do is configure the PostgreSQL and Redis connections to match your setup. The default setup uses localhost and default passwords. Make sure to change these settings to match your specific configuration.

### HTTPS

If you want your server behind HTTPS, you can set up a reverse proxy or configure the path to keys and certificates.

```yaml
server:
  # Configure SSL. Add the path to the key and certificate file
  ssl:
    key: 
    cert:
```

### Limit who can run tests

You probably want to make sure that your instance isn't open for everyone to add tests. There are a couple of ways to limit who can use your instance by just using configuration.

#### Adding Basic Auth

The server can be secured with basic authentication. You can configure it with the following settings:

```yaml
basicAuth:
  login:
  password:
```

The basic auth will be applied to all URLs except calls to the API and the admin pages (the admin page has a separate basic auth configuration).

#### Key for running tests through the API

You can set up a secret key that needs to be used when you send tests to the API. You configure that under *api.key* or in YAML:

```yaml
api:
  key: MY_KEY
```

Then when you use sitespeed.io and the API make sure to use`--api.key MY_KEY` to your configuration.

#### Validate test domains

You probably want to limit which domains can be tested through the GUI on the server. You can do this with the *validTestDomains* configuration. This needs to be a regular expression that will be matched against the hostname of the URL that you want to test.

By default, Wikipedia domains are set as valid, so you will want to change that.

Here are a couple of examples:

* To test all URLs on https://www.sitespeed.io: `validTestDomains: "^www\.sitespeed\.io$"`
* To allow testing of any URLs: `validTestDomains: ".*"`

#### Disable the GUI
You can fully disable the GUI so that tests can only be added through the API. You do this by setting: `disableGUI: true`.

#### Disable the search
You can choose to only disable the search functionality. You do this by setting: `disableSearchGUI: true`.

### Style the pages
If you want to style the server's pages, you can do so by adding extra CSS and your own images. In the [default configuration](https://github.com/sitespeedio/onlinetest/blob/main/server/config/default.yaml), look for the *html* key.

To get this to work, you should also configure where you locally host your CSS/images. You do that with the following configuration:

```yaml
html:
 extras:
    path:
```

Set the path to where you host the files on the server. They will then be accessible through */extras/*.

### Waiting on tests to finish
You can choose what the user will see while waiting for the test to finish. By default, the log from sitespeed.io will be streamed on the wait screen so users can follow the progress of the test.

If you are not interested in that, you can choose to show random AI-generated images. You do that with:

```yaml
html
    showRandomAIImage: true
```

More well-curated images will come later. :)

### Change the locale

Do your users not have English as their first language? You can change the language! Use the [default locale file](https://github.com/sitespeedio/onlinetest/blob/main/server/locales/en.json) and create a new file for your language.

```yaml
localization:
  defaultLocale: en
   directory: /path/to/your/directory
```

## The testrunner
If your testrunner is installed globally, you start it by running `sitespeed.io-testrunner`.

When you have your own configuration, you provide it like this:
`sitespeed.io-testrunner --config path/to/file`.

### Message broker
Your testrunner needs to be able to connect to your Redis-like broker, so make sure to configure it accordingly in your configuration file.

### Setup what type of tests to run
What kind of tests do you want to run.

#### Desktop/emulated mobile 
In most cases the default configuration will be enough.

#### Android
To run tests on an Android phone, you should follow the [sitespeed.io instructions on how to setup the phone and server](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#test-on-android). The server that runs your testrunner needs to have adb tools and sitespeed.io dependencies (so it can analyze the video etc).

Each phone needs to be configured on the test runner with the device id. That's how

### Using sitespeed.io Docker containers

If you choose to use Docker, set `useDocker` to true in the configuration. Then all you need to do is to make sure to have Docker installed on the server.

You can configure which Docker container to use. Normally when you run sitespeed.io you should configure the exact sitespeed.io version like `sitespeedio/sitespeed.io:36.0.0` to know exact which version you are using. However if you want to deploy your testrunner and then let it auto update, you can use `sitespeedio/sitespeed.io:latest` as the tag and then make sure that you once per day update the container `docker pull sitespeedio/sitespeed.io:latest`.

```yaml
docker:
  container: "sitespeedio/sitespeed.io:latest"
```

## Dependencies


### Message broker
The communication between the server and testrunners use a Redis like system. The default setting uses [KeyDb](https://docs.keydb.dev) but you could probaby use anything that follow the Redis "standard". When the server and a testrunner is started, they need to have access to the message broker.

### Database
The PostgreSQL needs to have a database and table. That setup happens in the Docker compose file. If you manually want to setup the database, the table structure exists [here](https://github.com/sitespeedio/onlinetest/tree/main/server/database/setup).

### Result storage
The default setup uses https://min.io that is an Open Source version of S3 but you can use and sitespeed.io compability result storage. You configure that yourself in the sitespeed.io json, preferable on the server. You can use S3, Google Cloud Storage, scp to your own server or create your own plugin that store the date wherever you want.

If you also use minio, make sure to configure how long the data will be stored. You can see how that is done in [the docker compose file](https://github.com/sitespeedio/onlinetest/blob/main/docker-compose.yml) and it looks something like this ` /usr/bin/mc ilm rule add --expire-days 30 sitespeedio/sitespeedio`.

## Configuration for production
Here's a checklist of things that you should think about when you push to production:

1. Change all the default passwords. Do it for Redis/PostgreSQL/Admin/Basic Auth. :)
2. Limit your instance:
    * Basic Auth for adding tests through the web gui
    * A secret key for adding tests though the API
    * A regex that needs to match the domain that you want to test
    * Disable search
    * Disable adding test through the web gui.
3. How long time to do you want to keep the data? If you use S3 make sure to configure how long time the data will be kept. And a job to your PostgreSQL database that removes

## Using the API

