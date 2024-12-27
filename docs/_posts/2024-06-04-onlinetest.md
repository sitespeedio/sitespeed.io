---
layout: default
title: Deploying your own version of sitespeed.io online
description: Today, I have some exciting news to share! I have built a frontend for sitespeed.io to add another way to run your performance tests.
authorimage: /img/aboutus/peter.jpg
intro: Today, I have some exciting news to share! I have built a frontend for sitespeed.io to add another way to run your performance tests.
keywords: sitespeed.io, webperf
image: https://www.sitespeed.io/img/8bit.png
nav: blog
---

# Deploying your own version of sitespeed.io online
Today, I have some exciting news to share! I have built a frontend for sitespeed.io to add another way to run your performance tests. My focus has been on making it easy to set up/deploy (though you need to be able to follow instructions) and ensuring it works both for large enterprise companies and for you.

![The start page]({{site.baseurl}}/img/onlineteststart.png)
{: .img-thumbnail}

There are many great features I want to share, but I'll start by asking for your help in testing the new project: I've tested it extensively, but there might still be bugs and minor issues that need fixing. You can find the project [here](https://github.com/sitespeedio/onlinetest) and read the documentation [here](https://www.sitespeed.io/documentation/onlinetest/). Please create [an issue](https://github.com/sitespeedio/onlinetest/issues/new) if you find something and feel free to submit a PR to fix the problem :)

You need three components to set it all up:
* a **sitespeed.io server** with GUI, API, and search functionality. It receives your tests and forwards them.
* one (or more) **test runners** that run the sitespeed.io tests. It uses either sitespeed.io in a Docker container or installed via npm.
* **dependencies**: a database, a message broker, and somewhere to store the results (HTML/images/videos). We have [pre-made docker compose file](https://github.com/sitespeedio/onlinetest/blob/main/docker-compose.yml) you can use to get them up and running.

The setup looks like this:

![The setup]({{site.baseurl}}/img/onlinetestsetup.png)
{: .img-thumbnail}

Ok, that's what it looks like. I would like to share some aspects of the project that I am particularly proud of.

## Run your tests via command line

One feature that played out really well is that you can create tests both via the GUI and the regular command line using sitespeed.io. By using the parameters `--api.hostname` and `--api.location`, sitespeed.io will call the API. The rest of your parameters (and config file) are forwarded to the server, which then forwards them to the test runners. This makes it easy to first test everything locally and then add the extra parameters to send it to the server.

It also makes it easy to migrate the tests you run today to the new setup by adding a few parameters. Why would you want migrate? You don't need to but it will add the meta data to the database and that will add another way for you to find the actual tests. 

## Quality made simple

Ok, maybe it's not very nice to be frank, but I'm quite tired of the commercial web performance testing products that show regressions in their graphs, and when they show an example of a regression, the unit in the graph is seconds. You probably want the axis to be in milliseconds or at least in 0.1-second intervals :) Why do they do that? One reason is that they often run their tests on shared virtual machines that interfere with each other, making it hard to see performance regressions accurately.

If you run sitespeed.io and deploy your testrunner on a bare metal server, you've come a long way (you can for example use [Hetzner](https://www.hetzner.com) and there are also other providers you can use). Or if you choose to host it yourself, you connect some Android phones to your testrunner. This makes it easy for you to measure accurately under controlled conditions.

But won't it be much more maintenance if you manage everything yourself? There are setups where you can minimize the work you need to do, please join the [sitespeed.io Slack channel](https://join.slack.com/t/sitespeedio/shared_invite/zt-296jzr7qs-d6DId2KpEnMPJSQ8_R~WFw) and we can discuss it there. And on the other hand, if you can choose between unstable measurements or taking care of the setup yourself, what do you choose?

## Configuring sitespeed.io

Another thing I like is that sitespeed.io configuration can extend and override each other. It works so that you can set up a default configuration on the server (default on how you want to run sitespeed.io).It is then merged with what comes in through the GUI or API, and you can also have specific configurations on the test runner. 

Ok, it may sound a bit complicated, but it makes the whole system very powerful. You can have specific configurations for certain test runners (e.g., send data to your time series database), some generic configurations on the server and then override it per test you set.


## Your own style, form, and language

Yes, I know many like to be able to style the appearance of the pages, and you can! You can brand the pages to match your own company/organisation. You can override the CSS and change logos by modifying the configuration. 

You can also change the language from English to your preferred language (you need to translate the texts yourself, though).

## Tested using GitHub actions
One extra thing that I am proud of is that I have set up [some GitHub Actions](https://github.com/sitespeedio/onlinetest/tree/main/.github/workflows) that test the entire flow both through the API and GUI and run tests so that it will be easier to make fixes in the future without breaking anything. In sitespeed.io and Browsertime, we rely heavily on our actions, and it works here too!

## License

This time, I used the AGPL-3.0 license. That means you can use, modify, and share the code, as long as you keep any changes under the same license and contribute those changes back to the community. I love open source, so feel free to contribute and make this project even better!

I'm excited to see how you use this new frontend for your performance testing. Your feedback is invaluable, so please don't hesitate to [share your thoughts](https://join.slack.com/t/sitespeedio/shared_invite/zt-296jzr7qs-d6DId2KpEnMPJSQ8_R~WFw), [report issues](https://github.com/sitespeedio/onlinetest/issues/new), or contribute improvements.

Happy testing, and I look forward to seeing what we can achieve together!

Peter
