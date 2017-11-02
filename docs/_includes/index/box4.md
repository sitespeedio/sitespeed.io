## Docker makes it easy!
* * *
Use our [Docker container](https://hub.docker.com/r/sitespeedio/sitespeed.io/) to get an environment with Firefox, Chrome, XVFB and sitespeed.io up and running as fast as you can download them.

~~~bash
docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/ -b firefox
~~~

To set the connectivity follow our [connectivity guide]({{site.baseurl}}/documentation/sitespeed.io/connectivity) for Docker.
