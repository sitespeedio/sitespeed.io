<a href="http://www.sitespeed.io" target="_blank">Sitespeed.io</a> - how speedy is your website? [![Build Status](https://travis-ci.org/sitespeedio/sitespeed.io.svg?branch=master)](http://travis-ci.org/sitespeedio/sitespeed.io)
=============

Welcome to the wonderful world of web performance!

sitespeed.io can:
* analyze your site against web performance best practice rules, crawl your site or test specific URL:s
* measure how fast your site/pages is using the [Navigation Timing API] (http://www.w3.org/TR/navigation-timing/) and [User Timing API] (http://www.w3.org/TR/user-timing/)
* send all your metrics to [Graphite](graphite.wikidot.com)
* benchmark your site against your competitors (comparing specific pages, creating reports, dump the data to Graphite)
* drive [WebPageTest](www.webpagetest.org) (WPT), meaning collect metrics from WPT, create reports and or
send the data to Graphite
* test your site against your performance budget
* output TAP or JUnit XML to run in your Continuous Integration tool
* create configurable HTML reports
* test your site against [Google Page Speed Insights] (https://developers.google.com/speed/pagespeed/insights/) and include the result in the reports
* create your own post task that will get the result from the analyze and do whatever you want with it (store to a database, create new reports etc)

Install
=============
```bash
$ npm install -g sitespeed.io
```

Documentation
=============
http://www.sitespeed.io/documentation/

Example reports
=============
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/master/doc/3.0-summary.png">
