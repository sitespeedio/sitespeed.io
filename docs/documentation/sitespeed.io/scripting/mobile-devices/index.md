---
layout: default
title: Mobile devices
description: Scripting on Android phones and iOS devices.
keywords: scripting, tutorial, sitespeed.io, browsertime, android, ios, iphone
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Mobile devices

# Mobile devices
{:.no_toc}

{:toc}

Most of your script works the same on a mobile device as it does on the desktop — `commands.measure.start`, `commands.click`, `commands.wait` etc. don't care which OS the browser is running on. The platform-specific parts are what changes: Android exposes a shell to your script, iOS doesn't, and the two have different sets of supported browsers and protocols.

## Android

Testing on an Android device should work the same way as testing on desktop, as long as you set up your device following [the instructions]({{site.baseurl}}/documentation/sitespeed.io/mobile-phones/#prerequisites).

### Run shell command
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

### Run shell command as root
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

## iOS

Testing on an iPhone or iPad uses Safari over USB from a Mac. Once the device is paired and Remote Automation is enabled (see the [installation page]({{site.baseurl}}/documentation/sitespeed.io/installation/) for the one-time setup), running a script is the same as on desktop:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  return commands.measure.start('https://www.sitespeed.io');
};
```

Run it with `sitespeed.io --browser safari --safari.ios myScript.mjs`.

### What you cannot do on iOS

Coming from Android, this is the list of things to be aware of:

* **No shell access.** There is no `commands.ios.*` namespace and no equivalent of `commands.android.shell()` — Apple does not expose adb-style shell access through Safari's WebDriver. Anything that depends on running OS commands on the device (battery temperature, CPU pinning, file-system access) only works on Android.
* **One browser only.** "Chrome" and "Firefox" on iOS are WebKit shells, so cross-browser testing on the same device is not possible. You measure Safari, you compare against Safari.
* **No Chrome DevTools Protocol.** The [CDP tutorial]({{site.baseurl}}/documentation/sitespeed.io/scripting/chrome-devtools-protocol/) does not apply to Safari — modify-headers, block-domains and other CDP tricks are Chrome/Edge only.
* **No Bidi yet.** [Bidi]({{site.baseurl}}/documentation/sitespeed.io/scripting/bidi/) is Firefox-only today.
* **No Element Timing API.** The element timing entries you can read on Chrome via `commands.js.run` are not available in Safari.
* **No custom browser flags.** Safari does not expose anything equivalent to Chrome args.

### What works the same as Android

Most things, actually. `commands.measure.start`, `commands.navigate`, `commands.click`, `commands.wait`, `commands.type`, `commands.cookie.*`, `commands.screenshot.take`, scripted user journeys, scripted waits, custom metrics via `commands.measure.add`, error handling — all platform-agnostic.

If your script does not depend on shell access, CDP, Bidi or Element Timing, you can usually run the same `.mjs` file against Android and iOS just by switching the `--browser` flag.
