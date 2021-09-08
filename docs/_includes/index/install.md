
## Docker

Use our [Docker container](https://hub.docker.com/r/sitespeedio/sitespeed.io/) to get an environment with Firefox, Chrome, Edge,  XVFB and sitespeed.io up and running as fast as you can download them. They work [extremely well]({{site.baseurl}}/documentation/sitespeed.io/performance-dashboard/) together with Graphite/InfluxDB and Grafana that you can use to monitor your web site.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt  %} https://www.sitespeed.io/
~~~

If you want to test a user scenario/journey read [how to run test scripts](/documentation/sitespeed.io/scripting/).

If you are new to the project you should watch the tutorial ["Getting started with Sitespeed.io using Docker"](https://www.youtube.com/watch?v=0xAdxCUX2Po).

## npm

Install sitespeed.io globally:

~~~bash
npm install -g sitespeed.io
~~~

Make sure you have the browser you want to use for testing installed (Firefox/Chrome/Edge/Safari) and then run:

~~~bash
sitespeed.io https://www.sitespeed.io/ -b chrome
~~~

Follow our [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity) to emulate real users connectivity.

Want to [run the test on your Android phone]({{site.baseurl}}/documentation/sitespeed.io/mobile-phones/)?

~~~bash
sitespeed.io https://www.sitespeed.io/ -b chrome --android
~~~