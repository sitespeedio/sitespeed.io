---
layout: default
title: Introduction
description: Introduction — sitespeed.io scripting tutorial.
keywords: scripting, tutorial, sitespeed.io, browsertime
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Introduction

# Introduction
{:.no_toc}

{:toc}

Scripting in sitespeed.io and Browsertime allows you to measure user journeys by interacting with web pages. This feature is essential for simulating real-user interactions and collecting performance metrics for complex workflows. Scripting works the same in both Browsertime and sitespeed.io.

## Simple script
Here's a basic script example to start with:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  context.log.info('Start to measure my first URL');
  return commands.measure.start('https://www.sitespeed.io');
}
```

To run this script, use the command `sitespeed.io -n 1 --multi measure.mjs`. This script measures the performance of https://www.sitespeed.io.

You can see that you get two helper objects in that function. The browsertime context and browsertime commands. Let's talk about those helper objects.

## Helpers
Let's start with the command object.

### The Commands Object

[Commands]({{site.baseurl}}/documentation/sitespeed.io/scripting/Commands.html) are helpers for interacting with web pages. 

Inside your script, you access them as properties on *commands.*. You can use them to measure a URL like `await commands.measure.start('https://www.example.com');`. Many of the commands are asynchronous so you need to await them.

You can see all the commands [here]({{site.baseurl}}/documentation/sitespeed.io/scripting/Commands.html).

### The Context Object

The `context` object in your script is a helper object with access to the current run context. In most cases you only need it for the log, but for special use cases the other properties are handy.

The properties on the context object are:
- `options`: All options sent from the CLI to Browsertime/sitespeed.io. Here you can fetch parameters that you used when starting the test.
- `log`: An instance of the log system. Use it to log what you do.
- `index`: The index of the current run.
- `storageManager`: The manager that is used to read/store files to disk. 
- `selenium.webdriver`: The public API object of Selenium WebDriver. You need it if you want to run Selenium scripts.
- `selenium.driver`: The instantiated WebDriver for the current browser session.

## Asynchronous commands
Many Browsertime commands are asynchronous, returning promises. You can see this in the documentation — look for *async* in the function signature.

Use await to ensure the script waits for an action to complete. When using multiple async operations, return the last promise to ensure the script waits until all operations are complete.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.navigate('https://www.sitespeed.io');
  return commands.measure.start('https://www.sitespeed.io/documentation/');
}
```