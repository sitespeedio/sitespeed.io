---
layout: default
title: Examples
description: Examples — sitespeed.io scripting tutorial.
keywords: scripting, tutorial, sitespeed.io, browsertime
nav: documentation
category: sitespeed.io
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Scripting]({{site.baseurl}}/documentation/sitespeed.io/scripting/) / Examples

# Examples
{:.no_toc}

{:toc}

Here are some examples of how you can use the scripting capabilities.

### Measure multiple pages

Test multiple pages in a script:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  await commands.measure.start('https://www.sitespeed.io/examples/');
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
```

### Measure multiple pages and start with white

When you record a video while measuring multiple pages, you will see that the layout of the previous page is kept in the browser until the first paint of the new page. You can work around this by removing the current body and setting the background colour to white — then every video will start white.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    await commands.js.run('document.body.innerHTML = ""; document.body.style.backgroundColor = "white";');
    await commands.measure.start('https://www.sitespeed.io/examples/');
    await commands.js.run('document.body.innerHTML = ""; document.body.style.backgroundColor = "white";');
    return commands.measure.start('https://www.sitespeed.io/documentation/');
};
```

### Measuring Interaction to Next Paint (INP)
One of the newer metrics Google is pushing is [Interaction to Next Paint](https://web.dev/articles/inp). You can collect it from RUM and from sitespeed.io. To measure it you need to interact with a web page — the best way to do that is using the Action API.


```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // Start to measure
  await commands.measure.start();
  // Go to a page ...
  await commands.navigate('https://en.m.wikipedia.org/wiki/Barack_Obama');

  // When the page has finished loading you can find the navigation and click on it
  const element = await commands.element.getByXpath(
    '//*[@id="mw-mf-main-menu-button"]'
  );
  await commands.action.getActions().click(element).perform();
  
  // If you want to do multiple actions, remember to clear() the Action API manually

  // Add some wait for the menu to show up
  await commands.wait.byTime(2000);

  // Measure everything — this runs the JavaScript that collects Interaction to Next Paint
  return commands.measure.stop();
}
```

You will see the metric in the page summary and in the metrics section.


### Measure a login step

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // Navigate to a URL, but do not measure the URL
  await commands.navigate(
    'https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page'
  );

  try {
    // Add text into an input field, finding the field by id
    await commands.type('id:wpName1', 'login');
    await commands.type('id:wpPassword1', 'password');

    // Start the measurement and give it the alias login.
    // The alias will be used when the metrics are sent to
    // Graphite/InfluxDB.
    await commands.measure.start('login');

    // Find the submit button and click it and wait for the
    // page complete check to finish on the next loaded URL
    await commands.click('id:wpLoginAttempt', { waitForNavigation: true });
    // Stop and collect the metrics
    return commands.measure.stop();
  } catch (e) {
    // We try/catch so we catch the case where the input fields can't be found.
    // The error is automatically logged in Browsertime and rethrown here.
    // We could have an alternative flow here,
    // otherwise we let it cascade since it's caught later and reported in
    // the HTML.
    throw e;
  }
};
```

### Measure the login step and more

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // We start by navigating to the login page.
  await commands.navigate(
    'https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page'
  );

  // When we fill in an input field or click on a link we want
  // to try/catch in case the HTML on the page changes in the future.
  // Sitespeed.io will automatically log the error in a user-friendly
  // way, and the error will be re-thrown so you can act on it.
  try {
    // Add text into an input field, finding the field by id
    await commands.type('id:wpName1', 'login');
    await commands.type('id:wpPassword1', 'password');

    // Start the measurement before we click on the
    // submit button. Sitespeed.io will start the video recording
    // and prepare everything.
    await commands.measure.start('login');
    // Find the submit button and click it and then wait
    // for the pageCompleteCheck to finish
    await commands.click('id:wpLoginAttempt', { waitForNavigation: true });
    // Stop and collect the measurement before the next page we want to measure
    await commands.measure.stop();
    // Measure the Barack Obama page as a logged in user
    await commands.measure.start(
      'https://en.wikipedia.org/wiki/Barack_Obama'
    );
    // And then measure the president page
    return commands.measure.start('https://en.wikipedia.org/wiki/President_of_the_United_States');
  } catch (e) {
    // We try/catch so we catch the case where the input fields can't be found.
    // The error is automatically logged in Browsertime and re-thrown here.
    // We could have an alternative flow here,
    // otherwise we let it cascade since it's caught later and reported in
    // the HTML.
    throw e;
  }
};
```

### Measure one page after you logged in

Testing a page after you have logged in:
First create a script that logs in the user (login.mjs):

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.navigate(
    'https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page'
  );

  try {
    await commands.type('id:wpName1', 'login');
    await commands.type('id:wpPassword1', 'password');
    // Click on the submit button with id wpLoginAttempt
    await commands.click('id:wpLoginAttempt', { waitForNavigation: true });
    // wait on a specific id to appear on the page after you logged in
    return commands.wait('id:pt-userpage', { timeout: 10000 });
  } catch (e) {
    // We try/catch so we catch the case where the input fields can't be found.
    // The error is automatically logged in Browsertime and re-thrown here.
    // We could have an alternative flow here, otherwise we let it cascade
    // since it's caught later and reported in the HTML.
    throw e;
  }
};
```

Then access the page that you want to test:

```bash
sitespeed.io --preScript login.mjs https://en.wikipedia.org/wiki/Barack_Obama
```

#### A more complicated login example

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  await commands.navigate(
    'https://example.org'
  );
  try {
    // Find the sign in button and click it
    await commands.click('id:sign_in_button');
    // Wait some time for the page to open a new login frame
    await commands.wait.byTime(2000);
    // Switch to the login frame
    await commands.switch.toFrame('loginFrame');
    // Find the username fields by xpath (just as an example)
    await commands.type(
      'xpath://*[@id="userName"]',
      'peter@example.org'
    );
    // Click on the next button
    await commands.click('id:verifyUserButton');
    // Wait for the GUI to display the password field so we can select it
    await commands.wait.byTime(2000);
    // Wait for the actual password field
    await commands.wait('id:password', { timeout: 5000 });
    // Fill in the password
    await commands.type('id:password', 'dejh8Ghgs6ga(1217)');
    // Click the submit button
    await commands.click('id:btnSubmit');
    // In your implementation it is probably better to wait for an id
    await commands.wait.byTime(5000);
    // Measure the next page as a logged in user
    return  commands.measure.start(
      'https://example.org/logged/in/page'
  );
  } catch(e) {
    // We try/catch so we catch the case where the input fields can't be found.
    // We could have an alternative flow here, otherwise we let it cascade
    // since it's caught later and reported in the HTML.
    throw e;
  }
};
```


### Scroll the page

You can scroll the page to trigger metrics. To get the Cumulative Layout Shift metric for Chrome closer to what real users get, you can scroll the page and measure that. Depending on how your page works, you may want to tune the delay between scrolls.


```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  const delayTime = 250;

  await commands.measure.start();
  await commands.navigate(
    'https://www.sitespeed.io/documentation/sitespeed.io/performance-dashboard/'
  );
  await  commands.scroll.toBottom(delayTime);
  return commands.measure.stop();
};
```

### Add your own metrics
You can add your own metrics by adding extra JavaScript that is executed after the page has loaded — but did you know you can also add your own metrics directly through scripting? The metrics will be added to the metrics tab in the HTML output and automatically sent to Graphite/InfluxDB.

In this example we collect the temperature from our Android phone that runs the tests:

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // Get the temperature from the phone
  const temperature = await commands.android.shell("dumpsys battery | grep temperature | grep -Eo '[0-9]{1,3}'");
  // Start the test
  await commands.measure.start(
    'https://www.sitespeed.io'
  );
  // This is the magic where we add the new metric. It needs to happen
  // after measure.start so we know which page the metric belongs to.
  commands.measure.add('batteryTemperature', temperature/10);
};
```

In this example we collect the number of comments on a blog post using commands.js.run() 
to collect an element, use regex to parse out the number, and add it back as a custom metric.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
   await commands.measure.start('blog-post'); //alias is now blog-post
   await commands.navigate('https://www.exampleBlog/blog-post');
   
   //use commands.js.run to return the element using pure javascript
   const element = await commands.js.run('return(document.getElementsByClassName("comment-count")[0].innerText)'); 
   
   //parse out just the number of comments
   var elementMetric = element.match(/\d/)[0];
  
   // need to stop the measurement before you can add it as a metric
   await commands.measure.stop();
   
   // metric will now be added to the html and output to graphite/influx if you're using it
   await commands.measure.add('commentsCount', elementMetric);
};
```

### Measure a checkout process
One of the really cool things with scripting is that you can measure all the pages in a checkout process. This is an example shop where you put one item in your cart and checkout as a guest.

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
export default async function (context, commands) {
  // Start by measuring the first page of the shop
  await commands.measure.start('https://shop.example.org');

  // Then the product page
  // Either your shop has a generic item used for testing that you can use
  // or in real life you maybe need to add a check that the item really exists in stock
  // and if not, try another product
  await commands.measure.start('https://shop.example.org/products/theproduct');

  // Add the item to your cart
  await commands.click('.add-to-cart');

  // Go to the cart (and measure it)
  await commands.measure.start('https://shop.example.org/cart/');

  // Check out as guest, or you could also log in as a customer.
  // We hide the HTML to avoid the click on the link firing
  // First Visual Change. In most cases you don't need to, but
  // we want a complex example.
  await commands.js.run('for (let node of document.body.childNodes) { if (node.style) node.style.display = "none";}');
  await commands.measure.start('CheckoutAsGuest');
  await commands.click('.checkout-as-guest', { waitForNavigation: true });
  // Make sure to stop measuring and collect the metrics for the CheckoutAsGuest step
  await commands.measure.stop();

  // Finish your checkout
  await commands.js.run('document.body.style.display = "none"');
  await commands.measure.start('FinishCheckout');
  await commands.click('.checkout-finish', { waitForNavigation: true });
  // And collect metrics for the FinishCheckout step
  return commands.measure.stop();
  // In a real web shop you probably can't finish the last step or you can return the item
  // so the stock is correct. Either you do that at the end of your script or you
  // add the item id in the context object like context.itemId = yyyy. Then in your
  // postScript you can do what's needed with that id.
};
```

### Test multiple URLs

If you want to test multiple URLs and need to do some specific things before each URL, you can do something like this (we pass on our [own options](#pass-your-own-options-to-your-script) to the script):

```javascript
/**
 * @param {import('browsertime').BrowsertimeContext} context
 * @param {import('browsertime').BrowsertimeCommands} commands
 */
module.exports = async function (context, commands) {
  const urls = context.options.urls;
  for (let url of urls) {
   // Do the stuff for each url that you need to do
   // Maybe login a user or add a cookie or something
   // Then test the URL
   await commands.measure.start(url);
   // When the test is finished, clear the browser cache
   await commands.cache.clear();
   // Navigate to a blank page so you kind of start from scratch for the next URL
   await commands.navigate('about:blank');
  }
};
```

Then run your tests like this:

```bash
sitespeed.io testMultipleUrls.js --multi --browsertime.urls https://www.sitespeed.io --browsertime.urls https://www.sitespeed.io/documentation -n 1
```
Or if you use JSON configuration, the same configuration looks like this:

```json
{ 
  "browsertime": {
    "urls": ["url1", "url2", "url3"]
  }
}
```