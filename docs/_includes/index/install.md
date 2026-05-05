
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

You can throttle the connection ([connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity)) or run the test on a [real Android phone]({{site.baseurl}}/documentation/sitespeed.io/mobile-phones/):

~~~bash
sitespeed.io https://www.sitespeed.io/ -b chrome --android
~~~
