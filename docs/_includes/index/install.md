Use our [Docker container](https://hub.docker.com/r/sitespeedio/sitespeed.io/) to get an environment with Firefox, Chrome, XVFB and sitespeed.io up and running as fast as you can download them.

**Docker**

~~~bash
docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/
~~~

**npm**

Install sitespeed.io globally:

~~~bash
npm install -g sitespeed.io
~~~

And then run help to see what you can do:

~~~bash
sitespeed.io --help
~~~

Follow our [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity) when to emulate real users connectivity.
