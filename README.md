<a href="http://www.sitespeed.io" target="_blank">Sitespeed.io</a> - how speedy is your website? [![Build Status](https://travis-ci.org/sitespeedio/sitespeed.io.svg?branch=master)](http://travis-ci.org/sitespeedio/sitespeed.io)
=============

2014-10-28: We have now released the first beta of 3.0!

The latest stable release is 2.5.7, you can get it from the <a href="https://github.com/sitespeedio/sitespeed.io/releases/tag/v2.5.7">release page</a> or install it using Homebrew.


New in 3.0.0-beta
=============
* The main goal with 3.0 has been to move to NodeJS. The crawler & BrowserTime still uses Java and we will try to move away from that in the future
* We use Handlebars templates (instead of the old Velocity ones).
* All data is JSON instead of XML as it was before.
* Drive/get/collect data from WebPageTest & Google Page Speed Insights
* HAR-files created from the browser you use when fetching Navigation Timing API metrics
* Generate JUnit XML files and/or send data to Graphite; now included as main functionality.
* Support for getting Navigation Timing data from PhantomJS 2.0
* Two new result pages: Slowest domains and Toplist (with information about assets). More info will come
* We use Handlebars templates (instead of the old Velocity ones).
* Yep, hate to say it but the parameters to the CLI has changed, so please check --help to see how you should do

You can use the new version on Mac & Linux and hopefully on Windows in the near future.

Install 
=============
```bash
$ npm install sitespeed.io
```

Documentation
=============
http://www.sitespeed.io/documentation/
