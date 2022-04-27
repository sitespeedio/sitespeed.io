# sitespeed.io

![Unit tests](https://github.com/sitespeedio/sitespeed.io/workflows/Unit%20tests/badge.svg?branch=main)
![Linux browsers](https://github.com/sitespeedio/sitespeed.io/workflows/Linux%20browsers/badge.svg?branch=main)
![Docker](https://github.com/sitespeedio/sitespeed.io/workflows/Docker/badge.svg?branch=main)
![Windows Edge](https://github.com/sitespeedio/sitespeed.io/workflows/Windows%20Edge/badge.svg?branch=main)
![OSX Safari](https://github.com/sitespeedio/sitespeed.io/workflows/OSX%20Safari/badge.svg?branch=main)
[![Downloads][downloads-image]][downloads-url]
[![Docker][docker-image]][docker-url]
[![Stars][stars-image]][stars-url]
[![npm][npm-image]][npm-url]
[![Changelog #212][changelog-image]][changelog-url]


[Website](https://www.sitespeed.io/) | [Documentation](https://www.sitespeed.io/documentation/sitespeed.io/) | [Changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) | [Twitter](https://twitter.com/SiteSpeedio)

## Welcome to the wonderful world of web performance!

**Sitespeed.io is a *complete web performance tool* that helps you measure the performance of your website. What exactly does that mean?**

Before we start telling you all about sitespeed.io you should just try it out:


Using NodeJS/npm (you need Chrome, Firefox, Edge or Safari installed or Chrome/Firefox on Android)

 ```bash
 npm i -g sitespeed.io && sitespeed.io https://www.sitespeed.io/
 ```

Or using Docker:

 ```bash
 docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/
 ```



Ok, now you have tried it, let us tell you more about sitespeed.io. We think of a complete web performance tool as having three key capabilities:

 - It test web sites using real browsers, simulating real users connectivity and collect important user centric metrics like Speed Index and First Visual Render.
 - It analyse how your page is built and give feedback how you can make it faster for the end user.
 - It collect and keep data how your pages is built so you easily can track changes.

**What is sitespeed.io good for?**

It is usually used in two different areas:

 - Running in your continuous integration to find web performance regressions early: on commits or when you move code to your test environment
 - Monitoring your performance in production, alerting on regressions.

To understand how sitespeed.io does these things, let's talk about how it works.

First a few key concepts:

 - Sitespeed.io is built upon a couple of other Open Source tools in the sitespeed.io suite.
 - [Browsertime](https://github.com/sitespeedio/browsertime) is the tool that drives the browser and collect metrics.
 - [The Coach](https://github.com/sitespeedio/coach) knows how to build fast websites and analyse your page and give you feedback what you should change.
 - Visual Metrics is metrics collected from a video recording of the browser screen.
 - Everything in sitespeed.io is a [plugin](https://www.sitespeed.io/documentation/sitespeed.io/plugins/) and they communicate by passing messages on a queue.

When you as user choose to test a URL, this is what happens on a high level:

 1. sitespeed.io starts and initialise all configured plugins.
 2. The URL is passed around the plugins through the queue.
    1. Browsertime gets the URL and opens the browser.
    2. It starts to record a video of the browser screen.
    3. The browser access the URL.
    4. When the page is finished, Browsertime takes a screenshot of the page.
    5. Then run some JavaScripts to analyse the page (using Coach and Browsertime scripts).
    6. Stop the video and close the browser.
    7. Analyse the video to get Visual Metrics like First Visual Change and Speed Index.
    8. Browsertime passes all metrics and data on the queue so other plugins can use it.
 3. The HTML/Graphite/InfluxDB plugin collects the metrics in queue.
 4. When all URLs are tested, sitespeed sends a message telling plugins to summarise the metrics and then render it.
 5. Plugins pickup the render message and the HTML plugin writes the HTML to disk.

 ## Try it out

 Using Docker (use latest Docker):

 ```bash
 docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/
 ```

 Or install using npm:

 ```bash
 npm i -g sitespeed.io
 ```

 Or clone the repo and test the latest changes:

 ```bash
 git clone https://github.com/sitespeedio/sitespeed.io.git
 cd sitespeed.io
 npm install
 bin/sitespeed.js --help
 bin/sitespeed.js https://www.sitespeed.io/
```

## More details

Using sitespeed.io you can:
* Test your web site against Web Performance best practices using the [Coach](https://github.com/sitespeedio/coach).
* Collect Navigation Timing API, User Timing API and Visual Metrics from Firefox/Chrome using [Browsertime](https://github.com/sitespeedio/browsertime).
* Run your custom-made JavaScript and collect whichever metric(s) you need.
* Test one or multiple pages, across one or many runs to get more-accurate metrics.
* Create HTML-result pages or store the metrics in Graphite.
* Write your own plugins that can do whatever tests you want/need.

See all the latest changes in the [Changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md).

Checkout our example [dashboard.sitespeed.io](https://dashboard.sitespeed.io/dashboard/db/page-summary)

A summary report in HTML:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/start-readme.jpg">

Individual page report:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/start-url-readme.jpg">

Collected metrics from a URL in Graphite/Grafana:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/grafana-readme.jpg">

And look at trends in Grafana:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/grafana-trends-readme.jpg">

Video - easiest using Docker. This gif is optimized, the quality is much better IRL:

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/barack.gif">

## Test using WebPageReplay
We have a special Docker container that comes with [WebPageReplay](https://github.com/catapult-project/catapult/blob/main/web_page_replay_go/README.md) installed. This is a really early alpha release but we think you should try it out.

WebPageReplay will let you replay your page locally (getting rid of server latency etc) and makes it easier to have stable metrics and find front end regressions.

It works like this:
1. WebPageReplay is started in record mode
2. Browsertime access the URLs you choose one time (so it is recorded)
3. WebPageReplay is closed down
4. WebPageReplay in replay mode is started
5. Sitespeed.io (using Browsertime) test the URL so many times you choose
6. WebPageReplay in replay mode is closed down

You can change latency by setting a Docker environment variable. Use REPLAY to turn on the replay functionality.

Default browser is Chrome:

```
docker run --cap-add=NET_ADMIN --rm -v "$(pwd)":/sitespeed.io -e REPLAY=true -e LATENCY=100 sitespeedio/sitespeed.io -n 5 -b chrome https://en.wikipedia.org/wiki/Barack_Obama
```

Use Firefox:

```
docker run --cap-add=NET_ADMIN --rm -v "$(pwd)":/sitespeed.io -e REPLAY=true -e LATENCY=100 sitespeedio/sitespeed.io -n 11 -b firefox https://en.wikipedia.org/wiki/Barack_Obama
```

<hr>

# Sponsors

<a href="https://www.macstadium.com"><img src="https://uploads-ssl.webflow.com/5ac3c046c82724970fc60918/5c019d917bba312af7553b49_MacStadium-developerlogo.png"></a>

We have a Mac Mini sponsored by [MacStadium](https://www.macstadium.com) and you too can sponsor us to help us keep sitespeed.io running and making sure we can have the best test setup as possible. Read our [sponsor page](https://github.com/sponsors/soulgalore) for more info.

[travis-image]: https://img.shields.io/travis/sitespeedio/sitespeed.io.svg?style=flat-square
[travis-url]: https://travis-ci.org/sitespeedio/sitespeed.io
[stars-url]: https://github.com/sitespeedio/sitespeed.io/stargazers
[stars-image]: https://img.shields.io/github/stars/sitespeedio/sitespeed.io.svg?style=flat-square
[downloads-image]: https://img.shields.io/npm/dt/sitespeed.io.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/sitespeed.io
[docker-image]: https://img.shields.io/docker/pulls/sitespeedio/sitespeed.io.svg
[docker-url]: https://hub.docker.com/r/sitespeedio/sitespeed.io/
[changelog-image]: https://img.shields.io/badge/changelog-%23212-lightgrey.svg?style=flat-square
[changelog-url]: https://changelog.com/212
[npm-image]: https://img.shields.io/npm/v/sitespeed.io.svg
[npm-url]: https://npmjs.org/package/sitespeed.io
