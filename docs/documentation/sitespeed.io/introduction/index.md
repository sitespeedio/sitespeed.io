---
layout: default
title: Introduction to sitespeed.io and web performance testing
description: Start here if you are new to sitespeed.io or web performance testing.
keywords: introduction, getting started, documentation, web performance, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Introduction for sitespeed.io.
---
[Documentation](/documentation/sitespeed.io/) / Introduction

# Introduction
{:.no_toc}

* Let's place the TOC here
{:toc}

Sitespeed.io is a complete web performance tool that helps you measure the performance of your website. It is designed to:

1. Test websites using real browsers, simulating real user connectivity.
2. Analyze your page's construction and provide feedback for speed optimization.
3. Collect and maintain data on page construction for easy tracking of changes.

**Use Cases**
- **Continuous Integration**: Detect web performance regressions early in the development cycle.
- **Production Monitoring**: Monitor performance in production and get alerted on regressions.
- **Web performance audit**: Run performance tests from your terminal.

**How it Works**
- Built on open source tools like Browsertime and The Coach.
- Uses a plugin-based architecture for flexibility.
- High-level process: Initialization → URL Testing → Metrics Collection → Summary and Rendering.

**Example Workflow**
1. Initialize sitespeed.io and its plugins.
2. Test a URL: Open in browser → Record video → Analyze page → Collect metrics.
3. Collect and summarize metrics using plugins like HTML/Graphite/InfluxDB.
4. Generate and store HTML reports.