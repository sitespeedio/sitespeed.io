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
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io --plugins.list https://en.wikipedia.org/wiki/Barack_Obama
~~~

And you will get a log entry that looks something like this:

~~~
...
The following plugins are enabled: assets,browsertime,coach,domains,html,screenshot
...
~~~

The default plugins lives in the [plugin folder](https://github.com/sitespeedio/sitespeed.io/tree/master/lib/plugins). This is a good starting place to look at if you wanna build your own plugin.

## Disable a plugin
You can disable default plugins if needed. For instance you may not want to output HTML and strictly send the data to Graphite.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io --plugins.disable html
~~~

If you want to disable multiple plugins say you don't need the html or screenshots:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io --plugins.disable html screenshot
~~~

At anytime if you want to verify that disabling worked, add the plugins.list to your command:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io --plugins.disable html screenshot --plugins.list
~~~

## Add a plugin
You can also add a plugin. This is great if you have plugins you created yourself, plugins others have created, or plugins that are not enabled by default.

There's a plugin bundled with sitespeed.io called *analysisstorer* plugin that isn't enabled by default. It stores the original JSON data from all analyzers (from Browsertime, Coach data, WebPageTest etc) to disk. You can enable this plugin like so:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io --plugins.load analysisstorer
~~~

If you want to run plugins that you created yourself or that are shared from others, you can either install the plugin using npm (locally) and load it by name or point out the directory where the plugin lives.

If you run in Docker and you should. You will need to mount your plugin directory as a volume. This is the recommended best practice. Practically you should clone your repo on your server and then mount it like this.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io -b firefox --plugins.load /sitespeed.io/myplugin -n 1 https://www.sitespeed.io/
~~~

If you are running outside of docker you can load it relative locally.

~~~bash
sitespeed.io https://www.sitespeed.io --plugins.load ../my/super/plugin
~~~

If you want to create an image of sitespeedio with your plugins pre-baked for sharing you can also do so using the following Dockerfile.

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
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io my-custom-sitespeedio firefox --plugins.load /my-custom-plugin --my-custom-plugin.option test -n 1 https://www.sitespeed.io/
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
The open function is called once when sitespeed.io starts, it's in this function you can initialize whatever you need within your plugin. You will get the *context* and the *options*.

The *context* holds information for this specific run that generated at runtime and looks like this:

~~~
{
  storageManager, // The storage manager is what you use to store data to disk
  dataCollection, // a shared collection of the collected data
  timestamp, // The timestamp of when you started the run
  budget, // If you run with budget, the result will be here
  log // The logger used in sitespeed.io, use it to log https://github.com/seanmonstar/intel
}
~~~

You can checkout the [StorageManager](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/support/resultsStorage/storageManager.js) and the [DataCollection](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/support/dataCollection.js) to get a feel of what you can accomplish.

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
      // do some analyze on the URL
    }
~~~

When you are finished analyzing the URL, your plugin can then send a message with the result, so other plugins can use it.

Here's a snippet of Browsertime sending the screenshots message (the actual screenshot is in *results.screenshots*):

~~~
const messageMaker = require('support/messageMaker');
...

queue.postMessage(make('browsertime.screenshot', results.screenshots, {
  url,
  group
}));
~~~

If you want to send messages from within your plugin, the plugin will need to depend on sitespeed and you can use require to include the message maker like this:

~~~
const messageMaker = require('sitespeed.io/lib/support/messageMaker');
~~~


### close(options, errors)
When all URLs have been analyzed, the close function is called once for each plugin. You can use this function to store the data that you collected.

## What's missing
There's no way for a plugin to tell the CLI about what type of configuration/options that are needed, but there's an [issue](https://github.com/sitespeedio/sitespeed.io/issues/1065) for that. Help us out if you have ideas!
