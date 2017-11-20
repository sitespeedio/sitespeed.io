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

### Graphite users
We have switched to Graphite 1.x by default (from Graphite 0.x). When Graphite moved to 1.0 they changed how annotations is handled. If you use 0.x version you and send annotations through sitespeed.io you need to add ```--graphite.arrayTags false``` to make it continue to work as before.

### Video and Speed Index default in the Docker containers
In the new version we have video and Speed Index turned on by default when you run in our Docker containers. If you want to turn them off add ```--video false``` and ```--speedIndex false``` to your run.

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
