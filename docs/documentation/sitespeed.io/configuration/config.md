bin/sitespeed.js [options] <url>/<file>

Browser
  --browsertime.browser, -b, --browser                                      Choose which Browser to use when you test.  [choices: "chrome", "firefox"] [default: "chrome"]
  --browsertime.iterations, -n                                              How many times you want to test each page  [default: 3]
  --browsertime.spa, --spa                                                  Convenient parameter to use if you test a SPA application: will automatically wait for X seconds after last network activity and use hash in file names. Read https://www.sitespeed.io/documentation/sitespeed.io/spa/  [boolean] [default: false]
  --browsertime.connectivity.profile, -c, --connectivity                    The connectivity profile. To actually set the connectivity you can choose between Docker networks or Throttle, read https://www.sitespeed.io/documentation/sitespeed.io/connectivity/  [choices: "3g", "3gfast", "3gslow", "3gem", "2g", "cable", "native", "custom"] [default: "native"]
  --browsertime.connectivity.downstreamKbps, --downstreamKbps               This option requires --connectivity be set to "custom".
  --browsertime.connectivity.upstreamKbps, --upstreamKbps                   This option requires --connectivity be set to "custom".
  --browsertime.connectivity.latency, --latency                             This option requires --connectivity be set to "custom".
  --browsertime.connectivity.engine                                         Throttle works on Mac and tc based Linux (it is experimental so please use with care). Use external if you set the connectivity outside of Browsertime. The best way do to this is described in https://github.com/sitespeedio/browsertime#connectivity  [choices: "throttle", "external"] [default: "external"]
  --browsertime.pageCompleteCheck, --pageCompleteCheck                      Supply a Javascript that decides when the browser is finished loading the page and can start to collect metrics. The Javascript snippet is repeatedly queried to see if page has completed loading (indicated by the script returning true). Use it to fetch timings happening after the loadEventEnd.
  --browsertime.pageCompleteWaitTime, --pageCompleteWaitTime                How long time you want to wait for your pageComplteteCheck to finish, after it is signaled to closed. Extra parameter passed on to your pageCompleteCheck.  [default: 5000]
  --browsertime.pageCompleteCheckInactivity, --pageCompleteCheckInactivity  Alternative way to choose when to end your test. This will wait for 2 seconds of inactivity that happens after loadEventEnd.  [boolean] [default: false]
  --browsertime.script, --script                                            Add custom Javascript that collect metrics and run after the page has finished loading. Note that --script can be passed multiple times if you want to collect multiple metrics. The metrics will automatically be pushed to the summary/detailed summary and each individual page + sent to Graphite/InfluxDB.
  --browsertime.injectJs, --injectJs                                        Inject JavaScript into the current page (only Firefox at the moment) at document_start. More info: https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/contentScripts
  --browsertime.selenium.url                                                Configure the path to the Selenium server when fetching timings using browsers. If not configured the supplied NodeJS/Selenium version is used.
  --browsertime.viewPort, --viewPort                                        The browser view port size WidthxHeight like 400x300  [default: "1366x708"]
  --browsertime.userAgent, --userAgent                                      The full User Agent string, defaults to the User Agent used by the browsertime.browser option.
  --browsertime.preURL, --preURL                                            A URL that will be accessed first by the browser before the URL that you wanna analyze. Use it to fill the cache.
  --browsertime.preScript, --preScript                                      Selenium script(s) to run before you test your URL. They will run outside of the analyze phase. Note that --preScript can be passed multiple times.
  --browsertime.postScript, --postScript                                    Selenium script(s) to run after you test your URL. They will run outside of the analyze phase. Note that --postScript can be passed multiple times.
  --browsertime.delay, --delay                                              Delay between runs, in milliseconds. Use it if your web server needs to rest between runs :)
  --browsertime.pageLoadStrategy, --pageLoadStrategy                        The Page Load Strategy decides when you have control of the page load. Default is normal meaning you will have control after onload. You can change that to none to get control direct after navigation.  [choices: "normal", "none"] [default: "normal"]
  --browsertime.visualMetrics, --visualMetrics, --speedIndex                Calculate Visual Metrics like SpeedIndex, First Visual Change and Last Visual Change. Requires FFMpeg and Python dependencies  [boolean]
  --browsertime.visualElements, --visualElements                            Collect Visual Metrics from elements. Works only with --visualMetrics turned on. By default you will get visual metrics from the largest image within the view port and the largest h1. You can also configure to pickup your own defined elements with --scriptInput.visualElements  [boolean]
  --browsertime.scriptInput.visualElements, --scriptInput.visualElements    Include specific elements in visual elements. Give the element a name and select it with document.body.querySelector. Use like this: --scriptInput.visualElements name:domSelector . Add multiple instances to measure multiple elements. Visual Metrics will use these elements and calculate when they are visible and fully rendered.
  --browsertime.video, --video                                              Record a video and store the video. Set it to false to remove the video that is created by turning on visualMetrics. To remove fully turn off video recordings, make sure to set video and visualMetrics to false. Requires FFMpeg to be installed.  [boolean]
  --browsertime.videoParams.framerate, --videoParams.framerate, --fps       Frames per second in the video  [default: 30]
  --browsertime.videoParams.crf, --videoParams.crf                          Constant rate factor for the end result video, see https://trac.ffmpeg.org/wiki/Encode/H.264#crf  [default: 23]
  --browsertime.videoParams.addTimer, --videoParams.addTimer                Add timer and metrics to the video  [boolean] [default: true]
  --browsertime.userTimingWhitelist, --userTimingWhitelist                  This option takes a regex that will whitelist which userTimings to capture in the results. All userTimings are captured by default. T
  --browsertime.requestheader, -r, --requestheader                          Request header that will be added to the request. Add multiple instances to add multiple request headers. Use the following format key:value
  --browsertime.cookie, --cookie                                            Cookie that will be added to the request. Add multiple instances to add multiple cookies. Use the following format cookieName=cookieValue
  --browsertime.block, --block                                              Domain to block. Add multiple instances to add multiple domains that will be blocked.
  --browsertime.basicAuth, --basicAuth                                      Use it if your server is behind Basic Auth. Format: username@password.
  --browsertime.headless, --headless                                        Run the browser in headless mode. This is the browser internal headless mode, meaning you cannot collect Visual Metrics or in Chrome run any WebExtension (this means you cannot add cookies, requestheaders or use basic auth for headless Chrome).  [boolean] [default: false]

Filmstrip
  --browsertime.videoParams.filmstripFullSize, --videoParams.filmstripFullSize  Keep original sized screenshots in the filmstrip. Will make the run take longer time  [boolean] [default: false]
  --browsertime.videoParams.filmstripQuality, --videoParams.filmstripQuality    The quality of the filmstrip screenshots. 0-100.  [default: 75]
  --browsertime.videoParams.createFilmstrip, --videoParams.createFilmstrip      Create filmstrip screenshots.  [boolean] [default: true]
  --filmstrip.showAll                                                           Show all screenshots in the filmstrip, independent if they have changed or not.  [boolean] [default: false]

Firefox
  --browsertime.firefox.includeResponseBodies, --firefox.includeResponseBodies  Include response bodies in HAR  [choices: "none", "all", "html"] [default: "none"]
  --browsertime.firefox.nightly, --firefox.nightly                              Use Firefox Nightly. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --browsertime.firefox.beta, --firefox.beta                                    Use Firefox Beta. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --browsertime.firefox.developer, --firefox.developer                          Use Firefox Developer. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --browsertime.firefox.binaryPath, --firefox.binaryPath                        Path to custom Firefox binary (e.g. Firefox Nightly). On OS X, the path should be to the binary inside the app bundle, e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin
  --browsertime.firefox.preference, --firefox.preference                        Extra command line arguments to pass Firefox preferences by the format key:value To add multiple preferences, repeat --firefox.preference once per argument.
  --browsertime.firefox.acceptInsecureCerts, --firefox.acceptInsecureCerts      Accept insecure certs  [boolean]
  --browsertime.firefox.collectMozLog, --firefox.collectMozLog                  Collect the MOZ HTTP log  [boolean]

Chrome
  --browsertime.chrome.args, --chrome.args                                  Extra command line arguments to pass to the Chrome process. Always leave out the starting -- (--no-sandbox will be no-sandbox). To add multiple arguments to Chrome, repeat --browsertime.chrome.args once per argument. See https://peter.sh/experiments/chromium-command-line-switches/
  --browsertime.chrome.timeline, --chrome.timeline                          Collect the timeline data. Drag and drop the JSON in your Chrome detvools timeline panel or check out the CPU metrics.  [boolean]
  --browsertime.chrome.android.package, --chrome.android.package            Run Chrome on your Android device. Set to com.android.chrome for default Chrome version. You need to run adb start-server before you start.
  --browsertime.chrome.android.deviceSerial, --chrome.android.deviceSerial  Choose which device to use. If you do not set it, the first found device will be used.
  --browsertime.chrome.collectNetLog, --chrome.collectNetLog                Collect network log from Chrome and save to disk.  [boolean]
  --browsertime.chrome.traceCategories, --chrome.traceCategories            Set the trace categories.  [string]
  --browsertime.chrome.collectConsoleLog, --chrome.collectConsoleLog        Collect Chromes console log and save to disk.  [boolean]
  --browsertime.chrome.binaryPath, --chrome.binaryPath                      Path to custom Chrome binary (e.g. Chrome Canary). On OS X, the path should be to the binary inside the app bundle, e.g. "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"

proxy
  --browsertime.proxy.http, --proxy.http    Http proxy (host:port)  [string]
  --browsertime.proxy.https, --proxy.https  Https proxy (host:port)  [string]

Crawler
  --crawler.depth, -d     How deep to crawl (1=only one page, 2=include links from first page, etc.)
  --crawler.maxPages, -m  The max number of pages to test. Default is no limit.
  --crawler.exclude       Exclude URLs matching the provided regular expression (ex: "/some/path/", "://some\.domain/"). Can be provided multiple times.

Grafana
  --grafana.host  The Grafana host used when sending annotations.
  --grafana.port  The Grafana port used when sending annotations to Grafana.  [default: 80]
  --grafana.auth  The Grafana auth/bearer value used when sending annotations to Grafana. See http://docs.grafana.org/http_api/auth/#authentication-api

Graphite
  --graphite.host                  The Graphite host used to store captured metrics.
  --graphite.port                  The Graphite port used to store captured metrics.  [default: 2003]
  --graphite.auth                  The Graphite user and password used for authentication. Format: user:password
  --graphite.httpPort              The Graphite port used to access the user interface and send annotations event  [default: 8080]
  --graphite.webHost               The graphite-web host. If not specified graphite.host will be used.
  --graphite.namespace             The namespace key added to all captured metrics.  [default: "sitespeed_io.default"]
  --graphite.includeQueryParams    Whether to include query parameters from the URL in the Graphite keys or not  [boolean] [default: false]
  --graphite.arrayTags             Send the tags as Array or a String. In Graphite 1.0 the tags is a array. Before a String  [boolean] [default: true]
  --graphite.annotationTitle       Add a title to the annotation sent for a run. The message is attached after the default message and can contain HTML.
  --graphite.annotationMessage     Add an extra message that will be attached to the annotation sent for a run. The message is attached after the default message and can contain HTML.
  --graphite.annotationScreenshot  Include screenshot (from Browsertime) in the annotation. You need to specify a --resultBaseURL for this to work.  [boolean] [default: false]
  --graphite.statsd                Uses the StatsD interface  [boolean] [default: false]
  --graphite.annotationTag         Add a extra tag to the annotation sent for a run. Repeat the --graphite.annotationTag option for multiple tags. Make sure they do not collide with the other tags.
  --graphite.bulkSize              Break up number of metrics to send with each request.  [number] [default: null]

Plugins
  --plugins.list    List all configured plugins in the log.  [boolean]
  --plugins.add     Extra plugins that you want to run. Relative or absolute path to the plugin. Specify multiple plugin names separated by comma, or repeat the --plugins.add option
  --plugins.remove  Extra plugins that you want to run. Relative or absolute path to the plugin. Specify multiple plugin names separated by comma, or repeat the --plugins.remove option

Budget
  --budget.configPath        Path to the JSON budget file.
  --budget.suppressExitCode  By default sitespeed.io returns a failure exit code, if the budget fails. Set this to true and sitespeed.io will return exit code 0 independent of the budget.
  --budget.config            The JSON budget config as a string.
  --budget.output            The output format of the budget.  [choices: "junit", "tap", "json"]

Screenshot
  --browsertime.screenshotParams.type, --screenshot.type                                  Set the file type of the screenshot  [choices: "png", "jpg"] [default: "png"]
  --browsertime.screenshotParams.png.compressionLevel, --screenshot.png.compressionLevel  zlib compression level  [default: 6]
  --browsertime.screenshotParams.jpg.quality, --screenshot.jpg.quality                    Quality of the JPEG screenshot. 1-100  [default: 80]
  --browsertime.screenshotParams.maxSize, --screenshot.maxSize                            The max size of the screenshot (width and height).  [default: 2000]

InfluxDB
  --influxdb.protocol              The protocol used to store connect to the InfluxDB host.  [default: "http"]
  --influxdb.host                  The InfluxDB host used to store captured metrics.
  --influxdb.port                  The InfluxDB port used to store captured metrics.  [default: 8086]
  --influxdb.username              The InfluxDB username for your InfluxDB instance.
  --influxdb.password              The InfluxDB password for your InfluxDB instance.
  --influxdb.database              The database name used to store captured metrics.  [default: "sitespeed"]
  --influxdb.tags                  A comma separated list of tags and values added to each metric  [default: "category=default"]
  --influxdb.includeQueryParams    Whether to include query parameters from the URL in the InfluxDB keys or not  [boolean] [default: false]
  --influxdb.groupSeparator        Choose which character that will seperate a group/domain. Default is underscore, set it to a dot if you wanna keep the original domain name.  [default: "_"]
  --influxdb.annotationScreenshot  Include screenshot (from Browsertime) in the annotation. You need to specify a --resultBaseURL for this to work.  [boolean] [default: false]

Metrics
  --metrics.list        List all possible metrics in the data folder (metrics.txt).  [boolean] [default: false]
  --metrics.filterList  List all configured filters for metrics in the data folder (configuredMetrics.txt)  [boolean] [default: false]
  --metrics.filter      Add/change/remove filters for metrics. If you want to send all metrics, use: *+ . If you want to remove all current metrics and send only the coach score: *- coach.summary.score.*  [array]

WebPageTest
  --webpagetest.host               The domain of your WebPageTest instance.  [default: "https://www.webpagetest.org"]
  --webpagetest.key                The API key for you WebPageTest instance.
  --webpagetest.location           The location for the test  [default: "Dulles:Chrome"]
  --webpagetest.connectivity       The connectivity for the test.  [default: "Cable"]
  --webpagetest.runs               The number of runs per URL.  [default: 3]
  --webpagetest.custom             Execute arbitrary Javascript at the end of a test to collect custom metrics.
  --webpagetest.file               Path to a script file
  --webpagetest.script             The WebPageTest script as a string.
  --webpagetest.includeRepeatView  Do repeat or single views  [boolean] [default: false]
  --webpagetest.private            Wanna keep the runs private or not  [boolean] [default: true]
  --webpagetest.timeline           Activates Chrome tracing and get the devtools.timeline (only works for Chrome).  [boolean] [default: false]

Slack
  --slack.hookUrl       WebHook url for the Slack team (check https://<your team>.slack.com/apps/manage/custom-integrations).
  --slack.userName      User name to use when posting status to Slack.  [default: "Sitespeed.io"]
  --slack.channel       The slack channel without the # (if something else than the default channel for your hook).
  --slack.type          Send summary for a run, metrics from all URLs, only on errors or all to Slack.  [choices: "summary", "url", "error", "all"] [default: "all"]
  --slack.limitWarning  The limit to get a warning in Slack using the limitMetric  [default: 90]
  --slack.limitError    The limit to get a error in Slack using the limitMetric  [default: 80]
  --slack.limitMetric   The metric that will be used to set warning/error  [choices: "coachScore", "speedIndex", "firstVisualChange"] [default: "coachScore"]

s3
  --s3.endpoint           The S3 endpoint
  --s3.key                The S3 key
  --s3.secret             The S3 secret
  --s3.bucketname         Name of the S3 bucket
  --s3.path               Override the default folder path in the bucket where the results are uploaded. By default it's "DOMAIN_OR_FILENAME/TIMESTAMP", or the name of the folder if --outputFolder is specified.
  --s3.region             The S3 region. Optional depending on your settings.
  --s3.acl                The S3 canned ACL to set. Optional depending on your settings.
  --s3.removeLocalResult  Remove all the local result files after they have been uploaded to S3.  [boolean] [default: false]
  --s3.params             Extra params passed when you do the S3.upload: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property - Example: --s3.params.Expires=31536000 to set expire to one year.
  --s3.options            Extra options passed when you create the S3 object: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property - Example: add --s3.options.apiVersion=2006-03-01 to lock to a specific API version.

HTML
  --html.showAllWaterfallSummary  Set to true to show all waterfalls on page summary HTML report  [boolean] [default: false]
  --html.fetchHARFiles            Set to true to load HAR files using fetch instead of including them in the HTML. Turn this on if serve your pages using a server.  [boolean] [default: false]
  --html.logDownloadLink          Adds a link in the HTML so you easily can download the logs from the sitespeed.io run. If your server is public, be careful so you don't log passwords etc  [boolean] [default: false]
  --html.topListSize              Maximum number of assets to include in each toplist in the toplist tab  [default: 10]
  --html.showScript               Show a link to the script you use to run. Be careful if your result is public and you keep passwords in your script.  [boolean] [default: false]

Text
  --summary         Show brief text summary to stdout  [boolean] [default: false]
  --summary-detail  Show longer text summary to stdout  [boolean] [default: false]

Options:
  --version, -V    Show version number  [boolean]
  --debug          Debug mode logs all internal messages to the console.  [boolean] [default: false]
  --verbose, -v    Verbose mode prints progress messages to the console. Enter up to three times (-vvv) to increase the level of detail.  [count]
  --mobile         Access pages as mobile a fake mobile device. Set UA and width/height. For Chrome it will use device Apple iPhone 6.  [boolean] [default: false]
  --resultBaseURL  The base URL to the server serving the HTML result. In the format of https://result.sitespeed.io
  --gzipHAR        Compress the HAR files with GZIP.  [boolean] [default: false]
  --outputFolder   The folder where the result will be stored.  [string]
  --firstParty     A regex running against each request and categorize it as first vs third party URL. (ex: ".*sitespeed.*")
  --urlAlias       Use an alias for the URL (if you feed URLs from a file you can instead have the alias in the file). You need to pass on the same amount of alias as URLs. The alias is used as the name of the URL on the HTML report and in Graphite/InfluxDB. Pass on multiple --urlAlias for multiple alias/URLs. This will override alias in a file.  [string]
  --utc            Use Coordinated Universal Time for timestamps  [boolean] [default: false]
  --useHash        If your site uses # for URLs and # give you unique URLs you need to turn on useHash. By default is it turned off, meaning URLs with hash and without hash are treated as the same URL  [boolean] [default: false]
  --multi          Test multiple URLs within the same browser session (same cache etc). Only works with Browsertime. Use this if you want to test multiple pages (use journey) or want to test multiple pages with scripts. You can mix URLs and scripts (the order will matter): login.js https://www.sitespeed.io/ logout.js - More details: https://www.sitespeed.io/documentation/sitespeed.io/scripting/  [boolean] [default: false]
  --name           Give your test a name.
  --config         Path to JSON config file
  --help, -h       Show help  [boolean]

Read the docs at https://www.sitespeed.io/documentation/sitespeed.io/

