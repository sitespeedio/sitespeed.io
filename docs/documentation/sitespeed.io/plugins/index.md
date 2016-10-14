---
layout: default
title: Create your own plugin for sitespeed.io
description:
keywords: plugin, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Create your own plugin for sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Plugins

# Plugins
{:.no_toc}

* Lets place the TOC here
{:toc}

Sitespeed.io uses a plugin architecture where you can remove/add your own plugins that can run additional tests on the URLs or do what you want with the result (store to a database or ...).


## List configured plugins
You can list the plugins that will be used when you do a run:

~~~ bash
$ sitespeed.io --plugins.list https://en.wikipedia.org/wiki/Barack_Obama
~~~

And you will get a log entry looking something like this:

~~~
...
The following plugins is enabled: assets,browsertime,coach,domains,html,screenshot
...
~~~

These are the default plugins. If you want to disable some of them then ...

## Disable a plugin
You can disable default plugins if you want. Maybe you don't need to output HTML and only send the data to Graphite or you don't need the screenshots.

~~~ bash
$ sitespeed.io https://www.sitespeed.io --plugins.disable html
~~~

If you wanna disable multiple plugins:

~~~ bash
$ sitespeed.io https://www.sitespeed.io --plugins.disable html screenshot
~~~

And if you wanna verify that it worked, add the plugins.list:

~~~ bash
$ sitespeed.io https://www.sitespeed.io --plugins.disable html screenshot --plugins.list
~~~

## Add a plugin
You can also add a plugin. Plugins you create yourself or plugins that isn't enabled by default. The analysisStorer plugin stores the original JSON data from analyzers (from Browsertime, Coach data, WebPageTest etc).

~~~ bash
$ sitespeed.io https://www.sitespeed.io --plugins.load analysisStorer
~~~

# Create your own plugin
