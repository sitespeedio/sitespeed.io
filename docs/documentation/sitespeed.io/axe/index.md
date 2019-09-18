---
layout: default
title: Run accessibility tests.
description: Use Axe-core to run your accessibility tests.
keywords: axe, accessibility 
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription:
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Axe

# Axe
{:.no_toc}

* Lets place the TOC here
{:toc}

[Axe](https://github.com/dequelabs/axe-core) is an accessibility testing engine for websites and other HTML-based user interfaces. 

## Run
You enable testing with `--axe.enable`.

```bash
docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} --axe.enable https://www.sitespeed.io
```

That will run [axe-core](https://github.com/dequelabs/axe-core) and generate a new **axe** tab in your HTML result. The number of violations (per type) will automatically be sent to Graphite/InfluxDB.

## Rules
[See the full list](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md) of the tested accessibility rules when you run Axe.


## Configure Axe
You can [configure Axe](https://github.com/dequelabs/axe-core/blob/master/doc/API.md#api-name-axeconfigure) which rules/checks that will be used. In the *axe* namespace we pass on all parameters to the configuration object of Axe. `--axe.checks` will result in a configuration object like:

```json
checks: {

}
```

If you wanna avoid having over complicated cli-params you should use the [configuration as JSON feature](/documentation/sitespeed.io/configuration/#configuration-as-json).


## How it works behind the scene
The Axe tests are run as a [postScript](/documentation/sitespeed.io/prepostscript/).

Running Axe will add some extra run time per test. How long extra time it takes depends on your page and the server running the browser.
