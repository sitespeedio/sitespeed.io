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

## How it all works
Almost everything we do is written in NodeJS (use [latest LTS](https://nodejs.org/en/)).

### Built upon Open Source
Sitespeed.io uses a lot of other Open Source tools so massive love to those projects and maintainers:

 * [Selenium](http://www.seleniumhq.org/)
 * [Visual Metrics](https://github.com/WPO-Foundation/visualmetrics)
 * [PerfCascade](https://github.com/micmro/PerfCascade)
 * [Skeleton](http://getskeleton.com)
 * [Simple crawler](https://github.com/cgiffard/node-simplecrawler)
 * [Pug](https://www.npmjs.com/package/pug)
 * all other projects in the [package.json](https://github.com/sitespeedio/sitespeed.io/blob/master/package.json).

And we also have plugins so that you can use:

 * [WebPageTest](https://www.webpagetest.org) through the [WebPageTest API](https://github.com/marcelduran/webpagetest-api)
 * [gpagespeed](https://www.npmjs.com/package/gpagespeed)

And of course we use all the tools in the [sitespeed.io suite](({{site.baseurl}}/documentation/).

### Analyse a page, what happens (10 step version)
This is the super simple version, leaving out all other tools that are used:

1. sitespeed.io gets a URL from the user.
2. Open the browser
3. Start record a video of the screen.
4. Access the URL in the browser.
5. When the page is finished, take a screenshot of the page.
6. Run some JavaScripts to analyse the page (using Coach and Browsertime scripts).
7. Stop the video and close the browser.
8. Analyse the video to get metrics like FirstVisualChange and SpeedIndex.
9. Generate a HTML report and/or send the metrics to Graphite or store the metrics however you want, with your own plugin.
10. Enjoy!

### The big picture (with all the tools)
The big picture looks something like this:

![How it all works]({{site.baseurl}}/img/sitespeed-universe-5.png)
{: .img-thumbnail}

## Developing sitespeed.io

### Setup
On your local machine you need:

- [Install NodeJS](https://nodejs.org/en/download/) latest LTS version.
- You need Git and fork [sitespeed.io](https://github.com/sitespeedio/sitespeed.io) and clone the forked repository.
- Install Chrome/Firefox
- Go to the cloned directory and run <code>npm install</code>
- You are ready to go! To run locally: <code>bin/sitespeed.io https://www.sitespeed.io -n 1</code>
- You can change the log level by adding the verbose flag. Verbose mode prints progress messages to the console. Enter up to three times (-vvv) to increase the level of detail: <code>bin/sitespeed.io https://www.sitespeed.io -n 1 -v</code>


To run the Docker version:

- Install [Docker Community Edition](https://docs.docker.com/install/)
- You need to fork and clone [sitespeed.io](https://github.com/sitespeedio/sitespeed.io).
- Run <code>docker build -t sitespeedio/sitespeed.io .</code> in the cloned directory to build the container
- Run <code>docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/</code>

If you want to test and push to Graphite/InfluxDB:

- Go to *docker/* in the cloned dir and start the container: <code>docker-compose up</code>
- Go back one level and run <code>docker build -t sitespeedio/sitespeed.io .</code> in the cloned directory to build the container
- Run: <code>docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io -n 1 --graphite.host=192.168.65.1</code> to push the data to Graphite. The IP is the localhost IP if you run on a Mac.
- Check the metrics at [http://127.0.0.1:3000/](http://127.0.0.1:3000/).

### Plugins
Everything in sitespeed.io (well almost everything) is a plugin. Each plugin will be called, for each message sent in the application and then called when everything is finished.

The [plugin structure]({{site.baseurl}}/documentation/sitespeed.io/plugins/#create-your-own-plugin) looks like that.

### Using Pug
We use [Pug](https://pugjs.org) as template for the HTML. If you are use to debug with console.log we have a special feature for you. We pass on JSON to the templates, so if you want to output the data structure in the HTML you can easily do that by just adding:

~~~
p #{JSON.stringify(pageInfo)}
~~~

Where pageInfo is the data structure that you wanna inspect.

### Make a pull request
 
 We love pull requests and before you make a big change or add functionality, please open an issue proposing the change to other contributors so you got feedback on the idea before take the time to write precious code!

#### Before you send the pull request 

Before you send the PR make sure you: 
 * Squash your commits so it looks sane
 * Make sure your code follow our lint rule by running: <code>npm run lint</code>
 * Make sure your code don't break any tests: <code>npm test</code>
 * Update the documentation [https://github.com/sitespeedio/sitespeed.io/tree/master/docs](https://github.com/sitespeedio/sitespeed.io/tree/master/docs) in another pull request. When we merge the PR the documentaion will automatically be updated so we do that when we push the next release

### Do a release
When you become a member of the sitespeed.io team you can push releases. You do that by running the release bash script in root: <code>./release.sh</code>

To do a release you need to first install np (a better *npm publish*): <code>npm install --global np</code>

Then run the bash script. It will push your new release to npm and the Docker hub. Remember to let ypur latest code change run a couple of hours on our test server before you push the release (the latest code is automatically deployed on the test server).

### Use sitespeed.io from NodeJS
If you want to integrate sitespeed.io into your NodeJS application you can checkout how we do that in [our Grunt plugin](https://github.com/sitespeedio/grunt-sitespeedio/blob/master/tasks/sitespeedio.js). It's a great working example. :)

### Contributing to the documentation
The documention lives in your cloned directory under *docs/*.

First make sure you have Bundler: <code>gem install bundler</code>

You should upgrade your ruby gems too: <code>gem update --system</code>

*If you run on a Mac OS make sure you have xcode-select installed: <code>xcode-select --install</code>*

To run the documentation server locally execute the following from within the /docs directory after cloning the repo locally: <code>bundle install && bundle exec jekyll serve --baseurl ''</code>.

Visit http://localhost:4000/ in the browser of your choice.

### Debugging with Chrome
You can debug sitespeed.io using Chrome and NodeJS > 8. Thanks [@moos](https://github.com/moos) for sharing.

~~~bash
node --inspect-brk bin/sitespeed.js -n 1 https://www.sitespeed.io
~~~

And you will get something like this:

~~~
Debugger listening on ws://127.0.0.1:9229/28ca21e5-1300-45ee-a455-481cb96220eb
For help see https://nodejs.org/en/docs/inspector
Debugger attached.
~~~


Then copy&paste <code>chrome://inspect/</code> Chrome and then choose *Open dedicated DevTools for Node*
. <code>--inspect-brk</code> ensures a breakpoint as soon as the code is entered. From there, you can start any of the profiles under the Profile tab.

Use it when you want to debug functionality or check memory usage.
