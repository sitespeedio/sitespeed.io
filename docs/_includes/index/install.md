Use our [Docker container](https://hub.docker.com/r/sitespeedio/sitespeed.io/) to get an environment with Firefox, Chrome, XVFB and sitespeed.io up and running as fast as you can download them.

**Docker**

~~~ bash
$ docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/
~~~

**npm**

~~~ bash
$ npm install -g sitespeed.io
$ sitespeed.io -h
~~~

Follow our [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity) when to emulate real users connectivity.
