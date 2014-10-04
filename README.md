<a href="http://www.sitespeed.io" target="_blank">Sitespeed.io</a> - how speedy is your website? [![Build Status](https://secure.travis-ci.org/sitespeedio/sitespeed.io.png?branch=3.0-wip)](http://travis-ci.org/sitespeedio/sitespeed.io)
=============

2014-10-04: Today I've merged the 3.0-wip into the master branch and releasing an early alpha release of 3.0. It is still really rough around the edges and 
it will be fixed the coming weeks. The release date for a final 3.0 is the 3:rd of November.


New in 3.0
=============
* We use nodejs instead of bash/Java (we still use Java because of the crawler and BrowserTime but we will try to at least change the crawler in the near future).
* We use Handlebars templates (instead of the old Velocity ones).
* All data is JSON instead of XML as it was before.
* New integration: You can fetch data from Google Page Speed Insights and WebPageTest
* HAR-files created from the browser you use when fetching Navigation Timing API metrics
* Generate JUnit XML files and/or send data to Graphite; now included as main functionality.
* The main goal with 3.0 has been to move to NodeJS. The crawler & BrowserTime still uses Java and we will try to move away from that in the future
* Support for getting Navigation Timing data from PhantomJS 2.0
* Drive/get/collect data from WebPageTest & Google Page Speed Insights
* Two new summary pages: Slowest domains and Toplist (with information about assets). More info will come
* We use Handlebars templates (instead of the old Velocity ones).
* All data is is JSON instead of XML as it was before.
* HAR-files created from the browser you use when fetching Navigation Timing API metrics
* Generate JUnit XML files/TAP and/or send data to Graphite; now included as main functionality.
* Yep, hate to say it but the parameters to the CLI has changed, so please check --help to see how you should do

You can use the new version on Mac & Linux and hopefully on Windows in the near future.

Install 
=============
```bash
$ npm install sitespeed.io@3.0.0-alpha -g
```

Documentation
=============
Will be added soon.
