---
layout: default
title: Use Mann Whitney U or Wilcox statistical methods to know if you have a regression.
description: Finding performance regressions is hard. Using Mann Whitney U/Wilcox can help you.
keywords: Mann Whitney U, performance, regression,
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Use Mann Whitney U or Wilcox statistical methods to know if you have a regression.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Compare

# Compare - Statistical Methods for Regression Analysis
{:.no_toc}

{:toc}

Sitespeed.io utilizes Mann Whitney U and Wilcoxon tests for detecting performance regressions.

## Why Mann Whitney U and Wilcoxon for Web Performance?

* **Non-Parametric Nature**: Both tests are non-parametric, making them ideal for web performance data, which often doesn't follow a normal distribution. This means they can reliably analyze data with outliers or skewed distributions, common in web performance metrics.
* **Sensitive to Subtle Changes**: The Mann Whitney U test, used for comparing two independent samples, and the Wilcoxon test, suitable for paired data, are sensitive to even minor shifts in performance. This sensitivity is critical for early detection of regressions that might not significantly impact average values but could affect user experience.
* **Robust Against Variability**: Web performance metrics can be highly variable due to factors like network conditions, user behavior, and server load. These tests effectively handle this variability, providing a more accurate reflection of the true performance impact of changes.
* **Clarity in Comparative Analysis**: Unlike simple average-based comparisons, these tests give a clearer picture of whether the observed performance differences are statistically significant. This clarity is essential for making informed decisions about optimizations and rollbacks.
* **Actionable Insights**: By identifying statistically significant performance regressions, these tests provide actionable insights. They help in pinpointing specific changes that need attention, enabling targeted optimizations.

Utilizing these tests through the compare plugin allows for a sophisticated approach to web performance analysis. For instance, after deploying a new feature or update, you can compare the new performance data against a baseline using these tests. If the tests indicate a significant performance drop, it's a strong signal that the recent changes have negatively impacted the site's speed.

Looking at medians can make it hard to see small changes. This is an example where we look at first visual change for the Barack Obama page. You can see that the metric goes up at one point but then sometimes it comes back.
![Median graph]({{site.baseurl}}/img/median.png){:loading="lazy"}
{: .img-thumbnail}


Looking for a significant change helps. This is the graph for the same metric when the change occurred.
![Significant graphs]({{site.baseurl}}/img/significant.png){:loading="lazy"}
{: .img-thumbnail}

## Prerequisites
To get the compare plugin to work, you need to have Python installed and the [scipy](https://scipy.org) library in Python. The easiest way to install that is with pip: `python3 -m pip install scipy`.  If you use our Docker containers this is already installed. sitespeed.io runs `python3` (`python` on Windows). If your Python has another name or path, set it with the `PYTHON` environment variable, for example `PYTHON=/usr/local/bin/python3.12 sitespeed.io ...`.

## Save the baseline (save the world)
By default, tests run against a baseline test and look for regressions in the new test. That means that for your test to work you need to collect a baseline. You do that by adding `--compare.saveBaseline` to your test. You also need to give your test a unique id, which you do by adding `--compare.id myId`. Adding those to your test will store the baseline on disk. By default that file is stored in your current directory. You can change that by adding `--compare.baselinePath` to set the path. That is useful in Docker if you want the file to be stored outside the container.

To save a baseline using NodeJS:

~~~bash
sitespeed.io https://www.sitespeed.io -n 21 --compare.saveBaseline --compare.id start_page
~~~

Using Docker, there's a new volume that you should mount where you want to save the baseline. `-v "$(pwd)":/baseline` will map your current directory to where you will store the baseline files. If you want to store them somewhere else, change what you map inside the container: `-v "/somewhere/else:/baseline"`.

~~~bash
docker run -v "$(pwd)":/baseline  sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}  https://www.sitespeed.io/ -n 21 --compare.saveBaseline --compare.id start_page --compare.baselinePath /baseline
~~~

The baseline file is a JSON file that contains all the raw data from Browsertime. 

## Run your test

For your test to work, assign the same identification (id) to both your current test and the baseline test. This matching id is crucial for the test to correctly locate and compare with the baseline. Additionally, ensure that the number of iterations in your test matches that of the baseline. Remember, using a sufficiently large number of iterations is essential as it leads to more accurate and reliable results.

~~~bash
sitespeed.io https://www.sitespeed.io -n 21 --compare.id start_page
~~~

In Docker:
~~~bash
docker run -v "$(pwd)":/baseline  sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}  https://www.sitespeed.io/ -n 21 --compare.id start_page --compare.baselinePath /baseline
~~~

You can also save a baseline for each and every test, so you always compare your last run with the run before. That will happen automatically if you have `--compare.saveBaseline`.

~~~bash
docker run -v "$(pwd)":/baseline  sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %}  https://www.sitespeed.io/ -n 21 --compare.id start_page --compare.baselinePath /baseline --compare.saveBaseline
~~~

## Compare two saved tests
You can also compare two tests that you already ran, without running a new test. Save both tests with `--compare.saveBaseline` (give them different ids) and then compare the two files with `sitespeed.io-compare`:

~~~bash
sitespeed.io-compare start_page_before-1.json start_page_after-1.json --outputFolder compare-result
~~~

The first file is the baseline and the second file is the current test. This is useful when you want to compare two builds or two versions of your page that you tested at different times, or compare the same tests again with other statistical settings. You can use the same `--compare.*` options as in a test, for example `--compare.alternative two-sided`.

The command writes two files in the output folder (*compare-result* by default):
* *index.html* — the same compare page as the Compare tab in the HTML result. It has everything in one file, so you can open it from disk or send it to someone.
* *compare.json* — the metrics and the statistics, if you want to use the result in a script.

The command needs Python 3 with scipy, the same as the compare plugin. Set `PYTHON` if your Python 3 has another name. In Docker, Python and scipy are already installed:

~~~bash
docker run --rm -v "$(pwd)":/sitespeed.io --entrypoint node sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} /usr/src/app/bin/compare.js start_page_before-1.json start_page_after-1.json
~~~

## Results

When you run your test it will create a new tab in the HTML results. The tab opens with the test setup on one line, a verdict ("2 of 24 metrics are significantly slower compared to the baseline") with chips that jump to the flagged metrics, and then one row per compared metric, grouped by area (timings, visual metrics, Google Web Vitals, CPU and so on).

![Compare rows]({{site.baseurl}}/img/compare-rows.jpg){:loading="lazy"}
{: .img-thumbnail}

Each row shows:
1. **Metric name and p-value**: the metric that was tested and the score from the Mann-Whitney U/Wilcoxon test. A score below 0.05 means the difference is statistically significant. Every metric keeps its own row; when a metric happens to carry exactly the same measured values as an earlier one in the group (the before-FCP and before-LCP pairs do whenever FCP and LCP are the same paint), it is tagged *same values as X* so the matching numbers don't read as a rendering mistake.
2. **The distribution strip**: every baseline run (orange) and every current run (blue) as dots on a shared value axis, with a taller tick marking each median. Baseline and current are independent samples, so the strip shows the two distributions directly: a real shift is visible as the two clusters separating. When many runs land on the same value they render as one dot carrying a count, so twenty runs at 303 ms no longer look like a single run. Hover a dot for the exact run value.
3. **Median → median**: the baseline and current medians with the difference in absolute numbers and percent. When the medians show the same value but the runs differ (flaky CPU long tasks do this), the means are shown instead. Under it the estimated shift with a 95% confidence interval, for example "shift +7 (+4 to +9 ms)": the [Hodges-Lehmann estimate](https://en.wikipedia.org/wiki/Hodges%E2%80%93Lehmann_estimator), the median of all pairwise baseline versus current differences. The p-value tells you how consistent a change is, the shift interval tells you how big it is and how sure we are. A change is real and meaningful when the whole interval sits away from zero; an interval straddling zero is noise no matter what a single delta number suggests.
4. **The verdict**: whether the change is statistically significant, with the effect size ([Cliff's Delta](https://en.wikipedia.org/wiki/Effect_size#Effect_size_for_ordinal_data): negligible, small, medium or large) on its own line under the chip. Significant rows are tinted by direction, regressions in red and improvements in green. A row that tests significant while both medians show the same value (a CLS that moves from 0 to 0.0005 in a few more runs, say) is marked amber instead: statistically detectable but too small to matter, and the headline verdict counts it separately. With a one-sided test an improvement can never be significant, so a large effect in the untested direction is called out as "likely faster". Metrics that count things instead of measuring time (render-blocking elements, long tasks, layout shift) read higher or lower instead of slower or faster. Every row is also checked with a two-sample [Kolmogorov-Smirnov test](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test), which compares the whole distributions: when the rank test sees no change but K-S does, the row is marked amber and the wording follows the data. "Spread changed" means the median held while the runs spread differently, "less steady" means the median moved but the runs also vary more and "runs changed" covers the rest, often an intermittent slow path. At 20-ish iterations it catches clear variance growth and bimodality, not subtle shape drift.

The screenshots and video of the baseline and current runs live in the collapsed *Run setup* section above the verdict.

You don't need a statistics background to read the tab: the setup strip carries a collapsed *about the statistics* fold naming the algorithms (the rank test, Hodges-Lehmann, Cliff's delta and Kolmogorov-Smirnov) and what each contributes, the verdict card carries a collapsed *How to read the numbers* primer explaining p, shift, effect and the spread verdicts in plain language, and the p-value and effect lines on every row explain themselves on hover.

### Understanding Significant Changes

Every metric row carries its score (the p-value).

If a score is below 0.05 it indicates a statistically significant difference between the baseline and the current data. By default we test if the current data is greater than the baseline. You can change that using `--compare.alternative`. You can test if it's smaller or if there is any difference between the two ('two-sided').

If the score is below 0.05, it means that the changes observed in the metric are likely not due to chance.

### What does 'No Test Conducted' Mean?

If you see a result marked as no test conducted, it means the analysis couldn’t be done. This usually happens when the data samples are too similar or don't show enough variation to conduct a meaningful analysis.

## Alert on data in Graphite
The actual score is automatically sent to Graphite for each metric, which makes it possible to create alert rules in Grafana to alert on regressions.

The [Grafana in our Docker Compose setup]({{site.baseurl}}/documentation/sitespeed.io/performance-dashboard/#using-docker-compose) has an alert rule for that: *Page got slower* (in *Alerting* > *Alert rules*, folder *sitespeed.io*). Grafana checks it every 5 minutes. When the last comparison of a page in the last 2 hours has metrics that got significantly slower, the rule fires once for each page. The label `name` tells you the page (path, test name, domain, page, browser and connectivity) and the value is the number of metrics that got slower. The rule is in [docker/grafana/provisioning/alerting/regressions.yaml](https://github.com/sitespeedio/sitespeed.io/blob/main/docker/grafana/provisioning/alerting/regressions.yaml). If you use another namespace than `sitespeed_io` (`--graphite.namespace`), change the query there.

The *Welcome* dashboard (the start page of Grafana) uses the same query. *Pages that got slower* lists every page where the last comparison in the last 24 hours found metrics that got slower, and a click on a page opens its *Regressions* tab. *Alerts* shows the rules that fire now. With another namespace, change the query in that panel too.

To get a message when the rule fires, add a [contact point](https://grafana.com/docs/grafana/latest/alerting/configure-notifications/manage-contact-points/) in Grafana (for example Slack or email) and use it in the default notification policy.

For each metric, sitespeed.io sends the p-value as `compare.metrics.<group>.<metric>.statisticalTestU` and the effect as `compare.metrics.<group>.<metric>.isSignificant`. When the change is significant (the p-value is below 0.05), *isSignificant* is the effect size (Cliff's delta, from -1 to 1): above 0 the metric is higher than the baseline, so it got slower, and below 0 it got faster. When the change is not significant, it is 0. The *Regressions* tab of our [Page metrics dashboard]({{site.baseurl}}/documentation/sitespeed.io/performance-dashboard/#page-metrics) shows them.


If you use `--copyLatestFilesToBase`, the information about the latest test that you see in Grafana also tells you the date of the baseline that the test was compared with. The JSON file next to the latest screenshot gets a `compare.baseline` field with that date.

## Find regressions over time
The compare plugin compares the runs of one test with the runs of a baseline. That works when you have many runs (20 or more) and a stable setup, for example [WebPageReplay]({{site.baseurl}}/documentation/sitespeed.io/webpagereplay/). When you test a live site with a few runs, the runs of one test share the same network, server load and version of the page. Then the normal changes from one day to the next look like regressions, and every fourth test or so has a metric that is "significantly slower".

The trend plugin uses another method for that case. After each test it saves the median of each metric for the page. Then it compares the medians of the last 4 tests with the medians of the 28 tests before, with the Mann-Whitney U test. A metric is slower when the test is clear (the p-value is below 0.01) and the change is big enough to matter: at least `--trend.minChangePercent` (default 10%) and at least `--trend.minChangeValue` (default 100, milliseconds for timings). One slow test does not move the median of 4 tests, so the plugin finds changes that last, not single slow tests.

The plugin starts to compare when it has 32 tests of a page. If you test 4 times a day, that is after 8 days. The history is one file for each page in `--trend.path`. Without that option the plugin uses `--compare.baselinePath`, so the history is next to your baselines, and without both it uses the current folder.

You must keep that folder between tests. If you run in Docker, mount a folder from your machine and set `--trend.path` to it, like in the example below. Without a mounted folder, the history is in the container and is lost when the test ends, so the plugin never gets to 32 tests. If the log says `now 1` after every test, the history is lost between your tests.

```bash
docker run -v "$(pwd)":/trend sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ -n 5 --trend.enable --trend.path /trend
```

By default the plugin follows Largest Contentful Paint and First Contentful Paint. Choose other metrics with `--trend.metrics`, as the path in the statistics of the browsertime page summary, for example `--trend.metrics googleWebVitals.largestContentfulPaint --trend.metrics visualMetrics.SpeedIndex`. Lower values must be better. If a test does not have a metric, for example because the browser does not measure it, the log says so and the test does not count for that metric. On a live site, metrics like Total Blocking Time, Cumulative Layout Shift and TTFB change much from test to test, so they give alerts that are not real.

For WebPageReplay tests, use a smaller minimum change, for example `--trend.minChangePercent 2 --trend.minChangeValue 10`. In a replay setup, 5 to 11 runs for each test are enough.

Like the compare plugin, the trend plugin needs Python with scipy. The Docker containers have it.

For each metric, the plugin sends `trend.metrics.<group>.<metric>.isSlower` (1 when the metric got slower, else 0) and `trend.metrics.<group>.<metric>.change` (the change of the median in percent) to Graphite.
