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

![The setup]({{site.baseurl}}/img/onlinetestsetup.png)
{: .img-thumbnail}
e
## Installation

For small businesses needing to test one or a few websites, you can deploy everything on a single server. For large companies planning to run numerous tests, you can distribute the components across multiple servers. If you plan to run tests from various locations worldwide, ensure the web GUI, database, and Redis are located together in the same region.

To get the server and test runner running, you need to install [NodeJS](https://nodejs.org/). Please follow the instructions on [NodeJS](https://nodejs.org/) for your operating system. Install the LTS version (currently, that is NodeJS 20).


### Install the server

Get the latest release from npm:

```bash
npm install @sitespeed.io/server -g
```

### Install the test runner

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

### Configuring test environments
You need to configure what kind of tests you want to run.

#### Desktop/emulated mobile 
In most cases, the default configuration will be sufficient. It looks like this:

```yaml
- name: "Desktop Browsers"
  type: "desktop"
  browsers: ["chrome", "firefox", "edge"]
  connectivity: ["native", "3g", "4g", "cable"]
  useDocker: false
```

The browsers field lists the browsers you can use. The default sitespeed.io container includes the latest versions of all three browsers. If you set *useDocker* to true, all three will be available. If you install the browsers yourself on the server, you can edit the list accordingly.

When you set useDocker to true, the Docker container configured in:
```yaml
docker:
  container: "sitespeedio/sitespeed.io:latest"
```
is used. If you try the Docker container on your local machine, remember to change the settings for[how you upload the result](https://github.com/sitespeedio/onlinetest/blob/main/server/config/sitespeed.json) since localhost do not work automatically inside the Docker container. Use your host IP or *host.docker.internal* if you are on a Mac.

The connectivity array lists the different connectivity options you will see in the drop-down menu in the GUI.

#### Android
To run tests on an Android phone, you should follow the [sitespeed.io instructions on how to set up the phone and server](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#test-on-android). The server that runs your test runner needs to have ADB tools and sitespeed.io dependencies (so it can analyze the video, etc.).

Each phone needs to be configured on the test runner with the device ID.

```yaml
- name: "Android"
  type: "android"
  browsers: ["chrome", "firefox"]
  model: "Moto G5"
  deviceId: "ZY322MMFZ2"
  useDocker: false
  connectivity: ["native"]
```

By default, each phone will have its own queue of work, meaning you need to specify a specific device to pick up a job.

If you want to have multiple phones of the same model work on the same queue (to run multiple tests simultaneously), you can define your own queue name. Here's an example where two phones will take on jobs for all "motog5" tests.

```yaml
- name: "Android"
  type: "android"
  browsers: ["chrome", "firefox"]
  model: "Moto G5"
  deviceId: "ZY322MMFZ2"
  useDocker: false
  connectivity: ["native"]
  queue: "motog5"

- name: "Android"
  type: "android"
  browsers: ["chrome", "firefox"]
  model: "Moto G5"
  deviceId: "HAY562MARW6"
  useDocker: false
  connectivity: ["native"]
  queue: "motog5"
```

### Using sitespeed.io Docker containers

If you choose to use Docker, set `useDocker` to true in the configuration. Then all you need to do is make sure Docker is installed on the server.

You can configure which Docker container to use. Normally, when you run sitespeed.io, you should specify the exact sitespeed.io version, like `sitespeedio/sitespeed.io:36.0.0`, to know exactly which version you are using. However, if you want to deploy your test runner and let it auto-update, you can use `sitespeedio/sitespeed.io:latest` as the tag. Ensure that you update the container once per day with:

```yaml
docker:
  container: "sitespeedio/sitespeed.io:latest"
```

If you try out teh Docker containers locally on your machine, you need to remember remember that localhost inside the container isn't automatically the same as localhost on the server. You can read about it [here](https://www.sitespeed.io/documentation/sitespeed.io/docker/#access-localhost).

Yhat means if you run everything locally and want to use sitespeed.io docker containers, you need to set `--s3.endpoint` to something else than 127.0.0.1. On Mac you can use `--s3.endpoint http://host.docker.internal:9000` and on Linux you can use your actual IP. You can see how that is used in [one of our GitHUb Actions](https://github.com/sitespeedio/onlinetest/blob/main/.github/workflows/docker.yml#L45).

## Dependencies

To ensure the smooth operation of your sitespeed.io server and test runners, there are several dependencies you need to configure. These dependencies facilitate communication between components, data storage, and result processing. Here’s a brief overview of why these dependencies are necessary:

1. **Message broker**: Facilitates communication between the server and test runners.
2. **Database**: Stores configuration, test results, and other data.
3. **Result storage**: Manages the storage of HTML results and other test artifacts.


### Message broker

The communication between the server and test runners uses a Redis-like system. The default setting uses [KeyDb](https://docs.keydb.dev), but you can probably use anything that follows the Redis "standard". When the server and a test runner are started, they need access to the message broker.

### Database

PostgreSQL needs to have a database and table. This setup is handled in the Docker Compose file. If you want to set up the database manually, the table structure exists [here](https://github.com/sitespeedio/onlinetest/tree/main/server/database/setup).

### Result storage

The default setup uses [MinIO](https://min.io), which is an open-source version of S3, but you can use any sitespeed.io-compatible result storage. You configure this in the sitespeed.io JSON, preferably on the server. You can use S3, Google Cloud Storage, SCP to your own server, or create your own plugin to store the data wherever you want.

If you also use MinIO, make sure to configure how long the data will be stored. You can see how this is done in [the Docker Compose file](https://github.com/sitespeedio/onlinetest/blob/main/docker-compose.yml), and it looks something like this:

```bash
/usr/bin/mc ilm rule add --expire-days 30 sitespeedio/sitespeedio
```

## Configuration for production

Here's a checklist of things to consider when pushing to production:

1. **Change all the default passwords**:
   - Do this for Redis, PostgreSQL, Admin, Minio (or what you use) and Basic Auth.
2. **Change settings for where you upload your result**
   - Remember to change the [default settings](https://github.com/sitespeedio/onlinetest/blob/main/server/config/sitespeed.json) on where you upload the data and how you access it.
3. **Limit your instance**:
   - Use Basic Auth for adding tests through the web GUI.
   - Set a secret key for adding tests through the API.
   - Use a regular expression that needs to match the domain you want to test.
   - Disable search.
   - Disable adding tests through the web GUI.
4. **Data retention**:
   - If you use S3 (or Minio), make sure to configure how long the data will be kept.
   - Add a job to your PostgreSQL database to remove data older than X days. You can find an example script [here](https://github.com/sitespeedio/onlinetest/blob/main/server/database/delete/delete.sql).

# Using the API

You can use your normal sitespeed.io installation to pass tests to the server/test runner.

If you run `sitespeed.io --help`, you will see a section about the API. These configurations will be passed on to the test server. Your other configurations will be passed on to the test runner. This means you can configure your tests exactly as before and pass them on to the test server.

There are two parameters that you need to use:
* `--api.hostname` - The hostname of your server that hosts the sitespeed.io server.
* `--api.location` - The name of the location where you host your test runner (the `location.name` part in your test runner configuration).

You also have the following options:

- `--api.key`  - The API key to use. You configure the key in the server configuration.

- `--api.action` - The type of API call you want to make:
  - `add`: Add a test.
  - `addAndGetResult`: Add a test and wait for the result.
  - `get`: Get the result of a test.
  - To get the result, make sure you add the ID using `--api.id`.
  - [choices: "add", "addAndGetResult", "get"] [default: "addAndGetResult"]

- `--api.silent` - Set to `true` if you do not want to log anything from the communication between the API and the server.

- `--api.port` - The port for the API.

- `--api.id` - The ID of the test. Use it when you want to get the test result.

- `--api.label` - Add a label to your test.

- `--api.priority` - The priority of the test. Highest priority is 1. The default is 10.

- `--api.json` - Output the result as JSON.