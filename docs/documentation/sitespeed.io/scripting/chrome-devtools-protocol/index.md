---
layout: default
title: Chrome Devtools Protocol (CDP)
description: Chrome Devtools Protocol (CDP) — sitespeed.io scripting tutorial.
keywords: scripting, tutorial, sitespeed.io, browsertime
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Chrome Devtools Protocol (CDP)

# Chrome Devtools Protocol (CDP)
{:.no_toc}

{:toc}

Send messages to Chrome using the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/). This only works in Chrome/Edge. You can send, send and get and listen on events. This is a super powerful feature that enables you to do almost whatever you want with the browser.


### Sending a command
Send a command to Chrome and don’t expect something back.

Here’s an example of injecting JavaScript that runs on every new document.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.cdp.send('Page.addScriptToEvaluateOnNewDocument',{source: 'console.log("hello");'});
  await commands.measure.start('https://www.sitespeed.io');
}
```

### Send and get something back
Send a command to Chrome and get the result back.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  const domCounters = await commands.cdp.sendAndGet('Memory.getDOMCounters');
  context.log.info('Memory.getDOMCounters %j', domCounters);
 }
```

### Listen on events

Here’s an example to get hold of all responses for a page.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  const responses = [];
  await commands.cdp.on('Network.responseReceived', params => {
    responses.push(params);
  });
  await commands.measure.start('https://www.sitespeed.io/search/');
  context.log.info('Responses %j', responses);
};
```
### Use the raw CDP client
Under the hood Browsertime uses the [chrome-remote-interface](https://www.npmjs.com/package/chrome-remote-interface). If you need you can get the raw CDP client so you can do whatever you want. Here’s an example on how to change the server header on the response.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  const cdpClient = commands.cdp.getRawClient();
  await cdpClient.Fetch.enable({
    patterns: [
      {
        urlPattern: '*',
        requestStage: 'Response'
      }
    ]
  });

  cdpClient.Fetch.requestPaused(async reqEvent => {
    const { requestId } = reqEvent;
    let responseHeaders = reqEvent.responseHeaders || [];

    const newServerHeader = { name: 'server', value: 'Haxxor' };
    const foundHeaderIndex = responseHeaders.findIndex(
      h => h.name === 'server'
    );
    if (foundHeaderIndex) {
      responseHeaders[foundHeaderIndex] = newServerHeader;
    } else {
      responseHeaders.push(newServerHeader);
    }

    return cdpClient.Fetch.continueResponse({
      requestId,
      responseCode: 200,
      responseHeaders
    });
  });

  return commands.measure.start('https://www.sitespeed.io/search/');
}

```