---
layout: default
title: Hack on sitespeed.io
description: Start here when you want to do PRs or create a plugin.
keywords: docker, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Hack on sitespeed.io
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Developers

# Developers
{:.no_toc}

* Lets place the TOC here
{:toc}

## Start
You can start by looking at the image of [how it all works]({{site.baseurl}}/documentation/sitespeed.io/how-it-all-works/). It may seems like a lot, but it isn't really that complicated.

## Setup
On your local machine you need:

- [Install NodeJS](https://nodejs.org/en/download/) latest LTS version
- Fork [sitespeed.io](https://github.com/sitespeedio/sitespeed.io) and clone the forked repository
- Go to the cloned directory and run *npm install*
- You are ready to go! To run locally: *bin/sitespeed.io https://www.sitespeed.io -n 1
- Now make some changes to the pug templates and re-run.

To run the Docker version:
- Install [Docker Community Edition](https://docs.docker.com/engine/installation/)
- You need to fork and clone [sitespeed.io](https://github.com/sitespeedio/sitespeed.io).
- Run *docker build sitespeedio/sitespeed.io .* in the cloned directory to build the container
- Run *docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/*

If you want to test and push to Graphite/InfluxDB:
- Go to *development/* in the cloned dir and read the index.md file
- Build the sitespeed.io container: *docker-compose build sitespeed*
- Run: *docker-compose run sitespeed http://www.sitespeed.io --video --speedIndex -n 1 --graphite.host=graphite* to push the data to Graphite
- Make your changes and rebuild the container *docker-compose build sitespeed*

## Plugins
Everything in sitespeed.io (well almost everything) is a plugin. Each plugin will be called, for each message sent in the application and then called when everything is finished.

The [plugin structure]({{site.baseurl}}/documentation/sitespeed.io/plugins/#create-your-own-plugin) looks like that.

## Analyzing a URL step by step
The flow looks like this:

1. You start the application and feed it with a URL/URLs.
2. The app will go through the configured plugins and start them while each plugin waits for messages.
3. The app will send the URLs as URL messages and the plugins that listens to that type of messages will receive them. When a plugin is finished, it will post other messages on it's findings.
4. When all URLs are finished, the plugins receive a "close" call to finalize and prepare their findings.
5. Finish

## Using Pug
We use [Pug](https://pugjs.org) as template for the HTML. If you are use to debug with console.log we have a special feature for you. We pass on JSON to the templates, so if you want to output the data structure in the HTML you can easily do that by just adding:

~~~
p #{JSON.stringify(pageInfo)}
~~~

Where pageInfo is the data structure that you wanna inspect.

## Use sitespeed.io from NodeJS
If you want to integrate sitespeed.io into your NodeJS application you can checkout how we do that in [our Grunt plugin](https://github.com/sitespeedio/grunt-sitespeedio/blob/master/tasks/sitespeedio.js). It's a great working example. :)

## Contributing to the Documentation
First make sure you have Bundler: <code>gem install bundler</code>

You should upgrade your ruby gems too: <code>gem update --system</code>

*If you run on a Mac OS make sure you have xcode-select installed: <code>xcode-select --install</code>*

To run the documentation server locally execute the following from within the /docs directory after cloning the repo locally: <code>bundle install && bundle exec jekyll serve --baseurl ''</code>.

Visit http://localhost:4000/ in the browser of your choice.

## Debugging with Chrome
You can debug sitespeed.io using Chrome and NodeJS > 6. Thanks [@moos](https://github.com/moos) for sharing.

~~~ bash
$ node --inspect --debug-brk bin/sitespeed.js -m25 -n1 http://0.0.0.0:8082
Debugger listening on port 9229.
Warning: This is an experimental feature and could change at any time.
To start debugging, open the following URL in Chrome:
    chrome-devtools://devtools/remote/serve_file/@62cd277117e6f8ec53e31b1be5829 a6f7ab42ef/inspector.html?experiments=true&v8only=true&ws=localhost:9229/node
~~~

Then copy&paste the URL in chrome and you're in inspect mode. <code>--debug-brk</code> ensures a breakpoint as soon as the code is entered. From there, you can start any of the profiles under the Profile tab.

Use it when you want to debug functionality or check memory usage.
