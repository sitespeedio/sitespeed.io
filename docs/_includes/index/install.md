
## Docker

The easiest way to run sitespeed.io is in our [Docker container](https://hub.docker.com/r/sitespeedio/sitespeed.io/) — it ships with Firefox, Chrome, Edge and XVFB pre-installed. Test a single URL:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt  %} https://www.sitespeed.io/
~~~

Want to test a user journey instead? Read [how to write a script](/documentation/sitespeed.io/scripting/). And if you're new to the project, watch ["Getting started with Sitespeed.io using Docker"](https://www.youtube.com/watch?v=0xAdxCUX2Po) — it walks through the basics in a few minutes.

## npm

Or install globally from npm:

~~~bash
npm install -g sitespeed.io
~~~

Make sure you have the browser you want installed (Firefox / Chrome / Edge / Safari), then:

~~~bash
sitespeed.io https://www.sitespeed.io/ -b chrome
~~~

When you're debugging a single slow page and want the fullest report, this is the command I reach for. It enables the CPU main-thread timeline (`--cpu`), records a video with visual metrics (`--video --visualMetrics`), throttles the connection to a 4G profile (`-c 4g`) and adds a dedicated profiling run (`--enableProfileRun`) so the trace overhead stays out of your measured metrics. `-o` opens the HTML report in your browser when the run finishes:

~~~bash
sitespeed.io https://www.sitespeed.io/ --cpu --enableProfileRun --video --visualMetrics -o -c 4g
~~~

Not sure which flags matter? See [good options to get started](/documentation/sitespeed.io/configuration/#good-options-to-get-started) for the handful you'll actually use, with an explanation of each.

You can throttle the connection ([connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity)) or run the test on a [real Android phone]({{site.baseurl}}/documentation/sitespeed.io/mobile-phones/):

~~~bash
sitespeed.io https://www.sitespeed.io/ -b chrome --android
~~~

You can also test on Safari on iOS:

~~~bash
brew install ios-webkit-debug-proxy
brew install ffmpeg
sitespeed.io -b safari --safari.ios --video --visualMetrics https://www.sitespeed.io/
~~~

See the [mobile-phones guide]({{site.baseurl}}/documentation/sitespeed.io/mobile-phones/#test-on-ios) for the full setup.
