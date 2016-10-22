## Docker to the rescue!
* * *
Use our [Docker containers](https://hub.docker.com/u/sitespeedio/) to get an environment with Firefox, Chrome, XVFB and sitespeed.io up and running as fast as you can download them.

~~~ bash
$ docker pull sitespeedio/sitespeed.io
$ docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/ -b firefox
~~~
