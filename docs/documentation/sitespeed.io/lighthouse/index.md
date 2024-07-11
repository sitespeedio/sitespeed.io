---
layout: default
title: Run Lighthouse from sitespeed.io
description: Since 7.5 you can also run Lighthouse from sitespeed.io
keywords: lighthouse, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Run Lighthouse and Google PageSpeed Insights from sitespeed.io.
---
[Documentation](/documentation/sitespeed.io/) / Lighthouse

# Lighthouse


You can find the plugin at [https://github.com/sitespeedio/plugin-lighthouse](https://github.com/sitespeedio/plugin-lighthouse) and it will work with sitespeed.io 27 and later.

We also made it easy to use Lighthouse and the Google PageSpeed Insights plugin by releasing the +1 Docker container.

You can run it with: 

```bash
docker run --shm-size=1g --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}-plus1 https://www.sitespeed.io/
``` 

And you will also automatically run Lighthouse and GPSI. We automatically release a new version of the container per release by adding *-plus1* to the tag. If you use Graphite/InfluxDb the score from Lighthouse and GPSI will be automatically stored. If you want to add functionality please send PRs to [https://github.com/sitespeedio/plugin-lighthouse](https://github.com/sitespeedio/plugin-lighthouse) and [https://github.com/sitespeedio/plugin-gpsi](https://github.com/sitespeedio/plugin-gpsi).

The Lighthouse tests will run after Browsertime finished and run Chrome headless.

*Note:* If you want to run more plugins with <code>--plugins.add</code> that will override the default settings so you will need to add the Lighthouse plugin again like this:

```bash
docker run --shm-size=1g --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}-plus1 https://www.sitespeed.io/ --plugins.add analysisstorer --plugins.add @sitespeed.io/plugin-lighthouse
``` 

The Lighthouse result is iframed into sitespeed.io:
![Lighthouse]({{site.baseurl}}/img/lighthouse-frame.png)
{: .img-thumbnail}

## Configuration
By default the plugin run the tests with desktop settings (*lighthouse/lighthouse-core/config/lr-desktop-config*). If you run sitespeed.io with `--mobile`, `--android` or `--ios` the plugin will run the tests with mobile settings (*lighthouse/lighthouse-core/config/lr-mobile-config*).

If you want you can run the tests with your own configuration. You will do that by adding your own JavaScript configuration file ```--lighthouse.config config.js```.

And a configuration file like this:

```JavaScript
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: ['first-meaningful-paint', 'speed-index', 'interactive']
  }
};
```

You can also add Lighthouse flags by a JSON file ```--lighthouse.flags flag.json```.

Read all about configuring Lighthouse at [https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md](https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md).

## Disable GPSI
If you only want to run Lighthouse and not GPSI you can disable it with `----plugins.remove @sitespeed.io/plugin-gpsi`.


You can read more about sitespeed.io plugins [here](https://www.sitespeed.io/documentation/sitespeed.io/plugins/).
