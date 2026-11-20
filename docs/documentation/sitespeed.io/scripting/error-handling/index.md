---
layout: default
title: Error handling
description: Error handling — sitespeed.io scripting tutorial.
keywords: scripting, tutorial, sitespeed.io, browsertime
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Error handling

# Error handling
{:.no_toc}

{:toc}

You can try/catch failing commands that throw errors. If an error is not caught in your script, it will be caught in sitespeed.io and the error will be logged and reported in the HTML and to your data storage (Graphite/InfluxDb) under the key *browsertime.statistics.errors*.

If you do catch the error, you should make sure you report it yourself with the [error function]({{site.baseurl}}/documentation/sitespeed.io/scripting/Commands.html#error), so you can see that in the HTML report. This is needed for all errors except navigating/measuring a URL. They will automatically be reported (since they are always important).

If you are measuring a page in a user journey and it fails, you can stop your measurement as an error and not collect any metrics. This works from Browsertime 21.2.0 and sitespeed.io 33.0.0.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');

  try {
    await commands.measure.start('Documentation_page');
    await commands.click('link:Documentationsssss', { waitForNavigation: true });
    return commands.measure.stop();
    
  } catch (e) {
    // Oops, that link does not exist and will throw an exception
    return commands.measure.stopAsError('Could not click on the link');
  }

};
```

You can also create your own errors. The error will be reported in the HTML and sent to Graphite/InfluxDB. If you report an error, the exit code from sitespeed.io will be > 0.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // ...
  try {
    // Click on a link
    await commands.click('link:Checkout', { waitForNavigation: true });
  } catch (e) {
    // Oh no, the content team has changed the name of the link!
    commands.error('The link named Checkout does not exist on the page');
    // Since the error is reported, you can alert on it in Grafana
  }
};
```

## Failure
You can [mark your test as a failure]({{site.baseurl}}/documentation/sitespeed.io/scripting/Commands.html#markAsFailure). If a test is marked as a failure, the exit code from Browsertime/sitespeed.io will be larger than zero.

```javascript
await commands.markAsFailure('My test failed');
// Or if you want to set the exit code
// it works the same way
process.exitCode = 1;
```

Then when you run your tests it looks like this: 

```bash
$ sitespeed.io --multi myJourney.mjs
...
$ echo $?
1
```

## Screenshot

Take a screenshot. The image is stored in the screenshot directory for the URL you are testing. This can be super helpful to use in a catch block if something fails. If you use sitespeed.io you can find the image in the screenshot tab for each individual run.

![Screenshots](https://www.sitespeed.io/img/multiple-screenshots.jpg)
{: .img-thumbnail}


```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  try {
    // Doing something that fails
  } catch(error) {
    await commands.screenshot.take('my-failure');
  }
 }
```