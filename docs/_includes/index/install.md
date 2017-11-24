
#### Docker

Use our [Docker container](https://hub.docker.com/r/sitespeedio/sitespeed.io/) to get an environment with Firefox, Chrome, XVFB and sitespeed.io up and running as fast as you can download them. They work [extremely well]({{site.baseurl}}/documentation/sitespeed.io/performance-dashboard/) together with Graphite/InfluxDB and Grafana.

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/
~~~

#### npm

Install sitespeed.io globally:

~~~bash
npm install -g sitespeed.io
~~~

And then run:

~~~bash
sitespeed.io https://www.sitespeed.io/
~~~

Follow our [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity) to emulate real users connectivity.
