---
layout: default
title: Pre/post scripts (log in the user)
description: You can login the user to test pages as a logged in user.
keywords: selenium, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Pre/post scripts (log in the user)
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Pre/post scripts

# Pre/post scripts and login the user
{:.no_toc}

* Lets place the TOC here
{:toc}

# Selenium
Since sitespeed.io 8.0 the pre/post script has changed. You probably should use just [a script to navigate](../scripting/). 

Before sitespeed.io loads and tests a URL you can run your own Selenium script. Do you want to access a URL and pre-load the cache or maybe you want to login as a user and then measure a URL?

We use the NodeJS version of Selenium, you can find the [API documentation here](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html). You need to go into the docs to see how to select the elements you need to do the magic on your page.

Your script needs to follow a specific pattern to be able to run as a pre/post script. The simplest version of a script looks like this:

~~~javascript
module.exports = async function(context, commands) {
  // add your own code here
}
~~~

Move on to read about the data that is passed in the context object and how you can use it to get hold of the Selenium objects you need to interact with the page.

## Data to the pre/post script

Your script will get access to two objects: The *context* object that holds information about the current run and the *commands* object that has commands/shortcuts to navigate in the page,

The context object:
* *options* - All the options sent from the CLI to Browsertime.
* *log* - an instance to the log system so you can log from your navigation script.
* *index* - the index of the runs, so you can keep track of which run that is running.
* *storageManager* - The Browsertime storage manager that can help you get read/store files to disk.
* *selenium.webdriver* -  The Selenium [WebDriver public API object](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html).
* *selenium.driver* - The [instantiated version of the WebDriver](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html) driving the current version of the browser.


The commands object:
* *navigate(URL)* - Use this if you want to use the exact way as Browsertime navigates to a new URL (same settings with pageCompleteCheck etc). But that URL will not be measured automatically.
* *measure.start(URL)* - Start measuring and navigate to a new page in one go and measure.
* *measure.start(URL,alias)* - Start measuring and navigate to a new page in one go and measure. And register an alias for that URL.
* *measure.start()* - Use this when you want to start to measure a page. This will start the video and prepare everything to collect metrics. But it will not navigate to the URL.
* *measure.start(alias)* - Use this when you want to start to measure a page. This will start the video and prepare everything to collect metrics. But it will not navigate to the URL. The next URL that will be accessed will get the alias.
* *measure.stop()* - Collect metrics for a page.

## Debug/log from your script
In your script you can get hold of the log object from sitespeed.io. This is super useful when you want to test your script and verify that everything works as it should. We use [intel](https://www.npmjs.com/package/intel) for logging.

~~~javascript
module.exports = async function(context, commands) {
  // Simple example to add a log message
  // Remember that you can log message on different levels
  context.log.info('Log message from the task');
};
~~~

## Login example
Create a script where you login the user. The following is an example to login the user at Wikipedia. Start by creating a file login.js with the following.

~~~javascript
module.exports = async function(context, commands) {
  await commands.navigate(
    'https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page'
  );
  // Add text into an input field y finding the field by id
  await commands.addText.byId('login', 'wpName1');
  await commands.addText.byId('password', 'wpPassword1');

  // find the sumbit button and click it
  await commands.click.byIdAndWait('wpLoginAttempt');

  // we wait for something on the page that verifies that we are logged in
  return commands.wait.byId('pt-userpage',3000);
};
~~~

Make sure to change the username & password if you try this on Wikipedia. And of course change the full script to make it work on your site.
{: .note .note-warning}

Then run it like this:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --preScript /sitespeed.io/login.js https://en.wikipedia.org/wiki/Barack_Obama
~~~

The script will then login the user and access https://en.wikipedia.org/wiki/Barack_Obama and measure that page.


## Pass your own options to your pre/post scripts
You can add your own parameters to the options object (by adding a parameter) and then pick them up in the pre/post script. The scripts runs in the context of browsertime, so you need to 
pass it on in that context.

For example: you wanna pass on a password to your script, you can do that by adding <code>--browsertime.my.password MY_PASSWORD</code> and then in your code get hold of that with: 

~~~javascript
...
// We are in browsertime context so you can skip that from your options object
context.log.info(context.options.my.password);
...
~~~

