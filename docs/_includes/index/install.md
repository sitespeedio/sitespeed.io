
## Docker

Use our [Docker container](https://hub.docker.com/r/sitespeedio/sitespeed.io/) to get an environment with Firefox, Chrome, XVFB and sitespeed.io up and running as fast as you can download them. They work [extremely well]({{site.baseurl}}/documentation/sitespeed.io/performance-dashboard/) together with Graphite/InfluxDB and Grafana that you can use to monitor your web site.

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt  %} https://www.sitespeed.io/
~~~

If you want to test a user scenario/journey read [how to run test scripts](/documentation/sitespeed.io/scripting/).

## npm

Install sitespeed.io globally:

~~~bash
npm install -g sitespeed.io
~~~

And then run:

~~~bash
sitespeed.io https://www.sitespeed.io/
~~~

Follow our [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity) to emulate real users connectivity.
