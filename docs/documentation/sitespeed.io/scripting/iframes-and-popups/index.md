---
layout: default
title: Iframes and popups
description: Switching to iframes, popups and new tabs in your script — and the limits when the frame is cross-origin.
keywords: scripting, tutorial, sitespeed.io, browsertime, iframe, popup, switch
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Iframes and popups

# Iframes and popups
{:.no_toc}

{:toc}

Real-world apps use iframes for auth widgets, payment forms, embedded video, third-party chat, and the cookie banner that wraps everything in a `<div role="dialog">` for legal reasons. Some flows open a popup window or a second tab. Selenium and Browsertime can drive all of these, but you have to tell the driver which window/frame you mean.

The command surface is `commands.switch.*` — full reference on the [Switch command page]({{site.baseurl}}/documentation/sitespeed.io/scripting/Switch.html).

## Switching to an iframe

When the element you want to click is inside an iframe, you have to switch into that frame first. After you're done, switch back to the top-level document or the next click goes nowhere:

```javascript
// Switch into the iframe (by id, name, or xpath/CSS reference)
await commands.switch.toFrame('login-iframe');

// Now commands target the iframe's document
await commands.type('id:username', 'demo');
await commands.type('id:password', 'secret');
await commands.click('id:submit');

// Back to the parent document
await commands.switch.toParentFrame();
```

`switch.toFrame` accepts an id or name, a Selenium WebElement (from `commands.element.getById` etc), or an integer index. Pick the most stable one — id/name beats element reference beats numeric index.

## Pattern: a third-party login widget

OAuth and SaaS login widgets are nearly always iframes. The pattern is identical:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.navigate('https://example.org/');

  // Open the login widget
  await commands.click('id:sign-in');

  // The widget renders inside an iframe — wait for it, then switch in
  await commands.wait('id:auth0-iframe', { visible: true });
  await commands.switch.toFrame('auth0-iframe');

  await commands.type('id:email', 'me@example.org');
  await commands.click('id:continue');
  await commands.wait('id:password');
  await commands.type('id:password', context.options.my.password);
  await commands.click('id:login');

  // Back out of the frame so the next steps target the main document
  await commands.switch.toParentFrame();

  // Wait for the post-login UI to appear in the parent page
  await commands.wait('id:dashboard');
};
```

## Switching back

Two ways to get out of a frame:

```javascript
// Up one level (back to the parent of the current frame)
await commands.switch.toParentFrame();

// All the way back to the top-level document (through Selenium directly)
await context.selenium.driver.switchTo().defaultContent();
```

For nested iframes (an iframe inside an iframe), call `toParentFrame` repeatedly, or jump straight to the top-level document with `context.selenium.driver.switchTo().defaultContent()`.

## Popups and new tabs

Clicks that open a new window or tab don't change the active context — Browsertime keeps targeting the original window. To drive the popup you have to switch:

```javascript
// Remember the original window before the popup opens
const original = await context.selenium.driver.getWindowHandle();

// Click the link that opens the popup
await commands.click('a[target="_blank"]');

// Switch to the most recently opened window/tab
const handles = await context.selenium.driver.getAllWindowHandles();
await commands.switch.toWindow(handles[handles.length - 1]);

// Now interact with the popup
await commands.wait('id:popup-content');
await commands.click('id:popup-close');

// Back to the original window
await commands.switch.toWindow(original);
```

If the popup is the auth flow, this is the dance: click → switch into popup → fill form → click submit → switch back. The original tab usually waits for the popup to close before continuing — wait on a marker in the original page after the switch-back rather than guessing how long the auth round-trip takes.

## Alert, confirm and prompt boxes

`alert()`, `confirm()` and `prompt()` aren't really HTML — they're driven through Selenium directly:

```javascript
// Accept (clicks "OK")
await context.selenium.driver.switchTo().alert().accept();

// Dismiss (clicks "Cancel")
await context.selenium.driver.switchTo().alert().dismiss();

// Read the message
const text = await context.selenium.driver.switchTo().alert().getText();

// Type into a prompt() and accept
await context.selenium.driver.switchTo().alert().sendKeys('hello');
await context.selenium.driver.switchTo().alert().accept();
```

These calls block until the alert appears — there's no separate wait command for them.

## Cross-origin iframes — what does and doesn't work

A same-origin iframe is fully scriptable: you can switch into it, query the DOM, click anything. Cross-origin iframes (the iframe loads from a different domain than the parent page) hit browser security limits:

* **You can switch into the frame and click things.** The driver can drive the cross-origin frame because it talks to the browser, not to the page's JavaScript.
* **You cannot read the parent's DOM from the cross-origin iframe.** Same-origin policy. If you need to coordinate, wait on a side-effect in the parent page after the cross-origin work completes.
* **CDP and Bidi may not see inside cross-origin frames** the same way they see same-origin ones. Network interception still works at the network layer; DOM-based things may not.

In practice this matters most when the auth widget is on a third-party domain (Stripe, Auth0, login.microsoftonline.com). The pattern is the same — switch in, do the form, switch back, wait on the parent — but you can't, for example, read the input values you just typed.
