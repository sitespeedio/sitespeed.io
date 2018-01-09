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

Make sure to change the username & password
{: .note .note-warning}

Then run it like this:

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --preScript /sitespeed.io/login.js https://en.wikipedia.org/wiki/Barack_Obama
~~~

The script will then login the user and access https://en.wikipedia.org/wiki/Barack_Obama and measure that page.


Checkout the magic row:

~~~
var webdriver = context.webdriver;
~~~

From the context object you get a hold of the Selenium [Webdriver object](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html) and the  mechanisms for locating an element on the page.

Note: Use the supplied *driver* object to go to a specific page.

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
