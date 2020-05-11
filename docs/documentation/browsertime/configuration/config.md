browsertime.js [options] <url>/<scriptFile>

timeouts
  --timeouts.browserStart       Timeout when waiting for browser to start, in milliseconds  [number] [default: 60000]
  --timeouts.pageLoad           Timeout when waiting for url to load, in milliseconds  [number] [default: 300000]
  --timeouts.script             Timeout when running browser scripts, in milliseconds  [number] [default: 120000]
  --timeouts.pageCompleteCheck  Timeout when waiting for page to complete loading, in milliseconds  [number] [default: 300000]

chrome
  --chrome.args                                              Extra command line arguments to pass to the Chrome process (e.g. --no-sandbox). To add multiple arguments to Chrome, repeat --chrome.args once per argument.
  --chrome.binaryPath                                        Path to custom Chrome binary (e.g. Chrome Canary). On OS X, the path should be to the binary inside the app bundle, e.g. "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
  --chrome.chromedriverPath                                  Path to custom ChromeDriver binary. Make sure to use a ChromeDriver version that's compatible with the version of Chrome you're using
  --chrome.mobileEmulation.deviceName                        Name of device to emulate. Works only standalone (see list in Chrome DevTools, but add phone like 'iPhone 6'). This will override your userAgent string.
  --chrome.mobileEmulation.width                             Width in pixels of emulated mobile screen (e.g. 360)  [number]
  --chrome.mobileEmulation.height                            Height in pixels of emulated mobile screen (e.g. 640)  [number]
  --chrome.mobileEmulation.pixelRatio                        Pixel ratio of emulated mobile screen (e.g. 2.0)
  --chrome.android.package                                   Run Chrome on your Android device. Set to com.android.chrome for default Chrome version. You need to have adb installed to make this work.
  --chrome.android.activity                                  Name of the Activity hosting the WebView.
  --chrome.android.process                                   Process name of the Activity hosting the WebView. If not given, the process name is assumed to be the same as chrome.android.package.
  --chrome.android.deviceSerial                              Choose which device to use. If you do not set it, first device will be used.
  --chrome.traceCategories                                   A comma separated list of Tracing event categories to include in the Trace log. Default no trace categories is collected.  [string]
  --chrome.traceCategory                                     Add a trace category to the default ones. Use --chrome.traceCategory multiple times if you want to add multiple categories. Example: --chrome.traceCategory disabled-by-default-v8.cpu_profiler  [string]
  --chrome.enableTraceScreenshots, --enableTraceScreenshots  Include screenshots in the trace log (enabling the trace category disabled-by-default-devtools.screenshot).  [boolean]
  --chrome.enableChromeDriverLog                             Log Chromedriver communication to a log file.  [boolean]
  --chrome.enableVerboseChromeDriverLog                      Log verboose Chromedriver communication to a log file.  [boolean]
  --chrome.visualMetricsUsingTrace                           Collect Visual Metrics using Chrome trace log. You need enable trace screenshots --chrome.enableTraceScreenshots and --cpu metrics for this to work.  [boolean] [default: false]
  --chrome.timeline                                          Collect the timeline data. Drag and drop the JSON in your Chrome detvools timeline panel or check out the CPU metrics in the Browsertime.json  [boolean]
  --chrome.collectPerfLog                                    Collect performance log from Chrome with Page and Network events and save to disk.  [boolean]
  --chrome.collectNetLog                                     Collect network log from Chrome and save to disk.  [boolean]
  --chrome.collectConsoleLog                                 Collect Chromes console log and save to disk.  [boolean]
  --chrome.collectLongTasks                                  Collect CPU long tasks, using the Long Task API  [boolean]
  --chrome.CPUThrottlingRate                                 Enables CPU throttling to emulate slow CPUs. Throttling rate as a slowdown factor (1 is no throttle, 2 is 2x slowdown, etc)  [number]
  --chrome.includeResponseBodies                             Include response bodies in the HAR file.  [choices: "none", "all", "html"] [default: "none"]
  --chrome.cdp.performance                                   Collect Chrome perfromance metrics from Chrome DevTools Protocol  [boolean] [default: true]
  --chrome.blockDomainsExcept, --blockDomainsExcept          Block all domains except this domain. Use it multiple time to keep multiple domains. You can also wildcard domains like *.sitespeed.io. Use this when you wanna block out all third parties.
  --chrome.ignoreCertificateErrors                           Make Chrome ignore certificate errors.  Defaults to true.  [boolean] [default: true]

firefox
  --firefox.binaryPath                      Path to custom Firefox binary (e.g. Firefox Nightly). On OS X, the path should be to the binary inside the app bundle, e.g. /Applications/Firefox.app/Contents/MacOS/firefox-bin
  --firefox.geckodriverPath                 Path to custom geckodriver binary. Make sure to use a geckodriver version that's compatible with the version of Firefox (Gecko) you're using
  --firefox.nightly                         Use Firefox Nightly. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --firefox.beta                            Use Firefox Beta. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --firefox.developer                       Use Firefox Developer. Works on OS X. For Linux you need to set the binary path.  [boolean]
  --firefox.preference                      Extra command line arguments to pass Firefox preferences by the format key:value To add multiple preferences, repeat --firefox.preference once per argument.
  --firefox.args                            Extra command line arguments to pass to the Firefox process (e.g. --MOZ_LOG). To add multiple arguments to Firefox, repeat --firefox.args once per argument.
  --firefox.includeResponseBodies           Include response bodies in HAR  [choices: "none", "all", "html"] [default: "none"]
  --firefox.appconstants                    Include Firefox AppConstants information in the results  [boolean] [default: false]
  --firefox.acceptInsecureCerts             Accept insecure certs  [boolean]
  --firefox.windowRecorder                  Use the internal compositor-based Firefox window recorder to emit PNG files for each frame that is a meaningful change.  The PNG output will further be merged into a variable frame rate video for analysis. Use this instead of ffmpeg to record a video (you still need the --video flag).  [boolean] [default: false]
  --firefox.geckoProfiler                   Collect a profile using the internal gecko profiler  [boolean] [default: false]
  --firefox.geckoProfilerParams.features    Enabled features during gecko profiling  [string] [default: "js,stackwalk,leaf"]
  --firefox.geckoProfilerParams.threads     Threads to profile.  [string] [default: "GeckoMain,Compositor,Renderer"]
  --firefox.geckoProfilerParams.interval    Sampling interval in ms.  Defaults to 1 on desktop, and 4 on android.  [number]
  --firefox.geckoProfilerParams.bufferSize  Buffer size in elements. Default is ~90MB.  [number] [default: 1000000]
  --firefox.collectMozLog                   Collect the MOZ HTTP log  [boolean]
  --firefox.disableBrowsertimeExtension     Disable installing the browsertime extension.  [boolean]
  --firefox.disableSafeBrowsing             Disable safebrowsing.  [boolean] [default: true]
  --firefox.disableTrackingProtection       Disable Tracking Protection.  [boolean] [default: true]
  --firefox.android.package                 Run Firefox or a GeckoView-consuming App on your Android device. Set to org.mozilla.geckoview_example for default Firefox version. You need to have adb installed to make this work.
  --firefox.android.activity                Name of the Activity hosting the GeckoView.
  --firefox.android.deviceSerial            Choose which device to use. If you do not set it, first device will be used.
  --firefox.android.intentArgument          Configure how the Android intent is launched.  Passed through to `adb shell am start ...`; follow the format at https://developer.android.com/studio/command-line/adb#IntentSpec. To add multiple arguments, repeat --firefox.android.intentArgument once per argument.
  --firefox.profileTemplate                 Profile template directory that will be cloned and used as the base of each profile each instance of Firefox is launched against.  Use this to pre-populate databases with certificates, tracking protection lists, etc.

selenium
  --selenium.url  URL to a running Selenium server (e.g. to run a browser on another machine).

video
  --videoParams.framerate          Frames per second  [default: 30]
  --videoParams.crf                Constant rate factor see https://trac.ffmpeg.org/wiki/Encode/H.264#crf  [default: 23]
  --videoParams.addTimer           Add timer and metrics to the video.  [boolean] [default: true]
  --videoParams.debug              Turn on debug to record a video with all pre/post and scripts/URLS you test in one iteration. Visual Metrics will then automatically be disabled.  [boolean] [default: false]
  --videoParams.keepOriginalVideo  Keep the original video. Use it when you have a Visual Metrics bug and want to create an issue at GitHub  [boolean] [default: false]
  --videoParams.filmstripFullSize  Keep original sized screenshots. Will make the run take longer time  [boolean] [default: false]
  --videoParams.filmstripQuality   The quality of the filmstrip screenshots. 0-100.  [default: 75]
  --videoParams.createFilmstrip    Create filmstrip screenshots.  [boolean] [default: true]
  --videoParams.nice               Use nice when running FFMPEG during the run. A value from -20 to 19  https://linux.die.net/man/1/nice  [default: 0]

edge
  --edge.edgedriverPath  To run Edge you need to supply the path to the msedgedriver that match your Egde version.

safari
  --safari.ios           Use Safari on iOS. You need to choose browser Safari and iOS to run on iOS.  [boolean] [default: false]
  --safari.deviceName    Set the device name. Device names for connected devices are shown in iTunes.
  --safari.deviceUDID    Set the device UDID. If Xcode is installed, UDIDs for connected devices are available via the output of instruments(1) and in the Device and Simulators window (accessed in Xcode via "Window > Devices and Simulators")
  --safari.deviceType    Set the device type. If the value of safari:deviceType is `iPhone`, safaridriver will only create a session using an iPhone device or iPhone simulator. If the value of safari:deviceType is `iPad`, safaridriver will only create a session using an iPad device or iPad simulator.
  --safari.diagnose      When filing a bug report against safaridriver, it is highly recommended that you capture and include diagnostics generated by safaridriver. Diagnostic files are saved to ~/Library/Logs/com.apple.WebDriver/
  --safari.useSimulator  If the value of useSimulator is true, safaridriver will only use iOS Simulator hosts. If the value of safari:useSimulator is false, safaridriver will not use iOS Simulator hosts. NOTE: An Xcode installation is required in order to run WebDriver tests on iOS Simulator hosts.  [boolean] [default: false]

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
  --connectivity.profile, -c                          The connectivity profile.  [choices: "4g", "3g", "3gfast", "3gslow", "3gem", "2g", "cable", "native", "custom"] [default: "native"]
  --connectivity.down, --connectivity.downstreamKbps  This option requires --connectivity.profile be set to "custom".
  --connectivity.up, --connectivity.upstreamKbps      This option requires --connectivity.profile be set to "custom".
  --connectivity.rtt, --connectivity.latency          This option requires --connectivity.profile be set to "custom".
  --connectivity.variance                             This option requires --connectivity.engine be set to "throttle". It will add a variance to the rtt between each run. --connectivity.variance 2 means it will run with a random variance of max 2% between runs.
  --connectivity.alias                                Give your connectivity profile a custom name
  --connectivity.engine                               The engine for connectivity. Throttle works on Mac and tc based Linux. Use external if you set the connectivity outside of Browsertime. The best way do to this is described in https://github.com/sitespeedio/browsertime#connectivity.  [choices: "external", "throttle", "tsproxy"] [default: "external"]
  --connectivity.throttle.localhost                   Add latency/delay on localhost. Perfect for testing with WebPageReplay  [boolean] [default: false]

Options:
  --cpu                                         Easy way to enable both chrome.timeline and CPU long tasks for Chrome and geckoProfile for Firefox  [boolean]
  --video                                       Record a video and store the video. Set it to false to remove the video that is created by turning on visualMetrics. To remove fully turn off video recordings, make sure to set video and visualMetrics to false. Requires FFMpeg to be installed.  [boolean]
  --visualMetrics                               Collect Visual Metrics like First Visual Change, SpeedIndex, Perceptual Speed Index and Last Visual Change. Requires FFMpeg and Python dependencies  [boolean]
  --visualElements, --visuaElements             Collect Visual Metrics from elements. Works only with --visualMetrics turned on. By default you will get visual metrics from the largest image within the view port and the largest h1. You can also configure to pickup your own defined elements with --scriptInput.visualElements  [boolean]
  --scriptInput.visualElements                  Include specific elements in visual elements. Give the element a name and select it with document.body.querySelector. Use like this: --scriptInput.visualElements name:domSelector see https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors. Add multiple instances to measure multiple elements. Visual Metrics will use these elements and calculate when they are visible and fully rendered.
  --scriptInput.longTask, --minLongTaskLength   Set the minimum length of a task to be categorised as a CPU Long Task. It can never be smaller than 50. The value is in ms and you make Browsertime collect long tasks using --chrome.collectLongTasks or --cpu.  [number] [default: 50]
  --browser, -b                                 Specify browser. Safari only works on OS X/iOS. Edge only work on OS that supports Edge.  [choices: "chrome", "firefox", "edge", "safari"] [default: "chrome"]
  --android                                     Short key to use Android. Defaults to use com.android.chrome unless --browser is specified.  [boolean] [default: false]
  --androidRooted                               If your phone is rooted you can use this to set it up following Mozillas best practice for stable metrics.  [boolean] [default: false]
  --androidBatteryTemperatureLimit              Do the battery temperature need to be below a specific limit before we start the test?
  --androidBatteryTemperatureWaitTimeInSeconds  How long time to wait (in seconds) if the androidBatteryTemperatureWaitTimeInSeconds is not met before the next try  [default: 120]
  --processStartTime                            Capture browser process start time (in milliseconds). Android only for now.  [boolean] [default: false]
  --pageCompleteCheck                           Supply a JavaScript (inline or JavaScript file) that decides when the browser is finished loading the page and can start to collect metrics. The JavaScript snippet is repeatedly queried to see if page has completed loading (indicated by the script returning true). Use it to fetch timings happening after the loadEventEnd. By default the tests ends 2 seconds after loadEventEnd. Also checkout --pageCompleteCheckInactivity and --pageCompleteCheckPollTimeout
  --pageCompleteWaitTime                        How long time you want to wait for your pageComplteteCheck to finish, after it is signaled to closed. Extra parameter passed on to your pageCompleteCheck.  [default: 5000]
  --pageCompleteCheckInactivity                 Alternative way to choose when to end your test. This will wait for 2 seconds of inactivity that happens after loadEventEnd.  [boolean] [default: false]
  --pageCompleteCheckPollTimeout                The time in ms to wait for running the page complete check the next time.  [number] [default: 1500]
  --pageCompleteCheckStartWait                  The time in ms to wait for running the page complete check for the first time. Use this when you have a pageLoadStrategy set to none  [number] [default: 5000]
  --pageLoadStrategy                            Set the strategy to waiting for document readiness after a navigation event. After the strategy is ready, your pageCompleteCheck will start runninhg.  [string] [choices: "eager", "none", "normal"] [default: "none"]
  --iterations, -n                              Number of times to test the url (restarting the browser between each test)  [number] [default: 3]
  --prettyPrint                                 Enable to print json/har with spaces and indentation. Larger files, but easier on the eye.  [boolean] [default: false]
  --delay                                       Delay between runs, in milliseconds  [number] [default: 0]
  --timeToSettle                                Extra time added for the browser to settle before starting to test a URL. This delay happens after the browser was opened and before the navigation to the URL  [number] [default: 0]
  --requestheader, -r                           Request header that will be added to the request. Add multiple instances to add multiple request headers. Works for Firefox and Chrome. Use the following format key:value
  --cookie                                      Cookie that will be added to the request. Add multiple instances to add multiple request cookies. Works for Firefox and Chrome. Use the following format cookieName=cookieValue
  --injectJs                                    Inject JavaScript into the current page at document_start. Works for Firefox and Chrome. More info: https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/contentScripts
  --block                                       Domain to block. Add multiple instances to add multiple domains that will be blocked. If you use Chrome you can also use --blockDomainsExcept (that is more performant). Works for Firefox and Chrome.
  --percentiles                                 The percentile values within the data browsertime will calculate and report.  [array] [default: [0,10,90,99,100]]
  --decimals                                    The decimal points browsertime statistics round to.  [number] [default: 0]
  --iqr                                         Use IQR, or Inter Quartile Range filtering filters data based on the spread of the data. See  https://en.wikipedia.org/wiki/Interquartile_range. In some cases, IQR filtering may not filter out anything. This can happen if the acceptable range is wider than the bounds of your dataset.  [boolean] [default: false]
  --cacheClearRaw                               Use internal browser functionality to clear browser cache between runs instead of only using Selenium.  [boolean] [default: false]
  --basicAuth                                   Use it if your server is behind Basic Auth. Format: username@password (Only Chrome and Firefox at the moment).
  --preScript, --setUp                          Selenium script(s) to run before you test your URL/script. They will run outside of the analyse phase. Note that --preScript can be passed multiple times.
  --postScript, --tearDown                      Selenium script(s) to run after you test your URL. They will run outside of the analyse phase. Note that --postScript can be passed multiple times.
  --script                                      Add custom Javascript to run after the page has finished loading to collect metrics. If a single js file is specified, it will be included in the category named "custom" in the output json. Pass a folder to include all .js scripts in the folder, and have the folder name be the category. Note that --script can be passed multiple times.
  --userAgent                                   Override user agent
  --silent, -q                                  Only output info in the logs, not to the console. Enter twice to suppress summary line.  [count]
  --output, -o                                  Specify file name for Browsertime data (ex: 'browsertime'). Unless specified, file will be named browsertime.json
  --har                                         Specify file name for .har file (ex: 'browsertime'). Unless specified, file will be named browsertime.har
  --skipHar                                     Pass --skipHar to not collect a HAR file.  [boolean]
  --gzipHar                                     Pass --gzipHar to gzip the HAR file  [boolean]
  --config                                      Path to JSON config file. You can also use a .browsertime.json file that will automatically be found by Browsertime using find-up.
  --viewPort                                    Size of browser window WIDTHxHEIGHT or "maximize". Note that "maximize" is ignored for xvfb.
  --resultDir                                   Set result directory for the files produced by Browsertime
  --useSameDir                                  Store all files in the same structure and do not use the path structure released in 4.0. Use this only if you are testing ONE URL.
  --xvfb                                        Start xvfb before the browser is started  [boolean] [default: false]
  --xvfbParams.display                          The display used for xvfb  [default: 99]
  --tcpdump                                     Collect a tcpdump for each tested URL.  [boolean] [default: false]
  --tcpdumpPacketBuffered                       Use together with --tcpdump to save each packet directly to the file, instead of buffering.  [boolean] [default: false]
  --preURL                                      A URL that will be accessed first by the browser before the URL that you wanna analyze. Use it to fill the cache.
  --preURLDelay                                 Delay between preURL and the URL you want to test (in milliseconds)  [default: 1500]
  --userTimingWhitelist                         All userTimings are captured by default this option takes a regex that will whitelist which userTimings to capture in the results.
  --headless                                    Run the browser in headless mode. Works for Firefox and Chrome.  [boolean] [default: false]
  --extension                                   Path to a WebExtension to be installed in the browser. Note that --extension can be passed multiple times.
  --spa                                         Convenient parameter to use if you test a SPA application: will automatically waity for X seconds after last network activity and use hash in file names. Read more: https://www.sitespeed.io/documentation/sitespeed.io/spa/  [boolean] [default: false]
  -h, --help                                    Show help  [boolean]
  -V, --version                                 Show version number  [boolean]
