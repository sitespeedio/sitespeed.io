---
layout: default
title: Continuously run your tests
description: Example how you can setup your tests to continuously run and monitor your web sites.
keywords: dashboard, monitor, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Continuously run your tests.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Continuously run your tests

# Continuously run your tests
{:.no_toc}

We have an example setup that we use to collect metrics for [dashboard.sitespeed.io](https://dashboard.sitespeed.io) that you can use as inspiration. Or you can just run your test in the crontab or as a infinite loop on your server. In our example we use the Dockerized version of sitespeed.io. You can use Docker or you can run sitespeed.io standalone for more control.

* Let's place the TOC here
{:toc}


## Configuration in Git (our example setup)
We have an example setup that we use to collect the metrics for [dashboard.sitespeed.io](https://dashboard.sitespeed.io) that you can use as a start point. You need a server running Linux and install Docker and Git. We have all our configuration in Git so it is version controlled.

You can checkout our setup at [https://github.com/sitespeedio/dashboard.sitespeed.io](https://github.com/sitespeedio/dashboard.sitespeed.io).

It works like this: You fork our repo (or copy what you need into your own repo) and edit URLs/script file, choosing what URLs and what tests you wanna run.

You go to your server, clone the repo, start the start script by pointing out which group of tests you want to run (each server have their own base folder). The start script will do a `git pull` for each iteration to get the latest updated versions of the URLs/scripts you wanna run. And then it runs all your tests, using the configuration files you have in /config/.

The script creates a file called **sitespeed.run** in your current folder. If you gracefully want to stop your tests, remove that file `rm sitespeed.run` and wait for the tests to finish (`tail -f /tmp/sitespeed.io.log`).

Do you want to add a new URL to test on desktop? Navigate to [**desktop**](https://github.com/sitespeedio/dashboard.sitespeed.io/tree/main/tests/desktop) and create your new file there. Want to add a user journey? Add the script in the same place and name them *.js*.

Our example run tests for [desktop](https://github.com/sitespeedio/dashboard.sitespeed.io/tree/main/tests/desktop)and [emulated mobile](https://github.com/sitespeedio/dashboard.sitespeed.io/tree/main/tests/emulatedMobile) (both URLs and scripts).

The structure looks like this:

```
.
├── config
│   ├── alexaDesktop.json
│   ├── alexaMobile.json
│   ├── crux.json
│   ├── desktop.json
│   ├── desktopMulti.json
│   ├── emulatedMobile.json
│   ├── emulatedMobileMulti.json
│   ├── loginWikipedia.json
│   ├── news.json
│   ├── replay.json
│   └── spa.json
├── loop.sh
├── run.sh
└── tests
    ├── desktop
    │   ├── alexaDesktop.txt
    │   ├── crux.txt
    │   ├── desktop.txt
    │   ├── desktopMulti.js
    │   ├── loginWikipedia.js
    │   ├── news.txt
    │   ├── replay.replay
    │   └── spa.js
    └── emulatedMobile
        ├── alexaMobile.txt
        ├── emulatedMobile.txt
        └── emulatedMobileMulti.js
```

The [**loop.sh**](https://github.com/sitespeedio/dashboard.sitespeed.io/blob/main/loop.sh) is the start point. Run it. That script will git pull the rep for every iteration and run the script [**run.sh**](https://github.com/sitespeedio/dashboard.sitespeed.io/blob/main/run.sh).

Then [**run.sh**](https://github.com/sitespeedio/dashboard.sitespeed.io/blob/main/run.sh) will use the right configuration in [**/config/**](https://github.com/sitespeedio/dashboard.sitespeed.io/tree/main/config) and run the URLs/scripts that are configured. Our configuration files extends configuration files that only exits on the server where we hold secret information like username and passwords. You don't need set it up that way, if you use a private git repo.

### What you need to do
You need to modify our tests and scripts so that you don't test the exact same URLs as us :)

#### Configuration
In our example we have two configuration files on the server that we extends. These configuration files holds the secrets that we don't want to expose on our public GitHub repo. In our example it they look like this:

**/conf/secrets.json**
```json
{
  "graphite": {
    "host": "OUR_HOST",
    "auth": "THE_AUTH",
    "annotationScreenshot": true
  },
  "slack": {
    "hookUrl": "https://hooks.slack.com/services/THE/SECRET/S"
  },
  "resultBaseURL": "https://s3.amazonaws.com/results.sitespeed.io",
  "s3": {
    "key": "S3_KEY",
    "secret": "S3_SECRET",
    "bucketname": "BUCKET_NAME",
    "removeLocalResult": true
  }
}
```

**/conf/webpagetest-secrets.json**
```json
{
  "extends": "/config/secrets.json",
  "influxdb": {
    "host": "OUR_HOST",
    "database": "DATABASE",
    "username": "USER",
    "password": "PASSWORD"
  },
  "webpagetest": {
    "timeline": true,
    "key": "WPT_KEY"
  }
}
```

Then our configuration files in [**/config/**](https://github.com/sitespeedio/dashboard.sitespeed.io/tree/main/config) extends these config files. They look something like this:

```json
{
  "extends": "/config/secrets.json",
  ...
}
```

And when we run our tests, we map the volume on the server /config to our docker container. You can see that in the [run.sh](https://github.com/sitespeedio/dashboard.sitespeed.io/blob/main/run.sh) file. Look for `-v /config:/config`. That is the magic line.


We then also map the current working dir to `-v "$(pwd):/sitespeed.io"` and then feed the the config file to sitespeed `--config /sitespeed.io/config`. That way, inside the Docker container we have **/config/** that has the secret configuration files and in **/sitespeed.io/config** the configuration we want to use for our tests.


#### Change the tests
Stop! Before you move on you need to change the tests you wanna run. Our current test structure looks like this:

```
└── tests
    ├── desktop
    │   ├── alexaDesktop.txt
    │   ├── crux.txt
    │   ├── desktop.txt
    │   ├── desktopMulti.js
    │   ├── loginWikipedia.js
    │   ├── news.txt
    │   ├── replay.replay
    │   └── spa.js
    └── emulatedMobile
        ├── alexaMobile.txt
        ├── emulatedMobile.txt
        └── emulatedMobileMulti.js
```

Adding a file text in the desktop folder with URLS will test those URLs. If you add a scripting file (ending with *.js*) a user journey will be tested. 

All tests needs to have a corresponding configuration file. Say that you have a test file named *alexaMobile.txt*. You then need to have a *alexaMobile.json* configuration file in the *config/* directory for the test to work.
#### Change how you test

The most important thing is to change so you run the latest stable version of sitespeed.io. In our test environment we run the latest build (to make sure we catch bug/regressions before we release them). It looks like this:

```bash
DOCKER_CONTAINER=sitespeedio/sitespeed.io-autobuild:latest
```

YOU NEED TO CHANGE THAT! Your version should look like:

```bash
DOCKER_CONTAINER=sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}
```

That way you have a safe and easy way to upgrade and roll back versions of sitespeed.io. When a new sitespeed.io version is released, you edit the file and change the version number. The next iteration of the loop the change will be picked up.

In our tests we run all URL tests on Chrome and Firefox, tests the scripts in Chrome and run URL and scripts on emulated mobile using Chrome.

We run all these tests because we use it to verify that all the functionality is working on our side. You probably don't need to run all these tests. Then you can just remove those lines in **run.sh**.

### Run

Go into the directory that where you cloned the directory: `cd dashboard.sitespeed.io`
And then start: `nohup ./loop.sh &`

To verify that everything works you should tail the log: `tail -f /tmp/sitespeed.io`

### Run on Mac

If you run on Mac you should use `screen` instead of *nohup*. First open a new screen instance: `screen`. Then start your tests `./loop.sh`.  And then detach your screen `ctrl+A and then press D`. To resume back to the screen use `screen -x`.

### Stop your tests

Starting your test creates a file named **sitespeed.run** in your current folder. The script on the server will continue to run forever until you remove the control file:
`rm sitespeed.run`

The script will then stop when it has finished the current run(s). Wait for it to stop by looking at the log: `tail -f /tmp/sitespeed.io`.

### Start on reboot
Sometimes your cloud server reboots. To make sure it auto start your tests, you can add it to the crontab. Edit the crontab with `crontab -e` and add (make sure to change the path to your installation):

```bash
@reboot rm /root/dashboard.sitespeed.io/sitespeed.run;cd /root/dashboard.sitespeed.io/ && ./loop.sh 
```

### Keeping your instance updated
We constantly do new Docker releases: bug fixes, new functionality and new versions of the browser. To keep your instance updated, follow the following work flow.

Update your **run.sh** file so it uses the new version ({% include version/sitespeed.io.txt %} in this case). The next iteration of the loop, it will use the new version.

If you test many URLs you may wanna shorten the wait time. Log into the server and stop your tests by removing the **sitespeed.run** file. Wait until the tests stops and then restart.

Go into the Grafana dashboard and create a new annotation, telling your team mates that you updated to the new version. This is real important so you can keep track of browser updates and other changes that can affect your metrics.

## Crontab
If you for some reason don't want to follow our example setup you can choose to run the tests in the crontab of your server.

Using the crontab (on a standalone server) you do like this:
<code>crontab -e</code> to edit the crontab. Make sure your cron user can run Docker.

You can have a script *crontab.sh* file:

### Shell script
~~~shell
#!/bin/bash
# Specify the exact version of sitespeed.io. When you upgrade to the next version, pull it down and the change the tag
DOCKER_CONTAINER=sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}

# Simplify some configurations
CONFIG="--config /sitespeed.io/default.json"
DOCKER_SETUP="--shm-size=1g --rm -v /home/ubuntu/config:/sitespeed.io -v /result:/result -v /etc/localtime:/etc/localtime:ro --name sitespeed"

# Make sure we can throttle the connection
sudo modprobe ifb numifbs=1

# Start running the tests
# We run more tests on our test server but this gives you an idea of how you can configure it
docker run $DOCKER_SETUP $DOCKER_CONTAINER -n 11 --browsertime.viewPort 1920x1080 /sitespeed.io/wikipedia.org.txt $CONFIG
docker run $DOCKER_SETUP $DOCKER_CONTAINER -n 11 --browsertime.viewPort 1920x1080 /sitespeed.io/wikipedia.org.txt -b firefox $CONFIG
docker run $DOCKER_SETUP $DOCKER_CONTAINER --graphite.namespace sitespeed_io.emulatedMobile --cpu /sitespeed.io/m.wikipedia.org.txt -c 3g --connectivity.engine throttle --mobile true $CONFIG

# We remove all docker stuff to get a clean next run
docker system prune --all --volumes -f

# Get the container so we have it the next time we wanna use it
docker pull $DOCKER_CONTAINER
~~~

### Edit the crontab
Then you can trigger the script from the crontab. In this example we run every hour but it depends on how many tests you run. `crontab -e`.

~~~shell
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
0 * * * * /root/crontab.sh >> /tmp/sitespeed.io.log 2>&1
~~~

## Infinite loop
Another way is to just run the script in an infinite loop and then have a file that you remove (so the run stops) when you want to update your instance. This example script is on Ubuntu.

~~~shell
#!/bin/bash
LOGFILE=/tmp/s.log
exec > $LOGFILE 2>&1
CONTROL_FILE=/home/ubuntu/sitespeed.run

if [ -f "$CONTROL_FILE" ]
then
  echo "$CONTROL_FILE exist, do you have running tests?"
  exit 1;
else
  touch $CONTROL_FILE
fi

DOCKER_CONTAINER=sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}

function cleanup() {
  docker system prune --all --volumes -f
}

function control() {
  if [ -f "$CONTROL_FILE" ]
  then
    echo "$CONTROL_FILE found. Make another run ..."
  else
    echo "$CONTROL_FILE not found - stopping after cleaning up ..."
    cleanup
    echo "Exit"
    exit 0;
  fi
}

while true
do

  DOCKER_SETUP="--shm-size=1g --rm -v /home/ubuntu/config:/sitespeed.io -v /result:/result -v /etc/localtime:/etc/localtime:ro "
  CONFIG="--config /sitespeed.io/default.json"
  echo 'Start a new loop '
 
  docker run $DOCKER_SETUP $DOCKER_CONTAINER -n 7 --browsertime.viewPort 1920x1080 --browsertime.cacheClearRaw true /sitespeed.io/wikipedia.org.txt $CONFIG
  control
  docker run $DOCKER_SETUP $DOCKER_CONTAINER -n 7 --browsertime.viewPort 1920x1080 /sitespeed.io/wikipedia.org.txt -b firefox $CONFIG
  cleanup
done
~~~

And make sure the script start on server restart. Edit the crontab <code>crontab -e</code> and add (loop.sh is the name of your loop script file):

~~~shell
@reboot rm /home/ubuntu/sitespeed.run;/home/ubuntu/loop.sh
~~~

And start it like this:

~~~bash
nohup /home/ubuntu/loop.sh &
~~~
