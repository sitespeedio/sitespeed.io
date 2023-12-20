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


[Website](https://www.sitespeed.io/) | [Documentation](https://www.sitespeed.io/documentation/sitespeed.io/) | [Changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) | [Mastodon](https://fosstodon.org/@sitespeedio)

- [Welcome to the Wonderful World of Web Performance](#welcome-to-the-wonderful-world-of-web-performance)
  - [What is sitespeed.io?](#what-is-sitespeedio)
  - [Why Choose sitespeed.io?](#why-choose-sitespeedio)
  - [Dive Into Our Documentation](#dive-into-our-documentation)
- [Introduction](#introduction)
- [Installation](#installation)
  - [Docker](#docker)
  - [NodeJS](#nodejs)
- [Usage](#usage)
  - [Examples](#examples)
- [Contributing](#contributing)
- [Reporting Issues](#reporting-issues)
- [Community and Support](#community-and-support)
- [License](#license)

# Welcome to the wonderful world of web performance! {#welcome-to-the-wonderful-world-of-web-performance}

Welcome to `sitespeed.io`, the comprehensive web performance tool designed for everyone passionate about web speed. Whether you're a developer, a site owner, or just someone curious about website performance, `sitespeed.io` offers a powerful yet user-friendly way to analyze and optimize your website.

## What is sitespeed.io?

`sitespeed.io` is more than just a tool; it's a complete solution for measuring, monitoring, and improving your website's performance. Built with simplicity and efficiency in mind, it enables you to:

- **Test Websites Using Real Browsers**: Simulate real user interactions and conditions to get accurate performance data.
- **Speed Optimization Feedback**: Get detailed insights into your website's construction and discover opportunities for enhancing speed.
- **Track Performance Over Time**: Monitor changes and trends in your website's performance to stay ahead of potential issues.

## Why Choose sitespeed.io?

- **Open Source and Community-Driven**: Built and maintained by a community, ensuring continuous improvement and innovation.
- **Versatile and Extensible**: Whether you're running a simple blog or a complex e-commerce site, `sitespeed.io` adapts to your needs.
- **Seamless Integration**: Easily incorporate `sitespeed.io` into your development workflow, continuous integration systems, and monitoring setups.

## Dive Into Our Documentation

We've put countless hours into our [documentation](https://www.sitespeed.io/documentation/sitespeed.io/) to help you get the most out of `sitespeed.io`. From installation guides to advanced usage scenarios, our documentation is a treasure trove of information and tips.


# Introduction

Sitespeed.io is a complete web performance tool that helps you measure the performance of your website. It is designed to:

1. Test websites using real browsers, simulating real user connectivity.
2. Analyze your page’s construction and provide feedback for speed optimization.
3. Collect and maintain data on page construction for easy tracking of changes.

Use cases on when to use sitespeed.io.
**Web performance audit**: Run performance tests from your terminal.
**Continuous Integration**: Detect web performance regressions early in the development cycle.
**Production Monitoring**: Monitor performance in production and get alerted on regressions.


# Installation

## Docker

 ```bash
 docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/
 ```

## NodeJS

 ```bash
 npm i -g sitespeed.io
 sitespeed.io https://www.example.com
 ```

Using NodeJS requires additional software like FFmpeg and Python dependencies if you want all functionality. You can read how to install that [here](https://www.sitespeed.io/documentation/sitespeed.io/installation/).


# Usage

sitespeed.io is designed to be straightforward to use, regardless of your experience level. Here's a quick guide on how to get started.

 ```bash
sitespeed.io https://www.example.com --browser chrome -n 5
 ```

That will test *https://www.example.com* using Chrome with 5 iterations.


You can checkout all configuration options [here](https://www.sitespeed.io/documentation/sitespeed.io/configuration/) or run `sitespeed.io --help` to see all the options.


## Examples

sitespeed.io generates HTML reports. 

Here's an example of a summary report in HTML:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/start-readme.jpg">

And an individual page report:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/start-url-readme.jpg">

sitespeed.io makes it easy to monitor your websites performance over time. We have an example setup up and running at [dashboard.sitespeed.io](https://dashboard.sitespeed.io/) using sitespeed.io, Graphite and Grafana.

Collected metrics from a URL in Graphite/Grafana:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/grafana-readme.jpg">

And look at trends in Grafana:
<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/grafana-trends-readme.jpg">

Video - easiest using Docker. This gif is optimized, the quality is much better IRL:

<img src="https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/barack.gif">s

# Contributing

We welcome contributions from the community! Whether you're fixing a bug, adding a feature, or improving documentation, your help is valuable. Here’s how you can contribute:

1. **Create an Issue**: Create an issue and discuss with us how to implement the issue.
2. **Fork and Clone**: Fork the repository and clone it locally.
3. **Create a Branch**: Create a new branch for your feature or bug fix.
4. **Develop**: Make your changes. Ensure you adhere to the coding standards and write tests if applicable.
5. **Test**: Run tests to ensure everything works as expected.
6. **Submit a Pull Request**: Push your changes to your fork and submit a pull request to the main repository.

Before contributing, please read our [CONTRIBUTING.md](.gitub/CONTRIBUTING.md) for more detailed information on how to contribute.

# Reporting Issues
Found a bug or have a feature request? Please use the [GitHub Issues](https://github.com/sitespeedio/sitespeed.io/issues) to report them. Be sure to check existing issues to avoid duplicates.

# Community and Support

Join our community! Whether you need help, want to share your experience, or discuss potential improvements, there are several ways to get involved:

- **Slack**: Connect with fellow users and the development team on [Slack](https://join.slack.com/t/sitespeedio/shared_invite/zt-296jzr7qs-d6DId2KpEnMPJSQ8_R~WFw).
- **GitHub Issues**: For technical questions, feature requests, and bug reports, use our [GitHub issues](https://github.com/sitespeedio/sitespeed.io/issues).
- **RSS/Changelog**: Latest releases and information can always be found in our [RSS feed](https://github.com/sitespeedio/sitespeed.io/releases.atom) and in our [changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md).
- **Mastodon**: Follow us on Mastodon [https://fosstodon.org/@sitespeedio](https://fosstodon.org/@sitespeedio).

We're excited to have you in our community and look forward to your contributions and interactions!

# License
[The MIT License (MIT)](LICENSE).

[stars-image]: https://img.shields.io/github/stars/sitespeedio/sitespeed.io.svg?style=flat-square
[downloads-image]: https://img.shields.io/npm/dt/sitespeed.io.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/sitespeed.io
[docker-image]: https://img.shields.io/docker/pulls/sitespeedio/sitespeed.io.svg
[docker-url]: https://hub.docker.com/r/sitespeedio/sitespeed.io/
[changelog-image]: https://img.shields.io/badge/changelog-%23212-lightgrey.svg?style=flat-square
[changelog-url]: https://changelog.com/212
[npm-image]: https://img.shields.io/npm/v/sitespeed.io.svg
[npm-url]: https://npmjs.org/package/sitespeed.io
