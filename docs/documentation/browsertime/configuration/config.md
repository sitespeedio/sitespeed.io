browsertime.js [options] <url>/<scriptFile>

connectivity
  -c, --connectivity.profile  The connectivity profile.  [choices: "4g", "3g", "3gfast", "3gslow", "3gem", "2g", "cable", "native", "custom"] [default: "native"]
      --connectivity.engine   The engine for connectivity. Throttle works on Mac and tc based Linux. For mobile you can use Humble if you have a Humble setup. Use external if you set the connectivity outside of Browsertime. The best way do to this is described in https://github.com/sitespeedio/browsertime#connectivity.  [choices: "external", "throttle", "humble"] [default: "external"]

Options:
      --cpu                 Easy way to enable both chrome.timeline for Chrome and geckoProfile for Firefox  [boolean]
      --video               Record a video and store the video. Set it to false to remove the video that is created by turning on visualMetrics. To remove fully turn off video recordings, make sure to set video and visualMetrics to false. Requires FFMpeg to be installed.  [boolean]
      --visualMetrics       Collect Visual Metrics like First Visual Change, SpeedIndex, Perceptual Speed Index and Last Visual Change. Requires FFMpeg and Python dependencies  [boolean]
  -b, --browser             Specify browser. Safari only works on OS X/iOS. Edge only work on OS that supports Edge.  [choices: "chrome", "firefox", "edge", "safari"] [default: "chrome"]
  -n, --iterations          Number of times to test the url (restarting the browser between each test)  [number] [default: 3]
      --config              Path to JSON config file. You can also use a .browsertime.json file that will automatically be found by Browsertime using find-up.
      --resultDir           Set result directory for the files produced by Browsertime
      --preURL, --warmLoad  A URL that will be accessed first by the browser before the URL that you wanna analyze. Use it to fill the browser cache.
      --headless            Run the browser in headless mode. Works for Firefox and Chrome.  [boolean] [default: false]
  -h, --help                Show help  [boolean]
  -V, --version             Show version number  [boolean]

Topics (use `browsertime --help <topic>`):
  timeouts, chrome, android, firefox, selenium, video, edge, safari, screenshot, pageload, proxy, connectivity, debug

Run with --help-all to see every option, or read the docs at https://www.sitespeed.io/documentation/browsertime/
