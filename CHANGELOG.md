# CHANGELOG - sitespeed.io

## 4.0.6 2016-11-13
### Fixed
* Upgraded to Browsertime 1.0.0-beta.11
  * Fixed issue with incorrect values for speedindex and start render due to a small info bubble of text appearing in the video frames.

### Added
* Additional information added in the documentation around using connectivity engine `tc` for network throttling.
* Additional information added in the FAQ section of the documentation mentioning Digital Ocean issue with pre-baked docker(1.12.3) instances and Firefox.

## 4.0.5 2016-11-11
### Fixed
* Running budget with one rule for one URL failed the JUnit output, thanks @krukru for the report #1317

### Added
* Pick up environment variables in the CLI. The namespace is SITESPEED_IO. This is useful for setting up default values in Docker. Say you want to set an environment variable for --browsertime.iterations 1 then use SITESPEED_IO_BROWSERTIME__ITERATIONS=1. Checkout https://www.npmjs.com/package/yargs#envprefix for full docs.

* Upgraded to Browsertime 1.0.0-beta.10:
  * Added initiator of each request entry to chrome HAR
  * Output SpeedIndex & firstVisualChange in the logs if you use VisualMetrics
  * Generating HAR files from Chrome caused a crash in some cases.
  * Entry timings in HAR files from Chrome were strings instead of numbers.
  * One extra fix for outputing timing metrics in the console:  If timing metrics is < 1000 ms don't convert to seconds and let always have fixed\
size for mdev fixing many numbers for SpeedIndex.
  * Configure proxies with --proxy.http and --proxy.https
  * New TSProxy that is less complex
  * Upgraded Selenium to 3.0.1 (no beta!)
  * Upgraded Geckodriver to 0.11.1
  * Updated minimum NodeJS to 6.9.0 (same as Selenium). IMPORTANT: Selenium 3.0.0 will not work on NodeJS 4.x so you need to update.
  * Export chrome perflog dumps as json in extraJson property of the result, instead of a string in the extras property. Only relevant to api users.
  * Upgraded sltc so we use 0.6.0 with simplified tc that actually works
  * We now run xvfb from inside NodeJS so we can set the screen size, making it easy to record the correct size for VisualMetrics. We also use environment variables that starts with BROWSERTIME so we can turn on xvfb easily on Docker.
https://github.com/sitespeedio/browsertime/blob/master/CHANGELOG.md 

## 4.0.4 2016-11-04
### Fixed
* If you where using graphite.includeQueryParams when you where sending keys to graphite, URLs containing ? and & failed. Those characters are now replaced.
* We rollbacked sending the URL in Graphite keys for toplists, it's opened the possibility to generate too much data in Graphite.
* FYI: Soon we will update to the final 3.0.0 of Selenium and we then need to drop support for NodeJS 4.x.


## 4.0.3 2016-11-01
### Fixed
* Setting --mobile didn't change viewport/useragent. Thank you @zhangzhaoaaa for reporting #1298

* Asset toplist data (slowest/largest assets) couldn't be sent to Graphite. It's now restructured with new naming and you can also get the URL for slowest
assets toplist in Graphite. Documentation coming up the coming days. #1294

## 4.0.2 2016-10-31
### Fixed
* Domains metrics wasn't grouped per domain, making metrics sent to Graphite fail if you configure them to send all. See #1290 and #1289.

## 4.0.1 2016-10-30
### Fixed
* If you configured cli params for Chrome, the check for Android configuration broke the run.
* The CLI output was wrong when setting up a custom profile. You should use --connectivity custom

## 4.0.0 2016-10-27
Version 4.0 is a ground up rewrite for Node.js 6.9.1 and newer. It builds on all our experience since shipping 3.0 in December 2014, the first version to use Node.js.

* We support HTTP/2! In 3.X we used PhantomJS and a modified version of YSlow to analyze best practice rules. We also had BrowserMobProxy in front of our browsers that made it impossible to collect metrics using H2. We now use the coach and Firefox/Chrome without a proxy. That makes it easier for us to adapt to browser changes and changes in best practices.

* We got the feature that people asked about the most: Measure a page as a logged in user. Use --browsertime.preScript to run a selenium task to before the page is analyzed. Documentation is coming soon.

* New HAR files rock! In the old version we use BrowserMobProxy as a proxy in front of the browser to collect the HAR. In the new version we collect the HAR directly from the browser. For Firefox we use the HAR export trigger and in Chrome we generates it from the performance log.

* Stability: We have a new completely rewritten version of Browsertime that makes it easier for us to catch errors from the browser, drivers and environment problems.

* Speed: Yep we dropped Java (it was needed for BrowserMobProxy) and most things are happening in parallel with the new version.

* Don't overload Graphite: One thing that was annoying with 3.x was that it by default sent a massive amount of metrics to Graphite. That's cool in a way but it was too much. We now send curated metrics by default and you can choose to send more.

* You can collect metrics from Chrome on an Android phone. In the current version you need to have it connected using USB to the server running sitespeed.io, lets see how we can make it better in the future.

* Using our Docker container you will get support getting SpeedIndex and startRender using VisualMetrics. This is highly experimental at this stage.

And many many more changed. Read about the release https://www.sitespeed.io/sitespeed.io-4.0-is-released

## Unreleased beta
## Fixed
* Call summary Site summary in the slack plugin to make it easier to understand.
* Run as root inside the Docker container, it makes things easier.

## 4.0.0-beta.6 2016-10-26
### Added
* You can now configure so sitespeed.io only slacks on error #1260
* Do not run as root inside the Docker container #1259
* Budget HTML page and log the budget info. #1264

### Changed
* New browsertime beta-9 and latest Coach
* Sending all data to Slack changed property name from both to all: --slack.type all and default is now all (instead of summary).

## Fixed
* Don't set viewport when running on Android.
* Screenshots for Firefox works again #1256
* Cli for setting budget junit output is junit NOT junitxml
* Slack specific URL errors, so if something fails we know about it #1261

## 4.0.0-beta.5 2016-10-17

### Added
* Send summary and individual URL metrics to Slack. #1228
* Simple first step for performance budget #1227
* Download the HAR files to your local #1174
* Moved site to docs folder within the project #1240

### Changed
* The data structure (internally) for toplists is changed so they can be sent to Graphite and used in a budget. Messages for largest assets was renamed from assets.aggregateSizePerContentType to assets.largest. Also send the largest individual size of an image to Graphite by default.
* Plugin analysisStorer is now called analysisstorer and messageLogger is now messagelogger and live within their own plugin folder, following the pattern of all other plugins.
* Default cli options now lives in each plugins.
* No default channel for Slack, use the one setup in the hook instead.
* Run sitespeed.io without the cli.

### Fixed
* A little better error handling when loading a plugin fails.
* LastModified in the PageXray section was wrongly outside the table
* Layout for resource hints

## 4.0.0-beta.4 2016-09-29
-------------------------
### Fixed
* Pug templates never was a cache hit, so generating the HTML took a lot of extra memory #1218 #1219 thank @moos for the PR #1220
* Fix crash for pages that didn't set the last-modified http header #1221
* WebPageTest data rendering was broken since 4.0.0-beta.1.

### Added
* You can now output a summary for a run in the CLI. Thanks @moos for the PR.

## 4.0.0-beta.3 2016-09-26
-------------------------
### Fixed
* The output directory structure was broken in beta.2, please update to beta.3.

## 4.0.0-beta.2 2016-09-23
-------------------------
### Fixed
* If the HAR export plugin fails in Firefox, don't break the run, use the data we have and try to make the most if it. #1190
* Make it possible to link to specific tabs on page/run pages #1087 Thank you @moos for the fix!
* Passing --outputFolder now works correctly. #1209
* Upgraded to latest Browsertime to make Firefox 49 to work again.

### Added
* Send content size & request per content type by default to Graphite for WebPageTest pageSummary #1194
* You can now set --max-old-space-size when running the Docker container, use -e MAX_OLD_SPACE_SIZE=4096 (or what max size you want) #1185
* The old hotlist is rebranded to toplist. You can now see the largest responses by content type and the slowest responses #1183

### Changed
* Send content size & request per content type grouped by breakdown to Graphite for WebPageTest summary #1194
* Get plugin by relative or absolute path (perfect for Docker). If you wanna use a npm installed module use $(npm get prefix)/foo

## 4.0.0-beta.1 2016-09-02
-------------------------
### Fixed
* The CSS size advice on summary page used the wrong metrics to check the color, meaning 0 bytes made it red :/
* Shorten long URLs displayed on HTML Asset report #977
* Empty size fixes for tablet view of HTML report
* Title/description for each page says something about the page + we don't want robots to index the result pages
* Fixed long URLs that broke page design #1020 #1049
* Right CLI parameter name for setting the Selenium URL (if you use a standalone server)
* Made it easier to understand how to configure location and connectivity for WebPageTest.
* Fixed breaking GPSI when summary was missing from the rule. #1110
* Updated browsertime, so when you are running pre/post script, you can get hold of the selenium-webdriver from the context (a lot of people have had problem with it). Checkout https://github.com/sitespeedio/browsertime/blob/master/test/prepostscripts/preLoginExample.js for an example.
* Finally Firefox works again, you can use Firefox 48 since we now use Geckodriver.
* New version of TSProxy that fixes the redirect problems for HTTP -> HTTPS https://github.com/sitespeedio/browsertime/issues/175
* New PerfCascade that takes care of responses that misses a content type #1030
* Always include the PerfCascade script (the path was wrong sometimes before) #1030
* Include PageXray metrics in the summary #1162

### Added
* Updated to latest Browsertime, now supporting different connectivity profiles using tsproxy or tc. #895
* Disable default plugins (disable HTML, screenshot etc). Looking forward to add plugins #1015
* Configure the pageCompleteCheck using CLI.
* Moved metrics to different tabs on the page result page.
* Set the number of runs for WebPageTest using a specific cli parameter #1101
* Run custom script and URL/script for WebPageTest #1101
* Run custom script. Use --browsertime.script myScript.js to add your script. You can run multiple script by passing the parameter multiple times. The metrics will automatically turn up on the summary page, detailed page, the summary page of the page and the run page. They will also be sent to Graphite. #1063
* Add your own plugin (examples coming soon) #891
* Removed analysisStorer as default plugin (do not store all json metrics by default). If you want to use it, enable it with --plugins.load analysisStorer
* Always show the waterfall if you run one run.
* You can configure which metrics to send to Graphite #943
* Send domain, expireStats and lastModifiedStats to Graphite for a group summary and totalDomains for page summary.
* Send documentHeight, domElements, domDepth.avg, domDepth.max and iframes per default for each page summary (missed those, these are handy!).

### Changed
* All URLs is now belonging to a group. The group right now is the domain of the URL. When summaries are sent to Graphite, each summary belong to a group. Meaning summary metrics will always correspond to the group (not as before the filename if you get the URLs from a file). #1145
* New default namespace for Graphite metrics: sitespeed_io.default to be more flexible for the dashboards we will supply
* Removed p10 and p99 as default to Graphite (and all calculations). We make it configurable in the future from the cli (it's prepared already).

## 4.0.0-alpha5 - 2016-06-30
-------------------------
### Fixed
* It looks like url is field that can't be used in pug, so we where missing the URL on each individual page. Renamed and fixed.

### Added
* Added the detailed summary page that we learned to love.
* Small summary on each summary page to display the run information.
* More summary boxes on the summary page.
* Updated Browsertime to new release including latest Selenium to make Firefox 47.0.1 work.
* Added definition and help for the metrics in the summary boxes.

## 4.0.0-alpha4 - 2016-06-20
-------------------------
### Added
* Use PerfCascade to show waterfall on page summary and individual runs from collected HAR (#997)
* Show simple Google Page Speed Insights metrics in HTML and send the score to Graphite (#948)

### Changed
* Lets use Chrome as default browser since Firefox 47/Selenium/Gecko/Marionette is broken https://github.com/sitespeedio/sitespeed.io/issues/993

* Only add browser/connectivity in Graphite keys in metrics collected by Browsertime (#1009).

* Add location/connectivity to Graphite keys for WebPageTest (#1008).

* Internal: We changed from Jade to Pug (latest) and moved to Sass for the CSS (thanks @matthojo)

## 4.0.0-alpha3 - 2016-06-09
-------------------------

### Fixed
* Enable the coach by default.
* Fixed broken default plugin loading.

## 4.0.0-alpha2 - 2016-06-07
-------------------------
### Fixed
* Show results from other plugins even if one plugin has an error (e.g. WebPageTest fails but Browsertime succeeds).
* Fixed preTask and postTaks, now named preScript/postScript, try iy out to login the user.


### Changed
* Added browser and connectivity to Graphite keys, all keys now hold browser and connectivity.

### Added
* Hey we now log the the log file in the result dir.

version 4.0.0-alpha1 - 2016-05-22
-------------------------
### Changed
* Everything! Rewrite from scratch in progress. This is an alpha release, try it test it but do not upgrade in production yet (https://github.com/sitespeedio/sitespeed.io/issues/945).

* We support HTTP/2! In 3.X we used PhantomJS and a modified version of YSlow to analyze best practice rules. We also had BrowserMobProxy in front of our browsers that made it impossible to collect metrics using H2. We now use [the coach](https://github.com/sitespeedio/coach) and Firefox/Chrome without a proxy. That makes it easier for us to adapt to browser changes and changes in best practices.

* We now support the feature that people asked about the most: Measure a page as a logged in user. Use --browsertime.preTask to run a selenium task to before the page is analyzed. Documentation is coming soon.

* New HAR files rock! In the old version we use BrowserMobProxy as a proxy in front of the browser to collect the HAR. In the new version we collect the HAR directly from the browser. For Firefox we use the [HAR export trigger](https://github.com/firebug/har-export-trigger) and in Chrome we generates it from the performance log.

* Stability: We have a new completely rewritten version of [Browsertime](https://github.com/tobli/browsertime) that makes it easier for us to catch errors from the browser, drivers and environment problems.  

* Speed: Yep we dropped Java (it was needed for BrowserMobProxy) and most things are happening in parallel with the new version.

* Don't overload Graphite: One thing that was annoying with 3.x was that it by default sent a massive amount of metrics to Graphite. That's cool in a way but it was too much. We now send curated metrics by default and you can choose to send more.

* You can collect metrics from Chrome on an Android phone. In the current version you need to have it connected using USB to the server running sitespeed.io, lets see how we can make it better in the future.

* Using our Docker container you will get support getting SpeedIndex and startRender using [VisualMetrics](https://github.com/WPO-Foundation/visualmetrics). This is highly experimental at this stage.

version 3.11.5 - 2016-01-30
------------------------
### Fixed
* Dependency problem for PhantomJS 2.1. We hope it works now :)

version 3.11.4 - 2016-01-30
------------------------
### Fixed
* Typos #804 Thanks @beenanner

* Making slimerjs more indepenedent from phantomjs #806 thanks @keithamus

### Changed
* Upgraded default PhantomJS to 2.1. We will remove PhantomJS 2.0 from Docker containers.

version 3.11.3 - 2016-01-13
------------------------
### Fixed
* Fixes bug for collecting summary metrics for WPT, introduced in 3.11.2

version 3.11.2 - 2016-01-13
------------------------
### Fixed
* Browser name in WebPageTest can have spaces and that wasn't handled so when the metrics is sent to Graphite, it fails. #798

### Changed
* Bumped 3rd party dependencies: winston, request, phantomjs, moment, fs-extra, browsertime, cross-spawn-async, async

version 3.11.1 - 2015-10-27
------------------------
### Fixed
* Upgraded Browsertime to new version to work with Node 4

version 3.11.0 - 2015-10-14
------------------------
### Fixed
* Report the sitespeed version as full integeres to Graphite. Meaning 3.10.0 will be 3100.

### Added
* Normalize file names, use _ as separator in the domain name instead of dots #742

version 3.10.0 - 2015-09-26
------------------------
### Fixed
* Do not report skipped rules as failed on the Budget page. thanks @jzoldak #753
* Grunt-sitespeedio fails the build no matter if GPSI score matches the budget thanks @laer #746
* Fixed the ability to supress domain data beeing sent to Graphite. Using --graphiteData you now need to explicit use domains if you want to send the data (if you don't use all). That data shouldn't always be sent as it was before. (thanks @xo4n for pointing that out) #755

### Added
* Add ability to budget on a per rule basis, thanks @jzoldak #751
* Add waitScript logic to screenshots thanks agaib @jzoldak #737

version 3.9.1 - 2015-09-14
------------------------
### Fixed
* Sorting by url for pages/assets on result pages now works as expected. #743
* Be able to disable the proxy when running BrowserTime #735

version 3.9.0 - 2015-08-22
------------------------
### Fixed
* All args to the headless script should be passed in the right order #727 thanks @jzoldak for the PR
* If a site uses SPDY, the sizes in the HAR from WebPageTest is set to 0, don't use it to populate the sizes #699

### Added
* Create same Graphite namespace structure for the domain url as for per-page metrics #728 thanks @JeroenVdb for the PR. Use the flag --graphiteUseNewDomainKeyStructure to turn on the new standard (will become default in 4.0).
* You can choose to have query parameters in the Graphite key for the URL, thanks @jeremy-green for the PR #719. To use query parameters in the keys, add --graphiteUseQueryParameters to your run.

version 3.8.1 - 2015-08-16
------------------------
### Fixed
* Parameters passed in the wrong order for basic auth when taking screenshots, thanks @jzoldak for the PR! #691
* Use same time out time when taking screenshots and when running yslow #725

version 3.8.0 - 2015-08-10
------------------------
### Fixed
* Removed faulty error logging from WPT if your location missed browser configuration. That was wrong, you actually don't need it.
* Basic Auth was missing when testing one page (since 3.7.0). Thank you Jesse Zoldak (@jzoldak) for the PR! #717
* You can now pass configuration files again. When you do a run, the config.json will be in your result folder. Pass it again with
--configFile to your next run and it will be tested again, but in a new date result dir #270

### Added
* Pass request headers as JSON as complement to all headers in a file #715, thank you Devrim Tufan (@tufandevrim) for the PR.


version 3.7.2 - 2015-07-21
------------------------
### Fixed
* Testing a page multiple times ended up with HAR with many many requests for each page. This is now fixed in BrowserTime v0.10.2 #707

version 3.7.1 - 2015-07-19
------------------------
### Fixed
* Sending version numbers of sitespeed.io, firefox and chrome removes all dots except the first one

version 3.7.0 - 2015-07-19
------------------------
### Added
* Show and send total summary of collected data for all pages. Example: testing ten pages we will now have the total number of requsts made for all those 10 pages #693
* Send all individual navigation timings to Graphite (before we only sent calculated timings) #580
* Send sitespeed and browser version to Graphite. The keys in Graphite: [namespace].meta.chrome.version, [namespace].meta.firefox.version and [namespace].meta.sitespeed.version #703

### Changed
* Bumping versions: async, cross-spawn-async, fast-stats, fs-extra, handlebars, html-minifier, moment, phantomjs, request, winston, browsertime & xmlbuilder.
* If we just test one page, then skip the crawling (but do one request that checks the status of the page before we start) #706

### Fixed
* Text fixes, thanks @atdt #690
* New Browsertime version fixes Browser name and browser version in the HAR file #704

version 3.6.3 - 2015-06-26
------------------------
* Finally we have a HAR Viewer! It's a modified version of Rafael Cesars https://www.npmjs.com/package/simplehar. It could still need some love and work but we think it will add some real value.

* Bug fix: Worst Cached assets on the hotlist looked bad on small screens.

version 3.6.2 - 2015-06-17
------------------------
* Bug fix: Installation works on Windows again. Updated Browsertime with new Selenium that fixes the original problem.

version 3.6.1 - 2015-06-08
------------------------
* Bug fix: All WPT metrics wasn't sent ok #681

version 3.6 - 2015-06-07
------------------------
* Holy cow, we now support WebPageTest scripting ( https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/scripting)! Every  occurrence of {{{URL}}} in your script will be replaced with the URL that is actually going to be tested. Feed the script file to sitespeed.io using --wptScript #623

* When we are at it: also support custom scripts to collect metrics for WebPageTest! Feed your custom javascript metrics file using --wptCustomMetrics. Read more here: https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/custom-metrics #678

* Graphite keys now replaces pipe, comma and plus. If your URL:s has them, they will now be replaced by a underscore. The reason is that some Grafana functions don't work with the special characters. Thanks @EikeDawid for the PR! #679

version 3.5 - 2015-04-24
------------------------
* Rewrite of the Graphite key generation, now always follow the patter protocol.my_domain_com._then_the_path #651.
  The cool thing is that this opens for a lot og Graphite/Grafana goodies, the bad is that if you use it today,
  you need to remap the keys in Grafana to get the graphs.

version 3.4.1  - 2015-04-22
------------------------
* Super ugly quick fix for dubplicate dots in graphite keys #654

version 3.4  - 2015-04-21
------------------------
* IMPORTANT: New structure for URL paths sent to Graphite. Now follow protocol.hostname.pathname structure, thanks @JeroenVdb #651
* Send size and type of every asset to Graphite #650 thanks @JeroenVdb!
* Renamed requesttimings to requests when choosing which data that should be sent to Graphite
* Hail the new default waitScript! If you are using phantomjs2 we will now wait for the loadEventEnd + aprox 2 seconds before we end a run for YSlow #653
* IMPORTANT: The old graphite key requests (showing number of requests) changed to noRequests.
* Bug fix: Specifying a custom yslow script now works again, fixing #649. Thanks to Jubel Han for reporting.

version 3.3.3  - 2015-04-19
------------------------
* Bug fix: Add size & number of requests for all domains
* Send accumulatedTime a.k.a total time for a domain for all assets to Graphite

version 3.3.2  - 2015-04-19
------------------------
* Bug fix: Fetch number of assets used per domain only once per HAR file.

version 3.3.1  - 2015-04-19
------------------------
* Bug fix: Number of request per domain always showed 1, that's not right!

version 3.3  - 2015-04-18
------------------------
* Send the total weight per domain and per content type to Graphite #644 thanks @JeroenVdb.
* Changed the key structure for request per domain (to follow the same structure as the rest of the domain keys): NAMESPACE.www.myhost.com.summary.domains.requests.*
* If you start sitespeed with a callback method it will now call the callback(error, result) now supplying the result.
* Silence log when running in test env (log errors and above)

version 3.2.10  - 2015-04-14
------------------------
* Bug fix: Removed another limit for number of domains, setting it to 10 domains before #643

version 3.2.9  - 2015-04-13
------------------------
* Removed the limit of sending max 100 domains to Graphite #643

version 3.2.8  - 2015-04-13
------------------------
* Use --postURL to POST the result of an analyze to a URL
* Use --processJson to rerun all the post tasks on a result, use it to reconfigure what data to show in the HTML output.
* Bug fix: extra check when generating Graphite keys. #642

version 3.2.7  - 2015-04-08
------------------------
* Send request timings to Graphite if we use WebPageTest #639
* Possible to configure the URL to a selenium server (making Chrome on Linux more stable or at least less instable)

version 3.2.6  - 2015-04-05
------------------------
* Bumped to new Browsertime version with support for starting your own Selenium server. Use --btConfig to configure the server.

version 3.2.5  - 2015-04-02
------------------------
* Bug fix: 3.2.4 contain code that shouldn't be released ...

version 3.2.4 - 2015-04-01
------------------------
* Bug fix: Put User Timings (from the User Timing API) in the summary
* Bug fix: Put custom javascript value into the summary
* Bug fix: Budget for BrowserTime metrics stopped working since the last restructure of BT data.

version 3.2.3  - 2015-03-26
------------------------
* Bug fix: --storeJson (storing all collected data in one JSON file) didn't work.
* Bug fix: PhantomJS 2.0 had stopped working fetching timings #621, thanks Patrick Wieczorek for reporting

version 3.2.2 - 2015-03-23
------------------------
* New Browsertime version, putting User Timings back in the statistics and killing hanging Chrome/Chromedrivers on Linux. Older version could hang when running Chrome on Linux.

version 3.2.1 - 2015-03-21
------------------------
* Check that URLs are valid when fetched from a file
* Bug fixes: Compressed sizes has been wrong a long time since a bug in PhantomJS. However, if you also fetch data using browsers or
WebPageTest, the sizez will now be correctly populated! #54 #577
* New Browsertime 0.9.2 with fix for HTTPS, making requests visible in HAR-files.

version 3.2.0 - 2015-03-18
------------------------
* Check that we got an HAR from WebPageTest before we use the data #596
* We have made it easier to test multiple sites. Add multiple sites by pointing out multiple files like --sites mySite1.txt --sites mySite2.txt. This is done becasue it plays much nicer with our docker images. #579
* Default memory decreased to 256, the old 1024 is only needed when fetching really big sites. 256 is good because it is easier to use oob on small boxes. #610
* Make it easier to use customScripts and waitScript in BrowserTime. Custom scripts metrics is now shown in the result pages and sent to Graphite #611
* Upgraded to latest BrowserTime 0.9 with new structure of the data
* Simplified the proxy usage #612 meaning the proxy will start when Browsertime is needed

version 3.1.12 - 2015-03-06
------------------------
* Better title and descriptions #605 and removed robots no index
* Minify HTML output #608
* Bug fix: Handle requests with malformed URI:s when sending data to Graphite #609

version 3.1.11 - 2015-03-05
------------------------
* Send all timings per requests to Graphite when collecting data using Browsertime and WebPageTest (turn on with --graphiteData all or --graphiteData requesttimings) #603

* Flatten the domain name when sending domain timings to Graphite (making it easier to make nice graphs) #601

* Configure paths to assets for result pages #604

* Bug fix: If Graphite server is unreachable, callback chain was broken, meaning sitespeed didn't end properly #606

version 3.1.10 - 2015-03-02
------------------------
* New Browsertime version, setting timeout for browser drivers.

version 3.1.9 - 2015-03-01
------------------------
* Cleaned up the structure for Graphite internally #600
* Send domain timings info to Graphite to spot slow domains
* Show errors in error page, only when we have errors
* Upgrade to handlebars 3.0
* Upgraded Browsertime with new Selenium version, making Firefox 36 work

version 3.1.8 - 2015-02-26
------------------------
* Added verbose logging for GPSI
* Bumped Browsertime version, including fix for stopping Browsermobporxy on Windows

version 3.1.7 - 2015-02-24
------------------------
* Running only one run for WPT made aggregators failed (once again) #589
* Links in CLI now pointing to new documentation URL:s
* Log Graphite host & port each time the metrics is sent

version 3.1.6 - 2015-02-20
------------------------
* Faulty configuration for default WebPageTest location #588

version 3.1.5 - 2015-02-20
------------------------
* Enable verbose logging in Browsertime whenever Sitespeed.io runs in verbose mode (--verbose/-v).
* Check that location for WPT always contains location and browser
* Bumped BrowserTime, new version making sure it will not hang when Selenium/Chromedriver has problems.

version 3.1.4 - 2015-02-16
------------------------
* Log the time the analyze of the URL(s) took #578

version 3.1.3 - 2015-02-13
------------------------
* Improve validation of command line parameters.
* Added perf budget HTML page #576. Running a budget will also create an HTML page of the result. Thanks @stefanjudis for the idea!
* New BrowserTime version  (0.8.22)

version 3.1.2 - 2015-02-06
------------------------
* Include Node.js version when printing versions at the start of each run.
* Ok, incredible stupid implementation by me for the current perf budget,
  throwing an error when failing. Now the result array of the tests are returned.
* Added support for having a budget for number of requests, type and size #571
* Bug fix: Since we added slimerjs, we showed headless domContentLoadedTime as a page colum for every tested page.
* Bug fix: Don't automatically add column data if you configure it yourself.
* Bug fix: Headless timings perf budget was broken.

version 3.1.1 - 2015-02-04
------------------------
* Changed to eslint from jshint.
* Updated to latest phantomjs package.
* Updated to latest BrowserTime (with 2.0.0 of BrowserMobProxy)
* You can now choose not to create the domain path in the result dir
  by using the flag suppressDomainFolder #570
* Better handling of feeding URL:s via file. Supports array with URLs and file.


version 3.1 - 2015-01-27
------------------------
* Support for SlimerJS. Note: Choose which "headless" analyzer to use by
  using --headless [slimerjs|phantomjs]. Default is phantomjs.
  Also fetch timings using your choice by configure -b headless #544 #559

* Run WebPageTest test from multiple locations/browsers/connectivity. In 3.0
  you could only use one browser/location/connectivity, now you can use
  as many as you want. Everything is backward compatible except the Graphite keys
  for WebPageTest has changed, now including browser, location and connectivity.

  Meaning you need to change Grafana or what tool you are using to use the new
  keys when you upgrade. #546

* Hardcoded dependencies in package.json

version 3.0.5  - 2015-01-21
------------------------
* Changed deprecated phantom.args to be compatible to PhantomJS 2 #558

version 3.0.4 - 2015-01-19
------------------------
* Bugfix: Errors when taking screenshots weren't recorded as errors.
* Bugfix: Fix crash when running analysis #562

version 3.0.3  - 2015-01-07
------------------------
* Choose if you want to create HTML reports or not (--no-html) #548
* Bugfix: URL:s with and without request parameters collided when
  data files was created, now an extra hash is added to URL:s with
  parameters #552
* Better logging for PhantomJS

version 3.0.2  - 2014-12-19
------------------------
* fixes in the YSlow script so that some pages that fails, will work #549

version 3.0.1 - 2014-12-18
------------------------
* Add experimental support for running yslow in [SlimerJS](http://www.slimerjs.org) #544
* Fix Google PageSpeed Insights that broke in 3.0 #545
* Better logs when screenshot fails and increased timeout to 2 minutes
* Upgraded to new Crawler with higher default timeout times #547
* Added parameter to configure which phantomjs version to use (--phantomjsPath)

version 3.0.0 - 2014-12-15
------------------------
* The main goal with 3.0 has been to move to NodeJS. The crawler & BrowserTime still uses Java and we will try to move away from that in the future
* Support for getting Navigation Timing data from PhantomJS 2.0
* Drive/get/collect data from WebPageTest & Google Page Speed Insights
* Two new summary pages: Slowest domains and Toplist (with information about assets). More info will come
* We use Handlebars templates (instead of the old Velocity ones).
* All data is is JSON instead of XML as it was before.
* HAR-files created from the browser you use when fetching Navigation Timing API metrics
* Generate JUnit XML files/TAP and/or send data to Graphite; now included as main functionality.
* Send your metrics to Graphite
* Yep, hate to say it but the parameters to the CLI has changed, so please check --help to see how you should do

version 2.5.7 - 2014-03-17
------------------------
* Upgraded to YSlow 3.1.8 (with configurable CDN)
* Added support for Basic Auth (only missing in Browser Time right now, meaning you can't use Basic Auth to get timings)
* Turned on CDN rule and made it possibly to supply CDN domains
* Added new crawler that solves problem when the crawler picked up URLs with wrong domain, thanks @ChrisSoutham
* Updated support for catching lazy loaded assests in YSlow/PhantomJS, thanks @dorajistyle
* Show the 90 percentile value for all timing metrics on the individual pages #380
* Mobile rules changed: Doc size max 14 kb and max server side 200 ms for Green
* Summary: Show max number of request per domain #384
* Summary: Show number of redirects per page #385
* The avoid scaled images rules has been changed: If the image is larger than X (100 pixels by default) the rule will kick in.
* The sitespeed.io-sites script now uses firstPaint as default if you use IE or Chrome, supports local config file & uses maxRequestsPerDomain
  as default column instead of max requests per domain #387
* DNSLookup hurts more than CSS requests in points for Critical Path Rule #392
* Bug fix: If an error happens when crawling, log that to the error.log #378
* Bug fix: User defined measurements get Velocity code as description #366
* Bug fix: Show one decimal for time metrics on pages #363
* Bug fix: Connect via any SSL protocol #379 thanks @tollmanz
* Kind of a bug fix: The crawler can now handle a href tags with a line break instead of space between the a & the href

version 2.5.6 - 2014-02-15
------------------------
* New BrowserTime version 0.6 that fix crash while trying to run resource timing measurements in Firefox,
  see the list of changes here: https://github.com/tobli/browsertime/releases/tag/browsertime-0.6

version 2.5.5 - 2014-01-30
------------------------
* Bug fix: New version of the crawler, the proxy support was broken in the last release
* Added proxy support when collecting Navigation Timing metrics #351
* Added support for local configuration where you can override default configuration (thanks @AD7six)

version 2.5.4 - 2014-01-28
------------------------
* Bug fix: If phantomJS fails, the whole analyze fails (introduced in 2.5.x) #359
* The crawler now handles gziped content #263

version 2.5.3 - 2014-01-25
------------------------
* When parsing all individual HTML files, show how many that has been parsed every 20 run #354
* Bug fix: The internal link to assets on the detailed page don't work  #355
* Bug fix: Redirected URL don't report the end location URL (see the description in the issue for the full story #356)

version 2.5.2 - 2014-01-24
------------------------
* Even better fix for #352

version 2.5.1 - 2014-01-23
------------------------
* Fixed defect when trying to output error to the current console (instead of using the stderr) #352

version 2.5 - 2014-01-20
------------------------
* Better error handling: Log all errors to the error log file and #334 and make sure one page error will not break the whole test #329
* Test in multiple browsers in one run #341

version 2.4.1 - 2014-01-10
------------------------
* Put the HAR file in the HAR directory instead of sitespeed home dir (fixes #343), now it will work in Jenkins for Ubuntu

version 2.4 - 2014-01-08
------------------------
* If Chrome or IE is used, display firstPaintTime in the summary as default #307
* Added more default fields in the summary: requestsMissingGzip, jsWeightPerPage, cssWeightPerPage #325
* Changed order of the summary fields so that logical fields are grouped together
* Made it clearer that CSS & JS weight are per file in the summary (meaning inline CSS/JS are not included)
* Show red/yellow/green for cacheTime on the summary page #312 and for JS & CSS size
* Added short description on each rule on the summary page (hover to see it) #161
* New XML-Velocity jar that with a small change how template files are loaded
* New BrowserTime version that works on Windows & fetch resource timings
* Sitespeed.io works (again) on Windows, this time also when fetching Navigation Timing metrics
* Show which browser that is used on the summary page when collecting timing metrics
* Bug fix: the rule "Avoid DNS lookups when a page has few requests" was broken, couldn't tell if JS was loaded async or not #328
* Bug fix: Running the JUnit test script after you fetched URL:s from a file was broken

version 2.3.1 - 2013-12-27
------------------------
* Bug fix: Fixed bug When api.exip.org is down (sitespeed stops to work)

version 2.3 - 2013-12-10
------------------------
* Put the JUnit files into a dir named /junit/ when running the sitespeed.io-junit script. WARNING: this means you need to change in Jenkins where you match the files.
* Include -V when listing supported options in command line help


version 2.2.3 - 2013-12-02
------------------------
* Bug fix: The sitespeed-sites script had wrong path to the sitespeed script
* Added the number of text assets that are missing GZIP on the summary page (xml) #310 and for pages #315. Add it by the name requestsWithoutGZipPerPage
* Fix in how to handle browser parameters, to get it to work clean with Jenkins

version 2.2.2 - 2013-11-14
------------------------
* Bug fix: User marks named with spaces broke the summary.xml
* Bug fix: Sites with extremely far away last modification time on an asset, could break an analyze
* Upgraded Browser Time version to 0.4, getting back custom user measurements.

version 2.2.1 - 2013-11-12
------------------------
* Bug fix: Cleaner handling of relative URL in the sitespeed.io-junit script.

version 2.2 - 2013-11-12
------------------------
* Moved all scripts to the bin folder, following the standard and easier to package
* Cleanup all scripts to use absolute paths, making it easier to package for Homebrew
* sitespeed-sites.io now always need to have the filename of the text file containing all the URLS
* New names: sitespeed.io-sites & sitespeed.io-junit
* New BrowserTime version (0.3) including backEndTime & frontEndTime
* Changed default summary page to show backend & frontend time (removed redirectionTime & domInteractiveTime)
* Increased timeout for the crawler for really slow pages
* Bug fix: The fix for removing invalid XML caharcters created by GA, sometimes broke the analyze, now fixed (#304)

version 2.1.1 - 2013-11-05
------------------------
* New BrowserTime version, having 60s wait for load, also fixes Firefox 25 bug
* Logging all PhantomJS errors to own PhantomJS error log
* Bug fix: URL using brackets didn't get correct doc size
* Bug fix: Unable to crawl websites with GA cookie #298
* Bug fix: sitespeed-sites.io used the sitespeed.io script with sh instead of bash

version 2.1 - 2013-10-28
------------------------
* Create two JUnit xml files, one for rules & one for timing metrics! The new names of the output files are: sitespeed.io-rules-junit.xml & sitespeed.io-timings-junit.xml
* Finetuned the logo
* Output the the input parameters to the error.log so it is easy to reproduce the error
* Centralized the error logging
* Added an easy way of include sitespeed.io in Travis-CI
* Made it possible to analyze a site with non signed certificates
* Prepared for HTTP 2.0 rules & renamed the current rulesets, new names: sitespeed.io-desktop & sitespeed.io-mobile
* Also copy the result.xml file to the output dir for sitespeed.io-junit.xml (to be able to create graphs per URL)
* Bug fix: The crawler sometimes picked up URL:s linking to other content types than HTML
* Bug fix: The JUnit xslt outputted timings metrics

version 2.0  - 2013-10-12
------------------------
Major changes
------
* You can now choose which data that is showed in the summary boxes (the red/yellow/green ones on the start page) and the columns on the detailed summary page.
* You can also create your own box with your own data on the summary page and your own columns and data on the detailed summary page.
* Fetch Navigation Timing API data from a real browser, using Browser Time.
* New modified rule: the YSlow rule yimgnoscale doesn't work with PhantomJS. The new rule compare the image browser width and the real image width.
* The main script (sitespeed.io) has been cleaned up & Velocity templates has been restructured.
* You can now test multiple sites and compare them using the sitespeed-sites.io script (you can choose what kind of data to compare).
* There are now two different rule-sets, one for desktop & one for mobile.

Minor changes
------
* You can now configure the limits for the rules on the summary page.
* Phone view on detailed summary page now only contains url & score to make it simpler to maintain.
* You can now see the IP of the computer running the test in the result.xml file.
* You can now set the max pages to test & the name of the test (displayed on every HTML page).
* Simplified user agent by choosing between iphone, ipad or nexus and a real agent & viewport is set.
* Output as CSV: Choose which column to output and always output ip, start url & date.
* Fix for Windows-users that is having spaces in their path to Java.
* Bug fix: URL:s that returns error (4XX-5XX and that sitespeed can't analyze) is now included in the JUnit xml.
* Bug fix: The JUnit script can now output files to a relative path.
* Bug fix: User Agent is now correctly set.

version 1.8.3
------------------------
* Supply a test name that will be shown on all pages. Use the the parameter -n
* Well the problem is like this: Today there is no way to get the ttfb from PhantomJS so it is fetched by a extra request using curl. Some sites that don't cache internally (and are slow) can differ quite much for ttfb, meaning ttfb can be higher the next request than the load time the first time. If this happens it is now highlighted.
* Bug fix: show median front/back end time instead of percentile on summary page
* Bug fix: when the ttfb is larger than pageload, don't add it to summary stats
* Bug fix: for some sites (very rarely) the total weight was fetched wrong by YSlow, fixed last release for all pages except summary & summary details.

version 1.8.2
------------------------
* Show percentage of requests & size per content type
* You can now export the pages data to csv (again) with the switch "-o csv"
* Upgraded the crawler: Better closing of connections, URL:s that not following RFC 2396 gave null pointers & when a cookie is not following the spec, the url of the page setting the cookie is now logged
* On detailed page summary: Categorize favicon as favicon instead of others, and doc type has now an own category
* If an analysis fails, the url and the error from YSlow is now logged
* Cleanup: When you feed sitespeed.io with a list of urls from a file, the text messages is cleaner in the HTML
* Cleanup: Removed old JS table sorter on pages summary, works better now
* Bug fix: If a page was redirected, the gzipped size was fetched as 0, now fixed
* Bug fix: For some sites (example www.bike.se) the total weight was fetched wrong by YSlow, now the weight is calculated from each assets on the pages info page.
* Bug fix: Urls containing & broke some tests
* Bug fix: In very rare cases, YSlow reports a larger cache weight than the page weight. The bug is not fixed but when it happens, an error message is displayed
* Bug fix: Page weight was sometimes wrongly calculated, now each asset weight is used to calculate

version 1.8.1
------------------------
* Bug fix: TTFB on detailed page said ms but the value is s
* Bug fix: Yslow didn't honour max-age before expires (following 1.1 spec), now fixed
* Bug fix: Yslow couldn't fetch headers/weight for @import relative css, fixed
* Bug fix: Yslow now fetch assets, not fetched by PhantomJS
* Added the original favicon rule from Yslow since it works now with the bug fix
* Added favicon to the expire rules

version 1.8
------------------------
* Changed report dir name. Before it was sitespeed-HOST-NOWDATE, now it is HOST/NOWDATE, to make it easier to compare runs over time
* Added new XML format for the summary page.
* New page: The detailed summary page.
* Always output the result of the sitespeed-junit.io to the data dir
* Changed summary page: Before showed average & median, now median & 95 percentile
* Added summary of total image weight per page & on detailed level you can see  individual size
* New rule for checking if old versions of plugins is used. Right now only check JQuery.
* A little better check for correct Java version.
* Bug fix: The check for number of DOM elements where wrong when checking for warning


version 1.7
------------------------
* Added check that Java exists before the analyze
* Feed sitespeed with either a url to crawl or a plain text file with a list of URL:s (NOTE: the -f argument is now used for the file, the -c is the new for follow a specific path when crawling)
* Create a junit xml file from the test, new script & new xsl file
* Added new max size of a document, using stats from http archive
* Showing the number of domains on page summary
* Showing the percentage of assets that are cacheable on page summary
* Show the amount of assets that don't have an expire header om site summary & pages summary
* Removed prime cache values from site summary & page summary (was not always correct)
* Refactored page summary
* Removed rule ynumreq and created three new ones in order to get clearer junit xml result (and also only check for sync js): cssnumreq, cssimagesnumreq & jsnumreq
* Added average & median nr of DOM elements on site summary and specific nr on page
* Added response headers info on assets page
* Bug fix: If a max age HTTP cache header was missing the cache time, the cache time was set to 0, not listening to Expires header.
* Bug fix: If a asset was missing expire header, the last one before that expire was inherited

version 1.6
------------------------
* The SPOF rule now only report font face that are loaded from another top level domain. Also the actual font file is reported.
* Show requests per domain on individual page.
* Show cache time for each asset & delta between last modified & delivered + average.
* Configure which yslow file to use and which ruleset.
* Show time spent in frontend vs backend per page.
* On the summary page, now show info blocks: time spent in frontend/backend and cachetime/last modified average.
* New page: The assets page, show the most used assets for the site
* Adjusted the warning rules on the summary page, now a warning is up to the average number collected from httparchive (where applicable)
* Java jar dependencies now compiled for java 1.6 and higher
* Upgraded Yslow to 3.1.5

version 1.5.2
------------------------
* Bugfix: The SPOF rule reported CSS & JS as SPOF:s wrongly

version 1.5.1
------------------------
* Bugfix: The crawler reported links returning 200 with another content type then text/html as error url:s

version 1.5
------------------------
* Added support for configuring the crawler (see the dependencies/crawler.properties file).
* Added support for analyze behind proxy (thanks https://github.com/rhulse and https://github.com/samteeeee for reporting and testing it)
* Added html page that shows url:s that returned errors from the crawl
* Added percentage on summary page
* Added support for setting user agent
* Added support for setting view port
* Removed experimental rule for the amount of JS used
* Added new rule: Critical Path
* Finetuned the SPOF rule: Now also check font face
* Added time to first byte (using curl, new requirement)
* Fixed so document weight is fetched from curl aka the right sized if gzipped
* Bugfix: The check for phantomjs wasn't working, works now
* Bugfix: Now using JAVA_HOME in a correct way (thanks Rob-m)
* Bugfix: Upgraded the crawler to 1.3, now only fetched text/html links
* Removed csv as output format
* New rule: Avoid CDN lookups when your page has few requests
* New rule: Do not load stylesheet files when the page has few request
* New rule: Have a reasonable percentage of textual content compared to the rest of the page

version 1.4
------------------------
* Changed the limit value for doc size on the summary page, vas 10 kb but gzip is taken into consideration, changed to 100 kb!
* Concatenating css & js in the results to one file each
* Show average of how much of a page that consist of javascript in percent, on the summary page
* Show median values where applicable on the summary page (now show both average & median value)
* Show how much of a page that is js & css on a page in percent, compared to content
* Made java heap size & result directory configurable from the sitespeed script
* Cleanup if the sitespeed.io script, removed unused code and made it easier to update
* You can now zip the output result by calling the script
* Upgraded to latest crawler & xml-velocity jar
* Added image, css, js and css image total weight/size on page view
* Added new experimental rule of javascript percentage
* Upgraded jquery from 1.8.2 to 1.8.3

version 1.3
------------------------
* Made all pages responsive, standard stuff except the table in pages.vm, two different tables, one for phones, one for the rest
* Moved webpagetest link from pages.vm to page, to make more space
* Added the summary data also on page.vm
* Added possibility to output all page data as csv file (yes that old thing)
* Added possibility to output every html file as png, for easy include in documents/web etc
* Added htmlcompressor (http://code.google.com/p/htmlcompressor/) to compress all html, to make the pages smaller
* Upgraded to latest version of the crawler (smaller in size)
* Added support for handling testing only one page (depth = 0), thanks @tomsutton1984

version 1.2
------------------------
* Better handling of input parameters, now you specify them in the order you like
* Possibility to not crawl specific path segments in urls
* Run multiple processes when analyzing pages (to make it faster)
* More documentation in the sitespeed.io script
* Include rules dictionary when using yslow, always update the doc.js in yslow when adding new rule
* Show the full rule name when showing broken rules
* Show explanation for all rules used, linked from summary page
* Show exact rule number, for easier trackback

version 1.1 - 2012-10-15
------------------------
* New crawler instead of wget that didn't work on some sites with spider options (amazon etc)
* Fix for css in head rule, now only dns lookups are punished, not the number of css
* Crawl by follow a specific path, meaning you can analyze parts of sites


version 1.0.1
------------------------
* Fixed bug that sometimes url:s was fetched from different domains than the main domain
* Added links to tested start url on both summary and page page
* Added parameters to webpagetest run three times by default
* When a SPOF is found, link to webpagetest with SPOF domains activated is used by default

version 1.0 - 2012-10-10
------------------------
* Show full urls in pages & page to easier understand which url that is analyzed
* Show extra data in modals to make it clearer
* Popover & better texts on summary page
* Cleanup & bug fixes in the bash script, it sometimes failed on some sites when yslow outputted content after the xml
* Added output png:s that can be used on documents

version 0.9 - 2012-09-26
------------------------
* New rules: Loading js async and finding single point of failure
* Modified expires to skip analytics scripts
* Updated rules texts

version 0.8 - 2012-08-25
------------------------
* Added new custom rules and modified existing yslow rules.
* Favicon added :)

version  0.7 - 2012-08-23
------------------------
* Upgraded to jquery 1.8
* Upgraded Twitter Bootstrap to 2.1
* Better title tag on result pages
* Fixed so that long url:s don't break
* Sometimes output xml was broken
* Only fetch content of type html
