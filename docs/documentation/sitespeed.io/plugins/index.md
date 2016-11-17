---
layout: default
title: Create your own plugin for sitespeed.io
description:
keywords: plugin, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Create your own plugin for sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Plugins

# Plugins
{:.no_toc}

* Lets place the TOC here
{:toc}

Sitespeed.io uses a plugin architecture where you can add/remove/create your own plugins that runs additional tests on URLs or do something else with the result, like store it to a database.

The basic you can do is list configured plugins (which are currently used), disable one of the default plugin or add/enable more plugins.

## List configured plugins
You can list the plugins that will be used when you do a run:

~~~ bash
$ sitespeed.io --plugins.list https://en.wikipedia.org/wiki/Barack_Obama
~~~

And you will get a log entry looking something like this:

~~~
...
The following plugins are enabled: assets,browsertime,coach,domains,html,screenshot
...
~~~

These are the default plugins. The default plugins lives in the [plugin folder](https://github.com/sitespeedio/sitespeed.io/tree/master/lib/plugins) in the sitespeed.io source tree. That's a good start to look if you wanna build your own plugin.

## Disable a plugin
You can disable default plugins if you want. Maybe you don't want to output HTML and only want to send the data to Graphite or you don't need the screenshots.

~~~ bash
$ sitespeed.io https://www.sitespeed.io --plugins.disable html
~~~

If you want to disable multiple plugins:

~~~ bash
$ sitespeed.io https://www.sitespeed.io --plugins.disable html screenshot
~~~

And if you want to verify that it worked, add the plugins.list:

~~~ bash
$ sitespeed.io https://www.sitespeed.io --plugins.disable html screenshot --plugins.list
~~~

## Add a plugin
You can also add a plugin. Plugins you create yourself, plugins others has created or plugins that are not enabled by default.

There's a plugin bundled with sitespeed.io called *analysisStorer* plugin that isn't enabled by default. It stores the original JSON data from all analyzers (from Browsertime, Coach data, WebPageTest etc) to disk. You can enable it like this:

~~~ bash
$ sitespeed.io https://www.sitespeed.io --plugins.load analysisStorer
~~~

If you want to run plugins that you created yourself or shared from others, you can either install the plugin using npm (locally) and load it by name or point out the directory where the plugin lives.

~~~ bash
$ sitespeed.io https://www.sitespeed.io --plugins.load ../my/super/plugin
~~~

### Plugin in Docker

If you run in Docker you need to mount your plugin as a volume. Practically you should clone your repo on your server and then mount it like this.

~~~ bash
docker run -v /Users/peter/git/myplugin/:/myplugin sitespeedio/sitespeed.io -b firefox --plugins.load /myplugin -n 1 https://www.sitespeed.io/
~~~

# Create your own plugin
You can create your own plugin! Share it with others by publish it to npm or just use Github.

## Basic structure
Your plugin needs to follow this structure.

~~~ javascript
const path = require('path');
const log = require('intel').getLogger('plugins.'+path.basename(__dirname));

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
The open function is called once when sitespeed.io starts, it's here you can initialize whatever you need in your plugin. You will get the *context* and the *options*.

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

You can checkout the [StorageManager](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/support/storageManager.js) and the [DataCollection](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/support/dataCollection.js) to get a feeling of what you can do.

The *options* are the options that you supply in the CLI, checkout the [CLI implementation](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/support/cli.js) to see all the options.

### processMessage(message, queue)
The processMessage function in your plugin is called for each and every message that is passed in the application. So what's a message then? Everything is message in sitespeed.io :) A message contains the following information:

 * **uuid** a unique id
 * **type** the type of a message, so you as a plugin know if you are interested in this message type or not.
 * **timestamp** when the message was created
 * **source** who created the message
 * **data** the data that is sent in the message
 * **extras** whatever extra that you wanna include in a message

When you start the application and feed it with URLs, each URL will generate a message if type URL and is sent to all configured plugins.

If you wanna catch it, you can do something like this:

~~~
switch (message.type) {
  case 'url':
    {
      // do some analyze on the URL
    }
~~~

Then when you are finished analyzing the URL, your plugin can then send a message with the result, so other plugins can use it.

Here's a snippet of when Browsertime sends the screenshots message (the actual screenshot is in *results.screenshots*):

~~~
const messageMaker = require('support/messageMaker');
...

queue.postMessage(make('browsertime.screenshot', results.screenshots, {
  url,
  group
}));
~~~

If you wanna send messages inside your plugin, your plugin needs to depend on sitespeed and you can require the message maker like this:

~~~
const messageMaker = require('sitespeed.io/lib/support/messageMaker');
~~~


### close(options, errors)
When all URLs is analyzed, the close function is called once for each plugin. You can use that to store data that you collected.

### What's missing
There's no way for a plugin to tell the CLI about what type of configuration/options that's needed, but there's an [issue](https://github.com/sitespeedio/sitespeed.io/issues/1065) for that.
