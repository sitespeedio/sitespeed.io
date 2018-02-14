bin/browsertime.js [options] <url>

timeouts
  --timeouts.browserStart       Timeout when waiting for browser to start, in milliseconds  [number] [default: 60000]
  --timeouts.pageLoad           Timeout when waiting for url to load, in milliseconds  [number] [default: 300000]
  --timeouts.script             Timeout when running browser scripts, in milliseconds  [number] [default: 80000]
  --timeouts.pageCompleteCheck  Timeout when waiting for page to complete loading, in milliseconds  [number] [default: 300000]

chrome
  --chrome.args                        Extra command line arguments to pass to the Chrome process (e.g. --no-sandbox). To add multiple arguments to Chrome, repeat --chrome.args once per argument.
  --chrome.binaryPath                  Path to custom Chrome binary (e.g. Chrome Canary). On OS X, the path should be to the binary inside the app bundle, e.g. "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
  --chrome.chromedriverPath            Path to custom Chromedriver binary. Make sure to use a Chromedriver version that's compatible with the version of Chrome you're using
  --chrome.mobileEmulation.deviceName  Name of device to emulate. Works only standalone (see list in Chrome DevTools, but add phone like 'iPhone 6')
  --chrome.mobileEmulation.width       Width in pixels of emulated mobile screen (e.g. 360)  [number]
  --chrome.mobileEmulation.height      Height in pixels of emulated mobile screen (e.g. 640)  [number]
  --chrome.mobileEmulation.pixelRatio  Pixel ratio of emulated mobile screen (e.g. 2.0)
  --chrome.android.package             Run Chrome on your Android device. Set to com.android.chrome for default Chrome version. You need to run adb start-server before you start.
  --chrome.android.deviceSerial        Choose which device to use. If you do not set it, first device will be used.
  --chrome.collectTracingEvents        Include Tracing events in the performance log (implies chrome.collectPerfLog).  [boolean]
  --chrome.collectCPUMetrics           Collect CPU metrics. You need to have Python installed + collect the devtools.timeline for this to work.  [boolean]
  --chrome.traceCategories             A comma separated list of Tracing event categories to include in the performance log (implies chrome.collectTracingEvents).  [string]
  --chrome.collectPerfLog              Collect performance log from Chrome with Page and Network events and save to disk.  [boolean]
  --chrome.collectNetLog               Collect network log from Chrome and save to disk.  [boolean]
  --chrome.collectConsoleLog           Collect Chromes console log and save to disk.  [boolean]

firefox
  --firefox.binaryPath             Path to custom Firefox binary (e.g. Firefox Nightly). On OS X, the path should be to the binary inside the app bundle, e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin
  --firefox.nightly                Use Firefox Nightly. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --firefox.beta                   Use Firefox Beta. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --firefox.developer              Use Firefox Developer. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --firefox.preference             Extra command line arguments to pass Firefox preferences by the format key:value To add multiple preferences, repeat --firefox.preference once per argument.
  --firefox.includeResponseBodies  Include response bodies in HAR  [boolean]
  --firefox.acceptInsecureCerts    Accept insecure certs  [boolean]

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
  --video                Record a video and store the video. Set it to false to remove the video that is created by turning on speedIndex. Requires FFMpeg to be installed.  [boolean]
  --speedIndex           Calculate SpeedIndex. Requires FFMpeg and python dependencies  [boolean]
  --browser, -b          Specify browser  [choices: "chrome", "firefox"] [default: "chrome"]
  --screenshot           Save one screen shot per iteration.  [boolean]
  --pageCompleteCheck    Supply a Javascript that decides when the browser is finished loading the page and can start to collect metrics. The Javascript snippet is repeatedly queried to see if page has completed loading (indicated by the script returning true). Use it to fetch timings happening after the loadEventEnd.
  --iterations, -n       Number of times to test the url (restarting the browser between each test)  [number] [default: 3]
  --prettyPrint          Enable to print json/har with spaces and indentation. Larger files, but easier on the eye.  [boolean] [default: false]
  --delay                Delay between runs, in milliseconds  [number] [default: 0]
  --requestheader, -r    Request header that will be added to the request. Add multiple instances to add multiple request headers. Use the following format key:value
  --block                Domain to block. Add multiple instances to add multiple domains that will be blocked.
  --cacheClearRaw        Use internal browser functionality to clear browser cache between runs instead of only using Selenium.  [boolean] [default: false]
  --basicAuth            Use it if your server is behind Basic Auth. Format: username@password (Only Chrome at the moment).
  --preScript            Selenium script(s) to run before you test your URL (use it for login, warm the cache, etc). Note that --preScript can be passed multiple times.
  --postScript           Selenium script(s) to run after you test your URL (use it for logout etc). Note that --postScript can be passed multiple times.
  --script               Add custom Javascript to run after the page has finished loading to collect metrics. If a single js file is specified, it will be included in the category named "custom" in the output json. Pass a folder to include all .js scripts in the folder, and have the folder name be the category. Note that --script can be passed multiple times.
  --userAgent            Override user agent
  --silent, -q           Only output info in the logs, not to the console. Enter twice to suppress summary line.  [count]
  --output, -o           Specify file name for Browsertime data (ex: 'browsertime'). Unless specified, file will be named browsertime.json
  --har                  Specify file name for .har file (ex: 'browsertime'). Unless specified, file will be named browsertime.har
  --skipHar              Pass --skipHar to not collect a HAR file.  [boolean]
  --config               Path to JSON config file
  --viewPort             Size of browser window WIDTHxHEIGHT or "maximize". Note that "maximize" is ignored for xvfb.
  --resultDir            Set result directory for the files produced by Browsertime
  --xvfb                 Start xvfb before the browser is started  [boolean] [default: false]
  --xvfbParams.display   The display used for xvfb  [default: 99]
  --preURL               A URL that will be accessed first by the browser before the URL that you wanna analyze. Use it to fill the cache.
  --preURLDelay          Delay between preURL and the URL you want to test (in milliseconds)  [default: 1500]
  --userTimingWhitelist  All userTimings are captured by default this option takes a regex that will whitelist which userTimings to capture in the results.
  --headless             Run the browser in headless mode. Needs Firefox Nightly or latest Chrome.  [boolean] [default: false]
  -h, --help             Show help  [boolean]
  -V, --version          Show version number  [boolean]

