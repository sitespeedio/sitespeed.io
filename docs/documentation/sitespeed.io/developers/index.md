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
 * all other projects in the [package.json](https://github.com/sitespeedio/sitespeed.io/blob/main/package.json).

And we also have plugins so that you can use:

 * [WebPageTest](https://www.webpagetest.org) through the [WebPageTest API](https://github.com/marcelduran/webpagetest-api)
 * [gpagespeed](https://www.npmjs.com/package/gpagespeed)

And of course we use all the tools in the [sitespeed.io suite]({{site.baseurl}}/documentation/).

### Analyse a page, what happens

Checkout the [description](/documentation/sitespeed.io/browsers/#how-does-it-work-behind-the-scene) in the browser docs.

### The big picture (with all the tools)
The big picture looks something like this:

![How it all works]({{site.baseurl}}/img/sitespeed-universe-5.png)
{: .img-thumbnail}

## Use directly from NodeJS

### Use sitespeed.io from NodeJS

Here's an example on how to use sitespeed.io directly from NodeJS. This will generate the result to disk but you will not get it as a JSON object (only the budget result). We maybe change that in the future. If you need the JSON you can either read it from disk or use the Browsertime plugin directly.

~~~javascript
'use strict';

const sitespeed = require('sitespeed.io');
const urls = ['https://www.sitespeed.io/'];

async function run() {
  try {
    const result = await sitespeed.run({
      urls,
      browsertime: {
        iterations: 1,
        connectivity: {
          profile: 'native',
          downstreamKbps: undefined,
          upstreamKbps: undefined,
          latency: undefined,
          engine: 'external'
        },
        browser: 'chrome'
      }
    });
    console.log(result);
  } catch (e) {
    console.error(e);
  }
}

run();
~~~

### Use Browsertime from NodeJS

In this example you run Browsertime directly from NodeJS, using the default JavaScripts to collect metrics. 

~~~javascript
'use strict';

const browsertime = require('browsertime');

// The setup is the same configuration as you use in the CLI
const browsertimeSetupOptions = { iterations: 1, browser: 'chrome' };
const engine = new browsertime.Engine(browsertimeSetupOptions);
// You can choose what JavaScript to run, in this example we use the default categories
// and the default JavaScript
const scriptsCategories = await browsertime.browserScripts.allScriptCategories;
const scripts = await browsertime.browserScripts.getScriptsForCategories(scriptsCategories);

async function run() {
  try {
    await engine.start();    
    // Get the result
    const result = await engine.run('https://www.sitespeed.io/', scripts);
    console.log(result);
  } catch (e) {
    console.error(e);
  } finally {
    await engine.stop();
  }
}

run();
~~~

## Developing sitespeed.io

### Setup
On your local machine you need:

- [Install NodeJS](https://nodejs.org/en/download/) latest LTS version.
- You need Git and fork [sitespeed.io](https://github.com/sitespeedio/sitespeed.io) and clone the forked repository.
- Install Chrome/Firefox
- Go to the cloned directory and run <code>npm install</code>
- You are ready to go! To run locally: <code>bin/sitespeed.js https://www.sitespeed.io -n 1</code>
- You can change the log level by adding the verbose flag. Verbose mode prints progress messages to the console. Enter up to three times (-vvv) to increase the level of detail: <code>bin/sitespeed.io https://www.sitespeed.io -n 1 -v</code>


To run the Docker version:

- Install [Docker Community Edition](https://docs.docker.com/install/)
- You need to fork and clone [sitespeed.io](https://github.com/sitespeedio/sitespeed.io).
- Run <code>docker build -t sitespeedio/sitespeed.io .</code> in the cloned directory to build the container
- Run <code>docker run --shm-size=1g --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io https://www.sitespeed.io/</code>

If you want to test and push to Graphite/InfluxDB:

- Go to *docker/* in the cloned dir and start the container: <code>docker-compose up</code>
- Go back one level and run <code>docker build -t sitespeedio/sitespeed.io .</code> in the cloned directory to build the container
- Run: <code>docker run --shm-size=1g --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io https://www.sitespeed.io -n 1 --graphite.host=192.168.65.1</code> to push the data to Graphite. The IP is the localhost IP if you run on a Mac.
- Check the metrics at [http://127.0.0.1:3000/](http://127.0.0.1:3000/).

If you are new to Git/GitHub and want to make a PR you can start with reading [Digital Oceans tutorial on how to make PRs](https://www.digitalocean.com/community/tutorials/how-to-create-a-pull-request-on-github).

We use *main* as our default branch, send all PRs to *main*.

### Log and debug
To get a better understanding of what happens you should use the log. You can change log level by using multiple <code>-v</code>. If you want to log on the lowest level getting all information you can use <code>-vvv</code>. If that is too much information use  <code>-vv</code> or <code>-v</code>.

You can also debug all the messages sent inside of the queue of sitespeed.io. That way you can see how plugins are communicating with each other. To turn that on use <code>--debug</code>.

### Plugins
Everything in sitespeed.io (well almost everything) is a plugin. Each plugin will be called, for each message sent in the application and then called when everything is finished.

The [plugin structure]({{site.baseurl}}/documentation/sitespeed.io/plugins/#create-your-own-plugin) looks like that.

### Using Pug
We use [Pug](https://pugjs.org) as template for the HTML. If you are use to debug with console.log we have a special feature for you. We pass on JSON to the templates, so if you want to output the data structure in the HTML you can easily do that by just adding:

~~~
p #{JSON.stringify(pageInfo)}
~~~

Where pageInfo is the data structure that you wanna inspect.

If you are new to pug you can use [https://html2jade.org](https://html2jade.org) to convert your HTML to Pug.

### Make a pull request

 We love pull requests and before you make a big change or add functionality, please open an issue proposing the change to other contributors so you got feedback on the idea before take the time to write precious code!

#### Committing changes
 * Install Commitizen with npm <code>npm install -g commitizen</code>
 * Then simply use command <code>git cz</code> instead of <code>git commit</code> when committing changes

#### Before you send the pull request

Before you send the PR make sure you:
 * Squash your commits so it looks sane
 * Make sure your code follow our lint rule by running: <code>npm run lint</code> and use <code>npm run lint:fix</code> if you have any breaking rules
 * Make sure your code don't break any tests: <code>npm test</code>
 * Update the documentation [https://github.com/sitespeedio/sitespeed.io/tree/main/docs](https://github.com/sitespeedio/sitespeed.io/tree/main/docs) in another pull request. When we merge the PR the documentation will automatically be updated so we do that when we push the next release

### Do a sitespeed.io release
When you become a member of the sitespeed.io team you can push releases. You do that by running the release bash script in root: <code>./release.sh</code>

You need NodeJS, Docker, np (<code>npm install --global np</code>), Firefox and Chrome installed on your machine.

To be able to release a new version you new to have access to our Docker account, npm, our GitHub repos and use 2FA.

To do a release you need to first install np (a better *npm publish*): <code>npm install --global np</code>

Before you do a release, remember to let your latest code change run a couple of hours on our test server before you push the release (the latest code is automatically deployed on the test server). You will find errors from the test server on the [#alert channel on Slack](https://sitespeedio.herokuapp.com/).

Do the release:

1. Make sure you have a clean repo: `git status`
2. Read through the [CHANGELOG](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) and see that all changes are included and add the version + date at the top for the new release and commit the change.
3. Run `./release.sh`
4. Choose version
5. Login into Docker, add your 2FA when prompted
6. When a new browser window opens at GitHub with the release, copy/paste the changes from the [CHANGELOG](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md)  and add it instead of the commits and create the release.
7. Commit the updated [version file](https://github.com/sitespeedio/sitespeed.io/blob/main/docs/_includes/version/sitespeed.io.txt) and the [configuration file](https://github.com/sitespeedio/sitespeed.io/blob/main/docs/documentation/sitespeed.io/configuration/config.md) if that's changed.

### Do a Browsertime release
When you become a member of the Browsertime team you can push releases. You do that by running the release bash script in root: <code>./release.sh</code>

You need NodeJS, Docker, np (<code>npm install --global np</code>), Firefox and Chrome installed on your machine.

To be able to release a new version you new to have access to our Docker account, npm, our GitHub repos and use 2FA.

You also need to have the sitespeed.io repo at the same level as your checked out Browsertime repo, so that the documentation automatically can be updated.

Before you do a release, make sure the latest commits has a [green light in Travis](https://travis-ci.org/sitespeedio/browsertime).

Do the release:
1. Make sure you have a clean repo: `git status`
2. Read through the [CHANGELOG](https://github.com/sitespeedio/browsertime/blob/main/CHANGELOG.md) and see that all changes are included and add the version + date at the top for the new release and commit the change.
3. Run `./release.sh` (if all tests are ok on Travis feel free to run `./release.sh --yolo` to skip the tests)
4. Choose version
5. Login into Docker, add your 2FA when prompted
6. When a new browser window opens at GitHub with the release, copy/paste the changes from the Changelog and add it instead of the commits.
7. Commit the updated [version file](https://github.com/sitespeedio/sitespeed.io/blob/main/docs/_includes/version/browsertime.txt) and the [configuration file](https://github.com/sitespeedio/sitespeed.io/blob/main/docs/documentation/browsertime/configuration/config.md) in the sitespeed.io repo. Or make a PR if you do not have commit rights.

### Contributing to the documentation
The documentation lives in your cloned directory under *docs/*.

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


Then copy & paste <code>chrome://inspect/</code> Chrome and then choose *Open dedicated DevTools for Node*
. <code>--inspect-brk</code> ensures a breakpoint as soon as the code is entered. From there, you can start any of the profiles under the Profile tab.

Use it when you want to debug functionality or check memory usage.
