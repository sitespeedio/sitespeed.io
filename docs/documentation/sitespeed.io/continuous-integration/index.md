---
layout: default
title: Run sitespeed.io in your continuous integration
description: Use sitespeed.io in your Continuous Integration setup with Jenkins, Grunt or Team City.
keywords:  Continuous Integration, jenkins, grunt, team city, documentation, web performance, sitespeed.io
author: Peter Hedenskog
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Use sitespeed.io in your Continuous Integration setup.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Continuous Integration

# Continuous Integration
{:.no_toc}


* Lets place the TOC here
{:toc}

You can use sitespeed.io to keep track of what is happening with your site by making sure that you don’t break performance best practice rules before you push changes to production. You can leverage budgets to break your build if your page has too many assets, they are too big, or even too slow. You can even use WebPageTest metrics to break a build!

To do this you define your own [budget file](../performance-budget/#the-budget-file) with rules on when to break your build. This budget will return an error code status after the run. You can also choose to output JUnit XML and TAP reports.

## Jenkins
The most convenient way to run in Jenkins is to use the pre-built Docker containers. You can run an installed npm version too, but that method will require additional work as you will need to setup browsers and use the [Xvfb plugin](https://wiki.jenkins-ci.org/display/JENKINS/Xvfb+Plugin) to make the browsers run in headless mode. Trust us use the Docker Images you will thank us later. ;-)

### Setup
* Choose *New Item* and create a new freestyle project.
* Choose *Add build step* in the Build section and Execute shell. With this you will have a box where you can add your CLI magic. Remember that the Jenkins user needs to be able to run Docker.
* We then map the Jenkins workspace's output folder in Docker to the Host, so that the HTML result is visible outside of the container.

~~~bash
docker run -v ${WORKSPACE}:/sitespeed.io sitespeedio/sitespeed.io --outputFolder output https://www.sitespeed.io/ -n 1
~~~

* You can then install the **Publish HTML Reports** plugin to make the reports easy available in Jenkins. You can add it as a *Post-build Actions* and set the **HTML directory to archive** to *output/* (it is relative to the workspace).
![HTML reports]({{site.baseurl}}/img/html-publisher.png)
{: .img-thumbnail}

 The HTML result pages runs Javascript, so you need to change the [Jenkins Content Security Policy](https://wiki.jenkins-ci.org/display/JENKINS/Configuring+Content+Security+Policy) for them to work with the plugin.

 When you start Jenkins make sure to set the environment variable <code>-Dhudson.model.DirectoryBrowserSupport.CSP="sandbox allow-scripts; style-src 'unsafe-inline' *;script-src 'unsafe-inline' *;"</code>.

* If you want to break your build, you should generate a JUnit XML and use the built-in post task *Publish JUnit test result report*. Make sure to make the budget file available inside the Docker container. In this example we have it inside the Jenkins workspace.

~~~bash
docker run -v ${WORKSPACE}:/sitespeed.io sitespeedio/sitespeed.io --outputFolder output --budget.configPath /sitespeed.io/budget.json --budget.output junit https://www.sitespeed.io/ -n 1
~~~

* Setup the JUnit report:
![JUnit reports]({{site.baseurl}}/img/junit-report.png)
{: .img-thumbnail}

Remember that you can also send the metrics to Graphite to keep a closer eye on all metrics over time.

## Travis
We have an example project for setting up Travis [https://github.com/sitespeedio/travis/](https://github.com/sitespeedio/travis/blob/master/.travis.yml). You should not try to use timings in your budget, simply because they tend to vary and be highly unreliable. We suggest using metrics that do not vary greatly and will be the same between runs like Coach score or number of requests.

## Grunt plugin
Checkout the [grunt plugin](https://github.com/sitespeedio/grunt-sitespeedio).

## Gulp plugin
Checkout Ankit Singhals [gulp plugin](https://github.com/dreamzmaster/gulp-sitespeedio).
