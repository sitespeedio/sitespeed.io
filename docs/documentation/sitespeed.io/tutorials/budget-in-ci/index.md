---
layout: default
title: Tutorial - Stop your page from getting heavier in CI.
description: Why timing metrics are hard to test in CI, and how a budget for size, requests, Coach scores and accessibility fails your build when a page gets heavier.
keywords: tutorial, budget, performance budget, continuous integration, ci, github actions, sitespeed.io
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Stop your page from getting heavier in CI with a sitespeed.io budget.
---

[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / [Tutorials]({{site.baseurl}}/documentation/sitespeed.io/tutorials/) / Stop your page from getting heavier in CI

# Stop your page from getting heavier in CI
{:.no_toc}

{:toc}

In this tutorial you learn why it is hard to find a slower page in continuous integration (CI), and what you can test there instead. You write a budget for the size of the page, the number of requests, the Coach score and accessibility. Then you make the page heavier and see the budget fail. At the end you run the budget in GitHub Actions, so that a pull request that makes the page heavier fails.

**You need:**
* [Docker](https://www.docker.com/get-started/) installed and running.
* A terminal.
* About 15 minutes.

If you have not used sitespeed.io before, do [Test your first page and read the report](../first-test/) first.

## Why timing metrics are hard to test in CI

It is tempting to test First Contentful Paint or Largest Contentful Paint for each pull request and fail the build when they get slower. That rarely works:

* **The CI servers are not the same every time.** A runner in GitHub Actions (and most other CI services) is a virtual machine that shares the hardware with other jobs. How fast it is changes from job to job and from minute to minute.
* **The network changes.** A test of a page on the internet goes through networks that you do not control.
* **You compare with another day.** If you test main on Monday and the pull request on Tuesday, on another runner, you mostly compare the runners and not the change.
* **Few runs are not enough.** To see a small change, you need [many runs and statistics](../find-a-regression/). Even then, we saw a change reported in about one of four tests where nothing changed, when we tested live pages with few runs.

So a timing limit in CI either fails builds that are fine, or has so much margin that it does not find a real change.

Some metrics do not have this problem. The size of the page, the number of requests, the [Coach](/documentation/coach/) score and the accessibility errors only depend on what the page loads. They are the same on a fast and a slow runner. And most pages get slower because of something they load: more JavaScript, a large image, a new third party. A budget for those metrics finds them, and does not fail by chance.

## Step 1: Test the page and look at the numbers

Open a terminal, go to an empty folder and run:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ -n 3 --axe.enable
~~~

On Windows in PowerShell, use `${pwd}` without quotes instead of `"$(pwd)"`.

`--axe.enable` also tests the page for accessibility errors with [axe](/documentation/sitespeed.io/axe/).

The test loads the page three times. When we made this tutorial, First Contentful Paint was 195 ms, 551 ms and 154 ms in the three runs, on the same computer, seconds apart. Each run had 9 requests and about 60 KB. The last line of the log shows the same: each timing metric has a σ (the standard deviation) with a percentage, and First Contentful Paint had 59%.

Open the report (the last line of the log tells you where it is) and click **Open the page report**. Note the transfer size, the number of requests and the Coach scores. You need them for the budget.

## Step 2: Write a budget

Create a file named `budget.json` in the same folder:

~~~json
{
  "budget": {
    "transferSize": {
      "total": 71680,
      "javascript": 10240,
      "image": 51200
    },
    "requests": {
      "total": 12
    },
    "score": {
      "performance": 95
    },
    "axe": {
      "critical": 0
    }
  }
}
~~~

* `transferSize` is the size over the network, in bytes. The page was 59.8 KB, with 43.6 KB of images and 1.2 KB of JavaScript. The budget gives some margin: 70 KB in total, 50 KB of images and 10 KB of JavaScript. sitespeed.io counts 1 KB as 1024 bytes, so 70 KB is 71680.
* `requests` is the number of requests. The page had 9, the budget allows 12.
* `score` is the minimum [Coach](/documentation/coach/) score, from 0 to 100. The page had 100.
* `axe` is the maximum number of accessibility errors. `critical` are the worst ones. The page had none.

Use margins that suit you. A small margin finds more changes, but also fails when someone adds something on purpose. Then you change the budget in the same pull request, so the change is visible.

If your page loads third parties, you can also limit them with `"thirdParty": { "requests": 10, "transferSize": 300000 }`. A page without third parties has no value for them, and the budget does not test them. See [all metrics you can use](/documentation/sitespeed.io/performance-budget/#full-example).

## Step 3: Test with the budget

Run the test with the budget. Sizes, requests and scores are the same in every run, so one run is enough:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ -n 1 --axe.enable --budget.configPath budget.json
~~~

The log ends with:

~~~
INFO: Budget: 6 working, 0 failing tests and 0 errors
~~~

Run `echo $?` (in PowerShell `$LASTEXITCODE`) to see the exit code. It is `0`: the page is within the budget.

## Step 4: Make the page heavier

Now add a large image to the page, like someone who forgets to make an image smaller before they publish it. `--injectJs` runs JavaScript in the page. This script adds a 626 KB image from sitespeed.io:

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ -n 1 --axe.enable --budget.configPath budget.json --injectJs "document.addEventListener('DOMContentLoaded', () => { const img = document.createElement('img'); img.src = '/img/grafana-page-summary.png'; document.body.append(img); });"
~~~

This time the log tells you what failed:

~~~
INFO: Failing budget Total Transfer Size for https://www.sitespeed.io/ with value 686.5 KB max limit 70.0 KB
INFO: Failing budget Image Transfer Size for https://www.sitespeed.io/ with value 670.3 KB max limit 50.0 KB
INFO: Failing budget AXE Critical Violations for https://www.sitespeed.io/ with value 1 max limit 0
INFO: Budget: 3 working, 3 failing tests and 0 errors
~~~

The exit code is `1`. In CI, that fails the build. Open the report and click **Budget** to see all checks:

![The budget page with three failing checks]({{site.baseurl}}/img/tutorial-budget-failing.jpg){:loading="lazy"}
{: .img-thumbnail}

Two budgets found the image: the size and the accessibility errors, because the image has no text for screen readers (an `alt` attribute). But look at the Coach performance score: it only went from 100 to 99. The Coach finds many kinds of problems, but one large image moves the score very little. Use the score to find new kinds of problems, and the sizes to find a page that gets heavier.

Now test with a script that keeps the browser busy for 300 ms, like in [Find out if a change made your page slower](../find-a-regression/):

~~~bash
docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.sitespeed.io/ -n 1 --axe.enable --budget.configPath budget.json --injectJs "const end = Date.now() + 300; while (Date.now() < end) {}"
~~~

The budget passes: `Budget: 6 working, 0 failing tests and 0 errors`. The page is slower, but it does not load more. That is the limit of a budget for sizes and scores: it does not find slower JavaScript, a slower server or slower rendering.

## Step 5: Run it in GitHub Actions

Put `budget.json` in the `.github` folder of your repository, and add a workflow in `.github/workflows/sitespeed.yml`:

~~~yaml
name: Budget
on: pull_request
jobs:
  budget:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test the page with the budget
        run: docker run --rm -v "$(pwd):/sitespeed.io" sitespeedio/sitespeed.io:{% include version/sitespeed.io.txt %} https://www.example.org/ -n 1 --axe.enable --budget.configPath .github/budget.json --budget.output junit --outputFolder sitespeed-result
      - name: Save the report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: sitespeed-result
          path: sitespeed-result/
~~~

Replace `https://www.example.org/` with the page that the pull request changes, for example a preview of it, or a version that you start in an earlier step of the job. When the page is over the budget, the job fails. The report, with `budget.html` and a JUnit file (`junit.xml`), is saved with the job, so you can see what failed. See [Continuous Integration](/documentation/sitespeed.io/continuous-integration/) for Jenkins, GitLab and other CI services.

When there is a new version of sitespeed.io, change the version number in the workflow.

## What to do about timing metrics

A budget for sizes and scores is the most you get out of CI without a lot of work. To follow the timing metrics, test somewhere where the tests are stable:

* Test your pages on a dedicated server, every 30 minutes, and follow them in Grafana. See [Monitor your pages with Grafana](../monitor-with-grafana/).
* Use the [trend plugin](/documentation/sitespeed.io/compare/#find-regressions-over-time) to find pages that got slower over days.
* For one change at a time, compare many runs before and after the change on the same computer. See [Find out if a change made your page slower](../find-a-regression/).

## Summary

You have:
* Learned why timing metrics are hard to test in CI, and why sizes, requests, Coach scores and accessibility errors are not.
* Written a budget and tested the page with it.
* Made the page heavier and seen the budget fail with exit code 1.
* Seen that a budget does not find a page that is slower but not heavier.
* Set up the budget in GitHub Actions.

## Learn more

* [Performance budget](/documentation/sitespeed.io/performance-budget/): all metrics, budgets for each page or group of pages, and the JUnit, TAP and JSON output.
* [Continuous Integration](/documentation/sitespeed.io/continuous-integration/): GitHub Actions, Jenkins, GitLab and more.
* [The Coach](/documentation/coach/): what the Coach checks.
* [Axe](/documentation/sitespeed.io/axe/): test for accessibility errors.
