<a href="http://www.sitespeed.io" target="_blank">Sitespeed.io</a> - how speedy is your website? [![Build Status](https://secure.travis-ci.org/sitespeedio/sitespeed.io.png?branch=master)](http://travis-ci.org/sitespeedio/sitespeed.io)
=============

Sitespeed.io is an open source tool that helps you analyze and optimize your website speed and performance, based on performance best practices rules and collecting browser metrics using the Navigation Timing API and User Timings.

You can use it on Mac, Linux & Windows (using Git Bash). And collect timing metrics using Chrome, Firefox and Internet Explorer (Windows only). You can use Jenkins with the Jenkins [plugin](https://github.com/sitespeedio/jenkins.sitespeed.io) to collect data and break builds.

Run on Mac OS X
=============
```bash
$ brew install sitespeedio/sitespeedio/sitespeed.io
$ sitespeed.io -h
```
Run on Linux or Windows
=============
Follow these [instructions](http://www.sitespeed.io/documentation/#install-linux) to run on Linux and [these](http://www.sitespeed.io/documentation/#install-windows) for Windows.

Functionality
=============
Here's a list of the main features, for a full list checkout the [documentation](http://www.sitespeed.io):
 * Crawl your site or feed sitespeed with a list of URL:s
 * Analyze the pages against the latest web best practice rule
 * Fetch Navigation Timing & User Timing metrics using Chrome, Firefox and/or Internet Explorer
 * See the result on a high summary level for all the pages and individual results on a page level
 * Analyze and compare multiple sites (use it to compare your site with competitors)
 * Output JUnit XML of both web best practices & timing metrics 
 * Get screenshots of your site at a specific viewport
 * See the most used assets for all analyzed pages

Example
=============
And here's a couple of examples on how the result pages looks like:
TODO add new fresh images
![The site summary page](https://raw.github.com/sitespeedio/sitespeed.io/2.5-wip/doc/summary-2.5.png)

![All the pages](https://raw.github.com/sitespeedio/sitespeed.io/2.5-wip/doc/pages-2.5.png)

See <a href="http://www.sitespeed.io">http://www.sitespeed.io</a> for documentation.  

The branches: *master* is the latest release, the *wip-branch* is the coming release.

[![I Love Open Source](http://www.iloveopensource.io/images/logo-lightbg.png)](http://www.iloveopensource.io/projects/5261764143c6bdee140001d4)


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/soulgalore/sitespeed.io/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

