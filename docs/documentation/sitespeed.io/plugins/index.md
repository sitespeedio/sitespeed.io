---
layout: default
title: Create your own plugin for sitespeed.io
description: Create your own plugin to store metrics wherever you want or to test other things.
keywords: plugin, create, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Create your own plugin for sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Plugins

# Plugins
{:.no_toc}

* Lets place the TOC here
{:toc}

Sitespeed.io uses a plugin architecture. This architecture allows you to add/remove/create your own plugins that can run additional tests on URLs or do other things with the result, like store it to a database.

The most basic things you can do is list configured plugins (which are currently used), disable one of the default plugin, or add/enable more plugins.

## List configured plugins
You can list the plugins that will be used when you do a run:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --plugins.list https://en.wikipedia.org/wiki/Barack_Obama
~~~

And you will get a log entry that looks something like this:

~~~
...
The following plugins are enabled: assets,browsertime,coach,domains,html,screenshot
...
~~~

The default plugins lives in the [plugin folder](https://github.com/sitespeedio/sitespeed.io/tree/master/lib/plugins). This is a good starting place to look at if you wanna build your own plugin.

## Disable a plugin
You can remove/disable default plugins if needed. For instance you may not want to output HTML and strictly send the data to Graphite.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --plugins.remove html
~~~

If you want to disable multiple plugins say you don't need the html or screenshots:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --plugins.remove html screenshot
~~~

At anytime if you want to verify that disabling worked, add the plugins.list to your command:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --plugins.remove html screenshot --plugins.list
~~~

## Add a plugin
You can also add a plugin. This is great if you have plugins you created yourself, plugins others have created, or plugins that are not enabled by default.

There's a plugin bundled with sitespeed.io called *analysisstorer* plugin that isn't enabled by default. It stores the original JSON data from all analyzers (from Browsertime, Coach data, WebPageTest etc) to disk. You can enable this plugin like so:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io --plugins.add analysisstorer
~~~

If you want to run plugins that you created yourself or that are shared from others, you can either install the plugin using npm (locally) and load it by name or point out the directory where the plugin lives.


### Mount your plugin in Docker

If you run in Docker and you should. You will need to mount your plugin directory as a volume. This is the recommended best practice. Practically you should clone your repo on your server and then mount it like this.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} -b firefox --plugins.add /sitespeed.io/myplugin -n 1 https://www.sitespeed.io/
~~~

### Relative using NodeJS
If you are running outside of Docker you can load it relative locally.

~~~bash
sitespeed.io https://www.sitespeed.io --plugins.add ../my/super/plugin
~~~

### Pre-baked Docker file
If you want to create an image of sitespeed.io with your plugins pre-baked for sharing you can also do so using the following Dockerfile.

~~~
FROM sitespeedio/sitespeed.io:<insert version here>

COPY <path to your plugin> /my-custom-plugin
~~~

Then build the docker image

~~~bash
docker build -t my-custom-sitespeedio ./plugins
~~~

Finally you can run it the same way as mentioned above without the volume mount.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io my-custom-sitespeedio firefox --plugins.add /my-custom-plugin --my-custom-plugin.option test -n 1 https://www.sitespeed.io/
~~~

Pretty cool, huh? :-)

## How to create your own plugin
First let us know about your cool plugin! Then share it with others by publish it to npm or just use Github.

### Basic structure
Your plugin needs to follow this structure.

~~~javascript
const path = require('path');

module.exports = {
  name() {
    // This is ... shocking news: the name of the plugin
    return path.basename(__dirname);
  },

  open(context, options) {
    // when sitespeed.io start it calls the open function once for all plugins
    // the context holds information for this specific run that
    // generated at runtime, for example you can get hold of the storageManager
    // that stores files to disk.
    // The options is the configuration supplied for the run.
  },
  processMessage(message, queue) {
    // The plugin will get all messages sent through the queue
    // and can act on specific messages by type:
    // message.type
  },
  close(options, errors) {
    // When all URLs are finished all plugins close function is called once.
    // Options are the configuration options and errors a array of errors
    // from the run.
  }
};
~~~

### name()
This is the name of your plugin. You can use the name when you want to target specific options to your plugin. If you're plugin name is *browsertime* you can make sure all your options start with that name.

### open(context, options)
The open function is called once when sitespeed.io starts, it's in this function you can initialise whatever you need within your plugin. You will get the *context* and the *options*.

The *context* holds information for this specific run that generated at runtime and looks like this:

~~~
{
  storageManager,  // The storage manager is what you use to store data to disk
  resultUrls,
  timestamp, // The timestamp of when you started the run
  budget, // If you run with budget, the result will be here
  name, // The name of the run (the start URL )
  intel, // The log system that is used within sitespeed.io https://github.com/seanmonstar/intel
  messageMaker, // Help methods to send messages in the queue,
  statsHelpers, // Help methods to collect data per domain/tests instead of per URL
  filterRegistry // Register metrics that will be sent to Graphite/InfluxDB
}
~~~

You can checkout the [StorageManager](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/core/resultsStorage/storageManager.js),
[messageMaker](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/support/messageMaker.js),
[statsHelpers](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/support/statsHelpers.js) and [filterRegistry](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/support/filterRegistry.js) to get feel how you can use them.

The *options* are the options that a user will supply in the CLI, checkout the [CLI implementation](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/support/cli.js) to see all the options.

### processMessage(message, queue)
The processMessage function in your plugin is called for each and every message that is passed in the application. So what's a message you may ask? Everything is a message in sitespeed.io.:) A message contains the following information:

 * **uuid** a unique id
 * **type** the type of a message, so your plugin know if it is interested in this message type or not.
 * **timestamp** when the message was created
 * **source** who created the message
 * **data** the data that is sent in the message
 * **extras** whatever extra that you wanna include in a message

When you start the application and feed it with URLs, each URL will generate a message of type URL and will be sent to all configured plugins.

If you want to catch it, you can do something like this:

~~~
switch (message.type) {
  case 'url':
    {
      // do some analyse on the URL
    }
~~~

When you are finished analysing the URL, your plugin can then send a message with the result, so other plugins can use it.

Here's a snippet of Browsertime sending the screenshots message (the actual screenshot is in *results.screenshots*):

~~~
const messageMaker = context.messageMaker;
...

queue.postMessage(make('browsertime.screenshot', results.screenshots, {
  url,
  group
}));
~~~

If you want to send messages from within your plugin, you get it from the context.

~~~
const messageMaker = context.messageMaker;
~~~


### close(options, errors)
When all URLs have been analysed, the close function is called once for each plugin. The idea with the close function is to close down assets that your plugin created. Normally the close function is nothing you need to implement.

### Important messages
There are a couple of pre defined messages that will always passed around in the queue.

* **sitespeedio.setup** - is the first message that will be passed to all plugins. When you get this message you can pass on information to other plugins. For example if you send pug files to the HTML plugin or JavaScript to browsertime.
* **sitespeedio.summarize** - all URLs are analysed and the plugins need to summarise the metrics.
* **sitespeedio.render** - it is time to render (=write data to disk).

Plugins also pass on message to each other. The HTML plugin also sends a **html.finished** message when the HTML is written to disk. The S3 plugin listens for that message and when it gets it it uploads the files and then sends a **s3.finished** message. And then the Slack plugin listens on **s3.finished** messages and then sends a Slack message.

### Create HTML for your plugin

Since 6.0 your plugin can generate HTML. You can either generate HTML per run or per page. The first thing you need to do is to report your PUG file to the HTML plugin. You do that by sending a message to the HTML plugin.

#### Send your pug file to the HTML plugin

You start by listening to the generic setup message **sitespeedio.setup**. When you get that, you should send your pug file with a message called **html.pug**. That message needs to have four fields:

 * id = the id of the plugin, need to be unique.
 * name = the friendly name displayed in the tab showing the data.
 * pug = the pug file as a String.
 * type = can be run or pageSummary. **run** is data you collect on every run and it will be a tab on each run page. **pageSummary** is data for a specific page and will generate a tab on the page summary page. Most cases you will only need pageSummary data but if you have a tool that do multiple runs, then you should send the data per run (as Browsertime and WebPageTest do).

Sending a pug looks something like this:

~~~
case 'sitespeedio.setup': {
 queue.postMessage(
  make('html.pug', {
   id: 'gpsi',
   name: 'GPSI',
   pug: this.pug,
   type: 'pageSummary'
  })
 );
 break;
}
~~~

The HTML plugin will then listen to metrics sent with the type of the id and type, in this case *gpsi.pageSummary*.

#### Send the data
The HTML plugin will automatically pickup data sent with the types of \*.run and \*.pageSummary. All these needs to have the URL so that it can be mapped to the right place.

A message can look like this (the HTML plugin will pickup messages sent by combining the id + type):

~~~
queue.postMessage(
  make('gpsi.pageSummary', result, {
    url,
    group
   })
);
~~~

You can look at the standalone [GPSI plugin](https://github.com/sitespeedio/plugin-gpsi) or the [WebPageTest plugin](https://github.com/sitespeedio/sitespeed.io/tree/master/lib/plugins/webpagetest) as an example plugin that both sends run and pageSummary data.

## Let your plugin collect metrics using Browsertime

One new feature in 6.0 is that your plugin can tell Browsertime to run synchronous JavaScript on the page you test to
collect metrics.

You do that by in the setup phase, send the JavaScript you want to run to sitespeed.io

~~~
case 'sitespeedio.setup': {
 queue.postMessage(
   make('browsertime.scripts', {
     category: 'yourplugin',
     scripts: {
       userAgent: '(function() {return navigator.userAgent;})();',
       title: '(function() {return document.title;})();'
     }
   })
 )
 break;
}
~~~

You can also let Browsertime run asynchronous scripts, follow the same pattern and change the key to *browsertime.asyncscripts*.

You can then get the metrics back by listening on **browsertime.run** messages.

~~~
case 'browsertime.run': {
  console.log(message.data.yourplugin);
  break;
}
~~~

And if you want to use it in your pug template you will find it under **pageInfo.data.browsertime.run.yourplugin**. In this example, if you want to print the title you can do like this.

~~~
#{pageInfo.data.browsertime.run.yourplugin.title}
~~~

## Let your plugin add metrics to the performance budget

In the *sitespeedio.config* phase (where plugins can talk to each other) make sure to tell the budget plugin that you want it to collect metrics from your plugin. Do that by sending a message of the type *budget.addMessageType* and add the type of the metrics message you want it to collect.

In this example we tell the budget plugin that it should collect metrics of the type *gpsi.pagesummary*.

~~~
const messageMaker = context.messageMaker;
...

queue.postMessage(make('budget.addMessageType', {type: 'gpsi.pagesummary'}));
~~~

## Testing your plugin
If your plugin lives on Github you should check out our [example Travis-ci file](https://github.com/sitespeedio/plugin-gpsi/blob/master/.travis.yml) for the GPSI plugin. In the example, we checkout the sitespeed.io project and run the plugin against the latest master (we also run it daily in the Travis crontab).

## Example plugin(s)
You can look at the standalone [GPSI plugin](https://github.com/sitespeedio/plugin-gpsi) or the [WebPageTest plugin](https://github.com/sitespeedio/sitespeed.io/tree/master/lib/plugins/webpagetest).

## Find plugins
We keep a list of plugins at [https://github.com/sitespeedio/plugins](https://github.com/sitespeedio/plugins). If you wanna add your plugin, send a PR!

## What's missing
There's no way for a plugin to tell the CLI about what type of configuration/options that are needed, but there's an [issue](https://github.com/sitespeedio/sitespeed.io/issues/1065) for that. Help us out if you have ideas!
