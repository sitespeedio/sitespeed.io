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
Before sitespeed.io loads and tests a URL you can run your own Selenium script. Do you want to access a URL and pre-load the cache or maybe you want to login as a user and then measure a URL?

We use the NodeJs version of Selenium, you can find the [API documentation here](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html).

## Login example
Create a script where you login the user. The following is an example to login the user at Wikipedia. Start by creating a file login.js with the following.

~~~
module.exports = {
  run(context) {
    return context.runWithDriver((driver) => {
      // Go to Wikipedias login URL
      return driver.get('https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page')
        .then(() => {
          // You need to find the form, the login input fields and the
          // password field. Just add you name and password and submit the form
          // For more docs, checkout the NodeJS Selenium version
          // http://seleniumhq.github.io/selenium/docs/api/javascript/index.html

          // we fetch the selenium webdriver from context
          const webdriver = context.webdriver;
          // and get hold of some goodies we want to use
          const until = webdriver.until;
          const By = webdriver.By;

          // before you start, make your username and password
          const userName = 'YOUR_USERNAME_HERE';
          const password = 'YOUR_PASSWORD_HERE';
          const loginForm = driver.findElement(By.name('userlogin'));
          driver.findElement(By.id('wpName1')).sendKeys(userName);
          driver.findElement(By.id('wpPassword1')).sendKeys(password);
          var loginButton = driver.findElement(webdriver.By.id('wpLoginAttempt'));
          loginButton.click();
          // we wait for something on the page that verifies that we are logged in
          return driver.wait(until.elementLocated(By.id('pt-userpage')), 3000);
        });
    })
  }
};
~~~

Make sure to change the username & password!
{: .note .note-warning}

Then run it like this:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --preScript /sitespeed.io/login.js https://en.wikipedia.org/wiki/Barack_Obama
~~~

The script will then login the user and access https://en.wikipedia.org/wiki/Barack_Obama and measure that page.


Checkout the magic row:

~~~
const webdriver = context.webdriver;
~~~

From the context object you get a hold of the Selenium [Webdriver object](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html) and the mechanisms for locating an element on the page.

Note: Use the supplied *driver* object to go to a specific page.

## Data to the pre/post script

Your pre/post script is fed with the Selenium **driver** (that you use if you need to navigate to a page) and a batch of other objects in the context object.

~~~
 const context = {
      url,
      options,
      log,
      storageManager: this.storageManager,
      taskData: {},
      index,
      webdriver,
      runWithDriver: function(driverScript) {
        return browser.runWithDriver(driverScript);
      }
    };
~~~

The important objects that you can use are:
* *url* - The URL of the page that you are going to test
* *options* - The options object that is created from the CLI. Here you can get hold of all paramaters you pass on to sitespeed.io
* *log* - this is the internal log object we use in sitespeed.io to write the log output. We use [intel](https://www.npmjs.com/package/intel) for logging.
* *index* - which index of the runs (first, second etc).
* *webdriver* - the Selenium [Webdriver object](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html) that is the way to get hold of the Selenium objects that you need.

## Debug/log from your script
In your script you can get hold of the log object from sitespeed.io. This is super useful when you want to test your script and verify that everything works as it should. We use [intel](https://www.npmjs.com/package/intel) for logging.

~~~
module.exports = {
  run(context) {
    return context.runWithDriver((driver) => {
      // Simple example to add a log message
      // Remember that you can log message on different levels
      context.log.info('Log message from the task');
    });
  }
};
~~~

If you run in Docker it can sometimes be hard to see/know what happens. To verify that your pre/post script works as they should (and the page loads as you think), you can enable a video of the full run (pre/post scripts and the test). Do that by adding: <code>--browsertime.videoParams.combine</code>

Then your video will include all your steps. Perfect for debugging.

## Pass your own options to your pre/post scripts
You can add your own parameters to the options object (by adding a parameter) and then pick them up in the pre/post script. The scripts runs in the context of browsertime, so you need to 
pass it on in that context.

For example: you wanna pass on a password to your script, you can do that by adding <code>--browsertime.my.password MY_PASSWORD</code> and then in your code get hold of that with: 

~~~
...
// We are in browsertime context so you can skip that from your options object
context.log.info(context.options.my.password);
...
~~~

## Test a page with primed cache
One other thing you can do with a pre script is simulate a user that browsed a couple of pages and then measure the performance of a page (by default the cache is emptied when you use sitespeed.io).

Create a pre script (pre.js):

~~~
module.exports = {
  run(context) {
    return context.runWithDriver((driver) => {
      // Go to the start page of sitespeed.io
      return driver.get('https://www.sitespeed.io/');
    });
  }
};
~~~

And then run it like this:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --preScript /sitespeed.io/pre.js -b chrome https://www.sitespeed.io/documentation/
~~~

The browser will first access https://www.sitespeed.io/, this will fill the cache and then go to https://www.sitespeed.io/documentation/ where it will collect all the metrics.
