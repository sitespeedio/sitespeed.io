# sitespeed.io

[![Unit tests](https://github.com/sitespeedio/sitespeed.io/actions/workflows/unittests.yml/badge.svg)](https://github.com/sitespeedio/sitespeed.io/actions/workflows/unittests.yml)
[![Linux browsers](https://github.com/sitespeedio/sitespeed.io/actions/workflows/linux.yml/badge.svg)](https://github.com/sitespeedio/sitespeed.io/actions/workflows/linux.yml)
[![Docker](https://github.com/sitespeedio/sitespeed.io/actions/workflows/docker.yml/badge.svg)](https://github.com/sitespeedio/sitespeed.io/actions/workflows/docker.yml)
[![Docker security scan](https://github.com/sitespeedio/sitespeed.io/actions/workflows/docker-scan.yml/badge.svg)](https://github.com/sitespeedio/sitespeed.io/actions/workflows/docker-scan.yml)
[![Windows Edge](https://github.com/sitespeedio/sitespeed.io/actions/workflows/windows.yml/badge.svg)](https://github.com/sitespeedio/sitespeed.io/actions/workflows/windows.yml)
[![OSX Safari](https://github.com/sitespeedio/sitespeed.io/actions/workflows/safari.yml/badge.svg)](https://github.com/sitespeedio/sitespeed.io/actions/workflows/safari.yml)
[![Test upload functionality](https://github.com/sitespeedio/sitespeed.io/actions/workflows/upload.yml/badge.svg)](https://github.com/sitespeedio/sitespeed.io/actions/workflows/upload.yml)
[![Downloads][downloads-image]][downloads-url]
[![Docker][docker-image]][docker-url]
[![Stars][stars-image]][stars-url]
[![npm][npm-image]][npm-url]
[![Changelog #212][changelog-image]][changelog-url]


[Website](https://www.sitespeed.io/) | [Documentation](https://www.sitespeed.io/documentation/sitespeed.io/) | [Changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) | [Bluesky](https://bsky.app/profile/sitespeed.io) | [Mastodon](https://fosstodon.org/@sitespeedio)



# Table of Contents

- [What is sitespeed.io?](#what-is-sitespeedio)
- [Documentation](#documentation)
- [Installation](#installation)
  - [Docker](#docker)
  - [NodeJS](#nodejs)
- [Usage](#usage)
  - [Basic usage](#basic-usage)
  - [Advanced configuration](#advanced-configuration)
  - [Mobile testing](#mobile-testing)
- [Examples](#examples)
- [Contributing](#contributing)
- [Reporting issues](#reporting-issues)
- [Community](#community)
- [License](#license)



# What is sitespeed.io?

sitespeed.io is an Open Source web performance tool. Run it once to debug a slow page and you get an HTML report with Core Web Vitals, a video of the page loading, the HAR waterfall and the Coach's advice on how to fix what's slow. Run it every 10 minutes against your site, ship the metrics to Graphite or InfluxDB, and you have a Grafana dashboard tracking your site's performance over time.

It's been around since 2014, it's free, you own all your data, and there's nothing to sign up for.

sitespeed.io drives a real browser — Firefox, Chrome, Edge, or Safari (including Safari on a real iPhone over USB) — to load your page, then collects:

- **Core Web Vitals** — LCP, INP, CLS, TTFB and FCP, scored against Google's p75 thresholds.
- **A video and visual metrics** — First Visual Change, Speed Index, Last Visual Change, plus a scrubable filmstrip.
- **The HAR waterfall** — rendered with [waterfall-tools](https://github.com/pmeenan/waterfall-tools).
- **The Coach's advice** — a checklist of best-practice rules with severity, scores and concrete fixes.
- **CPU and long-task analysis** — what the main thread was doing during the load.

Three common ways to use it:

- **Audit a page from your terminal.** Run `sitespeed.io https://example.com`, open the HTML report, see what's slow.
- **CI regression testing.** Run on every PR, fail the build if a budget is exceeded.
- **Production monitoring.** Run on a schedule, ship metrics to Graphite or InfluxDB, watch your site over time in Grafana.


# Documentation

The full guide lives at [sitespeed.io/documentation](https://www.sitespeed.io/documentation/sitespeed.io/) — installation, configuration, scripting, monitoring, and a walkthrough of every metric we collect.


# Installation

## Docker

Easiest way to run sitespeed.io — the Docker image ships with Firefox, Chrome, Edge and the dependencies you need:

```bash
docker run --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io https://www.sitespeed.io/
```

The `-v` flag mounts the current directory so the test results land somewhere you can find them.

## NodeJS

If you'd rather install via npm:

```bash
npm i -g sitespeed.io
```

Then test a URL:

```bash
sitespeed.io https://www.example.com
```

You'll need a browser installed locally (Firefox / Chrome / Edge / Safari), plus FFmpeg and Python if you want video and visual metrics. See the [installation guide](https://www.sitespeed.io/documentation/sitespeed.io/installation/) for the full list.


# Usage

## Basic usage

Pass a URL and sitespeed.io will load it. Add `-n 5` to run five iterations and report the median (recommended for any real measurement — single runs are noisy):

```bash
sitespeed.io https://www.example.com --browser chrome -n 5
```

## Advanced configuration

Lots of flags. `--help` shows them all:

```bash
sitespeed.io --help
```

See the [configuration documentation](https://www.sitespeed.io/documentation/sitespeed.io/configuration/) for the long form.

## Mobile testing

Real Android phones over USB:

```bash
sitespeed.io https://www.example.com --android
```

Real iPhones over USB (new in 40.0):

```bash
sitespeed.io https://www.example.com -b safari --safari.ios
```

Setup guides: [Android](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#test-on-android), [iOS](https://www.sitespeed.io/documentation/sitespeed.io/mobile-phones/#test-on-ios).


# Examples

### Summary report

![Summary Report](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/start-readme.jpg)

### Per-URL report

![Individual Page Report](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/start-url-readme.jpg)

### Continuous monitoring in Grafana

Live setup at [dashboard.sitespeed.io](https://dashboard.sitespeed.io/) — sitespeed.io feeding Graphite, visualised with Grafana.

![Graphite/Grafana Metrics](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/grafana-readme.jpg)

Trends over time:

![Grafana Trends](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/grafana-trends-readme.jpg)

### Video

Video of the page loading, captured with `--video --visualMetrics`:

![Video Analysis](https://raw.githubusercontent.com/sitespeedio/sitespeed.io/main/docs/img/barack.gif)


# Contributing

We'd love your help — code, docs, design, bug reports, or just letting us know what's missing. Open an issue first if you want to discuss, then fork, branch and submit a PR. The full guide is in [CONTRIBUTING.md](.github/CONTRIBUTING.md).


# Reporting issues

Bugs and feature requests go on [GitHub Issues](https://github.com/sitespeedio/sitespeed.io/issues). Search first to avoid duplicates.


# Community

- **Slack** — [join our workspace](https://join.slack.com/t/sitespeedio/shared_invite/zt-296jzr7qs-d6DId2KpEnMPJSQ8_R~WFw).
- **GitHub Issues** — [github.com/sitespeedio/sitespeed.io/issues](https://github.com/sitespeedio/sitespeed.io/issues) for bugs and feature requests.
- **RSS** — [release feed](https://github.com/sitespeedio/sitespeed.io/releases.atom) for new versions.


# License
[The MIT License (MIT)](LICENSE).

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
