---
layout: default
title: Android devices
description: Android devices — sitespeed.io scripting tutorial.
keywords: scripting, tutorial, sitespeed.io, browsertime
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Android devices

# Android devices
{:.no_toc}

{:toc}

Testing on an Android device should work the same way as testing on desktop, as long as you setup your device following [the instructions](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#prerequisites).

## Run shell command
If you run your tests on an Android phone you can interact with your phone through the shell.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // Get the temperature from the phone
  const temperature = await commands.android.shell("dumpsys battery | grep temperature | grep -Eo '[0-9]{1,3}'");
  context.log.info('The battery temperature is %s', temperature/10);
  // Start the test
  return commands.measure.start(
    'https://www.sitespeed.io'
  );
};
```

## Run shell command as root
If you rooted your device and want to run as root.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // Get the temperature from the phone
  const temperature = await commands.android.shellAsRoot("dumpsys battery | grep temperature | grep -Eo '[0-9]{1,3}'");
  context.log.info('The battery temperature is %s', temperature/10);
  // Start the test
  return commands.measure.start(
    'https://www.sitespeed.io'
  );
};
```