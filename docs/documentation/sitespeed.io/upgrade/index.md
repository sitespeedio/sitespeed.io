---
layout: default
title: Upgrade from sitespeed.io 5.x to 6.x
description: This guide helps you upgrade from sitespeed.io 5.x to 6.0
keywords: upgrading, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Upgrade 5 -> 6
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Upgrade

# Upgrade
{:.no_toc}

* Lets place the TOC here
{:toc}

Upgrading to 6.x from 5.x? There are a couple of important things that have changed that you should read before you do the switch.

## Regular user
As a regular user there are a couple of changes you need to know about. Nothing will break there's a few configuration changes you should do.

### Default 30 fps for the video
In older versions the default frames per second for the video was 60. On cloud services that could be too much, introducing unstable metrics. If you still want to use 60fps you can do that by adding ```--videoParams.framerate 60``` to your run.

Do a test run with 30fps and check what happens to your Visual Metrics.

### Graphite users
We have switched to Graphite 1.x by default (from Graphite 0.x). When Graphite moved to 1.0 they changed how annotations is handled. If you use 0.x version you and send annotations through sitespeed.io you need to add ```--graphite.arrayTags false``` to make it continue to work as before.

### Video and Speed Index default in the Docker containers
In the new version we have video and Speed Index turned on by default when you run in our Docker containers. If you want to turn them off add ```--video false``` and ```--speedIndex false``` to your run.

### npm/yarn
If you don't use our Docker containers (you should!) and install via npm/yarn, we know use latest LTS of NodeJS 8.9.1 (so you should upgrade your NodeJS version too).

### Assets timings with more in details info
For 99.9% of the users this will not change anything but if you are sending assets timings to Graphite/InfluxDB (as we told you **not** to do) we changed so instead of getting the total time you now get: blocked, dns, connect, send, wait and receive timings [#1693](https://github.com/sitespeedio/sitespeed.io/pull/1693).

### GPSI users
We have moved the GPSI outside of sitespeed.io and you can find it [here](https://github.com/sitespeedio/plugin-gpsi). To run in along with sitespeed.io you just follow [the instructions how to add a plugin](https://www.sitespeed.io/documentation/sitespeed.io/plugins/#add-a-plugin). We moved it outside of sitespeed.io to make the code base cleaner and with the hope that we can find a maintainer who can give it more love.

## Plugin makers
We have made some changes to plugins to make it possible for plugins to generate HTML and to talk to each other before sitespeed.io starts to test URLs.

### No more hooks, say hello to new messages on the queue

In 5.X we relied on hooks for plugins, but we remove them and changed to use messages.

In 6.x your plugin should have an *open* function (called on startup), *processMessage* (getting all messages that are passed around in the queue) and *close* (optional).

We now have three messages sent by the queue:

 -  **sitespeedio.setup** - The first message on the queue. A plugin can pickup this message and communicate with other plugins (send pugs to the HTML plugin, send JavaScript to Browsertime etc).
 -  **sitespeedio.summarize** (old message **summarize**) that tells the plugins that all URLs are analysed and you can now summarise the metrics.
 - **sitespeedio.render** which tells the plugins to render content to disk. The HTML plugin pickup **sitespeedio.render**, render the HTML and then sends a **html.finished** message, that then other plugins can pickup.

We changed name of the old message **summarize** to **sitespeedio.summarize**.

This means you need to remove your hooks and act on the messages instead.

You can check out the changes in [#1732](https://github.com/sitespeedio/sitespeed.io/pull/1732) [#1758](https://github.com/sitespeedio/sitespeed.io/pull/1758).


### No generic Datacollector
One of the bad design in the old 5.x code was the [DataCollector](https://github.com/sitespeedio/sitespeed.io/blob/5.x/lib/plugins/datacollector/index.js) (generic collector of data). We removed that now and that means each and every plugin needs to collect the data it needs themselves.

You can checkout how we do in the [HTML plugin](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/plugins/html/index.js) and the [Slack plugin](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/plugins/slack/index.js).

The easiest (but a little ugly) way to migrate is to move the old [DataCollector code](https://github.com/sitespeedio/sitespeed.io/blob/5.x/lib/plugins/datacollector/index.js)) to your own plugin. The better way is to cherry pick the metrics/data that your plugin needs.

You can see the changes we did in
 [#1731](https://github.com/sitespeedio/sitespeed.io/pull/1731) and [#1767](https://github.com/sitespeedio/sitespeed.io/pull/1767).


### StorageManager API changes

Several parts of the [StorageManager](https://github.com/sitespeedio/sitespeed.io/blob/master/lib/core/resultsStorage/storageManager.js) API have been updated to fit better together. The following changes may break code written using the 5.x API:

- `createDataDir(directoryName)` is now `createDirectory(...directoryNames)` and takes any number of directory names (which will be joined together) as arguments.
- `writeData(filename, data)` has reversed the order of its arguments. It is now `writeData(data, filename)`.
- `writeHtml(filename, html)` has reversed the order of its arguments. It is now `writeHtml(html, filename)`.
- `writeDataForUrl(data, filename, url, subDir)` no longer has a fifth argument indicating whether output should be gzipped.
- `writeHtmlForUrl(html, filename, url)` no longer has a fourth argument indicating whether output should be gzipped.

Note that all compression functionality has been removed. If you need compressed output, your plugin should handle gzipping itself. See the [`harstorer` plugin](https://github.com/sitespeedio/sitespeed.io/blob/56bfc48bac7ccfe1cfe35c829b4dd11987a375e4/lib/plugins/harstorer/index.js#L19-L28) for an example.
