---
layout: default
title: Using AI coding agents
description: How to get AI coding agents to write current sitespeed.io and Browsertime scripts and command lines, and what to look for when you review their work.
keywords: ai, llm, coding agent, llms.txt, AGENTS.md, scripting, sitespeed.io, browsertime
nav: documentation
category: sitespeed.io
image: https://www.sitespeed.io/img/sitespeed-2.0-twitter.png
twitterdescription: Using AI coding agents with sitespeed.io and Browsertime.
---
[Documentation]({{site.baseurl}}/documentation/sitespeed.io/) / Using AI coding agents

# Using AI coding agents
{:.no_toc}

{:toc}

Ask a coding agent for a sitespeed.io script and you will often get something that looks right but is several major versions old: a CommonJS `module.exports`, a `clickAndWait`, an absolute XPath copied from DevTools and a `wait.byTime(5000)` in the middle.

The agent is not inventing this. It learned sitespeed.io and Browsertime from more than ten years of blog posts, Slack answers, GitHub issues and our own old documentation. Most of that text describes older versions, and it still outnumbers what describes the current one. For a model, "written about a lot" and "correct" are close to the same thing.

This page tells you how to point your agent at the current answer, and what to look for when you review what it writes.

## Point your agent at the current documentation

We publish a list of the current documentation at [https://www.sitespeed.io/llms.txt]({{site.baseurl}}/llms.txt). It follows the [llms.txt](https://llmstxt.org/) format and leaves out the pages that only matter for old versions. Give the agent that URL, or add it to your project rules (see the next section).

The full list of command line options for the version you have installed is always in `--help`:

```bash
sitespeed.io --help
browsertime --help
```

## Add rules to your project

Most agents read an instruction file in the root of your repository: `AGENTS.md`, `CLAUDE.md` or something similar. If you keep your sitespeed.io scripts in a repository, add something like this:

```markdown
## sitespeed.io and Browsertime

- The current documentation is listed at https://www.sitespeed.io/llms.txt.
  If a command, option or pattern is not in those pages or in
  `sitespeed.io --help`, it does not exist, even if it looks familiar.
- Scripts are ES modules: `export default async function (context, commands)`.
- Use the `commands` API. Use `context.selenium.driver` only when no command
  does what you need, and say why in a comment.
- Use the selector syntax `commands.click('id:login')`, not the old
  `commands.click.byId()` methods or the deprecated `AndWait` methods.
- Never add `commands.wait.byTime()` or raise a `--timeouts.*` value to make a
  failing script pass. Find the condition that was not true yet and wait for it
  with `commands.wait()`, `commands.wait.byCondition()` or `commands.waitForUrl()`.
- Never change a performance budget limit or `--iterations` to make a test pass.
```

The most useful rule is the first one. It tells the agent that looking familiar is not enough.

## What agents often get wrong

These are the patterns we see most often. The left column is usually from an old version, the right column is what to use today.

| What the agent writes | What to use today |
|---|---|
| `module.exports = async function (context, commands) {}` | `export default async function (context, commands) {}` |
| `module.exports = { setUp, tearDown, test }` | `export async function setUp()`, `export async function test()` and `export async function tearDown()`. The CommonJS form still works but is legacy. |
| `commands.click.byLinkTextAndWait('Login')` and the other `AndWait` methods | `commands.click('link:Login', { waitForNavigation: true })` |
| `commands.click.byXpath('/html/body/div[3]/div/a')` | `commands.click('id:login')` or a short CSS selector. The old `by*` methods still work, but the [selector syntax]({{site.baseurl}}/documentation/sitespeed.io/scripting/interact-with-the-page/) is the current way. Avoid absolute XPaths, they break when the page changes. |
| `commands.wait.byTime(5000)` | `commands.wait('#result', { visible: true })`, `commands.wait.byCondition('...')` or `commands.waitForUrl('/done')`. See [Waiting recipes]({{site.baseurl}}/documentation/sitespeed.io/scripting/waiting/). |
| `context.selenium.driver.findElement(By.css('#x')).click()` | `commands.click('#x')`. Keep the Selenium driver for what the commands don't cover, like alerts and window handles. |
| `await commands.navigate(url)` and then expecting metrics for that page | `await commands.measure.start(url)`. A navigation outside of `measure.start` and `measure.stop` is not measured. See [Measure]({{site.baseurl}}/documentation/sitespeed.io/scripting/measurement-commands/). |
| `sitespeed.io --multi journey.mjs` | `sitespeed.io journey.mjs`. Script files are detected automatically. |
| A build step (`tsc`, `ts-node`) for TypeScript scripts | Run the `.ts` file directly. Node.js 22.18 or later runs TypeScript scripts without a build step. |
| `--influxdb.host` with the default installation | InfluxDB support is the separate [plugin-influxdb](https://github.com/sitespeedio/plugin-influxdb). Add it with `--plugins.add @sitespeed.io/plugin-influxdb`. |
| `--html.summaryBoxes` | Removed. Use a [performance budget]({{site.baseurl}}/documentation/sitespeed.io/performance-budget/) for your own limits. |
| Node.js 18 or 20 | sitespeed.io and Browsertime need Node.js 22 or later. |

The [upgrade guide]({{site.baseurl}}/documentation/sitespeed.io/upgrade/) and the [changelog](https://github.com/sitespeedio/sitespeed.io/blob/main/CHANGELOG.md) have the full list of changes between versions.

## Let the agent run a test

An agent that can only write code has to guess what your page looks like. That is where invented selectors come from. If your agent can run commands, let it run one iteration against the real page and read the result before it writes the next step:

```bash
sitespeed.io journey.mjs -n 1
```

* The HTML report is in `sitespeed-result/<domain>/<date>/`. Errors from the script are reported there too.
* Add `--plugins.add analysisstorer` to also get the raw JSON for each page in the `data` folder of that page. Browsertime writes `browsertime.json` and `browsertime.har` by default.
* Use `context.log.info()` in the script to log what the script sees, see [Debugging scripts]({{site.baseurl}}/documentation/sitespeed.io/scripting/debugging-scripts/).
* If the agent runs where there is no screen, use the [Docker container]({{site.baseurl}}/documentation/sitespeed.io/docker/). `--headless` also works to look at a page, but you get no video or Visual Metrics, and in Chrome you cannot add cookies, request headers or basic auth.

## What to look for in review

Performance tests have their own ways to "pass" without being fixed. Look for these when an agent changes your tests:

* **A flaky script "fixed" with a wait.** The agent adds `commands.wait.byTime()` or raises `--timeouts.pageLoad` or `--timeouts.elementWait`. The test passes, but the race is still there, every run is slower, and it fails again on a slower day. Ask which condition was not true yet, and wait for that condition.
* **A failing budget "fixed" by raising the limit.** The budget did its job. Find the change that made the page slower before you change the limit.
* **Noisy metrics "fixed" with fewer runs.** Lowering `--iterations`, picking one run or comparing two single runs makes the numbers look calm but tells you less. Use more iterations and the [compare plugin]({{site.baseurl}}/documentation/sitespeed.io/compare/) to find out if a change is real.
* **Setup steps inside the measurement.** Logging in, accepting a cookie banner or adding items to a cart inside `measure.start` and `measure.stop` makes those steps part of your metrics. Do them before `measure.start`, or in a [pre script]({{site.baseurl}}/documentation/sitespeed.io/scripting/pre-and-post-scripts/).

## Help us improve this page

If your agent keeps getting something wrong that is not on this page, [open an issue or a pull request](https://github.com/sitespeedio/sitespeed.io). The documentation lives in the `docs/` folder of the sitespeed.io repository.
