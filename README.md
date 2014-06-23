<a href="http://www.sitespeed.io" target="_blank">Sitespeed.io</a> - how speedy is your website? [![Build Status](https://secure.travis-ci.org/sitespeedio/sitespeed.io.png?branch=3.0-wip)](http://travis-ci.org/sitespeedio/sitespeed.io)
=============

Hey, we are working on the coming 3.0 release where we will cleanup everything, make it easier to
write your own rules and easier for us to add functionality in the future.


You can use the new version on Mac & Linux and hopefully on Windows in the near future.

We still [have](https://github.com/sitespeedio/sitespeed.io/issues?milestone=40&state=open) much to do before 3.0 can be released but you can take
the new version for a joyride right now.

Install
=============
```bash
$ cd sitespeed.io
$ npm pack
$ npm install sitespeed.io-3.0.0-alpha.tgz -g
```

New in 3.0
=============
 * We use nodejs instead of bash/Java (we still use Java because of the crawler and BrowserTime but we will try to at least change the crawler in the near future).
 * We use Handlebars templates (instead of the old Velocity ones).
 * All data is is JSON instead of XML as it was before.
 * New integration: You can fetch data from Google Page Speed Insights and WebPageTest
 * HAR-files created from the browser you use when fetching Navigation Timing API metrics
 * Generate JUnit XML files and/or send data to Graphite; now included as main functionality.
 * And a lot more ...

Documentation
=============
Will be added soon.
