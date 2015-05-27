# CHANGELOG - sitespeed.io

version 3.5
------------------------
* Rewrite of the Graphite key generation, now always follow the patter protocol.my_domain_com._then_the_path #651.
  The cool thing is that this opens for a lot og Graphite/Grafana goodies, the bad is that if you use it today,
  you need to remap the keys in Grafana to get the graphs.

version 3.4.1
------------------------
* Super ugly quick fix for dubplicate dots in graphite keys #654

version 3.4
------------------------
* IMPORTANT: New structure for URL paths sent to Graphite. Now follow protocol.hostname.pathname structure, thanks @JeroenVdb #651
* Send size and type of every asset to Graphite #650 thanks @JeroenVdb!
* Renamed requesttimings to requests when choosing which data that should be sent to Graphite
* Hail the new default waitScript! If you are using phantomjs2 we will now wait for the loadEventEnd + aprox 2 seconds before we end a run for YSlow #653
* IMPORTANT: The old graphite key requests (showing number of requests) changed to noRequests.
* Bug fix: Specifying a custom yslow script now works again, fixing #649. Thanks to Jubel Han for reporting.

version 3.3.3
------------------------
* Bug fix: Add size & number of requests for all domains
* Send accumulatedTime a.k.a total time for a domain for all assets to Graphite

version 3.3.2
------------------------
* Bug fix: Fetch number of assets used per domain only once per HAR file.

version 3.3.1
------------------------
* Bug fix: Number of request per domain always showed 1, that's not right!

version 3.3
------------------------
* Send the total weight per domain and per content type to Graphite #644 thanks @JeroenVdb.
* Changed the key structure for request per domain (to follow the same structure as the rest of the domain keys): NAMESPACE.www.myhost.com.summary.domains.requests.*
* If you start sitespeed with a callback method it will now call the callback(error, result) now supplying the result.
* Silence log when running in test env (log errors and above)

version 3.2.10
------------------------
* Bug fix: Removed another limit for number of domains, setting it to 10 domains before #643

version 3.2.9
------------------------
* Removed the limit of sending max 100 domains to Graphite #643

version 3.2.8
------------------------
* Use --postURL to POST the result of an analyze to a URL
* Use --processJson to rerun all the post tasks on a result, use it to reconfigure what data to show in the HTML output.
* Bug fix: extra check when generating Graphite keys. #642

version 3.2.7
------------------------
* Send request timings to Graphite if we use WebPageTest #639
* Possible to configure the URL to a selenium server (making Chrome on Linux more stable or at least less instable)

version 3.2.6
------------------------
* Bumped to new Browsertime version with support for starting your own Selenium server. Use --btConfig to configure the server.

version 3.2.5
------------------------
* Bug fix: 3.2.4 contain code that shouldn't be released ...

version 3.2.4
------------------------
* Bug fix: Put User Timings (from the User Timing API) in the summary
* Bug fix: Put custom javascript value into the summary
* Bug fix: Budget for BrowserTime metrics stopped working since the last restructure of BT data.

version 3.2.3
------------------------
* Bug fix: --storeJson (storing all collected data in one JSON file) didn't work.
* Bug fix: PhantomJS 2.0 had stopped working fetching timings #621, thanks Patrick Wieczorek for reporting

version 3.2.2
------------------------
* New Browsertime version, putting User Timings back in the statistics and killing hanging Chrome/Chromedrivers on Linux. Older version could hang when running Chrome on Linux.

version 3.2.1
------------------------
* Check that URLs are valid when fetched from a file
* Bug fixes: Compressed sizes has been wrong a long time since a bug in PhantomJS. However, if you also fetch data using browsers or
WebPageTest, the sizez will now be correctly populated! #54 #577
* New Browsertime 0.9.2 with fix for HTTPS, making requests visible in HAR-files.

version 3.2.0
------------------------
* Check that we got an HAR from WebPageTest before we use the data #596
* We have made it easier to test multiple sites. Add multiple sites by pointing out multiple files like --sites mySite1.txt --sites mySite2.txt. This is done becasue it plays much nicer with our docker images. #579
* Default memory decreased to 256, the old 1024 is only needed when fetching really big sites. 256 is good because it is easier to use oob on small boxes. #610
* Make it easier to use customScripts and waitScript in BrowserTime. Custom scripts metrics is now shown in the result pages and sent to Graphite #611
* Upgraded to latest BrowserTime 0.9 with new structure of the data
* Simplified the proxy usage #612 meaning the proxy will start when Browsertime is needed

version 3.1.12
------------------------
* Better title and descriptions #605 and removed robots no index
* Minify HTML output #608
* Bug fix: Handle requests with malformed URI:s when sending data to Graphite #609

version 3.1.11
------------------------
* Send all timings per requests to Graphite when collecting data using Browsertime and WebPageTest (turn on with --graphiteData all or --graphiteData requesttimings) #603

* Flatten the domain name when sending domain timings to Graphite (making it easier to make nice graphs) #601

* Configure paths to assets for result pages #604

* Bug fix: If Graphite server is unreachable, callback chain was broken, meaning sitespeed didn't end properly #606  

version 3.1.10
------------------------
* New Browsertime version, setting timeout for browser drivers.

version 3.1.9
------------------------
* Cleaned up the structure for Graphite internally #600
* Send domain timings info to Graphite to spot slow domains
* Show errors in error page, only when we have errors
* Upgrade to handlebars 3.0
* Upgraded Browsertime with new Selenium version, making Firefox 36 work

version 3.1.8
------------------------
* Added verbose logging for GPSI
* Bumped Browsertime version, including fix for stopping Browsermobporxy on Windows

version 3.1.7
------------------------
* Running only one run for WPT made aggregators failed (once again) #589
* Links in CLI now pointing to new documentation URL:s
* Log Graphite host & port each time the metrics is sent

version 3.1.6
------------------------
* Faulty configuration for default WebPageTest location #588

version 3.1.5
------------------------
* Enable verbose logging in Browsertime whenever Sitespeed.io runs in verbose mode (--verbose/-v).
* Check that location for WPT always contains location and browser
* Bumped BrowserTime, new version making sure it will not hang when Selenium/Chromedriver has problems.

version 3.1.4
------------------------
* Log the time the analyze of the URL(s) took #578

version 3.1.3
------------------------
* Improve validation of command line parameters.
* Added perf budget HTML page #576. Running a budget will also create an HTML page of the result. Thanks @stefanjudis for the idea!
* New BrowserTime version  (0.8.22)

version 3.1.2
------------------------
* Include Node.js version when printing versions at the start of each run.
* Ok, incredible stupid implementation by me for the current perf budget,
  throwing an error when failing. Now the result array of the tests are returned.
* Added support for having a budget for number of requests, type and size #571
* Bug fix: Since we added slimerjs, we showed headless domContentLoadedTime as a page colum for every tested page.
* Bug fix: Don't automatically add column data if you configure it yourself.
* Bug fix: Headless timings perf budget was broken.

version 3.1.1
------------------------
* Changed to eslint from jshint.
* Updated to latest phantomjs package.
* Updated to latest BrowserTime (with 2.0.0 of BrowserMobProxy)
* You can now choose not to create the domain path in the result dir
  by using the flag suppressDomainFolder #570
* Better handling of feeding URL:s via file. Supports array with URLs and file.


version 3.1
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

version 3.0.5
------------------------
* Changed deprecated phantom.args to be compatible to PhantomJS 2 #558

version 3.0.4
------------------------
* Bugfix: Errors when taking screenshots weren't recorded as errors.
* Bugfix: Fix crash when running analysis #562

version 3.0.3
------------------------
* Choose if you want to create HTML reports or not (--no-html) #548
* Bugfix: URL:s with and without request parameters collided when
  data files was created, now an extra hash is added to URL:s with
  parameters #552
* Better logging for PhantomJS

version 3.0.2
------------------------
* fixes in the YSlow script so that some pages that fails, will work #549

version 3.0.1
------------------------
* Add experimental support for running yslow in [SlimerJS](http://www.slimerjs.org) #544
* Fix Google PageSpeed Insights that broke in 3.0 #545
* Better logs when screenshot fails and increased timeout to 2 minutes
* Upgraded to new Crawler with higher default timeout times #547
* Added parameter to configure which phantomjs version to use (--phantomjsPath)

version 3.0.0
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

version 2.5.7
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

version 2.5.6
------------------------
* New BrowserTime version 0.6 that fix crash while trying to run resource timing measurements in Firefox,
  see the list of changes here: https://github.com/tobli/browsertime/releases/tag/browsertime-0.6

version 2.5.5
------------------------
* Bug fix: New version of the crawler, the proxy support was broken in the last release
* Added proxy support when collecting Navigation Timing metrics #351
* Added support for local configuration where you can override default configuration (thanks @AD7six)

version 2.5.4
------------------------
* Bug fix: If phantomJS fails, the whole analyze fails (introduced in 2.5.x) #359
* The crawler now handles gziped content #263

version 2.5.3
------------------------
* When parsing all individual HTML files, show how many that has been parsed every 20 run #354
* Bug fix: The internal link to assets on the detailed page don't work  #355
* Bug fix: Redirected URL don't report the end location URL (see the description in the issue for the full story #356)

version 2.5.2
------------------------
* Even better fix for #352

version 2.5.1
------------------------
* Fixed defect when trying to output error to the current console (instead of using the stderr) #352

version 2.5
------------------------
* Better error handling: Log all errors to the error log file and #334 and make sure one page error will not break the whole test #329
* Test in multiple browsers in one run #341

version 2.4.1
------------------------
* Put the HAR file in the HAR directory instead of sitespeed home dir (fixes #343), now it will work in Jenkins for Ubuntu

version 2.4
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

version 2.3.1
------------------------
* Bug fix: Fixed bug When api.exip.org is down (sitespeed stops to work)

version 2.3
------------------------
* Put the JUnit files into a dir named /junit/ when running the sitespeed.io-junit script. WARNING: this means you need to change in Jenkins where you match the files.
* Include -V when listing supported options in command line help


version 2.2.3
------------------------
* Bug fix: The sitespeed-sites script had wrong path to the sitespeed script
* Added the number of text assets that are missing GZIP on the summary page (xml) #310 and for pages #315. Add it by the name requestsWithoutGZipPerPage
* Fix in how to handle browser parameters, to get it to work clean with Jenkins

version 2.2.2
------------------------
* Bug fix: User marks named with spaces broke the summary.xml
* Bug fix: Sites with extremely far away last modification time on an asset, could break an analyze
* Upgraded Browser Time version to 0.4, getting back custom user measurements.

version 2.2.1
------------------------
* Bug fix: Cleaner handling of relative URL in the sitespeed.io-junit script.

version 2.2
------------------------
* Moved all scripts to the bin folder, following the standard and easier to package
* Cleanup all scripts to use absolute paths, making it easier to package for Homebrew
* sitespeed-sites.io now always need to have the filename of the text file containing all the URLS
* New names: sitespeed.io-sites & sitespeed.io-junit
* New BrowserTime version (0.3) including backEndTime & frontEndTime
* Changed default summary page to show backend & frontend time (removed redirectionTime & domInteractiveTime)
* Increased timeout for the crawler for really slow pages
* Bug fix: The fix for removing invalid XML caharcters created by GA, sometimes broke the analyze, now fixed (#304)

version 2.1.1
------------------------
* New BrowserTime version, having 60s wait for load, also fixes Firefox 25 bug
* Logging all PhantomJS errors to own PhantomJS error log
* Bug fix: URL using brackets didn't get correct doc size
* Bug fix: Unable to crawl websites with GA cookie #298
* Bug fix: sitespeed-sites.io used the sitespeed.io script with sh instead of bash

version 2.1
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

version 2.0
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

version 1.1
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

version 1.0
------------------------
* Show full urls in pages & page to easier understand which url that is analyzed
* Show extra data in modals to make it clearer
* Popover & better texts on summary page
* Cleanup & bug fixes in the bash script, it sometimes failed on some sites when yslow outputted content after the xml
* Added output png:s that can be used on documents

version 0.9
------------------------
* New rules: Loading js async and finding single point of failure
* Modified expires to skip analytics scripts
* Updated rules texts

version 0.8
------------------------
* Added new custom rules and modified existing yslow rules.
* Favicon added :)

version  0.7
------------------------
* Upgraded to jquery 1.8
* Upgraded Twitter Bootstrap to 2.1
* Better title tag on result pages
* Fixed so that long url:s don't break
* Sometimes output xml was broken
* Only fetch content of type html
