---
layout: default
title: Hack on sitespeed.io
description: Start here when you want to do PRs or create a plugin.
keywords: docker, documentation, web performance, sitespeed.io
nav: documentation
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Hack on sitespeed.io
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Developers

# Developers
{:.no_toc}

* Lets place the TOC here
{:toc}

## Start
Start by looking at the image of [how it all works]({{site.baseurl}}/documentation/sitespeed.io/how-it-all-works/). It seems like much, but it isn't that complicated.

### Plugins
Everything in sitespeed.io (well almost everything) is a plugin. Each plugin will be called at startup, for each message sent in the application and then called when everything is finished.

The [plugin structure]({{site.baseurl}}/documentation/sitespeed.io/plugins/#create-your-own-plugin) looks like that.

### Analyzing a URL step by step
The flow looks like this:

1. You start the application and feed it with a URL/URLs.
2. The app will go through the configured plugins and start them while each plugin waits for messages.
3. The app will send the URLs as URL messages and the plugins that listens to that type of messages will act on that. When a plugin is finished, it will post other messages on it's findings.
4. When all URLs are finished, the plugins receive a "close" call to finalize and prepare their findings.
5. Finish

### Contributing to the Documentation
First make sure you have Bundler: <code>gem install bundler</code>

*If you run on a Mac OS make sure you have xcode-select installed: <code>xcode-select --install</code>*

To run the documentation server locally execute the following from within the /docs directory after cloning the repo locally: <code>bundle install && bundle exec jekyll serve --baseurl ''</code>.

Vist https://localhost:4000/ in the browser of your choice.


### Debugging with Chrome
You can debug sitespeed.io using Chrome and NodeJS > 6. Thanks [@moos](https://github.com/moos) for sharing.

~~~ bash
$ node --inspect --debug-brk bin/sitespeed.js -m25 -n1 http://0.0.0.0:8082
Debugger listening on port 9229.
Warning: This is an experimental feature and could change at any time.
To start debugging, open the following URL in Chrome:
    chrome-devtools://devtools/remote/serve_file/@62cd277117e6f8ec53e31b1be5829 a6f7ab42ef/inspector.html?experiments=true&v8only=true&ws=localhost:9229/node
~~~

Then copy&paste the URL in chrome and you're in inspect mode. <code>--debug-brk</code> ensures a breakpoint as soon as the code is entered. From there, you can start any of the profiles under the Profile tab.

Use it when you wanna debug functionality or check memory usage.
