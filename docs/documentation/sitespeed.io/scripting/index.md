---
layout: default
title: Use scripts in sitespeed.io to measure a user journey.
description: With scripts you can simulate a user visiting to miltiple pages, clicking on links, log in, adding items to the cart ... almost measure whatever you want!
keywords: selenium, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Use scripts in sitespeed.io to measure a user journey.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Scripting

# Scripting
{:.no_toc}

* Lets place the TOC here
{:toc}

# Test by scripting

<img src="{{site.baseurl}}/img/user-journey.png" class="pull-right img-big" alt="The user journey" width="250">

Test by scripting was introduced in sitespeed.io 8.0 and Browsertime 4.0 and makes it possible to measure a user journey. A user can visit multiple pages, clicking on links, log in, adding items to the cart ... yeah almost measure anything you want.

Scripting work the same in Browsertime and sitespeed.io, the documentation here are for both of the tools.

You have three different choices when you create your script:
* You can use our [commands objects](/documentation/sitespeed.io/scripting/#commmands). They are wrappers around plain JavaScript to make it easier to create your scripts. We prepared for many scenarios but if you need to do really complicated things, you also need [run plain JavaScript](/documentation/sitespeed.io/scripting/#jsrunjavascript) to be able to do what you want. But hey, that's easy!
* Or you can run plain JavaScript to navigate or do what you need by using the command [js.run()](/documentation/sitespeed.io/scripting/#jsrunjavascript). That will make it easy to copy/paste your JavaScript from your browsers console and test what you want to do.
* If you are used to do everything with Selenium you can [use ... Selenium](/documentation/sitespeed.io/scripting/#use-selenium-directly) :)

If you use plain JavaScript or Selenium you will still need to use our [measure command](/documentation/sitespeed.io/scripting/#measure) to get measuring and collecting metrics correct.


Independent of your implementation, your script will get access to two objects: The *context* object that holds information about the current run and the *commands* object that has commands/shortcuts to navigate in the page.

The simplest version of a script looks like this:

~~~javascript
module.exports = async function(context, commands) {
  // add your own code here
}
~~~

Inside of that function you can use the context and commands objects.

The context object:
* *options* - All the options sent from the CLI to Browsertime.
* *log* - an instance to the log system so you can log from your navigation script.
* *index* - the index of the runs, so you can keep track of which run you are currently on.
* *storageManager* - The Browsertime storage manager that can help you read/store files to disk.
* *selenium.webdriver* -  The Selenium [WebDriver public API object](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html).
* *selenium.driver* - The [instantiated version of the WebDriver](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html) driving the current version of the browser.


The commands object:
* *[navigate(URL)](#navigateurl)* - Use this if you want to use the exact way as Browsertime navigates to a new URL (same settings with pageCompleteCheck etc). Note: the URL will not be measured automatically.
* *[measure.start(URL)](#measurestarturl)* - Start measuring and navigate to a new page in one go.
* *[measure.start(URL,alias)](#measurestarturl-alias)* - Start measuring and navigate to a new page in one go, while register an alias for that URL.
* *[measure.start()](#measurestart)* - Use this when you want to start to measure a page. This will start the video and prepare everything to collect metrics. Note: it will not navigate to the URL.
* *[measure.start(alias)](#measurestartalias)* - Use this when you want to start to measure a page. This will start the video and prepare everything to collect metrics. Note: it will not navigate to the URL and the next URL that will be accessed will get the alias.
* *[measure.stop()](#measurestop)* - Collect metrics for a page.

And then you have a few help commands:
* *[wait](#wait)* on a id to appear or wait x amount of ms.
* *[click](#click)* on a link and/or wait for the next page to load.
* *[js](#run-javascript)* - run JavaScript in the browser.
* *[switch](#switch)* to another frame or window.
* *[set](#set)* innerHthml, innerText or value to an element.

Scripting only works for Browsertime. It will not work (disable) Lighthouse/Google Pagespeed Insights and WebPageTest. If you need scripting for WebPageTest [read the WebPageTest scripting documentation](/documentation/sitespeed.io/webpagetest/#webpagetest-scripting).
{: .note .note-info}

## Run
Run your script by passing it to sitespeed.io and adding the parameter ```--multi```. If you have multiple scripts, you can just pass them in as well.

~~~bash
docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} script.js script2.js script3.js --multi
~~~

## Getting values from your page
In some scenirous you want to do different things dependent on what shows on your page. For example: You are testing a shop checkout and you need to verify that the item is in stock. You can run JavaScript and get the value back to your script.

Here's an simple example, IRL you will need to get something from the page: 

~~~javascript
module.exports = async function(context, commands) {
  // We are in browsertime context so you can skip that from your options object
  const secretValue = await commands.js.run('return 12');
  // if secretValue === 12 ...
}
~~~

## Finding the right element

One of the key things in your script is to be able to find the right element to invoke. If the elemnt has an id it's easy. If not you can use developer tools in your favourite browser. The all work mostly the same: Open devtools in the page you want to inspect, click on the element and right click on devtools for that element. Then you will see something like this:

![Using Safari to find the selector]({{site.baseurl}}/img/selector-safari.png)
{: .img-thumbnail-center}
<p class="image-info">
 <em class="small center">Using Safari to find the CSS Selector to the element</em>
</p>

![Using Firefox to find the selector]({{site.baseurl}}/img/selector-firefox.png)
{: .img-thumbnail-center}
<p class="image-info">
 <em class="small center">Using Firefox to find the CSS Selector to the element</em>
</p>

![Using Chrome to find the selector]({{site.baseurl}}/img/selector-chrome.png)
{: .img-thumbnail-center}
<p class="image-info">
 <em class="small center">Using Chrome to find the CSS Selector to the element</em>
</p>

## Debug
There's a couple of way that makes it easier to debug your scripts: 
* Make sure to [use the log](#log-from-your-script) so you can see what happens in your log output.
* Either run the script locally on your desktop without XVFB so you can see in the browser window what happens or use  <code>--browsertime.videoParams.debug</code> when you record the video. That way you will get one full video of all your scripts (but no Visual Metrics).
* Use try/catch and await promises so you catch things that doesn't work.
* If you use plain JavaScript you can copy/paste it and run it in your browsers console to make sure it really works.
* If you run into trouble, please make sure you make it easy for us to [reproduce your problem](/documentation/sitespeed.io/bug-report/#explain-how-to-reproduce-your-issue) when you report a issue.

## Examples
Here are some examples on how you can use the scripting capabilities.

### Measure the actual login step

~~~javascript
module.exports = async function(context, commands) {
  // Navigate to a URL, but do not measure the URL
  await commands.navigate(
    'https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page'
  );
 
  try {
    // Add text into an input field, finding the field by id
    await commands.addText.byId('login', 'wpName1');
    await commands.addText.byId('password', 'wpPassword1');

    // Start the measurement and give it the alias login
    // The alias will be used when the metrics is sent to 
    // Graphite/InfluxDB
    await commands.measure.start('login');

    // Find the submit button and click it and wait for the
    // page complete check to finish on the next loaded URL
    await commands.click.byIdAndWait('wpLoginAttempt');
    // Stop and collect the metrics
    return commands.measure.stop();
  } catch (e) {
    // We try/catch so we will catch if the the input fields can't be found
    // The error is automatically logged in Browsertime an rethrown here
  }
};
~~~

### Measure the login step and more pages

~~~javascript
module.exports = async function(context, commands) {
  // We start by navigating to the login page.
  await commands.navigate(
    'https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page'
  );
  
  // When we fill in a input field/click on a link we wanna
  // try/catch that if the HTML on the page changes in the feature
  // sitespeed.io will automatically log the error in a user friendly
  // way, and the error will be re-thrown so you can act on it.
  try {
    // Add text into an input field, finding the field by id
    await commands.addText.byId('login', 'wpName1');
    await commands.addText.byId('password', 'wpPassword1');
  
    // Start the measurement before we click on the 
    // submit button. Sitespeed.io will start the video recording
    // and prepare everything.
    await commands.measure.start('login');
    // Find the sumbit button and click it and then wait 
    // for the pageCompleteCheck to finish
    await commands.click.byIdAndWait('wpLoginAttempt');
    // Stop and collect the measurement before the next page we want to measure
    await commands.measure.stop();
    // Measure the Barack Obama page as a logged in user
    await commands.measure.start(
      'https://en.wikipedia.org/wiki/Barack_Obama'
    );
    // And then measure the president page
    return commands.measure.start('https://en.wikipedia.org/wiki/President_of_the_United_States');
  } catch (e) {
    // We try/catch so we will catch if the the input fields can't be found
    // The error is automatically logged in Browsertime and re-thrown here
  }
};
~~~

### Measure one page after you logged in

Testing a page after you have logged in:
First create a script that logs in the user (login.js):

~~~javascript
module.exports = async function(context, commands) {
  await commands.navigate(
    'https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page'
  );

  try {
    await commands.addText.byId('login', 'wpName1');
    await commands.addText.byId('password', 'wpPassword1');
    // Click on the submit button with id wpLoginAttempt
    await commands.click.byIdAndWait('wpLoginAttempt');
    // wait on a specific id to appear on the page after you logged in
    return commands.wait.byId('pt-userpage', 10000);
  } catch (e) {
    // We try/catch so we will catch if the the input fields can't be found
    // The error is automatically logged in Browsertime and re-thrown here
  }
};
~~~

Then access the page that you want to test:

~~~bash
sitespeed.io --preScript login.js https://en.wikipedia.org/wiki/Barack_Obama
~~~

#### More complicated login example

~~~javascript
module.exports = async function(context, command) {
  await command.navigate(
    'https://example.org'
  );
  try {
    // Find the sign in button and click it
    await command.click.byId('sign_in_button');
    // Wait some time for the page to open a new login frame
    await command.wait.byTime(2000);
    // Switch to the login frame
    await command.switch.toFrame('loginFrame');
    // Find the username fields by xpath (just as an example)
    await command.addText.byXpath(
      'peter@example.org',
      '//*[@id="userName"]'
    );
    // Click on the next button
    await command.click.byId('verifyUserButton');
    // Wait for the GUI to display the password field so we can select it
    await command.wait.byTime(2000);
    // Wait for the actual password field
    await command.wait.byId('password', 5000);
    // Fill in the password
    await command.addText.byId('dejh8Ghgs6ga(1217)', 'password');
    // Click the submit button
    await command.click.byId('btnSubmit');
    // In your implementation it is probably better to wait for an id
    await command.wait.byTime(5000);
    // Measure the next page as a logged in user
    return  command.measure.start(
      'https://example.org/logged/in/page'
  );
  } catch(e) {
     // We try/catch so we will catch if the the input fields can't be found
  }
};
~~~

### Measure multiple pages

Test multiple pages in a script:

~~~javascript
module.exports = async function(context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  await commands.measure.start('https://www.sitespeed.io/examples/');
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
~~~

### Measure multiple pages and start white

If you test multiple pages you will see that the layout is kept in the browser until the first paint of the new page. You can hack that by remvoving the current body and set the backgroud color to white. Then every video will start white.

~~~javascript
module.exports = async function(context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    await commands.js.run('document.body.innerHTML = ""; document.body.style.backgroundColor = "white";');
    await commands.measure.start('https://www.sitespeed.io/examples/');
    await commands.js.run('document.body.innerHTML = ""; document.body.style.backgroundColor = "white";');
    return commands.measure.start('https://www.sitespeed.io/documentation/');
};
~~~

### Measure shopping/checkout process
One of the really cool things with scripting is that you can measure all the pages in a checkout process. This is an example shop where you put one item in your cart and checkout as a guest.

~~~javascript
module.exports = async function(context, commands) {
  // Start by measuring the first page of the shop
  await commands.measure.start('https://shop.example.org');

  // Then the product page
  // Either your shop has a generic item used for testing that you can use 
  // or in real life you maybe need to add a check that the item really exists in stock
  // and if not, try another product
  await commands.measure.start('https://shop.example.org/prodcucs/theproduct');

  // Add the item to your cart
  await commands.click.bySelector('.add-to-cart');

  // Go to the cart (and measure it)
  await commands.measure.start('https://shop.example.org/cart/');

  // Checkout as guest but you could also login as a customer
  // We hide the HTML to avoid that the click on the link will
  // fire First Visual Change. Best case you don't need to but we 
  // want an complex example
  await commands.js.run('document.body.style.display = "none"');
  await commands.measure.start('CheckoutAsGuest');
  await commands.click.bySelectorAndWait('.checkout-as-guest');
  // Make sure to stop measuring and collect the metrics for the CheckoutAsGuest step
  await commands.measure.stop();

  // Finish your checkout
  await commands.js.run('document.body.style.display = "none"');
  await commands.measure.start('FinishCheckout');
  await commands.click.bySelectorAndWait('.checkout-finish');
  // And collect metrics for the FinishCheckout step
  return commands.measure.stop();
  // In a real web shop you probably can't finish the last step or you can return the item
  // so the stock is correct. Either you do that at the end of your script or you
  // add the item id in the context object like context.itemId = yyyy. Then in your
  // postScript you can do what's needed with that id.
};
~~~

### Log from your script

You can log to the same output as sitespeed.io:

~~~javascript
module.exports = async function(context, commands) {
  context.log.info('Info logging from your script');
  context.log.error('Error logging from your script');
};
~~~

### Pass your own options to your script
You can add your own parameters to the options object (by adding a parameter) and then pick them up in the script. The scripts runs in the context of browsertime, so you need to pass it in via that context.

For example: you wanna pass on a password to your script, you can do that by adding <code>--browsertime.my.password MY_PASSWORD</code> and then in your code get a hold of that with:

~~~javascript
module.exports = async function(context, commands) {
  // We are in browsertime context so you can skip that from your options object
  context.log.info(context.options.my.password);
};
~~~

## Tips and Tricks

### Include the script in the HTML result
If you wanna keep of what script you are running, you can include the script into the HTML result with ```--html.showScript```. You will then get a link to a page that show the script.

![Page to page]({{site.baseurl}}/img/script-link.png)
{: .img-thumbnail}

### Getting correct Visual Metrics
Visual metrics is the metrics that are collected using the video recording of the screen. In most cases that will work just out of the box. One thing to know is that when you go from one page to another page, the browser keeps the layout of the old page. That means that your video will start with the first page (instead of white) when yoy navigate to the next page.

It will look like this:
![Page to page]({{site.baseurl}}/img/filmstrip-multiple-pages.jpg)
{: .img-thumbnail}

This is perfectly fine in most cases. But if you want to start white (the metrics somehow isn't correct) or if you click a link and that click changes the layout and is catched as First Visual Change, there are workarounds.

If you just want to start white and navigate to the next page you can just clear the HTML between pages:

~~~javascript
module.exports = async function(context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    // Renove the HTML and make sure the background is white
    await commands.js.run('document.body.innerHTML = ""; document.body.style.backgroundColor = "white";');
    return commands.measure.start('https://www.sitespeed.io/examples/');
};
~~~

If you want to click a link and make sure the background is white, you can hide the HTML and then click the link.

~~~javascript
module.exports = async function(context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    // Hide everything
    await commands.js.run('document.body.style.display = "none";');
    // Start measurning
    await commands.measure.start();
    // Click on the link and wait on navigation to happen
    await commands.click.bySelectorAndWait('body > nav > div > div > div > ul > li:nth-child(2) > a');
    return commands.measure.stop();
};
~~~

### Test one page that need a much longer page complete check than others

If you have one page that needs some special handling that maybe do a couple of late and really slow AJAX requests, you can catch that with your on wait for the page to finish.

~~~javascript
module.exports = async function(context, commands) {
  // First test a couple pages with default page complete check
  await commands.measure.start('https://<page1>');
  await commands.measure.start('https://<page2>');
  await commands.measure.start('https://<page3>');

  // Then we have a page that we know need to wait longer, start measuring
  await command.measure.start('MySpecialPage');
  // Go to the page  
  await commands.navigate('https://<myspecialpage>'); 
  // Then you need to wait on a specific element or event. In this case
  // we wait for a id to appear but you could also run your custom JS
  await commands.wait.byId('my-id', 20000);
  // And then when you know that page has loaded stop the measurement
  // = stop the video, collect metrics etc
  return commands.measure.stop();
};
~~~


### Test the same page multiple times within the same run

If you for some reason want to test the same URL within the same run multiple times, it will not work out of the box since the current version create the result files using the URL. For example testing https://www.sitespeed.io/ two times, will break since the second access will try to overwrite the first one. 

But there is a hack you can do. If you add a dummy query parameter (and give the page an alias) you can test them twice a

~~~javascript
module.exports = async function(context, commands) {
    await commands.measure.start('https://www.sitespeed.io/', 'HomePage');
    
    // Do something smart that then make you need to test the same URL again
    // ...

    return commands.navigate('https://www.sitespeed.io/?dummy', 'BackToHomepage');
};
~~~

## Commmands

All commands will return a promise and you should await it to fulfil. If some command do not work, we will log that automatically and rethrow the error, so you can catch that and can act on that.

The commands that ends with a **...AndWait** will wait for a new page to load, so use them only when you are clicking on a link and want a new page or view to load.

### Measure
The measure command will prepare everything for measuring a new URL (clearing internal metrics, starting the video etc). If you give an URL to the measure command it will start to measure and navigate to that URL.

If you do not give it a URL, it will prepare everything and start the video. So it's up to you to navigate/click on a link/submit the page. You also need to stop the measurement so that Browsertime/sitespeed.io knows that you want the metrics.

#### measure.start(url)
Start and navigate to the URL and then automatically call the stop() function after the page has stopped navigating decided by the current pageCompleteCheck.

~~~javascript
module.exports = async function(context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  // If you want to measure multiple URLs after each other
  // you can just line them up
  await commands.measure.start('https://www.sitespeed.io/examples/');
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
~~~

#### measure.start(url, alias)
Start and navigate to the URL and then automatically call the stop() function after the page has stopped navigating decided by the current pageCompleteCheck. The page will also get the alias that will be used when you send the metrics to Graphite/InfluxDB. Use it when you have complex URLs.

~~~javascript
module.exports = async function(context, commands) {
  // Measure the page and give it the alias StartPage
  return await commands.measure.start('https://www.sitespeed.io', 'StartPage');
};
~~~

#### measure.start() 
Start to measure. Browsertime/sitespeed.io will pick up the next URL and measure that. You need to call the stop() function yourself.

~~~javascript
module.exports = async function(context, commands) {
  // Start by navigating to a page
  await commands.navigate('https://www.example.org');
  // Start a measurement
  await commands.measure.start();
  await commands.click.bySelectorAndWait('.important-link');
  // Remember that when you start() a measurement without a URL you also needs to stop it! 
  return commands.measure.stop();
};
~~~

If you start a measurement without giving a URL you need to also call measure.stop() when you finished measuring.
{: .note .note-warning}

#### measure.start(alias)
Start to measure. Browsertime/sitespeed.io will pick up the next URL and measure that. You need to call the stop() function yourself. The page will also get the alias that will be used when you send the metrics to Graphite/InfluxDB. Use it when you have complex URLs.

~~~javascript
module.exports = async function(context, commands) {
  // Start by navigating to a page
  await commands.navigate('https://www.example.org');
  // Start a measurement and give it an alias that is used if you send the metrics to Graphite/InfluxDB for the next URL
  await commands.measure.start('FancyName');
  await commands.click.bySelectorAndWait('.important-link');
  // Remember that when you start() a measurement without a URL you also needs to stop it! 
  return commands.measure.stop();
};
~~~

If you start a measurement without giving a URL you need to also call measure.stop() when you finished measuring.
{: .note .note-warning}

#### measure.stop()
Stop measuring. This will collect technical metrics from the browser, stop the video recording, collect CPU data etc.

### Click
The click command will click on links.

All click commands have two different versions: One that will return a promise when the link has been clicked and one that will return a promise that will be fullfilled when the link has been clicked and the browser navigated to the new URL and the [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) is done.

If it does not find the link, it will throw an error, so make sure to catch it if you want an alternative flow.
{: .note .note-warning}

#### click.byClassName(className)
Click on element that is found by specific class name. Will use ```document.getElementsByClassName(className)``` and take the first result and click on it.

#### click.byClassNameAndWait(className)
Click on element that is found by specific class name and wait for [page load complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) to finish. Will use ```document.getElementsByClassName(className)``` and take the first result and click on it.

#### click.byLinkText(text)
Click on link whose visible text matches the given string. Internally we use an xpath expression to find the correct link.

#### click.byLinkTextAndWait(text)
Click on link whose visible text matches the given string and wait for [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) to finish.

#### click.byPartialLinkText(text)
Click on link whose visible text contains the given substring.

#### click.byPartialLinkTextAndWait(text)
Click on link whose visible text contains the given substring and wait for [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) to finish.

#### click.byXpath(xpath)
Click on link that matches a XPath selector.

#### click.byXpathAndWait(xpath)
Click on link that matches a XPath selector and wait for [page load complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) to finish.

#### click.byJs(js)
Click on a link located by evaluating a JavaScript expression. The result of this expression must be an element or list of elements.

#### click.byJsAndWait(js)
Click on a link located by evaluating a JavaScript expression. The result of this expression must be an element or list of elements. And wait for [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) to finish.

#### click.byId(id)
Click on link located by the ID attribute. Internally we use  ```document.getElementById(id)``` to get the correct element.

#### click.byIdAndWait(id)
Click on link located by the ID attribute. Internally we use  ```document.getElementById(id)``` to get the correct element. And wait for [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) to finish.

#### click.bySelector(selector)
Click on element that is found by the CSS selector that has the given value. Internally we use  ```document.querySelector(selector)``` to get the correct element.

#### click.bySelectorAndWait(selector)
Click on element that is found by name CSS selector that has the given value and wait for the [page cmplete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) to happen. Internally we use  ```document.querySelector(selector)``` to get the correct element.

### Wait
There are two help commands that makes it easier to wait. Either you can wait on a specific id to appear or for x amount of milliseconds.

#### wait.byTime(ms)
Wait for x ms.

#### wait.byId(id,maxTime)
Wait for an element with id to appear before maxTime. The element needs to be visible for the user. If the element do not appear within maxTime an error will be thrown.

#### byXpath(xpath, maxTime)
Wait for an element found by xpath to appear before maxTime. The element needs to be visible for the user. If the elemet do not appear within maxTime an error will be thrown.

### Run JavaScript
You can run your own JavaScript in the browser from your script.

#### js.run(javascript)
Run JavaScript. Will throw an error if the JavaScript fails. 

If you want to get values from the web page, this is your best friend. Make sure to return the value and you can use it in your script.

~~~javascript
module.exports = async function(context, commands) {
  // We are in browsertime context so you can skip that from your options object
  const secretValue = await commands.js.run('return 12');
  // if secretValue === 12 ...
}
~~~

#### js.runAndWait(javascript)
Run JavaScript and wait for [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test). This is perfect if you wanna click on links with pure JavaScript and measure a URL. Will throw an error if the JavaScript fails.

### Navigate
Navigate/go to a URL without measuring it.

#### navigate(url)
Navigate to a URL and do not measure it. It will use the default [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) and follow the exact same pattern for going to a page as normal Browsertime navigation except it will skip collecting any metrics.

### Add text 
You can add text to input elements. The element needs to visible.

#### addText.byId(text, id)
Add the *text* to the element with the *id*. If the id is not found the command will throw an error.

#### byXpath(text, xpath) 
Add the *text* to the element by using *xpath*. If the xpath is not found the command will throw an error.

#### addText.bySelector(text, selector) 
Add the *text* to the element by using *CSS selector*. If the xpath is not found the command will throw an error.

### Switch 
You can switch to iframes or windows if that is needed.

If frame/window is not found, an error will be thrown.
{: .note .note-warning}

#### toFrame(id)
Switch to a frame by its id.

#### toWindow(name) 
Switch to window by name.

#### toParentFrame
Switch to the parent frame.

### Set

Raw set value of elements.

#### innerHtml(html, selector)
Use a CSS selector to find the element and set the html to innerHtml. Internally it uses ```document.querySelector(selector)``` to find the right element.

#### innerHtmlById(html, id)

Use the id to find the element and set the html to innerHtml. Internally it uses ```document.getElementById(id)``` to find the right element.

#### innerText(text, selector) 
Use a CSS selector to find the element and set the text to innerText. Internally it uses ```document.querySelector(selector)``` to find the right element.

#### innerTextById(text, id)
Use the id to find the element and set the text to innerText. Internally it uses ```document.getElementById(id)``` to find the right element.

#### value(value, selector)
Use a CSS selector to find the element and set the value to value. Internally it uses ```document.querySelector(selector)``` to find the right element.

#### valueById(value, id)
Use the id to find the element and set the value to value. Internally it uses ```document.getElementById(id)``` to find the right element.

### Cache
There's an experimental command for clearing the cache. The command works both for Chrome and Firefox on desktop but not on Chrome on Android since we are using a [WebExtension](https://github.com/sitespeedio/browsertime-extension).

#### clear()
Clear the browser cache. Remove cache and cookies.

#### clearKeepCookies()
Clear the browser cache but keep cookies.

### Use Selenium directly
You can use Selenium directly if you need to use things that are not availible through our commands.

You get a hold of the Selenium objects through the context.
 The *selenium.webdriver* that is the Selenium [WebDriver public API object](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html). And *selenium.driver* that's the [instantiated version of the WebDriver](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html) driving the current version of the browser.

Checkout this example to see how you can use them.

~~~javascript
module.exports = async function(context, commands) {
  // we fetch the selenium webdriver from context
  const webdriver = context.selenium.webdriver;
  const driver = context.selenium.driver;
  // before you start, make your username and password
  const userName = 'YOUR_USERNAME_HERE';
  const password = 'YOUR_PASSWORD_HERE';
  const loginForm = driver.findElement(webdriver.By.css('form'));
  const loginInput = driver.findElement(webdriver.By.id('wpName1'));
  loginInput.sendKeys(userName);
  const passwordInput = driver.findElement(webdriver.By.id('wpPassword1'));
  passwordInput.sendKeys(password);
  // this example skips waiting for the next page and validating that the login was successful.
  return loginForm.submit();
}
~~~

If you need help with Selenium, checkout [the official Selenium documentation](https://www.seleniumhq.org/docs/).
