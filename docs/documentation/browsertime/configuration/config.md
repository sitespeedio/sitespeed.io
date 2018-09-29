browsertime.js [options] <url>

timeouts
  --timeouts.browserStart       Timeout when waiting for browser to start, in milliseconds  [number] [default: 60000]
  --timeouts.pageLoad           Timeout when waiting for url to load, in milliseconds  [number] [default: 300000]
  --timeouts.script             Timeout when running browser scripts, in milliseconds  [number] [default: 80000]
  --timeouts.pageCompleteCheck  Timeout when waiting for page to complete loading, in milliseconds  [number] [default: 300000]

chrome
  --chrome.args                        Extra command line arguments to pass to the Chrome process (e.g. --no-sandbox). To add multiple arguments to Chrome, repeat --chrome.args once per argument.
  --chrome.binaryPath                  Path to custom Chrome binary (e.g. Chrome Canary). On OS X, the path should be to the binary inside the app bundle, e.g. "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
  --chrome.chromedriverPath            Path to custom Chromedriver binary. Make sure to use a Chromedriver version that's compatible with the version of Chrome you're using
  --chrome.mobileEmulation.deviceName  Name of device to emulate. Works only standalone (see list in Chrome DevTools, but add phone like 'iPhone 6'). This will override your userAgent string.
  --chrome.mobileEmulation.width       Width in pixels of emulated mobile screen (e.g. 360)  [number]
  --chrome.mobileEmulation.height      Height in pixels of emulated mobile screen (e.g. 640)  [number]
  --chrome.mobileEmulation.pixelRatio  Pixel ratio of emulated mobile screen (e.g. 2.0)
  --chrome.android.package             Run Chrome on your Android device. Set to com.android.chrome for default Chrome version. You need to run adb start-server before you start.
  --chrome.android.deviceSerial        Choose which device to use. If you do not set it, first device will be used.
  --chrome.traceCategories             A comma separated list of Tracing event categories to include in the Trace log. Default no trace categories is collected.  [string]
  --chrome.timeline                    Collect the timeline data. Drag and drop the JSON in your Chrome detvools timeline panel or check out the CPU metrics in the Browsertime.json  [boolean]
  --chrome.collectPerfLog              Collect performance log from Chrome with Page and Network events and save to disk.  [boolean]
  --chrome.collectNetLog               Collect network log from Chrome and save to disk.  [boolean]
  --chrome.collectConsoleLog           Collect Chromes console log and save to disk.  [boolean]

firefox
  --firefox.binaryPath             Path to custom Firefox binary (e.g. Firefox Nightly). On OS X, the path should be to the binary inside the app bundle, e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin
  --firefox.nightly                Use Firefox Nightly. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --firefox.beta                   Use Firefox Beta. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --firefox.developer              Use Firefox Developer. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --firefox.preference             Extra command line arguments to pass Firefox preferences by the format key:value To add multiple preferences, repeat --firefox.preference once per argument.
  --firefox.includeResponseBodies  Include response bodies in HAR  [choices: "none", "all", "html"] [default: "none"]
  --firefox.acceptInsecureCerts    Accept insecure certs  [boolean]
  --firefox.collectMozLog          Collect the MOZ HTTP log  [boolean]

selenium
  --selenium.url  URL to a running Selenium server (e.g. to run a browser on another machine).

video
  --videoParams.framerate          Frames per second  [default: 30]
  --videoParams.crf                Constant rate factor see https://trac.ffmpeg.org/wiki/Encode/H.264#crf  [default: 23]
  --videoParams.addTimer           Add timer and metrics to the video.  [boolean] [default: true]
  --videoParams.keepOriginalVideo  [boolean] [default: false]
  --videoParams.filmstripFullSize  Keep original sized screenshots. Will make the run take longer time  [boolean] [default: false]
  --videoParams.filmstripQuality   The quality of the filmstrip screenshots. 0-100.  [default: 75]
  --videoParams.createFilmstrip    Create filmstrip screenshots.  [boolean] [default: true]
  --videoParams.combine            Combine preScript/postScript with the tested URL in the video. Turn this on and you will record the all scripts.  [boolean] [default: false]
  --videoParams.nice               Use nice when running FFMPEG during the run. A value from -20 to 19  https://linux.die.net/man/1/nice  [default: 0]

Screenshot
  --screenshot                             Save one screen shot per iteration.  [boolean] [default: false]
  --screenshotParams.type                  Set the file type of the screenshot  [choices: "png", "jpg"] [default: "jpg"]
  --screenshotParams.png.compressionLevel  zlib compression level  [default: 6]
  --screenshotParams.jpg.quality           Quality of the JPEG screenshot. 1-100  [default: 80]
  --screenshotParams.maxSize               The max size of the screenshot (width and height).  [default: 2000]

proxy
  --proxy.http   Http proxy (host:port)  [string]
  --proxy.https  Https proxy (host:port)  [string]

connectivity
  --connectivity.profile, -c         The connectivity profile.  [choices: "3g", "3gfast", "3gslow", "3gem", "2g", "cable", "native", "custom"] [default: "native"]
  --connectivity.downstreamKbps      This option requires --connectivity.profile be set to "custom".
  --connectivity.upstreamKbps        This option requires --connectivity.profile be set to "custom".
  --connectivity.latency             This option requires --connectivity.profile be set to "custom".
  --connectivity.alias               Give your connectivity profile a custom name
  --connectivity.engine              The engine for connectivity. Throttle works on Mac and tc based Linux (it is experimental so please use with care). Use external if you set the connectivity outside of Browsertime. The best way do to this is described in https://github.com/sitespeedio/browsertime#connectivity  [choices: "external", "throttle"] [default: "external"]
  --connectivity.throttle.localhost  Add latency/delay on localhost. Perfect for testing with WebPageReplay  [boolean] [default: false]

Options:
  --video                        Record a video and store the video. Set it to false to remove the video that is created by turning on visualMetrics. To remove fully turn off video recordings, make sure to set video and visualMetrics to false. Requires FFMpeg to be installed.  [boolean]
  --visualMetrics                Collect Visual Metrics like First Visual Change, SpeedIndex, Perceptual Speed Index and Last Visual Change. Requires FFMpeg and Python dependencies  [boolean]
  --visuaElements                Collect Visual Metrics from elements. Works only with --visualMetrics turned on. By default you will get visual metrics from the largest image within the view port and the largest h1. You can also configure to pickup your own defined elements with --scriptInput.visualElements  [boolean]
  --scriptInput.visualElements   Include specific elements in visual elements. Give the element a name and select it with document.body.querySelector. Use like this: --scriptInput.visualElements name:domSelector see https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors. Add multiple instances to measure multiple elements. Visual Metrics will use these elements and calculate when they are visible and fully rendered.
  --browser, -b                  Specify browser  [choices: "chrome", "firefox"] [default: "chrome"]
  --pageCompleteCheck            Supply a JavaScript that decides when the browser is finished loading the page and can start to collect metrics. The JavaScript snippet is repeatedly queried to see if page has completed loading (indicated by the script returning true). Use it to fetch timings happening after the loadEventEnd. By default the tests ends 2 seconds after loadEventEnd. Also checkout --pageCompleteCheckInactivity
  --pageCompleteCheckInactivity  Alternative way to choose when to end your test. This will wait for 2 seconds of inactivity that happens after loadEventEnd.  [boolean] [default: false]
  --iterations, -n               Number of times to test the url (restarting the browser between each test)  [number] [default: 3]
  --prettyPrint                  Enable to print json/har with spaces and indentation. Larger files, but easier on the eye.  [boolean] [default: false]
  --delay                        Delay between runs, in milliseconds  [number] [default: 0]
  --requestheader, -r            Request header that will be added to the request. Add multiple instances to add multiple request headers. Use the following format key:value
  --cookie                       Cookie that will be added to the request. Add multiple instances to add multiple request cookies. Use the following format cookieName=cookieValue
  --block                        Domain to block. Add multiple instances to add multiple domains that will be blocked.
  --percentiles                  The percentile values within the data browsertime will calculate and report.  [array] [default: [0,10,90,99,100]]
  --decimals                     The decimal points browsertime statistics round to.  [number] [default: 0]
  --cacheClearRaw                Use internal browser functionality to clear browser cache between runs instead of only using Selenium.  [boolean] [default: false]
  --basicAuth                    Use it if your server is behind Basic Auth. Format: username@password (Only Chrome at the moment).
  --preScript                    Selenium script(s) to run before you test your URL (use it for login, warm the cache, etc). Note that --preScript can be passed multiple times.
  --postScript                   Selenium script(s) to run after you test your URL (use it for logout etc). Note that --postScript can be passed multiple times.
  --script                       Add custom Javascript to run after the page has finished loading to collect metrics. If a single js file is specified, it will be included in the category named "custom" in the output json. Pass a folder to include all .js scripts in the folder, and have the folder name be the category. Note that --script can be passed multiple times.
  --userAgent                    Override user agent
  --silent, -q                   Only output info in the logs, not to the console. Enter twice to suppress summary line.  [count]
  --output, -o                   Specify file name for Browsertime data (ex: 'browsertime'). Unless specified, file will be named browsertime.json
  --har                          Specify file name for .har file (ex: 'browsertime'). Unless specified, file will be named browsertime.har
  --skipHar                      Pass --skipHar to not collect a HAR file.  [boolean]
  --gzipHar                      Pass --gzipHar to gzip the HAR file  [boolean]
  --config                       Path to JSON config file
  --viewPort                     Size of browser window WIDTHxHEIGHT or "maximize". Note that "maximize" is ignored for xvfb.
  --resultDir                    Set result directory for the files produced by Browsertime
  --xvfb                         Start xvfb before the browser is started  [boolean] [default: false]
  --xvfbParams.display           The display used for xvfb  [default: 99]
  --preURL                       A URL that will be accessed first by the browser before the URL that you wanna analyze. Use it to fill the cache.
  --preURLDelay                  Delay between preURL and the URL you want to test (in milliseconds)  [default: 1500]
  --userTimingWhitelist          All userTimings are captured by default this option takes a regex that will whitelist which userTimings to capture in the results.
  --headless                     Run the browser in headless mode.  [boolean] [default: false]
  --extension                    Path to a WebExtension to be installed in the browser. Note that --extension can be passed multiple times.
  -h, --help                     Show help  [boolean]
  -V, --version                  Show version number  [boolean]

