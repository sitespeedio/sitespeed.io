---
layout: default
title: Interact with the browser
description: Interact with the browser — sitespeed.io scripting tutorial.
keywords: scripting, tutorial, sitespeed.io, browsertime
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Interact with the browser

# Interact with the browser
{:.no_toc}

{:toc}


## Navigate

You can navigate to a URL without measuring it. You do it with the [navigate function]({{site.baseurl}}/documentation/sitespeed.io/scripting/Commands.html#navigate). Navigation will use the same logic as measuring, it will wait for the page complete check to finish.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.navigate('https://www.sitespeed.io');
}
```



## Cache
You can clear the browser cache from your script. The command works in Chrome and Edge. Use it when you want to clear the browser cache between different URLs.

### Clear cache and cookies

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // First you probably visit a couple of pages and then clear the cache
  await commands.cache.clear();
  // And then visit another page
}
```

### Clear cache but keep cookies

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // If you have login cookies that live really long you may want to test accessing the page as a logged in user
  // but without a browser cache. You can try that with ...

  // Login the user and then clear the cache but keep cookies
  await commands.cache.clearKeepCookies();
  // and then access the URL you want to test.
}
```

### Navigation
You can use the [Navigation command]({{site.baseurl}}/documentation/sitespeed.io/scripting/Navigation.html) to go back, forward or refresh the page in the browser.


