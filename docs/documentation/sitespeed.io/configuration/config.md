bin/sitespeed.js [options] <url>/<file>

Browser
  --browsertime.browser, -b, --browser                         Choose which Browser to use when you test.  [choices: "chrome", "firefox"] [default: "chrome"]
  --browsertime.iterations, -n                                 How many times you want to test each page  [default: 3]
  --browsertime.connectivity.profile, -c, --connectivity       The connectivity profile.  [choices: "3g", "3gfast", "3gslow", "3gem", "2g", "cable", "native", "custom"] [default: "native"]
  --browsertime.connectivity.downstreamKbps, --downstreamKbps  This option requires --connectivity be set to "custom".
  --browsertime.connectivity.upstreamKbps, --upstreamKbps      This option requires --connectivity be set to "custom".
  --browsertime.connectivity.latency, --latency                This option requires --connectivity be set to "custom".
  --browsertime.connectivity.engine                            Throttle works on Mac and tc based Linux (it is experimental so please use with care). Use external if you set the connectivity outside of Browsertime. The best way do to this is described in https://github.com/sitespeedio/browsertime#connectivity  [choices: "throttle", "external"] [default: "external"]
  --browsertime.pageCompleteCheck                              Supply a Javascript that decides when the browser is finished loading the page and can start to collect metrics. The Javascript snippet is repeatedly queried to see if page has completed loading (indicated by the script returning true). Use it to fetch timings happening after the loadEventEnd.
  --browsertime.script, --script                               Add custom Javascript that collect metrics and run after the page has finished loading. Note that --script can be passed multiple times if you want to collect multiple metrics. The metrics will automatically be pushed to the summary/detailed summary and each individual page + sent to Graphite/InfluxDB.
  --browsertime.selenium.url                                   Configure the path to the Selenium server when fetching timings using browsers. If not configured the supplied NodeJS/Selenium version is used.
  --browsertime.viewPort                                       The browser view port size WidthxHeight like 400x300  [default: "1366x708"]
  --browsertime.userAgent                                      The full User Agent string, defaults to the User Agent used by the browsertime.browser option.
  --browsertime.preScript, --preScript                         Selenium script(s) to run before you test your URL (use it for login, warm the cache, etc). Note that --preScript can be passed multiple times.
  --browsertime.postScript, --postScript                       Selenium script(s) to run after you test your URL (use it for logout etc). Note that --postScript can be passed multiple times.
  --browsertime.delay                                          Delay between runs, in milliseconds. Use it if your web server needs to rest between runs :)
  --browsertime.speedIndex, --speedIndex                       Calculate SpeedIndex. Requires FFMpeg and python dependencies  [boolean]
  --browsertime.video, --video                                 Record a video. Requires FFMpeg to be installed  [boolean]
  --browsertime.videoParams.framerate, --fps                   Frames per second in the video  [default: 30]
  --browsertime.videoParams.crf                                Constant rate factor for the end result video, see https://trac.ffmpeg.org/wiki/Encode/H.264#crf  [default: 23]
  --browsertime.videoParams.addTimer                           Add timer and metrics to the video  [boolean] [default: true]
  --browsertime.userTimingWhitelist, --userTimingWhitelist     This option takes a regex that will whitelist which userTimings to capture in the results. All userTimings are captured by default. T
  --browsertime.firefox.preference                             Extra command line arguments to pass Firefox preferences by the format key:value To add multiple preferences, repeat --browsertime.firefox.preference once per argument.
  --browsertime.firefox.includeResponseBodies                  Include response bodies in HAR when using Firefox.  [boolean]
  --browsertime.chrome.args                                    Extra command line arguments to pass to the Chrome process. Always leave out the starting -- (--no-sandbox will be no-sandbox). To add multiple arguments to Chrome, repeat --browsertime.chrome.args once per argument.
  --browsertime.chrome.collectTracingEvents                    Collect Chromes traceCategories  [boolean]
  --browsertime.chrome.android.package                         Run Chrome on your Android device. Set to com.android.chrome for default Chrome version. You need to run adb start-server before you start.
  --browsertime.chrome.android.deviceSerial                    Choose which device to use. If you do not set it, the first found device will be used.
  --browsertime.chrome.collectNetLog                           Collect network log from Chrome and save to disk.  [boolean]
  --browsertime.chrome.traceCategories                         Set the trace categories.  [string]
  --browsertime.requestheader, -r                              Request header that will be added to the request. Add multiple instances to add multiple request headers. Use the following format key:value
  --browsertime.block                                          Domain to block. Add multiple instances to add multiple domains that will be blocked.
  --browsertime.basicAuth, --basicAuth                         Use it if your server is behind Basic Auth. Format: username@password.

proxy
  --browsertime.proxy.http   Http proxy (host:port)  [string]
  --browsertime.proxy.https  Https proxy (host:port)  [string]

Crawler
  --crawler.depth, -d     How deep to crawl (1=only one page, 2=include links from first page, etc.)
  --crawler.maxPages, -m  The max number of pages to test. Default is no limit.

Graphite
  --graphite.host                The Graphite host used to store captured metrics.
  --graphite.port                The Graphite port used to store captured metrics.  [default: 2003]
  --graphite.auth                The Graphite user and password used for authentication. Format: user:password
  --graphite.httpPort            The Graphite port used to access the user interface and send annotations event  [default: 8080]
  --graphite.webHost             The graphite-web host. If not specified graphite.host will be used.
  --graphite.namespace           The namespace key added to all captured metrics.  [default: "sitespeed_io.default"]
  --graphite.includeQueryParams  Whether to include query parameters from the URL in the Graphite keys or not  [boolean] [default: false]
  --graphite.arrayTags           Send the tags as Array or a String. In Graphite 1.0 the tags is a array. Before a String  [boolean] [default: true]

Plugins
  --plugins.list    List all configured plugins in the log.  [boolean]
  --plugins.add     Extra plugins that you want to run. Relative or absolute path to the plugin. Specify multiple plugin names separated by comma, or repeat the --plugins.add option
  --plugins.remove  Extra plugins that you want to run. Relative or absolute path to the plugin. Specify multiple plugin names separated by comma, or repeat the --plugins.remove option

Budget
  --budget.configPath  Path to the JSON budget file.
  --budget.config      The JSON budget config as a string.
  --budget.output      The output format of the budget.  [choices: "junit", "tap"]

Screenshot
  --screenshot.type                  Set the file type of the screenshot  [choices: "png", "jpg"] [default: "png"]
  --screenshot.png.compressionLevel  zlib compression level  [default: 6]
  --screenshot.jpg.quality           Quality of the JPEG screenshot. 1-100  [default: 80]
  --screenshot.maxSize               The max size of the screenshot (width and height).  [default: 2000]

InfluxDB
  --influxdb.protocol            The protocol used to store connect to the InfluxDB host.  [default: "http"]
  --influxdb.host                The InfluxDB host used to store captured metrics.
  --influxdb.port                The InfluxDB port used to store captured metrics.  [default: 8086]
  --influxdb.username            The InfluxDB username for your InfluxDB instance.
  --influxdb.password            The InfluxDB password for your InfluxDB instance.
  --influxdb.database            The database name used to store captured metrics.  [default: "sitespeed"]
  --influxdb.tags                A comma separated list of tags and values added to each metric  [default: "category=default"]
  --influxdb.includeQueryParams  Whether to include query parameters from the URL in the InfluxDB keys or not  [boolean] [default: false]

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
  --s3.key                The S3 key
  --s3.secret             The S3 secret
  --s3.bucketname         Name of the S3 bucket
  --s3.path               Override the default folder path in the bucket where the results are uploaded. By default it's "DOMAIN_OR_FILENAME/TIMESTAMP", or the name of the folder if --outputFolder is specified.
  --s3.region             The S3 region. Optional depending on your settings.
  --s3.removeLocalResult  Remove all the local result files after they have been uploaded to S3  [boolean] [default: false]

HTML
  --html.showAllWaterfallSummary  Set to true to show all waterfalls on page summary HTML report  [boolean] [default: false]
  --html.fetchHARFiles            Set to true to load HAR files using fetch instead of including them in the HTML. Turn this on if serve your pages using a server.  [boolean] [default: false]
  --html.logDownloadLink          Adds a link in the HTML so you easily can download the logs from the sitespeed.io run. If your server is public, be careful so you don't log passwords etc  [boolean] [default: false]
  --html.topListSize              Maximum number of assets to include in each toplist in the toplist tab  [default: 10]

text
  --summary         Show brief text summary to stdout  [boolean] [default: false]
  --summary-detail  Show longer text summary to stdout  [boolean] [default: false]

Options:
  --version, -V                   Show version number  [boolean]
  --debug                         Debug mode logs all internal messages to the console.  [boolean] [default: false]
  --verbose, -v                   Verbose mode prints progress messages to the console. Enter up to three times (-vvv) to increase the level of detail.  [count]
  --browsertime.preURL, --preURL  A URL that will be accessed first by the browser before the URL that you wanna analyze. Use it to fill the cache.
  --mobile                        Access pages as mobile a fake mobile device. Set UA and width/height. For Chrome it will use device Apple iPhone 6.  [boolean] [default: false]
  --resultBaseURL                 The base URL to the server serving the HTML result. In the format of https://result.sitespeed.io
  --gzipHAR                       Compress the HAR files with GZIP.  [boolean] [default: false]
  --outputFolder                  The folder where the result will be stored.
  --firstParty                    A regex running against each request and categorize it as first vs third party URL. (ex: ".*sitespeed.*")
  --utc                           Use Coordinated Universal Time for timestamps  [boolean] [default: false]
  --config                        Path to JSON config file
  --help, -h                      Show help  [boolean]

Read the docs at https://www.sitespeed.io/documentation/sitespeed.io/

