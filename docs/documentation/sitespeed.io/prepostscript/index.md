---
layout: default
title: Pre/post scripts (log in the user)
description:
keywords: selenium, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Pre/post scripts (log in the user)
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Pre/post scripts

# Pre/post scripts
{:.no_toc}

* Lets place the TOC here
{:toc}

# Selenium
Before sitespeed.io access and test a URL you can run your own Selenium script if you want to access a URL and pre-load the cache or if you want to login the user and then measure a URL.

We use the NodeJs version of Selenium, you can find the [API documentation here](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html).

## Login example
Create a script where you login the user. This is an example to login the user at Wikipedia. Name the file login.js.

~~~ bash
module.exports = {
  run(context) {
    return context.runWithDriver((driver) => {
      // Go to Wikipedias login URL
      return driver.get('https://en.wikipedia.org/w/index.php?title=Special:UserLogin&returnto=Main+Page')
        .then(() => {
          // You need to find the form, the login input fiels and the
          // password field. Just add you name and password and submit the form
          // For more docs, checkout the NodeJS Selenium version
          // http://seleniumhq.github.io/selenium/docs/api/javascript/index.html

          // we fetch the selenium webdriver from context
          var webdriver = context.webdriver;
          // before you start, make your username and password
          var userName = 'YOUR_USERNAME_HERE';
          var password = 'YOUR_PASSWORD_HERE';
          var loginForm = driver.findElement(webdriver.By.tagName('form'));
          var loginInput = driver.findElement(webdriver.By.id('wpName1'));
          loginInput.sendKeys(userName);
          var passwordInput = driver.findElement(webdriver.By.id('wpPassword1'));
          passwordInput.sendKeys(password);
          loginForm.submit();
        });
    })
  }
};
~~~

Then run like (change your username & password first):

~~~ bash
$ sitespeed.io --preScript login.js https://en.wikipedia.org/wiki/Barack_Obama
~~~

Checkout the magic row:

~~~
var webdriver = context.webdriver;
~~~

From the context object you get hold of the Selenium [Webdriver object](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index.html).
