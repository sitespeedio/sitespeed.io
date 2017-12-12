---
layout: default
title: Say hello to sitespeed.io 6.1 and Browsertime 2.1
description: We got something for you to play with during the holidays! Both Browsertime and sitespeed.io got an alpha Docker container (a real early release). The Docker image is bundled with WebPageReplay. If you want to focus on finding regressions in your frontend you need try this out!
authorimage: /img/aboutus/peter.jpg
intro: We got something for you to play with during the holidays! Both Browsertime and sitespeed.io got an alpha Docker container (a real early release). The Docker image is bundled with WebPageReplay. If you want to focus on finding regressions in your frontend you need try this out!
keywords: sitespeed.io, sitespeed, 6.1
nav: blog
---

# Say hello to sitespeed.io 6.1 and Browsertime 2.1
In this release we have a couple of bug fixes, some new functionality and a super early alpha of something really cool!

## Let your plugin add metrics for budget
One thing that we missed todo in 6.0 was to open up for plugins to add themselves to the budget. With this fix
your plugin can add metrics that you then can use in your budget.

In the *sitespeedio.config* phase (where plugins can talk to each other) make sure to tell the budget plugin that you want it to collect metrics from your plugin. Do that by sending a message of the type *budget.addMessageType* and add the type of the metrics message you want it to collect.

In this example we tell the budget plugin that it should collect metrics of the type *gpsi.pagesummary*.

~~~
const messageMaker = context.messageMaker;
...

queue.postMessage(make('budget.addMessageType', {type: 'gpsi.pagesummary'}));
~~~

## Let your plugin run async JavaScript in BrowserTime
One of the cool features we released in 6.0 was the ability to let plugins register synchronous JavaScript in Browsertime. In this release you can also run asynchronous JavaScript.

~~~
case 'sitespeedio.setup': {
 queue.postMessage(
   make('browsertime.asyncscripts', {
     category: 'yourplugin',
     scripts: {
       myValue: 'Promise.resolve(43);'
     }
   })
 )
 break;
}
~~~

## Configure screenshots
In this release you can change change the size of the screenshot and choose between png/jpg (to save some extra bytes).
We use [sharp](http://sharp.dimens.io/) to manipulate the screenshot. This is what you can do so far:

~~~
Screenshot
  --screenshot.type                  Set the file type of the screenshot [choices: "png", "jpg"] [default: "png"]
  --screenshot.png.compressionLevel  zlib compression level. default: 6]
  --screenshot.jpg.quality           Quality of the JPEG screenshot. 1-100 [default: 80]
  --screenshot.maxSize               The max size of the screenshot (width and height). [default: 2000]
~~~

## Docker with bundled WebPageReplay
Ohhh we are excited about this: It's an really early release and you can help us by try it out.

Both sitespeed.io and Browsertime have a new Docker container that you should use when you try out [WebPageReplay](https://github.com/catapult-project/catapult/tree/master/web_page_replay_go). If you haven't used WebPageReplay (or other performance tools like [mahimahi](https://github.com/ravinet/mahimahi)) the short explanation is that they record your website and replay it locally so when you run your tests, you don't need to hit the internet. This will give you a chance to have very stable metrics and make it easier to find regressions.

### Test it out with sitespeed.io

The Docker container name is *sitespeedio/sitespeed.io:6.1.0-wpr-alpha* and you need to pass on the environment variable REPLAY to activate it. Else you just run it as usual. One thing thing though if you want to change the latency (the latency is set on localhost to simulate what it looks like for a real user) you do that with -e LATENCY (default is 100 ms).

Running for Chrome is easy:

~~~bash
docker run --cap-add=NET_ADMIN --shm-size=1g --rm -v "$(pwd)":/sitespeed.io -e REPLAY=true sitespeedio/sitespeed.io:6.1.1-wpr-alpha -n 5 -b chrome https://en.wikipedia.org/wiki/Barack_Obama
~~~

It also works for Firefox (note that we need the *skipHar* until the next HAR exporter is released):

~~~bash
docker run --cap-add=NET_ADMIN --shm-size=1g --rm -v "$(pwd)":/sitespeed.io -e REPLAY=true sitespeedio/sitespeed.io:6.1.1-wpr-alpha -n 11 --browsertime.skipHar -b firefox https://en.wikipedia.org/wiki/Barack_Obama
~~~

### Test it out with Browsertime
If you are a Browsertime user the correct container is *sitespeedio/browsertime:2.1.1-wpr-alpha*.

~~~bash
docker run --cap-add=NET_ADMIN --shm-size=1g --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=150 sitespeedio/browsertime:2.1.1-wpr-alpha https://en.wikipedia.org/wiki/Barack_Obama
~~~

~~~bash
docker run --cap-add=NET_ADMIN --shm-size=1g --rm -v "$(pwd)":/browsertime -e REPLAY=true -e LATENCY=100 sitespeedio/browsertime:2.1.1-wpr-alpha -b firefox --skipHar -n 11 https://en.wikipedia.org/wiki/Barack_Obama
~~~

### Feedback

If you try it out, please get back to us in an [issue](https://github.com/sitespeedio/sitespeed.io/issues/new) and tell us how it worked for you!

### Fixed
We also has some fixes in sitespeed.io for this release:

* Crawling now works with Basic Auth [#1845](https://github.com/sitespeedio/sitespeed.io/pull/1845) and [#1506](https://github.com/sitespeedio/sitespeed.io/issues/1506).

* Fixed broken metrics list [#1850](https://github.com/sitespeedio/sitespeed.io/issues/1850). Thank you [https://github.com/suratovvlad](https://github.com/suratovvlad) for reporting.

Checkout the full [Changelog](https://github.com/sitespeedio/sitespeed.io/blob/master/CHANGELOG.md) for all changes.

/Peter
