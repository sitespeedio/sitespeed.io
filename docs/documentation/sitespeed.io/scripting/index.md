---
layout: default
title: Use scripts in sitespeed.io to measure a user journey.
description: With scripts you can simulate a user visiting to multiple pages, clicking on links, log in, adding items to the cart ... almost measure whatever you want!
keywords: selenium, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Use scripts in sitespeed.io to measure a user journey.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Scripting

# Scripting
{:.no_toc}

Scripting in sitespeed.io allows you to measure user journeys by interacting with web pages. You create scripts in NodeJS that utilize context for accessing options and commands for webpage interactions like clicks, navigation, and starting/stopping measurements. Run your script with sitespeed.io to gather performance data. This feature is powerful for simulating real-user interactions and collecting performance metrics for complex workflows.

Scripting work the same in Browsertime and sitespeed.io, the documentation here are for both of the tools.

In sitespeed.io 27.0 the project was moved to a [pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). You can choose to either have your scripting file be a ESM or CommonJS file. If you use ESM your file should end with *.mjs* . If it is common JS use *.cjs*. All our examples on this page is ESM. Before 27.0 all files was common JS.

<img src="{{site.baseurl}}/img/user-journey.png" class="pull-right img-big" alt="The user journey" width="250">

# Index
{:.no_toc}

* Lets place the TOC here
{:toc}

## Scripting basics

### Simple script

Start by creating a script file, say *measure.mjs*, with the following content:

~~~javascript
export default async function (context, commands) {
  return commands.measure.start('https://www.sitespeed.io');
};
~~~

Run your script with the command: ```sitespeed.io -n 1 --multi measure.js```.

This script will measure the performance of the specified URL. For more advanced scripting options like handling clicks, navigation, and other interactions, scroll down​.

### Details

In scripting with Sitespeed.io, you have three options:

1. Use **commands objects** which simplify script creation by wrapping plain JavaScript. For complex tasks, you might need to use plain JavaScript.
2. Execute plain JavaScript using the command `js.run()`, ideal for reusing code snippets from your browser's console.
3. If you are familiar with Selenium, you can use it directly in sitespeed.io.

Regardless of the approach, use the **measure command** for accurate metric collection. Every script gets two objects: `context` for accessing options and utilities, and `commands` for interacting with webpages, like navigating and measuring.

#### Context

The context object are passed on to your function and give you access to the following:

* *options* - All the options sent from the CLI to Browsertime.
* *log* - an instance to the log system so you can log from your navigation script.
* *index* - the index of the runs, so you can keep track of which run you are currently on.
* *storageManager* - The Browsertime storage manager that can help you read/store files to disk.
* *selenium.webdriver* -  The Selenium [WebDriver public API object](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html).
* *selenium.driver* - The [instantiated version of the WebDriver](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html) driving the current version of the browser.

In the code you can use the context like this:

~~~javascript
export default async function (context, commands) {
  // 
   context.log.info(
    `My script is starting, you passed on ${context.options.iterations} iterations`
  );
  context.log.info(`Iteration number ${context.index}`);
  ...
}
~~~

If you want to pass data between your scripts you can do that with the context object. Here's an example of the first script:

~~~javascript
export default async function (context, commands) {
  // First you do what you need to do ...
  // then just add a field to the context
  context.myId = 15;
}
~~~

Then in your next script you can get that id:

~~~javascript
export default async function (context, commands) {
  const idToUse = context.myId;
}
~~~


#### Commands
Commands are an help object that helps you interacting with webpages, like navigating and measuring. You can see the full list of commands [here]() and here's a short list of some of the most important one.

* *[navigate(URL)](#navigateurl)* - Use this if you want to use the exact way as Browsertime navigates to a new URL (same settings with pageCompleteCheck etc). Note: the URL will not be measured automatically.
* *[measure.start(URL)](#measurestarturl)* - Start measuring and navigate to a new page in one go.
* *[measure.start(URL,alias)](#measurestarturl-alias)* - Start measuring and navigate to a new page in one go, while register an alias for that URL.
* *[measure.start()](#measurestart)* - Use this when you want to start to measure a page. This will start the video and prepare everything to collect metrics. Note: it will not navigate to the URL.
* *[measure.start(alias)](#measurestartalias)* - Use this when you want to start to measure a page. This will start the video and prepare everything to collect metrics. Note: it will not navigate to the URL and the next URL that will be accessed will get the alias.
* *[measure.stop()](#measurestop)* - Collect metrics for a page.
* *[timer.start()]()* Start a timer and measure the time.
* *[timer.stopAndAdd()]()* Stop the timer and add the result to the last tested URL.

And then you have a few help commands:
* *[wait](#wait)* on a id to appear or wait x amount of ms.
* *[click](#click)* on a link and/or wait for the next page to load.
* *[js](#run-javascript)* - run JavaScript in the browser.
* *[switch](#switch)* to another frame or window.
* *[set](#set)* innerHtml, innerText or value to an element.

Scripting only works for Browsertime. It will not work with Lighthouse/Google Pagespeed Insights or WebPageTest.
{: .note .note-info}

### Await, return and promises.
If you are new to NodeJS using promises/await can be confusing, what does it mean and when should you use it?

Some of the commands/function in Browsertime/sitespeed.io are asynchronous. This means that they return a promise. A promise is an action which will either be completed or rejected. It could be navigating to a new page, running JavaScript or waiting for an element to appear.

To make sure your script wait on the action to complete, you use the `await` keyword.

Navigating to sitespeed.io homepage and waiting on the navigation to complete: 

~~~javascript
export default async function (context, commands) {
  await commands.navigate('https://www.sitespeed.io');
  // We will get here when the action is finished since we use await
}
~~~


sitespeed.io/Browsertime gives full control to your script and is waiting for it to return a promise. That means that if you do many async functions/commands in your page, you should make sure you return the last promise back to sitespeed.io/Browsertime. That way it will wait until everything in your script has finished. Checkout this examample where we test two pages, we wait for the first to finish and then return the last promise back.

~~~javascript
export default async function (context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    return commands.measure.start('https://www.sitespeed.io/documentation/');
}
~~~


### Run
Run your script by passing it to sitespeed.io and adding the parameter ```--multi```. 

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} script.js --multi
~~~

#### Using multiple scripts

If you have multiple scripts, you can just pass them in as well.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} script.mjs script2.mjs script3.mjs --multi
~~~

That way you can just split your long scripts into multiple files and make it easier to manage. In this example sitespeed.io will for each iteratiomn invoke *script.mjs* then *script2.mjs* and last *script3.mjs*

#### Reuse scripts
You can break out code in multiple files.

*test.mjs*
~~~javascript
import { example } from './exampleInclude.mjs';
export default async function (context, commands) {
  example();
}
~~~

*exampleInclude.mjs*
~~~javascript
export async function example() {
  console.log('This is my example function');
}

~~~

And then run it:
```sitespeed.io --multi test.mjs```


#### Using setUp and tearDown in the same script

This is a feature used by Mozilla and was created years ago. Nowadays you can probably just do everything in one script. 

Scripts can also directly define the ```--preScript``` and ```--postScript``` options by implementing a *setUp* and/or a *tearDown* function. These functions will get the same arguments than the test itself. When using this form, the three functions are declared in *module.exports* under the *setUp*, *tearDown* and *test* keys. This works for commons JS files.

Here's a minimal example:

~~~javascript
async function setUp(context, commands) {
  // do some useful set up
};

async function perfTest(context, commands) {
  // add your own code here
};

async function tearDown(context, commands) {
  // do some cleanup here
};

module.exports = {
  setUp: setUp,
  tearDown: tearDown,
  test: perfTest
};
~~~


## Measure

In sitespeed.io, measurements can be conducted using a meassure command for page navigation performance, gathering various metrics during page load. Alternatively, the StopWatch command is used for measuring arbitrary durations, such as the time taken for certain actions to complete. When you create your script you need to know what you want to measure.


### The measure command

The measure is used for preparing and measuring the navigation to a new URL, it starts the video recording, clears internal metrics, and collects technical metrics from the browser once the measurement is stopped​.

In web performance measurement, a *"navigation"* refers to the process of moving from one URL to another, which triggers a series of events in the browser. This includes the unloading of the current page, fetching and executing necessary resources for the new page, rendering the new page, and completing the loading of the new page. The `commands.measure` in sitespeed.io is designed to measure the performance metrics of such navigations, capturing data like page load time, resource timings, and other relevant metrics from the start to the end of the navigation process.

~~~javascript
export default async function (context, commands) {
  // Navigate to https://www.sitespeed.io and measure the navigation
  return commands.measure.start('https://www.sitespeed.io');
};
~~~

If you do not give the measure command a URL, the command will prepare everything and start the video. Then it’s up to you to navigate/click on a link/submit the page. You also need to stop the measurement so that Browsertime/sitespeed.io knows that you want the metrics.

Here's an example where we measure navigationg to the sitespeed.io documentationg page by first navigation to the sitespeed.io start page and then clicking on a link.

~~~javascript
export default async function (context, commands) {
  
  await commands.navigate('https://www.sitespeed.io');

  await commands.measure.start('Documentation');
  // Using a xxxAndWait command will make the page wait for a navigation
  await commands.click.byLinkTextAndWait('Documentation');
  return commands.measure.stop();
}
~~~

### The stop watch command
The Stop Watch command is utilized when there's a need to measure something that is not a navigation, like the time taken for certain processes or actions. It's more manual where you start and stop the watch to measure the elapsed time​​.  

The stop watch metric will be automatically added to the page that was measured before the stop watch.

~~~javascript
export default async function (context, commands) {
  const stopWatch = commands.stopWatch.get('Before_navigating_page');
  // Do the thing you want to measure ...
  // Then stop the watch 
  const time = stopWatch.stop();
  // Measure navigation to a page
  await commands.measure.start('https://www.sitespeed.io');
  // Then attach that timing to that page.
  commands.measure.add(stopWatch.getName(), time);
}
~~~

### Using user timings and element timings API
If you are in control of the page you are testing you can (and should) use the [User Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/User_timing) and the [Element Timing API](https://wicg.github.io/element-timing/). 

These are JavaScript APIs built into the browser. Almost all browser supports the User Timing API and Chrome(ium) browsers support the Element Timing API. 

Browsertime/sitespeed.io will automatically pick up those metrics when you run the measure command.

You can also get those metrics running the JavsScript command. That is useful if you want to collect these metrics yourself and they happen after a page navigation.

~~~javascript
export default async function (context, commands) {
  await commands.navigate('https://www.sitespeed.io');

  // The sitespeed.io start page has a user timing mark named userTimingHeader
  const userTimingHeader = await commands.js.run(
    `return performance.getEntriesByName('userTimingHeader')[0].startTime;`
  );

  // The sitespeed.io start page has a element timing api for the logo
  const logoRenderTime = await commands.js.run(`
  const observer = new PerformanceObserver(list => {});
  observer.observe({ type: 'element', buffered: true });
  const entries = observer.takeRecords();
  for (let entry of entries) {
    if (entry.identifier === 'logo') {
      return Number(entry.renderTime.toFixed(0));
    }
  }
  `);

  context.log.info(
    `User Timing header: ${userTimingHeader} ms  and Logo Element render time ${logoRenderTime} ms`
  );
}
~~~

### Measuring SPA
At the moment browser metrics like paint metrics that you can collect from JavaScript aren't updated when you are using a SPA/a soft navigation. There are [work beeing done here](https://github.com/w3c/performance-timeline/issues/168) and [here](https://developer.chrome.com/blog/soft-navigations-experiment/) in this area and we will work to use that in upcoming releases.

In the current release, you need to record a video of the screen and use the visual metrics. Combine that with User Timings and Element timings and you can measure the most things. We are gonna update the documentation when we have a implementation working for soft navigations.


## Finding the right element

One of the key things in your script is to be able to find the right element to invoke. If the element has an id it's easy. If not you can use developer tools in your favourite browser. The all work mostly the same: Open DevTools in the page you want to inspect, click on the element and right click on DevTools for that element. Then you will see something like this:

![Using Safari to find the selector]({{site.baseurl}}/img/selector-safari.png){:loading="lazy"}
{: .img-thumbnail-center}
<p class="image-info">
 <em class="small center">Using Safari to find the CSS Selector to the element</em>
</p>

![Using Firefox to find the selector]({{site.baseurl}}/img/selector-firefox.png){:loading="lazy"}
{: .img-thumbnail-center}
<p class="image-info">
 <em class="small center">Using Firefox to find the CSS Selector to the element</em>
</p>

![Using Chrome to find the selector]({{site.baseurl}}/img/selector-chrome.png){:loading="lazy"}
{: .img-thumbnail-center}
<p class="image-info">
 <em class="small center">Using Chrome to find the CSS Selector to the element</em>
</p>

## Debug
There's a couple of way that makes it easier to debug your scripts:

* Run in `--debug` mode and add breakpoints to your code. The browser will open with devtools open and will pause on each breakpoint. 

* Make sure to [use the log](#log-from-your-script) so you can see what happens in your log output. Your script can log to the sitespeed.io default log.
~~~javascript
context.log.info('Info logging from your script');
~~~
* Run the script locally on your desktop without XVFB (using [npm version of sitespeed.io](https://www.npmjs.com/package/sitespeed.io)) so you can see in the browser window what happens. That is the easiest way to understand what's going on.
* If you use Docker and cannot run your test locally you can add <code>--browsertime.videoParams.debug</code> when you record the video. That way you will get one full video of all your scripts (but no Visual Metrics). 
~~~bash
docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ -n 1  --browsertime.videoParams.debug
~~~
And then look at the video in the **data/video** folder.
* Use try/catch and await promises so you catch things that doesn't work.
~~~javascript
export default async function (context, commands) {
    await commands.navigate('https://www.sitespeed.io');
    
    await commands.measure.start();
    // Click on the link and wait on navigation to happen but try catch it so we can catch if it fails
    try {
      await commands.click.bySelectorAndWait('body > nav > div > div > div > ul > li:nth-child(2) > a');
      await commands.measure.stop();
    } catch(e) {
      context.log.error('Could not click on ....');
    }
};
~~~
* If you use plain JavaScript you can copy/paste it and run it in your browsers console to make sure it really works.
* Take a [screenshot](/documentation/sitespeed.io/scripting/#screenshot) when your script fail to make it easier to see what's going on.
* If you navigate by clicking on elements you can verify that you end up where you want by running JavaScript. Here's an example where the new URL is logged but you can also verfify that it is the right one.

~~~javascript
export default async function (context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    // Hide everything
    // We do not hide the body since the body needs to be visible when we do the magic to find the staret of the
    // navigation by adding a layer of orange on top of the page
    await commands.js.run('for (let node of document.body.childNodes) { if (node.style) node.style.display = "none";}');
    // Start measurning
    await commands.measure.start();
    // Click on the link and wait on navigation to happen
    await commands.click.bySelectorAndWait('body > nav > div > div > div > ul > li:nth-child(2) > a');
    await commands.measure.stop();

    // Did we we really end up on the page that we wanted? Lets check!
    const url = await commands.js.run('return window.location.href');
    context.log.info(`We ended up on ${url}`);
};
~~~
* If you run into trouble, please make sure you make it easy for us to [reproduce your problem](/documentation/sitespeed.io/bug-report/#explain-how-to-reproduce-your-issue) when you report a issue.


## Example code
Here are some examples on how you can use the scripting capabilities.

### Measure the actual login step

~~~javascript
export default async function (context, commands) {
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
    // We could have an alternative flow ...
    // else we can just let it cascade since it caught later on and reported in
    // the HTML
    throw e;
  }
};
~~~

### Measure the login step and more pages

~~~javascript
export default async function (context, commands) {
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
    // We could have an alternative flow ...
    // else we can just let it cascade since it caught later on and reported in
    // the HTML
    throw e;
  }
};
~~~

### Measure one page after you logged in

Testing a page after you have logged in:
First create a script that logs in the user (login.js):

~~~javascript
export default async function (context, commands) {
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
    // We could have an alternative flow ...
    // else we can just let it cascade since it caught later on and reported in
    // the HTML
    throw e;
  }
};
~~~

Then access the page that you want to test:

~~~bash
sitespeed.io --preScript login.js https://en.wikipedia.org/wiki/Barack_Obama
~~~

#### More complicated login example

~~~javascript
export default async function (context, commands) {
  await commands.navigate(
    'https://example.org'
  );
  try {
    // Find the sign in button and click it
    await commands.click.byId('sign_in_button');
    // Wait some time for the page to open a new login frame
    await commands.wait.byTime(2000);
    // Switch to the login frame
    await commands.switch.toFrame('loginFrame');
    // Find the username fields by xpath (just as an example)
    await commands.addText.byXpath(
      'peter@example.org',
      '//*[@id="userName"]'
    );
    // Click on the next button
    await commands.click.byId('verifyUserButton');
    // Wait for the GUI to display the password field so we can select it
    await commands.wait.byTime(2000);
    // Wait for the actual password field
    await commands.wait.byId('password', 5000);
    // Fill in the password
    await commands.addText.byId('dejh8Ghgs6ga(1217)', 'password');
    // Click the submit button
    await commands.click.byId('btnSubmit');
    // In your implementation it is probably better to wait for an id
    await commands.wait.byTime(5000);
    // Measure the next page as a logged in user
    return  commands.measure.start(
      'https://example.org/logged/in/page'
  );
  } catch(e) {
    // We try/catch so we will catch if the the input fields can't be found
    // We could have an alternative flow ...
    // else we can just let it cascade since it caught later on and reported in
    // the HTML
    throw e;
  }
};
~~~

### Measure multiple pages

Test multiple pages in a script:

~~~javascript
export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  await commands.measure.start('https://www.sitespeed.io/examples/');
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
~~~

### Measure multiple pages and start white

If you test multiple pages you will see that the layout is kept in the browser until the first paint of the new page. You can hack that by removing the current body and set the background color to white. Then every video will start white.

~~~javascript
export default async function (context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    await commands.js.run('document.body.innerHTML = ""; document.body.style.backgroundColor = "white";');
    await commands.measure.start('https://www.sitespeed.io/examples/');
    await commands.js.run('document.body.innerHTML = ""; document.body.style.backgroundColor = "white";');
    return commands.measure.start('https://www.sitespeed.io/documentation/');
};
~~~

### Scroll the page to measure Cumulative Layout Shift

To get the Cumulative Layout Shift metric for Chrome closer to what real users get you can scroll the page and measure that. Depending on how your page work, you may want to tune the delay between the scrolling.


~~~javascript
export default async function (context, commands) {
  const delayTime = 250;

  await commands.measure.start();
  await commands.navigate(
    'https://www.sitespeed.io/documentation/sitespeed.io/performance-dashboard/'
  );
  await  commands.scroll.toBottom(delayTime);
  return commands.measure.stop();
};
~~~

### Add your own metrics
You can add your own metrics by adding the extra JavaScript that is executed after the page has loaded BUT did you know that also can add your own metrics directly through scripting? The metrics will be added to the metric tab in the HTML output and automatically sent to Graphite/InfluxDB.

In this example we collect the temperature from our Android phone that runs the tests:

~~~javascript
export default async function (context, commands) {
  // Get the temperature from the phone
  const temperature = await commands.android.shell("dumpsys battery | grep temperature | grep -Eo '[0-9]{1,3}'");
  // Start the test
  await commands.measure.start(
    'https://www.sitespeed.io'
  );
  // This is the magic where we add that new metric. It needs to happen
  // after measure.start so we know where that metric belong
  commands.measure.add('batteryTemperature', temperature/10);
};
~~~

In this example we collect the number of comments on a blog post using commands.js.run() 
to collect an element, use regex to parse out the number, and add it back as a custom metric.

~~~javascript
export default async function (context, commands) {
   await commands.measure.start('blog-post'); //alias is now blog-post
   await commands.navigate('https://www.exampleBlog/blog-post');
   
   //use commands.js.run to return the element using pure javascript
   const element = await commands.js.run('return(document.getElementsByClassName("comment-count")[0].innerText)'); 
   
   //parse out just the number of comments
   var elementMetric = element.match(/\d/)[0];
  
   // need to stop the measurement before you can add it as a metric
   await commands.measure.stop();
   
   // metric will now be added to the html and outpout to graphite/influx if you're using it
   await commands.measure.add('commentsCount', elementMetric);
};
~~~

### Measure shopping/checkout process
One of the really cool things with scripting is that you can measure all the pages in a checkout process. This is an example shop where you put one item in your cart and checkout as a guest.

~~~javascript
export default async function (context, commands) {
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
  await commands.js.run('for (let node of document.body.childNodes) { if (node.style) node.style.display = "none";}');
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
export default async function (context, commands) {
  context.log.info('Info logging from your script');
  context.log.error('Error logging from your script');
};
~~~

### Pass your own options to your script
You can add your own parameters to the options object (by adding a parameter) and then pick them up in the script. The scripts runs in the context of browsertime, so you need to pass it in via that context.

For example: you wanna pass on a password to your script, you can do that by adding <code>--browsertime.my.password MY_PASSWORD</code> and then in your code get a hold of that with:

~~~javascript
export default async function (context, commands) {
  // We are in browsertime context so you can skip that from your options object
  context.log.info(context.options.my.password);
};
~~~

If you use a configuration file you can pass on options like this:
~~~json
{
    "browsertime": {
        "my": {
            "password": "paAssW0rd"
        }
    }
}
~~~



### Error handling
You can try/catch failing commands that throw errors. If an error is not caught in your script, it will be caught in sitespeed.io and the error will be logged and reported in the HTML and to your data storage (Graphite/InfluxDb) under the key *browsertime.statistics.errors*.

If you do catch the error, you should make sure you report it yourself with the [error command](#error), so you can see that in the HTML. This is needed for all errors except navigating/measuring a URL. They will automatically be reported (since they are always important).

Here's an example of catching a URL that don't work and still continue to test another one. Remember since a navigation fails, this will be reported automatically and you don't need to do anything.

~~~javascript
export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  try {
    await commands.measure.start('https://nonworking.url/');
  } catch (e) {}
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
~~~

You can also create your own errors. The error will be reported in the HTML and sent to Graphite/InfluxDB. If you report an error, the exit code from sitespeed.io will be > 0.

~~~javascript
export default async function (context, commands) {
  // ...
  try {
    // Click on a link
    await commands.click.byLinkTextAndWait('Checkout');
  } catch (e) {
    // Oh no, the content team has changed the name of the link!
     commands.error('The link named Checkout do not exist on the page');
    // Since the error is reported, you can alert on it in Grafana
  }
};
~~~

### Measuring First Input Delay - FID
One of the new metrics Google is pushing is [First Input Delay](https://developers.google.com/web/updates/2018/05/first-input-delay). You can use it when you collect RUM but it can be hard to know what the user is doing. The recommended way is to use the Long Task API but the truth is that the attribution from the API is ... well can be better. When you have a long task, it is really hard to know why by looking at the attribution.

How do we measure FID with sitespeed.io? You can measure clicks and button using the [Selenium Action API](https://selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/input_exports_Actions.html) and then sitespeed.io uses the `first-input` performance observer to get it. What's really cool is that you can really measure it, instead of doing guestimates.

Here's an example on measuring open the navigation on Wikipedia on mobile. I run my tests on a Alacatel One phone.

~~~javascript
export default async function (context, commands) {
  // We have some Selenium context
  const webdriver = context.selenium.webdriver;
  const driver = context.selenium.driver;

  // Start to measure
  await commands.measure.start();
  // Go to a page ...
  await commands.navigate('https://en.m.wikipedia.org/wiki/Barack_Obama');

  // When the page has finished loading you can find the navigation and click on it
  const actions = driver.actions();
  const nav = await driver.findElement(
    webdriver.By.xpath('//*[@id="mw-mf-main-menu-button"]')
  );
  await actions.click(nav).perform();

  // Measure everything, that means you will run the JavaScript that collects the first input delay
  return commands.measure.stop();
};
~~~

You will see the metric in the page summary and in the metrics section.

![First input delay]({{site.baseurl}}/img/first-input-delay.png){:loading="lazy"}
{: .img-thumbnail}

You can do mouse click, key press but there's no good way to do swiping as we know using the [Selenium Action API](https://selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/input_exports_Actions.html). Your action will run after the page has loaded. If you wanna know what kind potential input delay you can have on load, you can use the *maxPotentialFid* metric that you will get by enabling `--cpu`.

### Test multiple URLs

If you want to test multiple URLs and need to do some specific things before each URL, you can do something like this (we pass on our [own options](#pass-your-own-options-to-your-script) to the script):

~~~javascript
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
~~~

Then run your tests like this:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} testMultipleUrls.js --multi --browsertime.urls https://www.sitespeed.io --browsertime.urls https://www.sitespeed.io/documentation -n 1
~~~

Or if you use JSON configuration, the same configuration looks like this:

~~~json
{ 
  "browsertime": {
    "urls": ["url1", "url2", "url3"]
  }
}
~~~

## Tips and Tricks

### Include the script in the HTML result
If you wanna keep of what script you are running, you can include the script into the HTML result with ```--html.showScript```. You will then get a link to a page that show the script.

![Page to page]({{site.baseurl}}/img/script-link.png){:loading="lazy"}
{: .img-thumbnail}

### Getting correct Visual Metrics
Visual metrics is the metrics that are collected using the video recording of the screen. In most cases that will work just out of the box. One thing to know is that when you go from one page to another page, the browser keeps the layout of the old page. That means that your video will start with the first page (instead of white) when you navigate to the next page.

It will look like this:
![Page to page]({{site.baseurl}}/img/filmstrip-multiple-pages.jpg){:loading="lazy"}
{: .img-thumbnail}

This is perfectly fine in most cases. But if you want to start white (the metrics somehow isn't correct) or if you click a link and that click changes the layout and is caught as First Visual Change, there are workarounds.

If you just want to start white and navigate to the next page you can just clear the HTML between pages:

~~~javascript
export default async function (context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    // Renove the HTML and make sure the background is white
    await commands.js.run('document.body.innerHTML = ""; document.body.style.backgroundColor = "white";');
    return commands.measure.start('https://www.sitespeed.io/examples/');
};
~~~

If you want to click a link and want to make sure that the HTML doesn't change when you click the link, you can try to hide the HTML and then click the link.

~~~javascript
export default async function (context, commands) {
    await commands.measure.start('https://www.sitespeed.io');
    // Hide everything
    // We do not hide the body since the body needs to be visible when we do the magic to find the staret of the
    // navigation by adding a layer of orange on top of the page
    await commands.js.run('for (let node of document.body.childNodes) { if (node.style) node.style.display = "none";}');
    // Start measurning
    await commands.measure.start();
    // Click on the link and wait on navigation to happen
    await commands.click.bySelectorAndWait('body > nav > div > div > div > ul > li:nth-child(2) > a');
    return commands.measure.stop();
};
~~~

### Getting values from your page
In some scenarios you want to do different things dependent on what shows on your page. For example: You are testing a shop checkout and you need to verify that the item is in stock. You can run JavaScript and get the value back to your script.

Here's an simple example, IRL you will need to get something from the page:

~~~javascript
export default async function (context, commands) {
  // We are in browsertime context so you can skip that from your options object
  const secretValue = await commands.js.run('return 12');
  // if secretValue === 12 ...
}
~~~

If you want to have different flows depending on a element exists you can do something like this:

~~~javascript
...
const exists = await commands.js.run('return (document.getElementById("nonExistsingID") != null) ');
if (exists) {
    // The element with that id exists
} else {
    // There's no element with that id
}
~~~

### Test one page that need a much longer page complete check than others

If you have one page that needs some special handling that maybe do a couple of late and really slow AJAX requests, you can catch that with your on wait for the page to finish.

~~~javascript
export default async function (context, commands) {
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
export default async function (context, commands) {
    await commands.measure.start('https://www.sitespeed.io/', 'HomePage');

    // Do something smart that then make you need to test the same URL again
    // ...

    return commands.navigate('https://www.sitespeed.io/?dummy', 'BackToHomepage');
};
~~~

## Commands

All commands will return a promise and you should await it to fulfil. If some command do not work, we will log that automatically and rethrow the error, so you can catch that and can act on that.

The commands that ends with a **...AndWait** will wait for a new page to load, so use them only when you are clicking on a link and want a new page or view to load.

### Measure
The measure command will prepare everything for measuring navigating to a new URL (clearing internal metrics, starting the video etc). If you give an URL to the measure command it will start to measure and navigate to that URL.

If you do not give it a URL, it will prepare everything and start the video. So it's up to you to navigate/click on a link/submit the page. You also need to stop the measurement so that Browsertime/sitespeed.io knows that you want the metrics.

#### measure.start(url)
Start and navigate to the URL and then automatically call the stop() function after the page has stopped navigating decided by the current pageCompleteCheck.

~~~javascript
export default async function (context, commands) {
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
export default async function (context, commands) {
  // Measure the page and give it the alias StartPage
  return commands.measure.start('https://www.sitespeed.io', 'StartPage');
};
~~~

#### measure.start()
Start to measure. Browsertime/sitespeed.io will pick up the next URL and measure that. You need to call the stop() function yourself.

~~~javascript
export default async function (context, commands) {
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
export default async function (context, commands) {
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

#### measure.add(name, value)
Add your own measurements directly from your script. The data will be availible in the HTML on the metrics page and automatically sent to Graphite/InfluxDB.

To be able to add any metrics, you need to have started a measurements.

~~~javascript
export default async function (context, commands) {
  // Get the temperature from the phone
  const temperature = await commands.android.shell("dumpsys battery | grep temperature | grep -Eo '[0-9]{1,3}'");
  // Start the test
  await commands.measure.start(
    'https://www.sitespeed.io'
  );
  commands.measure.add('batteryTemperature', temperature/10);
};
~~~

And you will get that metric in the HTML:

![Adding metrics from your script]({{site.baseurl}}/img/batteryTemperatureMetric.png){:loading="lazy"}
{: .img-thumbnail}


#### measure.addObject(object)
You can also add multiple metrics in one go.
~~~javascript
export default async function (context, commands) {
 
  const extraMetrics = { a: 1, b: 2, c: 3};
  // Start the test
  await commands.measure.start(
    'https://www.sitespeed.io'
  );
  commands.measure.addObject(extraMetrics);
};
~~~

And it will look like this:

![Multiple metrics from a script]({{site.baseurl}}/img/scriptMetrics.png){:loading="lazy"}
{: .img-thumbnail}


And you can also add deep nested objects (no support in the HTML yet though, only in the data source).

~~~javascript
export default async function (context, commands) {
 
  const extraMetrics = { android: {cpu: {temperature: 27, cores: 2}}};
  // Start the test
  await commands.measure.start(
    'https://www.sitespeed.io'
  );
  commands.measure.addObject(extraMetrics);
};
~~~

### Stop Watch
If need to measure something that is not a navigation, you can do that by using a stop watch and measure the time.


#### stopWatch.get
You give your stop watch a name (that name will be used for the metric in the result).

Get your stop watch like this:

~~~javascript
const stopWatch = commands.stopWatch.get('My_watch');
~~~

#### start()

When you get the watch it's automatically started. You can restart the watch:

~~~javascript
  stopWatch.start();
~~~

#### stop() or stopAndAdd()

You stop your stop watch by either just stop it or stop it and add the metric to the last tested page.

~~~javascript
 // Stop the watch
 stopWatch.stop();
 // Or stop the watch and add it to the page
 stopWatch.stopAndAdd(); 
~~~

If you want to measure how long time somethings takes before you navigate to a page you should follow this pattern:

~~~javascript
export default async function (context, commands) {
  const stopWatch = commands.stopWatch.get('Before_navigating_page');
  // Do the thing you want to measure ...
  // Then stop the watch 
  const time = stopWatch.stop();
  // Measure navigation to a page
  await commands.measure.start(
    'https://www.sitespeed.io'
  );
  // Then attach that timing to that page.
  commands.measure.add(stopWatch.getName(), time);
}
~~~

If you already measured a page and want to attach the metric to that page you can follow this pattern:

~~~javascript
export default async function (context, commands) {

  await commands.measure.start(
    'https://www.sitespeed.io'
  );
  const stopWatch = commands.stopWatch.get('After_navigating_page');
  // Do the thing you want to measure ...
  stopWatch.stopAndAdd();
}
~~~

### Breakpoint

You can use breakpoints to debug your script. You can add breakpoints to your script that will be used when you run in `--debug` mode. At each breakpoint the browser will pause. You can continue by adding `window.browsertime.pause=false;` in your developer console.

Debug mode works in Chrome/Firefox/Edge when running on desktop. It do not work in Docker and on mobile. When you run in debug mode, devtools will be automatically open so you can debug your script.

In debug mode, the browser will pause after each iteration.

~~~javascript
export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  await commands.breakpoint('');
  return commands.measure.start('https://www.sitespeed.io/documentation/');
};
~~~


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
Click on a link/element located by a JavaScript expression. Internally this will append a `.click()` to the JavaScript expression (for example if you add the JavaScript `document.querySelector("a")` to select the element, the backend code will run `document.querySelector("a").click()`). The result of this expression must be an element or list of elements.

#### click.byJsAndWait(js)
Click on a link located by JavaScript expression. Internally this will append a `.click()` to the JavaScript expression. The result of this expression must be an element or list of elements. And wait for [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) to finish.

#### click.byId(id)
Click on link located by the ID attribute. Internally we use  ```document.getElementById(id)``` to get the correct element.

#### click.byIdAndWait(id)
Click on link located by the ID attribute. Internally we use  ```document.getElementById(id)``` to get the correct element. And wait for [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) to finish.

#### click.bySelector(selector)
Click on element that is found by the CSS selector that has the given value. Internally we use  ```document.querySelector(selector)``` to get the correct element.

#### click.bySelectorAndWait(selector)
Click on element that is found by name CSS selector that has the given value and wait for the [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) to happen. Internally we use  ```document.querySelector(selector)``` to get the correct element.

#### click.byName(name)
Click on element located by the name. Internally we use  ```document.querySelector``` to get the correct element.
### Mouse
The mouse command will perform various mouse events.

#### mouse.moveTo.byXpath(xpath)
Move mouse to an element that matches a XPath selector.

#### mouse.moveTo.bySelector(selector)
Move mouse to an element that matches a CSS selector.

#### mouse.moveTo.toPosition(xPos, yPos)
Move mouse to a given position.

#### mouse.moveTo.byOffset(xOff, yOff)
Move mouse by a given offset to current location.

#### mouse.contextClick.byXpath(xpath)
Perform ContextClick on an element that matches a XPath selector.

#### mouse.contextClick.bySelector(selector)
Perform ContextClick on an element that matches a CSS selector.
#### mouse.contextClick.atCursor()
Perform ContextClick at the cursor's position.

#### mouse.singleClick.byXpath(xpath, options)
Perform mouse single click on an element matches a XPath selector.  Options is an optional parameter, and if the property 'wait' is set to true, browsertime will wait until the pageCompleteCheck has finished.

#### mouse.singleClick.bySelector(selector, options)
Perform mouse single click on an element matches a CSS selector.  Options is an optional parameter, and if the property 'wait' is set to true, browsertime will wait until the pageCompleteCheck has finished.
#### mouse.singleClick.atCursor(options)
Perform mouse single click at the cursor's position.  Options is an optional parameter, and if the property 'wait' is set to true, browsertime will wait until the pageCompleteCheck has finished.

#### mouse.doubleClick.byXpath(xpath, options)
Perform double single click on an element matches a XPath selector.  Options is an optional parameter, and if the property 'wait' is set to true, browsertime will wait until the pageCompleteCheck has finished.

#### mouse.doubleClick.bySelector(selector, options)
Perform double single click on an element matches a CSS selector.  Options is an optional parameter, and if the property 'wait' is set to true, browsertime will wait until the pageCompleteCheck has finished.

#### mouse.doubleClick.atCursor(options)
Perform mouse double click at the cursor's position.  Options is an optional parameter, and if the property 'wait' is set to true, browsertime will wait until the pageCompleteCheck has finished.

#### mouse.clickAndHold.byXpath(xpath)
Click and hold an element that matches a XPath selector.

#### mouse.clickAndHold.bySelector(selector)
Click and hold an element that matches a CSS selector.

#### mouse.clickAndHold.atCursor()
Click and hold an element at the cursor's position.

#### mouse.clickAndHold.atPosition(xPos, yPos)
Click and hold an element at the specified position.

#### mouse.clickAndHold.releaseAtXpath(xpah)
Release mouse on element that matches the specified Xpath.

#### mouse.clickAndHold.releaseAtSelector(selector)
Release mouse on element that matches the specified CSS selector.

#### mouse.clickAndHold.releaseAtPosition(xPos, yPos)
Release mouse at specified coordinates.

### Wait
There are a couple of help commands that makes it easier to wait. Either you can wait on a specific id to appear or for x amount of milliseconds.

#### wait.byTime(ms)
Wait for x ms.

#### wait.byId(id,maxTime)
Wait for an element with id to appear before maxTime. The element needs to be visible for the user. If the element do not appear within maxTime an error will be thrown.

#### wait.byXpath(xpath, maxTime)
Wait for an element found by xpath to appear before maxTime. The element needs to be visible for the user. If the element do not appear within maxTime an error will be thrown.

####  wait.bySelector(selector, maxTime)
Wait for an element found by selector to appear before maxTime. The element needs to be visible for the user. If the element do not appear within maxTime an error will be thrown.

####  wait.byCondition(condition, maxTime)
Wait for a JavaScript condition that eventually will be a truthy-value before maxTime. If the condition do not met within maxTime an error will be thrown.

You pass on your JavaScript condition like:  `wait.byCondition("document.querySelector('a.active').innerHTML === 'Start'");`

#### wait.byPageToComplete()
Wait for the page to finish loading by using the configured [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test). This can be useful if you use Selenium to click on elements and want to wait on a new page to load.

### Run JavaScript
You can run your own JavaScript in the browser from your script.

#### js.run(javascript)
Run JavaScript. Will throw an error if the JavaScript fails.

If you want to get values from the web page, this is your best friend. Make sure to return the value and you can use it in your script.

~~~javascript
export default async function (context, commands) {
  // We are in browsertime context so you can skip that from your options object
  const secretValue = await commands.js.run('return 12');
  // if secretValue === 12 ...
}
~~~

By default this will return a [Selenium WebElement](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElement.html).

#### js.runAndWait(javascript)
Run JavaScript and wait for [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test). This is perfect if you wanna click on links with pure JavaScript and measure a URL. Will throw an error if the JavaScript fails.

### Navigate
Navigate/go to a URL without measuring it.

#### navigate(url)
Navigate to a URL and do not measure it. It will use the default [page complete check](/documentation/sitespeed.io/browsers/#choose-when-to-end-your-test) and follow the exact same pattern for going to a page as normal Browsertime navigation except it will skip collecting any metrics.

#### navigation.back()
Navigate backward in history.

#### navigation.forward()
Navigate forward in history.

#### navigation.refresh()
Refresh page.

### Scroll
Scroll the page.

#### scroll.byPixels(xPixels, yPixels)
Scroll the page by the specified pixels.
#### scroll.byPages(pages)
Scroll the page by the specified pages.

#### scroll.toBottom(delayTime)
Scroll to the bottom of the page. Will scroll by pages and wait the delay time between each scroll. Default delay time is 250 ms.

~~~javascript
export default async function (context, commands) {
  // ... navigate to page  ...
  await commands.scroll.toBottom();
}
~~~
#### scroll.byLines(lines)
Scroll the page by the specified lines.  Only supported by Firefox.

### Add text
You can add text to input elements. The element needs to visible.

#### addText.byId(text, id)
Add the *text* to the element with the *id*. If the id is not found the command will throw an error.

#### addText.byXpath(text, xpath)
Add the *text* to the element by using *xpath*. If the xpath is not found the command will throw an error.

#### addText.bySelector(text, selector)
Add the *text* to the element by using *CSS selector*. If the xpath is not found the command will throw an error.

#### addText.byName(text, name)
Add the *text* to the element by using the attribute name. If the element is not found the command will throw an error.

#### addText.byClassName(text, className)
Add the *text* to the element by using class name. If the element is not found the command will throw an error.

### Screenshot
Take a screenshot. The image is stored in the screenshot directory for the URL you are testing. This can be super helpful to use in a catch block if something fails. If you use sitespeed.io you can find the image in the screenshot tab for each individual run. 

![Screenshots]({{site.baseurl}}/img/multiple-screenshots.jpg){:loading="lazy"}
{: .img-thumbnail-center}

#### screenshot.take(name) 
Give your screenshot a name and it will be used together with the iteration index to store the image.

### Switch
You can switch to iframes or windows if that is needed.

If frame/window is not found, an error will be thrown.
{: .note .note-warning}

#### switch.toFrame(id)
Switch to a frame by its id.


#### switch.toFrameByXpath(xpath)
Switch to window by xpath.
#### switch.toFrameBySelector(selector)
Switch to window by CSS selector.
#### switch.toWindow(name)
Switch to window by name.

#### switch.toParentFrame
Switch to the parent frame.

#### switch.toNewTab(url)
Create a new tab and switch to it. Url parameter is optional which will trigger a navigation ot the given url.

#### switch.toNewWindow(url)
Create a new window and switch to it. Url parameter is optional which will trigger a navigation ot the given url.

### Set

Raw set value of elements.

#### set.innerHtml(html, selector)
Use a CSS selector to find the element and set the html to innerHtml. Internally it uses ```document.querySelector(selector)``` to find the right element.

#### set.innerHtmlById(html, id)

Use the id to find the element and set the html to innerHtml. Internally it uses ```document.getElementById(id)``` to find the right element.

#### set.innerText(text, selector)
Use a CSS selector to find the element and set the text to innerText. Internally it uses ```document.querySelector(selector)``` to find the right element.

#### set.innerTextById(text, id)
Use the id to find the element and set the text to innerText. Internally it uses ```document.getElementById(id)``` to find the right element.

#### set.value(value, selector)
Use a CSS selector to find the element and set the value to value. Internally it uses ```document.querySelector(selector)``` to find the right element.

#### set.valueById(value, id)
Use the id to find the element and set the value to value. Internally it uses ```document.getElementById(id)``` to find the right element.

### Cache
There's an experimental command for clearing the cache. The command works both for Chrome and Firefox. Use it when you want to clear the browser cache between different URLs.

#### cache.clear()
Clear the browser cache. Remove cache and cookies.

~~~javascript
export default async function (context, commands) {
  // First you probably visit a couple of pages and then clear the cache
  await commands.cache.clear();
  // And then visit another page
}
~~~

#### cache.clearKeepCookies()
Clear the browser cache but keep cookies.

~~~javascript
export default async function (context, commands) {
  // If you have login cookies that lives really long you may want to test aceesing the page as a logged in user
  // but without a browser cache. You can try that with ...

  // Login the user and the clear the cache but keep cookies
  await commands.cache.clearKeepCookies();
  // and then access the URL you wanna test.
}
~~~

### Chrome DevTools Protocol
Send messages to Chrome using the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/). This only works in Chrome/Edge at the moment. You can send, send and get and listen on events.

#### cdp.send(command, args)
Send a command to Chrome and don't expect something back.

Here's an example of injecting JavaScript that runs on every new document.

~~~javascript
export default async function (context, commands) {
  await commands.cdp.send('Page.addScriptToEvaluateOnNewDocument',{source: 'console.log("hello");'});
  await commands.measure.start('https://www.sitespeed.io');
}
~~~

#### cdp.sendAndGet(command, args)
Send a command to Chrome and get the result back.

~~~javascript
export default async function (context, commands) {
  await commands.measure.start('https://www.sitespeed.io');
  const domCounters = await commands.cdp.sendAndGet('Memory.getDOMCounters');
  context.log.info('Memory.getDOMCounters %j', domCounters);
 }
~~~

#### cdp.on(event, functionOnEvent)
You can listen to CDP events. Here's an example to get hold of all responses for a page.

~~~javascript
export default async function (context, commands) {
  const responses = [];
  await commands.cdp.on('Network.responseReceived', params => {
    responses.push(params);
  });
  await commands.measure.start('https://www.sitespeed.io/search/');
  context.log.info('Responses %j', responses);
};
~~~

#### cdp.dp.getRawClient()
Get the raw CDP client so you can do whatever you want. Here's an example on how to change the server header on the response.

~~~javascript
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

  await commands.measure.start('https://www.sitespeed.io/search/');
}
~~~
### Error
You can create your own error. The error will be attached to the latest tested page. Say that you have a script where you first measure a page and then want to click on a specific link and the link doesn't exist. Then you can attach your own error with your own error text. The error will be sent to your datasource and will be visible in the HTML result.

~~~javascript
export default async function (context, commands) {
  // Start by navigating to a page
  await commands.navigate('https://www.example.org');
  // Start a measurement
  await commands.measure.start();
  try {
  await commands.click.bySelectorAndWait('.important-link');
  } catch(e) {
    // Ooops we couldn't click the link
    commands.error('.important-link does not exist on the page');
  }
  // Remember that when you start() a measurement without a URL you also needs to stop it!
  return commands.measure.stop();
};
~~~

#### error(message)
Create an error. Use it if you catch a thrown error, want to continue with something else, but still report the error.


### Select
Select command for selecting an option in a drop-down field.

#### select.selectByIdAndValue(selectId, value)
Select a field by the id of the select element and the value of the option.

#### select.selectByNameAndValue(selectName, value)
Select a field by the name of the select element and the value of the option.
#### select.selectByIdAndIndex(selectId, index)
Select a field by the id of the select element and the index of the option.
#### select.selectByNameAndIndex(selectName, index)
Select a field by the name of the select element and the index of the option.

#### select.deselectById(selectId)
Deselect a field by the id of the select element.
#### select.getValuesById(selectId)
Get the values of all options in a select field by the id of the select element.
#### select.getSelectedValueById(selectId)
Get the value of the selected option in a select field by the id of the select element.
### Meta data
Add meta data to your script. The extra data will be visible in the HTML result page.

Setting meta data like this:

~~~javascript
export default async function (context, commands) {
  commands.meta.setTitle('Test Grafana SPA');
  commands.meta.setDescription('Test the first page, click the timepicker and then choose <b>Last 30 days</b> and measure that page.');
  await commands.measure.start(
    'https://dashboard.sitespeed.io/d/000000044/page-timing-metrics?orgId=1','pageTimingMetricsDefault'
  );
  await commands.click.byClassName('gf-timepicker-nav-btn');
  await commands.wait.byTime(1000);
  await commands.measure.start('pageTimingMetrics30Days');
  await commands.click.byLinkTextAndWait('Last 30 days');
  await commands.measure.stop();
};
~~~

Will result in:

![Title and description for a script]({{site.baseurl}}/img/titleanddesc.png){:loading="lazy"}
{: .img-thumbnail}

#### meta.setTitle(title)
Add a title of your script. The title is text only.

#### meta.setDescription(desc)
Add a description of your script. The description can be text/HTML.

### Android
If you run your tests in an Android phone you probably want to interact with your phone throught the shell.

~~~javascript
export default async function (context, commands) {
  // Get the temperature from the phone
  const temperature = await commands.android.shell("dumpsys battery | grep temperature | grep -Eo '[0-9]{1,3}'");
  context.log.info('The battery temperature is %s', temperature/10);
  // Start the test
  return commands.measure.start(
    'https://www.sitespeed.io'
  );
};
~~~

#### android.shell(command)
Run a shell command directly on your phone. 
 
### Use Selenium directly
You can use Selenium directly if you need to use things that are not available through our commands. We use the NodeJS flavor of Selenium.

You get a hold of the Selenium objects through the context.

The *selenium.webdriver* is the Selenium [WebDriver public API object](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html). And *selenium.driver* is the [instantiated version of the WebDriver](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html) driving the current version of the browser.

Checkout this example to see how you can use them.

~~~javascript
export default async function (context, commands) {
  // We fetch the selenium webdriver from context
  // The selenium-webdriver 
  // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index.html
  const seleniumWebdriver = context.selenium.webdriver;
  // The driver exposes for example By that you use to find elements
  const By = seleniumWebdriver.By;

  // We use the driver to find an element
  const seleniumDriver = context.selenium.driver;

  // To navigate to a new page it is best to use our navigation commands
  // so the script waits until the page is loaded
  await commands.navigate('https://www.sitespeed.io');

  // Lets use Selenium to find the Documentation link
  const seleniumElement = await seleniumDriver.findElement(By.linkText('Documentation'));
  
  // So now we actually got a Selenium WebElement 
  // https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElement.html
  context.log.info('The element tag is ', await seleniumElement.getTagName());

  // We then use our command to start a measurement
  await commands.measure.start('DocumentationPage');

  // Use the Selebium WebElement and click on it
  await seleniumElement.click();
  // We make sure to wait for the new page to load
  await commands.wait.byPageToComplete();

  // Stop the measuerment
  return commands.measure.stop();
}
~~~

If you need help with Selenium, checkout [the official Selenium documentation](https://www.seleniumhq.org/docs/).

