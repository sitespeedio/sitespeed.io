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

Sitespeed.io uses a plugin architecture where you can add/remove your own plugins that will run additional tests on the URLs or anything else you can think of with the results (store to a database or ...).


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

These are the default plugins.

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
You can also add a plugin. Plugins you create yourself or plugins that are not enabled by default. The analysisStorer plugin stores the original JSON data from analyzers (from Browsertime, Coach data, WebPageTest etc).

~~~ bash
$ sitespeed.io https://www.sitespeed.io --plugins.load analysisStorer
~~~

# Create your own plugin
Here's an example of the functions each plugin can implement. You should look at the source code for different examples and we will setup an example plugin later on.

~~~ javascript
const path = require('path');

module.exports = {
  name() {
    // This is ... shocking news the name of the plugin
    return path.basename(__dirname);
  },

  open(context, options) {
    // when sitespeed.io start it calls the open function for all plugins
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
    // When all URLs are finished all plugins close function is called.
    // Options are the configuration options and errors a array of errors
    // from the run.
  }

};
~~~
